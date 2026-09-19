import { useState } from 'react';
import { X, PanelsTopLeft, PanelRight, SlidersHorizontal } from 'lucide-react';
import { Modal } from '../../../components/common/Modal';
import { SidePanel } from '../../../components/overlays/SidePanel';
import { Popover } from '../../../components/overlays/Popover';
import { Button, Card, TextField, SelectField, Checkbox } from '../../../components/ui';
export function OverlaysSection() {
  const [active, setActive] = useState<'form' | 'confirm' | 'panel' | null>(null);
  const [name, setName] = useState(''), [task, setTask] = useState('Prepare the next delivery');
  const [status, setStatus] = useState('Preparing'), [details, setDetails] = useState(true);
  const [message, setMessage] = useState('These previews stay on this page.');
  const close = () => setActive(null);
  return <section id="overlays" className="catalog-section"><span className="eyebrow">06 / JUST ENOUGH SPACE</span><h2>A little room to focus.</h2><p className="muted">A decision in the centre. Details to the side. Small choices close at hand.</p>
    <div className="catalog-grid">
      <Card><span className="catalog-symbol"><PanelsTopLeft /></span><h3>Modals</h3><p>For a short form or a decision that needs your attention.</p><div className="overlay-demo-actions"><Button onClick={() => { setName(''); setActive('form'); }}>Open form</Button><Button variant="text" onClick={() => setActive('confirm')}>Confirmation</Button></div></Card>
      <Card><span className="catalog-symbol"><PanelRight /></span><h3>Side panel</h3><p>Keep your place while you view or edit a task.</p><Button variant="tonal" onClick={() => setActive('panel')}>Quick edit</Button></Card>
      <Card><span className="catalog-symbol"><SlidersHorizontal /></span><h3>Popovers</h3><p>Small options, right beside the button that opens them.</p><Popover label="View options">{() => <><h3>Keep it simple.</h3><Checkbox label="Show task details" checked={details} onChange={e => setDetails(e.target.checked)} /><p className="muted">{details ? 'Details are visible in this preview.' : 'Only titles are visible in this preview.'}</p></>}</Popover></Card>
    </div><p className="catalog-note" role="status">{message}</p>
    {active === 'form' && <Modal label="Create project preview" onClose={close}><form className="overlay-form" onSubmit={e => { e.preventDefault(); if (!name.trim()) return; setMessage('Preview project “' + name.trim() + '” created.'); close(); }}>
      <header className="overlay-heading"><h2>A fresh start.</h2><button type="button" aria-label="Close create project" onClick={close}><X /></button></header><p className="muted">Give your project a name. You can shape the details later.</p><TextField autoFocus label="Project name" placeholder="e.g. Weekend market" required maxLength={80} value={name} onChange={e => setName(e.target.value)} />
      <footer className="overlay-actions"><Button variant="text" onClick={close}>Cancel</Button><Button type="submit" disabled={!name.trim()}>Create project</Button></footer>
    </form></Modal>}
    {active === 'confirm' && <Modal label="Archive project preview" onClose={close}><div className="overlay-form"><header className="overlay-heading"><h2>Archive this project?</h2><button type="button" aria-label="Close confirmation" onClick={close}><X /></button></header><p className="muted">Move it out of your active projects. You can bring it back whenever you need it.</p><footer className="overlay-actions"><Button autoFocus variant="text" onClick={close}>Keep project</Button><Button onClick={() => { setMessage('Project archived in this preview.'); close(); }}>Archive project</Button></footer></div></Modal>}
    {active === 'panel' && <SidePanel title="A closer look." onClose={close}><form className="overlay-form" onSubmit={e => { e.preventDefault(); if (!task.trim()) return; setMessage('Preview saved: ' + task.trim() + ' · ' + status); close(); }}><span className="eyebrow">TASK PREVIEW</span><TextField autoFocus label="Task name" required value={task} onChange={e => setTask(e.target.value)} /><SelectField label="Status" value={status} onChange={e => setStatus(e.target.value)}>{['Preparing','Ready','Delivered'].map(value => <option key={value}>{value}</option>)}</SelectField><Card variant="filled"><h3>Space for the details.</h3><p>Comments, attachments and activity can live here when we connect the task page.</p></Card><footer className="overlay-actions"><Button variant="text" onClick={close}>Close</Button><Button type="submit" disabled={!task.trim()}>Save changes</Button></footer></form></SidePanel>}
  </section>;
}

