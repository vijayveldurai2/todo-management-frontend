import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { setInviteMemberModalOpen } from '../../features/ui/uiSlice';
import { useAddWorkspaceMemberMutation } from '../../services/memberApi';
import { useGetWorkspaceBySlugQuery } from '../../services/workspaceApi';

export const InviteMemberModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.isInviteMemberModalOpen);
  
  const { workspaceSlug = 'main-workspace' } = useParams<{ workspaceSlug: string }>();
  const { data: workspace } = useGetWorkspaceBySlugQuery(workspaceSlug, { skip: !isOpen });
  const { user } = useAppSelector((state) => state.auth);
  const [addWorkspaceMember, { isLoading }] = useAddWorkspaceMemberMutation();
  
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('USER');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    dispatch(setInviteMemberModalOpen(false));
    setEmail('');
    setRole('USER');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    if (!workspace?.id || !user?.id) {
      setError('Workspace details or user not loaded yet. Please try again.');
      return;
    }

    try {
      await addWorkspaceMember({ workspaceId: workspace.id, inviterId: user.id, email, role }).unwrap();
      handleClose();
    } catch (err: any) {
      console.error('Failed to invite member', err);
      setError(err?.data?.message || 'Failed to invite member');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-[var(--bg-surface-container)] w-full max-w-md rounded-2xl border border-[var(--border-outline-variant)] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-outline-variant)]">
          <h2 className="text-xl font-bold text-[var(--text-on-surface)]">Invite Member</h2>
          <button 
            onClick={handleClose}
            className="p-2 rounded-xl text-[var(--text-on-surface-variant)] hover:bg-[var(--bg-surface-container-highest)] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-sm text-rose-500 bg-rose-500/10 rounded-xl">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-semibold text-[var(--text-on-surface)]">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@company.com"
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-surface-container-lowest)] border border-[var(--border-outline-variant)] text-[var(--text-on-surface)] placeholder:text-[var(--text-on-surface-variant)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-colors"
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="role" className="block text-sm font-semibold text-[var(--text-on-surface)]">
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-surface-container-lowest)] border border-[var(--border-outline-variant)] text-[var(--text-on-surface)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-colors cursor-pointer"
            >
              <option value="USER">Member (Default)</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[var(--text-on-surface-variant)] hover:text-[var(--text-on-surface)] hover:bg-[var(--bg-surface-container-highest)] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !email.trim()}
              className="px-5 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold shadow-xs hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">send</span>
                  <span>Send Invite</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
