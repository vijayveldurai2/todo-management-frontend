import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { setCreateBoardModalOpen } from '../../store/uiSlice';
import {
  fetchBoards,
  fetchProjectDetails,
  fetchProjectMembers,
  fetchProjectRoles,
  updateProject,
  archiveProject,
  createProjectRole,
  updateProjectRole,
  deleteProjectRole,
  addProjectMember,
  updateProjectMemberRole,
  removeProjectMember,
  selectIsProjectAdmin,
  selectIsProjectMember,
  clearCurrentProject,
} from '../../store/projectsSlice';
import { BoardType, Project, Board, ProjectMember, ProjectRole, ProjectStatus } from '../../types';
import { apiService } from '../../services/apiService';

const STATUS_OPTIONS: ProjectStatus[] = ['ACTIVE', 'COMPLETED', 'ARCHIVED'];
const STATUS_BADGE: Record<string, string> = {
  ACTIVE: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20',
  ARCHIVED: 'bg-slate-500/10 text-slate-500 border border-slate-500/20',
  COMPLETED: 'bg-sky-500/10 text-sky-600 border border-sky-500/20',
};
const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Active',
  ARCHIVED: 'Archived',
  COMPLETED: 'Completed',
};

function boardTypeIcon(type?: BoardType) {
  switch (type) {
    case 'Sprint': return 'directions_run';
    case 'List': return 'format_list_bulleted';
    case 'Calendar': return 'calendar_month';
    default: return 'view_kanban';
  }
}
function boardTypeColor(type?: BoardType) {
  switch (type) {
    case 'Sprint': return 'bg-amber-500/10 text-amber-600 border-amber-500/30';
    case 'List': return 'bg-indigo-500/10 text-indigo-600 border-indigo-500/30';
    case 'Calendar': return 'bg-violet-500/10 text-violet-600 border-violet-500/30';
    default: return 'bg-sky-500/10 text-sky-600 border-sky-500/30';
  }
}

// ─── Roles panel ────────────────────────────────────────────────────────────

const RolesPanel: React.FC<{ projectSlug: string; userId: string }> = ({ projectSlug, userId }) => {
  const dispatch = useAppDispatch();
  const { projectRoles: roles, isRolesLoading } = useAppSelector((s) => s.projects);

  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleIsAdmin, setNewRoleIsAdmin] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editIsAdmin, setEditIsAdmin] = useState(false);
  const [deleteErrors, setDeleteErrors] = useState<Record<string, string>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!newRoleName.trim()) return;
    setProcessingId('new');
    try {
      await dispatch(createProjectRole({ projectSlug, userId, data: { name: newRoleName.trim(), isAdmin: newRoleIsAdmin } })).unwrap();
      setNewRoleName('');
      setNewRoleIsAdmin(false);
    } catch (e: any) {
      alert(e.message || 'Failed to create role');
    } finally {
      setProcessingId(null);
    }
  };

  const startEdit = (role: ProjectRole) => {
    setEditingId(role.id);
    setEditName(role.name);
    setEditIsAdmin(role.isAdmin);
  };

  const handleUpdate = async (roleId: string) => {
    setProcessingId(roleId);
    try {
      await dispatch(updateProjectRole({ projectSlug, userId, roleId, data: { name: editName.trim(), isAdmin: editIsAdmin } })).unwrap();
      setEditingId(null);
    } catch (e: any) {
      alert(e.message || 'Failed to update role');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (roleId: string) => {
    setDeleteErrors((prev) => ({ ...prev, [roleId]: '' }));
    setProcessingId(roleId);
    try {
      await dispatch(deleteProjectRole({ projectSlug, userId, roleId })).unwrap();
    } catch (e: any) {
      setDeleteErrors((prev) => ({ ...prev, [roleId]: e.message || 'Failed to delete role' }));
    } finally {
      setProcessingId(null);
    }
  };

  if (isRolesLoading) {
    return (
      <div className="flex items-center gap-2 py-8 justify-center text-[var(--text-on-surface-variant)] text-sm">
        <div className="w-4 h-4 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
        Loading roles…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Existing roles */}
      <div className="space-y-2">
        {roles.map((role) => (
          <div key={role.id} className="rounded-xl border border-[var(--border-outline-variant)] bg-[var(--bg-surface-container-low)] p-3">
            {editingId === role.id ? (
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 min-w-[120px] px-3 py-1.5 rounded-lg bg-[var(--bg-surface-container-high)] border border-[var(--border-outline-variant)] text-sm text-[var(--text-on-surface)] outline-none focus:border-[var(--color-primary)]"
                />
                <label className="flex items-center gap-1.5 text-xs text-[var(--text-on-surface-variant)] cursor-pointer">
                  <input type="checkbox" checked={editIsAdmin} onChange={(e) => setEditIsAdmin(e.target.checked)} className="accent-[var(--color-primary)]" />
                  Admin
                </label>
                <button
                  onClick={() => handleUpdate(role.id)}
                  disabled={processingId === role.id}
                  className="px-3 py-1.5 rounded-lg bg-[var(--color-primary)] text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50 cursor-pointer"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="px-3 py-1.5 rounded-lg bg-[var(--bg-surface-container-high)] text-[var(--text-on-surface)] text-xs font-semibold hover:bg-[var(--bg-surface-container-highest)] cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[var(--text-on-surface)]">{role.name}</span>
                  {role.isAdmin && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                      Admin
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => startEdit(role)}
                    className="p-1.5 rounded-lg hover:bg-[var(--bg-surface-container-high)] text-[var(--text-on-surface-variant)] transition-colors cursor-pointer"
                    title="Edit role"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(role.id)}
                    disabled={processingId === role.id}
                    className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-500 transition-colors disabled:opacity-50 cursor-pointer"
                    title="Delete role"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            )}
            {/* Inline delete error */}
            {deleteErrors[role.id] && (
              <p className="mt-2 text-xs text-rose-600 bg-rose-500/10 px-3 py-2 rounded-lg border border-rose-500/20 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">warning</span>
                {deleteErrors[role.id]}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Create role row */}
      <div className="flex items-center gap-2 flex-wrap p-3 rounded-xl border border-dashed border-[var(--border-outline-variant)] bg-[var(--bg-surface-container-lowest)]">
        <input
          value={newRoleName}
          onChange={(e) => setNewRoleName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          placeholder="New role name…"
          className="flex-1 min-w-[140px] px-3 py-1.5 rounded-lg bg-[var(--bg-surface-container-high)] border border-[var(--border-outline-variant)] text-sm text-[var(--text-on-surface)] outline-none focus:border-[var(--color-primary)] placeholder:text-[var(--text-on-surface-variant)]"
        />
        <label className="flex items-center gap-1.5 text-xs text-[var(--text-on-surface-variant)] cursor-pointer shrink-0">
          <input type="checkbox" checked={newRoleIsAdmin} onChange={(e) => setNewRoleIsAdmin(e.target.checked)} className="accent-[var(--color-primary)]" />
          Admin
        </label>
        <button
          onClick={handleCreate}
          disabled={!newRoleName.trim() || processingId === 'new'}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-primary)] text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50 cursor-pointer"
        >
          {processingId === 'new' ? (
            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <span className="material-symbols-outlined text-sm">add</span>
          )}
          Add Role
        </button>
      </div>
    </div>
  );
};

// ─── Members panel ───────────────────────────────────────────────────────────

const MembersPanel: React.FC<{
  projectSlug: string;
  userId: string;
  isAdmin: boolean;
  workspaceId: string | null;
}> = ({ projectSlug, userId, isAdmin, workspaceId }) => {
  const dispatch = useAppDispatch();
  const { projectMembers: members, projectRoles: roles, isMembersLoading } = useAppSelector((s) => s.projects);
  const [workspaceMembers, setWorkspaceMembers] = useState<any[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);

  // Fetch workspace members for the picker (only when admin opens picker)
  useEffect(() => {
    if (pickerOpen && workspaceId) {
      apiService.getWorkspaceMembers(workspaceId).then(setWorkspaceMembers).catch(() => {});
    }
  }, [pickerOpen, workspaceId]);

  // Eligible workspace members not already in the project
  const eligibleMembers = workspaceMembers.filter(
    (wm: any) => !members.some((pm) => pm.userId === wm.userId)
  );

  const roleName = (roleId?: string) => roles.find((r) => r.id === roleId)?.name || 'Member';

  const handleAdd = async () => {
    if (!selectedUserId) return;
    setAddError(null);
    setProcessingId('add');
    try {
      await dispatch(
        addProjectMember({ projectSlug, userId, data: { userId: selectedUserId, roleId: selectedRoleId || undefined } })
      ).unwrap();
      setPickerOpen(false);
      setSelectedUserId('');
      setSelectedRoleId('');
    } catch (e: any) {
      setAddError(e.message || 'Failed to add member');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRoleChange = async (targetUserId: string, roleId: string) => {
    setProcessingId(`role-${targetUserId}`);
    try {
      await dispatch(updateProjectMemberRole({ projectSlug, userId, targetUserId, data: { roleId } })).unwrap();
    } catch (e: any) {
      alert(e.message || 'Failed to update role');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRemove = async (targetUserId: string) => {
    if (!window.confirm('Remove this member from the project?')) return;
    setProcessingId(`remove-${targetUserId}`);
    try {
      await dispatch(removeProjectMember({ projectSlug, userId, targetUserId })).unwrap();
    } catch (e: any) {
      alert(e.message || 'Failed to remove member');
    } finally {
      setProcessingId(null);
    }
  };

  if (isMembersLoading) {
    return (
      <div className="flex items-center gap-2 py-8 justify-center text-[var(--text-on-surface-variant)] text-sm">
        <div className="w-4 h-4 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
        Loading members…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add member */}
      {isAdmin && (
        <div>
          {!pickerOpen ? (
            <button
              onClick={() => setPickerOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white text-xs font-semibold hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">person_add</span>
              Add Member
            </button>
          ) : (
            <div className="p-4 rounded-xl border border-[var(--border-outline-variant)] bg-[var(--bg-surface-container-low)] space-y-3">
              <p className="text-xs font-bold text-[var(--text-on-surface)]">Add workspace member</p>
              <div className="flex gap-2 flex-wrap">
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="flex-1 min-w-[180px] px-3 py-2 rounded-lg bg-[var(--bg-surface-container-high)] border border-[var(--border-outline-variant)] text-sm text-[var(--text-on-surface)] outline-none focus:border-[var(--color-primary)] cursor-pointer"
                >
                  <option value="">Select workspace member…</option>
                  {eligibleMembers.map((wm: any) => (
                    <option key={wm.userId} value={wm.userId}>
                      {wm.userName || wm.userEmail}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-[var(--bg-surface-container-high)] border border-[var(--border-outline-variant)] text-sm text-[var(--text-on-surface)] outline-none focus:border-[var(--color-primary)] cursor-pointer"
                >
                  <option value="">Default role (Member)</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              {addError && (
                <p className="text-xs text-rose-600 bg-rose-500/10 px-3 py-2 rounded-lg border border-rose-500/20">
                  {addError}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  disabled={!selectedUserId || processingId === 'add'}
                  className="px-4 py-1.5 rounded-lg bg-[var(--color-primary)] text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {processingId === 'add' && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  Confirm
                </button>
                <button
                  onClick={() => { setPickerOpen(false); setAddError(null); setSelectedUserId(''); setSelectedRoleId(''); }}
                  className="px-4 py-1.5 rounded-lg bg-[var(--bg-surface-container-high)] text-[var(--text-on-surface)] text-xs font-semibold hover:bg-[var(--bg-surface-container-highest)] cursor-pointer"
                >
                  Cancel
                </button>
              </div>
              {eligibleMembers.length === 0 && (
                <p className="text-xs text-[var(--text-on-surface-variant)]">All workspace members are already in this project.</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Members table */}
      <div className="bg-[var(--bg-surface-container-lowest)] rounded-xl border border-[var(--border-outline-variant)] overflow-hidden">
        {members.length === 0 ? (
          <div className="py-12 flex flex-col items-center text-center text-[var(--text-on-surface-variant)]">
            <span className="material-symbols-outlined text-3xl mb-2">group</span>
            <p className="text-sm">No members yet.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-outline-variant)] bg-[var(--bg-surface-container-low)]">
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-[var(--text-on-surface-variant)]">Member</th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-[var(--text-on-surface-variant)]">Role</th>
                {isAdmin && <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-[var(--text-on-surface-variant)] text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-outline-variant)]">
              {members.map((m) => (
                <tr key={m.userId} className="hover:bg-[var(--bg-surface-container-high)]/40 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] text-white font-bold flex items-center justify-center text-xs shrink-0">
                        {(m.userName || m.userEmail || 'U').substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--text-on-surface)]">{m.userName || '—'}</p>
                        <p className="text-xs text-[var(--text-on-surface-variant)]">{m.userEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    {isAdmin && m.userId !== userId ? (
                      <select
                        value={m.roleId || ''}
                        onChange={(e) => handleRoleChange(m.userId, e.target.value)}
                        disabled={processingId === `role-${m.userId}`}
                        className="bg-[var(--bg-surface-container-highest)] border border-[var(--border-outline-variant)] text-[var(--text-on-surface)] text-xs rounded-lg px-2 py-1 outline-none focus:border-[var(--color-primary)] disabled:opacity-50 cursor-pointer"
                      >
                        {roles.map((r) => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-xs text-[var(--text-on-surface-variant)] font-medium">{roleName(m.roleId)}</span>
                    )}
                  </td>
                  {isAdmin && (
                    <td className="px-5 py-3 text-right">
                      {m.userId !== userId && (
                        <button
                          onClick={() => handleRemove(m.userId)}
                          disabled={processingId === `remove-${m.userId}`}
                          className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-500 transition-colors disabled:opacity-50 cursor-pointer"
                          title="Remove from project"
                        >
                          <span className="material-symbols-outlined text-[18px]">person_remove</span>
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// ─── Main view ───────────────────────────────────────────────────────────────

type ProjectTab = 'boards' | 'members' | 'roles';

export const ProjectDetailsView: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { workspaceSlug = 'main-workspace', projectSlug } = useParams<{
    workspaceSlug: string;
    projectSlug: string;
  }>();

  const { user } = useAppSelector((s) => s.auth);
  const {
    currentProject,
    isProjectDetailLoading,
    projectDetailError,
    projectMembers,
    projectRoles,
    boards,
  } = useAppSelector((s) => s.projects);

  const [activeTab, setActiveTab] = useState<ProjectTab>('boards');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editStatus, setEditStatus] = useState<string>('ACTIVE');
  const [editSaving, setEditSaving] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);

  // Resolve workspace ID for the members panel picker
  useEffect(() => {
    if (!workspaceSlug) return;
    apiService.getWorkspaceBySlug(workspaceSlug).then((ws) => setWorkspaceId(ws.id)).catch(() => {});
  }, [workspaceSlug]);

  // Fetch project details
  useEffect(() => {
    if (workspaceSlug && projectSlug) {
      dispatch(fetchProjectDetails({ workspaceSlug, projectSlug, userId: user?.id }));
    }
    return () => { dispatch(clearCurrentProject()); };
  }, [workspaceSlug, projectSlug, user?.id, dispatch]);

  // Fetch roles/members for this project
  useEffect(() => {
    if (projectSlug && user?.id) {
      dispatch(fetchProjectMembers({ projectSlug, userId: user.id }));
      dispatch(fetchProjectRoles({ projectSlug, userId: user.id }));
    }
  }, [projectSlug, user?.id, dispatch]);

  const isMember = selectIsProjectMember(user?.id, projectMembers);
  const isAdmin = selectIsProjectAdmin(user?.id, projectMembers, projectRoles);

  // Fetch boards
  useEffect(() => {
    if (workspaceSlug && projectSlug) {
      apiService.getBoards(workspaceSlug, projectSlug).then((bList) => {
        dispatch(fetchBoards.fulfilled(bList, '', undefined));
      }).catch(() => {});
    }
  }, [workspaceSlug, projectSlug, dispatch]);

  const startEdit = () => {
    if (!currentProject) return;
    setEditName(currentProject.name);
    setEditDesc(currentProject.description);
    setEditStatus(currentProject.status || 'ACTIVE');
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!workspaceSlug || !projectSlug || !user?.id) return;
    setEditSaving(true);
    try {
      await dispatch(
        updateProject({
          workspaceSlug,
          projectSlug,
          userId: user.id,
          data: { name: editName, description: editDesc, status: editStatus },
        })
      ).unwrap();
      setIsEditing(false);
    } catch (e: any) {
      alert(e.message || 'Failed to update project');
    } finally {
      setEditSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!workspaceSlug || !projectSlug || !user?.id) return;
    if (!window.confirm('Archive this project? It will be marked ARCHIVED.')) return;
    setArchiving(true);
    try {
      await dispatch(archiveProject({ workspaceSlug, projectSlug, userId: user.id })).unwrap();
    } catch (e: any) {
      alert(e.message || 'Failed to archive project');
    } finally {
      setArchiving(false);
    }
  };

  if (isProjectDetailLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 text-[var(--text-on-surface-variant)]">
        <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold">Loading project…</span>
      </div>
    );
  }

  if (projectDetailError || !currentProject) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 rounded-full bg-rose-500/10 flex items-center justify-center mb-4 text-rose-500">
          <span className="material-symbols-outlined text-3xl">error</span>
        </div>
        <h2 className="text-lg font-bold text-[var(--text-on-surface)] mb-1">Project not found</h2>
        <p className="text-sm text-[var(--text-on-surface-variant)]">{projectDetailError || 'This project may have been removed.'}</p>
        <button onClick={() => navigate(`/${workspaceSlug}`)} className="mt-6 px-4 py-2 rounded-xl bg-[var(--bg-surface-container-high)] text-sm font-semibold cursor-pointer hover:bg-[var(--bg-surface-container-highest)]">
          Back to workspace
        </button>
      </div>
    );
  }

  const p = currentProject;
  const statusKey = (p.status || 'ACTIVE').toUpperCase();
  const codeDisplay = p.prefixCode || p.prefix || '';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[var(--text-on-surface-variant)]">
        <button onClick={() => navigate(`/${workspaceSlug}`)} className="hover:text-[var(--color-primary)] cursor-pointer">
          Workspace
        </button>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="font-semibold text-[var(--text-on-surface)]">{p.name}</span>
      </div>

      {/* Project Header Banner */}
      <div className="rounded-2xl bg-[var(--bg-surface-container-low)] border border-[var(--border-outline-variant)] overflow-hidden">
        {/* Colour bar */}
        <div className="h-1.5" style={{ backgroundColor: p.color || 'var(--color-primary)' }} />

        <div className="p-6">
          {isEditing ? (
            /* Edit form */
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-on-surface-variant)] mb-1 block">Name</label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface-container-high)] border border-[var(--border-outline-variant)] text-[var(--text-on-surface)] outline-none focus:border-[var(--color-primary)]"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-on-surface-variant)] mb-1 block">Description</label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface-container-high)] border border-[var(--border-outline-variant)] text-[var(--text-on-surface)] outline-none focus:border-[var(--color-primary)] resize-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-on-surface-variant)] mb-1 block">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface-container-high)] border border-[var(--border-outline-variant)] text-[var(--text-on-surface)] outline-none focus:border-[var(--color-primary)] cursor-pointer"
                >
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSaveEdit}
                  disabled={editSaving}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50 cursor-pointer"
                >
                  {editSaving && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  Save Changes
                </button>
                <button onClick={() => setIsEditing(false)} className="px-4 py-2 rounded-xl bg-[var(--bg-surface-container-high)] text-[var(--text-on-surface)] text-xs font-semibold hover:bg-[var(--bg-surface-container-highest)] cursor-pointer">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* Read view */
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  {p.category && (
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded text-white"
                      style={{ backgroundColor: p.color || 'var(--color-primary)' }}
                    >
                      {p.category}
                    </span>
                  )}
                  {codeDisplay && (
                    <span className="text-[10px] font-mono bg-[var(--bg-surface-container-high)] text-[var(--text-on-surface-variant)] px-2 py-0.5 rounded border border-[var(--border-outline-variant)]">
                      {codeDisplay}
                    </span>
                  )}
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${STATUS_BADGE[statusKey] || STATUS_BADGE.ACTIVE}`}>
                    {STATUS_LABELS[statusKey] || 'Active'}
                  </span>
                </div>
                <h1 className="text-2xl font-extrabold text-[var(--text-on-surface)] mb-1">{p.name}</h1>
                {p.description && (
                  <p className="text-sm text-[var(--text-on-surface-variant)] leading-relaxed max-w-2xl">{p.description}</p>
                )}
              </div>

              {/* Admin actions */}
              {isAdmin && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={startEdit}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--bg-surface-container-high)] text-[var(--text-on-surface)] text-xs font-semibold hover:bg-[var(--bg-surface-container-highest)] transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                    Edit
                  </button>
                  {p.status !== 'ARCHIVED' && (
                    <button
                      onClick={handleArchive}
                      disabled={archiving}
                      className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20 text-xs font-semibold hover:bg-amber-500/20 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {archiving ? <div className="w-3.5 h-3.5 border-2 border-amber-600/30 border-t-amber-600 rounded-full animate-spin" /> : <span className="material-symbols-outlined text-sm">archive</span>}
                      Archive
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 border-t border-[var(--border-outline-variant)] pt-4 mt-5 text-xs font-semibold flex-wrap">
            <button
              onClick={() => setActiveTab('boards')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'boards'
                  ? 'bg-[var(--color-primary-fixed)] text-[var(--color-primary)] dark:bg-[var(--color-primary)] dark:text-white'
                  : 'text-[var(--text-on-surface-variant)] hover:bg-[var(--bg-surface-container-high)]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">dashboard</span>
              Boards ({boards.length})
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'members'
                  ? 'bg-[var(--color-primary-fixed)] text-[var(--color-primary)] dark:bg-[var(--color-primary)] dark:text-white'
                  : 'text-[var(--text-on-surface-variant)] hover:bg-[var(--bg-surface-container-high)]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">group</span>
              Members ({projectMembers.length})
            </button>
            {isAdmin && (
              <button
                onClick={() => setActiveTab('roles')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'roles'
                    ? 'bg-[var(--color-primary-fixed)] text-[var(--color-primary)] dark:bg-[var(--color-primary)] dark:text-white'
                    : 'text-[var(--text-on-surface-variant)] hover:bg-[var(--bg-surface-container-high)]'
                }`}
              >
                <span className="material-symbols-outlined text-sm">shield</span>
                Roles ({projectRoles.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'boards' && (
        <div>
          {isAdmin && (
            <div className="flex justify-end mb-4">
              <button
                onClick={() => dispatch(setCreateBoardModalOpen(true))}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-primary)] text-white font-semibold text-xs shadow-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">add</span>
                New Board
              </button>
            </div>
          )}
          {boards.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center bg-[var(--bg-surface-container-lowest)] rounded-2xl border border-[var(--border-outline-variant)] border-dashed">
              <div className="w-14 h-14 bg-[var(--bg-surface-container-high)] rounded-full flex items-center justify-center mb-4 text-[var(--text-on-surface-variant)]">
                <span className="material-symbols-outlined text-3xl">dashboard</span>
              </div>
              <h3 className="text-base font-bold text-[var(--text-on-surface)] mb-2">No boards yet</h3>
              {isAdmin && (
                <button onClick={() => dispatch(setCreateBoardModalOpen(true))} className="mt-2 text-xs font-semibold text-[var(--color-primary)] hover:underline cursor-pointer">
                  Create your first board
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {boards.map((board) => (
                <div
                  key={board.id}
                  onClick={() => navigate(`/${workspaceSlug}/${projectSlug}/${board.slug || board.id}`)}
                  className="p-5 rounded-2xl bg-[var(--bg-surface-container-lowest)] border border-[var(--border-outline-variant)] hover:border-[var(--color-primary)] shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1 ${boardTypeColor(board.type)}`}>
                        <span className="material-symbols-outlined text-xs">{boardTypeIcon(board.type)}</span>
                        {board.type || 'Board'}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[var(--text-on-surface)] group-hover:text-[var(--color-primary)] transition-colors mb-1">
                      {board.title}
                    </h3>
                    {board.type === 'Sprint' && board.goal && (
                      <p className="text-xs text-[var(--text-on-surface-variant)] line-clamp-2 mt-2 leading-relaxed">{board.goal}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between border-t border-[var(--border-outline-variant)] pt-3 mt-4 text-xs">
                    <span className="text-[var(--text-on-surface-variant)] font-semibold">{board.cardsCount || 0} tasks</span>
                    <span className="text-[var(--color-primary)] font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Open <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'members' && projectSlug && user?.id && (
        <MembersPanel
          projectSlug={projectSlug}
          userId={user.id}
          isAdmin={isAdmin}
          workspaceId={workspaceId}
        />
      )}

      {activeTab === 'roles' && isAdmin && projectSlug && user?.id && (
        <RolesPanel projectSlug={projectSlug} userId={user.id} />
      )}
    </div>
  );
};
