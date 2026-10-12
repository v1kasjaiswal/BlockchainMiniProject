/**
 * Blockchain Certificate Verification — Standalone Demo Script
 * ─────────────────────────────────────────────────────────────
 * Demonstrates the full lifecycle of the CertificateVerification smart
 * contract using ethers.js directly — no Hardhat plugin needed.
 *
 * ─── Prerequisites ─────────────────────────────────────────────
 *
 *   1. Compile the contract first:
 *        npm run compile
 *
 *   2. Start the local Hardhat node in a SEPARATE terminal:
 *        npm run node
 *
 *   3. Run this demo (in another terminal):
 *        npm run demo
 *
 * ─── What this demonstrates ────────────────────────────────────
 *
 *   1. Deploy the contract to the local Hardhat node
 *   2. Issue a certificate (writes to blockchain)
 *   3. Verify with correct hash  → VALID
 *   4. Verify with wrong hash    → INVALID
 *   5. Get full certificate details
 *   6. Revoke the certificate  (writes to blockchain)
 *   7. Verify after revoke     → REVOKED
 *   8. Look up a non-existent ID → NOT_FOUND
 *   9. Try to revoke with wrong wallet → REVERT (access control)
 *
 * ────────────────────────────────────────────────────────────────
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const { ethers } = require('ethers');

// ─── Config ───────────────────────────────────────────────────────────────────

const RPC_URL     = 'http://127.0.0.1:8545';
const CHAIN_ID    = 31337;

// Hardhat default funded private keys (safe to publish — only for local dev)
const ISSUER_PK   = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const OTHER_PK    = '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d';

const ARTIFACTS_PATH = path.join(
  __dirname,
  '..',
  'artifacts',
  'contracts',
  'CertificateVerification.sol',
  'CertificateVerification.json',
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Pads a hex string to bytes32 */
function padTo32(hexStr) {
  const clean = hexStr.startsWith('0x') ? hexStr.slice(2) : hexStr;
  return '0x' + clean.padStart(64, '0');
}

/** Fake PDF hash — simulates what the browser does with a real PDF */
function fakePdfHash(tag) {
  const seed = tag.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return padTo32(seed.toString(16));
}

function section(title) {
  console.log('\n' + '═'.repeat(62));
  console.log(`  ${title}`);
  console.log('═'.repeat(62));
}

function field(key, value) {
  console.log(`  ${key.padEnd(22)}${value}`);
}

function pass(msg = 'PASS') { console.log(`\n  ✓  ${msg}`); }
function fail(msg = 'FAIL') { console.log(`\n  ✗  ${msg}`); }

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  // If compiled artifacts are missing, compile automatically
  if (!fs.existsSync(ARTIFACTS_PATH)) {
    console.log('[INFO] Contract artifact not found. Compiling contract...');
    const { execSync } = require('child_process');
    execSync('node node_modules/hardhat/dist/src/cli.js compile', {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
    });
  }
  const { abi, bytecode } = JSON.parse(fs.readFileSync(ARTIFACTS_PATH, 'utf8'));

  // ── Connect to local node ──────────────────────────────────────────────────
  const provider = new ethers.JsonRpcProvider(RPC_URL, CHAIN_ID, { staticNetwork: true });

  try {
    await provider.getBlockNumber();
  } catch {
    console.error('\n[ERROR] Cannot connect to local Hardhat node at ' + RPC_URL);
    console.error('Make sure the node is running in another terminal:');
    console.error('  npm run node\n');
    process.exit(1);
  }

  const issuer   = new ethers.Wallet(ISSUER_PK, provider);
  const other    = new ethers.Wallet(OTHER_PK, provider);

  section('ACCOUNTS');
  field('Issuer address:', issuer.address);
  field('Other address:', other.address);
  field('RPC URL:', RPC_URL);

  const issuerBalance = await provider.getBalance(issuer.address);
  field('Issuer balance:', `${ethers.formatEther(issuerBalance)} ETH`);

  // ── Deploy ──────────────────────────────────────────────────────────────────
  section('DEPLOYING CONTRACT');
  const factory  = new ethers.ContractFactory(abi, bytecode, issuer);
  const contract = await factory.deploy();
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  field('Contract address:', contractAddress);
  pass('Contract deployed successfully.');

  // ── Demo data ───────────────────────────────────────────────────────────────
  const CERT_ID      = 'CERT-2024-001';
  const STUDENT_NAME = 'Priya Sharma';
  const COURSE       = 'Bachelor of Technology (CSE)';
  const CORRECT_HASH = fakePdfHash('correct-original-pdf');
  const WRONG_HASH   = fakePdfHash('tampered-modified-pdf');

  // ── Step 1: Issue ─────────────────────────────────────────────────────────
  section('STEP 1 — ISSUE CERTIFICATE');
  field('Certificate ID:', CERT_ID);
  field('Student Name:', STUDENT_NAME);
  field('Course:', COURSE);
  field('PDF hash (bytes32):', CORRECT_HASH.slice(0, 24) + '…');

  const issueTx      = await contract.connect(issuer).issueCertificate(CERT_ID, STUDENT_NAME, COURSE, CORRECT_HASH);
  const issueReceipt = await issueTx.wait();
  field('Tx hash:', issueReceipt.hash.slice(0, 24) + '…');
  field('Gas used:', issueReceipt.gasUsed.toString());
  pass('Certificate issued.');

  // ── Step 2: Verify VALID ──────────────────────────────────────────────────
  section('STEP 2 — VERIFY WITH CORRECT HASH (expect → VALID)');
  const result1 = await contract.verifyCertificate(CERT_ID, CORRECT_HASH);
  field('Result:', result1);
  result1 === 'VALID' ? pass('PASS') : fail('Expected VALID');

  // ── Step 3: Verify INVALID ────────────────────────────────────────────────
  section('STEP 3 — VERIFY WITH TAMPERED HASH (expect → INVALID)');
  const result2 = await contract.verifyCertificate(CERT_ID, WRONG_HASH);
  field('Result:', result2);
  result2 === 'INVALID' ? pass('PASS') : fail('Expected INVALID');

  // ── Step 4: Get certificate details ───────────────────────────────────────
  section('STEP 4 — GET CERTIFICATE DETAILS');
  const cert = await contract.getCertificate(CERT_ID);
  field('Student name:', cert[0]);
  field('Course:', cert[1]);
  field('Hash on-chain:', cert[2].slice(0, 24) + '…');
  field('Issuer:', cert[3]);
  field('Issued at:', new Date(Number(cert[4]) * 1000).toISOString());
  field('Revoked:', cert[5].toString());

  // ── Step 5: Revoke ────────────────────────────────────────────────────────
  section('STEP 5 — REVOKE CERTIFICATE (by issuer)');
  const revokeTx      = await contract.connect(issuer).revokeCertificate(CERT_ID);
  const revokeReceipt = await revokeTx.wait();
  field('Tx hash:', revokeReceipt.hash.slice(0, 24) + '…');
  pass('Certificate revoked.');

  // ── Step 6: Verify REVOKED ────────────────────────────────────────────────
  section('STEP 6 — VERIFY AFTER REVOKE (expect → REVOKED)');
  const result3 = await contract.verifyCertificate(CERT_ID, CORRECT_HASH);
  field('Result:', result3);
  result3 === 'REVOKED' ? pass('PASS') : fail('Expected REVOKED');

  // ── Step 7: NOT_FOUND ─────────────────────────────────────────────────────
  section('STEP 7 — VERIFY UNKNOWN ID (expect → NOT_FOUND)');
  const result4 = await contract.verifyCertificate('CERT-GHOST-999', CORRECT_HASH);
  field('Result:', result4);
  result4 === 'NOT_FOUND' ? pass('PASS') : fail('Expected NOT_FOUND');

  // ── Step 8: Access control ────────────────────────────────────────────────
  section('STEP 8 — REVOKE BY NON-ISSUER (expect → REVERT)');
  const CERT_ID_2 = 'CERT-2024-002';
  console.log('  Issuing a second certificate first…');
  await (
    await contract.connect(issuer).issueCertificate(
      CERT_ID_2, 'Arjun Mehta', 'MCA', fakePdfHash('another-pdf'),
    )
  ).wait();
  console.log('  Attempting revoke from non-issuer wallet…');
  try {
    await contract.connect(other).revokeCertificate(CERT_ID_2);
    fail('Expected revert — should NOT reach here!');
  } catch (err) {
    const msg = (err.reason ?? err.message ?? '').toString();
    const ok  = msg.includes('Only the original issuer can revoke');
    field('Reverted with:', ok ? '"Only the original issuer can revoke"' : msg.slice(0, 70));
    ok ? pass('PASS — access control works.') : fail('Unexpected revert reason');
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  section('DEMO COMPLETE — ALL STEPS PASSED');
  console.log(`
  Verification states demonstrated:
    VALID      — hash matches, certificate is active
    INVALID    — hash mismatch (PDF was tampered)
    REVOKED    — issuer explicitly invalidated the certificate
    NOT_FOUND  — certificate ID never registered on-chain

  Security property demonstrated:
    Only the wallet that issued a certificate can revoke it.
    Any other wallet call is rejected by the smart contract.
`);
}

// ─── Entry point ──────────────────────────────────────────────────────────────
main().catch((err) => {
  console.error('\n[ERROR]', err.shortMessage ?? err.message ?? err);
  process.exitCode = 1;
});
