import { CircularLoader } from './Indicators';
export function PageLoader({ label = 'Opening your space…' }: { label?: string }) {
  return <div className="page-loader" role="status"><CircularLoader size={32} /><span>{label}</span></div>;
}
export function Skeleton({ width = '100%', height = 16, rounded = false }: { width?: number | string; height?: number; rounded?: boolean }) {
  return <span className={'skeleton ' + (rounded ? 'skeleton-round' : '')} style={{ width, height }} aria-hidden="true" />;
}
