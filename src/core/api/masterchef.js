import { getAverageBlockTime, getEthPrice, getToken } from "../api";
import {
  liquidityPositionSubsetQuery,
  pairQuery,
  pairSubsetQuery,
} from "../queries/exchange";
import {
  poolHistoryQuery,
  poolIdsQuery,
  poolQuery,
  poolUserQuery,
  poolsQuery,
} from "../queries/masterchef";

import { POOL_DENY, SWIPE_TOKEN } from "app/core/constants";
import { getApollo } from "../apollo";

export async function getPoolIds(client = getApollo()) {
  const {
    data: { pools },
  } = await client.query({
    query: poolIdsQuery,
    context: {
      clientName: "masterchef",
    },
  });
  return {
    pools: pools.filter(
      (pool) => !POOL_DENY.includes(pool.id) && pool.allocPoint !== "0"
    ),
  };
}

export async function getPoolUser(id, client = getApollo()) {
  const { data } = await client.query({
    query: poolUserQuery,
    fetchPolicy: "network-only",
    variables: {
      address: id,
    },
    context: {
      clientName: "masterchef",
    },
  });

  return data;
}

export async function getPoolHistories(id, client = getApollo()) {
  const {
    data: { poolHistories },
  } = await client.query({
    query: poolHistoryQuery,
    fetchPolicy: "network-only",
    variables: { id },
    context: {
      clientName: "masterchef",
    },
  });

  return {
    poolHistories,
  };
}

export async function getPool(id, client = getApollo()) {
  const {
    data: { pool },
  } = await client.query({
    query: poolQuery,
    fetchPolicy: "network-only",
    variables: { id },
    context: {
      clientName: "masterchef",
    },
  });

  const {
    data: { pair: liquidityPair },
  } = await client.query({
    query: pairQuery,
    variables: { id: pool.pair },
    fetchPolicy: "network-only",
  });

  return {
    pool: {
      ...pool,
      liquidityPair,
    },
  };
}

export async function getPools(client = getApollo()) {
  if (process.env.NEXT_PUBLIC_APP_NETWORK === "binance") { // Todo
    return { pools: [] };
  }

  const {
    data: { pools },
  } = await client.query({
    query: poolsQuery,
    context: {
      clientName: "masterchef",
    },
  });

  const pairAddresses = pools
    .map((pool) => {
      return pool.pair;
    })
    .sort();

  const {
    data: { pairs },
  } = await client.query({
    query: pairSubsetQuery,
    variables: { pairAddresses },
    fetchPolicy: "network-only",
  });

  // const averageBlockTime = (await getAverageBlockTime()) / 100;

  const averageBlockTime = await getAverageBlockTime();
  // const averageBlockTime = 13;

  const { bundles } = await getEthPrice();

  const ethPrice = bundles[0].ethPrice;

  const { token } = await getToken(
    SWIPE_TOKEN.toLowerCase()
  );

  const swipePrice = ethPrice * token.derivedETH;

  // MASTERCHEF
  const {
    data: { liquidityPositions },
  } = await client.query({
    query: liquidityPositionSubsetQuery,
    variables: { user: "0x252dd6a11ef272a438a36d1a2370eed820099547" }, // Todo
  });

  return {
    pools: pools
      .filter(
        (pool) =>
          !POOL_DENY.includes(pool.id) &&
          pool.allocPoint !== "0" &&
          pool.accSwipePerShare !== "0" &&
          pairs.find((pair) => pair?.id === pool.pair)
      )
      .map((pool) => {
        const pair = pairs.find((pair) => pair.id === pool.pair);

        const liquidityPosition = liquidityPositions.find(
          (liquidityPosition) => liquidityPosition.pair.id === pair.id
        );

        const balance = Number(pool.balance / 1e18);

        const blocksPerHour = 3600 / averageBlockTime;
        // const rewardPerBlock =
        //   100 - 100 * (pool.allocPoint / pool.owner.totalAllocPoint);

        // const roiPerBlock =
        //   (Number(token.derivedETH) *
        //     rewardPerBlock *
        //     3 *
        //     (Number(pool.allocPoint) / Number(pool.owner.totalAllocPoint))) /
        //   (Number(pair.reserveETH) * (balance / Number(pair.totalSupply)));

        const balanceUSD =
          (balance / Number(pair.totalSupply)) * Number(pair.reserveUSD);

        const rewardPerBlock =
          ((pool.allocPoint / pool.owner.totalAllocPoint) *
            pool.owner.swipePerBlock) /
          1e18;

        const roiPerBlock = (rewardPerBlock * 2 * swipePrice) / balanceUSD;

        const roiPerHour = roiPerBlock * blocksPerHour;

        const roiPerDay = roiPerHour * 24;

        const roiPerMonth = roiPerDay * 30;

        const roiPerYear = roiPerMonth * 12;

        return {
          ...pool,
          liquidityPair: pair,
          roiPerBlock,
          roiPerHour,
          roiPerDay,
          roiPerMonth,
          roiPerYear,
          rewardPerThousand: 1 * roiPerDay * (1000 / swipePrice),
          tvl:
            (pair.reserveUSD / pair.totalSupply) *
            (liquidityPosition?.liquidityTokenBalance || 0),
        };
      }),
  };
}
