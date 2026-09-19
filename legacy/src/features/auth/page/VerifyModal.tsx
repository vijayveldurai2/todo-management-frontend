import React, { useState } from 'react';
import { useVerifyEmailMutation } from '../../../services/authApi';

interface VerifyModalProps {
  onClose: () => void;
}

export default function VerifyModal({ onClose }: VerifyModalProps) {
  const [verifyEmail, { isLoading }] = useVerifyEmailMutation();
  const [verifyTokenInput, setVerifyTokenInput] = useState('');
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleVerifyToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyTokenInput.trim() || isLoading) return;
    setErrorMsg(null);

    try {
      const res = await verifyEmail({ token: verifyTokenInput.trim() }).unwrap();
      setVerifyMessage(res.message || 'Email verified successfully!');
    } catch (err: any) {
      setErrorMsg(err.data?.message || err.error || 'Verification token invalid or expired.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-[var(--bg-surface-container-lowest)] border border-[var(--border-outline-variant)] rounded-2xl shadow-2xl w-full max-w-sm p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-[var(--bg-surface-container-high)] text-[var(--text-on-surface-variant)] cursor-pointer"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>

        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-[var(--color-primary)] flex items-center justify-center mb-3">
          <span className="material-symbols-outlined text-xl">mark_email_read</span>
        </div>

        <h3 className="text-base font-bold text-[var(--text-on-surface)] mb-1">Verify Email Address</h3>
        <p className="text-xs text-[var(--text-on-surface-variant)] mb-4">
          Enter the verification token sent to your email to verify your account.
        </p>

        {errorMsg && <div className="mb-4 text-xs font-semibold text-rose-600">{errorMsg}</div>}

        {verifyMessage ? (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold space-y-2 mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base">verified</span>
              <span>{verifyMessage}</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleVerifyToken} className="space-y-3 mb-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-on-surface-variant)] mb-1">
                Verification Token
              </label>
              <input
                type="text"
                required
                value={verifyTokenInput}
                onChange={(e) => setVerifyTokenInput(e.target.value)}
                placeholder="e.g. 5a9b7c8d"
                className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-surface-container-low)] border border-[var(--border-outline-variant)] text-xs text-[var(--text-on-surface)] outline-none focus:border-[var(--color-primary)] font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !verifyTokenInput.trim()}
              className="w-full py-2 rounded-xl bg-[var(--color-primary)] text-white text-xs font-bold cursor-pointer hover:opacity-90 disabled:opacity-60"
            >
              {isLoading ? 'Verifying...' : 'Submit Token'}
            </button>
          </form>
        )}

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-1.5 rounded-xl bg-[var(--bg-surface-container-high)] text-[var(--text-on-surface)] text-xs font-semibold cursor-pointer">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
