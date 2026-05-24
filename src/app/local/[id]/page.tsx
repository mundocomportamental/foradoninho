'use client'
import { useState, useEffect, use, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import BottomNav from '@/components/BottomNav'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import type { Local } from '@/lib/types'
import { AMENIDADES, TIPO_LABELS } from '@/lib/types'

// ── Tipos ──────────────────────────────────────────────────────────────
interface Medias {
  limpeza_total: number | null
  atendimento_total: number | null
  instalacoes_total: number | null
  experiencia_total: number | null
  limpeza_3m: number | null
  atendimento_3m: number | null
  instalacoes_3m: number | null
  experiencia_3m: number | null
  total_historico: number
  total_3m: number
}

function RatingBar({ label, value }: { label: string; value: number | null }) {
  const v = value ?? 0
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: v >= 8 ? 'var(--green-dark)' : v >= 5 ? '#f59e0b' : '#ef4444' }}>
          {value != null ? v.toFixed(1) : '—'}
        </span>
      </div>
      <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${v * 10}%`, background: v >= 8 ? '#33cccc' : v >= 5 ? '#f59e0b' : '#ef4444', borderRadius: 3, transition: 'width 0.4s' }} />
      </div>
    </div>
  )
}

const SMILE_ICONS = ['😞', '😕', '😐', '🙂', '😄']
function smileForValue(v: number): string {
  const idx = Math.min(Math.max(Math.round(v) - 1, 0), 4)
  return SMILE_ICONS[idx]
}
function SmileBar({ label, value }: { label: string; value: number | null }) {
  const v = value ?? 0
  const pct = v > 0 ? (v / 5) * 100 : 0
  const color = v >= 4 ? '#33cccc' : v >= 3 ? '#f59e0b' : '#ef4444'
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontSize: 17, lineHeight: 1 }}>{value != null && v > 0 ? smileForValue(v) : '—'}</span>
      </div>
      <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width 0.4s' }} />
      </div>
    </div>
  )
}

function ScorePicker({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 15, fontWeight: 700 }}>{label}</span>
        <span style={{ fontSize: 22, fontWeight: 800, color: value >= 8 ? 'var(--green-dark)' : value >= 5 ? '#f59e0b' : value > 0 ? '#ef4444' : 'var(--text-muted)' }}>
          {value > 0 ? value : '—'}<span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)' }}>/10</span>
        </span>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
          <button key={n} onClick={() => onChange(n)} style={{
            flex: 1, height: 36, borderRadius: 8, border: 'none',
            background: n <= value ? (value >= 8 ? '#33cccc' : value >= 5 ? '#f59e0b' : '#ef4444') : 'var(--border)',
            cursor: 'pointer', transition: 'background 0.1s',
            fontSize: 12, fontWeight: 700,
            color: n <= value ? 'white' : 'var(--text-muted)',
          }}>{n}</button>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Nada baby-friendly</span>
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Super baby-friendly</span>
      </div>
    </div>
  )
}

const SMILES = ['😞', '😕', '😐', '🙂', '😄']
const SMILE_LABELS = ['Ruim', 'Regular', 'Ok', 'Bom', 'Ótimo']

function SmilePicker({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 15, fontWeight: 700 }}>{label}</span>
        {value > 0 && <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>{SMILE_LABELS[value - 1]}</span>}
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
        {SMILES.map((emoji, i) => {
          const n = i + 1
          const active = value === n
          return (
            <button key={n} onClick={() => onChange(n)} style={{
              flex: 1, height: 54, borderRadius: 12,
              border: active ? '2px solid var(--green)' : '1.5px solid var(--border)',
              background: active ? 'var(--green-soft)' : 'var(--bg)',
              cursor: 'pointer', transition: 'all 0.15s',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
              fontSize: active ? 26 : 22, transform: active ? 'scale(1.08)' : 'scale(1)',
            }}>
              <span>{emoji}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Carrossel / Lightbox ───────────────────────────────────────────────
function PhotoCarousel({ fotos, startIndex, onClose }: { fotos: string[]; startIndex: number; onClose: () => void }) {
  const [index, setIndex] = useState(startIndex)
  const touchStartX = useRef<number | null>(null)

  function prev() { setIndex(i => (i - 1 + fotos.length) % fotos.length) }
  function next() { setIndex(i => (i + 1) % fotos.length) }

  function onTouchStart(e: React.TouchEvent) { touchStartX.current = e.touches[0].clientX }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev()
    touchStartX.current = null
  }

  // Fechar com ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(0,0,0,0.92)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {/* Botão fechar */}
      <button onClick={onClose} style={{
        position: 'absolute', top: 16, right: 16,
        width: 40, height: 40, borderRadius: '50%',
        background: 'rgba(255,255,255,0.15)', border: 'none',
        color: 'white', fontSize: 20, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>✕</button>

      {/* Contador */}
      {fotos.length > 1 && (
        <div style={{ position: 'absolute', top: 22, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 600 }}>
          {index + 1} / {fotos.length}
        </div>
      )}

      {/* Imagem */}
      <img
        src={fotos[index]}
        alt={`Foto ${index + 1}`}
        style={{
          maxWidth: '95vw', maxHeight: '80vh',
          objectFit: 'contain', borderRadius: 12,
          userSelect: 'none', pointerEvents: 'none',
        }}
      />

      {/* Seta anterior */}
      {fotos.length > 1 && (
        <button onClick={prev} style={{
          position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
          width: 40, height: 40, borderRadius: '50%',
          background: 'rgba(255,255,255,0.18)', border: 'none',
          color: 'white', fontSize: 20, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>‹</button>
      )}

      {/* Seta próxima */}
      {fotos.length > 1 && (
        <button onClick={next} style={{
          position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
          width: 40, height: 40, borderRadius: '50%',
          background: 'rgba(255,255,255,0.18)', border: 'none',
          color: 'white', fontSize: 20, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>›</button>
      )}

      {/* Dots */}
      {fotos.length > 1 && (
        <div style={{ display: 'flex', gap: 6, marginTop: 20 }}>
          {fotos.map((_, i) => (
            <div key={i} onClick={() => setIndex(i)} style={{
              width: i === index ? 18 : 7, height: 7,
              borderRadius: 4, cursor: 'pointer',
              background: i === index ? '#33cccc' : 'rgba(255,255,255,0.35)',
              transition: 'all 0.2s',
            }} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function LocalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const searchParams = useSearchParams()
  const [local, setLocal] = useState<Local | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFav, setIsFav] = useState(false)
  const [medias, setMedias] = useState<Medias | null>(null)
  const [filtroPeriodo, setFiltroPeriodo] = useState<'total' | '3m'>('total')

  // 0 = fechado, 1 = ratings, 2 = fotos, 3 = comentário, 4 = confirmar amenidades
  const [flowStep, setFlowStep] = useState(0)
  const [checkinDone, setCheckinDone] = useState(false)

  const [rLimpeza, setRLimpeza] = useState(0)
  const [rAtendimento, setRAtendimento] = useState(0)
  const [rInstalacoes, setRInstalacoes] = useState(0)
  const [rExperiencia, setRExperiencia] = useState(0)

  const [fotos, setFotos] = useState<File[]>([])
  const [fotoURLs, setFotoURLs] = useState<string[]>([])
  const [comment, setComment] = useState('')
  const [amenReportadas, setAmenReportadas] = useState<Record<string, boolean>>({})
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)
  const [checkinCount, setCheckinCount] = useState<number>(0)

  // Carrossel
  const [carouselOpen, setCarouselOpen] = useState(false)
  const [carouselIndex, setCarouselIndex] = useState(0)

  // Reporte de estabelecimento
  const [reportOpen, setReportOpen] = useState(false)
  const [reportTipo, setReportTipo] = useState('')
  const [reportMensagem, setReportMensagem] = useState('')
  const [reportNome, setReportNome] = useState('')
  const [reportEmail, setReportEmail] = useState('')
  const [reportSending, setReportSending] = useState(false)
  const [reportDone, setReportDone] = useState(false)

  // Curtidas (profissionais)
  const [curtidasCount, setCurtidasCount] = useState(0)
  const [userCurtiu, setUserCurtiu] = useState(false)
  const [curtidaId, setCurtidaId] = useState<string | null>(null)
  const [curtidaLoading, setCurtidaLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  // Evita disparar o auto-start mais de uma vez
  const autoStartedRef = useRef(false)

  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const [
        { data: localData },
        { data: mediasData },
        { count: realCheckinCount },
        { count: curtidasTotal },
        { data: authResult },
      ] = await Promise.all([
        supabase.from('locais').select('*').eq('id', id).single(),
        supabase.from('avaliacoes_medias').select('*').eq('local_id', id).single(),
        supabase.from('checkins').select('*', { count: 'exact', head: true }).eq('local_id', id),
        supabase.from('curtidas').select('*', { count: 'exact', head: true }).eq('local_id', id),
        supabase.auth.getUser(),
      ])
      setCurtidasCount(curtidasTotal ?? 0)
      const authUser = authResult?.user ?? null
      if (authUser) {
        setUserId(authUser.id)
        const { data: myCurtida } = await supabase
          .from('curtidas').select('id').eq('local_id', id).eq('user_id', authUser.id).maybeSingle()
        if (myCurtida) {
          setUserCurtiu(true)
          setCurtidaId(myCurtida.id)
          setIsFav(true)
          // Sync to localStorage so Meus Locais > Favoritos reflects this curtida
          // even if user navigates there from a fresh session
          if (localData) {
            try {
              const favs = JSON.parse(localStorage.getItem('favoritos') || '[]')
              if (!favs.some((f: any) => f.id === id)) {
                localStorage.setItem('favoritos', JSON.stringify([localData, ...favs]))
              }
            } catch {}
          }
        }
      }
      if (localData) {
        setLocal(localData as Local)
        setCheckinCount(realCheckinCount ?? 0)
        try {
          const stored = localStorage.getItem(`amen_${id}`)
          if (stored) {
            const parsed = JSON.parse(stored)
            const savedAt = parsed.savedAt as number
            const oneDayMs = 24 * 60 * 60 * 1000
            if (Date.now() - savedAt < oneDayMs) {
              setAmenReportadas(parsed.data)
            } else {
              localStorage.removeItem(`amen_${id}`)
              const init: Record<string, boolean> = {}
              AMENIDADES.forEach(a => { init[a.key] = !!(localData as any)[a.key] })
              setAmenReportadas(init)
            }
          } else {
            const init: Record<string, boolean> = {}
            AMENIDADES.forEach(a => { init[a.key] = !!(localData as any)[a.key] })
            setAmenReportadas(init)
          }
        } catch {
          const init: Record<string, boolean> = {}
          AMENIDADES.forEach(a => { init[a.key] = !!(localData as any)[a.key] })
          setAmenReportadas(init)
        }
      }
      if (mediasData) setMedias(mediasData as Medias)
      setLoading(false)
    }
    load()
    try {
      const favs = JSON.parse(localStorage.getItem('favoritos') || '[]')
      setIsFav(favs.some((f: any) => f.id === id))
    } catch {}
  }, [id, supabase])

  // Auto-inicia o fluxo quando vier via ?avaliar=1 (ex: botão "Avaliar" no card do mapa)
  useEffect(() => {
    if (!loading && local && searchParams.get('avaliar') === '1' && !autoStartedRef.current) {
      autoStartedRef.current = true
      startCheckinFlow()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, local])

  async function startCheckinFlow() {
    setCheckinDone(true)
    setFlowStep(1)
    try {
      const { error } = await supabase.from('checkins').insert({ local_id: id })
      if (!error) setCheckinCount(prev => prev + 1)
    } catch {}
  }

  // Comprime a imagem no browser antes do upload via Canvas API.
  // Redimensiona para no máximo 1200px no lado maior e re-encoda como JPEG ~82%.
  // Redução típica: foto de celular 4–8 MB → 300–600 KB sem perda visual perceptível.
  async function compressImage(file: File, maxDim = 1200, quality = 0.82): Promise<File> {
    return new Promise((resolve) => {
      const img = new Image()
      const blobUrl = URL.createObjectURL(file)
      img.onload = () => {
        URL.revokeObjectURL(blobUrl)
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height))
        const w = Math.round(img.width * scale)
        const h = Math.round(img.height * scale)
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) return resolve(file) // fallback sem compressão
        ctx.drawImage(img, 0, 0, w, h)
        canvas.toBlob(
          (blob) => {
            if (!blob) return resolve(file)
            const compressed = new File(
              [blob],
              file.name.replace(/\.[^.]+$/, '.jpg'),
              { type: 'image/jpeg' }
            )
            resolve(compressed)
          },
          'image/jpeg',
          quality
        )
      }
      img.onerror = () => resolve(file) // fallback: sobe o original
      img.src = blobUrl
    })
  }

  async function handleFotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    for (const file of files) {
      const compressed = await compressImage(file)
      setFotos(prev => [...prev, compressed].slice(0, 5))
      const url = URL.createObjectURL(compressed)
      setFotoURLs(prev => [...prev, url].slice(0, 5))
    }
  }

  async function sendReview() {
    setSending(true)
    try {
      // Faz upload das fotos para pasta exclusiva do estabelecimento (nome_id)
      // As fotos ficam no storage para revisão manual — NÃO são adicionadas à tabela locais automaticamente
      const nomeSlug = (local?.nome ?? 'local')
        .toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      const storagePath = `${nomeSlug}_${id}`

      for (const foto of fotos) {
        const ext = foto.name.split('.').pop()
        const path = `${storagePath}/${Date.now()}_${Math.random().toString(36).slice(2,7)}.${ext}`
        await supabase.storage.from('locais-fotos').upload(path, foto, { upsert: false })
        // Não armazenamos as URLs: as fotos aguardam revisão manual no storage
      }

      await supabase.from('avaliacoes').insert({
        local_id: id,
        limpeza: rLimpeza || null,
        atendimento: rAtendimento || null,
        instalacoes: rInstalacoes || null,
        experiencia: rExperiencia || null,
        comentario: comment || null,
        imagens: [],
        aprovado: true,
        amenidades_reportadas: amenReportadas,
        periodo_ref: new Date().toISOString(),
      })
      try {
        localStorage.setItem(`amen_${id}`, JSON.stringify({ data: amenReportadas, savedAt: Date.now() }))
      } catch {}
      setDone(true)
      setFlowStep(0)
      const { data: newMedias } = await supabase.from('avaliacoes_medias').select('*').eq('local_id', id).single()
      if (newMedias) setMedias(newMedias as Medias)
    } catch (err) {
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  function toggleFav() {
    if (!local) return
    try {
      const favs = JSON.parse(localStorage.getItem('favoritos') || '[]')
      if (isFav) {
        localStorage.setItem('favoritos', JSON.stringify(favs.filter((f: any) => f.id !== id)))
        setIsFav(false)
      } else {
        localStorage.setItem('favoritos', JSON.stringify([local, ...favs]))
        setIsFav(true)
      }
    } catch {}
  }

  function openMaps() {
    if (!local) return
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${local.lat},${local.lng}`, '_blank')
  }

  async function sendReport() {
    if (!reportTipo) return
    setReportSending(true)
    try {
      await supabase.from('reportes_locais').insert({
        local_id: id,
        tipo: reportTipo,
        mensagem: reportMensagem || null,
        nome_contato: reportNome || null,
        email_contato: reportEmail || null,
      })
      setReportDone(true)
    } catch (err) {
      console.error(err)
    } finally {
      setReportSending(false)
    }
  }

  function closeReport() {
    setReportOpen(false)
    setReportDone(false)
    setReportTipo('')
    setReportMensagem('')
    setReportNome('')
    setReportEmail('')
  }

  async function toggleCurtida() {
    if (curtidaLoading) return
    setCurtidaLoading(true)
    try {
      if (userCurtiu) {
        // Remove: delete by user_id + local_id (não depende de curtidaId)
        await supabase.from('curtidas').delete()
          .eq('local_id', id)
          .eq('user_id', userId ?? '')
        setUserCurtiu(false)
        setCurtidaId(null)
        setCurtidasCount(c => Math.max(0, c - 1))
        setIsFav(false)
        try {
          const favs = JSON.parse(localStorage.getItem('favoritos') || '[]')
          localStorage.setItem('favoritos', JSON.stringify(favs.filter((f: any) => f.id !== id)))
        } catch {}
      } else if (userId) {
        // Insert sem .select() para evitar problema de RLS bloqueando SELECT após INSERT
        const { error } = await supabase
          .from('curtidas').insert({ local_id: id, user_id: userId })
        if (!error) {
          setUserCurtiu(true)
          setCurtidasCount(c => c + 1)
          setIsFav(true)
          if (local) {
            try {
              const favs = JSON.parse(localStorage.getItem('favoritos') || '[]')
              if (!favs.some((f: any) => f.id === id)) {
                localStorage.setItem('favoritos', JSON.stringify([local, ...favs]))
              }
            } catch {}
          }
        }
      } else {
        // Não logado — salva só no localStorage
        toggleFav()
        setUserCurtiu(prev => !prev)
      }
    } finally {
      setCurtidaLoading(false)
    }
  }

  if (loading) return (
    <div className="app-shell">
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 60 }}>
        <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Carregando...</div>
      </div>
      <BottomNav />
    </div>
  )

  if (!local) return (
    <div className="app-shell">
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 60 }}>
        <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Local não encontrado</div>
      </div>
      <BottomNav />
    </div>
  )

  const totalRatings = medias?.total_historico ?? 0
  const m = (key: 'limpeza' | 'atendimento' | 'instalacoes' | 'experiencia') =>
    filtroPeriodo === '3m' ? medias?.[`${key}_3m`] ?? null : medias?.[`${key}_total`] ?? null

  // Prepara lista de fotos para o carrossel
  const fotoPrincipal = local.foto_principal
  const fotosSecundarias = (local.fotos_metadata ?? []).map((f: any) => f.url).filter(Boolean)
  const todasFotos = [...(fotoPrincipal ? [fotoPrincipal] : []), ...fotosSecundarias.filter((u: string) => u !== fotoPrincipal)]

  // ── Vista de profissional (is_servico=true) ─────────────────────────
  if (local.is_servico) {
    const tipoLabel = TIPO_LABELS[local.tipo] || local.tipo
    const temFoto = !!fotoPrincipal
    const fotosExtras = fotosSecundarias.filter(u => u !== fotoPrincipal)

    return (
      <div className="app-shell">
        <div className="page" style={{ paddingBottom: 80 }}>

          {/* ── Hero com foto ou gradiente ── */}
          <div style={{ position: 'relative', width: '100%', height: temFoto ? 260 : 180, flexShrink: 0 }}>
            {temFoto ? (
              <img
                src={fotoPrincipal}
                alt={local.nome}
                onClick={() => { setCarouselIndex(0); setCarouselOpen(true) }}
                style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)' }} />
            )}
            {/* Gradiente escuro na base para legibilidade */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, transparent 40%, rgba(0,0,0,0.55) 100%)' }} />

            {/* Botão voltar */}
            <Link href="/mapa" style={{
              position: 'absolute', top: 14, left: 14,
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(6px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#1a1a1a', textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </Link>

            {/* Botão curtir (coração) */}
            <button
              onClick={toggleCurtida}
              disabled={curtidaLoading}
              style={{
                position: 'absolute', top: 14, right: 14,
                width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(6px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: 'none', cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24"
                fill={userCurtiu ? '#e11d48' : 'none'}
                stroke={userCurtiu ? '#e11d48' : '#1a1a1a'}
                strokeWidth="2" strokeLinecap="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>

            {/* Nome + tipo + localização sobrepostos */}
            <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'white', background: 'rgba(124,58,237,0.85)', padding: '3px 10px', borderRadius: 20, display: 'inline-block', marginBottom: 6, backdropFilter: 'blur(4px)' }}>
                {tipoLabel}
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'white', lineHeight: 1.2, textShadow: '0 1px 4px rgba(0,0,0,0.4)', marginBottom: 4 }}>
                {local.nome}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'rgba(255,255,255,0.9)', fontSize: 13 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                {local.cidade}{local.estado ? `, ${local.estado}` : ''}
              </div>
            </div>
          </div>

          {/* ── Descrição ── */}
          {local.descricao && (
            <div style={{ padding: '16px 16px 0' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Sobre</div>
              <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.75 }}>{local.descricao}</div>
            </div>
          )}

          {/* ── Serviços ── */}
          {local.servicos && local.servicos.length > 0 && (
            <div style={{ padding: '16px 16px 0' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>Serviços</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {local.servicos.map((s, i) => (
                  <span key={i} style={{ fontSize: 12, fontWeight: 600, color: '#6d28d9', background: '#ede9fe', padding: '5px 12px', borderRadius: 20 }}>
                    {s}
                  </span>
                ))}
                {local.outros_servicos && (
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#6d28d9', background: '#ede9fe', padding: '5px 12px', borderRadius: 20 }}>
                    {local.outros_servicos}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* ── Redes sociais ── */}
          {(local.instagram || local.facebook || local.website) && (
            <div style={{ padding: '16px 16px 0' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>Redes sociais</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {local.instagram && (
                  <a
                    href={local.instagram.startsWith('http') ? local.instagram : `https://instagram.com/${local.instagram.replace('@','')}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 20, background: '#fff0f6', border: '1px solid #fbb6ce', textDecoration: 'none' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#be185d" strokeWidth="2" strokeLinecap="round">
                      <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="#be185d" stroke="none"/>
                    </svg>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#be185d' }}>@{local.instagram.replace('@','').replace(/.*instagram\.com\//,'')}</span>
                  </a>
                )}
                {local.facebook && (
                  <a
                    href={local.facebook.startsWith('http') ? local.facebook : `https://facebook.com/${local.facebook}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 20, background: '#eff6ff', border: '1px solid #bfdbfe', textDecoration: 'none' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#1877f2">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                    </svg>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1877f2' }}>{local.facebook.replace(/.*facebook\.com\//,'').replace('@','')}</span>
                  </a>
                )}
                {local.website && (
                  <a
                    href={local.website.startsWith('http') ? local.website : `https://${local.website}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 20, background: '#f5f3ff', border: '1px solid #c4b5fd', textDecoration: 'none' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round">
                      <circle cx="12" cy="12" r="9"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                    </svg>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#7c3aed', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {local.website.replace(/^https?:\/\//, '')}
                    </span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* ── Fotos adicionais ── */}
          {fotosExtras.length > 0 && (
            <div style={{ padding: '16px 0 0' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', padding: '0 16px', marginBottom: 10 }}>Fotos</div>
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '0 16px', scrollbarWidth: 'none' }}>
                {fotosExtras.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`Foto ${i + 2}`}
                    onClick={() => { setCarouselIndex(i + 1); setCarouselOpen(true) }}
                    style={{ width: 140, height: 110, objectFit: 'cover', borderRadius: 12, flexShrink: 0, cursor: 'pointer', border: '1px solid var(--border)' }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Curtidas ── */}
          <div style={{ padding: '20px 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill={curtidasCount > 0 ? '#e11d48' : 'none'} stroke="#e11d48" strokeWidth="2" strokeLinecap="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              {curtidasCount === 0
                ? 'Seja o primeiro a curtir este perfil'
                : `${curtidasCount} ${curtidasCount === 1 ? 'pessoa curtiu' : 'pessoas curtiram'} este perfil`}
            </span>
          </div>

          {/* ── Botões de ação ── */}
          <div style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {local.whatsapp && (
              <a
                href={`https://wa.me/${local.whatsapp.replace(/\D/g,'')}`}
                target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#25d366', color: 'white', padding: '14px', borderRadius: 50, textDecoration: 'none', fontSize: 15, fontWeight: 700, fontFamily: 'var(--font)' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.557 4.118 1.528 5.845L.057 23.428a.75.75 0 0 0 .927.926l5.583-1.471A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.717 9.717 0 0 1-5.003-1.381l-.358-.213-3.712.977.994-3.63-.234-.374A9.718 9.718 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
                </svg>
                Entrar em contato via WhatsApp
              </a>
            )}
            {!local.whatsapp && local.telefone && (
              <a
                href={`tel:${local.telefone.replace(/\D/g,'')}`}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#7c3aed', color: 'white', padding: '14px', borderRadius: 50, textDecoration: 'none', fontSize: 15, fontWeight: 700, fontFamily: 'var(--font)' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.1 19.79 19.79 0 0 1 1.61 4.47 2 2 0 0 1 3.6 2.25h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.16 6.16l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                Ligar: {local.telefone}
              </a>
            )}
            <button
              onClick={openMaps}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'none', border: '1.5px solid var(--border)', color: 'var(--text)', padding: '13px', borderRadius: 50, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
              Como chegar
            </button>
            <button
              onClick={toggleCurtida}
              disabled={curtidaLoading}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: userCurtiu ? '#fff1f5' : '#7c3aed',
                border: userCurtiu ? '1.5px solid #fecdd3' : 'none',
                color: userCurtiu ? '#e11d48' : 'white',
                padding: '13px', borderRadius: 50, fontSize: 14, fontWeight: 700,
                cursor: curtidaLoading ? 'default' : 'pointer',
                fontFamily: 'var(--font)', opacity: curtidaLoading ? 0.7 : 1,
                transition: 'all 0.2s',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24"
                fill={userCurtiu ? '#e11d48' : 'none'}
                stroke={userCurtiu ? '#e11d48' : 'white'}
                strokeWidth="2" strokeLinecap="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {userCurtiu ? 'Curtido ✓' : 'Curtir este profissional'}
            </button>
          </div>
        </div>

        {/* Lightbox de fotos */}
        {carouselOpen && todasFotos.length > 0 && (
          <PhotoCarousel fotos={todasFotos} startIndex={carouselIndex} onClose={() => setCarouselOpen(false)} />
        )}

        <BottomNav />
      </div>
    )
  }

  // ── Vista de estabelecimento (is_servico=false / undefined) ──────────
  return (
    <div className="app-shell">
      <div className="page">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 8px' }}>
          <Link href="/mapa" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '50%', border: '1.5px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text)', textDecoration: 'none' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={toggleFav} style={{ width: 36, height: 36, borderRadius: '50%', border: '1.5px solid var(--border)', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill={isFav ? '#33cccc' : 'none'} stroke={isFav ? '#33cccc' : 'currentColor'} strokeWidth="2" strokeLinecap="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="local-header-card">
          <div className="local-tipo-badge">{TIPO_LABELS[local.tipo] || local.tipo}</div>
          <div className="local-nome">{local.nome}</div>
          <div className="local-address">{local.endereco && `${local.endereco} · `}{local.cidade}, {local.estado}</div>
          {totalRatings > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {(['total', '3m'] as const).map(p => (
                  <button key={p} onClick={() => setFiltroPeriodo(p)} style={{
                    padding: '3px 10px', borderRadius: 20, border: '1.5px solid',
                    borderColor: filtroPeriodo === p ? 'var(--green)' : 'var(--border)',
                    background: filtroPeriodo === p ? 'var(--green-soft)' : 'transparent',
                    color: filtroPeriodo === p ? 'var(--green-dark)' : 'var(--text-muted)',
                    fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)',
                  }}>
                    {p === 'total' ? 'Histórico' : 'Últimos 3 meses'}
                  </button>
                ))}
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {filtroPeriodo === '3m' ? `${medias?.total_3m ?? 0} avaliações` : `${totalRatings} avaliações`}
              </span>
            </div>
          )}
          {local.certificado_pitstop && (
            <div className="certified-badge">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#33cccc" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="9"/><polyline points="9,12 11,14 15,10"/>
              </svg>
              Certificado Fora do Ninho
            </div>
          )}
        </div>

        {/* ── Galeria de fotos com clique para carrossel ── */}
        {todasFotos.length > 0 && local.aprovado && (
          <div style={{ margin: '0 16px 4px', overflowX: 'auto' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {todasFotos.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Foto ${i + 1} de ${local.nome}`}
                  onClick={() => { setCarouselIndex(i); setCarouselOpen(true) }}
                  style={{
                    width: todasFotos.length === 1 ? '100%' : 200, height: 160,
                    objectFit: 'cover', borderRadius: 14, flexShrink: 0,
                    border: '1px solid var(--border)', cursor: 'pointer',
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                />
              ))}
            </div>
          </div>
        )}

        {totalRatings > 0 && (
          <div style={{ margin: '0 16px 4px' }}>
            <div className="card" style={{ padding: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Avaliações da comunidade</div>
              <SmileBar label="Limpeza" value={m('limpeza')} />
              <SmileBar label="Atendimento" value={m('atendimento')} />
              <SmileBar label="Instalações" value={m('instalacoes')} />
              <RatingBar label="Experiência geral" value={m('experiencia')} />
            </div>
          </div>
        )}

        {(() => {
          const hasAnyAmenity = AMENIDADES.some(a => !!local[a.key as keyof Local])
          return (
            <>
              <div className="section-title">Comodidades</div>
              {hasAnyAmenity ? (
                <div className="amenities-grid">
                  {AMENIDADES.map(a => {
                    const has = !!local[a.key as keyof Local]
                    return (
                      <div key={a.key} className={`amenity-chip${has ? ' has' : ''}`}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          {has ? <><circle cx="12" cy="12" r="9"/><polyline points="9,12 11,14 15,10"/></> : <><circle cx="12" cy="12" r="9"/><line x1="8" y1="12" x2="16" y2="12"/></>}
                        </svg>
                        {a.label}
                        {has && <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 600 }}>✓</span>}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div style={{ margin: '0 16px', background: 'var(--green-soft)', border: '1.5px solid var(--green-light)', borderRadius: 16, padding: '20px 16px', textAlign: 'center' }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>✨</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Seja o primeiro a avaliar</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 16 }}>
                    Ainda não temos informações sobre as comodidades deste local. Faça seu check-in e ajude outras famílias!
                  </div>
                  {!done && (
                    <button className="btn-primary" onClick={startCheckinFlow} disabled={checkinDone && flowStep === 0}
                      style={{ opacity: (checkinDone && flowStep === 0) ? 0.7 : 1, maxWidth: 260, margin: '0 auto' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                        <circle cx="12" cy="12" r="9"/><polyline points="9,12 11,14 15,10"/>
                      </svg>
                      {checkinDone ? 'Check-in feito!' : 'Fazer check-in e avaliar'}
                    </button>
                  )}
                </div>
              )}
            </>
          )
        })()}

        {AMENIDADES.some(a => !!local[a.key as keyof Local]) && (
          <div style={{ padding: '16px 16px 0' }}>
            {done ? (
              <div style={{ background: '#fff1f0', border: '1.5px solid #ef4444', borderRadius: 50, padding: '14px 20px', textAlign: 'center', fontWeight: 600, color: '#dc2626', fontSize: 14 }}>
                ❤️ Avaliação enviada! Obrigado pela contribuição.
              </div>
            ) : (
              <button className="btn-primary" onClick={startCheckinFlow} disabled={checkinDone && flowStep === 0}
                style={{ opacity: (checkinDone && flowStep === 0) ? 0.7 : 1 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="9"/><polyline points="9,12 11,14 15,10"/>
                </svg>
                {checkinDone ? 'Check-in feito!' : 'Realizar Check-in e Avaliar'}
              </button>
            )}
          </div>
        )}

        <div className="action-row">
          <button className="btn-outline" onClick={openMaps}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
            Direções
          </button>
        </div>

        <div style={{ padding: '0 16px 16px' }}>
          <button
            onClick={() => setReportOpen(true)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font)', padding: 0 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Algo deu errado? Reportar problema
          </button>
        </div>
      </div>

      {/* ── Modal fluxo de avaliação ── */}
      {flowStep > 0 && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ background: 'var(--bg-card)', borderTopLeftRadius: 24, borderTopRightRadius: 24, width: '100%', maxHeight: '92vh', overflowY: 'auto', padding: '20px 20px 40px' }}>
            <div style={{ width: 36, height: 4, background: 'var(--border)', borderRadius: 2, margin: '0 auto 16px' }} />
            <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
              {[1,2,3,4].map(s => (
                <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: s <= flowStep ? 'var(--green)' : 'var(--border)', transition: 'background 0.2s' }} />
              ))}
            </div>

            {flowStep === 1 && (
              <>
                <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>Este local foi um ninho para vocês? 🪺</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>Avalie <strong>apenas</strong> o quanto este local foi baby-friendly — se acolheu você e seu bebê como um ninho fora de casa.</div>
                <div style={{ background: '#e6faf8', border: '1.5px solid #33cccc', borderRadius: 12, padding: '10px 14px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 18, lineHeight: 1 }}>🍼</span>
                  <span style={{ fontSize: 12, color: '#0e7070', lineHeight: 1.55 }}>
                    <strong>Esta avaliação é sobre a experiência para famílias com bebês</strong>, não sobre o estabelecimento em geral. Considere: havia fraldário? O espaço acolheu bem quem está amamentando? A equipe foi atenciosa com as crianças?
                  </span>
                </div>
                <ScorePicker label="Experiência baby-friendly" value={rExperiencia} onChange={setRExperiencia} />
                <div style={{ height: 1, background: 'var(--border)', margin: '4px 0 18px' }} />
                <SmilePicker label="Limpeza dos espaços" value={rLimpeza} onChange={setRLimpeza} />
                <SmilePicker label="Acolhimento às famílias" value={rAtendimento} onChange={setRAtendimento} />
                <SmilePicker label="Estrutura para bebês" value={rInstalacoes} onChange={setRInstalacoes} />
                <button className="btn-primary" style={{ marginTop: 8 }}
                  disabled={!rExperiencia || !rLimpeza || !rAtendimento || !rInstalacoes}
                  onClick={() => setFlowStep(2)}>Próximo</button>
                <button className="btn-secondary" onClick={() => setFlowStep(0)}>Cancelar</button>
              </>
            )}

            {flowStep === 2 && (
              <>
                <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>Adicionar fotos</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Fotos do estabelecimento ajudam outras famílias.</div>
                <div style={{ fontSize: 12, color: '#e05b4e', background: '#fff1f0', border: '1px solid #fecaca', borderRadius: 10, padding: '8px 12px', marginBottom: 16 }}>
                  ⚠️ São permitidas apenas fotos do espaço físico. Imagens com pessoas serão removidas automaticamente.
                </div>
                {fotoURLs.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                    {fotoURLs.map((url, i) => (
                      <div key={i} style={{ position: 'relative' }}>
                        <img src={url} alt="" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 10, border: '1.5px solid var(--border)' }} />
                        <button onClick={() => { setFotos(p => p.filter((_, j) => j !== i)); setFotoURLs(p => p.filter((_, j) => j !== i)) }}
                          style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: '#ef4444', border: 'none', color: 'white', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                      </div>
                    ))}
                  </div>
                )}
                {fotos.length < 5 && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', border: '1.5px dashed var(--border)', borderRadius: 12, cursor: 'pointer', marginBottom: 16 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>Adicionar fotos ({fotos.length}/5)</span>
                    <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFotoSelect} />
                  </label>
                )}
                <button className="btn-primary" onClick={() => setFlowStep(3)}>{fotos.length > 0 ? 'Próximo' : 'Pular'}</button>
                <button className="btn-secondary" onClick={() => setFlowStep(1)}>Voltar</button>
              </>
            )}

            {flowStep === 3 && (
              <>
                <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>Deixar um comentário</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Opcional. Sua avaliação escrita será revisada antes de ser publicada.</div>
                <div style={{ fontSize: 12, color: '#92400e', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '8px 12px', marginBottom: 14 }}>
                  ℹ️ Comentários passam por moderação e não são publicados imediatamente.
                </div>
                <textarea className="review-textarea" placeholder="Como foi a experiência? Dicas para outras famílias..."
                  value={comment} onChange={e => setComment(e.target.value)} style={{ minHeight: 100 }} />
                <button className="btn-primary" style={{ marginTop: 12 }} onClick={() => setFlowStep(4)}>Próximo</button>
                <button className="btn-secondary" onClick={() => setFlowStep(2)}>Voltar</button>
              </>
            )}

            {flowStep === 4 && (
              <>
                <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>Confirmar comodidades</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Marque as comodidades que você encontrou disponíveis</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                  {AMENIDADES.map(a => (
                    <label key={a.key} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                      <div style={{
                        width: 22, height: 22, borderRadius: 6,
                        background: amenReportadas[a.key] ? 'var(--green)' : 'var(--bg)',
                        border: amenReportadas[a.key] ? '2px solid var(--green)' : '2px solid var(--border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.15s', flexShrink: 0,
                      }} onClick={() => setAmenReportadas(p => ({ ...p, [a.key]: !p[a.key] }))}>
                        {amenReportadas[a.key] && (
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        )}
                      </div>
                      <span style={{ fontSize: 14 }}>{a.icon} {a.label}</span>
                    </label>
                  ))}
                </div>
                <button className="btn-primary" onClick={sendReview} disabled={sending}>
                  {sending ? 'Enviando...' : 'Enviar avaliação'}
                </button>
                <button className="btn-secondary" onClick={() => setFlowStep(3)}>Voltar</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Lightbox / Carrossel de fotos ── */}
      {carouselOpen && todasFotos.length > 0 && (
        <PhotoCarousel
          fotos={todasFotos}
          startIndex={carouselIndex}
          onClose={() => setCarouselOpen(false)}
        />
      )}

      {/* ── Modal de reporte ── */}
      {reportOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-end' }}
          onClick={closeReport}>
          <div style={{ background: 'var(--bg-card)', borderTopLeftRadius: 24, borderTopRightRadius: 24, width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '20px 20px 48px' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ width: 36, height: 4, background: 'var(--border)', borderRadius: 2, margin: '0 auto 16px' }} />

            {reportDone ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>💚</div>
                <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Muito obrigado!</div>
                <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }}>
                  Muito obrigado por ajudar essa comunidade! Sua mensagem foi recebida e nossa equipe vai verificar as informações em breve.
                </div>
                <button className="btn-primary" onClick={closeReport}>Fechar</button>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>Reportar problema</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Nos ajude a manter as informações corretas e a comunidade segura.</div>

                {/* Tipo */}
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Qual é o problema?</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
                  {[
                    { value: 'sou_proprietario', label: '🏠 Sou o proprietário — quero remover ou editar este local' },
                    { value: 'informacao_errada', label: '✏️ Informação incorreta (endereço, nome, comodidades)' },
                    { value: 'local_fechado',     label: '🔒 Este local está fechado ou não existe mais' },
                    { value: 'foto_inadequada',   label: '🚫 Foto imprópria ou com pessoas' },
                    { value: 'outro',             label: '💬 Outro motivo' },
                  ].map(op => (
                    <label key={op.value} style={{
                      display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
                      padding: '12px 14px', borderRadius: 14,
                      border: reportTipo === op.value ? '2px solid var(--green)' : '1.5px solid var(--border)',
                      background: reportTipo === op.value ? 'var(--green-soft)' : 'var(--bg)',
                      transition: 'all 0.15s',
                    }} onClick={() => setReportTipo(op.value)}>
                      <div style={{
                        width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                        border: reportTipo === op.value ? '2px solid var(--green)' : '2px solid var(--border)',
                        background: reportTipo === op.value ? 'var(--green)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {reportTipo === op.value && <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'white' }} />}
                      </div>
                      <span style={{ fontSize: 13, lineHeight: 1.4 }}>{op.label}</span>
                    </label>
                  ))}
                </div>

                {/* Mensagem */}
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Detalhes <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(opcional)</span></div>
                <textarea
                  className="review-textarea"
                  placeholder="Descreva o problema com mais detalhes..."
                  value={reportMensagem}
                  onChange={e => setReportMensagem(e.target.value)}
                  style={{ minHeight: 80, marginBottom: 14 }}
                />

                {/* Contato */}
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Seu contato <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(opcional, para retorno)</span></div>
                <input
                  type="text" placeholder="Nome"
                  value={reportNome} onChange={e => setReportNome(e.target.value)}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--bg)', fontSize: 14, fontFamily: 'var(--font)', marginBottom: 8, boxSizing: 'border-box' }}
                />
                <input
                  type="email" placeholder="E-mail"
                  value={reportEmail} onChange={e => setReportEmail(e.target.value)}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--bg)', fontSize: 14, fontFamily: 'var(--font)', marginBottom: 18, boxSizing: 'border-box' }}
                />

                <button className="btn-primary" onClick={sendReport} disabled={!reportTipo || reportSending}>
                  {reportSending ? 'Enviando...' : 'Enviar reporte'}
                </button>
                <button className="btn-secondary" onClick={closeReport}>Cancelar</button>
              </>
            )}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
