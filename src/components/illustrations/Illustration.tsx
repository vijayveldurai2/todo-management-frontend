import { ShapeFrame, type ShapeName } from '../shapes/Shape';
export type IllustrationName = 'plant' | 'reading-side' | 'meditating';
const backdrops: Record<IllustrationName, ShapeName> = { plant: 'cookie-6', 'reading-side': 'fan', meditating: 'flower' };
export function Illustration({ name, label = '', size = 220 }: { name: IllustrationName; label?: string; size?: number }) {
  return <ShapeFrame name={backdrops[name]} size={size} className="illustration-frame"><img src={'/illustrations/originals/' + name + '.svg'} alt={label} loading="lazy" /></ShapeFrame>;
}

