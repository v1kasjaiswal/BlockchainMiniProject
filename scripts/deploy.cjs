/**
 * Deploy Script for CertificateVerification contract
 * Usage: npm run deploy
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { ethers } = require('ethers');

const RPC_URL = 'http://127.0.0.1:8545';
const CHAIN_ID = 31337;
// Hardhat default Account #0 private key
const DEPLOYER_PK = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

const ARTIFACTS_PATH = path.join(
  __dirname,
  '..',
  'artifacts',
  'contracts',
  'CertificateVerification.sol',
  'CertificateVerification.json',
);

async function main() {
  // If compiled artifacts are missing, compile automatically
  if (!fs.existsSync(ARTIFACTS_PATH)) {
    console.log('[INFO] Contract artifact not found. Compiling contract...');
    execSync('node node_modules/hardhat/dist/src/cli.js compile', {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
    });
  }

  const { abi, bytecode } = JSON.parse(fs.readFileSync(ARTIFACTS_PATH, 'utf8'));
  const provider = new ethers.JsonRpcProvider(RPC_URL, CHAIN_ID, { staticNetwork: true });

  // Test RPC connection
  try {
    await provider.getBlockNumber();
  } catch {
    console.error('\n[ERROR] Cannot connect to local Hardhat node at ' + RPC_URL);
    console.error('Make sure the node is running in another terminal:');
    console.error('  npm run node\n');
    process.exit(1);
  }

  const deployer = new ethers.Wallet(DEPLOYER_PK, provider);

  console.log('\n--- DEPLOYING CERTIFICATE VERIFICATION CONTRACT ---');
  console.log('Deployer Address:', deployer.address);

  const factory = new ethers.ContractFactory(abi, bytecode, deployer);
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log('\n✓ Contract deployed successfully!');
  console.log('Contract Address:', contractAddress);

  // Write or update .env file with the deployed address
  const envPath = path.join(__dirname, '..', '.env');
  const envContent = `VITE_CONTRACT_ADDRESS=${contractAddress}\nVITE_LOCAL_RPC_URL=http://127.0.0.1:8545\n`;
  fs.writeFileSync(envPath, envContent, 'utf8');
  console.log('✓ Updated .env file with the contract address.\n');
}

main().catch((err) => {
  console.error('[ERROR]', err.message ?? err);
  process.exit(1);
});
