'use client'
import { Suspense, useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useDebouncedValue } from '@/lib/useDebouncedValue'
import { useRealtimeRefresh } from '@/lib/useRealtimeRefresh'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import { cardStyle, btn, badge, inputStyle } from '@/components/admin/theme'

interface CheckinItem {
  id: string
  local_id: string
  local_nome: string
  is_servico: boolean
  user_id: string | null
  user_email: string | null
  user_nome: string | null
  created_at: string
}

function AdminCheckinsInner() {
  const supabase = createClient()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 300)
  const [items, setItems] = useState<CheckinItem[]>([])
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(true)
  const [excluirAlvo, setExcluirAlvo] = useState<CheckinItem | null>(null)
  const limit = 30

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.rpc('admin_list_checkins', {
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
  useRealtimeRefresh('checkins', load)

  async function excluir(motivo: string) {
    if (!excluirAlvo) return
    const { error } = await supabase.rpc('admin_delete_checkin', { p_id: excluirAlvo.id, p_motivo: motivo || null })
    if (error) throw new Error('Falha ao excluir.')
    setExcluirAlvo(null)
    load()
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', margin: 0 }}>Check-ins</h1>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: '#059669' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#059669', display: 'inline-block', animation: 'pulse-live 1.6s infinite' }} />
          ao vivo
        </span>
        <style>{`@keyframes pulse-live { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por local…"
          style={{ ...inputStyle, flex: '1 1 220px' }}
        />
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{total} resultado{total !== 1 ? 's' : ''}</div>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-muted)' }}>Carregando…</div>
      ) : items.length === 0 ? (
        <div style={{ color: 'var(--text-muted)' }}>Nenhum check-in encontrado.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map(item => (
            <div key={item.id} style={{ ...cardStyle, padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <Link
                    href={item.is_servico ? `/admin/profissionais/${item.local_id}` : `/admin/locais/${item.local_id}`}
                    style={{ color: 'var(--green-dark)', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}
                  >
                    {item.local_nome}
                  </Link>
                  <span style={badge('neutral')}>{item.is_servico ? 'profissional' : 'estabelecimento'}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                  {item.user_id ? (
                    <Link href={`/admin/usuarios/${item.user_id}`} style={{ color: 'var(--text-secondary)', textDecoration: 'underline' }}>
                      {item.user_nome || item.user_email || 'usuário'}
                    </Link>
                  ) : (
                    <span>usuário removido</span>
                  )}
                  {' · '}{new Date(item.created_at).toLocaleString('pt-BR')}
                </div>
              </div>
              <button onClick={() => setExcluirAlvo(item)} style={btn('ghost-danger')}>Excluir</button>
            </div>
          ))}
        </div>
      )}

      {total > limit && (
        <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'center' }}>
          <button disabled={offset === 0} onClick={() => setOffset(o => Math.max(0, o - limit))} style={btn('neutral')}>← Anterior</button>
          <button disabled={offset + limit >= total} onClick={() => setOffset(o => o + limit)} style={btn('neutral')}>Próxima →</button>
        </div>
      )}

      {excluirAlvo && (
        <ConfirmDialog
          title="Excluir check-in?"
          description="Remove esse check-in permanentemente."
          askMotivo
          onConfirm={excluir}
          onCancel={() => setExcluirAlvo(null)}
        />
      )}
    </div>
  )
}

export default function AdminCheckinsPage() {
  return (
    <Suspense fallback={<div style={{ color: 'var(--text-muted)' }}>Carregando…</div>}>
      <AdminCheckinsInner />
    </Suspense>
  )
}
