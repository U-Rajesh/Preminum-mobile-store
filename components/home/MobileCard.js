import Link from 'next/link';
import ExternalImage from '@/components/common/ExternalImage';
import { Smartphone } from 'lucide-react';
import styles from './MobileCard.module.css';

/**
 * Formats a numeric price to Indian Rupee (INR) currency format.
 * @param {number|string} price
 * @returns {string} Formatted price string (e.g., "₹79,999")
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
 * @returns {{ label: string, className: string }}
 */
function getStockInfo(status) {
  switch (status) {
    case 'limited_stock':
      return { label: 'Limited Stock', className: styles.limitedStock };
    case 'out_of_stock':
      return { label: 'Out of Stock', className: styles.outOfStock };
    case 'in_stock':
    default:
      return { label: 'In Stock', className: styles.inStock };
  }
}

export default function MobileCard({ mobile }) {
  if (!mobile) return null;

  // Retrieve primary image (display_order 0 or first available)
  const images = Array.isArray(mobile.mobile_images) ? mobile.mobile_images : [];
  const primaryImage =
    images.find((img) => img.display_order === 0) || images[0] || null;

  const imageAlt =
    primaryImage?.alt_text || `${mobile.brand} ${mobile.name}`;

  const stockInfo = getStockInfo(mobile.stock_status);
  const showOriginalPrice =
    mobile.original_price && Number(mobile.original_price) > Number(mobile.price);

  const discountPercent = showOriginalPrice
    ? Math.round(((Number(mobile.original_price) - Number(mobile.price)) / Number(mobile.original_price)) * 100)
    : null;

  return (
    <Link
      href={`/mobiles/${mobile.id}`}
      className={styles.card}
      aria-label={`View details for ${mobile.brand} ${mobile.name}`}
    >
      {/* Product Image Area */}
      <div className={styles.imageArea}>
        {discountPercent && discountPercent > 0 && (
          <span className={styles.discountBadge}>{discountPercent}% OFF</span>
        )}
        <ExternalImage
          src={primaryImage?.image_url}
          alt={imageAlt}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={styles.productImage}
          fallback={
            <div className={styles.placeholderBox} aria-hidden="true">
              <Smartphone size={36} className={styles.placeholderIcon} />
              <span style={{ fontSize: '0.75rem' }}>No image available</span>
            </div>
          }
        />
      </div>

      {/* Product Details Content */}
      <div className={styles.content}>
        <span className={styles.brand}>{mobile.brand}</span>
        <h3 className={styles.name} title={mobile.name}>
          {mobile.name}
        </h3>

        <div className={styles.specs}>
          {mobile.ram} · {mobile.storage}
        </div>

        {/* Pricing Row */}
        <div className={styles.priceRow}>
          <span className={styles.price}>{formatCurrency(mobile.price)}</span>
          {showOriginalPrice && (
            <span className={styles.originalPrice}>
              {formatCurrency(mobile.original_price)}
            </span>
          )}
        </div>

        {/* Stock Status Indicator */}
        <div className={`${styles.stock} ${stockInfo.className}`}>
          <span className={styles.stockDot} aria-hidden="true" />
          <span>{stockInfo.label}</span>
        </div>
      </div>
    </Link>
  );
}
