# CertChain — Blockchain Certificate Verification

A lightweight, local blockchain mini-project for issuing, verifying, and revoking academic certificates on-chain using Solidity and a Nothing OS-inspired brutalist UI.

Designed entirely for **local blockchain execution** — **no MetaMask, no browser extensions, and no external wallets required.**

---

## How It Works

1. **Local SHA-256 Hashing**: When a user selects a certificate PDF in the browser, the browser computes its SHA-256 cryptographic hash in memory. **The PDF file is never uploaded anywhere.**
2. **On-Chain Immutability**: The 32-byte hash and metadata (Student Name, Course, Timestamp) are registered on a local Ethereum smart contract.
3. **Instant Verification**: To verify, anyone selects the same PDF. The browser re-hashes the file and queries the smart contract.
   * If even a single character in the PDF was altered, the hash will not match and verification returns `INVALID`.

### Verification States

| Status | Meaning |
|---|---|
| `VALID` | Hash matches on-chain record; certificate is active. |
| `INVALID` | Hash mismatch; document has been modified or forged. |
| `REVOKED` | The issuer has permanently invalidated this certificate. |
| `NOT_FOUND` | Certificate ID was never registered on-chain. |

---

## Tech Stack

* **Solidity 0.8.24** — Smart contract logic & storage
* **Hardhat 3** — Local in-memory Ethereum node
* **ethers.js v6** — Direct JSON-RPC blockchain communication
* **React 19 + TypeScript + Vite 8** — Fast frontend
* **Tailwind CSS** — Nothing OS brutalist monochrome theme

---

## Prerequisites

* **Node.js** (v18 or newer)
* **npm** (comes with Node.js)
* *No browser extensions or external wallets needed.*

---

## Quick Start (Run Locally)

### 1. Clone & Install Dependencies

```bash
git clone <repository-url>
cd BlockchainMiniProject
npm install
```

### 2. Start the Local Blockchain Node (Terminal 1)

```bash
npm run node
```
*Keep this terminal open.* It runs an in-process local Ethereum node on `http://127.0.0.1:8545`.

### 3. Deploy Contract & Start Web App (Terminal 2)

```bash
npm run deploy
npm run dev
```

Open **`http://localhost:5173`** in your browser.

> **Tip:** `npm run deploy` automatically compiles the contract, deploys it to the running node, and updates `.env` with the active contract address.

---

## Fast Standalone CLI Demo (No Browser Needed)

To demonstrate the full blockchain lifecycle in the terminal:

1. Ensure the node is running (`npm run node` in Terminal 1).
2. In Terminal 2, run:
   ```bash
   npm run demo
   ```
This automatically runs 9 verification scenarios (Issue → Verify Valid → Tamper Check → Revoke → Verify Revoked → Access Control).

---

## Testing in the Web UI

1. **Issue a Certificate** (Tab `02 ISSUE`):
   * Enter a Certificate ID (e.g., `CERT-001`), Student Name, and Course.
   * Pick any PDF from your computer.
   * Click **`ISSUE TO BLOCKCHAIN`**.
2. **Verify Authenticity** (Tab `01 VERIFY`):
   * Enter `CERT-001` and select the **exact same PDF**.
   * Click **`VERIFY ON BLOCKCHAIN`** → Returns **`● VALID`** with student details.
3. **Tamper Test** (Tab `01 VERIFY`):
   * Enter `CERT-001` and select a **different PDF**.
   * Click **`VERIFY ON BLOCKCHAIN`** → Returns **`✕ INVALID`**.
4. **Revoke a Certificate** (Tab `03 REVOKE`):
   * Enter `CERT-001`, check the confirmation box, and click **`REVOKE ON BLOCKCHAIN`**.
   * Re-verify in Tab `01` with the original PDF → Returns **`✕ REVOKED`**.

---

## Available npm Scripts

| Command | Action |
|---|---|
| `npm run node` | Starts the local Hardhat blockchain node |
| `npm run deploy` | Compiles & deploys contract to local node; updates `.env` |
| `npm run dev` | Starts Vite local development server |
| `npm run demo` | Runs automated standalone CLI test suite |
| `npm run compile` | Compiles Solidity contracts |
| `npm run build` | Builds frontend production bundle |
| `npm run lint` | Runs code linter |

---

## Project Structure

```text
BlockchainMiniProject/
├── contracts/
│   └── CertificateVerification.sol   # Solidity smart contract
├── scripts/
│   ├── deploy.cjs                    # 1-command deployment script
│   └── demo.cjs                      # Automated CLI demo script
├── src/
│   ├── blockchain/
│   │   ├── abi.ts                    # Contract ABI
│   │   ├── config.ts                 # Contract address & RPC config
│   │   └── contract.ts               # Direct JSON-RPC blockchain interactions
│   ├── components/
│   │   ├── Navbar.tsx                # Header with local node status
│   │   ├── VerifyCertificate.tsx     # Verification module
│   │   ├── IssueCertificate.tsx      # Issuance module
│   │   └── RevokeCertificate.tsx     # Revocation module
│   ├── utils/
│   │   └── hashFile.ts               # Web Crypto SHA-256 file hashing
│   ├── App.tsx                       # Main Nothing OS tabbed layout
│   ├── index.css                     # Global styles & dot-matrix theme
│   └── main.tsx                      # App entry point
├── hardhat.config.js                 # Hardhat local node configuration
├── package.json
└── vite.config.ts
```
