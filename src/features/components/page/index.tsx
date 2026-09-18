import { Link } from 'react-router-dom';
import { AppearanceMenu } from '../../../components/common/AppearanceMenu';
import { ButtonsSection } from './ButtonsSection';
import { CardsSection } from './CardsSection';
import { FieldsSection } from './FieldsSection';
import { LoadersSection } from './LoadersSection';
import { IllustrationsSection } from './IllustrationsSection';
import { OverlaysSection } from './OverlaysSection';
import { ShapesSection } from './ShapesSection';
export function ComponentsPage() {
  return <div className="catalog"><header className="catalog-header"><Link className="brand" to="/_/login"><span className="brand-mark">m</span>MYNAA</Link><div className="catalog-header-actions"><Link to="/_/login">Back to sign in</Link><AppearanceMenu /></div></header>
    <main className="catalog-main"><div className="catalog-intro"><span className="eyebrow">MYNAA / DESIGN WORKSHOP</span><h1>Components.</h1><p className="muted">A place to try, compare and settle the little details.</p></div><nav className="catalog-nav" aria-label="Component sections">{['Buttons','Cards','Fields','Loaders','Illustrations','Overlays','Shapes'].map(name => <a href={'#' + name.toLowerCase()} key={name}>{name}</a>)}</nav>
      <ButtonsSection /><CardsSection /><FieldsSection /><LoadersSection /><IllustrationsSection /><OverlaysSection /><ShapesSection />
    </main><footer className="auth-footer">MYNAA · Components in progress.</footer></div>;
}
