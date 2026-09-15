import { LoadingButton } from '../../../components/loaders';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLoginMutation } from '../authApi';
import { saveToken } from '../session';
import { signedIn } from '../authSlice';
import { authError } from '../errors';
import { useAppDispatch } from '../../../app/store';
import { api } from '../../../services/api';
import { AuthLayout } from './AuthLayout';
import { PasswordField } from './PasswordField';
export function LoginPage() {
  const [login, setLogin] = useState(''), [password, setPassword] = useState(''), [error, setError] = useState('');
  const [submit, { isLoading, reset }] = useLoginMutation();
  const dispatch = useAppDispatch(), navigate = useNavigate();
  return <AuthLayout><div className="auth-form-heading"><h2>Welcome back.</h2><p className="muted">A fresh start, right where you left off.</p></div>
    <form className="auth-form" onSubmit={async e => { e.preventDefault(); if (isLoading) return; setError(''); try {
      const result = await submit({ login: login.trim(), password }).unwrap();
      if (!result.accessToken || result.tokenType !== 'Bearer') throw new Error('Unexpected login response');
      dispatch(api.util.resetApiState()); saveToken(result.accessToken); dispatch(signedIn()); setPassword(''); navigate('/_/account', { replace: true });
    } catch (err) { setError(authError(err)); } finally { reset(); } }}>
      <fieldset disabled={isLoading}><label className="auth-field" htmlFor="login">Email or username<input id="login" name="username" autoComplete="username" autoCapitalize="none" spellCheck={false} value={login} onChange={e => setLogin(e.target.value)} required /></label>
        <PasswordField value={password} onChange={setPassword} />
        {error && <p className="auth-error" role="alert">{error}</p>}
        <LoadingButton className="auth-submit" type="submit" loading={isLoading} loadingLabel="Signing in…">Sign in<ArrowRight /></LoadingButton>
      </fieldset>
    </form><p className="auth-alternate">New to MYNAA? <Link to="/_/register">Create an account</Link></p>
  </AuthLayout>;
}
