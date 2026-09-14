import React from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { NotFoundPage } from '../views/NotFoundPage';
import { useGetProjectBySlugQuery } from '../../services/projectApi';
import { useAppSelector } from '../../app/store';

export const ProjectLayout: React.FC = () => {
  const { workspaceSlug = '', projectSlug = '' } = useParams<{ workspaceSlug: string; projectSlug: string }>();
  const { user } = useAppSelector((state) => state.auth);

  const { data: project, isLoading, isError } = useGetProjectBySlugQuery(
    { workspaceSlug, projectSlug, userId: user?.id || '' },
    { skip: !workspaceSlug || !projectSlug || !user?.id }
  );

  if (isLoading) {
    return (
      <div className="py-12 flex justify-center items-center text-xs text-[var(--text-on-surface-variant)]">
        <div className="w-5 h-5 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mr-2"></div>
        <span>Loading project...</span>
      </div>
    );
  }

  if (isError || !project) {
    return <NotFoundPage type="project" />;
  }

  return <Outlet context={{ project }} />;
};
