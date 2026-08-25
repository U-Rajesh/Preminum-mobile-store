'use client';

import ExternalImage from '@/components/common/ExternalImage';
import { Minus, Plus, Trash2, Smartphone } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import styles from './CartItem.module.css';

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

export default function CartItem({ item }) {
  const { increaseQuantity, decreaseQuantity, removeFromCart } = useCart();

  if (!item) return null;

  const itemTotal = (item.price || 0) * (item.quantity || 1);

  return (
    <div className={styles.item}>
      {/* Thumbnail Area */}
      <div className={styles.imageWrapper}>
        <ExternalImage
          src={item.image}
          alt={`${item.brand} ${item.name}`}
          fill
          sizes="72px"
          className={styles.image}
          fallbackIcon={<Smartphone size={24} className={styles.placeholderIcon} aria-hidden="true" />}
        />
      </div>

      {/* Item Details */}
      <div className={styles.details}>
        <span className={styles.brand}>{item.brand}</span>
        <h4 className={styles.name} title={item.name}>
          {item.name}
        </h4>
        {(item.ram || item.storage) && (
          <div className={styles.specs}>
            {[item.ram, item.storage].filter(Boolean).join(' · ')}
          </div>
        )}

        <div className={styles.priceRow}>
          {/* Quantity Controls */}
          <div className={styles.qtyControl} role="group" aria-label="Quantity controls">
            <button
              type="button"
              onClick={() => decreaseQuantity(item.id)}
              className={styles.qtyBtn}
              aria-label={`Decrease quantity of ${item.name}`}
              disabled={item.quantity <= 1}
            >
              <Minus size={12} aria-hidden="true" />
            </button>

            <span className={styles.qtyValue} aria-label={`Quantity: ${item.quantity}`}>
              {item.quantity}
            </span>

            <button
              type="button"
              onClick={() => increaseQuantity(item.id)}
              className={styles.qtyBtn}
              aria-label={`Increase quantity of ${item.name}`}
            >
              <Plus size={12} aria-hidden="true" />
            </button>
          </div>

          {/* Item Price and Remove Action */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={styles.price}>{formatCurrency(itemTotal)}</span>
            <button
              type="button"
              onClick={() => removeFromCart(item.id)}
              className={styles.removeBtn}
              aria-label={`Remove ${item.name} from cart`}
              title="Remove item"
            >
              <Trash2 size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
