import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { AppearanceProvider } from './app/appearance/AppearanceProvider';

import { store } from './app/store';
import { router } from './app/router';
import './styles/index.css';
import './styles/auth.css';
import './styles/appearance.css';
import './styles/components.css';
createRoot(document.getElementById('root')!).render(<StrictMode><Provider store={store}><AppearanceProvider><RouterProvider router={router} /></AppearanceProvider></Provider></StrictMode>);
