import { AppShell, PairTable, PoolTable } from "app/components";
import {
  getApollo,
  getPairs,
  getPools,
  pairsQuery,
  poolsQuery,
  useInterval,
} from "app/core";

import Head from "next/head";
import React from "react";
import { useQuery } from "@apollo/client";

function RecentPairsPage() {
  const {
    data: { pairs },
  } = useQuery(pairsQuery);

  useInterval(() => Promise.all([getPairs]), 60000);

  return (
    <AppShell>
      <Head>
        <title>Recently Added Pairs | {process.env.NEXT_PUBLIC_APP_NAME}</title>
      </Head>
      <PairTable pairs={pairs} orderBy="timestamp" order="desc" />
    </AppShell>
  );
}

export async function getServerSideProps() {
  const client = getApollo();
  await getPairs(client);
  return {
    props: {
      initialApolloState: client.cache.extract(),
    },
    // revalidate: 1,
  };
}

export default RecentPairsPage;
