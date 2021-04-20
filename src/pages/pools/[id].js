import {
  AppShell,
  Curves,
  KPI,
  Link,
  LiquidityProviderList,
  PageHeader,
  PairIcon,
} from "app/components";
import {
  Box,
  Grid,
  Paper,
  Typography,
  makeStyles,
  useTheme,
} from "@material-ui/core";
import {
  getApollo,
  getPool,
  getPoolHistories,
  useProps,
} from "app/core";

import Head from "next/head";
import { ParentSize } from "@visx/responsive";
import { useRouter } from "next/router";
import { BASE_TOKEN, WRAP_TOKEN } from "../../core/constants";

const useStyles = makeStyles((theme) => ({
  root: {},
}));

function PoolPage(props) {
  const router = useRouter();
  const id = router.query.id.toLowerCase();
  const [{
    pool,
    poolHistories,
  }] = useProps(props, (props) => fetchProps(props, id));

  if (router.isFallback) {
    return <AppShell />;
  }

  const theme = useTheme();
  const classes = useStyles(theme);

  const {
    slpAge,
    slpAgeRemoved,
    userCount,
    slpDeposited,
    slpWithdrawn,
    slpAgeAverage,
    slpBalance,
    tvl,
  } = poolHistories.reduce(
    (previousValue, currentValue) => {
      const date = currentValue.timestamp * 1000;

      previousValue.slpAge.push({
        date,
        value: currentValue.slpAge,
      });

      const slpAgeAverage =
        parseFloat(currentValue.slpAge) / parseFloat(currentValue.slpBalance);

      previousValue.slpAgeAverage.push({
        date,
        value: !Number.isNaN(slpAgeAverage) ? slpAgeAverage : 0,
      });

      previousValue.slpAgeRemoved.push({
        date,
        value: currentValue.slpAgeRemoved,
      });

      previousValue.slpBalance.push({
        date,
        value: parseFloat(currentValue.slpBalance),
      });

      previousValue.slpDeposited.push({
        date,
        value: parseFloat(currentValue.slpDeposited),
      });

      previousValue.slpWithdrawn.push({
        date,
        value: parseFloat(currentValue.slpWithdrawn),
      });

      previousValue.tvl.push({
        date,
        value:
          (parseFloat(pool.liquidityPair.reserveUSD) /
            parseFloat(pool.liquidityPair.totalSupply)) *
          parseFloat(currentValue.slpBalance),
      });

      previousValue.userCount.push({
        date,
        value: parseFloat(currentValue.userCount),
      });

      return previousValue;
    },
    {
      entries: [],
      exits: [],
      slpAge: [],
      slpAgeAverage: [],
      slpAgeRemoved: [],
      slpBalance: [],
      slpDeposited: [],
      slpWithdrawn: [],
      tvl: [],
      userCount: [],
    }
  );

  return (
    <AppShell>
      <Head>
        <title>Pool {id} | {process.env.NEXT_PUBLIC_APP_NAME}</title>
      </Head>

      <PageHeader mb={3}>
        <Grid
          container
          direction="row"
          justify="space-between"
          alignItems="center"
          // className={classes.top}
        >
          <Grid item xs={12} sm="auto" className={classes.title}>
            <Box display="flex" alignItems="center">
              <PairIcon
                base={pool.liquidityPair.token0.id}
                quote={pool.liquidityPair.token1.id}
              />
              <Typography variant="h5" component="h1">
                {pool.liquidityPair.token0.symbol}-
                {pool.liquidityPair.token1.symbol} POOL
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm="auto" className={classes.links}>
            <Link
              href={`https://swap.swipe.org/farm?slp=${
                pool.liquidityPair.token0.symbol
              }-${pool.liquidityPair.token1.symbol.replace(
                WRAP_TOKEN,
                BASE_TOKEN
              )}`}
              target="_blank"
              variant="body1"
            >
              Stake SLP
            </Link>
          </Grid>
        </Grid>

      </PageHeader>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <KPI
            title="~ SLP Age"
            value={`${(
              parseFloat(pool.slpAge) / parseFloat(pool.balance / 1e18)
            ).toFixed(2)} Days`}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <KPI title="Users" value={pool.userCount} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <KPI
            title="Staked"
            value={`${(pool.balance / 1e18).toFixed(4)} SLP`}
          />
        </Grid>

        <Grid item xs={12}>
          <Paper
            variant="outlined"
            style={{
              display: "flex",
              position: "relative",
              height: 400,
              flex: 1,
            }}
          >
            <ParentSize>
              {({ width, height }) => (
                <Curves
                  width={width}
                  height={height}
                  margin={{ top: 64, right: 32, bottom: 0, left: 64 }}
                  data={[slpAge, slpAgeRemoved]}
                  labels={["SLP Age", "SLP Age Removed"]}
                />
              )}
            </ParentSize>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper
            variant="outlined"
            style={{
              display: "flex",
              position: "relative",
              height: 400,
              flex: 1,
            }}
          >
            <ParentSize>
              {({ width, height }) => (
                <Curves
                  width={width}
                  height={height}
                  margin={{ top: 64, right: 32, bottom: 0, left: 64 }}
                  data={[slpDeposited, slpWithdrawn]}
                  labels={["SLP Deposited", "SLP Age Withdrawn"]}
                />
              )}
            </ParentSize>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper
            variant="outlined"
            style={{
              display: "flex",
              position: "relative",
              height: 400,
              flex: 1,
            }}
          >
            <ParentSize>
              {({ width, height }) => (
                <Curves
                  title="~ SLP Age (Days)"
                  width={width}
                  height={height}
                  margin={{ top: 64, right: 32, bottom: 0, left: 64 }}
                  data={[slpAgeAverage]}
                />
              )}
            </ParentSize>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper
            variant="outlined"
            style={{
              display: "flex",
              position: "relative",
              height: 400,
              flex: 1,
            }}
          >
            <ParentSize>
              {({ width, height }) => (
                <Curves
                  title="Users"
                  width={width}
                  height={height}
                  margin={{ top: 64, right: 32, bottom: 0, left: 64 }}
                  data={[userCount]}
                />
              )}
            </ParentSize>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper
            variant="outlined"
            style={{
              display: "flex",
              position: "relative",
              height: 400,
              flex: 1,
            }}
          >
            <ParentSize>
              {({ width, height }) => (
                <Curves
                  title="SLP Balance"
                  width={width}
                  height={height}
                  margin={{ top: 64, right: 32, bottom: 0, left: 64 }}
                  data={[slpBalance]}
                />
              )}
            </ParentSize>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper
            variant="outlined"
            style={{
              display: "flex",
              position: "relative",
              height: 400,
              flex: 1,
            }}
          >
            <ParentSize>
              {({ width, height }) => (
                <Curves
                  title="TVL (USD)"
                  width={width}
                  height={height}
                  margin={{ top: 64, right: 32, bottom: 0, left: 64 }}
                  data={[tvl]}
                />
              )}
            </ParentSize>
          </Paper>
        </Grid>
      </Grid>

      <LiquidityProviderList
        pool={pool}
        orderBy="amount"
        title="Top Liquidity Providers"
      />
    </AppShell>
  );
}

async function fetchProps(callback, id) {
  const client = getApollo();

  const { pool } = await getPool(id, client);
  const { poolHistories } = await getPoolHistories(id, client);

  const props = {
    pool,
    poolHistories,
  }

  if (callback) callback(props);
  else return props;
}

PoolPage.getInitialProps = async function (ctx) {
  const id = ctx.query ? ctx.query.id : ctx.req.url.replace('/pools/', '');
  const props = await fetchProps(null, id);
  return props;
}

export default PoolPage;
