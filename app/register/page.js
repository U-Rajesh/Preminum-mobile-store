'use client';

import { useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import styles from '../login/auth.module.css';

/**
 * Returns a clear, customer-friendly error message from Supabase Auth.
 * Displays the actual Supabase error without falling back to generic masking.
 * @param {Object} error - Supabase Auth error object
 * @returns {string} Informative error message
 */
function getFriendlyErrorMessage(error) {
  if (!error) return 'Registration failed. Please try again.';

  const message = error.message ? error.message.toLowerCase() : '';
  const code = error.code ? error.code.toLowerCase() : '';

  if (
    code === 'over_email_send_rate_limit' ||
    message.includes('rate limit') ||
    message.includes('over_email_send_rate_limit') ||
    message.includes('too many requests')
  ) {
    return 'Too many registration attempts. Please wait a few minutes and try again.';
  }

  if (
    code === 'user_already_exists' ||
    code === 'email_exists' ||
    message.includes('already registered') ||
    message.includes('user already exists') ||
    message.includes('email already exists')
  ) {
    return 'An account with this email address already exists. Please sign in instead.';
  }

  if (
    code === 'weak_password' ||
    (message.includes('password') &&
      (message.includes('weak') || message.includes('short') || message.includes('least') || message.includes('character')))
  ) {
    return 'Password is too weak. Please use at least 8 characters with a mix of letters and numbers.';
  }

  if (
    code === 'validation_failed' ||
    message.includes('invalid email') ||
    message.includes('email address is invalid')
  ) {
    return 'Please enter a valid email address.';
  }

  if (message.includes('network') || message.includes('fetch') || message.includes('failed to fetch')) {
    return 'Unable to connect to authentication service. Please check your internet connection.';
  }

  // Display the actual error message directly
  if (error.message && typeof error.message === 'string') {
    return error.message;
  }

  return 'Registration could not be completed. Please check your details and try again.';
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next') || '/account';

  const isSubmittingRef = useRef(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const errs = {};
    if (!fullName.trim()) {
      errs.fullName = 'Full name is required.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }

    const cleanedPhone = phone.replace(/\D/g, '');
    const phoneValid =
      /^[6-9]\d{9}$/.test(cleanedPhone) ||
      (cleanedPhone.length === 12 && cleanedPhone.startsWith('91'));
    if (!phone.trim() || !phoneValid) {
      errs.phone = 'Please enter a valid 10-digit Indian mobile number.';
    }

    if (!password || password.length < 8) {
      errs.password = 'Password must be at least 8 characters long.';
    }

    if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent duplicate calls if already submitting
    if (isSubmittingRef.current || loading) {
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    isSubmittingRef.current = true;
    setLoading(true);

    try {
      const supabase = createClient();
      const trimmedEmail = email.trim();
      const trimmedName = fullName.trim();
      const trimmedPhone = phone.trim();

      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            full_name: trimmedName,
            phone: trimmedPhone,
          },
        },
      });

      if (error) {
        console.error('[Registration Error]:', error.message || error);
        setErrorMessage(getFriendlyErrorMessage(error));
        setLoading(false);
        isSubmittingRef.current = false;
        return;
      }

      // Check if user already existed in Supabase
      if (data?.user?.identities && data.user.identities.length === 0) {
        setErrorMessage('An account with this email address already exists. Please sign in instead.');
        setLoading(false);
        isSubmittingRef.current = false;
        return;
      }

      if (data?.user) {
        let session = data.session;

        // If no session in signUp response, attempt immediate signIn to obtain session
        if (!session) {
          try {
            const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
              email: trimmedEmail,
              password,
            });

            if (!signInErr && signInData?.session) {
              session = signInData.session;
            }
          } catch (autoLoginErr) {
            console.error('[Auto Login Attempt]:', autoLoginErr);
          }
        }

        // When session is active (Confirm email is disabled)
        if (session) {
          try {
            await fetch('/api/customers/profile', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                fullName: trimmedName,
                phone: trimmedPhone,
              }),
            });
          } catch (syncErr) {
            console.error('[Profile Sync Error]:', syncErr);
          }

          router.push(nextUrl);
          router.refresh();
          return;
        }

        // If email confirmation is enabled in Supabase project settings
        setSuccessMessage(
          `Account created successfully! Please check your email (${trimmedEmail}) and verify your account before signing in.`
        );
        setLoading(false);
        isSubmittingRef.current = false;
      } else {
        setErrorMessage('Registration could not be completed. Please check your details and try again.');
        setLoading(false);
        isSubmittingRef.current = false;
      }
    } catch (err) {
      console.error('[Registration Exception]:', err.message || err);
      setErrorMessage(err.message || 'An unexpected error occurred. Please try again.');
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>Create Account</h1>
          <p className={styles.subtitle}>Create your MOBILÉ account to track orders and save your favorites.</p>
        </div>

        {errorMessage && <div className={styles.alertError}>{errorMessage}</div>}
        {successMessage && (
          <div className={styles.alertSuccess} style={{ marginBottom: '16px', lineHeight: '1.4' }}>
            {successMessage}
            <div style={{ marginTop: '12px' }}>
              <Link
                href={`/login${nextUrl !== '/account' ? `?next=${encodeURIComponent(nextUrl)}` : ''}`}
                style={{ fontWeight: 700, textDecoration: 'underline' }}
              >
                Proceed to Sign In &rarr;
              </Link>
            </div>
          </div>
        )}

        {!successMessage && (
          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            {/* Full Name */}
            <div className={styles.formGroup}>
              <label htmlFor="reg-fullname" className={styles.label}>
                Full Name
              </label>
              <input
                id="reg-fullname"
                type="text"
                className={styles.input}
                placeholder="e.g. Rahul Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
                required
              />
              {errors.fullName && <span className={styles.errorText}>{errors.fullName}</span>}
            </div>

            {/* Email */}
            <div className={styles.formGroup}>
              <label htmlFor="reg-email" className={styles.label}>
                Email Address
              </label>
              <input
                id="reg-email"
                type="email"
                className={styles.input}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                autoComplete="email"
              />
              {errors.email && <span className={styles.errorText}>{errors.email}</span>}
            </div>

            {/* Phone */}
            <div className={styles.formGroup}>
              <label htmlFor="reg-phone" className={styles.label}>
                Phone Number
              </label>
              <input
                id="reg-phone"
                type="tel"
                className={styles.input}
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
                required
                autoComplete="tel"
              />
              {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
            </div>

            {/* Password */}
            <div className={styles.formGroup}>
              <label htmlFor="reg-password" className={styles.label}>
                Password (min. 8 characters)
              </label>
              <input
                id="reg-password"
                type="password"
                className={styles.input}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                autoComplete="new-password"
              />
              {errors.password && <span className={styles.errorText}>{errors.password}</span>}
            </div>

            {/* Confirm Password */}
            <div className={styles.formGroup}>
              <label htmlFor="reg-confirm-password" className={styles.label}>
                Confirm Password
              </label>
              <input
                id="reg-confirm-password"
                type="password"
                className={styles.input}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                required
                autoComplete="new-password"
              />
              {errors.confirmPassword && (
                <span className={styles.errorText}>{errors.confirmPassword}</span>
              )}
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}

        <div className={styles.footerLinks}>
          Already have an account?{' '}
          <Link href={`/login${nextUrl !== '/account' ? `?next=${encodeURIComponent(nextUrl)}` : ''}`}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className={styles.authContainer}>Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
