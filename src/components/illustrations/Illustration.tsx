export type IllustrationName = 'plant' | 'reading-side' | 'meditating';
export function Illustration({ name, label = '', size = 220 }: { name: IllustrationName; label?: string; size?: number }) {
  return <span className="filled-illustration" style={{ width: size }}><img src={'/illustrations/originals/' + name + '.svg'} alt={label} loading="lazy" /></span>;
}

