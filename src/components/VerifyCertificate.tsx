import { useState } from 'react';
import { ethers } from 'ethers';
import { getCertificate, verifyCertificate } from '../blockchain/contract';
import { hashFile } from '../utils/hashFile';

type VerifyResult = 'VALID' | 'INVALID' | 'REVOKED' | 'NOT_FOUND';

type CertDetails = {
  studentName: string;
  course: string;
  issuer: string;
  issuedAt: string;
};

type VerifyStatus =
  | { type: 'idle' }
  | { type: 'hashing' }
  | { type: 'verifying' }
  | { type: 'done'; result: VerifyResult; details?: CertDetails }
  | { type: 'error'; message: string };

export function VerifyCertificate() {
  const [certificateId, setCertificateId] = useState('');
  const [hashValue, setHashValue] = useState('');
  const [fileName, setFileName] = useState('');
  const [status, setStatus] = useState<VerifyStatus>({ type: 'idle' });

  const isLoading = status.type === 'hashing' || status.type === 'verifying';

  const handleFileChange = async (file: File | null) => {
    if (!file) {
      setHashValue('');
      setFileName('');
      return;
    }
    setFileName(file.name);
    setStatus({ type: 'hashing' });
    try {
      const computed = await hashFile(file);
      setHashValue(computed);
      setStatus({ type: 'idle' });
    } catch (error) {
      setStatus({ type: 'error', message: error instanceof Error ? error.message : 'Hash calculation failed.' });
    }
  };

  const handleVerify = async () => {
    if (!certificateId.trim()) {
      setStatus({ type: 'error', message: 'Certificate ID is required.' });
      return;
    }
    if (!hashValue) {
      setStatus({ type: 'error', message: 'Select a certificate PDF to verify.' });
      return;
    }

    try {
      setStatus({ type: 'verifying' });
      const paddedHash = ethers.zeroPadValue(hashValue, 32);
      const result: VerifyResult = await verifyCertificate(certificateId.trim(), paddedHash);

      if (result === 'VALID') {
        const cert = await getCertificate(certificateId.trim());
        setStatus({
          type: 'done',
          result,
          details: {
            studentName: cert[0] as string,
            course: cert[1] as string,
            issuer: cert[3] as string,
            issuedAt: new Date(Number(cert[4]) * 1000).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            }),
          },
        });
      } else {
        setStatus({ type: 'done', result });
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Verification failed.',
      });
    }
  };

  const reset = () => {
    setStatus({ type: 'idle' });
    setCertificateId('');
    setHashValue('');
    setFileName('');
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Certificate ID */}
        <div>
          <label className="block font-mono text-xs font-black uppercase tracking-wider text-black mb-2">
            01 // CERTIFICATE ID
          </label>
          <input
            type="text"
            value={certificateId}
            onChange={(e) => setCertificateId(e.target.value)}
            placeholder="e.g. CERT-2024-001"
            disabled={isLoading}
            className="w-full border-2 border-black bg-neutral-50 px-3.5 py-2.5 font-mono text-sm font-bold text-black placeholder-neutral-400 focus:border-black focus:bg-white focus:outline-none transition-colors"
          />
        </div>

        {/* PDF Document */}
        <div>
          <label className="block font-mono text-xs font-black uppercase tracking-wider text-black mb-2">
            02 // PDF DOCUMENT
          </label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
            disabled={isLoading}
            className="block w-full border-2 border-black bg-neutral-50 py-1.5 px-2.5 font-mono text-xs font-bold text-black focus:outline-none"
          />
          {fileName && (
            <p className="mt-1.5 font-mono text-xs font-bold text-neutral-700 truncate">
              SELECTED: {fileName}
            </p>
          )}
        </div>
      </div>

      {/* Hash preview */}
      {hashValue && (
        <div className="border-2 border-black/20 bg-neutral-100 p-3">
          <div className="font-mono text-[11px] font-black uppercase tracking-wider text-neutral-600 mb-1">
            DOCUMENT SHA-256 HASH
          </div>
          <div className="break-all font-mono text-xs font-bold text-black">
            {ethers.zeroPadValue(hashValue, 32)}
          </div>
        </div>
      )}

      {/* Action button */}
      <button
        type="button"
        onClick={handleVerify}
        disabled={isLoading}
        className="w-full border-2 border-black bg-black py-3 font-mono text-sm font-black uppercase tracking-widest text-white hover:bg-neutral-800 transition-all shadow-[3px_3px_0px_#000] disabled:opacity-50 disabled:pointer-events-none"
      >
        {isLoading ? (
          <span>{status.type === 'hashing' ? 'HASHING PDF...' : 'QUERYING BLOCKCHAIN...'}</span>
        ) : (
          'VERIFY ON BLOCKCHAIN'
        )}
      </button>

      {/* Result Display */}
      {status.type === 'done' && (
        <div className="border-2 border-black bg-neutral-50 p-5 shadow-[4px_4px_0px_#000] space-y-4">
          <div className="flex items-center justify-between border-b-2 border-black/10 pb-3">
            <span className="font-mono text-xs font-black uppercase tracking-wider text-neutral-700">
              STATUS RESULT
            </span>
            <span
              className={`font-mono text-xs font-black uppercase tracking-widest px-3 py-1 border-2 border-black ${
                status.result === 'VALID'
                  ? 'bg-black text-white'
                  : 'bg-white text-black'
              }`}
            >
              {status.result === 'VALID' ? '● VALID' : `✕ ${status.result}`}
            </span>
          </div>

          {status.result === 'VALID' && status.details && (
            <div className="grid grid-cols-2 gap-3 text-xs font-mono pt-1">
              <div>
                <span className="text-[11px] font-bold text-neutral-500 block uppercase">STUDENT</span>
                <span className="text-black text-sm font-black">{status.details.studentName}</span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-neutral-500 block uppercase">COURSE</span>
                <span className="text-black text-sm font-black">{status.details.course}</span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-neutral-500 block uppercase">ISSUED DATE</span>
                <span className="text-black text-xs font-bold">{status.details.issuedAt}</span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-neutral-500 block uppercase">ISSUER</span>
                <span className="text-neutral-700 text-xs font-bold truncate block" title={status.details.issuer}>
                  {status.details.issuer.slice(0, 10)}…{status.details.issuer.slice(-6)}
                </span>
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end border-t border-black/10">
            <button
              type="button"
              onClick={reset}
              className="font-mono text-xs font-black uppercase tracking-wider text-black hover:underline"
            >
              CLEAR / RESET
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
