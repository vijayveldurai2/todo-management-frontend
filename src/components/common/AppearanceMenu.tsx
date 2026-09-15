import { useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { Modal } from './Modal';
import { useAppearance } from '../../app/appearance/AppearanceProvider';
import type { Theme, Motion } from '../../app/appearance/preferences';
import { CircularLoader, LinearLoader, ZigzagLoader } from '../loaders';
export function AppearanceMenu() {
  const [open, setOpen] = useState(false);
  const { preferences, update, reduced } = useAppearance();
  return <><button className="appearance-trigger" type="button" aria-label="Appearance settings" aria-haspopup="dialog" onClick={() => setOpen(true)}><SlidersHorizontal /></button>
    {open && <Modal label="Appearance settings" onClose={() => setOpen(false)}>
      <div className="dialog-heading"><h2>Make it feel like you.</h2><button type="button" aria-label="Close appearance settings" onClick={() => setOpen(false)}><X /></button></div>
      <div className="appearance-settings">
        <fieldset><legend>Theme</legend><div className="appearance-options">{(['system','light','dark'] as Theme[]).map(theme => <label key={theme}><input type="radio" name="theme" checked={preferences.theme === theme} onChange={() => update({ theme })} />{theme}</label>)}</div></fieldset>
        <fieldset><legend>Motion</legend><div className="appearance-options">{(['off','subtle','standard'] as Motion[]).map(motion => <label key={motion}><input type="radio" name="motion" checked={preferences.motion === motion} onChange={() => update({ motion })} />{motion}</label>)}</div></fieldset>
        <p className="muted">{reduced ? 'Your device asks for reduced motion. Animations stay off.' : 'Subtle is the default. Off keeps every loading state readable without movement.'}</p>
        <details className="loader-preview"><summary>Preview loading styles</summary><div><CircularLoader /><LinearLoader value={45} label="Example progress" /><ZigzagLoader label="Loading preview" /></div></details>
        <small className="muted">Saved for this browser on this device.</small>
      </div>
    </Modal>}
  </>;
}
