import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../store';
import { apiService } from '../../services/apiService';
import { Workspace } from '../../types';

export const WorkspacePicker: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceDescription, setWorkspaceDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [invites, setInvites] = useState<any[]>([]);
  const [isProcessingInvite, setIsProcessingInvite] = useState<string | null>(null);

  const loadWorkspaces = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      const [wsRes, invitesRes] = await Promise.all([
        apiService.getWorkspacesForUser(user.id),
        apiService.getMyPendingInvites(user.id)
      ]);
      setWorkspaces(wsRes);
      setInvites(invitesRes);
      setError(null);
    } catch (err: any) {
      console.warn('Error fetching workspaces or invites:', err);
      setError(err.message || 'Unable to load your workspaces.');
      setWorkspaces([]);
      setInvites([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspaces();
  }, [user?.id]);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    const name = workspaceName.trim();
    if (!name) {
      setError('Workspace name is required.');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const newWorkspace = await apiService.createWorkspace(
        { name, description: workspaceDescription.trim() },
        user.id
      );
      setWorkspaces((prev) => [...prev, newWorkspace]);
      setWorkspaceName('');
      setWorkspaceDescription('');
      navigate(`/${newWorkspace.slug}`, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Unable to create workspace.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleAcceptInvite = async (inviteId: string) => {
    if (!user?.id) return;
    setIsProcessingInvite(inviteId);
    try {
      await apiService.acceptInvite(inviteId, user.id);
      await loadWorkspaces(); // Reload to get new workspace and updated invites
    } catch (err: any) {
      setError(err.message || 'Failed to accept invite.');
    } finally {
      setIsProcessingInvite(null);
    }
  };

  const handleDeclineInvite = async (inviteId: string) => {
    if (!user?.id) return;
    setIsProcessingInvite(inviteId);
    try {
      await apiService.declineInvite(inviteId, user.id);
      setInvites((prev) => prev.filter((i) => i.id !== inviteId));
    } catch (err: any) {
      setError(err.message || 'Failed to decline invite.');
    } finally {
      setIsProcessingInvite(null);
    }
  };

  const handleLaterInvite = (inviteId: string) => {
    setInvites((prev) => prev.filter((i) => i.id !== inviteId));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-surface)] flex flex-col items-center justify-center p-6 text-[var(--text-on-surface)]">
        <div className="flex items-center gap-3 text-xs font-semibold text-[var(--text-on-surface-variant)]">
          <div className="w-5 h-5 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
          <span>Loading workspaces...</span>
        </div>
      </div>
    );
  }

  const hasWorkspaces = workspaces.length > 0;

  return (
    <div className="min-h-screen bg-[var(--bg-surface)] flex items-center justify-center p-6 text-[var(--text-on-surface)]">
      <div className="w-full max-w-2xl rounded-3xl border border-[var(--border-outline-variant)] bg-[var(--bg-surface-container-lowest)] shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-[var(--border-outline-variant)]">
          <span className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--color-primary)]">Task Management App</span>
          <h1 className="mt-2 text-2xl font-bold text-[var(--text-on-surface)]">
            {hasWorkspaces ? 'Choose a workspace' : 'Create your first workspace'}
          </h1>
          <p className="mt-2 text-sm text-[var(--text-on-surface-variant)]">
            {hasWorkspaces
              ? 'Select an existing workspace or create another one below.'
              : 'You are not assigned to any workspace yet. Create one to continue.'}
          </p>
        </div>

        {invites.length > 0 && (
          <div className="p-8 border-b border-[var(--border-outline-variant)] bg-[var(--color-primary-fixed)]/10">
            <h2 className="text-sm font-bold text-[var(--color-primary)] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">mark_email_unread</span>
              Pending Invitations ({invites.length})
            </h2>
            <div className="space-y-3">
              {invites.map((invite) => (
                <div key={invite.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[var(--color-primary)]/30 bg-[var(--bg-surface-container-lowest)] p-4 shadow-sm">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-[var(--text-on-surface)]">
                      You've been invited to join <span className="font-extrabold">{invite.workspaceName}</span>
                    </h3>
                    {invite.workspaceDescription && (
                      <p className="text-xs text-[var(--text-on-surface-variant)] mt-1 truncate">
                        {invite.workspaceDescription}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleLaterInvite(invite.id)}
                        disabled={isProcessingInvite !== null}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[var(--text-on-surface-variant)] hover:bg-[var(--bg-surface-container-highest)] hover:text-[var(--text-on-surface)] transition-colors disabled:opacity-50"
                      >
                        Later
                      </button>
                      <button
                        onClick={() => handleDeclineInvite(invite.id)}
                        disabled={isProcessingInvite !== null}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[var(--text-on-surface-variant)] hover:bg-[var(--bg-surface-container-highest)] hover:text-rose-500 transition-colors disabled:opacity-50"
                      >
                        Decline
                      </button>
                    </div>
                    <button
                      onClick={() => handleAcceptInvite(invite.id)}
                      disabled={isProcessingInvite !== null}
                      className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-[var(--color-primary)] shadow-xs hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {isProcessingInvite === invite.id ? 'Accepting...' : 'Accept'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {hasWorkspaces && (
          <div className="p-8 border-b border-[var(--border-outline-variant)] bg-[var(--bg-surface-container-low)]">
            <div className="space-y-3">
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  type="button"
                  onClick={() => navigate(`/${ws.slug}`, { replace: true })}
                  className="w-full flex items-center justify-between gap-4 rounded-2xl border border-[var(--border-outline-variant)] bg-[var(--bg-surface-container-lowest)] p-4 text-left transition hover:border-[var(--color-primary)] hover:bg-[var(--bg-surface-container-high)] cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary)] text-sm font-bold text-white">
                      {ws.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-[var(--text-on-surface)]">{ws.name}</h3>
                      <p className="text-xs text-[var(--text-on-surface-variant)]">
                        {ws.description || 'Workspace'}
                      </p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-xl text-[var(--color-primary)]">arrow_forward</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleCreateWorkspace} className="p-8 space-y-5">
          {error && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-on-surface-variant)]">
              Workspace name
            </label>
            <input
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              placeholder="Operations Hub"
              className="w-full rounded-xl border border-[var(--border-outline-variant)] bg-[var(--bg-surface-container-low)] px-3 py-2.5 text-sm text-[var(--text-on-surface)] outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-on-surface-variant)]">
              Description
            </label>
            <textarea
              value={workspaceDescription}
              onChange={(e) => setWorkspaceDescription(e.target.value)}
              placeholder="Short description for this workspace"
              rows={3}
              className="w-full rounded-xl border border-[var(--border-outline-variant)] bg-[var(--bg-surface-container-low)] px-3 py-2.5 text-sm text-[var(--text-on-surface)] outline-none focus:border-[var(--color-primary)] resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isCreating}
            className="w-full rounded-xl bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[var(--color-primary)]/20 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isCreating ? 'Creating workspace...' : hasWorkspaces ? 'Create workspace' : 'Create your workspace'}
          </button>
        </form>
      </div>
    </div>
  );
};
