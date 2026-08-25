'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, MessageSquare, Check, ShieldCheck, Edit3 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import styles from './ProductInfo.module.css';

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

/**
 * Returns human-readable label and styling class for stock status.
 * @param {string} status
 * @returns {{ label: string, className: string, isAvailable: boolean }}
 */
function getStockInfo(status) {
  switch (status) {
    case 'limited_stock':
      return {
        label: 'Limited Stock',
        className: styles.limitedStock,
        isAvailable: true,
      };
    case 'out_of_stock':
      return {
        label: 'Out of Stock',
        className: styles.outOfStock,
        isAvailable: false,
      };
    case 'in_stock':
    default:
      return {
        label: 'In Stock',
        className: styles.inStock,
        isAvailable: true,
      };
  }
}

export default function ProductInfo({ mobile }) {
  const { isAdmin } = useAuth();
  const { addToCart } = useCart();

  if (!mobile) return null;

  const stockInfo = getStockInfo(mobile.stock_status);
  const currentPriceNum = Number(mobile.price);
  const originalPriceNum = Number(mobile.original_price);
  const showOriginalPrice =
    originalPriceNum && originalPriceNum > currentPriceNum;

  const discountPercent = showOriginalPrice
    ? Math.round(((originalPriceNum - currentPriceNum) / originalPriceNum) * 100)
    : null;

  // Build specifications list filtering out null/empty values
  const specsList = [
    { label: 'RAM', value: mobile.ram },
    { label: 'Storage', value: mobile.storage },
    { label: 'Processor', value: mobile.processor },
    { label: 'Display', value: mobile.display },
    { label: 'Camera', value: mobile.camera },
    { label: 'Battery', value: mobile.battery },
  ].filter((spec) => spec.value && String(spec.value).trim().length > 0);

  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(mobile, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className={styles.container}>
      {/* Brand & Heading */}
      <div>
        <span className={styles.brand}>{mobile.brand}</span>
        <h1 className={styles.title}>{mobile.name}</h1>
      </div>

      {/* Stock Status Indicator */}
      <div className={`${styles.stock} ${stockInfo.className}`}>
        <span className={styles.stockDot} aria-hidden="true" />
        <span>{stockInfo.label}</span>
      </div>

      {/* Price Section */}
      <div className={styles.priceSection}>
        <span className={styles.currentPrice}>
          {formatCurrency(mobile.price)}
        </span>
        {showOriginalPrice && (
          <>
            <span className={styles.originalPrice}>
              {formatCurrency(mobile.original_price)}
            </span>
            {discountPercent && discountPercent > 0 && (
              <span className={styles.discountBadge}>
                {discountPercent}% OFF
              </span>
            )}
          </>
        )}
      </div>

      {/* CTA Button Area */}
      <div className={styles.ctaSection}>
        {isAdmin ? (
          /* Admin Storefront Mode: Customer purchasing actions hidden */
          <div className={styles.adminBanner} role="region" aria-label="Admin Storefront Controls">
            <div className={styles.adminBadgeRow}>
              <ShieldCheck size={16} aria-hidden="true" />
              <span>Admin Storefront Mode</span>
            </div>
            <p className={styles.adminNoticeText}>
              Shopping cart and checkout actions are hidden for admin accounts. You can manage this smartphone directly in the dashboard.
            </p>
            <div>
              <Link
                href={`/admin/mobiles/${mobile.id}/edit`}
                className="btn btn-primary"
                style={{ height: '42px', padding: '0 18px', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <Edit3 size={15} aria-hidden="true" />
                <span>Edit Mobile in Dashboard</span>
              </Link>
            </div>
          </div>
        ) : stockInfo.isAvailable ? (
          /* Customer / Guest Purchasing Actions */
          <div className={styles.buttonRow}>
            <button
              type="button"
              onClick={handleAddToCart}
              className={`${styles.addToCartBtn} ${isAdded ? styles.addedBtn : ''}`}
              aria-label={`Add ${mobile.name} to shopping cart`}
            >
              {isAdded ? (
                <>
                  <Check size={18} aria-hidden="true" />
                  <span>Added to Bag!</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={18} aria-hidden="true" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>

            <Link
              href="/contact"
              className={styles.contactBtn}
              aria-label="Contact store regarding this mobile"
            >
              <MessageSquare size={16} aria-hidden="true" />
              <span>Contact to Buy</span>
            </Link>
          </div>
        ) : (
          <button
            type="button"
            disabled
            className={`${styles.addToCartBtn} ${styles.disabledBtn}`}
          >
            Currently Unavailable
          </button>
        )}

        {!isAdmin && (
          <div className={styles.ctaReassurance}>
            <span>✓ Genuine Store Warranty · Free Express Delivery across India</span>
          </div>
        )}
      </div>

      {/* Specifications Section */}
      {specsList.length > 0 && (
        <section className={styles.specsSection} aria-labelledby="specs-heading">
          <h2 id="specs-heading" className={styles.sectionHeading}>
            Key Specifications
          </h2>
          <div className={styles.specsGrid}>
            {specsList.map((spec) => (
              <div key={spec.label} className={styles.specCard}>
                <span className={styles.specLabel}>{spec.label}</span>
                <span className={styles.specValue}>{spec.value}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Description Section */}
      {mobile.description && mobile.description.trim().length > 0 && (
        <section
          className={styles.descriptionSection}
          aria-labelledby="desc-heading"
        >
          <h2 id="desc-heading" className={styles.sectionHeading}>
            About this mobile
          </h2>
          <p className={styles.descriptionText}>{mobile.description}</p>
        </section>
      )}
    </div>
  );
}
