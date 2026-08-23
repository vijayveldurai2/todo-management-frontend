import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiService } from '../../services/apiService';
import { WorkspaceMember } from '../../types';
import { useAppDispatch, useAppSelector } from '../../store';
import { setInviteMemberModalOpen } from '../../store/uiSlice';
import { InviteMemberModal } from '../modals/InviteMemberModal';

export const WorkspaceMembers: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { workspaceSlug } = useParams<{ workspaceSlug: string }>();
  
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [processingId, setProcessingId] = useState<string | null>(null);

  const isSuperAdmin = members.some(m => m.userId === user?.id && m.role === 'SUPER_ADMIN');

  const loadMembers = async () => {
    if (!workspaceSlug) return;
    setIsLoading(true);
    setError(null);
    try {
      // First resolve slug to ID
      const ws = await apiService.getWorkspaceBySlug(workspaceSlug);
      setWorkspaceId(ws.id);
      
      // Fetch members and invites concurrently
      const [membersData, invitesData] = await Promise.all([
        apiService.getWorkspaceMembers(ws.id),
        apiService.getWorkspaceInvites(ws.id)
      ]);
      setMembers(membersData);
      setPendingInvites(invitesData);
    } catch (err: any) {
      console.error('Failed to load members:', err);
      setError('Unable to load workspace members. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [workspaceSlug]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!workspaceId) return;
    setProcessingId(`role-${userId}`);
    try {
      await apiService.updateWorkspaceMemberRole(workspaceId, userId, newRole);
      setMembers(prev => prev.map(m => m.userId === userId ? { ...m, role: newRole as any } : m));
    } catch (err: any) {
      alert(err.message || 'Failed to update role');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!workspaceId) return;
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    setProcessingId(`remove-${userId}`);
    try {
      await apiService.removeWorkspaceMember(workspaceId, userId);
      setMembers(prev => prev.filter(m => m.userId !== userId));
    } catch (err: any) {
      alert(err.message || 'Failed to remove member');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRevokeInvite = async (inviteId: string) => {
    if (!window.confirm('Are you sure you want to revoke this invitation?')) return;
    setProcessingId(`revoke-${inviteId}`);
    try {
      await apiService.revokeInvite(inviteId);
      setPendingInvites(prev => prev.filter(i => i.id !== inviteId));
    } catch (err: any) {
      alert(err.message || 'Failed to revoke invite');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-on-surface)]">Workspace Members</h2>
          <p className="text-xs text-[var(--text-on-surface-variant)] mt-1">
            People who have access to this workspace and its projects.
          </p>
        </div>
        
        <button
          onClick={() => dispatch(setInviteMemberModalOpen(true))}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-primary)] text-white font-semibold text-xs shadow-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer shrink-0"
        >
          <span className="material-symbols-outlined text-base">person_add</span>
          <span>Invite Members</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-[var(--bg-surface-container-lowest)] rounded-2xl border border-[var(--border-outline-variant)] overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-sm font-semibold text-[var(--text-on-surface-variant)]">Loading members...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mb-4 text-rose-500">
              <span className="material-symbols-outlined">error</span>
            </div>
            <h3 className="text-sm font-bold text-[var(--text-on-surface)] mb-1">Error Loading Members</h3>
            <p className="text-xs text-[var(--text-on-surface-variant)] mb-4">{error}</p>
            <button 
              onClick={loadMembers}
              className="px-4 py-2 bg-[var(--bg-surface-container-high)] hover:bg-[var(--bg-surface-container-highest)] rounded-xl text-xs font-semibold text-[var(--text-on-surface)] transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--bg-surface-container-high)] flex items-center justify-center mb-4 text-[var(--text-on-surface-variant)]">
              <span className="material-symbols-outlined text-3xl">group</span>
            </div>
            <h3 className="text-sm font-bold text-[var(--text-on-surface)] mb-1">No members found</h3>
            <p className="text-xs text-[var(--text-on-surface-variant)]">
              There are currently no members in this workspace. (This shouldn't happen!)
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-outline-variant)] bg-[var(--bg-surface-container-low)]">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[var(--text-on-surface-variant)]">Member</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[var(--text-on-surface-variant)]">Role</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[var(--text-on-surface-variant)]">Status</th>
                  {isSuperAdmin && (
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[var(--text-on-surface-variant)] text-right">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-outline-variant)]">
                {members.map((member) => (
                  <tr key={member.id || member.userId} className="hover:bg-[var(--bg-surface-container-high)]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] text-white font-bold flex items-center justify-center shrink-0 text-sm">
                          {member.userName ? member.userName.substring(0, 2).toUpperCase() : member.userEmail.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-sm text-[var(--text-on-surface)] truncate flex items-center gap-2">
                            {member.userName || 'Unknown User'}
                            {member.userId === user?.id && (
                              <span className="px-1.5 py-0.5 bg-[var(--bg-surface-container-highest)] text-[var(--text-on-surface-variant)] text-[10px] rounded uppercase font-bold">You</span>
                            )}
                          </span>
                          <span className="text-xs text-[var(--text-on-surface-variant)] truncate">
                            {member.userEmail}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {isSuperAdmin && member.userId !== user?.id ? (
                        <select
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.userId, e.target.value)}
                          disabled={processingId === `role-${member.userId}`}
                          className="bg-[var(--bg-surface-container-highest)] border border-[var(--border-outline-variant)] text-[var(--text-on-surface)] text-xs rounded-lg px-2 py-1 outline-none focus:border-[var(--color-primary)] disabled:opacity-50 cursor-pointer"
                        >
                          <option value="USER">User</option>
                          <option value="SUPER_ADMIN">Super Admin</option>
                        </select>
                      ) : (
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          member.role === 'SUPER_ADMIN' 
                            ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                            : 'bg-[var(--bg-surface-container-highest)] text-[var(--text-on-surface)] border border-[var(--border-outline-variant)]'
                        }`}>
                          {member.role === 'SUPER_ADMIN' ? 'Super Admin' : 'User'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {member.status !== 'ACTIVE' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-lg">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Active
                        </span>
                      )}
                    </td>
                    {isSuperAdmin && (
                      <td className="px-6 py-4 text-right">
                        {member.userId !== user?.id && (
                          <button
                            onClick={() => handleRemoveMember(member.userId)}
                            disabled={processingId === `remove-${member.userId}`}
                            className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 p-1.5 rounded-lg transition-colors disabled:opacity-50"
                            title="Remove Member"
                          >
                            <span className="material-symbols-outlined text-[20px]">person_remove</span>
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pending Invites Section */}
      {pendingInvites.length > 0 && (
        <div className="bg-[var(--bg-surface-container-lowest)] rounded-2xl border border-[var(--border-outline-variant)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--border-outline-variant)] bg-[var(--color-primary-fixed)]/5 flex justify-between items-center">
            <h3 className="text-sm font-bold text-[var(--color-primary)] flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">forward_to_inbox</span>
              Pending Invitations
            </h3>
            <span className="px-2 py-0.5 bg-[var(--color-primary)] text-white text-[10px] font-bold rounded-full">
              {pendingInvites.length}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-outline-variant)] bg-[var(--bg-surface-container-low)]">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[var(--text-on-surface-variant)]">Email</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[var(--text-on-surface-variant)]">Invited Role</th>
                  {isSuperAdmin && (
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[var(--text-on-surface-variant)] text-right">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-outline-variant)]">
                {pendingInvites.map((invite) => (
                  <tr key={invite.id} className="hover:bg-[var(--bg-surface-container-high)]/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-[var(--text-on-surface)]">{invite.email}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-[var(--text-on-surface-variant)]">
                        {invite.role === 'SUPER_ADMIN' ? 'Super Admin' : 'User'}
                      </span>
                    </td>
                    {isSuperAdmin && (
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleRevokeInvite(invite.id)}
                          disabled={processingId === `revoke-${invite.id}`}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-500 hover:bg-rose-500/10 border border-rose-500/20 transition-colors disabled:opacity-50"
                        >
                          Revoke
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invite Modal rendered here for context, or could be in App.tsx */}
      <InviteMemberModal onInvitesSent={loadMembers} />
    </div>
  );
};
