'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, ShoppingBag, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import CartItem from './CartItem';
import styles from './CartDrawer.module.css';

/**
 * Formats a numeric price to INR currency format.
 * @param {number|string} price
 * @returns {string} Formatted price string (e.g. "₹79,999")
 */
function formatCurrency(price) {
  const num = Number(price);
  if (isNaN(num)) return '';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
}

export default function CartDrawer() {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const { isCartOpen, closeCart, cartItems, cartCount, cartSubtotal, clearCart } =
    useCart();

  const [isConfirmingClear, setIsConfirmingClear] = useState(false);

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isCartOpen) {
        closeCart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, closeCart]);

  // Reset confirmation state when drawer closes
  useEffect(() => {
    if (!isCartOpen) {
      setIsConfirmingClear(false);
    }
  }, [isCartOpen]);

  if (!isCartOpen || isAdmin) return null;

  const handleCheckoutClick = () => {
    closeCart();
    router.push('/checkout');
  };

  const handleExploreClick = () => {
    closeCart();
    router.push('/mobiles');
  };

  return (
    <div
      className={styles.backdrop}
      onClick={closeCart}
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Cart"
    >
      <div
        className={styles.drawer}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleArea}>
            <h3 className={styles.title}>Your Cart</h3>
            {cartCount > 0 && (
              <span className={styles.countBadge} aria-label={`${cartCount} items`}>
                {cartCount}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={closeCart}
            className={styles.closeBtn}
            aria-label="Close cart drawer"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Content Area */}
        <div className={styles.content}>
          {cartItems.length > 0 ? (
            <>
              {/* Clear Cart Trigger / Confirmation */}
              <div className={styles.clearBar}>
                {isConfirmingClear ? (
                  <div className={styles.confirmBox}>
                    <span>Clear all items?</span>
                    <button
                      type="button"
                      onClick={() => {
                        clearCart();
                        setIsConfirmingClear(false);
                      }}
                      className={styles.confirmClearBtn}
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsConfirmingClear(false)}
                      className={styles.cancelClearBtn}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsConfirmingClear(true)}
                    className={styles.clearTriggerBtn}
                  >
                    Clear Cart
                  </button>
                )}
              </div>

              {/* Items List */}
              <div>
                {cartItems.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
            </>
          ) : (
            /* Empty State */
            <div className={styles.emptyState}>
              <ShoppingBag size={48} className={styles.emptyIcon} aria-hidden="true" />
              <h4 className={styles.emptyTitle}>Your cart is empty</h4>
              <p className={styles.emptyText}>
                Explore our collection of premium smartphones to get started.
              </p>
              <button
                type="button"
                onClick={handleExploreClick}
                className="btn btn-primary"
              >
                Explore Mobiles
              </button>
            </div>
          )}
        </div>

        {/* Footer Area */}
        {cartItems.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.subtotalRow}>
              <span className={styles.subtotalLabel}>Subtotal</span>
              <span className={styles.subtotalValue}>
                {formatCurrency(cartSubtotal)}
              </span>
            </div>

            <p className={styles.shippingNote}>
              ✓ Free express shipping & store warranty included
            </p>

            <div className={styles.actions}>
              <button
                type="button"
                onClick={handleCheckoutClick}
                className={styles.checkoutBtn}
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={16} aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={closeCart}
                className={styles.continueBtn}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
