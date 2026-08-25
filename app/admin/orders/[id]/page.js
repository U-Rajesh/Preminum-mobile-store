import { notFound } from 'next/navigation';
import { getAdminOrderById } from '@/lib/services/admin';
import OrderDetailView from '@/components/admin/OrderDetailView';

export const metadata = {
  title: 'Order Details | MOBILÉ Admin',
  description: 'View ordered items, customer shipping information, and manage fulfillment.',
};

export default async function AdminOrderDetailPage({ params }) {
  const { id } = await params;
  const order = await getAdminOrderById(id);

  if (!order) {
    notFound();
  }

  return <OrderDetailView initialOrder={order} />;
}
