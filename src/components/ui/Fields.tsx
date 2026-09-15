import { useId, type InputHTMLAttributes, type SelectHTMLAttributes, type ReactNode } from 'react';
type FieldMeta = { label: string; hint?: string; error?: string; variant?: 'outlined' | 'filled' };
export function TextField({ label, hint, error, variant = 'outlined', id: suppliedId, ...props }: InputHTMLAttributes<HTMLInputElement> & FieldMeta) {
  const generated = useId(), id = suppliedId || generated;
  return <div className={'ui-field ui-field-' + variant}><label htmlFor={id}>{label}</label><input {...props} id={id} aria-invalid={!!error || undefined} aria-describedby={[props['aria-describedby'], (error || hint) && id + '-help'].filter(Boolean).join(' ') || undefined} />{(error || hint) && <small className={error ? 'ui-error' : 'muted'} id={id + '-help'}>{error || hint}</small>}</div>;
}
export function SelectField({ label, hint, error, variant = 'outlined', children, id: suppliedId, ...props }: SelectHTMLAttributes<HTMLSelectElement> & FieldMeta & { children: ReactNode }) {
  const generated = useId(), id = suppliedId || generated;
  return <div className={'ui-field ui-field-' + variant}><label htmlFor={id}>{label}</label><select {...props} id={id} aria-invalid={!!error || undefined} aria-describedby={[props['aria-describedby'], (error || hint) && id + '-help'].filter(Boolean).join(' ') || undefined}>{children}</select>{(error || hint) && <small id={id + '-help'} className={error ? 'ui-error' : 'muted'}>{error || hint}</small>}</div>;
}
export function Checkbox({ label, hint, id: suppliedId, ...props }: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & { label: string; hint?: string }) {
  const generated = useId(), id = suppliedId || generated;
  return <label className="ui-checkbox" htmlFor={id}><input {...props} type="checkbox" id={id} aria-describedby={hint ? id + '-help' : props['aria-describedby']} /><span>{label}{hint && <small id={id + '-help'}>{hint}</small>}</span></label>;
}
