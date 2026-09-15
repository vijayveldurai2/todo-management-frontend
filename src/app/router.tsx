import { createBrowserRouter, Link, Navigate, useLocation } from 'react-router-dom';
import { RootLayout } from '../components/layout/RootLayout';
import { TasksPage } from '../features/tasks/page';
import { workspaces } from '../features/tasks/data';
import { LoginPage, RegisterPage, VerifyPage, AccountPage } from '../features/auth/page';
import { ComponentsPage } from '../features/components/page';
import { parsePath } from './paths';
function FlatRoute() {
  const { pathname } = useLocation();
  const route = parsePath(pathname);
  if (pathname === '/') return <Navigate to="/_/login" replace />;
  const workspace = route.kind !== 'missing' && workspaces.find(w => w.id === route.workspaceId);
  const validScope = route.kind !== 'missing' && (!route.workspaceId || (workspace && (!route.projectId || workspace.projects.some(p => p.id === route.projectId))));
  if (!validScope) return <main className="content"><h1>Page not found</h1><Link to="/">Back to tasks</Link></main>;
  if (route.kind === 'static') return <main className="content"><h1>{route.page === 'settings' ? 'Settings' : 'Notifications'}</h1><p className="muted">{route.projectId || (workspace ? workspace.name : 'Personal account')} · This page is not built yet.</p></main>;
  return <TasksPage key={route.workspaceId + '/' + route.projectId} />;
}
export const router = createBrowserRouter([
  { path: '/_/components', caseSensitive: true, element: <ComponentsPage /> },
  { path: '/', element: <Navigate to="/_/account" replace /> },
  { path: '/_/login', caseSensitive: true, element: <LoginPage /> },
  { path: '/_/register', caseSensitive: true, element: <RegisterPage /> },
  { path: '/_/verify', caseSensitive: true, element: <VerifyPage /> },
  { path: '/_/account', caseSensitive: true, element: <AccountPage /> },
{ element: <RootLayout />, children: [{ path: '*', element: <FlatRoute /> }] }]);
