import { useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { Shape, ShapeFrame, shapeNames, type ShapeName } from '../../../components/shapes/Shape';
import { Card, SelectField } from '../../../components/ui';
export function ShapesSection() {
  const [name, setName] = useState<ShapeName>('cookie-6');
  const [tone, setTone] = useState('neutral');
  const title = (value: string) => value.replaceAll('-', ' ');
  return <section id="shapes" className={'catalog-section shape-workshop tone-' + tone}><span className="eyebrow">07 / A LITTLE CHARACTER</span><h2>Shapes with personality.</h2><p className="muted">Choose a silhouette. Try it small, large, or behind a little moment.</p>
    <div className="shape-controls"><SelectField label="Colour" value={tone} onChange={e => setTone(e.target.value)}><option value="neutral">Neutral</option><option value="sage">Sage</option><option value="lavender">Lavender</option><option value="peach">Peach</option></SelectField><a href="https://m3.material.io/styles/shape/overview-principles" target="_blank" rel="noreferrer">Google’s shape reference ↗</a></div>
    <div className="shape-library">{shapeNames.map(shape => <button className="shape-choice" type="button" key={shape} aria-pressed={name === shape} onClick={() => setName(shape)}><Shape name={shape} size={92} /><span>{title(shape)}</span></button>)}</div>
    <div className="catalog-grid">
      <Card variant="filled"><h3>Every size, still sharp.</h3><div className="shape-sizes"><Shape name={name} size={32} /><Shape name={name} size={64} /><Shape name={name} size={112} /></div><p className="muted">32 · 64 · 112 pixels</p><a className="shape-download" href={'/shapes/' + name + '.svg'} download>Download {title(name)} SVG ↓</a></Card>
      <Card><ShapeFrame name={name} size={136}><Check size={32} /></ShapeFrame><h3>A small moment of delight.</h3><p className="muted">A backdrop for an empty state, a welcome, or a completed task.</p></Card>
      <Card><ShapeFrame name={name} size={136}><Plus size={32} /></ShapeFrame><h3>Ready for your content.</h3><p className="muted">Layer an icon or illustration over the SVG. Keep the words comfortably outside.</p></Card>
    </div><p className="catalog-note">MYNAA interpretations inspired by Material 3 Expressive, not official Google assets. Hover or focus a shape for a gentle response; motion respects your appearance settings.</p>
  </section>;
}

