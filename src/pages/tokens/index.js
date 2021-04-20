import { AppShell, TokenTable } from "app/components";
import {
  getApollo,
  getEthPrice,
  getOneDayEthPrice,
  getSevenDayEthPrice,
  getTokens,
  useProps,
} from "app/core";

import Head from "next/head";
import React from "react";

function TokensPage(props) {
  const [{
    bundles,
    oneDayEthPriceData,
    sevenDayEthPriceData,
    tokens,
  }] = useProps(props, fetchProps);

  return (
    <AppShell>
      <Head>
        <title>Tokens | {process.env.NEXT_PUBLIC_APP_NAME}</title>
      </Head>
      <TokenTable title="Tokens" {...{ tokens, bundles, oneDayEthPriceData, sevenDayEthPriceData }} />
    </AppShell>
  );
}

async function fetchProps(callback) {
  const client = getApollo();

  const { bundles } = await getEthPrice(client);
  const oneDayEthPriceData = await getOneDayEthPrice(client);
  const sevenDayEthPriceData = await getSevenDayEthPrice(client);
  const { tokens } = await getTokens(client);

  const props = {
    bundles,
    oneDayEthPriceData,
    sevenDayEthPriceData,
    tokens,
  }

  if (callback) callback(props);
  else return props;
}

TokensPage.getInitialProps = async function() {
  const props = await fetchProps();
  return props;
}

export default TokensPage;
