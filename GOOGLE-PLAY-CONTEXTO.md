# Contexto: Publicação do Fora do Ninho na Google Play Store

## Status Geral
App criado na Google Play Console. AAB enviado para Teste Interno. Falta completar a ficha da loja e os assets visuais.

---

## Dados do App

| Campo | Valor |
|-------|-------|
| Nome | Fora do Ninho |
| Package name | `com.foradoninho.app` |
| Site | https://foradoninho.com.br |
| Repositório | https://github.com/pitstopbabyapp-blip/-pitstop-baby |
| Deploy | Vercel (push para `main` → deploy automático) |
| Banco | Supabase |
| Keystore | `signing.keystore` + `signing-key-info.txt` (GUARDAR COM SEGURANÇA) |

---

## Arquivos Importantes

| Arquivo | Localização | Status |
|---------|-------------|--------|
| AAB (upload Play Store) | `Fora do Ninho.aab` — extraído do ZIP do PWA Builder | ✅ Enviado ao Teste Interno |
| APK (instalação direta) | `Fora do Ninho.apk` — mesmo ZIP | ✅ |
| Keystore | `signing.keystore` — mesmo ZIP | ✅ GUARDAR |
| Keystore info | `signing-key-info.txt` — mesmo ZIP | ✅ GUARDAR |
| assetlinks.json | `C:\Fora do Ninho\public\.well-known\assetlinks.json` | ✅ Live |
| Ícone novo | `C:\Fora do Ninho\public\Fora do Ninho-ícon.png` | ✅ |
| Ícone 512×512 (store) | `C:\Fora do Ninho\public\icons\icon-512-store.png` | ✅ Gerado |
| Todos os ícones PWA | `C:\Fora do Ninho\public\icons\` | ✅ Gerados |
| Feature Graphic | A FAZER no Canva (1024×500px) | ⏳ Pendente |
| Política de Privacidade | `C:\Fora do Ninho\src\app\privacidade\page.tsx` | ✅ Deployado |
| Excluir Conta | `C:\Fora do Ninho\src\app\excluir-conta\page.tsx` | ✅ Deployado |
| Textos da loja | Ver seção abaixo | ✅ Prontos |

---

## SHA256 do Keystore (assetlinks.json)
```
48:3C:44:4D:B6:B1:FD:EC:99:69:05:7E:39:7A:61:EB:72:07:E2:27:23:77:C0:68:75:D7:42:3F:50:83:03:94
```

---

## O que já está CONCLUÍDO na Play Console

- ✅ App criado com package `com.foradoninho.app`
- ✅ AAB enviado ao Teste Interno (882 KB)
- ✅ Classificação de conteúdo (IARC): Livre / Everyone / 3+
- ✅ Público-alvo: Maiores de 18 anos
- ✅ Segurança dos dados preenchida (localização, e-mail, nome, ID, fotos, interações, UGC)
- ✅ Recursos financeiros: Não oferece
- ✅ ID de publicidade: Não usa
- ✅ Política de Privacidade URL: https://foradoninho.com.br/privacidade
- ✅ URL exclusão de conta: https://foradoninho.com.br/excluir-conta
- ✅ Credenciais de teste: `foradoninho.app+reviewer@gmail.com` / `ReviewTest@2026`

---

## O que FALTA para publicar

### 1. Feature Graphic (PRIORITÁRIO)
- Tamanho: **1024 × 500 px**
- Fazer no **Canva** (usuário preferiu Canva ao invés de Python)
- Estilo: fundo teal `#1AABAB`, ícone dos pássaros, estrada/montanhas ao fundo
- Texto: "Fora do Ninho" + "Uma comunidade de papais, mamães e cuidadores engajados a encontrar uma rede de apoio confiável e construir bons ninhos para seus bebês."
- Tags: Baby-friendly · Rede de apoio · Mapa ao vivo
- URL: foradoninho.com.br

### 2. Ícone 512×512 para a loja
- Arquivo: `C:\Fora do Ninho\public\icons\icon-512-store.png`
- Já gerado, pronto para upload

### 3. Screenshots (mínimo 2)
- Tirar screenshots do app no celular ou emulador
- Telas sugeridas: Mapa principal, Tela de onboarding/login, Detalhe de um local
- Formato: PNG ou JPG, proporção 16:9 ou 9:16

### 4. Ficha da Loja (Store Listing)
Preencher em: Play Console → Presença na loja → Ficha principal da loja

**Título (30 chars máx):**
```
Fora do Ninho
```

**Descrição curta (80 chars máx):**
```
Mapa colaborativo de locais baby-friendly para famílias em viagem
```

**Descrição completa (4000 chars máx):**
```
Você está viajando com bebê e precisa encontrar um fraldário, um microondas para esquentar a mamadeira ou um restaurante com cadeirão? O Fora do Ninho é o app para isso.

🗺️ MAPA COLABORATIVO
Encontre locais baby-friendly próximos a você em tempo real: postos de combustível, restaurantes, hotéis, shoppings e muito mais — todos avaliados por pais e mães reais.

🍼 FILTROS ÚTEIS
Busque por fraldário, microondas, espaço kids, cadeirão, sala de amamentação e outras amenidades essenciais para quem viaja com bebê.

✅ CHECK-IN E AVALIAÇÕES
Confirme que um local está ativo e avalie a experiência para ajudar outras famílias. Cada check-in torna o mapa mais confiável para todos.

👩‍⚕️ PROFISSIONAIS
Encontre consultoras de amamentação, doulas, pediatras e outros profissionais especializados em bebês e família próximos à sua rota.

📍 FUNCIONA EM VIAGEM
Ideal para estradas, cidades desconhecidas e passeios de fim de semana. Planeje sua rota com segurança e tranquilidade.

🤝 COMUNIDADE
O Fora do Ninho é construído colaborativamente por pais, mães e cuidadores. Quanto mais pessoas contribuem, melhor fica para todos.

Cadastre-se gratuitamente e comece a explorar — ou contribua cadastrando um local que você conhece!
```

**Categoria:** Mapas e Navegação (ou Família)
**Tags:** família, bebê, viagem, mapa, baby-friendly, fraldário, maternidade, paternidade

### 5. Teste Fechado (para acesso à produção)
- Exigência do Google: **12 testadores × 14 dias** de teste fechado
- Após os 14 dias, solicitar acesso à produção
- Credenciais de acesso ao app já definidas (ver acima)

---

## Configurações Supabase Pendentes
- [ ] Atualizar Site URL para: `https://foradoninho.com.br`
- [ ] Adicionar Redirect URL: `https://foradoninho.com.br/mapa`
- Local: Supabase Dashboard → Authentication → URL Configuration

---

## Stack Técnica
- Next.js 16 + TypeScript + Tailwind CSS v4
- Supabase (auth + banco)
- Vercel (deploy)
- TWA (Trusted Web Activity) via PWA Builder
- Leaflet (mapa)

---

## Próximos Passos em Ordem
1. Criar Feature Graphic no Canva (1024×500px)
2. Fazer upload do ícone 512×512 na ficha da loja
3. Tirar screenshots do app
4. Preencher ficha da loja com textos acima
5. Configurar Supabase URL
6. Adicionar testadores ao Teste Interno
7. Migrar para Teste Fechado (12 testadores × 14 dias)
8. Solicitar acesso à produção
9. Publicar 🎉
