'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import styles from './unauthorized.module.css';

export default function AdminUnauthorizedPage() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = '/admin/login';
    } catch (err) {
      console.error('Sign out error:', err);
      window.location.href = '/admin/login';
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.iconWrapper}>
          <ShieldAlert size={36} aria-hidden="true" />
        </div>

        <h1 className={styles.title}>Access Denied</h1>
        <p className={styles.text}>
          You are currently signed in, but your account does not have administrator
          privileges to access the store management dashboard.
        </p>

        <div className={styles.actions}>
          <Link
            href="/"
            className="btn btn-primary"
            style={{ height: '44px', padding: '0 20px', justifyContent: 'center' }}
          >
            <ArrowLeft size={16} aria-hidden="true" style={{ marginRight: '6px' }} />
            <span>Back to Store</span>
          </Link>

          <button
            type="button"
            onClick={handleSignOut}
            className="btn btn-outline"
            style={{ height: '44px', padding: '0 20px', justifyContent: 'center' }}
          >
            <LogOut size={16} aria-hidden="true" style={{ marginRight: '6px' }} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
