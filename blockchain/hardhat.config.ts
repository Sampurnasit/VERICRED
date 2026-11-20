import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const rawKey = process.env.RELAYER_PRIVATE_KEY?.trim();
const privateKey =
  rawKey &&
  rawKey !== "0x0000000000000000000000000000000000000000000000000000000000000000"
    ? rawKey.startsWith("0x")
      ? rawKey
      : `0x${rawKey}`
    : undefined;

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    amoy: {
      url: process.env.POLYGON_AMOY_RPC_URL || "https://rpc-amoy.polygon.technology/",
      chainId: 80002,
      accounts: privateKey ? [privateKey] : [],
    },
  },
};

export default config;
