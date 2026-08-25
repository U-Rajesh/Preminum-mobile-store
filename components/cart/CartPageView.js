'use client';

import Link from 'next/link';
import ExternalImage from '@/components/common/ExternalImage';
import { useRouter } from 'next/navigation';
import { ShoppingBag, ArrowRight, ArrowLeft, Trash2, Plus, Minus, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import styles from './CartPageView.module.css';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export default function CartPageView() {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const {
    cartItems,
    cartCount,
    cartSubtotal,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  if (isAdmin) {
    return (
      <div className={styles.emptyContainer}>
        <div className="container">
          <div className={styles.emptyCard} style={{ maxWidth: '560px' }}>
            <div className={styles.emptyIconCircle} style={{ background: 'rgba(234, 179, 8, 0.1)', color: '#eab308' }}>
              <ShieldCheck size={36} aria-hidden="true" />
            </div>
            <h1 className={styles.emptyTitle}>Admin Account Active</h1>
            <p className={styles.emptyText}>
              Shopping cart and customer purchasing actions are disabled for administrator accounts. You can manage orders, inventory, and inquiries from the Admin Dashboard.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px', flexWrap: 'wrap' }}>
              <Link href="/admin" className="btn btn-primary">
                <ShieldCheck size={16} aria-hidden="true" style={{ marginRight: '6px' }} />
                <span>Go to Admin Dashboard</span>
              </Link>
              <Link href="/mobiles" className="btn btn-outline">
                <span>Browse Mobiles</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <div className="container">
          <div className={styles.emptyCard}>
            <div className={styles.emptyIconCircle}>
              <ShoppingBag size={36} className={styles.emptyIcon} aria-hidden="true" />
            </div>
            <h1 className={styles.emptyTitle}>Your Cart is Empty</h1>
            <p className={styles.emptyText}>
              Looks like you haven&apos;t added any smartphones to your shopping bag yet.
            </p>
            <Link href="/mobiles" className="btn btn-primary" style={{ marginTop: '20px' }}>
              <ArrowLeft size={16} aria-hidden="true" style={{ marginRight: '6px' }} />
              <span>Explore Mobile Catalog</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Breadcrumb Header */}
        <header className={styles.header}>
          <Link href="/mobiles" className={styles.backLink}>
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Continue Shopping</span>
          </Link>
          <h1 className={styles.title}>Shopping Cart ({cartCount})</h1>
        </header>

        <div className={styles.layout}>
          {/* Items List */}
          <div className={styles.itemsList}>
            {cartItems.map((item) => (
              <div key={item.id} className={styles.itemCard}>
                <div className={styles.itemImageWrapper}>
                  <ExternalImage
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="80px"
                    className={styles.itemImage}
                    fallbackIcon={<ShoppingBag size={24} color="#94a3b8" aria-hidden="true" />}
                  />
                </div>

                <div className={styles.itemDetails}>
                  <span className={styles.itemBrand}>{item.brand}</span>
                  <Link href={`/mobiles/${item.id}`} className={styles.itemName}>
                    {item.name}
                  </Link>
                  <span className={styles.itemSpecs}>
                    {item.ram} · {item.storage}
                  </span>
                  <span className={styles.itemPriceMobile}>
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>

                {/* Quantity Controls */}
                <div className={styles.quantityControls}>
                  <button
                    type="button"
                    onClick={() => decreaseQuantity(item.id)}
                    className={styles.qtyBtn}
                    aria-label={`Decrease quantity of ${item.name}`}
                  >
                    <Minus size={14} />
                  </button>
                  <span className={styles.qtyCount}>{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => increaseQuantity(item.id)}
                    className={styles.qtyBtn}
                    aria-label={`Increase quantity of ${item.name}`}
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <div className={styles.itemPriceDesktop}>
                  {formatCurrency(item.price * item.quantity)}
                </div>

                <button
                  type="button"
                  onClick={() => removeFromCart(item.id)}
                  className={styles.removeBtn}
                  title="Remove item"
                  aria-label={`Remove ${item.name} from cart`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            <div className={styles.cartActionsRow}>
              <button
                type="button"
                onClick={clearCart}
                className={styles.clearBtn}
              >
                Clear entire cart
              </button>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <aside className={styles.summarySidebar}>
            <div className={styles.summaryCard}>
              <h2 className={styles.summaryTitle}>Order Summary</h2>

              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Subtotal ({cartCount} items)</span>
                <span className={styles.summaryValue}>{formatCurrency(cartSubtotal)}</span>
              </div>

              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Shipping</span>
                <span className={styles.freeBadge}>FREE</span>
              </div>

              <div className={styles.summaryDivider} />

              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>Estimated Total</span>
                <span className={styles.totalValue}>{formatCurrency(cartSubtotal)}</span>
              </div>

              <button
                type="button"
                onClick={() => router.push('/checkout')}
                className="btn btn-primary"
                style={{ width: '100%', height: '48px', fontSize: '1rem', marginTop: '20px' }}
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={16} aria-hidden="true" style={{ marginLeft: '6px' }} />
              </button>

              <div className={styles.guaranteeNote}>
                ✓ 100% Genuine Products · Official Warranty
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
