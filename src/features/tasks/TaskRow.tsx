import { Link } from 'react-router-dom';
import { Ellipsis, PanelRight, Copy } from 'lucide-react';
import { useAppDispatch } from '../../app/store';
import { addTask, updateTask } from './tasksSlice';
import type { Task } from './data';
export function TaskRow({ task, href, onQuick }: { task: Task; href: string; onQuick: () => void }) {
  const dispatch = useAppDispatch();
  return <div className={'task-row ' + (task.status === 'Done' ? 'done' : '')}>
    <input type="checkbox" aria-label={'Complete ' + task.title} checked={task.status === 'Done'} onChange={e => dispatch(updateTask({ id: task.id, changes: { status: e.target.checked ? 'Done' : 'To do' } }))} />
    <Link className="task-title" to={href} state={{ returnTo: window.location.pathname }}>{task.title}</Link><span className="date">{task.due}</span><span className="avatar" aria-label={task.person}>{task.person[0]}</span>
    <div className="row-actions"><button onClick={onQuick} aria-label={'Quick view: ' + task.title}><PanelRight /></button>
      <details className="task-menu"><summary aria-label={'More actions: ' + task.title}><Ellipsis /></summary><div className="action-menu"><Link to={href}>Open full page</Link><button onClick={onQuick}>Quick view</button><button onClick={e => { dispatch(addTask({ ...task, id: 'TASK-' + crypto.randomUUID().slice(0, 8), title: task.title + ' (copy)' })); e.currentTarget.closest('details')?.removeAttribute('open'); }}><Copy />Duplicate</button></div></details>
    </div>
  </div>;
}
