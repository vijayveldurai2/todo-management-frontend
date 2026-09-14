import { useEffect, useState } from 'react';
import { Building2, Folder, List, Columns3, ChevronDown, Search } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { workspaces } from '../tasks/data';
import { parsePath } from '../../app/paths';
import { Switcher } from './Switcher';
export type SwitchKind = 'workspace' | 'project' | 'view' | 'search';
export function Navigation() {
  const route = parsePath(useLocation().pathname);
  const { workspaceId, projectId, view = 'list' } = route.kind === 'missing' ? {} : route;
  const navigate = useNavigate();
  const [kind, setKind] = useState<SwitchKind | null>(null);
  const workspace = workspaces.find(w => w.id === workspaceId) || workspaces[0];
  const project = workspace.projects.find(p => p.id === projectId) || workspace.projects[0];
  useEffect(() => {
    const key = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setKind(k => k ? null : 'search'); } };
    document.addEventListener('keydown', key); return () => document.removeEventListener('keydown', key);
  }, []);
  const go = (path: string) => { setKind(null); navigate(path); };
  return <header className="chrome">
    <nav aria-label="Current location" className="breadcrumbs">
      <button onClick={() => setKind('workspace')} aria-label="Switch workspace"><Building2 /><span>{workspace.name}</span><ChevronDown /></button><span className="slash">/</span>
      <button onClick={() => setKind('project')} aria-label="Switch project"><Folder /><span>{project.name}</span><ChevronDown /></button><span className="slash">/</span>
      <button onClick={() => setKind('view')} aria-label="Switch view">{view === 'board' ? <Columns3 /> : <List />}<span>{view === 'board' ? 'Board' : 'List'}</span><ChevronDown /></button>
    </nav>
    <div className="chrome-end"><button onClick={() => setKind('search')} aria-label="Search everything" aria-keyshortcuts="Control+k Meta+k"><Search /><kbd>{/Mac|iPhone|iPad/.test(navigator.platform) ? '⌘ K' : 'Ctrl K'}</kbd></button><span className="profile" aria-label="Anya">A</span></div>
    {kind && <Switcher kind={kind} workspace={workspace} project={project} view={view} go={go} onClose={() => setKind(null)} />}
  </header>;
}
