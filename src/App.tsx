import { useState } from 'react';
import { IssueCertificate } from './components/IssueCertificate';
import { Navbar } from './components/Navbar';
import { RevokeCertificate } from './components/RevokeCertificate';
import { VerifyCertificate } from './components/VerifyCertificate';

type Tab = 'verify' | 'issue' | 'revoke';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('verify');

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-black flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-6">
        <div className="w-full max-w-2xl">
          {/* Header Title */}
          <div className="mb-5 text-center">
            <h1 className="font-mono text-base md:text-lg font-black tracking-[0.25em] uppercase text-black">
              CERTIFICATE VERIFICATION SYSTEM
            </h1>
            <p className="font-mono text-xs font-bold text-neutral-600 tracking-widest uppercase mt-1">
              ETHEREUM SMART CONTRACT // ZERO WALLET REQUIRED
            </p>
          </div>

          {/* Segmented Bolder Tabs */}
          <div className="grid grid-cols-3 border-2 border-black mb-5 bg-black/[0.04] p-1 gap-1.5 shadow-[3px_3px_0px_#000]">
            <button
              type="button"
              onClick={() => setActiveTab('verify')}
              className={`py-2.5 font-mono text-xs md:text-sm uppercase tracking-wider font-black transition-all ${
                activeTab === 'verify'
                  ? 'bg-black text-white shadow-[1px_1px_0px_#000]'
                  : 'text-neutral-700 hover:text-black hover:bg-black/10'
              }`}
            >
              01 VERIFY
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('issue')}
              className={`py-2.5 font-mono text-xs md:text-sm uppercase tracking-wider font-black transition-all ${
                activeTab === 'issue'
                  ? 'bg-black text-white shadow-[1px_1px_0px_#000]'
                  : 'text-neutral-700 hover:text-black hover:bg-black/10'
              }`}
            >
              02 ISSUE
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('revoke')}
              className={`py-2.5 font-mono text-xs md:text-sm uppercase tracking-wider font-black transition-all ${
                activeTab === 'revoke'
                  ? 'bg-black text-white shadow-[1px_1px_0px_#000]'
                  : 'text-neutral-700 hover:text-black hover:bg-black/10'
              }`}
            >
              03 REVOKE
            </button>
          </div>

          {/* Main Card */}
          <div className="border-2 border-black bg-white p-6 shadow-[5px_5px_0px_#000]">
            <div className="mb-5 pb-3 border-b-2 border-black/10 flex items-center justify-between">
              <span className="font-mono text-xs font-black uppercase tracking-[0.2em] text-black">
                ACTIVE // {activeTab.toUpperCase()}
              </span>
              <span className="font-mono text-[11px] font-bold text-neutral-600 tracking-wider uppercase">
                {activeTab === 'verify' && 'READ-ONLY // NO GAS'}
                {activeTab === 'issue' && 'DIRECT LOCAL SIGNING'}
                {activeTab === 'revoke' && 'ORIGINAL ISSUER ONLY'}
              </span>
            </div>

            {activeTab === 'verify' && <VerifyCertificate />}
            {activeTab === 'issue' && <IssueCertificate />}
            {activeTab === 'revoke' && <RevokeCertificate />}
          </div>

          {/* Footer Info */}
          <div className="mt-5 flex items-center justify-between font-mono text-[11px] font-bold uppercase tracking-wider text-neutral-600 px-1">
            <span>LOCAL HARDHAT // CHAIN 31337</span>
            <span>SOLIDITY 0.8.24 // ETHERS.JS V6</span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
