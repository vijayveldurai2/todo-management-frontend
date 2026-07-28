import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { loginWithEmail, loginWithOAuth } from '../../store/authSlice';
import { setActiveView } from '../../store/uiSlice';

type DemoState = 'default' | 'error' | 'loading';

interface LoginViewProps {
  initialMode?: 'login' | 'signup';
}

export const LoginView: React.FC<LoginViewProps> = ({ initialMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { isLoading: reduxLoading } = useAppSelector((state) => state.auth);

  // Form Mode: 'login' or 'signup'
  const isSignupPath = location.pathname.includes('/signup') || initialMode === 'signup';
  const [formMode, setFormMode] = useState<'login' | 'signup'>(isSignupPath ? 'signup' : 'login');

  useEffect(() => {
    if (location.pathname.includes('/signup')) {
      setFormMode('signup');
    } else if (location.pathname.includes('/login')) {
      setFormMode('login');
    }
  }, [location.pathname]);

  // Interactive Demo State Quick Switcher
  const [demoState, setDemoState] = useState<DemoState>('default');

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('you@company.com');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);

  // Local state handling
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [forgotSent, setForgotSent] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Compute active states based on demo switch or local action
  const isErrorState = demoState === 'error' || Boolean(errorMessage);
  const isLoadingState = demoState === 'loading' || isLocalLoading || reduxLoading;

  const activeErrorMessage =
    errorMessage || (demoState === 'error' ? 'Incorrect email or password. Please try again.' : null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoadingState) return;

    // Validation check
    if (!email || !email.includes('@') || password.length < 3) {
      setErrorMessage('Incorrect email or password. Please check your credentials.');
      return;
    }

    setErrorMessage(null);
    setIsLocalLoading(true);

    setTimeout(() => {
      setIsLocalLoading(false);
      dispatch(loginWithEmail(email || 'user@company.com'));
      dispatch(setActiveView('workspace'));
      navigate('/main-workspace');
    }, 1200);
  };

  const handleOAuth = (provider: 'google' | 'github') => {
    if (isLoadingState) return;
    setIsLocalLoading(true);
    setTimeout(() => {
      setIsLocalLoading(false);
      dispatch(loginWithOAuth(provider));
      dispatch(setActiveView('workspace'));
      navigate('/main-workspace');
    }, 1000);
  };

  const handleSelectDemoState = (state: DemoState) => {
    setDemoState(state);
    if (state === 'error') {
      setErrorMessage('Incorrect email or password. Please try again.');
    } else {
      setErrorMessage(null);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-between p-4 sm:p-6 bg-gradient-to-br from-indigo-50/70 via-slate-50 to-indigo-100/50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/40 text-[var(--text-on-surface)] transition-colors relative overflow-x-hidden">
      {/* Decorative Subtle Background Graphics */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* TOP HEADER BAR: DEMO STATE SWITCHER & QUICK ACCESS */}
      <div className="w-full max-w-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 z-10">
        <div className="flex items-center gap-1.5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-1 rounded-2xl border border-[var(--border-outline-variant)] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-on-surface-variant)] px-2.5">
            Preview State:
          </span>
          <button
            type="button"
            onClick={() => handleSelectDemoState('default')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              demoState === 'default' && !errorMessage
                ? 'bg-[var(--color-primary)] text-white shadow-2xs'
                : 'text-[var(--text-on-surface-variant)] hover:text-[var(--text-on-surface)]'
            }`}
          >
            Default State
          </button>
          <button
            type="button"
            onClick={() => handleSelectDemoState('error')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              demoState === 'error'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30'
            }`}
          >
            Error State
          </button>
          <button
            type="button"
            onClick={() => handleSelectDemoState('loading')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              demoState === 'loading'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30'
            }`}
          >
            Loading State
          </button>
        </div>

        <button
          onClick={() => {
            dispatch(setActiveView('workspace'));
            navigate('/main-workspace');
          }}
          className="text-xs font-semibold text-[var(--text-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors flex items-center gap-1 cursor-pointer"
        >
          <span>Skip to App Preview</span>
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </div>

      {/* CENTERED CARD PANEL (~400px max width) */}
      <div className="w-full max-w-[400px] my-auto bg-[var(--bg-surface-container-lowest)] border border-[var(--border-outline-variant)] rounded-2xl shadow-xl p-6 sm:p-8 z-10 transition-all duration-200">
        {/* APP LOGO + NAME */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)] text-white font-extrabold text-xl flex items-center justify-center mx-auto mb-3 shadow-md shadow-indigo-500/20">
            <span className="material-symbols-outlined text-2xl">check_box</span>
          </div>
          <p className="text-xs font-extrabold uppercase tracking-widest text-[var(--color-primary)] mb-1">
            Todo Management
          </p>
          <h1 className="text-2xl font-extrabold text-[var(--text-on-surface)] tracking-tight">
            {formMode === 'login' ? 'Welcome back' : 'Create an account'}
          </h1>
          <p className="text-xs text-[var(--text-on-surface-variant)] mt-1">
            {formMode === 'login' ? 'Log in to your workspace' : 'Start organizing your tasks effortlessly'}
          </p>
        </div>

        {/* ERROR STATE BANNER */}
        {isErrorState && activeErrorMessage && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-start gap-2.5 animate-in fade-in zoom-in-95 duration-200">
            <span className="material-symbols-outlined text-base shrink-0 mt-0.5 text-rose-600">
              error
            </span>
            <span className="leading-snug">{activeErrorMessage}</span>
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name field (Sign Up Mode) */}
          {formMode === 'signup' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-on-surface-variant)] mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                disabled={isLoadingState}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface-container-low)] border border-[var(--border-outline-variant)] text-xs font-medium text-[var(--text-on-surface)] outline-none focus:border-[var(--color-primary)] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
          )}

          {/* EMAIL FIELD */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-on-surface-variant)] mb-1.5">
              Email address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                disabled={isLoadingState}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="you@company.com"
                className={`w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface-container-low)] text-xs font-medium text-[var(--text-on-surface)] outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                  isErrorState
                    ? 'border-2 border-rose-500 bg-rose-50/30 dark:bg-rose-950/20 text-rose-900 dark:text-rose-100 focus:border-rose-600'
                    : 'border border-[var(--border-outline-variant)] focus:border-[var(--color-primary)]'
                }`}
              />
              {isErrorState && (
                <span className="material-symbols-outlined text-rose-500 text-sm absolute right-3 top-2.5 pointer-events-none">
                  warning
                </span>
              )}
            </div>
          </div>

          {/* PASSWORD FIELD */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-on-surface-variant)] mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                disabled={isLoadingState}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="••••••••••••"
                className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-[var(--bg-surface-container-low)] text-xs font-medium text-[var(--text-on-surface)] outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                  isErrorState
                    ? 'border-2 border-rose-500 bg-rose-50/30 dark:bg-rose-950/20 text-rose-900 dark:text-rose-100 focus:border-rose-600'
                    : 'border border-[var(--border-outline-variant)] focus:border-[var(--color-primary)]'
                }`}
              />
              <button
                type="button"
                disabled={isLoadingState}
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-2.5 text-[var(--text-on-surface-variant)] hover:text-[var(--text-on-surface)] cursor-pointer disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-lg">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>

            {/* FORGOT PASSWORD LINK (Right-aligned under password) */}
            {formMode === 'login' && (
              <div className="flex justify-end mt-1.5">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs font-semibold text-[var(--color-primary)] hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
            )}
          </div>

          {/* PRIMARY BUTTON: LOG IN / SIGN UP */}
          <button
            type="submit"
            disabled={isLoadingState}
            className="w-full py-2.5 px-4 rounded-xl bg-[var(--color-primary)] text-white font-bold text-xs shadow-md shadow-indigo-500/20 hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isLoadingState ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>{formMode === 'login' ? 'Logging in...' : 'Creating account...'}</span>
              </>
            ) : (
              <span>{formMode === 'login' ? 'Log In' : 'Sign Up'}</span>
            )}
          </button>
        </form>

        {/* DIVIDER WITH "or" TEXT */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--border-outline-variant)]" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-bold text-[var(--text-on-surface-variant)]">
            <span className="bg-[var(--bg-surface-container-lowest)] px-2.5">or</span>
          </div>
        </div>

        {/* SECONDARY BUTTONS (GOOGLE & GITHUB) */}
        <div className="space-y-2.5">
          <button
            type="button"
            disabled={isLoadingState}
            onClick={() => handleOAuth('google')}
            className="w-full py-2.5 px-4 rounded-xl border border-[var(--border-outline-variant)] bg-[var(--bg-surface-container-low)] hover:bg-[var(--bg-surface-container-high)] text-[var(--text-on-surface)] font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-2.5 disabled:opacity-60"
          >
            {/* Google Multicolor SVG Icon */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <button
            type="button"
            disabled={isLoadingState}
            onClick={() => handleOAuth('github')}
            className="w-full py-2.5 px-4 rounded-xl border border-[var(--border-outline-variant)] bg-[var(--bg-surface-container-low)] hover:bg-[var(--bg-surface-container-high)] text-[var(--text-on-surface)] font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-2.5 disabled:opacity-60"
          >
            {/* GitHub SVG Icon */}
            <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span>Continue with GitHub</span>
          </button>
        </div>

        {/* FOOTER: DON'T HAVE AN ACCOUNT? SIGN UP */}
        <div className="mt-6 text-center pt-4 border-t border-[var(--border-outline-variant)]">
          <p className="text-xs text-[var(--text-on-surface-variant)]">
            {formMode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => {
                const nextMode = formMode === 'login' ? 'signup' : 'login';
                setFormMode(nextMode);
                setErrorMessage(null);
                navigate(nextMode === 'signup' ? '/signup' : '/login');
              }}
              className="font-bold text-[var(--color-primary)] hover:underline cursor-pointer"
            >
              {formMode === 'login' ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>
      </div>

      {/* FOOTER: SMALL PRINT TERMS & PRIVACY */}
      <div className="my-4 text-center z-10">
        <p className="text-[11px] text-[var(--text-on-surface-variant)] flex items-center justify-center gap-3">
          <a href="#terms" onClick={(e) => e.preventDefault()} className="hover:underline">
            Terms of Service
          </a>
          <span>•</span>
          <a href="#privacy" onClick={(e) => e.preventDefault()} className="hover:underline">
            Privacy Policy
          </a>
          <span>•</span>
          <a href="#help" onClick={(e) => e.preventDefault()} className="hover:underline">
            Help & Support
          </a>
        </p>
      </div>

      {/* FORGOT PASSWORD INLINE MODAL */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-[var(--bg-surface-container-lowest)] border border-[var(--border-outline-variant)] rounded-2xl shadow-2xl w-full max-w-sm p-6 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                setShowForgotModal(false);
                setForgotSent(false);
              }}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-[var(--bg-surface-container-high)] text-[var(--text-on-surface-variant)] cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-[var(--color-primary)] flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-xl">lock_reset</span>
            </div>

            <h3 className="text-base font-bold text-[var(--text-on-surface)] mb-1">
              Reset Password
            </h3>
            <p className="text-xs text-[var(--text-on-surface-variant)] mb-4">
              Enter your account email address to receive password reset instructions.
            </p>

            {forgotSent ? (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-base">check_circle</span>
                <span>Reset link sent! Check your email inbox.</span>
              </div>
            ) : (
              <div className="space-y-3 mb-4">
                <input
                  type="email"
                  defaultValue={email}
                  placeholder="you@company.com"
                  className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-surface-container-low)] border border-[var(--border-outline-variant)] text-xs text-[var(--text-on-surface)] outline-none focus:border-[var(--color-primary)]"
                />
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotSent(false);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-[var(--bg-surface-container-high)] text-[var(--text-on-surface)] text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
              {!forgotSent && (
                <button
                  onClick={() => setForgotSent(true)}
                  className="px-4 py-1.5 rounded-xl bg-[var(--color-primary)] text-white text-xs font-semibold cursor-pointer hover:opacity-90"
                >
                  Send Link
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
