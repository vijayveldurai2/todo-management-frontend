export const DISPLAY_ID = /^[a-z]+-\d+$/;
export type Route = { kind: 'project' | 'todo' | 'static'; workspaceId?: string; projectId?: string; view?: string; displayId?: string; page?: string } | { kind: 'missing' };
export const projectPath = (w: string, p: string, view = 'list') => `/${w}/${p}/_/${view}`;
export const todoPath = (w: string, p: string, id: string) => `/${w}/${p}/${id}`;
export function parsePath(pathname: string): Route {
  const parts = pathname.split('/').slice(1);
  if (parts.some(p => !p || p !== p.toLowerCase() || p.includes('%'))) return { kind: 'missing' };
  const [w, p, segment, page] = parts;
  if (w === '_' && parts.length === 2 && ['settings', 'notifications'].includes(p)) return { kind: 'static', page: p };
  if (w === '_') return { kind: 'missing' };
  if (p === '_' && parts.length === 3 && ['settings', 'notifications'].includes(segment)) return { kind: 'static', workspaceId: w, page: segment };
  if (p === '_') return { kind: 'missing' };
  if (parts.length === 4 && segment === '_' && ['list', 'board'].includes(page)) return { kind: 'project', workspaceId: w, projectId: p, view: page };
  if (parts.length === 4 && segment === '_' && ['settings', 'notifications'].includes(page)) return { kind: 'static', workspaceId: w, projectId: p, page };
  if (parts.length === 3 && DISPLAY_ID.test(segment)) return { kind: 'todo', workspaceId: w, projectId: p, displayId: segment };
  return { kind: 'missing' };
}
