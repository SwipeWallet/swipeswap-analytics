import {
  ethPriceQuery,
  ethPriceTimeTravelQuery,
  getApollo,
  getOneDayBlock,
  getSevenDayBlock,
  getTwoDayBlock,
  pairQuery,
  pairTimeTravelQuery,
  pairsQuery,
  pairsTimeTravelQuery,
  tokenPairsQuery,
  pairDayDatasQuery,
  tokenDayDatasQuery,
  transactionsQuery,
} from "app/core";

export * from "./bar";
export * from "./blocks";
export * from "./exchange";
export * from "./masterchef";
export * from "./pages";

export async function preload() {
  // Pre-load anything that might be needed globally (stuff for search bar etc...)
  await getTokens();
  await getPairs();
}

export async function getLiquidityPositionSnapshots(
  user,
  client = getApollo()
) {
  const {
    data: { liquidityPositionSnapshots },
  } = await client.query({
    query: liquidityPositionSnapshotsQuery,
    variables: {
      user,
    },
  });
}

// Eth Price
export async function getEthPrice(client = getApollo()) {
  const { data } = await client.query({
    query: ethPriceQuery,
  });

  return data;
}

export async function getOneDayEthPrice(client = getApollo()) {
  const block = await getOneDayBlock();

  const {
    data: { bundles },
  } = await client.query({
    query: ethPriceTimeTravelQuery,
    variables: {
      block,
    },
    fetchPolicy: "no-cache",
  });

  return bundles;
}

export async function getSevenDayEthPrice(client = getApollo()) {
  const block = await getSevenDayBlock();

  const {
    data: { bundles },
  } = await client.query({
    query: ethPriceTimeTravelQuery,
    variables: {
      block,
    },
    fetchPolicy: "no-cache",
  });

  return bundles;
}

// Pairs
export async function getPair(id, client = getApollo()) {
  const {
    data: { pair },
  } = await client.query({
    query: pairQuery,
    variables: {
      id,
    },
  });

  const oneDayBlock = await getOneDayBlock();

  const twoDayBlock = await getTwoDayBlock();

  const {
    data: { pair: oneDayPair },
  } = await client.query({
    query: pairTimeTravelQuery,
    variables: {
      block: oneDayBlock,
      id,
    },
    fetchPolicy: "no-cache",
  });

  const {
    data: { pair: twoDayPair },
  } = await client.query({
    query: pairTimeTravelQuery,
    variables: {
      block: twoDayBlock,
      id,
    },
    fetchPolicy: "no-cache",
  });

  return {
    pair: {
      ...pair,
      oneDay: {
        untrackedVolumeUSD: Number(oneDayPair?.untrackedVolumeUSD),
        volumeUSD: Number(oneDayPair?.volumeUSD),
        reserveUSD: Number(oneDayPair?.reserveUSD),
        txCount: Number(oneDayPair?.txCount),
      },
      twoDay: {
        untrackedVolumeUSD: Number(twoDayPair?.untrackedVolumeUSD),
        volumeUSD: Number(twoDayPair?.volumeUSD),
        reserveUSD: Number(twoDayPair?.reserveUSD),
        txCount: Number(twoDayPair?.txCount),
      },
    },
  };
}

export async function getPairs(client = getApollo()) {
  const {
    data: { pairs },
  } = await client.query({
    query: pairsQuery,
  });

  const pairAddresses = pairs.map((pair) => pair.id).sort();

  const oneDayBlock = await getOneDayBlock();

  const sevenDayBlock = await getSevenDayBlock();

  const {
    data: { pairs: oneDayPairs },
  } = await client.query({
    query: pairsTimeTravelQuery,
    variables: {
      block: oneDayBlock,
      pairAddresses,
    },
    fetchPolicy: "no-cache",
  });

  const {
    data: { pairs: sevenDayPairs },
  } = await client.query({
    query: pairsTimeTravelQuery,
    variables: {
      block: sevenDayBlock,
      pairAddresses,
    },
    fetchPolicy: "no-cache",
  });

  return {
    pairs: pairs.map((pair) => {
      const oneDayPair = oneDayPairs.find(({ id }) => pair.id === id);
      const sevenDayPair = sevenDayPairs.find(({ id }) => pair.id === id);
      return {
        ...pair,
        oneDay: {
          untrackedVolumeUSD: String(oneDayPair?.untrackedVolumeUSD),
          volumeUSD: String(oneDayPair?.volumeUSD),
          reserveUSD: String(oneDayPair?.reserveUSD),
          txCount: String(oneDayPair?.txCount),
        },
        sevenDay: {
          untrackedVolumeUSD: String(sevenDayPair?.untrackedVolumeUSD),
          volumeUSD: String(sevenDayPair?.volumeUSD),
          reserveUSD: String(sevenDayPair?.reserveUSD),
          txCount: String(oneDayPair?.txCount),
        },
      };
    }),
  };
}

export async function getTokenPairs(id, client = getApollo()) {
  const {
    data: { pairs0, pairs1 },
  } = await client.query({
    query: tokenPairsQuery,
    variables: { id },
  });

  const pairAddresses = [
    ...pairs0.map((pair) => pair.id),
    ...pairs1.map((pair) => pair.id),
  ].sort();

  const oneDayBlock = await getOneDayBlock();

  const sevenDayBlock = await getSevenDayBlock();

  const {
    data: { pairs: oneDayPairs },
  } = await client.query({
    query: pairsTimeTravelQuery,
    variables: {
      block: oneDayBlock,
      pairAddresses,
    },
    fetchPolicy: "no-cache",
  });

  const {
    data: { pairs: sevenDayPairs },
  } = await client.query({
    query: pairsTimeTravelQuery,
    variables: {
      block: sevenDayBlock,
      pairAddresses,
    },
    fetchPolicy: "no-cache",
  });

  return {
    pairs0: pairs0.map((pair) => {
      const oneDayPair = oneDayPairs.find(({ id }) => pair.id === id);
      const sevenDayPair = sevenDayPairs.find(({ id }) => pair.id === id);
      return {
        ...pair,
        oneDay: {
          volumeUSD: String(oneDayPair?.volumeUSD),
          reserveUSD: String(oneDayPair?.reserveUSD),
        },
        sevenDay: {
          volumeUSD: String(sevenDayPair?.volumeUSD),
          reserveUSD: String(sevenDayPair?.reserveUSD),
        },
      };
    }),
    pairs1: pairs1.map((pair) => {
      const oneDayPair = oneDayPairs.find(({ id }) => pair.id === id);
      const sevenDayPair = sevenDayPairs.find(({ id }) => pair.id === id);
      return {
        ...pair,
        oneDay: {
          volumeUSD: String(oneDayPair?.volumeUSD),
          reserveUSD: String(oneDayPair?.reserveUSD),
        },
        sevenDay: {
          volumeUSD: String(sevenDayPair?.volumeUSD),
          reserveUSD: String(sevenDayPair?.reserveUSD),
        },
      };
    }),
  };
}

export async function getPairDayDatas(id, client = getApollo()) {
  const { data: { pairDayDatas } } = await client.query({
    query: pairDayDatasQuery,
    variables: {
      pairs: [id],
    },
  });
  return pairDayDatas;
}

export async function getTokenDayDatas(id, client = getApollo()) {
  const { data: { tokenDayDatas } } = await client.query({
    query: tokenDayDatasQuery,
    variables: {
      tokens: [id],
    },
  });
  return tokenDayDatas;
}

export async function getTransactions(pairAddresses, client = getApollo()) {
  const { data } = await client.query({
    query: transactionsQuery,
    variables: {
      pairAddresses,
    },
  });
  return data;
}
