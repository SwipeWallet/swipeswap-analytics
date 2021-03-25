import { AppShell, PoolTable } from "app/components";
import { getApollo, getPools, useProps } from "app/core";

import Head from "next/head";
import React from "react";

function PoolsPage(props) {
  const [{
    pools,
  }] = useProps(props, fetchProps);
  return (
    <AppShell>
      <Head>
        <title>Pools | SwipeSwap Analytics</title>
      </Head>
      <PoolTable
        pools={pools}
        orderBy="rewardPerThousand"
        order="desc"
        rowsPerPage={100}
      />
    </AppShell>
  );
}

async function fetchProps(callback) {
  const client = getApollo();

  const { pools } = await getPools(client);

  const props = {
    pools,
  }

  if (callback) callback(props);
  else return props;
}

PoolsPage.getInitialProps = async function () {
  const props = await fetchProps();
  return props;
}

export default PoolsPage;
