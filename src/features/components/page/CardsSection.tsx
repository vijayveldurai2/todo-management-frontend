import { useState } from 'react';
import { Folder, ArrowUpRight } from 'lucide-react';
import { Card, Button } from '../../../components/ui';
export function CardsSection() {
  const [selected, setSelected] = useState('outlined');
  return <section id="cards" className="catalog-section"><span className="eyebrow">02 / COLLECTIONS</span><h2>A quiet home for projects.</h2><p className="muted">Compare the same content across three surface styles.</p>
    <div className="catalog-grid">{(['outlined','filled','elevated'] as const).map((variant, i) => <Card key={variant} variant={variant}><span className={'catalog-symbol shape-' + i}><Folder /></span><span className="catalog-tag">{variant}</span><h3>Website redesign</h3><p className="muted">A shared space for ideas, details and the next small step.</p><div className="card-foot"><span className="muted">3 boards · 12 tasks</span><Button variant="text" aria-label={'Choose ' + variant + ' card style'} aria-pressed={selected === variant} onClick={() => setSelected(variant)}>{selected === variant ? 'Selected' : 'Choose'}<ArrowUpRight /></Button></div></Card>)}</div>
    <p className="catalog-note" role="status">Selected surface: {selected}. Preview content only.</p>
  </section>;
}
