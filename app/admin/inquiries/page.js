import { getAdminInquiries } from '@/lib/services/admin';
import InquiriesTable from '@/components/admin/InquiriesTable';
import styles from './inquiries.module.css';

export const metadata = {
  title: 'Customer Inquiries | MOBILÉ Admin',
  description: 'Manage and respond to customer questions and stock inquiries.',
};

export const dynamic = 'force-dynamic';

export default async function AdminInquiriesPage() {
  const inquiries = await getAdminInquiries();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Customer Inquiries</h1>
        <p className={styles.subtitle}>
          Review incoming questions, stock checks, and support inquiries from customers.
        </p>
      </header>

      <InquiriesTable initialInquiries={inquiries} />
    </div>
  );
}
