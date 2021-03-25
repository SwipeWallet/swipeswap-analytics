import {
  AppShell,
  AreaChart,
  BarChart,
  BasicTable,
  KPI,
  Link,
  PageHeader,
  PairTable,
  Percent,
  TokenIcon,
  Transactions,
} from "app/components";
import { Box, Grid, Paper, Typography } from "@material-ui/core";
import {
  currencyFormatter,
  getApollo,
  getEthPrice,
  getOneDayEthPrice,
  getToken,
  getTokenPairs,
  getTokenDayDatas,
  getTransactions,
  useProps,
} from "app/core";

import Head from "next/head";
import { ParentSize } from "@visx/responsive";
import { makeStyles } from "@material-ui/core/styles";
import { useRouter } from "next/router";

const useStyles = makeStyles((theme) => ({
  title: {
    display: "flex",
    flexDirection: "column",
    // marginBottom: theme.spacing(1),
    [theme.breakpoints.up("sm")]: {
      flexDirection: "row",
      justifyContent: "flex-start",
      marginBottom: 0,
      "& > div:first-of-type": {
        marginRight: theme.spacing(1),
      },
    },
  },
  links: {
    "& > a:first-of-type": {
      marginRight: theme.spacing(4),
    },
  },
  avatar: {
    marginRight: theme.spacing(2),
  },
  paper: {
    padding: theme.spacing(2),
  },
  price: {
    margin: theme.spacing(2, 0),
    [theme.breakpoints.up("sm")]: {
      margin: 0,
    },
  },
}));

function TokenPage(props) {
  const router = useRouter();
  const id = router.query.id.toLowerCase();
  const [{
    bundles,
    oneDayEthPriceData,
    tokenDayDatas,
    token,
    pairs,
    transactions,
  }] = useProps(props, (props) => fetchProps(props, id));

  if (router.isFallback) {
    return <AppShell />;
  }

  const classes = useStyles();

  const chartDatas = tokenDayDatas.reduce(
    (previousValue, currentValue) => {
      previousValue["liquidity"].unshift({
        date: currentValue.date,
        value: parseFloat(currentValue.liquidityUSD),
      });
      previousValue["volume"].unshift({
        date: currentValue.date,
        value: parseFloat(currentValue.volumeUSD),
      });
      return previousValue;
    },
    { liquidity: [], volume: [] }
  );

  const totalLiquidityUSD =
    parseFloat(token?.liquidity) *
    parseFloat(token?.derivedETH) *
    parseFloat(bundles[0].ethPrice);

  const totalLiquidityUSDYesterday =
    parseFloat(token.oneDay?.liquidity) *
    parseFloat(token.oneDay?.derivedETH) *
    parseFloat(oneDayEthPriceData?.ethPrice);

  const price = parseFloat(token?.derivedETH) * parseFloat(bundles[0].ethPrice);

  const priceYesterday =
    parseFloat(token.oneDay?.derivedETH) *
    parseFloat(oneDayEthPriceData?.ethPrice);

  const priceChange = ((price - priceYesterday) / priceYesterday) * 100;

  const volume = token?.volumeUSD - token?.oneDay?.volumeUSD;
  const volumeYesterday = token?.oneDay?.volumeUSD - token?.twoDay?.volumeUSD;

  const fees = volume * 0.003;
  const feesYesterday = volumeYesterday * 0.003;

  return (
    <AppShell>
      <Head>
        <title>
          {currencyFormatter.format(price || 0)} | {token.symbol} | SwipeSwap
          Analytics
        </title>
      </Head>
      <PageHeader>
        <Grid
          container
          direction="row"
          justify="space-between"
          alignItems="center"
        >
          <Grid item xs={12} sm="auto" className={classes.title}>
            <Box display="flex" alignItems="center">
              <TokenIcon id={token.id} />
              <Typography variant="h5" component="h1" noWrap>
                {token.name} ({token.symbol}){" "}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" className={classes.price}>
              <Typography variant="h6" component="div">
                {currencyFormatter.format(price || 0)}
              </Typography>
              <Percent percent={priceChange} ml={1} />
            </Box>
          </Grid>
          <Grid item xs={12} sm="auto" className={classes.links}>
            <Link
              href={`https://swap.swipe.org/add-liquidity?inputCurrency=${token.id}`}
              target="_blank"
              variant="body1"
            >
              Add Liquidity
            </Link>
            <Link
              href={`https://swap.swipe.org/swap?inputCurrency=${token.id}`}
              target="_blank"
              variant="body1"
            >
              Trade
            </Link>
          </Grid>
        </Grid>
      </PageHeader>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={12} md={6}>
          <Paper
            variant="outlined"
            style={{ height: 300, position: "relative" }}
          >
            <ParentSize>
              {({ width, height }) => (
                <AreaChart
                  title="Liquidity"
                  data={chartDatas.liquidity}
                  width={width}
                  height={height}
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
            variant="outlined"
            style={{ height: 300, position: "relative" }}
          >
            <ParentSize>
              {({ width, height }) => (
                <BarChart
                  title="Volume"
                  data={chartDatas.volume}
                  width={width}
                  height={height}
                  margin={{ top: 125, right: 0, bottom: 0, left: 0 }}
                  tooltipDisabled
                  overlayEnabled
                />
              )}
            </ParentSize>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <KPI
            title="Liquidity (24h)"
            value={currencyFormatter.format(totalLiquidityUSD || 0)}
            difference={
              ((totalLiquidityUSD - totalLiquidityUSDYesterday) /
                totalLiquidityUSDYesterday) *
              100
            }
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <KPI
            title="Volume (24h)"
            value={currencyFormatter.format(volume || 0)}
            difference={((volume - volumeYesterday) / volumeYesterday) * 100}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <KPI
            title="Fees (24h)"
            value={currencyFormatter.format(fees)}
            difference={((fees - feesYesterday) / feesYesterday) * 100}
          />
        </Grid>
      </Grid>

      <Box my={4}>
        <BasicTable
          title="Information"
          headCells={[
            { key: "name", label: "Name" },
            { key: "symbol", label: "Symbol" },
            { key: "address", label: "Address" },
            { key: "etherscan", label: "Etherscan", align: "right" },
          ]}
          bodyCells={[
            token.name,
            token.symbol,
            token.id,
            <Link href={`https://etherscan.io/address/${token.id}`}>View</Link>,
          ]}
        />
      </Box>

      <PairTable title="Pairs" pairs={pairs} />

      <Transactions transactions={transactions} txCount={token.txCount} />
    </AppShell>
  );
}

async function fetchProps(callback, id) {
  const client = getApollo();

  const { bundles } = await getEthPrice(client);
  const oneDayEthPriceData = await getOneDayEthPrice(client);
  const { token } = await getToken(id, client);
  const tokenDayDatas = await getTokenDayDatas(id, client);
  const { pairs0, pairs1 } = await getTokenPairs(id, client);
  const pairs = [...pairs0, ...pairs1];
  const pairAddresses = pairs.map((pair) => pair.id).sort();
  const transactions = await getTransactions(pairAddresses, client);

  const props = {
    bundles,
    oneDayEthPriceData,
    tokenDayDatas,
    token,
    pairs,
    transactions,
  }

  if (callback) callback(props);
  else return props;
}

TokenPage.getInitialProps = async function (ctx) {
  const id = ctx.query ? ctx.query.id : ctx.req.url.replace('/tokens/', '');
  const props = await fetchProps(null, id);
  return props;
}

export default TokenPage;
