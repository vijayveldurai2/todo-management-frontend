import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch } from '../../app/store';
import { setCreateProjectModalOpen } from '../../features/ui/uiSlice';
import { WorkspaceProjectsTab } from './workspace/WorkspaceProjectsTab';
import { WorkspaceMembersTab } from './workspace/WorkspaceMembersTab';

export const WorkspaceView: React.FC = () => {
  const dispatch = useAppDispatch();
  const { workspaceSlug = 'main-workspace' } = useParams<{ workspaceSlug: string }>();
  const [activeTab, setActiveTab] = useState<'projects' | 'members'>('members');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner / Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[var(--bg-surface-container-low)] border border-[var(--border-outline-variant)]">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
            Workspace Overview
          </span>
          <h1 className="text-2xl font-extrabold text-[var(--text-on-surface)] mt-1">
            {activeTab === 'projects' ? 'Active Projects' : 'Team Members'}
          </h1>
          <p className="text-xs text-[var(--text-on-surface-variant)] mt-1">
            {activeTab === 'projects' 
              ? "Manage your team's initiatives, board tasks, and delivery milestones."
              : "Manage access, roles, and pending invites for your workspace team."}
          </p>
        </div>

        {activeTab === 'projects' ? (
          <button
            onClick={() => dispatch(setCreateProjectModalOpen(true))}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-primary)] text-white font-semibold text-xs shadow-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-base">add</span>
            <span>New Project</span>
          </button>
        ) : (
          <button
            // TODO: dispatch open invite modal
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-primary)] text-white font-semibold text-xs shadow-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-base">person_add</span>
            <span>Invite Members</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--border-outline-variant)]">
        <button
          onClick={() => setActiveTab('members')}
          className={`px-4 py-3 text-xs font-bold transition-colors cursor-pointer border-b-2 ${
            activeTab === 'members' 
              ? 'border-[var(--color-primary)] text-[var(--color-primary)]' 
              : 'border-transparent text-[var(--text-on-surface-variant)] hover:text-[var(--text-on-surface)]'
          }`}
        >
          Members
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`px-4 py-3 text-xs font-bold transition-colors cursor-pointer border-b-2 ${
            activeTab === 'projects' 
              ? 'border-[var(--color-primary)] text-[var(--color-primary)]' 
              : 'border-transparent text-[var(--text-on-surface-variant)] hover:text-[var(--text-on-surface)]'
          }`}
        >
          Projects
        </button>
      </div>

      {activeTab === 'projects' ? <WorkspaceProjectsTab /> : <WorkspaceMembersTab />}
    </div>
  );
};

