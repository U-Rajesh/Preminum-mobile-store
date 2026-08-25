'use client';

export default function AdminOrdersError({ error, reset }) {
  return (
    <div style={{ padding: '48px', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '8px' }}>Failed to load orders</h2>
      <p style={{ color: '#64748b', marginBottom: '16px' }}>{error?.message || 'Error fetching orders from database.'}</p>
      <button onClick={() => reset()} className="btn btn-primary">
        Retry
      </button>
    </div>
  );
}
