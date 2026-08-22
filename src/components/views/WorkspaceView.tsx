import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { setCreateProjectModalOpen } from '../../store/uiSlice';
import { WorkspaceMembers } from './WorkspaceMembers';

export const WorkspaceView: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { workspaceSlug = 'main-workspace' } = useParams<{ workspaceSlug: string }>();
  const { projects } = useAppSelector((state) => state.projects);

  const handleSelectProject = (projectSlug: string) => {
    navigate(`/${workspaceSlug}/${projectSlug}`);
  };

  const [activeTab, setActiveTab] = useState<'projects' | 'members'>('projects');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner / Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[var(--bg-surface-container-low)] border border-[var(--border-outline-variant)]">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
            Workspace Overview
          </span>
          <h1 className="text-2xl font-extrabold text-[var(--text-on-surface)] mt-1">
            {workspaceSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </h1>
          <p className="text-xs text-[var(--text-on-surface-variant)] mt-1">
            Manage your team's initiatives, board tasks, and delivery milestones.
          </p>
        </div>

        {activeTab === 'projects' && (
          <button
            disabled
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-surface-container-highest)] text-[var(--text-on-surface-variant)] font-semibold text-xs shadow-xs cursor-not-allowed opacity-70 shrink-0 self-start sm:self-auto"
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
          className={`pb-3 text-sm font-bold uppercase tracking-wider transition-colors relative ${
            activeTab === 'projects'
              ? 'text-[var(--color-primary)]'
              : 'text-[var(--text-on-surface-variant)] hover:text-[var(--text-on-surface)]'
          }`}
        >
          Projects
          {activeTab === 'projects' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-primary)] rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={`pb-3 text-sm font-bold uppercase tracking-wider transition-colors relative ${
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
        <div className="py-12 flex flex-col items-center justify-center text-center bg-[var(--bg-surface-container-lowest)] rounded-2xl border border-[var(--border-outline-variant)]">
          <div className="w-16 h-16 bg-[var(--bg-surface-container-high)] rounded-full flex items-center justify-center mb-4 text-[var(--text-on-surface-variant)]">
            <span className="material-symbols-outlined text-3xl">construction</span>
          </div>
          <h3 className="text-lg font-bold text-[var(--text-on-surface)] mb-2">Projects coming soon</h3>
          <p className="text-sm text-[var(--text-on-surface-variant)] max-w-md">
            The project management features are currently under development. Soon you'll be able to create and manage your projects here.
          </p>
        </div>
      ) : (
        <WorkspaceMembers />
      )}
    </div>
  );
};

