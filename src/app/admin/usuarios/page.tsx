'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useDebouncedValue } from '@/lib/useDebouncedValue'

interface UserItem {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
  display_name: string | null
  username: string | null
  is_admin: boolean
  plano: string
  total_avaliacoes: number
  total_checkins: number
  total_locais_adicionados: number
}

function tierInfo(total: number): { label: string; icon: string } {
  if (total > 50) return { label: 'Águia', icon: '🦅' }
  if (total > 15) return { label: 'Gaivota', icon: '🕊️' }
  if (total > 5) return { label: 'Andorinha', icon: '🐦' }
  return { label: 'Filhote', icon: '🐣' }
}

export default function AdminUsuariosPage() {
  const supabase = createClient()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 300)
  const [items, setItems] = useState<UserItem[]>([])
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(true)
  const limit = 20

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.rpc('admin_list_users', {
      p_search: debouncedSearch || null, p_limit: limit, p_offset: offset,
    })
    if (!error && data) {
      setItems(data.items || [])
      setTotal(data.total || 0)
    }
    setLoading(false)
  }, [supabase, debouncedSearch, offset])

  useEffect(() => { setOffset(0) }, [debouncedSearch])
  useEffect(() => { load() }, [load])

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nome, username ou e-mail…"
          style={{
            flex: '1 1 260px', height: 36, padding: '0 12px', borderRadius: 8,
            border: '1px solid #374151', background: '#111827', color: 'white', fontSize: 13,
            fontFamily: 'inherit',
          }}
        />
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{total} usuário{total !== 1 ? 's' : ''}</div>
      </div>

      {loading ? (
        <div style={{ color: 'rgba(255,255,255,0.4)' }}>Carregando…</div>
      ) : items.length === 0 ? (
        <div style={{ color: 'rgba(255,255,255,0.4)' }}>Nenhum usuário encontrado.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map(u => {
            const tier = tierInfo(u.total_avaliacoes + u.total_checkins)
            return (
              <Link key={u.id} href={`/admin/usuarios/${u.id}`} style={{
                background: '#111827', border: '1px solid #1f2937', borderRadius: 12, padding: '14px 16px',
                display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', textDecoration: 'none',
              }}>
                <div style={{ flex: '1 1 220px', minWidth: 0 }}>
                  <div style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>
                    {u.display_name || u.username || 'Sem nome'} {u.is_admin && <span style={{ fontSize: 11, color: '#fbbf24' }}>· admin</span>}
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{u.email}</div>
                </div>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{tier.icon} {tier.label}</span>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                  {u.total_avaliacoes} avaliações · {u.total_checkins} check-ins · {u.total_locais_adicionados} locais
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                  desde {new Date(u.created_at).toLocaleDateString('pt-BR')}
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {total > limit && (
        <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'center' }}>
          <button disabled={offset === 0} onClick={() => setOffset(o => Math.max(0, o - limit))} style={btnStyle}>← Anterior</button>
          <button disabled={offset + limit >= total} onClick={() => setOffset(o => o + limit)} style={btnStyle}>Próxima →</button>
        </div>
      )}
    </div>
  )
}

const btnStyle: React.CSSProperties = {
  padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
  border: 'none', background: '#374151', color: 'white', fontFamily: 'inherit',
}
