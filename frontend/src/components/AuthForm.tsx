'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { setToken, isAuthenticated } from '@/lib/auth';

interface AuthFormProps {
  mode: 'login' | 'register';
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/dashboard');
    }
  }, [router]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${apiBase}/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const text = await res.text();
        let msg = 'Authentication failed';
        try { msg = JSON.parse(text)?.error ?? msg; } catch {}
        setError(msg);
        return;
      }

      const json = await res.json();
      const token = json?.data?.token ?? json?.token;

      if (token) {
        setToken(token);
        router.push('/dashboard');
      } else {
        setError('No token received from server.');
      }
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }

  const title = mode === 'login' ? 'Sign in to your account' : 'Create an account';
  const buttonLabel = mode === 'login' ? 'Sign in' : 'Register';
  const switchText =
    mode === 'login'
      ? "Don't have an account? "
      : 'Already have an account? ';
  const switchLinkLabel = mode === 'login' ? 'Register' : 'Sign in';
  const switchHref = mode === 'login' ? '/register' : '/login';

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 text-center">{title}</h1>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          {loading ? 'Please wait…' : buttonLabel}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500">
        {switchText}
        <Link href={switchHref} className="font-medium text-indigo-600 hover:text-indigo-500">
          {switchLinkLabel}
        </Link>
      </p>
    </div>
  );
}
