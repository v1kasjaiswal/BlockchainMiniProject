import { Contract, JsonRpcProvider, Wallet } from 'ethers';
import { certificateVerificationAbi } from './abi';
import { CONTRACT_ADDRESS, LOCAL_RPC_URL } from './config';

// Hardhat local node pre-funded account #0 (Standard local test private key with 10,000 ETH)
const HARDHAT_DEFAULT_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

/**
 * Returns a static JSON-RPC provider connected to the local Hardhat node.
 */
export function getProvider() {
  return new JsonRpcProvider(LOCAL_RPC_URL, 31337, { staticNetwork: true });
}

/**
 * Direct local signer from Hardhat node — 100% walletless execution.
 */
export function getLocalSigner() {
  return new Wallet(HARDHAT_DEFAULT_KEY, getProvider());
}

/**
 * Read-only contract instance.
 */
export function getReadOnlyContract() {
  return new Contract(CONTRACT_ADDRESS, certificateVerificationAbi, getProvider());
}

/**
 * Writable contract instance connected to local signer.
 */
export function getWritableContract() {
  return new Contract(CONTRACT_ADDRESS, certificateVerificationAbi, getLocalSigner());
}

/**
 * Returns the default local issuer address.
 */
export function getLocalIssuerAddress(): string {
  return '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
}

/**
 * Issue a new certificate directly on the blockchain.
 */
export async function issueCertificate(
  certificateId: string,
  studentName: string,
  course: string,
  certificateHash: string,
) {
  const contract = getWritableContract();
  const tx = await contract.issueCertificate(certificateId, studentName, course, certificateHash);
  return await tx.wait();
}

/**
 * Verify a certificate on the blockchain (read-only query).
 */
export async function verifyCertificate(certificateId: string, certificateHash: string) {
  const contract = getReadOnlyContract();
  return await contract.verifyCertificate(certificateId, certificateHash);
}

/**
 * Revoke a certificate on the blockchain.
 */
export async function revokeCertificate(certificateId: string) {
  const contract = getWritableContract();
  const tx = await contract.revokeCertificate(certificateId);
  return await tx.wait();
}

/**
 * Get certificate details from the blockchain (read-only query).
 */
export async function getCertificate(certificateId: string) {
  const contract = getReadOnlyContract();
  return await contract.getCertificate(certificateId);
}
