import React from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { Header } from '../common/Header';
import { Sidebar } from '../common/Sidebar';
import { OfflineBanner } from '../common/OfflineBanner';
import { NotFoundPage } from '../views/NotFoundPage';
import { CreateProjectModal } from '../modals/CreateProjectModal';
import { SettingsModal } from '../modals/SettingsModal';
import { KeyboardShortcutsModal } from '../modals/KeyboardShortcutsModal';
import { InviteMemberModal } from '../modals/InviteMemberModal';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useGetWorkspaceBySlugQuery } from '../../services/workspaceApi';

export const WorkspaceLayout: React.FC = () => {
  useKeyboardShortcuts();
  const { workspaceSlug = '' } = useParams<{ workspaceSlug: string }>();
  
  const { data: workspace, isLoading, isError } = useGetWorkspaceBySlugQuery(workspaceSlug, { 
    skip: !workspaceSlug 
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-surface)] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[var(--text-on-surface-variant)] text-xs font-semibold">
          <div className="w-5 h-5 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
          <span>Loading workspace...</span>
        </div>
      </div>
    );
  }

  if (isError || !workspace) {
    return <NotFoundPage type="workspace" />;
  }

  return (
    <div className="min-h-screen bg-[var(--bg-surface)] text-[var(--text-on-surface)] transition-colors">
      <Header />
      <OfflineBanner />
      <Sidebar />

      <main className="md:pl-64 pt-16 min-h-[calc(100vh-4rem)] flex flex-col">
        {/* Workspace Sub-header banner / breadcrumb */}
        <div className="px-4 md:px-8 py-2 bg-[var(--bg-surface-container-low)] border-b border-[var(--border-outline-variant)] flex items-center justify-between text-xs text-[var(--text-on-surface-variant)]">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="material-symbols-outlined text-sm text-[var(--color-primary)]">corporate_fare</span>
            <span className="font-bold text-[var(--text-on-surface)]">{workspace?.name}</span>
            <span className="text-gray-400">/</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-[var(--bg-surface-container-high)] font-mono text-[var(--text-on-surface-variant)]">
              {workspaceSlug}
            </span>
          </div>
        </div>

        {/* Dynamic Outlet View */}
        <div className="p-4 md:p-8 flex-1">
          <Outlet />
        </div>
      </main>

      <SettingsModal />
      <KeyboardShortcutsModal />
      <CreateProjectModal />
      <InviteMemberModal />
    </div>
  );
};
