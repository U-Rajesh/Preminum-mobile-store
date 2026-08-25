'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import styles from './login.module.css';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');

  const validate = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setAuthError(error.message || 'Invalid email or password.');
        setIsSubmitting(false);
        return;
      }

      if (data?.user) {
        window.location.href = nextPath;
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setAuthError('An unexpected authentication error occurred.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.brand}>
          <span>MOBILÉ</span>
          <span className={styles.adminBadge}>Admin</span>
        </div>
        <h1 className={styles.title}>Sign in to Portal</h1>
        <p className={styles.subtitle}>
          Enter your administrative credentials to access the dashboard.
        </p>
      </div>

      {authError && (
        <div className={styles.errorBanner} role="alert">
          <AlertCircle size={16} aria-hidden="true" style={{ flexShrink: 0 }} />
          <span>{authError}</span>
        </div>
      )}

      <form onSubmit={handleSignIn} className={styles.form} noValidate>
        {/* Email Field */}
        <div className={styles.field}>
          <label htmlFor="admin-email" className={styles.label}>
            Email Address
          </label>
          <input
            id="admin-email"
            type="email"
            required
            autoComplete="email"
            disabled={isSubmitting}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
            }}
            placeholder="admin@mobile-store.com"
            className={styles.input}
            aria-invalid={Boolean(fieldErrors.email)}
          />
          {fieldErrors.email && (
            <span className={styles.errorMessage}>{fieldErrors.email}</span>
          )}
        </div>

        {/* Password Field */}
        <div className={styles.field}>
          <label htmlFor="admin-password" className={styles.label}>
            Password
          </label>
          <div className={styles.inputWrapper}>
            <input
              id="admin-password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              disabled={isSubmitting}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
              }}
              placeholder="••••••••"
              className={styles.input}
              style={{ paddingRight: '42px' }}
              aria-invalid={Boolean(fieldErrors.password)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className={styles.togglePasswordBtn}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {fieldErrors.password && (
            <span className={styles.errorMessage}>{fieldErrors.password}</span>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={styles.submitBtn}
        >
          {isSubmitting ? (
            <span>Authenticating...</span>
          ) : (
            <>
              <span>Sign In to Dashboard</span>
              <ArrowRight size={16} aria-hidden="true" />
            </>
          )}
        </button>
      </form>

      <div className={styles.footer}>
        <span>Looking for customer store? </span>
        <Link href="/" className={styles.storeLink}>
          Back to Store
        </Link>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className={styles.page}>
      <Suspense
        fallback={
          <div className={styles.card}>
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-muted)' }}>
              Loading login portal...
            </div>
          </div>
        }
      >
        <LoginFormContent />
      </Suspense>
    </div>
  );
}
