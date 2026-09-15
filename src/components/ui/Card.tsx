import type { HTMLAttributes } from 'react';
export function Card({ variant = 'outlined', className = '', ...props }: HTMLAttributes<HTMLElement> & { variant?: 'outlined' | 'filled' | 'elevated' }) {
  return <article {...props} className={'ui-card ui-card-' + variant + ' ' + className} />;
}
