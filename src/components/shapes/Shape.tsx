import type { CSSProperties, ReactNode } from 'react';
import { shapePaths, type ShapeName } from './paths';
export { shapeNames } from './paths';
export type { ShapeName } from './paths';
export function Shape({ name = 'cookie-6', size = 120, color, label, className = '' }: { name?: ShapeName; size?: number | string; color?: string; label?: string; className?: string }) {
  return <svg viewBox="0 0 100 100" width={size} height={size} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true} focusable="false" className={'m3-shape ' + className} style={{ color, width: size, height: size }}><path d={shapePaths[name]} fill="currentColor" /></svg>;
}
export function ShapeFrame({ name = 'cookie-6', size = 220, children, className = '' }: { name?: ShapeName; size?: number | string; children: ReactNode; className?: string }) {
  return <span className={'shape-frame ' + className} style={{ width: size } as CSSProperties}><Shape name={name} size="100%" /><span className="shape-frame-content">{children}</span></span>;
}


