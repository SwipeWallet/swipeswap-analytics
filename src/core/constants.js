// export const TOKEN_DENY = [
//   "0x495c7f3a713870f68f8b418b355c085dfdc412c3",
//   "0xc3761eb917cd790b30dad99f6cc5b4ff93c4f9ea",
//   "0xe31debd7abff90b06bca21010dd860d8701fd901",
//   "0xfc989fbb6b3024de5ca0144dc23c18a063942ac1",
// ];
export const TOKEN_DENY = [];

// export const PAIR_DENY = ["0xb6a741f37d6e455ebcc9f17e2c16d0586c3f57a5"];
export const PAIR_DENY = [];

export const EXCHANGE_CREATED_TIMESTAMP = 1599214239; // Todo

// export const POOL_DENY = ["14", "29", "45", "30"];
export const POOL_DENY = [];

export const SWIPE_TOKEN = process.env.NEXT_PUBLIC_APP_BASE;
export const NETWORK = process.env.NEXT_PUBLIC_APP_NETWORK;
export const TARGET_NETWORK = NETWORK === "ethereum" ? "Binance" : "Ethereum";
export const TARGET_LINK = NETWORK === "ethereum" ? "https://bscinfo.swipe.org" : "https://info.swipe.org";
export const NETWORK_SWITCH =
  NETWORK === "ethereum"
    ? "https://bscinfo.swipe.org"
    : "https://info.swipe.org";
export const BASE_TOKEN = process.env.NEXT_PUBLIC_APP_TOKEN;
export const BASE_SYMBOLS = [
  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
];
export function getAsset(address, network) {
  return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${
    network === "ethereum" ? "ethereum" : "smartchain"
  }/assets/${address}/logo.png`;
}
export const BASE_SYMBOL = NETWORK === "ethereum" ? "ETH" : "BNB";
export const WRAP_TOKEN = `W${BASE_SYMBOL}`;
export const SCAN_NAME = NETWORK === "ethereum" ? "Etherscan" : "BscScan";
export const SCAN_LINK =
  NETWORK === "ethereum" ? "https://etherscan.io" : "https://bscscan.com";
export const BASE_ASSET = NETWORK === "ethereum" ? "ethereum" : "smartchain";
