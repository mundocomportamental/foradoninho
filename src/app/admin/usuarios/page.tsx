'use client'
import { Suspense, useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useDebouncedValue } from '@/lib/useDebouncedValue'
import { cardStyle, btn, pillStyle, inputStyle, tierInfo } from '@/components/admin/theme'

type Sort = 'recentes' | 'ativos'

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

const SORTS: { key: Sort; label: string }[] = [
  { key: 'recentes', label: 'Mais recentes' },
  { key: 'ativos', label: 'Mais ativos' },
]

function AdminUsuariosInner() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const initialSort = (searchParams.get('sort') as Sort) || 'recentes'
  const [sort, setSort] = useState<Sort>(SORTS.some(s => s.key === initialSort) ? initialSort : 'recentes')
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
      p_search: debouncedSearch || null, p_limit: limit, p_offset: offset, p_sort: sort,
    })
    if (!error && data) {
      setItems(data.items || [])
      setTotal(data.total || 0)
    }
    setLoading(false)
  }, [supabase, debouncedSearch, offset, sort])

  useEffect(() => { setOffset(0) }, [debouncedSearch, sort])
  useEffect(() => { load() }, [load])

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {SORTS.map(s => (
            <button key={s.key} onClick={() => setSort(s.key)} style={pillStyle(sort === s.key)}>
              {s.label}
            </button>
          ))}
        </div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nome, username ou e-mail…"
          style={{ ...inputStyle, flex: '1 1 220px' }}
        />
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{total} usuário{total !== 1 ? 's' : ''}</div>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-muted)' }}>Carregando…</div>
      ) : items.length === 0 ? (
        <div style={{ color: 'var(--text-muted)' }}>Nenhum usuário encontrado.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map((u, i) => {
            const tier = tierInfo(u.total_avaliacoes + u.total_checkins)
            return (
              <Link key={u.id} href={`/admin/usuarios/${u.id}`} style={{
                ...cardStyle, padding: '14px 16px',
                display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', textDecoration: 'none', color: 'inherit',
              }}>
                {sort === 'ativos' && (
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', width: 18 }}>{offset + i + 1}</div>
                )}
                <div style={{ flex: '1 1 220px', minWidth: 0 }}>
                  <div style={{ color: 'var(--text)', fontWeight: 700, fontSize: 14 }}>
                    {u.display_name || u.username || 'Sem nome'} {u.is_admin && <span style={{ fontSize: 11, color: '#92400e' }}>· admin</span>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{u.email}</div>
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{tier.icon} {tier.label}</span>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {u.total_avaliacoes} avaliações · {u.total_checkins} check-ins · {u.total_locais_adicionados} locais
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  desde {new Date(u.created_at).toLocaleDateString('pt-BR')}
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {total > limit && (
        <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'center' }}>
          <button disabled={offset === 0} onClick={() => setOffset(o => Math.max(0, o - limit))} style={btn('neutral')}>← Anterior</button>
          <button disabled={offset + limit >= total} onClick={() => setOffset(o => o + limit)} style={btn('neutral')}>Próxima →</button>
        </div>
      )}
    </div>
  )
}

export default function AdminUsuariosPage() {
  return (
    <Suspense fallback={<div style={{ color: 'var(--text-muted)' }}>Carregando…</div>}>
      <AdminUsuariosInner />
    </Suspense>
  )
}
