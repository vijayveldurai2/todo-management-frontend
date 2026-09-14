import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../../app/store';
import AuthHeader from './AuthHeader';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import VerifyModal from './VerifyModal';
import OAuthButtons from './OAuthButtons';

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const isSignupPath = location.pathname.includes('/signup');
  const [formMode, setFormMode] = useState<'login' | 'signup'>(isSignupPath ? 'signup' : 'login');
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    setFormMode(location.pathname.includes('/signup') ? 'signup' : 'login');
  }, [location.pathname]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-between p-4 sm:p-6 bg-gradient-to-br from-indigo-50/70 via-slate-50 to-indigo-100/50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/40 text-[var(--text-on-surface)] transition-colors relative overflow-x-hidden">
      {/* Decorative Background Graphics */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar for Verify Token */}
      <div className="w-full max-w-xl mx-auto flex items-center justify-end mb-4 z-10">
        <button
          onClick={() => setShowVerifyModal(true)}
          className="text-xs font-semibold text-[var(--color-primary)] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">mark_email_read</span>
          <span>Verify Token</span>
        </button>
      </div>

      <div className="w-full max-w-[420px] my-auto bg-[var(--bg-surface-container-lowest)] border border-[var(--border-outline-variant)] rounded-2xl shadow-xl p-6 sm:p-8 z-10">
        <AuthHeader formMode={formMode} />

        {authError && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-start gap-2.5">
            <span className="material-symbols-outlined text-base shrink-0 mt-0.5 text-rose-600">error</span>
            <span className="leading-snug">{authError}</span>
          </div>
        )}

        {formMode === 'login' ? (
          <LoginForm onError={setAuthError} />
        ) : (
          <SignupForm onError={setAuthError} onSignupSuccess={() => {
            setFormMode('login');
            navigate('/_/login');
            setShowVerifyModal(true);
          }} />
        )}

        <OAuthButtons />

        <div className="mt-6 text-center pt-4 border-t border-[var(--border-outline-variant)]">
          <p className="text-xs text-[var(--text-on-surface-variant)]">
            {formMode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => {
                setAuthError(null);
                navigate(formMode === 'login' ? '/_/signup' : '/_/login');
              }}
              className="font-bold text-[var(--color-primary)] hover:underline cursor-pointer"
            >
              {formMode === 'login' ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>
      </div>

      {showVerifyModal && <VerifyModal onClose={() => setShowVerifyModal(false)} />}
    </div>
  );
}
