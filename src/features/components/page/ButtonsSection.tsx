import { useState, useEffect, useRef } from 'react';
import { Plus, ArrowRight, Heart, Trash2 } from 'lucide-react';
import { Button, SelectField, type ButtonProps } from '../../../components/ui';
export function ButtonsSection() {
  const [shape, setShape] = useState<ButtonProps['shape']>('pill'), [loading, setLoading] = useState(false), [liked, setLiked] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  return <section id="buttons" className="catalog-section"><div className="catalog-section-heading"><div><span className="eyebrow">01 / ACTIONS</span><h2>Buttons that know their place.</h2></div><SelectField label="Button shape" value={shape} onChange={e => setShape(e.target.value as ButtonProps['shape'])}><option value="pill">Pill</option><option value="soft">Soft square</option><option value="cut">Asymmetric</option></SelectField></div>
    <div className="specimen-row">{(['filled','tonal','outlined','text','danger'] as const).map(variant => <div className="specimen" key={variant}><Button variant={variant} shape={shape} onClick={() => setLiked(!liked)}>{variant === 'danger' ? <Trash2 /> : <Plus />}{variant === 'danger' ? 'Remove' : 'Add task'}</Button><small>{variant}</small></div>)}</div>
    <div className="specimen-row"><Button shape={shape} size="small">Small</Button><Button shape={shape}>Medium</Button><Button shape={shape} size="large">Large<ArrowRight /></Button><Button shape={shape} disabled>Disabled</Button><Button shape={shape} variant="outlined" aria-label={liked ? 'Remove favorite' : 'Add favorite'} aria-pressed={liked} onClick={() => setLiked(!liked)}><Heart fill={liked ? 'currentColor' : 'none'} /></Button><Button shape={shape} loading={loading} loadingLabel="Saving…" onClick={() => { setLoading(true); timer.current = setTimeout(() => setLoading(false), 1800); }}>Try loading</Button></div>
    <p className="catalog-note" role="status">{liked ? 'Favorite selected.' : 'Try the shapes, sizes and loading state. These actions affect this preview only.'}</p>
  </section>;
}
