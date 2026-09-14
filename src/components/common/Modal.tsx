import { useEffect, useRef, type ReactNode } from 'react';
export function Modal({ label, onClose, children }: { label: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const dialog = ref.current!; dialog.showModal(); return () => dialog.close(); }, []);
  return <dialog ref={ref} aria-label={label} onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) onClose(); }}><div className="dialog-content">{children}</div></dialog>;
}
