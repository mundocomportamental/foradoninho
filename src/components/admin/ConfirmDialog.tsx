'use client'
import { useState } from 'react'

interface ConfirmDialogProps {
  title: string
  description: string
  confirmWord?: string
  onConfirm: (motivo: string) => Promise<void> | void
  onCancel: () => void
  askMotivo?: boolean
}

export default function ConfirmDialog({
  title, description, confirmWord = 'EXCLUIR', onConfirm, onCancel, askMotivo = false,
}: ConfirmDialogProps) {
  const [texto, setTexto] = useState('')
  const [motivo, setMotivo] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  async function handleConfirm() {
    setLoading(true)
    setErro('')
    try {
      await onConfirm(motivo)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro inesperado.')
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', padding: 24, maxWidth: 420, width: '100%', fontFamily: 'var(--font)' }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>{title}</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>{description}</div>

        {askMotivo && (
          <input
            type="text"
            value={motivo}
            onChange={e => setMotivo(e.target.value)}
            placeholder="Motivo (opcional)"
            style={{
              width: '100%', height: 40, padding: '0 12px', borderRadius: 'var(--radius-sm)', marginBottom: 12,
              border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13,
              boxSizing: 'border-box', fontFamily: 'var(--font)', outline: 'none',
            }}
          />
        )}

        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
          Digite <strong style={{ color: 'var(--text)' }}>{confirmWord}</strong> para confirmar:
        </div>
        <input
          type="text"
          value={texto}
          onChange={e => setTexto(e.target.value)}
          autoFocus
          style={{
            width: '100%', height: 44, padding: '0 12px', borderRadius: 'var(--radius-sm)', marginBottom: 16,
            border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 14,
            boxSizing: 'border-box', fontFamily: 'var(--font)', letterSpacing: 1, outline: 'none',
          }}
        />

        {erro && <div style={{ fontSize: 12, color: '#dc2626', marginBottom: 12 }}>{erro}</div>}

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onCancel}
            disabled={loading}
            style={{
              flex: 1, height: 42, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'transparent',
              color: 'var(--text-secondary)', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font)',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={texto !== confirmWord || loading}
            style={{
              flex: 1, height: 42, borderRadius: 'var(--radius-sm)', border: 'none',
              background: texto === confirmWord ? '#dc2626' : 'var(--border)',
              color: texto === confirmWord ? 'white' : 'var(--text-muted)',
              fontWeight: 700, fontSize: 13,
              cursor: texto === confirmWord && !loading ? 'pointer' : 'not-allowed',
              fontFamily: 'var(--font)',
            }}
          >
            {loading ? 'Aplicando…' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  )
}
