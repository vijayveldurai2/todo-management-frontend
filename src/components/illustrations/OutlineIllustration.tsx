import type { CSSProperties } from 'react';
export type IllustrationName = 'plant' | 'reading-side' | 'meditating';
export function OutlineIllustration({ name, label, size = 220 }: { name: IllustrationName; label?: string; size?: number }) {
  return <span role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true} className="outline-illustration" style={{ width: size, '--illustration-url': `url("/illustrations/${name}-outline.svg")` } as CSSProperties} />;
}
