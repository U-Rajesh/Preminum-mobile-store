'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  ShoppingBag,
  Star,
  LogOut,
  Edit2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Phone,
  Mail,
  RotateCw,
  Package,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import OrderStatusProgress from '@/components/orders/OrderStatusProgress';
import styles from './account.module.css';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

function formatDate(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getOrderStatusStyle(status) {
  switch (status) {
    case 'delivered':
      return { background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.2)' };
    case 'shipped':
      return { background: 'rgba(147, 51, 234, 0.1)', color: '#9333ea', border: '1px solid rgba(147, 51, 234, 0.2)' };
    case 'processing':
      return { background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)' };
    case 'confirmed':
      return { background: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9', border: '1px solid rgba(14, 165, 233, 0.2)' };
    case 'cancelled':
      return { background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' };
    case 'pending':
    default:
      return { background: 'rgba(234, 179, 8, 0.1)', color: '#eab308', border: '1px solid rgba(234, 179, 8, 0.2)' };
  }
}

export default function AccountPage() {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'orders' | 'reviews'
  const [loading, setLoading] = useState(true);
  const [refreshingOrders, setRefreshingOrders] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ full_name: '', phone: '', email: '' });
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);

  // Edit profile form state
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [updateMsg, setUpdateMsg] = useState({ type: '', text: '' });

  const fetchOrders = async () => {
    try {
      setRefreshingOrders(true);
      const ordRes = await fetch('/api/customers/orders');
      const ordJson = await ordRes.json();
      if (ordJson.success) {
        setOrders(ordJson.orders || []);
      }
    } catch (err) {
      console.error('Error refreshing orders:', err);
    } finally {
      setRefreshingOrders(false);
    }
  };

  useEffect(() => {
    async function loadAccountData() {
      try {
        const supabase = createClient();
        const { data: authData, error: authErr } = await supabase.auth.getUser();

        if (authErr || !authData?.user) {
          router.replace('/login?next=/account');
          return;
        }

        const currentUser = authData.user;
        setUser(currentUser);

        // 1. Fetch Profile
        const profRes = await fetch('/api/customers/profile');
        const profJson = await profRes.json();
        if (profJson.success && profJson.user) {
          setProfile(profJson.user);
          setEditName(profJson.user.full_name || '');
          setEditPhone(profJson.user.phone || '');
        }

        // 2. Fetch Orders
        const ordRes = await fetch('/api/customers/orders');
        const ordJson = await ordRes.json();
        if (ordJson.success) {
          setOrders(ordJson.orders || []);
        }

        // 3. Fetch Reviews
        const { data: revData } = await supabase
          .from('reviews')
          .select('*, mobiles(id, name, brand)')
          .eq('customer_id', currentUser.id)
          .order('created_at', { ascending: false });

        setReviews(revData || []);
      } catch (err) {
        console.error('Account load error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAccountData();
  }, [router]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setUpdateMsg({ type: '', text: '' });

    try {
      const res = await fetch('/api/customers/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: editName.trim(),
          phone: editPhone.trim(),
        }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        setProfile(data.user);
        setEditMode(false);
        setUpdateMsg({ type: 'success', text: 'Profile updated successfully.' });
      } else {
        setUpdateMsg({ type: 'error', text: data.message || 'Failed to update profile.' });
      }
    } catch (err) {
      setUpdateMsg({ type: 'error', text: 'Unexpected error updating profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
      router.push('/');
    }
  };

  if (loading) {
    return (
      <div className={`container ${styles.container}`}>
        <div style={{ padding: '40px', color: 'var(--color-secondary)' }}>Loading customer account...</div>
      </div>
    );
  }

  const initials = (profile.full_name || user?.email || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className={`container ${styles.container}`}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-foreground)' }}>
          My Account
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-secondary)', marginTop: '4px' }}>
          Manage your personal details, monitor order statuses, and view product reviews.
        </p>
      </div>

      <div className={styles.accountGrid}>
        {/* Profile Sidebar */}
        <aside className={styles.profileSidebar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div className={styles.userAvatar}>{initials}</div>
            <div>
              <div className={styles.userName}>{profile.full_name || (isAdmin ? 'Admin User' : 'Valued Customer')}</div>
              <div className={styles.userEmail}>{profile.email || user?.email}</div>
              {isAdmin && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#eab308', fontWeight: 600, marginTop: '4px' }}>
                  <ShieldCheck size={13} /> Administrator
                </span>
              )}
            </div>
          </div>

          <nav className={styles.sidebarNav} aria-label="Customer Account Navigation">
            {isAdmin && (
              <Link
                href="/admin"
                className={styles.navButton}
                style={{ color: '#eab308', borderColor: 'rgba(234, 179, 8, 0.3)' }}
              >
                <ShieldCheck size={16} />
                <span>Admin Dashboard</span>
              </Link>
            )}

            <button
              type="button"
              className={`${styles.navButton} ${activeTab === 'profile' ? styles.navButtonActive : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <User size={16} />
              <span>Personal Details</span>
            </button>

            <button
              type="button"
              className={`${styles.navButton} ${activeTab === 'orders' ? styles.navButtonActive : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <ShoppingBag size={16} />
              <span>My Orders ({orders.length})</span>
            </button>

            <button
              type="button"
              className={`${styles.navButton} ${activeTab === 'reviews' ? styles.navButtonActive : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              <Star size={16} />
              <span>My Reviews ({reviews.length})</span>
            </button>
          </nav>

          <button type="button" onClick={handleLogout} className={styles.logoutButton}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </aside>

        {/* Content Area */}
        <main className={styles.contentCard}>
          {/* TAB 1: Profile */}
          {activeTab === 'profile' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 className={styles.sectionTitle} style={{ margin: 0 }}>
                  Personal Profile
                </h2>
                {!editMode && (
                  <button
                    type="button"
                    onClick={() => setEditMode(true)}
                    className="btn btn-outline"
                    style={{ height: '36px', padding: '0 12px', fontSize: '0.8125rem' }}
                  >
                    <Edit2 size={14} style={{ marginRight: '6px' }} />
                    Edit Profile
                  </button>
                )}
              </div>

              {updateMsg.text && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '16px',
                    fontSize: '0.8125rem',
                    background: updateMsg.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: updateMsg.type === 'success' ? '#22c55e' : '#ef4444',
                    border: `1px solid ${updateMsg.type === 'success' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                  }}
                >
                  {updateMsg.text}
                </div>
              )}

              {editMode ? (
                <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '480px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="input"
                      style={{ width: '100%', height: '40px', padding: '0 12px', background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-foreground)' }}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className="input"
                      style={{ width: '100%', height: '40px', padding: '0 12px', background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-foreground)' }}
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                    <button
                      type="submit"
                      disabled={saving}
                      className="btn btn-primary"
                      style={{ height: '38px', padding: '0 16px', fontSize: '0.8125rem' }}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditMode(false);
                        setEditName(profile.full_name || '');
                        setEditPhone(profile.phone || '');
                      }}
                      className="btn btn-outline"
                      style={{ height: '38px', padding: '0 16px', fontSize: '0.8125rem' }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  <div style={{ padding: '16px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-secondary)', textTransform: 'uppercase' }}>Full Name</div>
                    <div style={{ fontSize: '1rem', fontWeight: 600, marginTop: '4px' }}>{profile.full_name || '—'}</div>
                  </div>

                  <div style={{ padding: '16px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-secondary)', textTransform: 'uppercase' }}>Email Address</div>
                    <div style={{ fontSize: '1rem', fontWeight: 600, marginTop: '4px' }}>{profile.email || user?.email}</div>
                  </div>

                  <div style={{ padding: '16px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-secondary)', textTransform: 'uppercase' }}>Phone Number</div>
                    <div style={{ fontSize: '1rem', fontWeight: 600, marginTop: '4px' }}>{profile.phone || '—'}</div>
                  </div>

                  <div style={{ padding: '16px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-secondary)', textTransform: 'uppercase' }}>Member Since</div>
                    <div style={{ fontSize: '1rem', fontWeight: 600, marginTop: '4px' }}>{formatDate(profile.created_at || user?.created_at)}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Orders */}
          {activeTab === 'orders' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 className={styles.sectionTitle} style={{ margin: 0 }}>
                  My Orders ({orders.length})
                </h2>
                <button
                  type="button"
                  onClick={fetchOrders}
                  disabled={refreshingOrders}
                  className="btn btn-outline"
                  style={{ height: '36px', padding: '0 12px', fontSize: '0.8125rem' }}
                >
                  <RotateCw size={14} style={{ marginRight: '6px' }} className={refreshingOrders ? 'spin' : ''} />
                  <span>{refreshingOrders ? 'Refreshing...' : 'Refresh'}</span>
                </button>
              </div>

              {orders.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {orders.map((o) => {
                    const statusStyle = getOrderStatusStyle(o.status);
                    return (
                      <div
                        key={o.id}
                        style={{
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-xl)',
                          backgroundColor: 'var(--color-background)',
                          padding: '20px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '16px',
                          boxShadow: 'var(--shadow-sm)',
                        }}
                      >
                        {/* Order Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', borderBottom: '1px solid var(--color-border)', paddingBottom: '14px' }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '1.0625rem', color: 'var(--color-foreground)' }}>
                              {o.order_number}
                            </div>
                            <div style={{ fontSize: '0.8125rem', color: 'var(--color-secondary)', marginTop: '2px' }}>
                              Placed on {formatDate(o.created_at)}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', ...statusStyle }}>
                              {o.status}
                            </span>
                            <span style={{ padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', backgroundColor: o.payment_status === 'paid' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(241, 245, 249, 1)', color: o.payment_status === 'paid' ? '#15803d' : '#475569' }}>
                              {o.payment_status}
                            </span>
                          </div>
                        </div>

                        {/* Order Lifecycle Stepper */}
                        <OrderStatusProgress status={o.status} />

                        {/* Order Items Breakdown */}
                        <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-secondary)', letterSpacing: '0.05em' }}>
                            Ordered Items ({o.order_items?.length || 0})
                          </div>
                          {o.order_items && o.order_items.length > 0 ? (
                            o.order_items.map((item) => (
                              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
                                <div>
                                  <span style={{ fontWeight: 600, color: 'var(--color-foreground)' }}>{item.product_name}</span>
                                  {item.brand && <span style={{ color: 'var(--color-secondary)', marginLeft: '6px' }}>({item.brand})</span>}
                                  <span style={{ color: 'var(--color-secondary)', marginLeft: '8px' }}>× {item.quantity}</span>
                                </div>
                                <div style={{ fontWeight: 600, color: 'var(--color-foreground)' }}>
                                  {formatCurrency(item.total_price || item.unit_price * item.quantity)}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div style={{ fontSize: '0.875rem', color: 'var(--color-secondary)' }}>
                              Standard Smartphone Fulfillment
                            </div>
                          )}
                        </div>

                        {/* Order Footer & Total */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px', flexWrap: 'wrap', gap: '8px' }}>
                          <div style={{ fontSize: '0.8125rem', color: 'var(--color-secondary)' }}>
                            Shipping to: <strong style={{ color: 'var(--color-foreground)' }}>{o.city}, {o.state} ({o.pincode})</strong>
                          </div>
                          <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-foreground)' }}>
                            Total: {formatCurrency(o.total_amount)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <Package size={40} color="var(--color-muted)" aria-hidden="true" style={{ margin: '0 auto 12px' }} />
                  <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-foreground)' }}>You haven&apos;t placed any orders yet.</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-secondary)', marginTop: '4px' }}>
                    Browse our catalog of premium flagship smartphones and accessories.
                  </p>
                  <Link href="/mobiles" className="btn btn-primary" style={{ marginTop: '16px' }}>
                    Browse Mobiles Catalog
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Reviews */}
          {activeTab === 'reviews' && (
            <div>
              <h2 className={styles.sectionTitle}>My Product Reviews</h2>
              {reviews.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {reviews.map((r) => (
                    <div
                      key={r.id}
                      style={{
                        padding: '16px',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-lg)',
                        background: 'var(--color-background)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--color-foreground)' }}>
                          {r.mobiles ? `${r.mobiles.brand} ${r.mobiles.name}` : 'General Review'}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-secondary)' }}>
                          {formatDate(r.created_at)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '2px', color: '#eab308', marginBottom: '6px' }}>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            fill={i < r.rating ? '#eab308' : 'none'}
                            color="#eab308"
                          />
                        ))}
                      </div>
                      {r.title && <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '4px' }}>{r.title}</div>}
                      <p style={{ fontSize: '0.8125rem', color: 'var(--color-secondary)', margin: 0 }}>
                        {r.review_text}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <p>You haven&apos;t written any reviews yet.</p>
                  <Link href="/mobiles" className="btn btn-outline" style={{ marginTop: '16px' }}>
                    Explore Products to Review
                  </Link>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
