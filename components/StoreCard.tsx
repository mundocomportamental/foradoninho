'use client'

type Store = {
  id: string
  name: string
  slug: string
  address_city: string
  address_state: string
  distance_m: number
}

type Props = {
  store: Store
  selected: boolean
  onClick: () => void
  index: number
}

export default function StoreCard({ store, selected, onClick, index }: Props) {
  const isGraal = store.name.toLowerCase().includes('graal')
  const km = (store.distance_m / 1000).toFixed(0)
  const emoji = isGraal ? '⛽' : '🍗'
  const brand = isGraal ? 'Graal' : 'Frango Assado'
  const accentColor = isGraal ? 'var(--accent)' : 'var(--accent-2)'
  const accentSoft = isGraal ? 'var(--accent-soft)' : 'var(--accent-2-soft)'

  return (
    <button
      onClick={onClick}
      className="animate-slide-up"
      style={{
        animationDelay: `${index * 0.06}s`,
        opacity: 0,
        width: '100%',
        textAlign: 'left',
        background: selected ? accentSoft : 'var(--bg-card)',
        border: `1.5px solid ${selected ? accentColor : 'var(--border)'}`,
        borderRadius: 'var(--radius)',
        padding: '14px 16px',
        cursor: 'pointer',
        transition: 'border-color 0.15s, background 0.15s, box-shadow 0.15s',
        boxShadow: selected ? `0 0 0 3px ${accentColor}22` : 'var(--shadow)',
      }}
      onMouseEnter={(e) => {
        if (!selected) {
          ;(e.currentTarget as HTMLButtonElement).style.borderColor = accentColor
          ;(e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 0 2px ${accentColor}18`
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'
          ;(e.currentTarget as HTMLButtonElement).style.boxShadow = 'var(--shadow)'
        }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        {/* Icon */}
        <div style={{
          width: 40, height: 40, flexShrink: 0,
          background: accentSoft,
          borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20,
        }}>
          {emoji}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 14,
            color: 'var(--text)',
            lineHeight: 1.3,
            marginBottom: 2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {store.name}
          </div>
          <div style={{
            fontSize: 12,
            color: 'var(--text-muted)',
            marginBottom: 8,
          }}>
            {store.address_city} · {store.address_state}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              background: accentSoft,
              color: accentColor,
              fontSize: 11,
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 20,
            }}>
              {km} km
            </span>
            <span style={{
              fontSize: 11,
              color: 'var(--text-muted)',
            }}>
              {brand}
            </span>
          </div>
        </div>

        {/* Arrow */}
        {selected && (
          <div style={{
            color: accentColor,
            fontSize: 18,
            fontWeight: 700,
            marginTop: 2,
          }}>›</div>
        )}
      </div>
    </button>
  )
}
