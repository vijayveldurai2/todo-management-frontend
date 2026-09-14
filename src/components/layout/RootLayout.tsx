import { Outlet } from 'react-router-dom';
import { Navigation } from '../../features/navigation/Navigation';
export function RootLayout() { return <div className="app-shell"><Navigation /><Outlet /><footer className="demo-note">Design preview · Sample data resets when you reload</footer></div>; }
