import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '../../../app/store';
import { useGetWorkspaceProjectsQuery } from '../../../services/projectApi';

export const WorkspaceProjectsTab: React.FC = () => {
  const navigate = useNavigate();
  const { workspaceSlug = 'main-workspace' } = useParams<{ workspaceSlug: string }>();
  const { user } = useAppSelector((state) => state.auth);

  const { data: projects = [], isLoading } = useGetWorkspaceProjectsQuery(
    { workspaceSlug, userId: user?.id || '' },
    { skip: !user?.id }
  );

  const handleSelectProject = (projectSlug: string) => {
    navigate(`/${workspaceSlug}/${projectSlug}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="p-8 text-center bg-[var(--bg-surface-container-lowest)] border border-[var(--border-outline-variant)] rounded-2xl">
        <h3 className="text-sm font-bold text-[var(--text-on-surface)]">No projects yet</h3>
        <p className="text-xs text-[var(--text-on-surface-variant)] mt-1">Create your first project to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5 animate-in fade-in">
      {projects.map((project) => {
        const projectSlug = project.slug || project.id;
        return (
          <div
            key={project.id}
            onClick={() => handleSelectProject(projectSlug)}
            className="p-6 rounded-2xl bg-[var(--bg-surface-container-lowest)] border border-[var(--border-outline-variant)] hover:border-[var(--color-primary)] shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white"
                  style={{ backgroundColor: project.color || 'var(--color-primary)' }}
                >
                  {project.category || 'PROJECT'}
                </span>
              </div>

              <h3 className="text-lg font-bold text-[var(--text-on-surface)] group-hover:text-[var(--color-primary)] transition-colors mb-2">
                {project.name}
              </h3>

              <p className="text-xs text-[var(--text-on-surface-variant)] line-clamp-2 mb-4 leading-relaxed">
                {project.description}
              </p>
            </div>

            <div>
              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between items-center text-xs mb-1.5 font-semibold">
                  <span className="text-[var(--text-on-surface-variant)]">Progress</span>
                  <span className="text-[var(--text-on-surface)]">
                    {project.completedTasks || 0} of {project.totalTasks || 0} tasks
                  </span>
                </div>
                <div className="w-full h-2 bg-[var(--bg-surface-container-high)] rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-500 rounded-full"
                    style={{
                      width: `${project.progressPercentage || 0}%`,
                      backgroundColor: project.color || 'var(--color-primary)',
                    }}
                  />
                </div>
              </div>

              {/* Contributors Stack */}
              <div className="flex items-center justify-between border-t border-[var(--border-outline-variant)] pt-3">
                <div className="flex -space-x-2">
                  {(project.contributors || []).slice(0, 5).map((contrib: any, i: number) => (
                    <div
                      key={i}
                      title={contrib.name}
                      className="w-7 h-7 rounded-full border-2 border-[var(--bg-surface-container-lowest)] overflow-hidden bg-[var(--color-primary)] text-white text-[10px] font-bold flex items-center justify-center shrink-0"
                    >
                      {contrib.avatar ? (
                        <img src={contrib.avatar} alt={contrib.name} className="w-full h-full object-cover" />
                      ) : (
                        contrib.initials || contrib.name?.slice(0, 2).toUpperCase() || 'U'
                      )}
                    </div>
                  ))}
                  {(project.contributors?.length || 0) > 5 && (
                    <div className="w-7 h-7 rounded-full border-2 border-[var(--bg-surface-container-lowest)] bg-[var(--bg-surface-container-high)] text-[var(--text-on-surface)] text-[9px] font-bold flex items-center justify-center shrink-0">
                      +{(project.contributors.length - 5)}
                    </div>
                  )}
                </div>

                <span className="text-xs font-semibold text-[var(--color-primary)] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  <span>View Boards</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
