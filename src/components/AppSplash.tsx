export default function AppSplash() {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'var(--bg)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 18,
    }}>
      <img
        src="/icons/icon-192x192.png"
        alt="Fora do Ninho"
        width={76}
        height={76}
        style={{ borderRadius: 20, boxShadow: '0 8px 24px rgba(51,204,204,0.18)' }}
      />
      <div className="splash-bar-track">
        <div className="splash-bar-fill" />
      </div>
    </div>
  )
}
