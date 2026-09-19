import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { Modal } from '../common/Modal';
export function SidePanel({ title, onClose, children, footer }: { title: string; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  return <Modal label={title} onClose={onClose} className="side-panel">
    <header className="overlay-heading"><h2>{title}</h2><button type="button" aria-label="Close side panel" onClick={onClose}><X /></button></header>
    <div className="side-panel-body">{children}</div>{footer && <footer className="overlay-actions">{footer}</footer>}
  </Modal>;
}

