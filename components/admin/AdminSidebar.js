'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Smartphone,
  ShoppingBag,
  Users,
  Star,
  MessageSquare,
  ArrowLeft,
  LogOut,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import styles from './AdminSidebar.module.css';

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Mobiles', href: '/admin/mobiles', icon: Smartphone },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Reviews', href: '/admin/reviews', icon: Star },
  { label: 'Inquiries', href: '/admin/inquiries', icon: MessageSquare },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [adminEmail, setAdminEmail] = useState('');

  useEffect(() => {
    async function loadUser() {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        if (data?.user?.email) {
          setAdminEmail(data.user.email);
        }
      } catch {}
    }
    loadUser();
  }, []);

  const isLinkActive = (item) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

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
    <aside className={styles.sidebar}>
      <div className={styles.brandArea}>
        <Link href="/admin" prefetch={true} className={styles.brand}>
          <span>MOBILÉ</span>
          <span className={styles.adminBadge}>Admin</span>
        </Link>
      </div>

      <nav className={styles.nav} aria-label="Admin Navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isLinkActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon size={18} aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className={styles.footerNav}>
        {adminEmail && (
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', padding: '0 4px', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={adminEmail}>
            Signed in as <strong style={{ color: '#ffffff' }}>{adminEmail}</strong>
          </div>
        )}

        <Link href="/" prefetch={true} className={styles.storeLink}>
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Back to Store</span>
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className={styles.logoutBtn}
          aria-label="Sign out from admin portal"
        >
          <LogOut size={16} aria-hidden="true" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
