import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
export function Modal({ label, onClose, children, className = '' }: { label: string; onClose: () => void; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!, previous = document.activeElement as HTMLElement | null;
    dialog.showModal();
    return () => { dialog.close(); previous?.focus(); };
  }, []);
  return createPortal(<dialog ref={ref} className={'mynaa-modal ' + className} aria-label={label}
    onCancel={e => { e.preventDefault(); onClose(); }}
    onClick={e => {
      if (e.target !== e.currentTarget) return;
      const box = e.currentTarget.getBoundingClientRect();
      if (e.clientX < box.left || e.clientX > box.right || e.clientY < box.top || e.clientY > box.bottom) onClose();
    }}><div className="dialog-content">{children}</div></dialog>, document.body);
}

