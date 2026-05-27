// supabase/functions/delete-account/index.ts
//
// Edge Function que deleta a conta do usuário autenticado.
// Precisa ser deployada no Supabase com:
//   supabase functions deploy delete-account
//
// Requer a variável de ambiente SUPABASE_SERVICE_ROLE_KEY
// (já disponível automaticamente dentro das Edge Functions do Supabase)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Responde ao preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Lê o token do usuário que chamou a função
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Token de autenticação ausente' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Client normal (com o token do usuário) para verificar quem está logado
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Usuário não autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Client admin (service role) para deletar dados e a conta
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // 1. Deleta dados do perfil do usuário (tabela profiles)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', user.id)

    // Não interrompe se o perfil não existir (pode ser usuário sem perfil criado)
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Erro ao deletar perfil:', profileError)
    }

    // 2. Deleta filhos vinculados ao usuário (tabela filhos), se existir
    await supabaseAdmin
      .from('filhos')
      .delete()
      .eq('user_id', user.id)

    // 3. Deleta a conta de autenticação do Supabase
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
    if (deleteError) {
      throw new Error(deleteError.message)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('Erro na Edge Function delete-account:', err)
    return new Response(
      JSON.stringify({ error: 'Erro interno ao excluir conta' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
