import {
  dayDatasQuery,
  factoryQuery,
  factoryTimeTravelQuery,
  tokenQuery,
  tokenTimeTravelQuery,
  tokensQuery,
  tokensTimeTravelQuery,
} from "../queries/exchange";
import {
  getOneDayBlock,
  getSevenDayBlock,
  getTwoDayBlock,
} from "../api/blocks";

import { SWIPE_TOKEN } from "app/core/constants";
import { getApollo } from "../apollo";

export async function getFactory(client = getApollo()) {
  const {
    data: { factory },
  } = await client.query({
    query: factoryQuery,
  });

  const {
    data: { factory: oneDay },
  } = await client.query({
    query: factoryTimeTravelQuery,
    variables: {
      block: await getOneDayBlock(),
    },
  });

  const {
    data: { factory: twoDay },
  } = await client.query({
    query: factoryTimeTravelQuery,
    variables: {
      block: await getTwoDayBlock(),
    },
  });

  return {
    factory: {
      ...factory,
      oneDay,
      twoDay,
    },
  };
}

export async function getSwipeToken(client = getApollo()) {
  return await getToken(SWIPE_TOKEN.toLowerCase(), client);
}

export async function getDayData(client = getApollo()) {
  const { data } = await client.query({
    query: dayDatasQuery,
  });
  return data;
}

// Tokens

export async function getToken(id, client = getApollo()) {
  const {
    data: { token },
  } = await client.query({
    query: tokenQuery,
    variables: { id },
  });

  const oneDayBlock = await getOneDayBlock();
  const twoDayBlock = await getTwoDayBlock();

  const {
    data: { token: oneDayToken },
  } = await client.query({
    query: tokenTimeTravelQuery,
    variables: {
      id,
      block: oneDayBlock,
    },
    fetchPolicy: "no-cache",
  });

  const {
    data: { token: twoDayToken },
  } = await client.query({
    query: tokenTimeTravelQuery,
    variables: {
      id,
      block: twoDayBlock,
    },
    fetchPolicy: "no-cache",
  });

  return {
    token: {
      ...token,
      oneDay: {
        volumeUSD: String(oneDayToken?.volumeUSD),
        derivedETH: String(oneDayToken?.derivedETH),
        liquidity: String(oneDayToken?.liquidity),
        txCount: String(oneDayToken?.txCount),
      },
      twoDay: {
        volumeUSD: String(twoDayToken?.volumeUSD),
        derivedETH: String(twoDayToken?.derivedETH),
        liquidity: String(twoDayToken?.liquidity),
        txCount: String(twoDayToken?.txCount),
      },
    },
  };
}

export async function getTokens(client = getApollo()) {
  const {
    data: { tokens },
  } = await client.query({
    query: tokensQuery,
  });

  const block = await getOneDayBlock();

  const {
    data: { tokens: oneDayTokens },
  } = await client.query({
    query: tokensTimeTravelQuery,
    variables: {
      block,
    },
    fetchPolicy: "no-cache",
  });

  const {
    data: { tokens: sevenDayTokens },
  } = await client.query({
    query: tokensTimeTravelQuery,
    variables: {
      block: await getSevenDayBlock(),
    },
    fetchPolicy: "no-cache",
  });

  return {
    tokens: tokens.map((token) => {
      const oneDayToken = oneDayTokens.find(({ id }) => token.id === id);
      const sevenDayToken = sevenDayTokens.find(({ id }) => token.id === id);
      return {
        ...token,
        oneDay: {
          volumeUSD: String(oneDayToken?.volumeUSD),
          derivedETH: String(oneDayToken?.derivedETH),
          liquidity: String(oneDayToken?.liquidity),
        },
        sevenDay: {
          volumeUSD: String(sevenDayToken?.volumeUSD),
          derivedETH: String(sevenDayToken?.derivedETH),
          liquidity: String(sevenDayToken?.liquidity),
        },
      };
    }),
  };
}
