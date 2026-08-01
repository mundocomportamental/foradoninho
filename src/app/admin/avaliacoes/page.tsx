'use client'
import { Suspense, useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useDebouncedValue } from '@/lib/useDebouncedValue'
import { useRealtimeRefresh } from '@/lib/useRealtimeRefresh'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import { cardStyle, btn, badge, pillStyle, inputStyle } from '@/components/admin/theme'

type Filtro = 'pendentes' | 'aprovadas' | 'todas'

interface AvaliacaoItem {
  id: string
  local_id: string
  local_nome: string
  is_servico: boolean
  user_id: string | null
  user_email: string | null
  user_nome: string | null
  user_deletado: boolean
  experiencia: number | null
  limpeza: number | null
  atendimento: number | null
  instalacoes: number | null
  comentario: string | null
  imagens: string[] | null
  aprovado: boolean | null
  created_at: string
}

const FILTROS: { key: Filtro; label: string }[] = [
  { key: 'pendentes', label: 'Pendentes' },
  { key: 'aprovadas', label: 'Aprovadas' },
  { key: 'todas', label: 'Todas' },
]

function AdminAvaliacoesInner() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const initialFiltro = (searchParams.get('filtro') as Filtro) || 'pendentes'
  const [filtro, setFiltro] = useState<Filtro>(FILTROS.some(f => f.key === initialFiltro) ? initialFiltro : 'pendentes')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 300)
  const [items, setItems] = useState<AvaliacaoItem[]>([])
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(true)
  const [excluirAlvo, setExcluirAlvo] = useState<AvaliacaoItem | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const limit = 20

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.rpc('admin_list_avaliacoes', {
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
  useRealtimeRefresh('avaliacoes', load)

  async function aprovar(id: string) {
    setBusy(id)
    await supabase.rpc('admin_approve_avaliacao', { p_id: id })
    setBusy(null)
    load()
  }

  async function excluir(motivo: string) {
    if (!excluirAlvo) return
    const { error } = await supabase.rpc('admin_delete_avaliacao', { p_id: excluirAlvo.id, p_motivo: motivo || null })
    if (error) throw new Error('Falha ao excluir.')
    setExcluirAlvo(null)
    load()
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', margin: 0 }}>Avaliações</h1>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: '#059669' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#059669', display: 'inline-block', animation: 'pulse-live 1.6s infinite' }} />
          ao vivo
        </span>
        <style>{`@keyframes pulse-live { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
      </div>

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
          placeholder="Buscar por local ou comentário…"
          style={{ ...inputStyle, flex: '1 1 220px' }}
        />
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{total} resultado{total !== 1 ? 's' : ''}</div>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-muted)' }}>Carregando…</div>
      ) : items.length === 0 ? (
        <div style={{ color: 'var(--text-muted)' }}>Nenhuma avaliação encontrada.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map(item => (
            <div key={item.id} style={{ ...cardStyle, padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <Link
                      href={item.is_servico ? `/admin/profissionais/${item.local_id}` : `/admin/locais/${item.local_id}`}
                      style={{ color: 'var(--green-dark)', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}
                    >
                      {item.local_nome}
                    </Link>
                    <span style={badge('neutral')}>{item.is_servico ? 'profissional' : 'estabelecimento'}</span>
                    <span style={badge(item.aprovado ? 'success' : 'warn')}>{item.aprovado ? 'aprovada' : 'pendente'}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    por{' '}
                    {item.user_id ? (
                      <Link href={`/admin/usuarios/${item.user_id}`} style={{ color: 'var(--text-secondary)', textDecoration: 'underline' }}>
                        {item.user_nome || item.user_email || 'usuário'}
                      </Link>
                    ) : (
                      <span>{item.user_nome || item.user_email || 'usuário'}</span>
                    )}
                    {item.user_deletado && <span style={badge('warn')}>conta excluída</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  {!item.aprovado && <button disabled={busy === item.id} onClick={() => aprovar(item.id)} style={btn('success')}>Aprovar</button>}
                  <button disabled={busy === item.id} onClick={() => setExcluirAlvo(item)} style={btn('ghost-danger')}>Excluir</button>
                </div>
              </div>

              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <span>Experiência {item.experiencia ?? '—'}/10</span>
                {item.limpeza != null && <span>Limpeza {item.limpeza}</span>}
                {item.atendimento != null && <span>Atendimento {item.atendimento}</span>}
                {item.instalacoes != null && <span>Instalações {item.instalacoes}</span>}
              </div>

              {item.comentario && (
                <div style={{ fontSize: 13, color: 'var(--text)', marginTop: 8, lineHeight: 1.5 }}>&quot;{item.comentario}&quot;</div>
              )}

              {item.imagens && item.imagens.length > 0 && (
                <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                  {item.imagens.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noreferrer">
                      <img src={url} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} />
                    </a>
                  ))}
                </div>
              )}

              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>{new Date(item.created_at).toLocaleString('pt-BR')}</div>
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
          title="Excluir avaliação?"
          description="Remove essa avaliação permanentemente. A nota média do local é recalculada automaticamente."
          askMotivo
          onConfirm={excluir}
          onCancel={() => setExcluirAlvo(null)}
        />
      )}
    </div>
  )
}

export default function AdminAvaliacoesPage() {
  return (
    <Suspense fallback={<div style={{ color: 'var(--text-muted)' }}>Carregando…</div>}>
      <AdminAvaliacoesInner />
    </Suspense>
  )
}
