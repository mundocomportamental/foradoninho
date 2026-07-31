'use client'
import { Suspense, useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useDebouncedValue } from '@/lib/useDebouncedValue'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import { cardStyle, btn, badge, pillStyle, inputStyle } from '@/components/admin/theme'

type Filtro = 'pendentes' | 'ativos' | 'todos'

interface LocalItem {
  id: string
  nome: string
  tipo: string
  cidade: string | null
  estado: string | null
  is_active: boolean
  aprovado: boolean
  rating: number
  total_ratings: number
  total_checkins: number
  added_by: string | null
  added_by_email: string | null
  added_by_nome: string | null
  created_at: string
}

const FILTROS: { key: Filtro; label: string }[] = [
  { key: 'pendentes', label: 'Pendentes' },
  { key: 'ativos', label: 'Ativos' },
  { key: 'todos', label: 'Todos' },
]

function AdminLocaisInner() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const initialFiltro = (searchParams.get('filtro') as Filtro) || 'pendentes'
  const [filtro, setFiltro] = useState<Filtro>(FILTROS.some(f => f.key === initialFiltro) ? initialFiltro : 'pendentes')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 300)
  const [items, setItems] = useState<LocalItem[]>([])
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(true)
  const [excluirAlvo, setExcluirAlvo] = useState<LocalItem | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const limit = 20

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.rpc('admin_list_locais', {
      p_filtro: filtro, p_search: debouncedSearch || null, p_limit: limit, p_offset: offset,
    })
    if (!error && data) {
      setItems(data.items || [])
      setTotal(data.total || 0)
    }
    setLoading(false)
  }, [supabase, filtro, debouncedSearch, offset])

  useEffect(() => { setOffset(0) }, [filtro, debouncedSearch])
  useEffect(() => { load() }, [load])

  async function moderar(id: string, acao: 'aprovar' | 'rejeitar', motivo?: string) {
    setBusy(id)
    await supabase.rpc('admin_moderate_local', { p_local_id: id, p_acao: acao, p_motivo: motivo || null })
    setBusy(null)
    load()
  }

  async function excluir(motivo: string) {
    if (!excluirAlvo) return
    const { error } = await supabase.rpc('admin_moderate_local', { p_local_id: excluirAlvo.id, p_acao: 'excluir', p_motivo: motivo || null })
    if (error) throw new Error('Falha ao excluir.')
    setExcluirAlvo(null)
    load()
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {FILTROS.map(f => (
            <button key={f.key} onClick={() => setFiltro(f.key)} style={pillStyle(filtro === f.key)}>
              {f.label}
            </button>
          ))}
        </div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nome ou cidade…"
          style={{ ...inputStyle, flex: '1 1 220px' }}
        />
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{total} resultado{total !== 1 ? 's' : ''}</div>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-muted)' }}>Carregando…</div>
      ) : items.length === 0 ? (
        <div style={{ color: 'var(--text-muted)' }}>Nenhum local encontrado.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map(item => (
            <Link key={item.id} href={`/admin/locais/${item.id}`} style={{
              ...cardStyle, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
              textDecoration: 'none', color: 'inherit',
            }}>
              <div style={{ flex: '1 1 220px', minWidth: 0 }}>
                <div style={{ color: 'var(--text)', fontWeight: 700, fontSize: 14 }}>{item.nome}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {item.cidade}{item.estado ? `/${item.estado}` : ''} · {item.tipo} · adicionado por {item.added_by_nome || item.added_by_email || 'desconhecido'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, fontSize: 11 }}>
                <span style={badge(item.is_active ? 'success' : 'warn')}>{item.is_active ? 'ativo' : 'pendente'}</span>
                {!item.aprovado && <span style={badge('info')}>fotos pendentes</span>}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                ⭐ {item.rating?.toFixed(1) ?? '0.0'} ({item.total_ratings}) · {item.total_checkins} check-ins
              </div>
              <div style={{ display: 'flex', gap: 6 }} onClick={e => e.preventDefault()}>
                {!item.is_active && (
                  <button disabled={busy === item.id} onClick={() => moderar(item.id, 'aprovar')} style={btn('success')}>Aprovar</button>
                )}
                {item.is_active && (
                  <button disabled={busy === item.id} onClick={() => moderar(item.id, 'rejeitar')} style={btn('warn')}>Desativar</button>
                )}
                <button disabled={busy === item.id} onClick={() => setExcluirAlvo(item)} style={btn('danger')}>Excluir</button>
              </div>
            </Link>
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
          title={`Excluir "${excluirAlvo.nome}"?`}
          description="Essa ação remove o local permanentemente do banco, incluindo suas avaliações e check-ins associados. Não pode ser desfeita."
          askMotivo
          onConfirm={excluir}
          onCancel={() => setExcluirAlvo(null)}
        />
      )}
    </div>
  )
}

export default function AdminLocaisPage() {
  return (
    <Suspense fallback={<div style={{ color: 'var(--text-muted)' }}>Carregando…</div>}>
      <AdminLocaisInner />
    </Suspense>
  )
}
