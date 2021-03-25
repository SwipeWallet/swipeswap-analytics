import {
  AppShell,
  AreaChart,
  BarChart,
  PairTable,
  PoolTable,
  Search,
  TokenTable,
} from "app/components";
import { Box, Grid, Paper, Typography } from "@material-ui/core";
import React from "react";
import {
  getApollo,
  getDayData,
  getEthPrice,
  getOneDayEthPrice,
  getPairs,
  getPools,
  getSevenDayEthPrice,
  getTokens,
  useProps,
} from "app/core";

import Head from "next/head";
import { ParentSize } from "@visx/responsive";

function IndexPage(props) {
  const [{
    dayDatas,
    bundles,
    oneDayEthPriceData,
    sevenDayEthPriceData,
    tokens,
    pairs,
    pools
  }] = useProps(props, fetchProps);

  const [liquidity, volume] = dayDatas
    .filter((d) => d.liquidityUSD !== "0")
    .reduce(
      (previousValue, currentValue) => {
        previousValue[0].unshift({
          date: currentValue.date,
          value: parseFloat(currentValue.liquidityUSD),
        });
        previousValue[1].unshift({
          date: currentValue.date,
          value: parseFloat(currentValue.volumeUSD),
        });
        return previousValue;
      },
      [[], []]
    );

  return (
    <AppShell>
      <Head>
        <title>Dashboard | SwipeSwap Analytics</title>
      </Head>
      <Box mb={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={12} md={6}>
            <Typography variant="h4">SwipeSwap Analytics</Typography>
          </Grid>
          <Grid item xs={12} sm={12} md={6}>
            <Search pairs={pairs} tokens={tokens} />
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={12} md={6}>
          <Paper
            // variant="outlined"
            boxshadow={10}
            style={{ height: 300 }}
          >
            <ParentSize>
              {({ width, height }) => (
                <AreaChart
                  title="Liquidity"
                  width={width}
                  height={height}
                  data={liquidity}
                  margin={{ top: 125, right: 0, bottom: 0, left: 0 }}
                  tooltipDisabled
                  overlayEnabled
                />
              )}
            </ParentSize>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={12} md={6}>
          <Paper
            // variant="outlined"
            boxshadow={10}
            style={{ height: 300, position: "relative" }}
          >
            <ParentSize>
              {({ width, height }) => (
                <BarChart
                  title="Volume"
                  width={width}
                  height={height}
                  data={volume}
                  margin={{ top: 125, right: 0, bottom: 0, left: 0 }}
                  tooltipDisabled
                  overlayEnabled
                />
              )}
            </ParentSize>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <TokenTable title="Top Tokens" {...{ tokens, bundles, oneDayEthPriceData, sevenDayEthPriceData }} />
        </Grid>

        <Grid item xs={12}>
          <PairTable title="Top Pairs" pairs={pairs} />
        </Grid>

        <Grid item xs={12}>
          <PoolTable
            title="Top Pools"
            pools={pools}
            orderBy="rewardPerThousand"
            order="desc"
            rowsPerPage={25}
          />
        </Grid>
      </Grid>
    </AppShell>
  );
}

async function fetchProps(callback) {
  const client = getApollo();

  const { dayDatas } = await getDayData(client);
  const { bundles } = await getEthPrice(client);
  const oneDayEthPriceData = await getOneDayEthPrice(client);
  const sevenDayEthPriceData = await getSevenDayEthPrice(client);
  const { tokens } = await getTokens(client);
  const { pairs } = await getPairs(client);
  const { pools } = await getPools(client);

  const props = {
    dayDatas,
    bundles,
    oneDayEthPriceData,
    sevenDayEthPriceData,
    tokens,
    pairs,
    pools,
  }

  if (callback) callback(props);
  else return props;
}

IndexPage.getInitialProps = async function() {
  const props = await fetchProps();
  return props;
}

export default IndexPage;
