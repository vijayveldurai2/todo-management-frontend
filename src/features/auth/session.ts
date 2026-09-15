const KEY = 'mynaa.session';
let memory: string | null = null;
export function readToken(): string | null { try { return sessionStorage.getItem(KEY) || memory; } catch { return memory; } }
export function saveToken(token: string) { memory = token; try { sessionStorage.setItem(KEY, token); } catch { /* Memory-only session when storage is unavailable. */ } }
export function clearToken() { memory = null; try { sessionStorage.removeItem(KEY); } catch { /* Storage may be unavailable. */ } }
