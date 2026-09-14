import React from 'react';
import { useParams } from 'react-router-dom';
import { useAppSelector } from '../../../app/store';
import { useGetWorkspaceMembersQuery, useChangeWorkspaceMemberRoleMutation, useRemoveWorkspaceMemberMutation } from '../../../services/memberApi';
import { useGetWorkspaceBySlugQuery } from '../../../services/workspaceApi';

export const WorkspaceMembersTab: React.FC = () => {
  const { workspaceSlug = 'main-workspace' } = useParams<{ workspaceSlug: string }>();
  
  const { data: workspace, isLoading: isWorkspaceLoading } = useGetWorkspaceBySlugQuery(workspaceSlug);
  const workspaceId = workspace?.id || '';

  const { data: members = [], isLoading: isMembersLoading } = useGetWorkspaceMembersQuery(workspaceId, { skip: !workspaceId });
  const [changeRole] = useChangeWorkspaceMemberRoleMutation();
  const [removeMember] = useRemoveWorkspaceMemberMutation();
  const { user } = useAppSelector((state) => state.auth);

  // Deriving isAdmin for gating actions (BR-6)
  const isWorkspaceAdmin = members.some(m => m.userId === user?.id && m.role === 'SUPER_ADMIN');

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await changeRole({ workspaceId, userId, role: newRole }).unwrap();
    } catch (error) {
      console.error('Failed to change role', error);
    }
  };

  const handleRemove = async (userId: string) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    try {
      await removeMember({ workspaceId, userId }).unwrap();
    } catch (error) {
      console.error('Failed to remove member', error);
    }
  };

  if (isWorkspaceLoading || isMembersLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-surface-container-lowest)] border border-[var(--border-outline-variant)] rounded-2xl overflow-hidden animate-in fade-in">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-[var(--text-on-surface)]">
          <thead className="bg-[var(--bg-surface-container-low)] text-xs uppercase font-bold text-[var(--text-on-surface-variant)] border-b border-[var(--border-outline-variant)]">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              {isWorkspaceAdmin && <th className="px-6 py-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-outline-variant)]">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-[var(--bg-surface-container-low)] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] text-white text-xs font-bold flex items-center justify-center">
                      {member.userName?.slice(0, 2).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-semibold">{member.userName}</p>
                      <p className="text-xs text-[var(--text-on-surface-variant)]">{member.userEmail}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {isWorkspaceAdmin && member.userId !== user?.id ? (
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.userId, e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-[var(--bg-surface-container-high)] border border-[var(--border-outline-variant)] text-xs font-semibold outline-none focus:border-[var(--color-primary)] cursor-pointer"
                    >
                      <option value="USER">USER</option>
                      <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                    </select>
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg bg-[var(--bg-surface-container-high)] text-xs font-bold">
                      {member.role}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Active
                  </span>
                </td>
                {isWorkspaceAdmin && (
                  <td className="px-6 py-4 text-right">
                    {member.userId !== user?.id && (
                      <button
                        onClick={() => handleRemove(member.userId)}
                        className="p-1.5 rounded-lg text-[var(--text-on-surface-variant)] hover:bg-rose-500/10 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Remove member"
                      >
                        <span className="material-symbols-outlined text-base">person_remove</span>
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
