export default function AdminDashboardLoading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }} aria-busy="true">
      <div style={{ height: '40px', width: '240px', backgroundColor: 'rgba(255, 255, 255, 0.06)', borderRadius: '10px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{ height: '110px', backgroundColor: 'rgba(25, 24, 23, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px' }} />
        ))}
      </div>
    </div>
  );
}
