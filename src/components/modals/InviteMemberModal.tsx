import React, { useState, KeyboardEvent, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { setInviteMemberModalOpen } from '../../store/uiSlice';
import { apiService } from '../../services/apiService';

interface InviteResult {
  email: string;
  status: 'pending' | 'success' | 'error';
  error?: string;
}

export const InviteMemberModal: React.FC<{ onInvitesSent?: () => void }> = ({ onInvitesSent }) => {
  const dispatch = useAppDispatch();
  const { workspaceSlug } = useParams<{ workspaceSlug: string }>();
  
  const { isInviteMemberModalOpen } = useAppSelector((state) => state.ui);
  const { user } = useAppSelector((state) => state.auth);
  const { workspaces } = useAppSelector((state) => state.workspaces || { workspaces: [] }); // Fallback if workspaces slice not fully set up
  
  // Find current workspace by slug to get its ID, or try to get it from state/url.
  // We'll fetch workspace dynamically if needed, but for now let's assume we can resolve it.
  const [workspaceId, setWorkspaceId] = useState<string>('');

  const [emailInput, setEmailInput] = useState('');
  const [emails, setEmails] = useState<string[]>([]);
  const [role, setRole] = useState<'USER' | 'SUPER_ADMIN'>('USER');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<InviteResult[]>([]);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    // Resolve workspace ID from slug
    if (workspaceSlug) {
      apiService.getWorkspaceBySlug(workspaceSlug)
        .then(ws => setWorkspaceId(ws.id))
        .catch(err => console.error("Could not resolve workspace slug to ID:", err));
    }
  }, [workspaceSlug]);

  if (!isInviteMemberModalOpen) return null;

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleAddEmail = (email: string) => {
    const trimmed = email.trim().toLowerCase();
    if (trimmed && validateEmail(trimmed)) {
      if (!emails.includes(trimmed)) {
        setEmails([...emails, trimmed]);
        setResults([...results, { email: trimmed, status: 'pending' }]);
      }
      setEmailInput('');
    } else if (trimmed) {
      setToastMessage({ type: 'error', text: 'Please enter a valid email address.' });
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === 'Tab' || e.key === ',') {
      e.preventDefault();
      handleAddEmail(emailInput);
    }
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setEmails(emails.filter(e => e !== emailToRemove));
    setResults(results.filter(r => r.email !== emailToRemove));
  };

  const handleSubmit = async () => {
    // Process any lingering input
    if (emailInput.trim()) {
      handleAddEmail(emailInput);
    }

    // Wait a tick for state to update if we just added an email
    setTimeout(async () => {
      const currentEmails = emailInput.trim() && validateEmail(emailInput.trim()) && !emails.includes(emailInput.trim().toLowerCase())
        ? [...emails, emailInput.trim().toLowerCase()]
        : emails;

      if (currentEmails.length === 0) return;
      if (!workspaceId || !user?.id) {
        setToastMessage({ type: 'error', text: 'Missing workspace or user context.' });
        return;
      }

      setIsSubmitting(true);
      setToastMessage(null);

      const promises = currentEmails.map(email => 
        apiService.inviteWorkspaceMember(workspaceId, user.id, email, role)
          .then(() => ({ email, success: true, error: null }))
          .catch(err => ({ email, success: false, error: err.message || 'Unknown error' }))
      );

      const resolved = await Promise.allSettled(promises);
      
      const newResults: InviteResult[] = [];
      const successfulEmails: string[] = [];

      resolved.forEach((res) => {
        if (res.status === 'fulfilled') {
          const val = res.value;
          if (val.success) {
            successfulEmails.push(val.email);
            newResults.push({ email: val.email, status: 'success' });
          } else {
            newResults.push({ email: val.email, status: 'error', error: val.error });
          }
        } else {
           // Should not happen since we catch in the map
        }
      });

      setResults(newResults);
      
      // Remove successful emails from the chips
      const failedEmails = currentEmails.filter(e => !successfulEmails.includes(e));
      setEmails(failedEmails);
      setEmailInput('');

      if (successfulEmails.length === currentEmails.length) {
        // All succeeded
        setToastMessage({ type: 'success', text: `Successfully sent ${successfulEmails.length} invite(s).` });
        if (onInvitesSent) onInvitesSent();
        
        // Close modal after a short delay
        setTimeout(() => {
          dispatch(setInviteMemberModalOpen(false));
          setEmails([]);
          setResults([]);
          setToastMessage(null);
        }, 1500);
      } else if (successfulEmails.length > 0) {
        // Partial success
        setToastMessage({ type: 'success', text: `Sent ${successfulEmails.length} invite(s). Some failed.` });
        if (onInvitesSent) onInvitesSent();
      } else {
        // All failed
        setToastMessage({ type: 'error', text: 'Failed to send invites. See below for details.' });
      }

      setIsSubmitting(false);
    }, 0);
  };

  const closeModal = () => {
    dispatch(setInviteMemberModalOpen(false));
    setEmails([]);
    setEmailInput('');
    setResults([]);
    setToastMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-[var(--bg-surface-container-lowest)] border border-[var(--border-outline-variant)] rounded-2xl shadow-2xl w-full max-w-lg p-6 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[var(--bg-surface-container-high)] text-[var(--text-on-surface-variant)] cursor-pointer"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>

        <h2 className="text-xl font-bold text-[var(--text-on-surface)] mb-1">Invite Members</h2>
        <p className="text-xs text-[var(--text-on-surface-variant)] mb-4">
          Invite teammates to collaborate in this workspace.
        </p>

        {toastMessage && (
          <div className={`mb-4 px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 ${
            toastMessage.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
          }`}>
            <span className="material-symbols-outlined text-base">
              {toastMessage.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <span>{toastMessage.text}</span>
          </div>
        )}

        <div className="space-y-4">
          {/* Email Chips Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-on-surface-variant)] mb-1">
              Email Addresses
            </label>
            <div className="w-full flex flex-wrap gap-2 p-2 min-h-[46px] rounded-xl bg-[var(--bg-surface-container-low)] border border-[var(--border-outline-variant)] focus-within:border-[var(--color-primary)] transition-colors">
              {emails.map(email => (
                <div key={email} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-surface-container-highest)] text-xs font-medium text-[var(--text-on-surface)]">
                  <span>{email}</span>
                  <button onClick={() => handleRemoveEmail(email)} className="hover:text-rose-500 transition-colors flex items-center justify-center">
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </div>
              ))}
              <input
                type="text"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={() => handleAddEmail(emailInput)}
                placeholder={emails.length === 0 ? "jane.doe@example.com, john@example.com..." : "Add another..."}
                className="flex-1 min-w-[150px] bg-transparent text-sm text-[var(--text-on-surface)] outline-none px-1 py-1"
                disabled={isSubmitting}
              />
            </div>
            <p className="text-[10px] text-[var(--text-on-surface-variant)] mt-1 ml-1">Press Enter, Tab, or comma to add</p>
          </div>

          {/* Role Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-on-surface-variant)] mb-1">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'USER' | 'SUPER_ADMIN')}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface-container-low)] border border-[var(--border-outline-variant)] text-sm font-semibold text-[var(--text-on-surface)] outline-none focus:border-[var(--color-primary)] cursor-pointer"
              disabled={isSubmitting}
            >
              <option value="USER">User (Standard Access)</option>
              <option value="SUPER_ADMIN">Super Admin (Full Access)</option>
            </select>
          </div>

          {/* Error Display for partial failures */}
          {results.some(r => r.status === 'error') && (
            <div className="mt-2 space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-rose-500 mb-1">
                Failed Invites
              </label>
              {results.filter(r => r.status === 'error').map((res, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-rose-600 bg-rose-500/10 px-3 py-2 rounded-lg border border-rose-500/20">
                  <span className="material-symbols-outlined text-sm">warning</span>
                  <span className="font-semibold">{res.email}:</span>
                  <span>{res.error}</span>
                </div>
              ))}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-outline-variant)]">
            <button
              type="button"
              onClick={closeModal}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-[var(--bg-surface-container-high)] text-[var(--text-on-surface)] text-xs font-semibold hover:bg-[var(--bg-surface-container-highest)] cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || (emails.length === 0 && !emailInput.trim())}
              className="px-5 py-2 rounded-xl bg-[var(--color-primary)] text-white text-xs font-semibold shadow-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">send</span>
                  <span>Send Invites</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
