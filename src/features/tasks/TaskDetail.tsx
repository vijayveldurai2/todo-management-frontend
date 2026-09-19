import { useState } from 'react';
import { ArrowLeft, Expand, X } from 'lucide-react';
import { useAppDispatch } from '../../app/store';
import { updateTask } from './tasksSlice';
import type { Task, Status } from './data';
export function TaskDetail({ task, full, close, expand }: { task: Task; full: boolean; close: () => void; expand: () => void }) {
  const dispatch = useAppDispatch();
  const [comment, setComment] = useState('');
  const update = (changes: Partial<Task>) => dispatch(updateTask({ id: task.id, changes }));
  return <section className={'detail ' + (full ? 'full-detail' : '')} aria-label="Task details" onKeyDown={e => { if (e.key === 'Escape') close(); }}>
    <div className="detail-top"><button onClick={close}><ArrowLeft />{full ? 'Back to tasks' : 'Quick view'}</button><div className="detail-tools"><small>{task.displayId}</small>{!full && <button onClick={expand} aria-label="Open full page"><Expand /></button>}<button onClick={close} aria-label="Close task"><X /></button></div></div>
    <textarea className="detail-title" aria-label="Task title" rows={2} defaultValue={task.title} maxLength={150} onBlur={e => { const title = e.target.value.trim(); if (title) update({ title }); else e.target.value = task.title; }} />
    <dl className="properties"><dt>Status</dt><dd><select aria-label="Status" value={task.status} onChange={e => update({ status: e.target.value as Status })}>{['To do', 'In progress', 'Done'].map(s => <option key={s}>{s}</option>)}</select></dd>
      <dt>Assigned to</dt><dd><select aria-label="Assignee" value={task.person} onChange={e => update({ person: e.target.value })}>{['Anya', 'Ravi', 'Unassigned'].map(s => <option key={s}>{s}</option>)}</select></dd><dt>Due</dt><dd>{task.due}</dd></dl>
    <h2>Notes</h2><textarea className="notes" aria-label="Notes" placeholder="Add a little context…" value={task.notes} onChange={e => update({ notes: e.target.value })} />
    <div className="section-heading"><h2>Subtasks</h2><span className="muted">{task.steps.filter(s => s.done).length} / {task.steps.length}</span></div>
    {task.steps.map((s, i) => <label className="subtask" key={i}><input type="checkbox" checked={s.done} onChange={e => update({ steps: task.steps.map((step, j) => j === i ? { ...step, done: e.target.checked } : step) })} />{s.title}</label>)}
    {!task.steps.length && <p className="muted">No subtasks yet.</p>}
    <div className="conversation"><h2>Conversation</h2>{task.comments.map((c, i) => <p key={i}>{c}</p>)}
      <form onSubmit={e => { e.preventDefault(); if (comment.trim()) { update({ comments: [...task.comments, 'Anya: ' + comment.trim()] }); setComment(''); } }}><input aria-label="Write a comment" placeholder="Write a comment…" maxLength={400} value={comment} onChange={e => setComment(e.target.value)} /></form>
    </div>
  </section>;
}
