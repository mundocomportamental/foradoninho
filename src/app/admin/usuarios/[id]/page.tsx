'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cardStyle, tierInfo } from '@/components/admin/theme'

interface Detail {
  perfil: {
    id: string; email: string; created_at: string; last_sign_in_at: string | null
    display_name: string | null; username: string | null; is_admin: boolean
    plano: string; cidade: string | null; role: string | null
  }
  contadores: { avaliacoes: number; checkins: number; locais_adicionados: number; favoritos: number }
  avaliacoes_recentes: { id: string; local_id: string; local_nome: string; is_servico: boolean; experiencia: number | null; comentario: string | null; created_at: string }[]
  checkins_recentes: { id: string; local_id: string; local_nome: string; is_servico: boolean; created_at: string }[]
  locais_adicionados_lista: { id: string; nome: string; cidade: string | null; estado: string | null; is_active: boolean; aprovado: boolean; created_at: string }[]
}

export default function AdminUsuarioDetailPage() {
  const supabase = createClient()
  const params = useParams()
  const id = params.id as string
  const [detail, setDetail] = useState<Detail | null>(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.rpc('admin_get_user_detail', { p_user_id: id })
    if (error) { setErro('Usuário não encontrado.'); setLoading(false); return }
    setDetail(data as Detail)
    setLoading(false)
  }, [supabase, id])

  useEffect(() => { load() }, [load])

  if (loading) return <div style={{ color: 'var(--text-muted)' }}>Carregando…</div>
  if (erro || !detail) return <div style={{ color: '#dc2626' }}>{erro}</div>

  const { perfil, contadores } = detail
  const tier = tierInfo(contadores.avaliacoes + contadores.checkins)

  return (
    <div>
      <Link href="/admin/usuarios" style={{ color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>← Voltar</Link>

      <div style={{ ...cardStyle, padding: 20, marginTop: 12, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>
              {perfil.display_name || perfil.username || 'Sem nome'} {perfil.is_admin && <span style={{ fontSize: 13, color: '#92400e' }}>· admin</span>}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{perfil.email}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              conta desde {new Date(perfil.created_at).toLocaleDateString('pt-BR')}
              {perfil.last_sign_in_at && ` · último acesso ${new Date(perfil.last_sign_in_at).toLocaleDateString('pt-BR')}`}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
              {perfil.cidade || '—'} · {perfil.role || '—'} · plano {perfil.plano}
            </div>
          </div>
          <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700 }}>{tier.icon} {tier.label}</div>
        </div>

        <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{contadores.avaliacoes} avaliações</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{contadores.checkins} check-ins</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{contadores.locais_adicionados} locais adicionados</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{contadores.favoritos} favoritos</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10 }}>Avaliações recentes</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {detail.avaliacoes_recentes.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Nenhuma ainda.</div>}
            {detail.avaliacoes_recentes.map(a => (
              <div key={a.id} style={{ ...cardStyle, padding: 12 }}>
                <Link href={a.is_servico ? `/admin/profissionais/${a.local_id}` : `/admin/locais/${a.local_id}`} style={{ color: 'var(--green-dark)', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
                  {a.local_nome}
                </Link>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                  experiência {a.experiencia ?? '—'}/10 {a.comentario ? `· "${a.comentario}"` : ''}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{new Date(a.created_at).toLocaleString('pt-BR')}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10 }}>Check-ins recentes</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {detail.checkins_recentes.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Nenhum ainda.</div>}
            {detail.checkins_recentes.map(c => (
              <div key={c.id} style={{ ...cardStyle, padding: 12 }}>
                <Link href={c.is_servico ? `/admin/profissionais/${c.local_id}` : `/admin/locais/${c.local_id}`} style={{ color: 'var(--green-dark)', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
                  {c.local_nome}
                </Link>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{new Date(c.created_at).toLocaleString('pt-BR')}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10 }}>Locais adicionados</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {detail.locais_adicionados_lista.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Nenhum ainda.</div>}
            {detail.locais_adicionados_lista.map(l => (
              <div key={l.id} style={{ ...cardStyle, padding: 12 }}>
                <Link href={`/admin/locais/${l.id}`} style={{ color: 'var(--green-dark)', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
                  {l.nome}
                </Link>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                  {l.cidade}/{l.estado} · {l.is_active ? 'ativo' : 'pendente'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{new Date(l.created_at).toLocaleString('pt-BR')}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
