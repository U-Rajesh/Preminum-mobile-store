import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import MobileForm from '@/components/admin/MobileForm';

export const metadata = {
  title: 'Add New Mobile | MOBILÉ Admin',
  description: 'Create a new smartphone listing in the store catalog.',
};

export default function NewMobilePage() {
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
          Add New Smartphone
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-secondary)' }}>
          Enter detailed specifications, pricing, and image URLs to add a device to your catalog.
        </p>
      </div>

      <MobileForm isEditing={false} />
    </div>
  );
}
