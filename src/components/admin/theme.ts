// Tokens de estilo do Painel Admin — usa as mesmas CSS vars do resto do
// app (definidas em src/app/globals.css) pra manter a identidade visual
// consistente, em vez do tema escuro isolado que o admin tinha antes.

export const cardStyle: React.CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  boxShadow: 'var(--shadow)',
}

type BtnVariant = 'success' | 'warn' | 'danger' | 'neutral' | 'ghost-danger'

export function btn(variant: BtnVariant = 'neutral'): React.CSSProperties {
  const base: React.CSSProperties = {
    padding: '7px 14px', borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 700,
    cursor: 'pointer', border: 'none', fontFamily: 'var(--font)',
  }
  switch (variant) {
    case 'success': return { ...base, background: '#059669', color: 'white' }
    case 'warn': return { ...base, background: '#d97706', color: 'white' }
    case 'danger': return { ...base, background: '#dc2626', color: 'white' }
    case 'ghost-danger': return { ...base, background: 'transparent', color: '#dc2626', border: '1px solid #fecaca', padding: '5px 10px' }
    default: return { ...base, background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)' }
  }
}

type BadgeVariant = 'success' | 'warn' | 'danger' | 'info' | 'neutral'

export function badge(variant: BadgeVariant = 'neutral'): React.CSSProperties {
  const base: React.CSSProperties = {
    padding: '3px 10px', borderRadius: 20, fontWeight: 700, fontSize: 11, display: 'inline-block',
  }
  switch (variant) {
    case 'success': return { ...base, background: '#d1fae5', color: '#065f46' }
    case 'warn': return { ...base, background: '#fef3c7', color: '#92400e' }
    case 'danger': return { ...base, background: '#fee2e2', color: '#991b1b' }
    case 'info': return { ...base, background: '#dbeafe', color: '#1e40af' }
    default: return { ...base, background: 'var(--bg)', color: 'var(--text-muted)' }
  }
}

export const pillStyle = (active: boolean): React.CSSProperties => ({
  padding: '7px 14px', borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 700, cursor: 'pointer',
  border: active ? '1px solid var(--green)' : '1px solid var(--border)', fontFamily: 'var(--font)',
  background: active ? 'var(--green-soft)' : 'var(--bg-card)',
  color: active ? 'var(--green-dark)' : 'var(--text-muted)',
})

export const inputStyle: React.CSSProperties = {
  height: 38, padding: '0 12px', borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text)', fontSize: 13,
  fontFamily: 'var(--font)', outline: 'none',
}

export function tierInfo(total: number): { label: string; icon: string } {
  if (total > 50) return { label: 'Águia', icon: '🦅' }
  if (total > 15) return { label: 'Gaivota', icon: '🕊️' }
  if (total > 5) return { label: 'Andorinha', icon: '🐦' }
  return { label: 'Filhote', icon: '🐣' }
}
