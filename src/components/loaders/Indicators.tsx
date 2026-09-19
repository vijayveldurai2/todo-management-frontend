import { useId } from 'react';
export function CircularLoader({ size = 24 }: { size?: number }) {
  return <span aria-hidden="true" className="circular-loader" style={{ width: size, height: size }} />;
}
export function ButtonLoader() { return <CircularLoader size={16} />; }
export function LinearLoader({ value, label = 'Loading' }: { value?: number; label?: string }) {
  const progress = value === undefined ? undefined : Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
  return <div className={'linear-loader ' + (progress === undefined ? 'indeterminate' : '')} role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={progress === undefined ? undefined : { width: progress + '%' }} /></div>;
}
export function ZigzagLoader({ label = 'Loading' }: { label?: string }) {
  const id = useId();
  return <div className="zigzag-loader" role="status"><svg viewBox="0 0 180 24" aria-hidden="true">
    <defs><clipPath id={id}><rect width="180" height="24" rx="12" /></clipPath></defs>
    <g clipPath={'url(#' + id + ')'}><path className="zigzag-track" d="M-24 12 Q-18 2 -12 12 T0 12 T12 12 T24 12 T36 12 T48 12 T60 12 T72 12 T84 12 T96 12 T108 12 T120 12 T132 12 T144 12 T156 12 T168 12 T180 12 T192 12 T204 12" /><path className="zigzag-wave" d="M-24 12 Q-18 2 -12 12 T0 12 T12 12 T24 12 T36 12 T48 12 T60 12 T72 12 T84 12 T96 12 T108 12 T120 12 T132 12 T144 12 T156 12 T168 12 T180 12 T192 12 T204 12" /></g>
  </svg><span className="loader-label">{label}</span></div>;
}
