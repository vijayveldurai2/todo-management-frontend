import { useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../ui';
export function Popover({ label, children }: { label: string; children: (close: () => void) => ReactNode }) {
  const id = useId(), anchor = useRef<HTMLButtonElement>(null), panel = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const close = () => { setOpen(false); anchor.current?.focus(); };
  useLayoutEffect(() => {
    if (!open) return;
    const position = () => {
      const rect = anchor.current!.getBoundingClientRect(), popup = panel.current!;
      const width = popup.offsetWidth, height = popup.offsetHeight;
      popup.style.left = Math.max(12, Math.min(rect.left, window.innerWidth - width - 12)) + 'px';
      popup.style.top = Math.max(12, Math.min(rect.bottom + 8, window.innerHeight - height - 12)) + 'px';
    };
    position();
    panel.current?.focus();
    const outside = (e: PointerEvent) => {
      if (!panel.current?.contains(e.target as Node) && !anchor.current?.contains(e.target as Node)) setOpen(false);
    };
    const escape = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.preventDefault(); close(); } };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    window.addEventListener('resize', position);
    window.addEventListener('scroll', position, true);
    return () => {
      document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape);
      window.removeEventListener('resize', position); window.removeEventListener('scroll', position, true);
    };
  }, [open]);
  return <><button ref={anchor} type="button" className="ui-button ui-button-outlined ui-shape-pill" aria-expanded={open} aria-haspopup="dialog" aria-controls={open ? id : undefined} onClick={() => setOpen(!open)}>{label}</button>
    {open && createPortal(<div ref={panel} id={id} role="dialog" aria-label={label} tabIndex={-1} className="ui-popover"
      onBlur={e => { if (e.relatedTarget && !e.currentTarget.contains(e.relatedTarget as Node) && e.relatedTarget !== anchor.current) setOpen(false); }}>
      {children(close)}<Button variant="text" size="small" onClick={close}>Done</Button>
    </div>, document.body)}</>;
}

