import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
export function PasswordField({ value, onChange, creating = false }: { value: string; onChange: (value: string) => void; creating?: boolean }) {
  const [shown, setShown] = useState(false);
  return <label className="auth-field" htmlFor="password">Password<span className="password-wrap">
    <input id="password" name="password" type={shown ? 'text' : 'password'} autoComplete={creating ? 'new-password' : 'current-password'} value={value} onChange={e => onChange(e.target.value)} required />
    <button type="button" aria-label={shown ? 'Hide password' : 'Show password'} aria-pressed={shown} onClick={() => setShown(!shown)}>{shown ? <EyeOff /> : <Eye />}</button>
  </span></label>;
}
