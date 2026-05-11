# PitStop Baby 🍼

Encontre produtos para bebê nas paradas da estrada — Rodovia Fernão Dias (SP→MG).

## Stack
- **Next.js 16** (App Router)
- **Tailwind CSS**
- **Supabase** (PostGIS + RLS)
- **Leaflet** (mapa interativo)
- **Vercel** (deploy)

## Setup

```bash
npm install
cp .env.example .env.local
# preencher NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
```

## Variáveis de ambiente (Vercel)
| Variável | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ndyujambnaskelklulwa.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon public |
