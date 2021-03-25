import { AppShell, PairTable } from "app/components";
import { getApollo, getPairs, useProps } from "app/core";

import Head from "next/head";
import React from "react";

function PairsPage(props) {
  const [{
    pairs,
  }] = useProps(props, fetchProps);
  return (
    <AppShell>
      <Head>
        <title>Pairs | SwipeSwap Analytics</title>
      </Head>
      <PairTable title="Pairs" pairs={pairs} />
    </AppShell>
  );
}

async function fetchProps(callback) {
  const client = getApollo();

  const { pairs } = await getPairs(client);

  const props = {
    pairs,
  }

  if (callback) callback(props);
  else return props;
}

PairsPage.getInitialProps = async function() {
  const props = await fetchProps();
  return props;
}

export default PairsPage;
