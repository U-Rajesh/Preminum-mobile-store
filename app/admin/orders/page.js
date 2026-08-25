import { getAdminOrders } from '@/lib/services/admin';
import OrdersTable from '@/components/admin/OrdersTable';
import styles from './orders.module.css';

export const metadata = {
  title: 'Manage Orders | MOBILÉ Admin',
  description: 'Track customer orders, update shipment statuses, and review details.',
};

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  let orders = [];
  let error = null;

  try {
    orders = await getAdminOrders();
  } catch (err) {
    console.error('Error in AdminOrdersPage:', err.message);
    error = 'Unable to load orders. Please try again.';
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Orders Management</h1>
        <p className={styles.subtitle}>
          Track customer shipments, view ordered items, and manage fulfillment workflows.
        </p>
      </header>

      {error ? (
        <div
          style={{
            padding: '32px 24px',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            textAlign: 'center',
            color: '#ef4444',
            fontSize: '0.9375rem',
          }}
          role="alert"
        >
          {error}
        </div>
      ) : (
        <OrdersTable initialOrders={orders} />
      )}
    </div>
  );
}
