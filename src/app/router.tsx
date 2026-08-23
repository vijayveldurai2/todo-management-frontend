import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import { WorkspacePicker } from '../components/views/WorkspacePicker';
import { WorkspaceLayout } from '../components/layouts/WorkspaceLayout';
import { WorkspaceView } from '../components/views/WorkspaceView';
import { ProjectLayout } from '../components/layouts/ProjectLayout';
import { ProjectDetailsView } from '../components/views/ProjectDetailsView';
import { TodoDetailPanel } from '../components/modals/TodoDetailPanel';
import { NotFoundPage } from '../components/views/NotFoundPage';
import { AuthPage } from '../features/auth/page';
import { ProtectedRoute } from '../components/common/ProtectedRoute';

export const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      // Public Authentication Handles
      { path: '/_/login', element: <AuthPage /> },
      { path: '/_/signup', element: <AuthPage /> },

      // Protected Application Handles
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/', element: <WorkspacePicker /> },
          
          // Platform-level routes (/_/...)
          {
            path: '_',
            children: [
              { path: 'settings', element: <div className="p-8">Platform Settings</div> },
              { path: 'notifications', element: <div className="p-8">Platform Notifications</div> },
              { path: 'profile', element: <div className="p-8">User Profile</div> },
            ]
          },
          {
            path: '/:workspaceSlug',
            element: <WorkspaceLayout />,
            children: [
              { index: true, element: <WorkspaceView /> },
              // Workspace-level routes (/{workspaceSlug}/_/...)
              {
                path: '_',
                children: [
                  { path: 'settings', element: <div className="p-8">Workspace Settings</div> },
                  { path: 'members', element: <div className="p-8">Workspace Members</div> },
                  { path: 'billing', element: <div className="p-8">Workspace Billing</div> },
                  { path: 'invites', element: <div className="p-8">Workspace Invites</div> },
                ]
              },              {
                path: ':projectSlug',
                element: <ProjectLayout />,
                children: [
                  { index: true, element: <ProjectDetailsView /> },
                  // Display-ID Pattern Route for Todo Detail (board-agnostic)
                  { 
                    path: ':displayId', 
                    element: <TodoDetailPanel />,
                    // We will implement regex check inside TodoDetailPanel or use standard loaders later.
                  },
                ],
              },
            ],
          },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);
