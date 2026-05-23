@AGENTS.md

# Workspace
O código-fonte do projeto está em `C:\Fora do Ninho`. Sempre leia, edite e salve arquivos diretamente nessa pasta — nunca use outra pasta como destino de edições. Se ainda não tiver acesso a `C:\Fora do Ninho`, solicite-o como primeiro passo.

# Projeto: Fora do Ninho
App PWA + Android para famílias encontrarem locais baby-friendly (fraldários, microondas, espaço kids, etc.) e profissionais da área (consultoras de amamentação, doulas, pediatras) em estradas e cidades do Brasil.

- **Site:** https://foradoninho.com.br
- **Repositório:** https://github.com/pitstopbabyapp-blip/-pitstop-baby
- **Deploy:** Vercel (deploy automático ao fazer push para `main`)
- **Banco de dados:** Supabase

# Stack
- **Framework:** Next.js 16 com App Router (`src/app/`)
- **Linguagem:** TypeScript
- **Estilo:** Tailwind CSS v4 + CSS global em `src/app/globals.css`
- **Banco:** Supabase (client em `src/lib/supabase/client.ts`)
- **Mapa:** Leaflet (`src/components/MapView.tsx`)
- **React:** v19

# Estrutura de Pastas
```
src/
  app/
    page.tsx                  ← raiz: redireciona para /onboarding ou /mapa
    layout.tsx                ← layout global, registra service worker, PWA meta tags
    globals.css               ← estilos globais e variáveis CSS
    mapa/page.tsx             ← tela principal com mapa Leaflet
    locais/page.tsx           ← lista/exploração de locais
    locais/novo/page.tsx      ← formulário para cadastrar novo local
    local/[id]/page.tsx       ← detalhe de um local
    meus-locais/page.tsx      ← locais salvos/favoritados pelo usuário
    favoritos/page.tsx        ← favoritos (redireciona para /meus-locais)
    recentes/page.tsx         ← recentes (redireciona para /meus-locais)
    perfil/page.tsx           ← perfil do usuário + seção Meu Negócio (profissionais)
    onboarding/page.tsx       ← tela de boas-vindas (primeira abertura)
    onboarding/completo/      ← tela de conclusão do onboarding
    planos/page.tsx           ← planos/assinatura
    privacidade/page.tsx      ← política de privacidade
    excluir-conta/page.tsx    ← página de exclusão de conta
  components/
    BottomNav.tsx             ← nav inferior com 4 abas: Mapa, Explorar, Meus Locais, Perfil
    MapView.tsx               ← componente de mapa Leaflet
    AnuncieModal.tsx          ← modal de anúncio/planos
  lib/
    supabase/client.ts        ← createClient() com @supabase/ssr
    types.ts                  ← interfaces e constantes (Local, AMENIDADES, TIPO_LABELS, FILTROS)
public/
  cadastro-profissional.html  ← formulário standalone de cadastro de profissionais
  manifest.json               ← PWA manifest
  sw.js                       ← service worker
  icons/                      ← ícones PWA em vários tamanhos
android/                      ← projeto Android (TWA - Trusted Web Activity)
```

# Tipos e Dados Principais
- **`Local`** (em `src/lib/types.ts`): entidade principal — locais físicos (postos, restaurantes, hotéis, etc.) e profissionais (`is_servico: true`)
- **`TIPO_LABELS`**: mapa de tipo → label PT-BR
- **`AMENIDADES`**: lista de amenidades com key, label e emoji (fraldário, microondas, etc.)
- **`FILTROS`**: filtros disponíveis na busca

# Padrões de Código
- Todas as páginas usam `'use client'` (app é 100% client-side)
- Supabase acessado via `createClient()` de `src/lib/supabase/client.ts`
- Cores principais: `#33CCCC` (teal/marca), `#4caf85` (verde/ativo), `#8e8e8e` (inativo)
- BottomNav se esconde ao rolar para baixo e reaparece ao rolar para cima
- `safe-area-inset-bottom` usado para suporte a iPhones com notch

# Git e Deploy
- Branch principal: `main`
- Push para `main` → Vercel faz deploy automático em ~1 min
- **Push precisa ser feito manualmente** no terminal do usuário (o ambiente sandbox não tem credenciais GitHub):
  ```
  git add -A && git commit -m "descrição" && git push origin main
  ```
- `git config core.fileMode false` já configurado (evita falsos alarmes de permissão no Windows)

# Supabase
- URL e chave anônima em variáveis de ambiente: `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Edge Functions disponíveis (verificar via MCP Supabase se necessário)
- Tabela principal: `locais` (campos definidos na interface `Local`)
