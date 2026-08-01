'use client'
import { Suspense, useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useDebouncedValue } from '@/lib/useDebouncedValue'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import { cardStyle, btn, badge, pillStyle, inputStyle } from '@/components/admin/theme'

type Filtro = 'pendentes' | 'aprovados' | 'rejeitados' | 'todos'

interface ProfItem {
  id: string
  nome: string
  nome_negocio: string | null
  email: string
  cidade: string | null
  uf: string | null
  status_aprovacao: string
  ativo: boolean
  pagamento_status: string
  autor_deletado: boolean
  created_at: string
}

const FILTROS: { key: Filtro; label: string }[] = [
  { key: 'pendentes', label: 'Pendentes' },
  { key: 'aprovados', label: 'Aprovados' },
  { key: 'rejeitados', label: 'Rejeitados' },
  { key: 'todos', label: 'Todos' },
]

const STATUS_BADGE: Record<string, { label: string; variant: 'warn' | 'info' | 'success' | 'danger' }> = {
  aguardando: { label: 'aguardando', variant: 'warn' },
  edicao_pendente: { label: 'edição pendente', variant: 'info' },
  aprovado: { label: 'aprovado', variant: 'success' },
  rejeitado: { label: 'rejeitado', variant: 'danger' },
}

function AdminProfissionaisInner() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const initialFiltro = (searchParams.get('filtro') as Filtro) || 'pendentes'
  const [filtro, setFiltro] = useState<Filtro>(FILTROS.some(f => f.key === initialFiltro) ? initialFiltro : 'pendentes')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 300)
  const [items, setItems] = useState<ProfItem[]>([])
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(true)
  const [excluirAlvo, setExcluirAlvo] = useState<ProfItem | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const limit = 20

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.rpc('admin_list_profissionais', {
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

  async function moderar(id: string, acao: 'aprovar' | 'rejeitar') {
    setBusy(id)
    await supabase.rpc('admin_moderate_profissional', { p_id: id, p_acao: acao })
    setBusy(null)
    load()
  }

  async function excluir(motivo: string) {
    if (!excluirAlvo) return
    const { error } = await supabase.rpc('admin_moderate_profissional', { p_id: excluirAlvo.id, p_acao: 'excluir', p_motivo: motivo || null })
    if (error) throw new Error('Falha ao excluir.')
    setExcluirAlvo(null)
    load()
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {FILTROS.map(f => (
            <button key={f.key} onClick={() => setFiltro(f.key)} style={pillStyle(filtro === f.key)}>
              {f.label}
            </button>
          ))}
        </div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nome, negócio ou cidade…"
          style={{ ...inputStyle, flex: '1 1 220px' }}
        />
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{total} resultado{total !== 1 ? 's' : ''}</div>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-muted)' }}>Carregando…</div>
      ) : items.length === 0 ? (
        <div style={{ color: 'var(--text-muted)' }}>Nenhum profissional encontrado.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map(item => {
            const st = STATUS_BADGE[item.status_aprovacao] || { label: item.status_aprovacao, variant: 'neutral' as const }
            return (
              <Link key={item.id} href={`/admin/profissionais/${item.id}`} style={{
                ...cardStyle, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
                textDecoration: 'none', color: 'inherit',
              }}>
                <div style={{ flex: '1 1 220px', minWidth: 0 }}>
                  <div style={{ color: 'var(--text)', fontWeight: 700, fontSize: 14 }}>{item.nome_negocio || item.nome}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    {item.nome} · {item.email} · {item.cidade}{item.uf ? `/${item.uf}` : ''}
                  </div>
                </div>
                <span style={badge(st.variant)}>{st.label}</span>
                {item.autor_deletado && <span style={badge('warn')}>conta excluída</span>}
                <div style={{ display: 'flex', gap: 6 }} onClick={e => e.preventDefault()}>
                  {item.status_aprovacao !== 'aprovado' && (
                    <button disabled={busy === item.id} onClick={() => moderar(item.id, 'aprovar')} style={btn('success')}>Aprovar</button>
                  )}
                  {item.status_aprovacao !== 'rejeitado' && (
                    <button disabled={busy === item.id} onClick={() => moderar(item.id, 'rejeitar')} style={btn('warn')}>Rejeitar</button>
                  )}
                  <button disabled={busy === item.id} onClick={() => setExcluirAlvo(item)} style={btn('danger')}>Excluir</button>
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

      {excluirAlvo && (
        <ConfirmDialog
          title={`Excluir "${excluirAlvo.nome_negocio || excluirAlvo.nome}"?`}
          description="Essa ação remove o cadastro profissional permanentemente. Não pode ser desfeita."
          askMotivo
          onConfirm={excluir}
          onCancel={() => setExcluirAlvo(null)}
        />
      )}
    </div>
  )
}

export default function AdminProfissionaisPage() {
  return (
    <Suspense fallback={<div style={{ color: 'var(--text-muted)' }}>Carregando…</div>}>
      <AdminProfissionaisInner />
    </Suspense>
  )
}
