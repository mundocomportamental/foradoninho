'use client'

import { useEffect, useState } from 'react'
import { getStoreProducts } from '@/lib/supabase'

type Props = {
  store: {
    id: string
    name: string
    address_city: string
    address_state: string
    distance_m: number
  }
  onClose: () => void
}

type StoreProductRow = {
  id: string
  price: number
  price_promo: number | null
  in_stock: boolean
  stock_qty: number | null
  products: {
    id: string
    name: string
    brand: string | null
    description: string | null
    image_url: string | null
    categories: { name: string } | null
  } | null
}

export default function StorePanel({ store, onClose }: Props) {
  const [products, setProducts] = useState<StoreProductRow[]>([])
  const [loading, setLoading] = useState(true)
  const isGraal = store.name.toLowerCase().includes('graal')
  const accentColor = isGraal ? 'var(--accent)' : 'var(--accent-2)'
  const accentSoft = isGraal ? 'var(--accent-soft)' : 'var(--accent-2-soft)'

  useEffect(() => {
    setLoading(true)
    getStoreProducts(store.id)
      .then((data) => setProducts((data as unknown as StoreProductRow[]) || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [store.id])

  const inStock = products.filter((p) => p.in_stock)
  const outStock = products.filter((p) => !p.in_stock)

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: 'var(--bg-card)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 10,
      animation: 'slideUp 0.3s ease forwards',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 16px 12px',
        borderBottom: '1px solid var(--border)',
        background: accentSoft,
      }}>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 13,
            color: accentColor,
            fontWeight: 600,
            padding: '0 0 10px',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          ← Voltar
        </button>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 18,
          color: 'var(--text)',
          lineHeight: 1.2,
          marginBottom: 4,
        }}>
          {store.name}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 8, alignItems: 'center' }}>
          <span>{store.address_city} · {store.address_state}</span>
          <span style={{
            background: accentColor,
            color: 'white',
            fontSize: 11,
            fontWeight: 600,
            padding: '1px 8px',
            borderRadius: 20,
          }}>
            {(store.distance_m / 1000).toFixed(0)} km
          </span>
        </div>
      </div>

      {/* Product list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px' }}>
        {loading ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            padding: '8px 0',
          }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{
                height: 70,
                background: 'var(--bg-panel)',
                borderRadius: 'var(--radius)',
                animation: 'pulse 1.5s ease infinite',
              }} />
            ))}
          </div>
        ) : (
          <>
            {inStock.length > 0 && (
              <>
                <div style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  padding: '4px 0 8px',
                }}>
                  ✓ Disponível ({inStock.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                  {inStock.map((item, i) => (
                    <ProductRow key={item.id} item={item} accentColor={accentColor} accentSoft={accentSoft} index={i} />
                  ))}
                </div>
              </>
            )}

            {outStock.length > 0 && (
              <>
                <div style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  padding: '4px 0 8px',
                }}>
                  Fora de estoque ({outStock.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {outStock.map((item, i) => (
                    <ProductRow key={item.id} item={item} accentColor="var(--text-muted)" accentSoft="var(--bg-panel)" index={i} dimmed />
                  ))}
                </div>
              </>
            )}

            {products.length === 0 && (
              <div style={{
                padding: '40px 0',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: 14,
              }}>
                Nenhum produto cadastrado ainda.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function ProductRow({
  item, accentColor, accentSoft, index, dimmed,
}: {
  item: StoreProductRow
  accentColor: string
  accentSoft: string
  index: number
  dimmed?: boolean
}) {
  const product = item.products
  if (!product) return null

  return (
    <div
      className="animate-slide-up"
      style={{
        animationDelay: `${index * 0.04}s`,
        opacity: dimmed ? 0 : 0,
        background: dimmed ? 'var(--bg-panel)' : 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '10px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}
    >
      {/* Category chip */}
      <div style={{
        width: 36, height: 36, flexShrink: 0,
        background: dimmed ? 'var(--border)' : accentSoft,
        borderRadius: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16,
      }}>
        {getCategoryEmoji(product.categories?.name)}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13,
          fontWeight: 500,
          color: dimmed ? 'var(--text-muted)' : 'var(--text)',
          lineHeight: 1.3,
          marginBottom: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {product.name}
        </div>
        {product.brand && (
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{product.brand}</div>
        )}
      </div>

      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        {item.price_promo ? (
          <>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textDecoration: 'line-through' }}>
              R$ {item.price.toFixed(2).replace('.', ',')}
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: accentColor }}>
              R$ {item.price_promo.toFixed(2).replace('.', ',')}
            </div>
          </>
        ) : (
          <div style={{
            fontSize: 14,
            fontWeight: 700,
            color: dimmed ? 'var(--text-muted)' : accentColor,
          }}>
            R$ {item.price.toFixed(2).replace('.', ',')}
          </div>
        )}
        {dimmed && (
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>sem estoque</div>
        )}
      </div>
    </div>
  )
}

function getCategoryEmoji(name?: string | null): string {
  if (!name) return '🛍️'
  const n = name.toLowerCase()
  if (n.includes('higie') || n.includes('banho')) return '🧴'
  if (n.includes('aliment')) return '🍼'
  if (n.includes('roupa') || n.includes('aces')) return '👕'
  if (n.includes('brinq')) return '🧸'
  if (n.includes('carr') || n.includes('beb')) return '🛒'
  if (n.includes('segu')) return '🔒'
  if (n.includes('passeio') || n.includes('transporte')) return '🚗'
  return '📦'
}
