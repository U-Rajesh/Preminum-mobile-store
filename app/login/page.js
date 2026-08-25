'use client';

import { useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import styles from './auth.module.css';

/**
 * Maps Supabase login error messages to friendly user notifications.
 * @param {Object} error
 * @returns {string}
 */
function getLoginErrorMessage(error) {
  if (!error) return 'Invalid email or password.';
  const msg = error.message ? error.message.toLowerCase() : '';

  if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
    return 'Incorrect email or password. Please check your credentials and try again.';
  }
  if (msg.includes('email not confirmed')) {
    return 'Please check your email and verify your account before signing in.';
  }
  if (msg.includes('rate limit') || msg.includes('too many requests')) {
    return 'Too many login attempts. Please wait a few moments and try again.';
  }
  if (msg.includes('network') || msg.includes('fetch')) {
    return 'Unable to connect to authentication service. Please check your internet connection.';
  }
  return 'Unable to sign in. Please verify your email and password.';
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next') || '/account';

  const isSubmittingRef = useRef(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmittingRef.current || loading) {
      return;
    }

    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    isSubmittingRef.current = true;
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMessage(getLoginErrorMessage(error));
        setLoading(false);
        isSubmittingRef.current = false;
        return;
      }

      if (data?.user) {
        // Successful login -> redirect to destination or account page
        router.push(nextUrl);
        router.refresh();
      } else {
        setLoading(false);
        isSubmittingRef.current = false;
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred. Please try again.');
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>Sign In</h1>
          <p className={styles.subtitle}>Welcome back to your MOBILÉ customer account.</p>
        </div>

        {errorMessage && <div className={styles.alertError}>{errorMessage}</div>}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.formGroup}>
            <label htmlFor="customer-email" className={styles.label}>
              Email Address
            </label>
            <input
              id="customer-email"
              type="email"
              className={styles.input}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <div className={styles.helperRow}>
              <label htmlFor="customer-password" className={styles.label}>
                Password
              </label>
              <Link href="/forgot-password">Forgot Password?</Link>
            </div>
            <input
              id="customer-password"
              type="password"
              className={styles.input}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className={styles.footerLinks}>
          Don&apos;t have an account?{' '}
          <Link href={`/register${nextUrl !== '/account' ? `?next=${encodeURIComponent(nextUrl)}` : ''}`}>
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className={styles.authContainer}>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
