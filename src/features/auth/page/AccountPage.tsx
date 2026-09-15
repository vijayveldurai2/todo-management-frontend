import { AppearanceMenu } from '../../../components/common/AppearanceMenu';
import { LoadingButton, PageLoader } from '../../../components/loaders';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import { useMeQuery, useLogoutMutation } from '../authApi';
import { clearToken } from '../session';
import { expired } from '../authSlice';
import { api } from '../../../services/api';
import { authError } from '../errors';
import { useState } from 'react';
export function AccountPage() {
  const authenticated = useAppSelector(s => s.session.authenticated);
  const { data: user, error, isLoading, refetch } = useMeQuery(undefined, { skip: !authenticated, refetchOnMountOrArgChange: true });
  const [logout, { isLoading: leaving, reset }] = useLogoutMutation();
  const [logoutError, setLogoutError] = useState('');
  const dispatch = useAppDispatch(), navigate = useNavigate();
  if (!authenticated) return <Navigate to="/_/login" replace />;
  return <div className="auth-shell"><header className="auth-header"><Link className="brand" to="/_/account"><span className="brand-mark">m</span>MYNAA</Link><LoadingButton loading={leaving} loadingLabel="Signing out…" onClick={async () => { setLogoutError(''); try {
    await logout().unwrap(); clearToken(); dispatch(expired()); dispatch(api.util.resetApiState()); navigate('/_/login', { replace: true });
  } catch (err) { setLogoutError(authError(err)); } finally { reset(); } }}>Sign out</LoadingButton><AppearanceMenu /></header>
    <main className="content">{isLoading ? <PageLoader /> : error ? <div role="alert"><p>{authError(error)}</p><button onClick={() => refetch()}>Try again</button></div> : user && <><h1>Welcome, {user.name || user.username}.</h1><p className="muted">{user.email}</p><p className="account-note">You’re signed in. Your workspace home is the next part we’re building.</p></>}{logoutError && <p role="alert" className="auth-error">{logoutError}</p>}</main></div>;
}
