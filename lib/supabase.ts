import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Store = {
  id: string
  name: string
  slug: string
  description: string | null
  phone: string | null
  whatsapp: string | null
  website: string | null
  address_street: string | null
  address_city: string
  address_state: string
  address_zip: string | null
  logo_url: string | null
  is_verified: boolean
  distance_m?: number
  lat?: number
  lng?: number
}

export type Product = {
  id: string
  name: string
  brand: string | null
  description: string | null
  image_url: string | null
  category_name?: string
}

export type StoreProduct = {
  id: string
  store_id: string
  product_id: string
  price: number
  price_promo: number | null
  in_stock: boolean
  stock_qty: number | null
  product: Product
}

export async function getStoresNearby(lat: number, lng: number, radiusM = 300000) {
  const { data, error } = await supabase.rpc('stores_nearby', {
    lat,
    lng,
    radius_m: radiusM,
  })
  if (error) throw error
  return data as Array<{
    id: string
    name: string
    slug: string
    address_city: string
    address_state: string
    distance_m: number
    location: unknown
  }>
}

export async function getStoreProducts(storeId: string) {
  const { data, error } = await supabase
    .from('store_products')
    .select(`
      id, price, price_promo, in_stock, stock_qty,
      products ( id, name, brand, description, image_url,
        categories ( name )
      )
    `)
    .eq('store_id', storeId)
    .order('price', { ascending: true })

  if (error) throw error
  return data
}

export async function getAllStores() {
  const { data, error } = await supabase
    .from('stores')
    .select('id, name, slug, address_city, address_state, address_street, description, phone, website, logo_url, is_verified')
    .eq('is_active', true)
    .order('address_state', { ascending: true })

  if (error) throw error
  return data as Store[]
}
