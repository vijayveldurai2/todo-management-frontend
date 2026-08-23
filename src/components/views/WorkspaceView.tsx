import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchProjects } from '../../store/projectsSlice';
import { setCreateProjectModalOpen } from '../../store/uiSlice';
import { apiService } from '../../services/apiService';
import { WorkspaceMembers } from './WorkspaceMembers';
import { Project } from '../../types';

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
  ARCHIVED: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
  COMPLETED: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/25',
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Active',
  ARCHIVED: 'Archived',
  COMPLETED: 'Completed',
};

function ProjectCard({
  project,
  workspaceSlug,
  onClick,
}: {
  project: Project;
  workspaceSlug: string;
  onClick: () => void;
}) {
  const pct = project.progressPercentage ?? 0;
  const statusKey = (project.status || 'ACTIVE').toUpperCase();
  const code = project.prefixCode || project.prefix || '';

  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col p-5 rounded-2xl bg-[var(--bg-surface-container-lowest)] border border-[var(--border-outline-variant)] hover:border-[var(--color-primary)] hover:shadow-lg transition-all cursor-pointer overflow-hidden"
    >
      {/* Top Accent Color Bar */}
      <div
        className="absolute inset-x-0 top-0 h-1.5 rounded-t-2xl"
        style={{ backgroundColor: project.color || 'var(--color-primary)' }}
      />

      {/* Header Row */}
      <div className="flex items-start justify-between gap-2 mt-1 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Icon Circle */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white font-bold shadow-xs"
            style={{ backgroundColor: project.color || 'var(--color-primary)' }}
          >
            <span className="material-symbols-outlined text-[20px]">
              {project.icon || 'folder'}
            </span>
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-[var(--text-on-surface)] group-hover:text-[var(--color-primary)] transition-colors truncate">
              {project.name}
            </h3>
            {code && (
              <span className="text-[10px] font-mono font-bold text-[var(--text-on-surface-variant)] bg-[var(--bg-surface-container-high)] px-1.5 py-0.5 rounded border border-[var(--border-outline-variant)]">
                {code}
              </span>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <span
          className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
            STATUS_COLORS[statusKey] || STATUS_COLORS.ACTIVE
          }`}
        >
          {STATUS_LABELS[statusKey] || 'Active'}
        </span>
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-xs text-[var(--text-on-surface-variant)] line-clamp-2 leading-relaxed mb-4 flex-1">
          {project.description}
        </p>
      )}

      {/* Progress Bar */}
      <div className="mt-auto space-y-1.5">
        <div className="flex justify-between text-[11px] font-semibold text-[var(--text-on-surface-variant)]">
          <span>
            {project.completedTasks || 0}/{project.totalTasks || 0} tasks completed
          </span>
          <span>{pct}%</span>
        </div>
        <div className="h-2 rounded-full bg-[var(--bg-surface-container-high)] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(100, Math.max(0, pct))}%`,
              backgroundColor: project.color || 'var(--color-primary)',
            }}
          />
        </div>
      </div>

      {/* Footer / Contributors */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--border-outline-variant)] text-xs">
        {project.contributors && project.contributors.length > 0 ? (
          <div className="flex items-center gap-1">
            <div className="flex -space-x-2">
              {project.contributors.slice(0, 4).map((c, i) => (
                <div
                  key={c.id || i}
                  className="w-6 h-6 rounded-full border-2 border-[var(--bg-surface-container-lowest)] bg-[var(--color-primary)] text-white text-[9px] font-bold flex items-center justify-center overflow-hidden shrink-0"
                  title={c.name}
                >
                  {c.avatar ? (
                    <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" />
                  ) : (
                    (c.name || 'U').substring(0, 2).toUpperCase()
                  )}
                </div>
              ))}
            </div>
            {project.contributors.length > 4 && (
              <span className="text-[10px] font-bold text-[var(--text-on-surface-variant)] ml-1">
                +{project.contributors.length - 4}
              </span>
            )}
          </div>
        ) : (
          <span className="text-[11px] text-[var(--text-on-surface-variant)] font-medium">
            {project.updatedAt ? `Updated ${project.updatedAt}` : 'Active Project'}
          </span>
        )}

        <span className="text-[var(--color-primary)] font-bold text-xs flex items-center gap-1 group-hover:translate-x-1 transition-transform ml-auto">
          <span>View Project</span>
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </span>
      </div>
    </div>
  );
}

export const WorkspaceView: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { workspaceSlug = 'main-workspace' } = useParams<{ workspaceSlug: string }>();
  const { user } = useAppSelector((state) => state.auth);
  const { projects, isLoading, error } = useAppSelector((state) => state.projects);

  const [activeTab, setActiveTab] = useState<'projects' | 'members'>('projects');
  const [isWorkspaceAdmin, setIsWorkspaceAdmin] = useState(true);

  // Fetch projects for this workspace
  useEffect(() => {
    if (workspaceSlug && user?.id) {
      dispatch(fetchProjects({ workspaceSlug, userId: user.id }));
    }
  }, [workspaceSlug, user?.id, dispatch]);

  // Check workspace role for permission gating
  useEffect(() => {
    if (!workspaceSlug || !user?.id) return;
    apiService
      .getWorkspaceBySlug(workspaceSlug)
      .then(async (ws) => {
        const members = await apiService.getWorkspaceMembers(ws.id);
        const mine = members.find((m: any) => m.userId === user.id);
        if (mine) {
          setIsWorkspaceAdmin(mine.role === 'SUPER_ADMIN');
        }
      })
      .catch(() => {});
  }, [workspaceSlug, user?.id]);

  const handleSelectProject = (projectSlug: string) => {
    navigate(`/${workspaceSlug}/${projectSlug}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Workspace Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[var(--bg-surface-container-low)] border border-[var(--border-outline-variant)]">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
            Workspace Overview
          </span>
          <h1 className="text-2xl font-extrabold text-[var(--text-on-surface)] mt-1">
            {workspaceSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
          </h1>
          <p className="text-xs text-[var(--text-on-surface-variant)] mt-1">
            Manage your team's projects, members, and task boards in one place.
          </p>
        </div>

        {activeTab === 'projects' && (
          <button
            onClick={() => dispatch(setCreateProjectModalOpen(true))}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-primary)] text-white font-semibold text-xs shadow-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-base">add</span>
            <span>New Project</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-[var(--border-outline-variant)] px-2">
        <button
          onClick={() => setActiveTab('projects')}
          className={`pb-3 text-sm font-bold uppercase tracking-wider transition-colors relative cursor-pointer ${
            activeTab === 'projects'
              ? 'text-[var(--color-primary)]'
              : 'text-[var(--text-on-surface-variant)] hover:text-[var(--text-on-surface)]'
          }`}
        >
          Projects ({projects.length})
          {activeTab === 'projects' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-primary)] rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={`pb-3 text-sm font-bold uppercase tracking-wider transition-colors relative cursor-pointer ${
            activeTab === 'members'
              ? 'text-[var(--color-primary)]'
              : 'text-[var(--text-on-surface-variant)] hover:text-[var(--text-on-surface)]'
          }`}
        >
          Members
          {activeTab === 'members' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-primary)] rounded-t-full" />
          )}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'projects' ? (
        <div>
          {isLoading ? (
            <div className="flex items-center justify-center py-20 gap-3 text-[var(--text-on-surface-variant)]">
              <div className="w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-semibold">Loading workspace projects…</span>
            </div>
          ) : error ? (
            <div className="py-16 flex flex-col items-center text-center bg-[var(--bg-surface-container-lowest)] rounded-2xl border border-[var(--border-outline-variant)] p-6">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mb-3 text-rose-500">
                <span className="material-symbols-outlined">error</span>
              </div>
              <p className="text-sm font-bold text-[var(--text-on-surface)] mb-1">
                Unable to load projects
              </p>
              <p className="text-xs text-[var(--text-on-surface-variant)] mb-4">{error}</p>
              <button
                onClick={() =>
                  user?.id && dispatch(fetchProjects({ workspaceSlug, userId: user.id }))
                }
                className="px-4 py-2 rounded-xl bg-[var(--bg-surface-container-high)] text-xs font-semibold text-[var(--text-on-surface)] hover:bg-[var(--bg-surface-container-highest)]"
              >
                Try Again
              </button>
            </div>
          ) : projects.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center bg-[var(--bg-surface-container-lowest)] rounded-2xl border border-[var(--border-outline-variant)] border-dashed p-8">
              <div className="w-16 h-16 bg-[var(--bg-surface-container-high)] rounded-full flex items-center justify-center mb-4 text-[var(--text-on-surface-variant)]">
                <span className="material-symbols-outlined text-3xl">folder_open</span>
              </div>
              <h3 className="text-base font-bold text-[var(--text-on-surface)] mb-2">
                No projects found in this workspace
              </h3>
              <p className="text-sm text-[var(--text-on-surface-variant)] max-w-sm mb-6 leading-relaxed">
                Create a new project to start organizing boards, tracking tasks, and collaborating with team members.
              </p>
              <button
                onClick={() => dispatch(setCreateProjectModalOpen(true))}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-xs font-semibold hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined text-base">add</span>
                <span>Create New Project</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  workspaceSlug={workspaceSlug}
                  onClick={() => handleSelectProject(project.slug || project.id)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <WorkspaceMembers />
      )}
    </div>
  );
};
