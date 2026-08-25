import Link from 'next/link';
import { Plus } from 'lucide-react';
import { getAdminMobiles } from '@/lib/services/admin';
import MobilesTable from '@/components/admin/MobilesTable';
import styles from './mobiles.module.css';

export const metadata = {
  title: 'Manage Mobiles | MOBILÉ Admin',
  description: 'Manage store catalog, specifications, stock, and pricing.',
};

export const dynamic = 'force-dynamic';

export default async function AdminMobilesPage() {
  const mobiles = await getAdminMobiles();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Mobile Catalog</h1>
          <p className={styles.subtitle}>
            Manage your smartphone inventory, specifications, stock status, and visibility.
          </p>
        </div>

        <Link
          href="/admin/mobiles/new"
          className="btn btn-primary"
          style={{ height: '42px', padding: '0 16px' }}
        >
          <Plus size={16} aria-hidden="true" style={{ marginRight: '4px' }} />
          <span>Add New Mobile</span>
        </Link>
      </header>

      <MobilesTable initialMobiles={mobiles} />
    </div>
  );
}
