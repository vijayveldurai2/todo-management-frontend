import { useState } from 'react';
import { Menu, X, Folder, CircleCheck, Bell, Settings, Building2 } from 'lucide-react';
import { Modal } from '../../../components/common/Modal';
import { Card, SelectField } from '../../../components/ui';
const destinations = [{ name: 'Projects', icon: Folder }, { name: 'My tasks', icon: CircleCheck }, { name: 'Notifications', icon: Bell }];
export function NavigationSection() {
  const [open, setOpen] = useState(false), [page, setPage] = useState('Projects');
  const [workspace, setWorkspace] = useState('Morning bakery');
  const choose = (name: string) => { setPage(name); setOpen(false); };
  return <section id="navigation" className="catalog-section"><span className="eyebrow">08 / ANOTHER WAY AROUND</span><h2>A menu when you need it.</h2><p className="muted">A small left drawer, with the rest of the screen left to your work.</p>
    <Card className="navigation-preview"><header className="navigation-preview-bar"><button type="button" aria-label="Open navigation preview" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}><Menu /></button><span className="brand">MYNAA</span><span className="muted navigation-preview-context">{workspace}</span></header><div className="navigation-preview-body"><span className="eyebrow">NAVIGATION PREVIEW</span><h3>{page}</h3><p className="muted">Use the menu beside MYNAA to try the drawer. Your current project and board would remain in the top breadcrumbs.</p></div></Card>
    <p className="catalog-note" role="status">Preview only · {workspace} / {page}. This compares navigation styles without changing application routes.</p>
    {open && <Modal label="Navigation preview" onClose={() => setOpen(false)} className="navigation-drawer"><div className="navigation-drawer-layout"><header className="overlay-heading"><span className="brand">MYNAA</span><button type="button" aria-label="Close navigation" onClick={() => setOpen(false)}><X /></button></header>
      <div className="navigation-workspace"><Building2 /><SelectField label="Workspace" value={workspace} onChange={e => { setWorkspace(e.target.value); setPage('Projects'); }}><option>Morning bakery</option><option>Design studio</option></SelectField></div>
      <nav aria-label="Main navigation preview">{destinations.map(({ name, icon: Icon }) => <button type="button" key={name} aria-current={page === name ? 'page' : undefined} onClick={() => choose(name)}><Icon /><span>{name}</span></button>)}</nav>
      <footer><button type="button" aria-current={page === 'Settings' ? 'page' : undefined} onClick={() => choose('Settings')}><Settings /><span>Settings</span></button><small className="muted">Navigation preview</small></footer>
    </div></Modal>}
  </section>;
}

