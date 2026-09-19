let memoryToken: string | null = null;
export function readToken(): string | null { return memoryToken; }
export function saveToken(token: string) { memoryToken = token; }
export function clearToken() { memoryToken = null; }
