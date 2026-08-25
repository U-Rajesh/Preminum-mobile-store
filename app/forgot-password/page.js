'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import styles from '../login/auth.module.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/account`,
      });

      if (error) {
        setErrorMessage(error.message || 'Failed to send recovery email.');
        setLoading(false);
        return;
      }

      setSubmitted(true);
      setLoading(false);
    } catch (err) {
      setErrorMessage('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>Reset Password</h1>
          <p className={styles.subtitle}>Enter your email to receive a password recovery link.</p>
        </div>

        {errorMessage && <div className={styles.alertError}>{errorMessage}</div>}

        {submitted ? (
          <div>
            <div className={styles.alertSuccess}>
              If an account exists for <strong>{email}</strong>, a password reset link has been sent. Please check your inbox.
            </div>
            <div className={styles.footerLinks} style={{ marginTop: '24px' }}>
              <Link href="/login">Return to Sign In</Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className={styles.formGroup}>
              <label htmlFor="reset-email" className={styles.label}>
                Email Address
              </label>
              <input
                id="reset-email"
                type="email"
                className={styles.input}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                autoComplete="email"
              />
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Sending Instructions...' : 'Send Recovery Link'}
            </button>

            <div className={styles.footerLinks}>
              Remembered your password? <Link href="/login">Back to Sign In</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
