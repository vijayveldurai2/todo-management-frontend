import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export const TodoDetailPanel: React.FC = () => {
  const { workspaceSlug, projectSlug, displayId } = useParams<{
    workspaceSlug: string;
    projectSlug: string;
    displayId: string;
  }>();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-[var(--text-on-surface-variant)] p-8">
      <div className="w-16 h-16 rounded-full bg-[var(--bg-surface-container-high)] flex items-center justify-center mb-4 text-[var(--color-primary)]">
        <span className="material-symbols-outlined text-3xl">construction</span>
      </div>
      <h2 className="text-xl font-bold text-[var(--text-on-surface)] mb-2">Task Details: {displayId}</h2>
      <p className="text-center text-sm mb-6 max-w-md leading-relaxed">
        The Todo vertical is currently disabled for this workspace migration sprint.
        Task tracking will be reactivated in the next phase.
      </p>
      <button 
        onClick={() => navigate(`/${workspaceSlug}/${projectSlug}`)}
        className="px-6 py-2.5 rounded-xl bg-[var(--bg-surface-container-high)] hover:bg-[var(--bg-surface-container-highest)] font-semibold transition-colors cursor-pointer"
      >
        Return to Project
      </button>
    </div>
  );
};
