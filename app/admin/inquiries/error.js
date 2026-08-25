'use client';

export default function AdminInquiriesError({ error, reset }) {
  return (
    <div style={{ padding: '48px', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '8px' }}>Failed to load customer inquiries</h2>
      <p style={{ color: '#64748b', marginBottom: '16px' }}>{error?.message || 'Error fetching inquiries from database.'}</p>
      <button onClick={() => reset()} className="btn btn-primary">
        Retry
      </button>
    </div>
  );
}
