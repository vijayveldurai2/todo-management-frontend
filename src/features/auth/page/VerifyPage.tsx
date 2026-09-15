import { LoadingButton } from '../../../components/loaders';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useVerifyEmailMutation } from '../authApi';
import { authError } from '../errors';
import { AuthLayout } from './AuthLayout';
export function VerifyPage() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [verify, { isLoading, reset }] = useVerifyEmailMutation();
  const [done, setDone] = useState(false), [error, setError] = useState('');
  return <AuthLayout><div className="auth-success"><h2>{done ? 'You’re all set.' : 'Verify your email.'}</h2>
    <p>{done ? 'Your email is verified. You can now sign in to MYNAA.' : token ? 'One last step to make this space yours.' : 'Open the verification link from your email to continue.'}</p>
    {token && !done && <LoadingButton className="auth-submit" loading={isLoading} loadingLabel="Verifying…" onClick={async () => { setError(''); try { await verify(token).unwrap(); setDone(true); } catch (err) { setError(authError(err)); } finally { reset(); } }}>Verify email</LoadingButton>}
    {error && <p role="alert" className="auth-error">{error}</p>}<Link to="/_/login">Back to sign in</Link></div></AuthLayout>;
}
