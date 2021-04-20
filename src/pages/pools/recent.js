import { AppShell, PoolTable } from "app/components";
import { getApollo, getPools, useProps } from "app/core";

import Head from "next/head";
import React from "react";

function RecentPoolsPage(props) {
  const [{
    pools,
  }] = useProps(props, fetchProps);
  return (
    <AppShell>
      <Head>
        <title>Recently Added Pools | {process.env.NEXT_PUBLIC_APP_NAME}</title>
      </Head>
      <PoolTable
        title="Recently Added Pools"
        pools={pools}
        orderBy="timestamp"
        order="desc"
        rowsPerPage={5}
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

RecentPoolsPage.getInitialProps = async function () {
  const props = await fetchProps();
  return props;
}

export default RecentPoolsPage;
