import { useState } from 'react';
import { TextField, SelectField, Checkbox } from '../../../components/ui';
export function FieldsSection() {
  const [title, setTitle] = useState(''), [status, setStatus] = useState('ready'), [notify, setNotify] = useState(true);
  return <section id="fields" className="catalog-section"><span className="eyebrow">03 / INPUTS</span><h2>Easy to fill. Easy to understand.</h2>
    <div className="catalog-grid fields-grid"><TextField label="Outlined textbox" placeholder="Give your project a name" value={title} onChange={e => setTitle(e.target.value)} hint="A clear name helps everyone find it." /><TextField variant="filled" label="Filled textbox" placeholder="What needs doing?" /><TextField label="Validation state" type="email" defaultValue="anya@" error="Enter a complete email address." /><TextField label="Disabled textbox" value="Managed by your workspace" disabled />
      <SelectField label="Outlined select" value={status} onChange={e => setStatus(e.target.value)}><option value="preparing">Preparing</option><option value="ready">Ready</option><option value="delivered">Delivered</option></SelectField><SelectField variant="filled" label="Filled select" defaultValue="team"><option value="team">Everyone in the project</option><option value="assigned">Assigned people only</option></SelectField></div>
    <div className="specimen-row"><Checkbox label="Notify me about updates" hint="Personal notification preference" checked={notify} onChange={e => setNotify(e.target.checked)} /><Checkbox label="Include completed tasks" /><Checkbox label="Workspace default" defaultChecked disabled /></div><p className="catalog-note" role="status">Status: {status}. Notifications {notify ? 'on' : 'off'}.</p>
  </section>;
}
