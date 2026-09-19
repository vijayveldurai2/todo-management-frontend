import React, { useState } from 'react';
import { useSignupMutation } from '../../../services/authApi';

interface SignupFormProps {
  onError: (error: string | null) => void;
  onSignupSuccess: () => void;
}

export default function SignupForm({ onError, onSignupSuccess }: SignupFormProps) {
  const [signup, { isLoading }] = useSignupMutation();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    onError(null);

    if (password.length < 6) {
      onError('Password must be at least 6 characters long.');
      return;
    }

    try {
      await signup({ name: name.trim(), username: username.trim(), email: email.trim(), password }).unwrap();
      onSignupSuccess();
    } catch (err: any) {
      onError(err.data?.message || err.error || 'Signup failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-on-surface-variant)] mb-1.5">
          Full Name
        </label>
        <input
          type="text"
          required
          disabled={isLoading}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Vijay Kumar"
          className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface-container-low)] border border-[var(--border-outline-variant)] text-xs text-[var(--text-on-surface)] outline-none focus:border-[var(--color-primary)] disabled:opacity-60"
        />
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-on-surface-variant)] mb-1.5">
          Username
        </label>
        <input
          type="text"
          required
          disabled={isLoading}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="vijayk"
          className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface-container-low)] border border-[var(--border-outline-variant)] text-xs text-[var(--text-on-surface)] outline-none focus:border-[var(--color-primary)] disabled:opacity-60"
        />
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-on-surface-variant)] mb-1.5">
          Email Address
        </label>
        <input
          type="email"
          required
          disabled={isLoading}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="vijay@example.com"
          className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface-container-low)] border border-[var(--border-outline-variant)] text-xs text-[var(--text-on-surface)] outline-none focus:border-[var(--color-primary)] disabled:opacity-60"
        />
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-on-surface-variant)] mb-1.5">
          Password
        </label>
        <input
          type="password"
          required
          disabled={isLoading}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••••••"
          className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface-container-low)] border border-[var(--border-outline-variant)] text-xs text-[var(--text-on-surface)] outline-none focus:border-[var(--color-primary)] disabled:opacity-60"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 px-4 rounded-xl bg-[var(--color-primary)] text-white font-bold text-xs shadow-md hover:opacity-90 transition-all cursor-pointer disabled:opacity-75"
      >
        {isLoading ? 'Registering...' : 'Sign Up'}
      </button>
    </form>
  );
}
