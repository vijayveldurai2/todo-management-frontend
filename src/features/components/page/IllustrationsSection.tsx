import { useState } from 'react';
import { Illustration, type IllustrationName } from '../../../components/illustrations/Illustration';
import { Card, Button, Checkbox } from '../../../components/ui';
export function IllustrationsSection() {
  const [show, setShow] = useState(true), [message, setMessage] = useState('');
  const examples: { name: IllustrationName; title: string; body: string; action: string }[] = [
    { name:'plant', title:'Room for something new.', body:'Your next project starts with a small idea.', action:'Create project' },
    { name:'reading-side', title:'Nothing to catch up on.', body:'Updates will appear here when your team shares them.', action:'Browse projects' },
    { name:'meditating', title:'All clear for now.', body:'You have no tasks waiting for your attention.', action:'View all tasks' },
  ];
  return <section id="illustrations" className="catalog-section"><span className="eyebrow">05 / A HUMAN TOUCH</span><h2>Should the quiet moments have a face?</h2><Checkbox label="Show filled illustrations" checked={show} onChange={e => setShow(e.target.checked)} /><div className="catalog-grid">{examples.map(example => <Card className="empty-preview" key={example.name}>{show && <Illustration name={example.name} />}<h3>{example.title}</h3><p className="muted">{example.body}</p><Button variant="outlined" onClick={() => setMessage(example.action + ' selected in preview.')}>{example.action}</Button></Card>)}</div><p className="catalog-note" role="status">{message || 'Illustrations are optional. Turn them off to compare the same layout.'}</p><p className="catalog-note">Original filled illustrations from <a href="https://www.opendoodles.com/about" target="_blank" rel="noreferrer">Open Doodles by Pablo Stanley (CC0)</a>. Saved locally; no illustration service is loaded.</p></section>;
}
