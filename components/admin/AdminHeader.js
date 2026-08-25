'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import AdminSidebar from './AdminSidebar';
import styles from './AdminHeader.module.css';

export default function AdminHeader() {
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = '/admin/login';
    } catch (err) {
      console.error('Logout error:', err);
      window.location.href = '/admin/login';
    }
  };

  return (
    <>
      <header className={styles.header}>
        <Link href="/admin" className={styles.brand}>
          <span>MOBILÉ</span>
          <span className={styles.adminBadge}>Admin</span>
        </Link>

        <div className={styles.headerActions}>
          <button
            type="button"
            onClick={handleLogout}
            className={styles.logoutBtn}
            aria-label="Sign out"
            title="Sign Out"
          >
            <LogOut size={18} aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => setIsMobileOpen((prev) => !prev)}
            className={styles.menuBtn}
            aria-label={isMobileOpen ? 'Close admin menu' : 'Open admin menu'}
          >
            {isMobileOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </header>

      {isMobileOpen && (
        <div
          className={styles.mobileDrawer}
          onClick={() => setIsMobileOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className={styles.mobileSidebar} onClick={(e) => e.stopPropagation()}>
            <AdminSidebar />
          </div>
        </div>
      )}
    </>
  );
}
