import { AppearanceMenu } from '../../../components/common/AppearanceMenu';
import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
export function AuthLayout({ children }: { children: ReactNode }) {
  return <div className="auth-shell">
    <header className="auth-header"><Link className="brand" to="/_/login" aria-label="MYNAA home"><span className="brand-mark" aria-hidden="true">m</span>MYNAA</Link><span className="auth-header-note">A little space. A clearer day.</span></header>
    <main className="auth-main"><section className="auth-story" aria-label="About MYNAA"><span className="eyebrow">MAKE ROOM FOR WHAT MATTERS</span><h1>Your work.<br />A little lighter.</h1><p>From the first idea to the last little detail.<br />A calm place to make things happen, together.</p><div className="auth-shapes" aria-hidden="true"><span /><span /><span /></div><span className="story-footnote">For your team. For your everyday.</span></section>
      <section className="auth-form-panel">{children}</section></main>
    <footer className="auth-footer">MYNAA · Room to get things done.<Link to="/_/components">Components</Link><AppearanceMenu /></footer>
  </div>;
}
