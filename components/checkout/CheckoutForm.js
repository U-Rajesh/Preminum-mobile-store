'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, AlertCircle, ShieldCheck, ArrowLeft, CreditCard, Truck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import CartItem from '@/components/cart/CartItem';
import { createClient } from '@/lib/supabase/client';
import styles from './CheckoutForm.module.css';

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

function isValidEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

function isValidPincode(pin) {
  const pinRegex = /^[1-9][0-9]{5}$/;
  return pinRegex.test(pin);
}

function isValidPhone(phone) {
  const digitsOnly = phone.replace(/\D/g, '');
  return digitsOnly.length >= 7 && digitsOnly.length <= 15;
}

/**
 * Dynamically loads Razorpay checkout script.
 * @returns {Promise<boolean>}
 */
function loadRazorpayCheckoutScript() {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      return resolve(true);
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutForm() {
  const router = useRouter();
  const { cartItems, cartCount, cartSubtotal, clearCart } = useCart();

  const [formData, setFormData] = useState({
    customerId: null,
    name: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' | 'online'
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [paymentNotice, setPaymentNotice] = useState('');

  useEffect(() => {
    async function loadCustomerDetails() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const res = await fetch('/api/customers/profile');
          const profileData = await res.json().catch(() => null);
          const prof = profileData?.user;

          setFormData((prev) => ({
            ...prev,
            customerId: user.id,
            name: prev.name || prof?.full_name || user.user_metadata?.full_name || '',
            email: prev.email || user.email || '',
            phone: prev.phone || prof?.phone || user.user_metadata?.phone || '',
          }));
        }
      } catch (err) {
        console.error('Error preloading customer details in checkout:', err);
      }
    }
    loadCustomerDetails();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Full name is required.';
    } else if (formData.name.trim().length > 100) {
      errors.name = 'Name must be 100 characters or fewer.';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!isValidEmail(formData.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required.';
    } else if (!isValidPhone(formData.phone.trim())) {
      errors.phone = 'Please enter a valid contact phone number.';
    }

    if (!formData.addressLine1.trim()) {
      errors.addressLine1 = 'Street address is required.';
    }

    if (!formData.city.trim()) {
      errors.city = 'City is required.';
    }

    if (!formData.state.trim()) {
      errors.state = 'State is required.';
    }

    if (!formData.pincode.trim()) {
      errors.pincode = 'PIN code is required.';
    } else if (!isValidPincode(formData.pincode.trim())) {
      errors.pincode = 'Please enter a valid 6-digit Indian PIN code (e.g. 560001).';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRazorpayPayment = async (order, paymentData) => {
    const scriptLoaded = await loadRazorpayCheckoutScript();
    if (!scriptLoaded) {
      setServerError('Unable to load payment gateway. Please check your internet connection.');
      setIsSubmitting(false);
      return;
    }

    const options = {
      key: paymentData.keyId,
      amount: paymentData.amount,
      currency: paymentData.currency || 'INR',
      name: 'MOBILÉ Store',
      description: `Order ${order.order_number || order.orderNumber}`,
      order_id: paymentData.razorpayOrderId,
      prefill: {
        name: formData.name,
        email: formData.email,
        contact: formData.phone,
      },
      theme: {
        color: '#2563EB',
      },
      modal: {
        ondismiss: function () {
          setIsSubmitting(false);
          setPaymentNotice(
            'Payment window was closed. Your cart is preserved, and you can retry payment whenever you are ready.'
          );
        },
      },
      handler: async function (response) {
        try {
          setIsSubmitting(true);
          const verifyRes = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyRes.json().catch(() => ({}));

          if (verifyRes.ok && verifyData.success) {
            clearCart();
            const ordNum = order.order_number || order.orderNumber;
            router.push(
              `/order-success?order=${encodeURIComponent(ordNum)}&payment=paid&payment_id=${encodeURIComponent(response.razorpay_payment_id)}`
            );
          } else {
            setServerError(
              verifyData.message || 'Payment verification failed. Please contact store support.'
            );
          }
        } catch (err) {
          console.error('Payment verification error:', err);
          setServerError('Error confirming payment. Please contact store support.');
        } finally {
          setIsSubmitting(false);
        }
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function (response) {
      console.error('Razorpay payment failed:', response.error);
      setIsSubmitting(false);
      setServerError(
        response.error?.description || 'Payment was declined or failed. Please try a different method.'
      );
    });
    rzp.open();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setPaymentNotice('');

    if (!validateForm()) return;

    if (cartItems.length === 0) {
      setServerError('Your cart is empty. Please add items before checking out.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        customer: formData,
        paymentMethod,
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity || 1,
        })),
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 201 && data.success && data.order) {
        const orderNum = data.order.order_number || data.order.orderNumber;

        // 1. Cash on Delivery flow (Active default payment method)
        if (paymentMethod === 'cod') {
          clearCart();
          router.push(
            `/order-success?order=${encodeURIComponent(orderNum)}&payment=cod`
          );
          return;
        }

        // 2. Online Payment flow (Future Razorpay integration)
        if (data.payment && data.payment.configured && data.payment.razorpayOrderId) {
          await handleRazorpayPayment(data.order, data.payment);
        } else {
          clearCart();
          router.push(
            `/order-success?order=${encodeURIComponent(orderNum)}&payment=unconfigured`
          );
        }
      } else {
        if (data.errors) {
          setFieldErrors(data.errors);
        }
        setServerError(
          data.message || 'Unable to place order. Please check your information and try again.'
        );
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Order submission error:', err);
      setServerError('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.layout}>
      {/* Left Column: Customer & Delivery Details */}
      <div className={styles.formCard}>
        <h2 className={styles.sectionTitle}>1. Delivery & Contact Details</h2>

        {serverError && (
          <div className={styles.errorBanner} role="alert">
            <AlertCircle size={18} aria-hidden="true" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{serverError}</span>
          </div>
        )}

        {paymentNotice && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              color: '#1e40af',
              fontSize: '0.875rem',
              marginBottom: '16px',
            }}
            role="status"
          >
            {paymentNotice}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {/* Full Name & Email */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="name" className={styles.label}>
                Full Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                disabled={isSubmitting}
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Rajesh Kumar"
                aria-invalid={Boolean(fieldErrors.name)}
                aria-describedby={fieldErrors.name ? 'name-error' : undefined}
                className={`${styles.input} ${fieldErrors.name ? styles.inputError : ''}`}
              />
              {fieldErrors.name && (
                <span id="name-error" className={styles.errorMessage}>
                  {fieldErrors.name}
                </span>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="email" className={styles.label}>
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                disabled={isSubmitting}
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                className={`${styles.input} ${fieldErrors.email ? styles.inputError : ''}`}
              />
              {fieldErrors.email && (
                <span id="email-error" className={styles.errorMessage}>
                  {fieldErrors.email}
                </span>
              )}
            </div>
          </div>

          {/* Phone & PIN code */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="phone" className={styles.label}>
                Phone Number *
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                disabled={isSubmitting}
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 90000 00000"
                aria-invalid={Boolean(fieldErrors.phone)}
                aria-describedby={fieldErrors.phone ? 'phone-error' : undefined}
                className={`${styles.input} ${fieldErrors.phone ? styles.inputError : ''}`}
              />
              {fieldErrors.phone && (
                <span id="phone-error" className={styles.errorMessage}>
                  {fieldErrors.phone}
                </span>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="pincode" className={styles.label}>
                PIN Code *
              </label>
              <input
                id="pincode"
                name="pincode"
                type="text"
                maxLength={6}
                required
                disabled={isSubmitting}
                value={formData.pincode}
                onChange={handleChange}
                placeholder="e.g. 560001"
                aria-invalid={Boolean(fieldErrors.pincode)}
                aria-describedby={fieldErrors.pincode ? 'pincode-error' : undefined}
                className={`${styles.input} ${fieldErrors.pincode ? styles.inputError : ''}`}
              />
              {fieldErrors.pincode && (
                <span id="pincode-error" className={styles.errorMessage}>
                  {fieldErrors.pincode}
                </span>
              )}
            </div>
          </div>

          {/* Address Line 1 */}
          <div className={styles.field}>
            <label htmlFor="addressLine1" className={styles.label}>
              Street Address *
            </label>
            <input
              id="addressLine1"
              name="addressLine1"
              type="text"
              required
              disabled={isSubmitting}
              value={formData.addressLine1}
              onChange={handleChange}
              placeholder="House/Flat No., Building Name, Street"
              aria-invalid={Boolean(fieldErrors.addressLine1)}
              aria-describedby={fieldErrors.addressLine1 ? 'address1-error' : undefined}
              className={`${styles.input} ${fieldErrors.addressLine1 ? styles.inputError : ''}`}
            />
            {fieldErrors.addressLine1 && (
              <span id="address1-error" className={styles.errorMessage}>
                {fieldErrors.addressLine1}
              </span>
            )}
          </div>

          {/* Address Line 2 */}
          <div className={styles.field}>
            <label htmlFor="addressLine2" className={styles.label}>
              Apartment, Suite, Landmark
              <span className={styles.optionalTag}>(Optional)</span>
            </label>
            <input
              id="addressLine2"
              name="addressLine2"
              type="text"
              disabled={isSubmitting}
              value={formData.addressLine2}
              onChange={handleChange}
              placeholder="Near City Center"
              className={styles.input}
            />
          </div>

          {/* City & State */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="city" className={styles.label}>
                City *
              </label>
              <input
                id="city"
                name="city"
                type="text"
                required
                disabled={isSubmitting}
                value={formData.city}
                onChange={handleChange}
                placeholder="Bengaluru"
                aria-invalid={Boolean(fieldErrors.city)}
                aria-describedby={fieldErrors.city ? 'city-error' : undefined}
                className={`${styles.input} ${fieldErrors.city ? styles.inputError : ''}`}
              />
              {fieldErrors.city && (
                <span id="city-error" className={styles.errorMessage}>
                  {fieldErrors.city}
                </span>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="state" className={styles.label}>
                State *
              </label>
              <input
                id="state"
                name="state"
                type="text"
                required
                disabled={isSubmitting}
                value={formData.state}
                onChange={handleChange}
                placeholder="Karnataka"
                aria-invalid={Boolean(fieldErrors.state)}
                aria-describedby={fieldErrors.state ? 'state-error' : undefined}
                className={`${styles.input} ${fieldErrors.state ? styles.inputError : ''}`}
              />
              {fieldErrors.state && (
                <span id="state-error" className={styles.errorMessage}>
                  {fieldErrors.state}
                </span>
              )}
            </div>
          </div>

          {/* 2. Payment Method Section */}
          <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--color-border)' }}>
            <h2 className={styles.sectionTitle} style={{ marginBottom: '6px' }}>
              2. Payment Method
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-secondary)', marginBottom: '16px' }}>
              Select your preferred method to complete this order.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Option 1: Cash on Delivery (Active) */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '16px',
                  borderRadius: 'var(--radius-lg)',
                  border: paymentMethod === 'cod' ? '2px solid var(--color-accent)' : '1px solid rgba(255, 255, 255, 0.08)',
                  backgroundColor: paymentMethod === 'cod' ? 'rgba(232, 163, 61, 0.08)' : 'rgba(24, 23, 22, 0.66)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  style={{ marginTop: '3px', accentColor: 'var(--color-accent)', width: '16px', height: '16px' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: '0.9375rem', color: 'var(--color-foreground)' }}>
                      Cash on Delivery (COD)
                    </strong>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                      Available Now
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '0.8125rem', color: 'var(--color-secondary)' }}>
                    Pay in cash when your parcel is delivered at your doorstep. (Free Express Delivery)
                  </p>
                </div>
              </label>

              {/* Option 2: Online Payment (Disabled / Coming Soon) */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '16px',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  backgroundColor: 'rgba(14, 12, 10, 0.5)',
                  opacity: 0.75,
                  cursor: 'not-allowed',
                }}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="online"
                  disabled
                  checked={false}
                  style={{ marginTop: '3px', width: '16px', height: '16px', cursor: 'not-allowed' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: '0.9375rem', color: 'var(--color-secondary)' }}>
                      Online Payment (UPI, Credit/Debit Cards, Net Banking)
                    </strong>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', backgroundColor: 'rgba(255, 255, 255, 0.06)', color: 'rgba(244, 242, 238, 0.6)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                      Coming Soon
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '0.8125rem', color: 'var(--color-muted)' }}>
                    Online payments are coming soon. Cash on Delivery is currently available.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Right Column: Order Review & Place Order */}
      <div className={styles.summaryCard}>
        <h2 className={styles.sectionTitle} style={{ paddingBottom: '12px', marginBottom: '8px' }}>
          3. Order Summary ({cartCount})
        </h2>

        <div className={styles.itemsList}>
          {cartItems.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>

        <div className={styles.summaryRow}>
          <span>Subtotal</span>
          <span>{formatCurrency(cartSubtotal)}</span>
        </div>

        <div className={styles.summaryRow}>
          <span>Express Delivery</span>
          <span style={{ color: '#15803d', fontWeight: 'var(--font-weight-semibold)' }}>
            FREE
          </span>
        </div>

        <div className={styles.summaryRow}>
          <span>Payment Method</span>
          <span style={{ fontWeight: 600, color: 'var(--color-foreground)' }}>
            Cash on Delivery
          </span>
        </div>

        <div className={styles.totalRow}>
          <span>Total Amount</span>
          <span>{formatCurrency(cartSubtotal)}</span>
        </div>

        <div className={styles.reassuranceBox}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '2px' }}>
            <ShieldCheck size={16} color="#15803d" aria-hidden="true" />
            <strong style={{ color: 'var(--color-foreground)' }}>100% Genuine Smartphones</strong>
          </div>
          <span>Free Express Insured Courier · 7-Day Replacement · Cash on Delivery</span>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || cartItems.length === 0}
          className={styles.submitBtn}
          aria-label={`Place Order with Cash on Delivery — ${formatCurrency(cartSubtotal)}`}
        >
          {isSubmitting ? (
            <>
              <div className={styles.spinner} aria-hidden="true" />
              <span>Placing order...</span>
            </>
          ) : (
            <>
              <Truck size={18} aria-hidden="true" />
              <span>Place Order (Cash on Delivery)</span>
              <ArrowRight size={18} aria-hidden="true" />
            </>
          )}
        </button>

        <Link
          href="/mobiles"
          className="btn btn-outline"
          style={{ width: '100%', justifyContent: 'center', height: '42px' }}
        >
          <ArrowLeft size={16} aria-hidden="true" style={{ marginRight: '6px' }} />
          <span>Continue Shopping</span>
        </Link>
      </div>
    </div>
  );
}
