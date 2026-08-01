'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRealtimeRefresh } from '@/lib/useRealtimeRefresh'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import { cardStyle, btn, badge, inputStyle } from '@/components/admin/theme'

const EDITABLE_FIELDS: { key: string; label: string; type?: 'text' | 'textarea' | 'select'; options?: { value: string; label: string }[] }[] = [
  { key: 'nome', label: 'Nome completo' },
  { key: 'cpf', label: 'CPF' },
  { key: 'data_nascimento', label: 'Data de nascimento (AAAA-MM-DD)' },
  { key: 'email', label: 'E-mail' },
  { key: 'telefone', label: 'Telefone' },
  { key: 'genero', label: 'Gênero' },
  { key: 'nome_negocio', label: 'Nome do negócio' },
  { key: 'tipo_perfil', label: 'Tipo de perfil', type: 'select', options: [{ value: 'pf', label: 'Pessoa Física' }, { value: 'pj', label: 'Pessoa Jurídica' }] },
  { key: 'cnpj', label: 'CNPJ' },
  { key: 'razao_social', label: 'Razão social' },
  { key: 'cep', label: 'CEP' },
  { key: 'uf', label: 'UF' },
  { key: 'cidade', label: 'Cidade' },
  { key: 'rua', label: 'Rua' },
  { key: 'numero', label: 'Número' },
  { key: 'complemento', label: 'Complemento' },
  { key: 'bairro', label: 'Bairro' },
  { key: 'lat', label: 'Latitude' },
  { key: 'lng', label: 'Longitude' },
  { key: 'outros_servicos', label: 'Outros serviços' },
  { key: 'resumo', label: 'Resumo / bio', type: 'textarea' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'site', label: 'Site' },
  { key: 'whatsapp', label: 'WhatsApp' },
]

interface PendingChanges {
  nome_negocio?: string; resumo?: string; whatsapp?: string; telefone?: string
  instagram?: string; facebook?: string; site?: string; servicos?: string[]; outros_servicos?: string
}

const PENDING_FIELD_LABELS: Record<keyof PendingChanges, string> = {
  nome_negocio: 'Nome do negócio', resumo: 'Descrição / Bio', whatsapp: 'WhatsApp', telefone: 'Telefone',
  instagram: 'Instagram', facebook: 'Facebook', site: 'Site', servicos: 'Serviços', outros_servicos: 'Outros serviços',
}

interface Profissional {
  id: string; nome: string; cpf: string; data_nascimento: string | null; email: string; telefone: string; genero: string | null
  nome_negocio: string | null; tipo_perfil: string | null; cnpj: string | null; razao_social: string | null
  cep: string | null; uf: string | null; cidade: string | null; rua: string | null; numero: string | null
  complemento: string | null; bairro: string | null; lat: number | null; lng: number | null
  modalidades_atendimento: string[] | null; servicos: string[] | null; outros_servicos: string | null; resumo: string | null
  fotos: string[] | null; foto_perfil: string | null; instagram: string | null; facebook: string | null; site: string | null; whatsapp: string | null
  status_aprovacao: string; ativo: boolean; pagamento_status: string; plano: string | null; valor_mensal: number | null; cupom: string | null
  created_at: string; updated_at: string | null
  pending_changes: PendingChanges | null; pending_since: string | null
  autor_nome: string | null; autor_email: string | null; autor_deletado: boolean
}

interface Detail {
  profissional: Profissional
  conta_vinculada: { id: string | null; email: string | null; display_name: string | null; deletado: boolean } | null
  local_sincronizado_id: string | null
  avaliacoes_recentes: {
    id: string; user_id: string | null; user_email: string | null; user_nome: string | null; user_deletado: boolean
    experiencia: number | null; comentario: string | null; created_at: string
  }[]
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ ...cardStyle, padding: 16, marginBottom: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{title}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
        {children}
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === null || value === undefined || value === '') return null
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600, wordBreak: 'break-word' }}>{value}</div>
    </div>
  )
}

export default function AdminProfissionalDetailPage() {
  const supabase = createClient()
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [detail, setDetail] = useState<Detail | null>(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [excluir, setExcluir] = useState(false)
  const [showEditAdmin, setShowEditAdmin] = useState(false)
  const [editAdminFields, setEditAdminFields] = useState<Record<string, string>>({})
  const [savingAdmin, setSavingAdmin] = useState(false)
  const [adminEditError, setAdminEditError] = useState('')

  const load = useCallback(async () => {
    const { data, error } = await supabase.rpc('admin_get_profissional_detail', { p_id: id })
    if (error) { setErro('Profissional não encontrado.'); setLoading(false); return }
    setDetail(data as Detail)
    setLoading(false)
  }, [supabase, id])

  useEffect(() => { load() }, [load])
  useRealtimeRefresh('profissionais', load, `id=eq.${id}`)
  useRealtimeRefresh('avaliacoes', load, `local_id=eq.${id}`)

  async function moderar(acao: 'aprovar' | 'rejeitar') {
    await supabase.rpc('admin_moderate_profissional', { p_id: id, p_acao: acao })
    load()
  }

  async function confirmarExcluir() {
    await supabase.rpc('admin_moderate_profissional', { p_id: id, p_acao: 'excluir' })
    router.push('/admin/profissionais')
  }

  function openAdminEdit() {
    if (!detail) return
    const p = detail.profissional
    const fields: Record<string, string> = {}
    EDITABLE_FIELDS.forEach(({ key }) => { fields[key] = (p as any)[key] ?? '' })
    fields.modalidades_atendimento = (p.modalidades_atendimento || []).join(', ')
    fields.servicos = (p.servicos || []).join(', ')
    setEditAdminFields(fields)
    setAdminEditError('')
    setShowEditAdmin(true)
  }

  async function saveAdminEdit() {
    setSavingAdmin(true)
    setAdminEditError('')
    try {
      const payload: Record<string, unknown> = { ...editAdminFields }
      payload.modalidades_atendimento = editAdminFields.modalidades_atendimento
        .split(',').map(s => s.trim()).filter(Boolean)
      payload.servicos = editAdminFields.servicos
        .split(',').map(s => s.trim()).filter(Boolean)
      if (editAdminFields.lat === '') delete payload.lat
      if (editAdminFields.lng === '') delete payload.lng

      const { error } = await supabase.rpc('admin_update_profissional', { p_id: id, p_fields: payload })
      if (error) { setAdminEditError(`Erro: ${error.message}`); return }
      setShowEditAdmin(false)
      load()
    } finally {
      setSavingAdmin(false)
    }
  }

  if (loading) return <div style={{ color: 'var(--text-muted)' }}>Carregando…</div>
  if (erro || !detail) return <div style={{ color: '#dc2626' }}>{erro}</div>

  const p = detail.profissional
  const isEdicaoPendente = p.status_aprovacao === 'edicao_pendente' && !!p.pending_changes
  const endereco = [p.rua, p.numero].filter(Boolean).join(', ') +
    (p.complemento ? ` — ${p.complemento}` : '') +
    (p.bairro ? `, ${p.bairro}` : '')

  return (
    <div>
      <Link href="/admin/profissionais" style={{ color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>← Voltar</Link>

      <div style={{ ...cardStyle, padding: 20, marginTop: 12, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {p.foto_perfil && (
              <img src={p.foto_perfil} alt="" style={{ width: 56, height: 56, borderRadius: 14, objectFit: 'cover', flexShrink: 0 }} />
            )}
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>{p.nome_negocio || p.nome}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                {p.nome} · {p.email} · {p.telefone}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                {p.cidade}{p.uf ? `/${p.uf}` : ''} · {p.tipo_perfil === 'pj' ? 'Pessoa Jurídica' : 'Pessoa Física'} · pagamento: {p.pagamento_status}
              </div>
              {(detail.conta_vinculada?.display_name || detail.conta_vinculada?.email) ? (
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  Conta vinculada:{' '}
                  {detail.conta_vinculada.id ? (
                    <Link href={`/admin/usuarios/${detail.conta_vinculada.id}`} style={{ color: 'var(--green-dark)', textDecoration: 'none', fontWeight: 700 }}>
                      {detail.conta_vinculada.display_name || detail.conta_vinculada.email}
                    </Link>
                  ) : (
                    <span style={{ fontWeight: 700, color: 'var(--text)' }}>{detail.conta_vinculada.display_name || detail.conta_vinculada.email}</span>
                  )}
                  {detail.conta_vinculada.deletado && <span style={badge('warn')}>conta excluída</span>}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: '#92400e', marginTop: 8 }}>Sem conta de usuário vinculada ainda (cadastro anônimo).</div>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {isEdicaoPendente ? (
                <>
                  <button onClick={() => moderar('aprovar')} style={btn('success')}>Aplicar alterações</button>
                  <button onClick={() => moderar('rejeitar')} style={btn('warn')}>Descartar alterações</button>
                </>
              ) : (
                <>
                  {p.status_aprovacao !== 'aprovado' && <button onClick={() => moderar('aprovar')} style={btn('success')}>Aprovar</button>}
                  {p.status_aprovacao !== 'rejeitado' && <button onClick={() => moderar('rejeitar')} style={btn('warn')}>Rejeitar</button>}
                </>
              )}
              <button onClick={openAdminEdit} style={btn('neutral')}>Editar informações</button>
              <button onClick={() => setExcluir(true)} style={btn('danger')}>Excluir</button>
            </div>
            {detail.local_sincronizado_id && (
              <Link href={`/admin/locais/${detail.local_sincronizado_id}`} style={{ fontSize: 12, color: 'var(--green-dark)', textDecoration: 'none', fontWeight: 600 }}>
                Ver listagem sincronizada →
              </Link>
            )}
          </div>
        </div>
      </div>

      {isEdicaoPendente && p.pending_changes && (
        <div style={{ ...cardStyle, padding: 16, marginBottom: 20, border: '1.5px solid #fbbf24' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#92400e', marginBottom: 4 }}>
            ✏️ Alterações pendentes de aprovação
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>
            {p.pending_since && `Enviadas em ${new Date(p.pending_since).toLocaleString('pt-BR')}`} — o perfil público continua mostrando os dados atuais até você aplicar.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(Object.keys(PENDING_FIELD_LABELS) as (keyof PendingChanges)[]).map(key => {
              const atual = key === 'servicos' ? (p.servicos || []).join(', ') : (p as any)[key] || '—'
              const novo = key === 'servicos' ? (p.pending_changes?.servicos || []).join(', ') : p.pending_changes?.[key] || '—'
              if (atual === novo) return null
              return (
                <div key={key} style={{ fontSize: 12 }}>
                  <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{PENDING_FIELD_LABELS[key]}</div>
                  <div style={{ color: 'var(--text-muted)', textDecoration: 'line-through' }}>{atual || '(vazio)'}</div>
                  <div style={{ color: 'var(--green-dark)', fontWeight: 600 }}>{novo || '(vazio)'}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <Section title="Dados pessoais">
        <Field label="Nome completo" value={p.nome} />
        <Field label="CPF" value={p.cpf} />
        <Field label="Data de nascimento" value={p.data_nascimento ? new Date(p.data_nascimento).toLocaleDateString('pt-BR') : null} />
        <Field label="E-mail" value={p.email} />
        <Field label="Telefone" value={p.telefone} />
        <Field label="Gênero" value={p.genero} />
      </Section>

      <Section title="Negócio">
        <Field label="Nome profissional / negócio" value={p.nome_negocio} />
        <Field label="Tipo de perfil" value={p.tipo_perfil === 'pj' ? 'Pessoa Jurídica' : 'Pessoa Física'} />
        <Field label="CNPJ" value={p.cnpj} />
        <Field label="Razão social" value={p.razao_social} />
      </Section>

      <Section title="Endereço e atendimento">
        <Field label="Endereço" value={endereco.trim().replace(/^,|,$/, '') || null} />
        <Field label="Cidade / UF" value={p.cidade ? `${p.cidade}${p.uf ? `/${p.uf}` : ''}` : null} />
        <Field label="CEP" value={p.cep} />
        <Field label="Coordenadas" value={p.lat != null && p.lng != null ? `${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}` : null} />
        <Field label="Como atende" value={p.modalidades_atendimento && p.modalidades_atendimento.length > 0 ? p.modalidades_atendimento.join(', ') : null} />
      </Section>

      <Section title="Serviços">
        <Field label="Categorias" value={p.servicos && p.servicos.length > 0 ? p.servicos.join(', ') : null} />
        <Field label="Outros serviços" value={p.outros_servicos} />
      </Section>
      {p.resumo && (
        <div style={{ ...cardStyle, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Resumo / bio enviado</div>
          <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6 }}>{p.resumo}</div>
        </div>
      )}

      <Section title="Presença digital">
        <Field label="Instagram" value={p.instagram} />
        <Field label="Facebook" value={p.facebook} />
        <Field label="Site" value={p.site} />
        <Field label="WhatsApp" value={p.whatsapp} />
      </Section>

      {p.fotos && p.fotos.length > 0 && (
        <div style={{ ...cardStyle, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Fotos enviadas ({p.fotos.length})</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {p.fotos.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noreferrer">
                <img src={url} alt="" style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border)' }} />
              </a>
            ))}
          </div>
        </div>
      )}

      <Section title="Cadastro">
        <Field label="Status" value={p.status_aprovacao} />
        <Field label="Ativo no app" value={p.ativo ? 'Sim' : 'Não'} />
        <Field label="Plano" value={p.plano} />
        <Field label="Cupom usado" value={p.cupom} />
        <Field label="Cadastrado em" value={new Date(p.created_at).toLocaleString('pt-BR')} />
        <Field label="Última atualização" value={p.updated_at ? new Date(p.updated_at).toLocaleString('pt-BR') : null} />
      </Section>

      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10 }}>
        Avaliações recentes ({detail.avaliacoes_recentes.length})
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {detail.avaliacoes_recentes.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Nenhuma avaliação ainda.</div>}
        {detail.avaliacoes_recentes.map(a => (
          <div key={a.id} style={{ ...cardStyle, padding: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {a.user_id ? (
                <Link href={`/admin/usuarios/${a.user_id}`} style={{ color: 'var(--green-dark)', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
                  {a.user_nome || a.user_email}
                </Link>
              ) : (
                <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>{a.user_nome || a.user_email || 'Usuário'}</span>
              )}
              {a.user_deletado && <span style={badge('warn')}>conta excluída</span>}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
              experiência {a.experiencia ?? '—'}/10 {a.comentario ? `· "${a.comentario}"` : ''}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{new Date(a.created_at).toLocaleString('pt-BR')}</div>
          </div>
        ))}
      </div>

      {excluir && (
        <ConfirmDialog
          title={`Excluir "${p.nome_negocio || p.nome}"?`}
          description="Essa ação remove o cadastro profissional permanentemente. Não pode ser desfeita."
          onConfirm={confirmarExcluir}
          onCancel={() => setExcluir(false)}
        />
      )}

      {showEditAdmin && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setShowEditAdmin(false) }}
        >
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', padding: 24, maxWidth: 560, width: '100%', maxHeight: '85vh', overflowY: 'auto', fontFamily: 'var(--font)' }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>Editar informações</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
              Alterações feitas aqui vão direto pro cadastro, sem passar pela análise. Registrado no log de auditoria.
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 12, marginBottom: 12 }}>
              {EDITABLE_FIELDS.filter(f => f.type !== 'textarea').map(({ key, label, type, options }) => (
                <div key={key}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
                  {type === 'select' ? (
                    <select
                      value={editAdminFields[key] || ''}
                      onChange={e => setEditAdminFields(f => ({ ...f, [key]: e.target.value }))}
                      style={{ ...inputStyle, width: '100%' }}
                    >
                      {options!.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  ) : (
                    <input
                      value={editAdminFields[key] || ''}
                      onChange={e => setEditAdminFields(f => ({ ...f, [key]: e.target.value }))}
                      style={{ ...inputStyle, width: '100%' }}
                    />
                  )}
                </div>
              ))}
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>Modalidades de atendimento (separadas por vírgula)</div>
                <input
                  value={editAdminFields.modalidades_atendimento || ''}
                  onChange={e => setEditAdminFields(f => ({ ...f, modalidades_atendimento: e.target.value }))}
                  style={{ ...inputStyle, width: '100%' }}
                />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>Categorias de serviço (separadas por vírgula)</div>
                <input
                  value={editAdminFields.servicos || ''}
                  onChange={e => setEditAdminFields(f => ({ ...f, servicos: e.target.value }))}
                  style={{ ...inputStyle, width: '100%' }}
                />
              </div>
            </div>

            {EDITABLE_FIELDS.filter(f => f.type === 'textarea').map(({ key, label }) => (
              <div key={key} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
                <textarea
                  value={editAdminFields[key] || ''}
                  onChange={e => setEditAdminFields(f => ({ ...f, [key]: e.target.value }))}
                  style={{ width: '100%', minHeight: 90, padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text)', fontSize: 13, fontFamily: 'var(--font)', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>
            ))}

            {adminEditError && <div style={{ fontSize: 12, color: '#dc2626', marginBottom: 12 }}>{adminEditError}</div>}

            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button onClick={() => setShowEditAdmin(false)} disabled={savingAdmin} style={{ flex: 1, height: 42, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font)' }}>
                Cancelar
              </button>
              <button onClick={saveAdminEdit} disabled={savingAdmin} style={{ flex: 1, height: 42, borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--green)', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font)' }}>
                {savingAdmin ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
