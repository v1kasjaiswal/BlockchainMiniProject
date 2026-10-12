import { useMemo, useState } from 'react';
import { ethers } from 'ethers';
import { issueCertificate } from '../blockchain/contract';
import { hashFile } from '../utils/hashFile';

type IssueStatus =
  | { type: 'idle' }
  | { type: 'hashing' }
  | { type: 'pending'; message: string }
  | { type: 'success'; txHash: string }
  | { type: 'error'; message: string };

export function IssueCertificate() {
  const [certificateId, setCertificateId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [course, setCourse] = useState('');
  const [hashValue, setHashValue] = useState('');
  const [fileName, setFileName] = useState('');
  const [status, setStatus] = useState<IssueStatus>({ type: 'idle' });

  const isLoading = status.type === 'pending' || status.type === 'hashing';

  const documentHash = useMemo(() => {
    if (!hashValue) return null;
    return ethers.zeroPadValue(hashValue, 32);
  }, [hashValue]);

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

  const handleSubmit = async () => {
    if (!certificateId.trim() || !studentName.trim() || !course.trim() || !hashValue) {
      setStatus({ type: 'error', message: 'All fields and a PDF certificate are required.' });
      return;
    }
    try {
      setStatus({ type: 'pending', message: 'MINING ON BLOCKCHAIN...' });
      const receipt = await issueCertificate(
        certificateId.trim(),
        studentName.trim(),
        course.trim(),
        ethers.zeroPadValue(hashValue, 32),
      );
      setStatus({ type: 'success', txHash: receipt?.hash ?? receipt?.transactionHash ?? '0x' });
    } catch (error) {
      setStatus({ type: 'error', message: error instanceof Error ? error.message : 'Issuance failed.' });
    }
  };

  const reset = () => {
    setCertificateId('');
    setStudentName('');
    setCourse('');
    setHashValue('');
    setFileName('');
    setStatus({ type: 'idle' });
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

        {/* Student Name */}
        <div>
          <label className="block font-mono text-xs font-black uppercase tracking-wider text-black mb-2">
            02 // STUDENT NAME
          </label>
          <input
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="e.g. Alex Carter"
            disabled={isLoading}
            className="w-full border-2 border-black bg-neutral-50 px-3.5 py-2.5 font-mono text-sm font-bold text-black placeholder-neutral-400 focus:border-black focus:bg-white focus:outline-none transition-colors"
          />
        </div>

        {/* Course */}
        <div>
          <label className="block font-mono text-xs font-black uppercase tracking-wider text-black mb-2">
            03 // COURSE / DEGREE
          </label>
          <input
            type="text"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            placeholder="e.g. B.Tech Computer Science"
            disabled={isLoading}
            className="w-full border-2 border-black bg-neutral-50 px-3.5 py-2.5 font-mono text-sm font-bold text-black placeholder-neutral-400 focus:border-black focus:bg-white focus:outline-none transition-colors"
          />
        </div>

        {/* Certificate PDF */}
        <div>
          <label className="block font-mono text-xs font-black uppercase tracking-wider text-black mb-2">
            04 // PDF DOCUMENT
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
      {documentHash && (
        <div className="border-2 border-black/20 bg-neutral-100 p-3">
          <div className="font-mono text-[11px] font-black uppercase tracking-wider text-neutral-600 mb-1">
            DOCUMENT SHA-256 HASH
          </div>
          <div className="break-all font-mono text-xs font-bold text-black">
            {documentHash}
          </div>
        </div>
      )}

      {/* Action button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isLoading}
        className="w-full border-2 border-black bg-black py-3 font-mono text-sm font-black uppercase tracking-widest text-white hover:bg-neutral-800 transition-all shadow-[3px_3px_0px_#000] disabled:opacity-50 disabled:pointer-events-none"
      >
        {isLoading ? (
          <span>{status.type === 'hashing' ? 'HASHING PDF...' : status.message}</span>
        ) : (
          'ISSUE TO BLOCKCHAIN'
        )}
      </button>

      {/* Result feedback */}
      {status.type === 'success' && (
        <div className="border-2 border-black bg-neutral-50 p-5 shadow-[4px_4px_0px_#000] space-y-3">
          <div className="flex items-center justify-between border-b-2 border-black/10 pb-3">
            <span className="font-mono text-xs font-black uppercase tracking-wider text-neutral-700">
              TRANSACTION CONFIRMED
            </span>
            <span className="font-mono text-xs font-black uppercase tracking-widest text-white px-3 py-1 border-2 border-black bg-black">
              ● ISSUED
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
              ISSUE ANOTHER
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
