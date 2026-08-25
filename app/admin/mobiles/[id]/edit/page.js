import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getAdminMobileById } from '@/lib/services/admin';
import MobileForm from '@/components/admin/MobileForm';

export const metadata = {
  title: 'Edit Mobile | MOBILÉ Admin',
  description: 'Update smartphone specifications, pricing, and stock status.',
};

export default async function EditMobilePage({ params }) {
  const { id } = await params;
  const mobile = await getAdminMobileById(id);

  if (!mobile) {
    notFound();
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      <div>
        <Link
          href="/admin/mobiles"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: 'var(--color-secondary)', marginBottom: '8px', textDecoration: 'none' }}
        >
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Back to Mobiles</span>
        </Link>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', letterSpacing: '-0.02em' }}>
          Edit {mobile.brand} {mobile.name}
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-secondary)' }}>
          Modify specifications, pricing, stock levels, or images.
        </p>
      </div>

      <MobileForm initialData={mobile} isEditing={true} />
    </div>
  );
}
