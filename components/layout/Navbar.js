'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingBag, User, Menu, X, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import CartDrawer from '@/components/cart/CartDrawer';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, isAdmin } = useAuth();
  const { cartCount, openCart, isCartOpen } = useCart();

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Mobiles', href: '/mobiles' },
    { label: 'Contact', href: '/contact' },
    {
      label: isAuthenticated ? 'Account' : 'Login',
      href: isAuthenticated ? '/account' : '/login',
    },
    ...(isAdmin ? [{ label: 'Admin', href: '/admin' }] : []),
  ];

  const [isScrolled, setIsScrolled] = useState(false);

  // Detect window scroll for navbar glassmorphic elevation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile drawer is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const isRouteActive = (href) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      <header className={`${styles.header} ${isScrolled ? styles.headerScrolled : ''}`}>
        <div className={`container ${styles.inner}`}>
          {/* Brand Logo */}
          <Link href="/" prefetch={true} className={styles.brand} aria-label="MOBILÉ Home">
            <span>MOBILÉ</span>
            <span className={styles.brandDot} aria-hidden="true" />
          </Link>

          {/* Desktop Navigation */}
          <nav className={styles.desktopNav} aria-label="Main Navigation">
            {navItems.map((item) => {
              const active = isRouteActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}
                  aria-current={active ? 'page' : undefined}
                >
                  {item.label}
                  {active && (
                    <motion.span
                      layoutId="activeNavIndicator"
                      className={styles.activeIndicator}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Side Actions */}
          <div className={styles.actions}>
            <Link
              href="/mobiles"
              prefetch={true}
              className={styles.actionBtn}
              aria-label="Search mobiles catalog"
              title="Search mobiles"
            >
              <Search size={20} aria-hidden="true" />
            </Link>

            <Link
              href={isAuthenticated ? '/account' : '/login'}
              prefetch={true}
              className={styles.actionBtn}
              aria-label={isAuthenticated ? 'Customer Account' : 'Customer Login'}
              title={isAuthenticated ? 'My Account' : 'Sign In'}
            >
              <User size={20} aria-hidden="true" />
            </Link>

            {isAdmin ? (
              <Link
                href="/admin"
                prefetch={true}
                className={styles.actionBtn}
                aria-label="Admin Dashboard"
                title="Admin Dashboard"
                style={{ color: 'var(--color-primary)' }}
              >
                <ShieldCheck size={20} aria-hidden="true" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={openCart}
                className={styles.actionBtn}
                aria-label={`Shopping bag with ${cartCount} items`}
                aria-expanded={isCartOpen}
                title="Shopping Cart"
              >
                <ShoppingBag size={20} aria-hidden="true" />
                {cartCount > 0 && (
                  <span className={styles.cartBadge} aria-hidden="true">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              className={styles.mobileMenuBtn}
              onClick={() => setIsOpen((prev) => !prev)}
              aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isOpen}
              aria-controls="mobile-nav-menu"
            >
              {isOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown Panel */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              id="mobile-nav-menu"
              className={styles.mobileMenuPanel}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <nav className={`container ${styles.mobileNavList}`} aria-label="Mobile Navigation">
                {navItems.map((item) => {
                  const active = isRouteActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch={true}
                      onClick={() => setIsOpen(false)}
                      className={`${styles.mobileNavLink} ${active ? styles.mobileNavLinkActive : ''}`}
                      aria-current={active ? 'page' : undefined}
                    >
                      <span>{item.label}</span>
                      {active && <span className={styles.mobileActiveBadge} aria-hidden="true" />}
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Global Cart Drawer (Only for Customers/Guests) */}
      {!isAdmin && <CartDrawer />}
    </>
  );
}
