import { createContext, useContext, useLayoutEffect, useEffect, useState, type ReactNode } from 'react';
import { applyPreferences, readPreferences, parsePreferences, key, type Preferences } from './preferences';
const Context = createContext<{ preferences: Preferences; update: (value: Partial<Preferences>) => void; reduced: boolean } | null>(null);
export function AppearanceProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState(readPreferences);
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  useLayoutEffect(() => { applyPreferences(preferences); }, [preferences]);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setReduced(media.matches);
    const storage = (event: StorageEvent) => { if (event.key === key || event.key === null) setPreferences(parsePreferences(event.newValue)); };
    media.addEventListener('change', change); window.addEventListener('storage', storage);
    return () => { media.removeEventListener('change', change); window.removeEventListener('storage', storage); };
  }, []);
  const update = (value: Partial<Preferences>) => {
    const next = { ...preferences, ...value };
    setPreferences(next);
    try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* Preferences still work for this session. */ }
  };
  return <Context.Provider value={{ preferences, update, reduced }}>{children}</Context.Provider>;
}
export function useAppearance() { const value = useContext(Context); if (!value) throw new Error('AppearanceProvider is missing'); return value; }
