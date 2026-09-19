import React from 'react';

interface AuthHeaderProps {
  formMode: 'login' | 'signup';
}

export default function AuthHeader({ formMode }: AuthHeaderProps) {
  return (
    <div className="text-center mb-6">
      <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)] text-white font-extrabold text-xl flex items-center justify-center mx-auto mb-3 shadow-md shadow-indigo-500/20">
        <span className="material-symbols-outlined text-2xl">check_box</span>
      </div>
      <p className="text-xs font-extrabold uppercase tracking-widest text-[var(--color-primary)] mb-1">
        Todo Management API
      </p>
      <h1 className="text-2xl font-extrabold text-[var(--text-on-surface)] tracking-tight">
        {formMode === 'login' ? 'Welcome back' : 'Create an account'}
      </h1>
      <p className="text-xs text-[var(--text-on-surface-variant)] mt-1">
        {formMode === 'login'
          ? 'Sign in with your email/username & password'
          : 'Register your account to manage team tasks'}
      </p>
    </div>
  );
}
