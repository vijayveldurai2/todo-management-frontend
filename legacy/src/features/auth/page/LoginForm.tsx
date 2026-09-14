import React, { useState } from 'react';
import { useLoginMutation } from '../../../services/authApi';
import { useAppDispatch } from '../../../app/store';

interface LoginFormProps {
  onError: (error: string | null) => void;
}

export default function LoginForm({ onError }: LoginFormProps) {
  const [login, { isLoading }] = useLoginMutation();
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    onError(null);

    if (!loginInput.trim() || !password) {
      onError('Username/Email and Password are required.');
      return;
    }

    try {
      await login({ login: loginInput.trim(), password }).unwrap();
      // On success, authApi's onQueryStarted handles dispatching setCredentials
    } catch (err: any) {
      onError(err.data?.message || err.error || 'Invalid login credentials.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-on-surface-variant)] mb-1.5">
          Username or Email
        </label>
        <input
          type="text"
          required
          disabled={isLoading}
          value={loginInput}
          onChange={(e) => {
            setLoginInput(e.target.value);
            onError(null);
          }}
          placeholder="vijayk or vijay@example.com"
          className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface-container-low)] border border-[var(--border-outline-variant)] text-xs font-medium text-[var(--text-on-surface)] outline-none focus:border-[var(--color-primary)] transition-all disabled:opacity-60"
        />
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-on-surface-variant)] mb-1.5">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            required
            disabled={isLoading}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              onError(null);
            }}
            placeholder="••••••••••••"
            className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-[var(--bg-surface-container-low)] border border-[var(--border-outline-variant)] text-xs font-medium text-[var(--text-on-surface)] outline-none focus:border-[var(--color-primary)] transition-all disabled:opacity-60"
          />
          <button
            type="button"
            disabled={isLoading}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-[var(--text-on-surface-variant)] hover:text-[var(--text-on-surface)] cursor-pointer disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-lg">{showPassword ? 'visibility_off' : 'visibility'}</span>
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 px-4 rounded-xl bg-[var(--color-primary)] text-white font-bold text-xs shadow-md hover:opacity-90 transition-all cursor-pointer disabled:opacity-75"
      >
        {isLoading ? 'Logging in...' : 'Log In'}
      </button>
    </form>
  );
}
