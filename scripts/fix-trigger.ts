/**
 * scripts/fix-trigger.ts
 * Recria o trigger handle_new_user e cria o usuario admin inicial
 * usando a API Admin do Supabase com service_role
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://egmmzromkuwjhdpwzmon.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnbW16cm9ta3V3amhkcHd6bW9uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTg2NzczNywiZXhwIjoyMDk3NDQzNzM3fQ.dpxBwE99umTcB1XfG7lx1NyFqeMNYYBstyeMGw5ykP4';

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
  console.log('🔄 Criando usuário admin...');

  // Tentar criar o usuário admin
  const { data, error } = await admin.auth.admin.createUser({
    email: 'adm@eyeagenda.app',
    password: 'Adm@2024!',
    email_confirm: true,
    user_metadata: { nome: 'Admin', login: 'adm', role: 'gerencia', cor: '#F5A623' }
  });

  if (error) {
    console.error('❌ Erro ao criar usuário Auth:', error);
    console.log('\n⚠️  Provavelmente o trigger handle_new_user está com problema.');
    console.log('Tentando criar o profile manualmente...\n');

    // Listar usuários existentes para pegar o ID
    const { data: users } = await admin.auth.admin.listUsers();
    const existing = users?.users?.find(u => u.email === 'adm@eyeagenda.app');
    
    if (existing) {
      console.log(`✅ Usuário já existe no Auth: ${existing.id}`);
      
      // Criar profile manualmente
      const { error: profileErr } = await admin.from('profiles').upsert({
        id: existing.id,
        nome: 'Admin',
        login: 'adm',
        role: 'gerencia',
        cor: '#F5A623'
      });
      
      if (profileErr) {
        console.error('❌ Erro ao criar profile:', profileErr.message);
      } else {
        console.log('✅ Profile criado/atualizado!');
        console.log('\n🎉 Pronto! Login:');
        console.log('   Email: adm@eyeagenda.app');
        console.log('   Senha: Adm@2024!');
      }
    } else {
      console.log('Nenhum usuário com esse email encontrado.');
      console.log('Execute o SQL da migration no Dashboard do Supabase primeiro.');
    }
    return;
  }

  console.log(`✅ Usuário Auth criado: ${data.user.id}`);

  // Criar profile manualmente caso o trigger não tenha rodado
  const { error: profileErr } = await admin.from('profiles').upsert({
    id: data.user.id,
    nome: 'Admin',
    login: 'adm',
    role: 'gerencia',
    cor: '#F5A623'
  });

  if (profileErr) {
    console.warn('⚠️  Profile não criado automaticamente pelo trigger. Criando manualmente...');
    console.error('   Erro:', profileErr.message);
  } else {
    console.log('✅ Profile criado!');
  }

  console.log('\n🎉 Setup completo! Credenciais do admin:');
  console.log('   Email: adm@eyeagenda.app');
  console.log('   Senha: Adm@2024!');
}

main().catch(console.error);
