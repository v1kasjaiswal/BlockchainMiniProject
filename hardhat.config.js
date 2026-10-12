import { defineConfig } from 'hardhat/config';

/**
 * Hardhat v3 configuration for the CertificateVerification mini project.
 *
 * Available npm scripts:
 *   npm run compile   – compile the Solidity contract
 *   npm run node      – start a local Hardhat node (keep terminal open)
 *   npm run demo      – run the standalone CLI demo (requires node running)
 *   npm run dev       – start the React frontend
 */
export default defineConfig({
  solidity: {
    version: '0.8.24',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    localhost: {
      type: 'http',
      url: 'http://127.0.0.1:8545',
      chainId: 31337,
    },
  },
  paths: {
    sources:   './contracts',
    cache:     './cache',
    artifacts: './artifacts',
  },
});
