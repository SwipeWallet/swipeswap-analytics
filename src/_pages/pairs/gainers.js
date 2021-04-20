import { AppShell, GainersList } from "app/components";
import { gainersQuery, getApollo, getGainers, useInterval } from "app/core";

import { Container } from "@material-ui/core";
import Head from "next/head";
import React from "react";
import { useQuery } from "@apollo/client";

function GainersPage() {
  const { data } = useQuery(gainersQuery);
  useInterval(() => {
    getGainers();
  }, 60000);
  const pairs = data.pairs.filter((pair) => {
    return Math.sign(pair.reserveUSDGained) > 0;
  });
  return (
    <AppShell>
      <Head>
        <title>Top Gainers | {process.env.NEXT_PUBLIC_APP_NAME}</title>
      </Head>
      <GainersList pairs={pairs} />
    </AppShell>
  );
}

export async function getServerSideProps() {
  const client = getApollo();
  await getGainers(client);
  return {
    props: {
      initialApolloState: client.cache.extract(),
    },
    // revalidate: 1,
  };
}

export default GainersPage;
