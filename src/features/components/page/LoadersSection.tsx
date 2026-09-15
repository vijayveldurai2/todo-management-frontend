import { useState } from 'react';
import { Card } from '../../../components/ui';
import { PageLoader, CircularLoader, LinearLoader, ZigzagLoader, Skeleton } from '../../../components/loaders';
export function LoadersSection() {
  const [value, setValue] = useState(45);
  return <section id="loaders" className="catalog-section"><span className="eyebrow">04 / WAITING, GENTLY</span><h2>A little movement. Clear feedback.</h2><p className="muted">Motion follows your appearance settings and your device’s reduced-motion preference.</p><div className="catalog-grid">
    <Card><h3>Page loading</h3><PageLoader label="Opening your workspace…" /></Card>
    <Card><h3>Circular & linear</h3><div className="loader-samples"><span role="status"><CircularLoader /><span className="sr-only">Loading example</span></span><LinearLoader label="Indeterminate preview" /><LinearLoader value={value} label="Example progress" /><label className="progress-demo">Progress: {value}%<input type="range" min="0" max="100" value={value} onChange={e => setValue(Number(e.target.value))} /></label></div></Card>
    <Card><h3>SVG wave / zigzag</h3><div className="loader-samples"><ZigzagLoader label="Gathering your tasks…" /><Skeleton width="75%" /><Skeleton /><Skeleton width="55%" /></div><p className="muted">A continuous wave, with static feedback when motion is off.</p></Card>
  </div></section>;
}
