import { LoadingButton } from '../../../components/loaders';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MailCheck } from 'lucide-react';
import { useSignupMutation } from '../authApi';
import { authError } from '../errors';
import { AuthLayout } from './AuthLayout';
import { PasswordField } from './PasswordField';
export function RegisterPage() {
  const [name, setName] = useState(''), [username, setUsername] = useState(''), [email, setEmail] = useState(''), [password, setPassword] = useState('');
  const [sent, setSent] = useState(''), [error, setError] = useState('');
  const [submit, { isLoading, reset }] = useSignupMutation();
  return <AuthLayout>{sent ? <div className="auth-success"><span className="auth-success-icon"><MailCheck /></span><h2>Check your inbox.</h2><p>We sent a verification link to <strong>{sent}</strong>. Open it to finish creating your account.</p><p className="muted">The link expires in 24 hours. Check your spam folder if you don’t see it.</p><Link className="auth-submit" to="/_/login">Back to sign in<ArrowRight /></Link></div> : <>
    <div className="auth-form-heading"><h2>Make yourself at home.</h2><p className="muted">A little less scattered. A little more together.</p></div>
    <form className="auth-form" onSubmit={async e => { e.preventDefault(); if (isLoading) return; setError(''); try {
      const result = await submit({ name: name.trim(), username: username.trim(), email: email.trim(), password }).unwrap(); setSent(result.email || email); setPassword('');
    } catch (err) { setError(authError(err)); } finally { reset(); } }}>
      <fieldset disabled={isLoading}>
        <label className="auth-field" htmlFor="name">Your name<input id="name" autoComplete="name" value={name} onChange={e => setName(e.target.value)} required /></label>
        <label className="auth-field" htmlFor="username">Username<input id="username" autoComplete="username" autoCapitalize="none" spellCheck={false} value={username} onChange={e => setUsername(e.target.value)} required /></label>
        <label className="auth-field" htmlFor="email">Email<input id="email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required /></label>
        <PasswordField creating value={password} onChange={setPassword} />
        {error && <p className="auth-error" role="alert">{error}</p>}
        <LoadingButton className="auth-submit" type="submit" loading={isLoading} loadingLabel="Creating account…">Create account<ArrowRight /></LoadingButton>
      </fieldset>
    </form><p className="auth-alternate">Already have an account? <Link to="/_/login">Sign in</Link></p>
  </>}</AuthLayout>;
}
