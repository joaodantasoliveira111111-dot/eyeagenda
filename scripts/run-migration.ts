/**
 * scripts/run-migration.ts
 * Executa a migration inicial no Supabase via Management API
 * Uso: tsx scripts/run-migration.ts <SUPABASE_ACCESS_TOKEN>
 *
 * Obtenha o token em: https://supabase.com/dashboard/account/tokens
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const PROJECT_REF = 'egmmzromkuwjhdpwzmon';
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN || process.argv[2];

if (!ACCESS_TOKEN) {
  console.error('\n❌ Forneça o access token do Supabase:');
  console.error('   Acesse: https://supabase.com/dashboard/account/tokens');
  console.error('   Uso: tsx scripts/run-migration.ts <SEU_TOKEN>\n');
  process.exit(1);
}

const sql = readFileSync(join(process.cwd(), 'supabase/migrations/001_initial.sql'), 'utf-8');

async function runMigration() {
  console.log('🔄 Executando migration...');

  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    console.error('❌ Erro ao executar migration:', body);
    process.exit(1);
  }

  console.log('✅ Migration executada com sucesso!');
  console.log('\nTabelas criadas:');
  console.log('  • profiles');
  console.log('  • agendamentos');
  console.log('\nPróximo passo: crie o usuário admin no Supabase Dashboard');
  console.log('  Authentication > Users > Add user:');
  console.log('  Email: adm@eyeagenda.app');
  console.log('  Metadata: {"nome":"Admin","login":"adm","role":"gerencia","cor":"#F5A623"}');
}

runMigration().catch(console.error);
