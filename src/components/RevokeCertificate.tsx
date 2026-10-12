import { useState } from 'react';
import { revokeCertificate } from '../blockchain/contract';

type RevokeStatus =
  | { type: 'idle' }
  | { type: 'pending' }
  | { type: 'success'; txHash: string }
  | { type: 'error'; message: string };

export function RevokeCertificate() {
  const [certificateId, setCertificateId] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [status, setStatus] = useState<RevokeStatus>({ type: 'idle' });

  const isLoading = status.type === 'pending';

  const handleSubmit = async () => {
    if (!certificateId.trim()) {
      setStatus({ type: 'error', message: 'Certificate ID is required.' });
      return;
    }
    if (!confirmed) {
      setStatus({ type: 'error', message: 'Please check the confirmation acknowledgment box.' });
      return;
    }

    try {
      setStatus({ type: 'pending' });
      const receipt = await revokeCertificate(certificateId.trim());
      setStatus({ type: 'success', txHash: receipt?.hash ?? receipt?.transactionHash ?? '0x' });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Revocation failed (only issuer can revoke).',
      });
    }
  };

  const reset = () => {
    setCertificateId('');
    setConfirmed(false);
    setStatus({ type: 'idle' });
  };

  return (
    <div className="space-y-5">
      {/* Notice */}
      <div className="border-2 border-black/20 bg-neutral-100 p-3.5 text-neutral-800 font-mono text-xs font-bold leading-relaxed">
        NOTICE: Revocation is permanent on-chain. Once revoked, verification will always return REVOKED. Only the issuer address can authorize this.
      </div>

      {/* Certificate ID */}
      <div>
        <label className="block font-mono text-xs font-black uppercase tracking-wider text-black mb-2">
          01 // CERTIFICATE ID TO REVOKE
        </label>
        <input
          type="text"
          value={certificateId}
          onChange={(e) => setCertificateId(e.target.value)}
          placeholder="e.g. CERT-2024-001"
          disabled={isLoading || status.type === 'success'}
          className="w-full border-2 border-black bg-neutral-50 px-3.5 py-2.5 font-mono text-sm font-bold text-black placeholder-neutral-400 focus:border-black focus:bg-white focus:outline-none transition-colors"
        />
      </div>

      {/* Confirmation checkbox */}
      <label className="flex items-start gap-3 cursor-pointer py-1.5 border-2 border-black/15 bg-neutral-50 p-3">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          disabled={isLoading || status.type === 'success'}
          className="mt-0.5 h-4 w-4 accent-black cursor-pointer"
        />
        <span className="font-mono text-xs font-bold text-black select-none">
          I confirm that this certificate should be permanently revoked on-chain.
        </span>
      </label>

      {/* Action button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isLoading || status.type === 'success'}
        className="w-full border-2 border-black bg-black py-3 font-mono text-sm font-black uppercase tracking-widest text-white hover:bg-neutral-800 transition-all shadow-[3px_3px_0px_#000] disabled:opacity-50 disabled:pointer-events-none"
      >
        {isLoading ? (
          <span>MINING REVOCATION ON BLOCKCHAIN...</span>
        ) : (
          'REVOKE ON BLOCKCHAIN'
        )}
      </button>

      {/* Success feedback */}
      {status.type === 'success' && (
        <div className="border-2 border-black bg-neutral-50 p-5 shadow-[4px_4px_0px_#000] space-y-3">
          <div className="flex items-center justify-between border-b-2 border-black/10 pb-3">
            <span className="font-mono text-xs font-black uppercase tracking-wider text-neutral-700">
              STATUS
            </span>
            <span className="font-mono text-xs font-black uppercase tracking-widest text-white px-3 py-1 border-2 border-black bg-black">
              ✕ REVOKED
            </span>
          </div>
          <p className="font-mono text-xs font-bold text-neutral-800 break-all">
            TX HASH: {status.txHash}
          </p>
          <div className="pt-2 flex justify-end border-t border-black/10">
            <button
              type="button"
              onClick={reset}
              className="font-mono text-xs font-black uppercase tracking-wider text-black hover:underline"
            >
              RESET
            </button>
          </div>
        </div>
      )}

      {status.type === 'error' && (
        <div className="border-2 border-black bg-neutral-100 p-4 text-left">
          <span className="font-mono text-xs font-black uppercase tracking-wider text-black block mb-1">
            ERROR
          </span>
          <p className="font-mono text-xs font-bold text-neutral-800">{status.message}</p>
        </div>
      )}
    </div>
  );
}
