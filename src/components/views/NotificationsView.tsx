import React, { useEffect, useState } from 'react';
import { useAppSelector } from '../../store';
import { apiService } from '../../services/apiService';

export const NotificationsView: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [invites, setInvites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingInvite, setIsProcessingInvite] = useState<string | null>(null);

  useEffect(() => {
    const loadInvites = async () => {
      if (!user?.id) return;
      setIsLoading(true);
      try {
        const invitesRes = await apiService.getMyPendingInvites(user.id);
        setInvites(invitesRes);
      } catch (err: any) {
        setError(err.message || 'Unable to load notifications.');
      } finally {
        setIsLoading(false);
      }
    };
    loadInvites();
  }, [user?.id]);

  const handleAcceptInvite = async (inviteId: string) => {
    if (!user?.id) return;
    setIsProcessingInvite(inviteId);
    try {
      await apiService.acceptInvite(inviteId, user.id);
      setInvites((prev) => prev.filter((i) => i.id !== inviteId));
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

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner / Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[var(--bg-surface-container-low)] border border-[var(--border-outline-variant)]">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
            Account Center
          </span>
          <h1 className="text-2xl font-extrabold text-[var(--text-on-surface)] mt-1">
            Notifications
          </h1>
          <p className="text-xs text-[var(--text-on-surface-variant)] mt-1">
            Manage your workspace invitations and alerts.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 text-rose-600 border border-rose-500/20 text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-sm font-semibold text-[var(--text-on-surface-variant)]">Loading notifications...</p>
        </div>
      ) : invites.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center bg-[var(--bg-surface-container-lowest)] rounded-2xl border border-[var(--border-outline-variant)]">
          <div className="w-16 h-16 bg-[var(--bg-surface-container-high)] rounded-full flex items-center justify-center mb-4 text-[var(--text-on-surface-variant)]">
            <span className="material-symbols-outlined text-3xl">notifications_off</span>
          </div>
          <h3 className="text-lg font-bold text-[var(--text-on-surface)] mb-2">No new notifications</h3>
          <p className="text-sm text-[var(--text-on-surface-variant)] max-w-md">
            You don't have any pending invitations right now.
          </p>
        </div>
      ) : (
        <div className="bg-[var(--bg-surface-container-lowest)] rounded-2xl border border-[var(--border-outline-variant)] overflow-hidden">
          <div className="p-4 border-b border-[var(--border-outline-variant)] bg-[var(--bg-surface-container-low)]">
             <h2 className="text-sm font-bold text-[var(--text-on-surface)]">Workspace Invitations ({invites.length})</h2>
          </div>
          <div className="divide-y divide-[var(--border-outline-variant)]">
            {invites.map((invite) => (
              <div key={invite.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 hover:bg-[var(--bg-surface-container-high)]/30 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-primary-fixed)] text-[var(--color-primary)] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined">mark_email_unread</span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-[var(--text-on-surface)]">
                      You've been invited to join <span className="font-extrabold">{invite.workspaceName}</span>
                    </h3>
                    {invite.workspaceDescription && (
                      <p className="text-xs text-[var(--text-on-surface-variant)] mt-1 max-w-xl">
                        {invite.workspaceDescription}
                      </p>
                    )}
                    <p className="text-[10px] text-[var(--text-on-surface-variant)] mt-2">
                      Role: <span className="font-semibold">{invite.role === 'SUPER_ADMIN' ? 'Super Admin' : 'User'}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-start sm:self-center ml-14 sm:ml-0">
                  <button
                    onClick={() => handleDeclineInvite(invite.id)}
                    disabled={isProcessingInvite !== null}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[var(--text-on-surface-variant)] hover:bg-[var(--bg-surface-container-highest)] hover:text-rose-500 transition-colors disabled:opacity-50"
                  >
                    Decline
                  </button>
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
    </div>
  );
};
