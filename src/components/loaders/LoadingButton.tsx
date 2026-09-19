import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { ButtonLoader } from './Indicators';
interface Props extends ButtonHTMLAttributes<HTMLButtonElement> { loading: boolean; loadingLabel?: string; children: ReactNode }
export function LoadingButton({ loading, loadingLabel = 'Please wait…', children, disabled, type = 'button', className = '', ...props }: Props) {
  return <button {...props} type={type} disabled={disabled || loading} aria-busy={loading} className={'loading-button ' + className}>
    <span className="button-content" style={{ visibility: loading ? 'hidden' : undefined }} aria-hidden={loading || undefined}>{children}</span>
    {loading && <span className="button-pending"><ButtonLoader />{loadingLabel}</span>}
  </button>;
}
