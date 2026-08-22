import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { setCreateProjectModalOpen } from '../../store/uiSlice';
import { createProject } from '../../store/projectsSlice';
import { apiService } from '../../services/apiService';
import { RoleBadge } from '../common/RoleBadge';

interface ProjectMemberItem {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  initials?: string;
}

export const CreateProjectModal: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { workspaceSlug = 'main-workspace' } = useParams<{ workspaceSlug: string }>();
  const { isCreateProjectModalOpen } = useAppSelector((state) => state.ui);
  const { user } = useAppSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState<'general' | 'members'>('general');

  // Form State
  const [name, setName] = useState('');
  const [prefix, setPrefix] = useState('');
  const [prefixError, setPrefixError] = useState('');
  const [isPrefixEdited, setIsPrefixEdited] = useState(false);
  const [category, setCategory] = useState('DESIGN');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState('#3525cd');
  const [selectedIcon, setSelectedIcon] = useState('palette');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { projects: existingProjects } = useAppSelector((state) => state.projects);

  const generateSuggestedPrefix = (projectName: string): string => {
    if (!projectName.trim()) return '';
    const clean = projectName.trim().replace(/[^a-zA-Z0-9\s]/g, '');
    const words = clean.split(/\s+/).filter(Boolean);
    let code = '';
    if (words.length >= 2) {
      code = words.map((w) => w[0]).join('').toUpperCase();
    } else if (words.length === 1) {
      const w = words[0].toUpperCase();
      code = w.length >= 2 ? w.slice(0, 2) : w + 'X';
    }
    code = code.replace(/[^A-Z0-9]/g, '');
    if (code.length < 2) code = (code + 'PR').slice(0, 2);
    return code.slice(0, 6);
  };

  const validatePrefix = (value: string): boolean => {
    const clean = value.toUpperCase().trim();
    if (!clean) {
      setPrefixError('Project code is required.');
      return false;
    }
    if (!/^[A-Z0-9]{2,6}$/.test(clean)) {
      setPrefixError('Must be 2–6 uppercase letters or numbers.');
      return false;
    }
    const isTaken = existingProjects.some(
      (p) => (p.prefix?.toUpperCase() === clean || p.prefixCode?.toUpperCase() === clean)
    );
    if (isTaken) {
      setPrefixError(`${clean} is already used by another project`);
      return false;
    }
    setPrefixError('');
    return true;
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isPrefixEdited) {
      const suggested = generateSuggestedPrefix(val);
      setPrefix(suggested);
      if (suggested) validatePrefix(suggested);
      else setPrefixError('');
    }
  };

  // Members State
  const [members, setMembers] = useState<ProjectMemberItem[]>([]);
  const [workspaceMembers, setWorkspaceMembers] = useState<ProjectMemberItem[]>([]);

  // Initialize creator in members list
  useEffect(() => {
    if (user) {
      setMembers([
        {
          id: user.id,
          name: user.name || user.username || 'Current User',
          email: user.email,
          role: 'PM',
          avatar: user.avatar,
          initials: (user.name || user.email || 'VK').slice(0, 2).toUpperCase(),
        },
      ]);
    }
  }, [user]);

  // Load real workspace members dynamically
  useEffect(() => {
    if (workspaceSlug && isCreateProjectModalOpen) {
      apiService
        .getWorkspaceBySlug(workspaceSlug)
        .then((ws) => apiService.getWorkspaceMembers(ws.id))
        .then((wmList: any[]) => {
          const mapped: ProjectMemberItem[] = wmList.map((wm) => ({
            id: wm.userId,
            name: wm.userName || wm.userEmail,
            email: wm.userEmail,
            role: wm.role === 'SUPER_ADMIN' ? 'PM' : 'Dev',
            initials: (wm.userName || wm.userEmail || 'US').slice(0, 2).toUpperCase(),
          }));
          setWorkspaceMembers(mapped);
        })
        .catch((err) => console.warn('Failed to load workspace members for modal:', err));
    }
  }, [workspaceSlug, isCreateProjectModalOpen]);

  // Add Member inputs
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('Dev');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const colors = ['#3525cd', '#059669', '#e11d48', '#d97706', '#0284c7', '#7c3aed', '#575e70', '#ba1a1a'];
  const icons = ['palette', 'smartphone', 'corporate_fare', 'campaign', 'folder', 'language', 'hub', 'rocket_launch'];
  const rolesList = ['Dev', 'QA', 'Designer', 'PM'];

  if (!isCreateProjectModalOpen) return null;

  const filteredSuggestions = workspaceMembers.filter(
    (s) =>
      !members.some((m) => m.email.toLowerCase() === s.email.toLowerCase() || m.id === s.id) &&
      (s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddMember = (candidate?: ProjectMemberItem) => {
    if (candidate) {
      setMembers((prev) => [...prev, { ...candidate, role: selectedRole || candidate.role }]);
      setSearchQuery('');
      setShowSuggestions(false);
      return;
    }

    if (!searchQuery.trim()) return;

    const query = searchQuery.trim();
    const isEmail = query.includes('@');
    const newMember: ProjectMemberItem = {
      id: `m-${Date.now()}`,
      name: isEmail ? query.split('@')[0] : query,
      email: isEmail ? query : `${query.toLowerCase().replace(/\s+/g, '.')}@acme.io`,
      role: selectedRole,
      initials: query.slice(0, 2).toUpperCase(),
    };

    setMembers((prev) => [...prev, newMember]);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const handleRemoveMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleMemberRoleChange = (id: string, newRole: string) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, role: newRole } : m))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (!validatePrefix(prefix)) {
      setActiveTab('general');
      return;
    }

    setIsSubmitting(true);
    try {
      const action = await dispatch(
        createProject({
          workspaceSlug,
          userId: user?.id || 'u-1',
          data: {
            name: name.trim(),
            description: description.trim() || 'Project workspace for team initiatives.',
            prefixCode: prefix.toUpperCase().trim(),
          },
        })
      );

      if (createProject.fulfilled.match(action)) {
        const createdProj = action.payload;
        const projectSlug = createdProj.slug || createdProj.id;

        // Add additional members picked in modal to the project via API
        const additionalMembers = members.filter((m) => m.id !== user?.id);
        if (additionalMembers.length > 0) {
          await Promise.all(
            additionalMembers.map((m) =>
              apiService
                .addProjectMember(projectSlug, user?.id || 'u-1', { userId: m.id })
                .catch((err) => console.warn(`Failed to add member ${m.name} to project:`, err))
            )
          );
        }

        dispatch(setCreateProjectModalOpen(false));
        setName('');
        setPrefix('');
        setPrefixError('');
        setIsPrefixEdited(false);
        setDescription('');
        setActiveTab('general');
        navigate(`/${workspaceSlug}/${projectSlug}`);
      }
    } catch (err: any) {
      console.error('Failed to create project:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-[var(--bg-surface-container-lowest)] border border-[var(--border-outline-variant)] rounded-2xl shadow-2xl w-full max-w-xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={() => dispatch(setCreateProjectModalOpen(false))}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[var(--bg-surface-container-high)] text-[var(--text-on-surface-variant)] cursor-pointer"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>

        <h2 className="text-xl font-bold text-[var(--text-on-surface)] mb-1">Create New Project</h2>
        <p className="text-xs text-[var(--text-on-surface-variant)] mb-4">
          Set up project workspace parameters and assign workspace team members.
        </p>

        {/* Modal Tabs */}
        <div className="flex gap-2 border-b border-[var(--border-outline-variant)] mb-5">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`pb-2.5 px-1 text-xs font-bold uppercase tracking-wider transition-colors relative cursor-pointer ${
              activeTab === 'general'
                ? 'text-[var(--color-primary)]'
                : 'text-[var(--text-on-surface-variant)] hover:text-[var(--text-on-surface)]'
            }`}
          >
            General Details
            {activeTab === 'general' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-primary)] rounded-t-full" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('members')}
            className={`pb-2.5 px-1 text-xs font-bold uppercase tracking-wider transition-colors relative cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'members'
                ? 'text-[var(--color-primary)]'
                : 'text-[var(--text-on-surface-variant)] hover:text-[var(--text-on-surface)]'
            }`}
          >
            <span>Team Members</span>
            <span className="px-1.5 py-0.2 rounded-full bg-[var(--bg-surface-container-highest)] text-[10px]">
              {members.length}
            </span>
            {activeTab === 'members' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-primary)] rounded-t-full" />
            )}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === 'general' ? (
            <div className="space-y-4">
              {/* Project Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-on-surface-variant)] mb-1">
                  Project Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Frontend Overhaul"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface-container-low)] border border-[var(--border-outline-variant)] text-sm font-semibold text-[var(--text-on-surface)] outline-none focus:border-[var(--color-primary)] transition-colors placeholder:font-normal placeholder:text-[var(--text-on-surface-variant)]/60"
                />
              </div>

              {/* Project Prefix Code */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-on-surface-variant)]">
                    Project Code Prefix <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-[var(--text-on-surface-variant)]">2–6 uppercase chars</span>
                </div>
                <input
                  type="text"
                  value={prefix}
                  maxLength={6}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                    setPrefix(val);
                    setIsPrefixEdited(true);
                    validatePrefix(val);
                  }}
                  placeholder="e.g. FE"
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface-container-low)] border text-sm font-mono font-bold text-[var(--text-on-surface)] outline-none transition-colors ${
                    prefixError
                      ? 'border-rose-500 focus:border-rose-500'
                      : 'border-[var(--border-outline-variant)] focus:border-[var(--color-primary)]'
                  }`}
                />
                {prefixError ? (
                  <p className="text-xs text-rose-500 font-medium mt-1">{prefixError}</p>
                ) : (
                  <p className="text-[10px] text-[var(--text-on-surface-variant)] mt-1">
                    Used as key prefix for tasks generated in this project (e.g. {prefix || 'FE'}-101)
                  </p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-on-surface-variant)] mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface-container-low)] border border-[var(--border-outline-variant)] text-sm font-semibold text-[var(--text-on-surface)] outline-none focus:border-[var(--color-primary)] cursor-pointer"
                >
                  <option value="ENGINEERING">Engineering</option>
                  <option value="DESIGN">Design & Brand</option>
                  <option value="OPERATIONS">Operations & Support</option>
                  <option value="MARKETING">Marketing & Growth</option>
                  <option value="GENERAL">General Initiative</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-on-surface-variant)] mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this project aiming to accomplish?"
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface-container-low)] border border-[var(--border-outline-variant)] text-sm text-[var(--text-on-surface)] outline-none focus:border-[var(--color-primary)] transition-colors placeholder:text-[var(--text-on-surface-variant)]/60 resize-none"
                />
              </div>

              {/* Color accent */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-on-surface-variant)] mb-2">
                  Theme Color Accent
                </label>
                <div className="flex items-center gap-3">
                  {colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSelectedColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                        selectedColor === c ? 'scale-125 ring-2 ring-offset-2 ring-[var(--color-primary)]' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Members Tab */
            <div className="space-y-4">
              {/* Add Member Input & Autocomplete */}
              <div className="relative">
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-on-surface-variant)] mb-1">
                  Add Workspace Member
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      placeholder="Search workspace members..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface-container-low)] border border-[var(--border-outline-variant)] text-sm text-[var(--text-on-surface)] outline-none focus:border-[var(--color-primary)]"
                    />
                    {showSuggestions && filteredSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--bg-surface-container-lowest)] border border-[var(--border-outline-variant)] rounded-xl shadow-xl z-20 max-h-48 overflow-y-auto divide-y divide-[var(--border-outline-variant)]">
                        {filteredSuggestions.map((s) => (
                          <div
                            key={s.id}
                            onClick={() => handleAddMember(s)}
                            className="p-2.5 hover:bg-[var(--bg-surface-container-high)] flex items-center justify-between cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-[var(--color-primary)] text-white text-xs font-bold flex items-center justify-center">
                                {s.initials || s.name.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-[var(--text-on-surface)]">{s.name}</p>
                                <p className="text-[10px] text-[var(--text-on-surface-variant)]">{s.email}</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold uppercase text-[var(--color-primary)]">Add</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddMember()}
                    disabled={!searchQuery.trim()}
                    className="px-4 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer shrink-0"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Members List */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {members.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-surface-container-low)] border border-[var(--border-outline-variant)]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] text-white font-bold flex items-center justify-center text-xs shrink-0">
                        {m.initials || m.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[var(--text-on-surface)] flex items-center gap-1.5">
                          {m.name}
                          {m.id === user?.id && (
                            <span className="px-1.5 py-0.2 bg-[var(--color-primary-fixed)] text-[var(--color-primary)] text-[9px] rounded font-bold uppercase">
                              Creator
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] text-[var(--text-on-surface-variant)]">{m.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <RoleBadge role={m.role} />
                      {m.id !== user?.id && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(m.id)}
                          className="p-1 rounded-lg hover:bg-rose-500/10 text-[var(--text-on-surface-variant)] hover:text-rose-600 transition-colors cursor-pointer"
                          title="Remove Member"
                        >
                          <span className="material-symbols-outlined text-base">close</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form Actions Footer */}
          <div className="flex justify-between items-center pt-4 border-t border-[var(--border-outline-variant)]">
            <span className="text-[10px] text-[var(--text-on-surface-variant)] font-medium">
              {activeTab === 'general' ? 'Next step: Team members & permissions' : `${members.length} team members added`}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => dispatch(setCreateProjectModalOpen(false))}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-[var(--bg-surface-container-high)] text-[var(--text-on-surface)] text-xs font-semibold hover:bg-[var(--bg-surface-container-highest)] transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              {activeTab === 'general' ? (
                <button
                  type="button"
                  onClick={() => setActiveTab('members')}
                  className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white text-xs font-semibold shadow-xs hover:opacity-90 cursor-pointer flex items-center gap-1"
                >
                  <span>Members</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting || !name.trim()}
                  className="px-5 py-2 rounded-xl bg-[var(--color-primary)] text-white text-xs font-semibold shadow-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span className="material-symbols-outlined text-sm">check</span>
                  )}
                  <span>Create Project</span>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
