import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './app/store';

export function App() {
  const dispatch = useAppDispatch();
  const { mode, colorTheme } = useAppSelector((state) => state.theme);

  // Sync theme classes to HTML document root
  useEffect(() => {
    const root = document.documentElement;

    if (mode === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }

    const colorClasses = ['theme-indigo', 'theme-emerald', 'theme-rose', 'theme-amber', 'theme-cyan', 'theme-violet'];
    root.classList.remove(...colorClasses);
    root.classList.add(`theme-${colorTheme}`);
  }, [mode, colorTheme]);

  // Render the matched route children
  return <Outlet />;
}

export default App;
