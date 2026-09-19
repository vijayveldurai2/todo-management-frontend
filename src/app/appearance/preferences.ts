export type Theme = 'system' | 'light' | 'dark';
export type Motion = 'off' | 'subtle' | 'standard';
export interface Preferences { theme: Theme; motion: Motion }
export const key = 'mynaa.appearance';
export function parsePreferences(raw: string | null): Preferences {
  let value: Partial<Preferences> | null = null;
  try { value = JSON.parse(raw || '{}'); } catch { /* Use defaults for corrupt storage. */ }
  return {
    theme: value && ['system','light','dark'].includes(value.theme || '') ? value.theme! : 'system',
    motion: value && ['off','subtle','standard'].includes(value.motion || '') ? value.motion! : 'subtle',
  };
}
export function readPreferences(): Preferences { try { return parsePreferences(localStorage.getItem(key)); } catch { return parsePreferences(null); } }
export function applyPreferences(preferences: Preferences) {
  const root = document.documentElement;
  root.dataset.theme = preferences.theme; root.dataset.motion = preferences.motion;
  root.style.colorScheme = preferences.theme === 'system' ? 'light dark' : preferences.theme;
}
