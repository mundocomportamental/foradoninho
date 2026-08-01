'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import { cardStyle, btn, badge } from '@/components/admin/theme'

interface Detail {
  local: {
    id: string; nome: string; tipo: string; cidade: string | null; estado: string | null
    endereco: string | null; lat: number | null; lng: number | null
    is_active: boolean; aprovado: boolean; rating: number; total_ratings: number; total_checkins: number
    created_at: string
  }
  adicionado_por: { id: string | null; email: string | null; display_name: string | null; deletado: boolean } | null
  avaliacoes_recentes: {
    id: string; user_id: string | null; user_email: string | null; user_nome: string | null; user_deletado: boolean
    rating: number | null; experiencia: number | null; limpeza: number | null; atendimento: number | null
    instalacoes: number | null; comentario: string | null; aprovado: boolean; imagens: string[] | null; created_at: string
  }[]
  checkins_recentes: { id: string; user_id: string; user_email: string; user_nome: string | null; created_at: string }[]
}

export default function AdminLocalDetailPage() {
  const supabase = createClient()
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [detail, setDetail] = useState<Detail | null>(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [excluirAvaliacao, setExcluirAvaliacao] = useState<string | null>(null)
  const [excluirCheckin, setExcluirCheckin] = useState<string | null>(null)
  const [excluirLocal, setExcluirLocal] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.rpc('admin_get_local_detail', { p_local_id: id })
    if (error) { setErro('Local não encontrado.'); setLoading(false); return }
    setDetail(data as Detail)
    setLoading(false)
  }, [supabase, id])

  useEffect(() => { load() }, [load])

  async function moderar(acao: 'aprovar' | 'rejeitar') {
    await supabase.rpc('admin_moderate_local', { p_local_id: id, p_acao: acao })
    load()
  }

  async function aprovarAvaliacao(avaliacaoId: string) {
    await supabase.rpc('admin_approve_avaliacao', { p_id: avaliacaoId })
    load()
  }

  async function confirmarExcluirAvaliacao(motivo: string) {
    if (!excluirAvaliacao) return
    await supabase.rpc('admin_delete_avaliacao', { p_id: excluirAvaliacao, p_motivo: motivo || null })
    setExcluirAvaliacao(null)
    load()
  }

  async function confirmarExcluirCheckin(motivo: string) {
    if (!excluirCheckin) return
    await supabase.rpc('admin_delete_checkin', { p_id: excluirCheckin, p_motivo: motivo || null })
    setExcluirCheckin(null)
    load()
  }

  async function confirmarExcluirLocal() {
    await supabase.rpc('admin_moderate_local', { p_local_id: id, p_acao: 'excluir' })
    router.push('/admin/locais')
  }

  if (loading) return <div style={{ color: 'var(--text-muted)' }}>Carregando…</div>
  if (erro || !detail) return <div style={{ color: '#dc2626' }}>{erro}</div>

  const { local } = detail

  return (
    <div>
      <Link href="/admin/locais" style={{ color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>← Voltar</Link>

      <div style={{ ...cardStyle, padding: 20, marginTop: 12, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>{local.nome}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
              {local.tipo} · {local.endereco ? `${local.endereco}, ` : ''}{local.cidade}/{local.estado}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              lat/lng: {local.lat ?? '—'}, {local.lng ?? '—'} · criado em {new Date(local.created_at).toLocaleString('pt-BR')}
            </div>
            {detail.adicionado_por && (detail.adicionado_por.display_name || detail.adicionado_por.email) && (
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                Adicionado por{' '}
                {detail.adicionado_por.id ? (
                  <Link href={`/admin/usuarios/${detail.adicionado_por.id}`} style={{ color: 'var(--green-dark)', textDecoration: 'none', fontWeight: 700 }}>
                    {detail.adicionado_por.display_name || detail.adicionado_por.email}
                  </Link>
                ) : (
                  <span style={{ fontWeight: 700, color: 'var(--text)' }}>{detail.adicionado_por.display_name || detail.adicionado_por.email}</span>
                )}
                {detail.adicionado_por.deletado && <span style={badge('warn')}>conta excluída</span>}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
            <div style={{ fontSize: 12, display: 'flex', gap: 6 }}>
              <span style={badge(local.is_active ? 'success' : 'warn')}>{local.is_active ? 'ativo no mapa' : 'pendente'}</span>
              {!local.aprovado && <span style={badge('info')}>fotos pendentes</span>}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              ⭐ {local.rating?.toFixed(1) ?? '0.0'} ({local.total_ratings} avaliações) · {local.total_checkins} check-ins
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {!local.is_active
                ? <button onClick={() => moderar('aprovar')} style={btn('success')}>Aprovar</button>
                : <button onClick={() => moderar('rejeitar')} style={btn('warn')}>Desativar</button>}
              <button onClick={() => setExcluirLocal(true)} style={btn('danger')}>Excluir local</button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10 }}>Avaliações recentes ({detail.avaliacoes_recentes.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {detail.avaliacoes_recentes.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Nenhuma avaliação ainda.</div>}
            {detail.avaliacoes_recentes.map(a => (
              <div key={a.id} style={{ ...cardStyle, padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    {a.user_id ? (
                      <Link href={`/admin/usuarios/${a.user_id}`} style={{ color: 'var(--green-dark)', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
                        {a.user_nome || a.user_email}
                      </Link>
                    ) : (
                      <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>{a.user_nome || a.user_email || 'Usuário'}</span>
                    )}
                    {a.user_deletado && <span style={badge('warn')}>conta excluída</span>}
                    <span style={badge(a.aprovado ? 'success' : 'warn')}>{a.aprovado ? 'aprovada' : 'pendente'}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    {!a.aprovado && <button onClick={() => aprovarAvaliacao(a.id)} style={btn('success')}>Aprovar</button>}
                    <button onClick={() => setExcluirAvaliacao(a.id)} style={btn('ghost-danger')}>Excluir</button>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                  experiência {a.experiencia ?? '—'}/10 {a.comentario ? `· "${a.comentario}"` : ''}
                </div>
                {a.imagens && a.imagens.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                    {a.imagens.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noreferrer">
                        <img src={url} alt="" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} />
                      </a>
                    ))}
                  </div>
                )}
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{new Date(a.created_at).toLocaleString('pt-BR')}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10 }}>Check-ins recentes ({detail.checkins_recentes.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {detail.checkins_recentes.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Nenhum check-in ainda.</div>}
            {detail.checkins_recentes.map(c => (
              <div key={c.id} style={{ ...cardStyle, padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Link href={`/admin/usuarios/${c.user_id}`} style={{ color: 'var(--green-dark)', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
                    {c.user_nome || c.user_email}
                  </Link>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{new Date(c.created_at).toLocaleString('pt-BR')}</div>
                </div>
                <button onClick={() => setExcluirCheckin(c.id)} style={btn('ghost-danger')}>Excluir</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {excluirAvaliacao && (
        <ConfirmDialog
          title="Excluir avaliação?"
          description="Remove essa avaliação permanentemente. A nota média do local é recalculada automaticamente."
          askMotivo
          onConfirm={confirmarExcluirAvaliacao}
          onCancel={() => setExcluirAvaliacao(null)}
        />
      )}
      {excluirCheckin && (
        <ConfirmDialog
          title="Excluir check-in?"
          description="Remove esse check-in permanentemente."
          askMotivo
          onConfirm={confirmarExcluirCheckin}
          onCancel={() => setExcluirCheckin(null)}
        />
      )}
      {excluirLocal && (
        <ConfirmDialog
          title={`Excluir "${local.nome}"?`}
          description="Essa ação remove o local permanentemente do banco, incluindo avaliações e check-ins associados. Não pode ser desfeita."
          onConfirm={confirmarExcluirLocal}
          onCancel={() => setExcluirLocal(false)}
        />
      )}
    </div>
  )
}
