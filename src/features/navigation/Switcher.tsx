import { useState } from 'react';
import { Building2, Folder, List, Columns3, CircleCheck, X } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { useAppSelector } from '../../app/store';
import { workspaces } from '../tasks/data';
import { projectPath, todoPath } from '../../app/paths';
import type { SwitchKind } from './Navigation';
interface Props { kind: SwitchKind; workspace: typeof workspaces[number]; project: { id: string; name: string }; view: string; go: (path: string) => void; onClose: () => void }
export function Switcher({ kind, workspace, project, view, go, onClose }: Props) {
  const [search, setSearch] = useState('');
  const tasks = useAppSelector(s => s.tasks);
  const path = (w: string, p: string, v = view) => projectPath(w, p, v);
  const ws = workspaces.map(w => ({ name: w.name, detail: 'Workspace', icon: Building2, path: path(w.id, w.projects[0].id, 'list') }));
  const projects = workspaces.flatMap(w => w.projects.map(p => ({ name: p.name, detail: w.name, icon: Folder, path: path(w.id, p.id) })));
  const views = [{ name: 'List', detail: 'A simple task list', icon: List, path: path(workspace.id, project.id, 'list') }, { name: 'Board', detail: 'Grouped by status', icon: Columns3, path: path(workspace.id, project.id, 'board') }];
  const allTasks = tasks.map(t => ({ name: t.title, detail: workspaces.find(w => w.id === t.workspace)?.name + ' / ' + t.project, icon: CircleCheck, path: todoPath(t.workspace, t.project, t.displayId) }));
  const entries = (kind === 'workspace' ? ws : kind === 'project' ? projects.filter(p => p.detail === workspace.name) : kind === 'view' ? views : [...projects, ...ws, ...allTasks]).filter(e => (e.name + e.detail).toLowerCase().includes(search.toLowerCase()));
  return <Modal label={'Switch ' + kind} onClose={onClose}>
    <div className="dialog-heading"><h2>{kind === 'search' ? 'Jump to…' : 'Choose a ' + kind}</h2><button onClick={onClose} aria-label="Close navigation"><X /></button></div>
    {kind !== 'view' && <input autoFocus placeholder="Search…" aria-label="Search destinations" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && entries[0]) go(entries[0].path); }} />}
    <div className="destinations">{entries.map(e => <button key={e.path + e.detail} onClick={() => go(e.path)}><e.icon /><span>{e.name}<small>{e.detail}</small></span></button>)}{!entries.length && <p className="muted">No matches found.</p>}</div>
  </Modal>;
}
