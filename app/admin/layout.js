import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import styles from './layout.module.css';

export const metadata = {
  title: 'Admin Dashboard | MOBILÉ',
  description: 'Administrative store control center for MOBILÉ smartphone eCommerce.',
};

export default function AdminLayout({ children }) {
  return (
    <div className={styles.adminWrapper}>
      <AdminHeader />
      <div className={styles.sidebarWrapper}>
        <AdminSidebar />
      </div>
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}
