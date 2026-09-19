export function authError(error: unknown): string {
  if (!error || typeof error !== 'object') return 'Something went wrong. Please try again.';
  const e = error as { status?: number | string; data?: { message?: string } };
  if (typeof e.status === 'string') return 'We cannot reach MYNAA right now. Please try again shortly.';
  if (e.status === 401) return 'Your session has expired. Please sign in again.';
  if (e.status === 429) return 'Too many attempts. Please wait a moment and try again.';
  if (e.status && e.status >= 500) return 'We could not complete your request. Please try again. If you just registered, check your verification email first.';
  return e.data?.message || 'We could not complete your request. Please check your details.';
}
