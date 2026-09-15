import { AppearanceMenu } from '../common/AppearanceMenu';
import { Outlet } from 'react-router-dom';
import { Navigation } from '../../features/navigation/Navigation';
export function RootLayout() { return <div className="app-shell"><Navigation /><div className="app-appearance"><AppearanceMenu /></div><Outlet /><footer className="demo-note">Design preview · Sample data resets when you reload</footer></div>; }
