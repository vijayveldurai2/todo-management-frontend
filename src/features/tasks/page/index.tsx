import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { parsePath, projectPath, todoPath, DISPLAY_ID } from '../../../app/paths';
import { Plus } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import { addTask } from '../tasksSlice';
import { workspaces, type Status } from '../data';
import { TaskRow } from '../TaskRow';
import { TaskDetail } from '../TaskDetail';
export function TasksPage() {
  const location = useLocation();
  const route = parsePath(location.pathname);
  const { workspaceId = '', projectId = '', view = 'list', displayId: taskId } = route.kind === 'missing' ? {} : route;
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const tasks = useAppSelector(s => s.tasks);
  const [mine, setMine] = useState(false);
  const [capture, setCapture] = useState(false);
  const [title, setTitle] = useState('');
  const [quickId, setQuickId] = useState<string | null>(null);
  const base = projectPath(workspaceId, projectId, view);
  const workspace = workspaces.find(w => w.id === workspaceId);
  const project = workspace?.projects.find(p => p.id === projectId);
  const visible = tasks.filter(t => t.workspace === workspaceId && t.project === projectId && (!mine || t.person === 'Anya'));
  const selected = tasks.find(t => (taskId ? DISPLAY_ID.test(taskId) && t.displayId === taskId : t.id === quickId) && t.workspace === workspaceId && t.project === projectId);
  if (!project || !['list', 'board'].includes(view) || (taskId && !selected)) return <main className="content"><h1>Not found</h1><Link to="/">Back to tasks</Link></main>;
  const close = () => { setQuickId(null); if (taskId) { const returnTo = location.state?.returnTo; const previous = typeof returnTo === 'string' ? parsePath(returnTo) : null; navigate(previous?.kind === 'project' && previous.workspaceId === workspaceId && previous.projectId === projectId ? returnTo : base); } };
  return <div className={'workspace-body ' + (selected && !taskId ? 'with-panel' : '')}>
    {!taskId && <main className="content">
      <div className="heading"><div><h1>{project.name}</h1><p className="muted">A little care, from first idea to final delivery.</p></div><button className="pill" onClick={() => setCapture(true)}><Plus />Add task</button></div>
      <div className="toolbar"><div className="segmented"><button aria-pressed={!mine} onClick={() => setMine(false)}>All tasks</button><button aria-pressed={mine} onClick={() => setMine(true)}>Assigned to me</button></div><span className="muted">{visible.filter(t => t.status !== 'Done').length} open</span></div>
      {capture && <form className="capture" onSubmit={e => { e.preventDefault(); if (!title.trim()) return; dispatch(addTask({ id: 'TASK-' + crypto.randomUUID().slice(0, 8), workspace: workspaceId, project: projectId, title: title.trim(), status: 'To do', person: 'Anya', due: 'No date', notes: '', steps: [], comments: [] })); setTitle(''); setCapture(false); }}>
        <input autoFocus aria-label="New task title" placeholder="What needs doing?" value={title} maxLength={150} onChange={e => setTitle(e.target.value)} required /><button type="submit">Add</button><button type="button" onClick={() => setCapture(false)}>Cancel</button>
      </form>}
      <div className={view === 'board' ? 'board-grid' : ''}>{(['In progress', 'To do', 'Done'] as Status[]).map(status => {
        const members = visible.filter(t => t.status === status);
        return (members.length > 0 || view === 'board') && <section className={view === 'board' ? 'board-column' : 'task-group'} key={status}><h2 className="group-label">{status} · {members.length}</h2>{members.map(task => <TaskRow key={task.id} task={task} href={todoPath(workspaceId, projectId, task.displayId)} onQuick={() => setQuickId(task.id)} />)}{!members.length && <p className="muted empty">No tasks</p>}</section>;
      })}</div>
      {!visible.length && view === 'list' && <p className="muted empty">Nothing here yet. Add your first task.</p>}
      <button className="bottom-add" onClick={() => setCapture(true)}><Plus />Add a task</button>
    </main>}
    {selected && <TaskDetail key={selected.id} task={selected} full={!!taskId} close={close} expand={() => { setQuickId(null); navigate(todoPath(workspaceId, projectId, selected.displayId), { state: { returnTo: base } }); }} />}
  </div>;
}
