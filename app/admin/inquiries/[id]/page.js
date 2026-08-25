import { notFound } from 'next/navigation';
import { getAdminInquiryById } from '@/lib/services/admin';
import InquiryDetailView from '@/components/admin/InquiryDetailView';

export const metadata = {
  title: 'Inquiry Details | MOBILÉ Admin',
  description: 'Review customer message, contact info, and respond via email.',
};

export const dynamic = 'force-dynamic';

export default async function AdminInquiryDetailPage({ params }) {
  const { id } = await params;
  const inquiry = await getAdminInquiryById(id);

  if (!inquiry) {
    notFound();
  }

  return <InquiryDetailView initialInquiry={inquiry} />;
}
