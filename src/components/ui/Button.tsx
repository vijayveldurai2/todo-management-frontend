import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { ButtonLoader } from '../loaders';
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'filled' | 'tonal' | 'outlined' | 'text' | 'danger';
  shape?: 'pill' | 'soft' | 'cut'; size?: 'small' | 'medium' | 'large';
  loading?: boolean; loadingLabel?: string; children: ReactNode;
}
export function Button({ variant = 'filled', shape = 'pill', size = 'medium', loading = false, loadingLabel = 'Working…', children, className = '', disabled, type = 'button', ...props }: ButtonProps) {
  return <button {...props} type={type} disabled={disabled || loading} aria-busy={loading || undefined} className={`ui-button ui-button-${variant} ui-size-${size} ui-shape-${shape} ${className}`}>
    {loading && <ButtonLoader />}{loading ? loadingLabel : children}
  </button>;
}
