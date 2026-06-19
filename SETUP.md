# 🚀 Eye Agenda — Guia de Configuração

## 1. Banco de Dados (Supabase)

Acesse: **https://supabase.com/dashboard/project/egmmzromkuwjhdpwzmon/sql/new**

Cole e execute o conteúdo de `supabase/migrations/001_initial.sql` no SQL Editor.

Isso cria:
- Tabela `profiles` (dados dos usuários)
- Tabela `agendamentos` (leads e agendamentos)
- Trigger `handle_new_user` (auto-cria profile ao cadastrar usuário)
- Políticas RLS

---

## 2. Criar Usuário Admin Inicial

Acesse: **https://supabase.com/dashboard/project/egmmzromkuwjhdpwzmon/auth/users**

Clique em **"Add user"** → **"Create new user"** e preencha:

| Campo | Valor |
|-------|-------|
| Email | `adm@eyeagenda.app` |
| Password | *(sua senha segura)* |
| Auto Confirm User | ✅ Ativado |

Depois, no **SQL Editor**, execute:

```sql
UPDATE profiles 
SET nome = 'Admin', login = 'adm', role = 'gerencia', cor = '#F5A623'
WHERE id = (SELECT id FROM auth.users WHERE email = 'adm@eyeagenda.app');
```

> Se o trigger funcionar corretamente, o profile já foi criado automaticamente. Apenas atualize o nome/login.

---

## 3. Variáveis de Ambiente no Vercel

Acesse: **https://vercel.com/dashboard** → seu projeto → **Settings → Environment Variables**

Adicione as seguintes variáveis:

| Nome | Valor |
|------|-------|
| `SUPABASE_URL` | `https://egmmzromkuwjhdpwzmon.supabase.co` |
| `SUPABASE_ANON_KEY` | `sb_publishable_h4Btoeb7ISZkEXCkRS4EbA_skrFZb5-` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (chave completa no `.env`) |

Após adicionar, faça **Redeploy** no Vercel.

---

## 4. Criar Novos Usuários pelo Painel

Após o login como **gerência**:

1. Clique na aba **"Usuários"** (só aparece para gerência)
2. Clique em **"Novo usuário"**
3. Preencha: Nome, Login, Email (opcional), Senha, Função, Cor
4. Clique em **"Salvar usuário"**

O usuário é criado diretamente no banco e já pode fazer login de qualquer dispositivo.

---

## 5. Testar Localmente

```bash
npm install
npm run dev
```

Acesse: http://localhost:5173

---

## Arquitetura

```
index.html          → Frontend estático (HTML + CSS + JS puro)
js/
  supabase.js       → Conexão Supabase + constantes
  auth.js           → Login/logout/sessão
  users.js          → Gestão de usuários (chama /api/)
  agenda.js         → Lista de agendamentos
  ...
api/
  create-user.js    → Vercel Serverless: cria usuário (usa service_role)
  delete-user.js    → Vercel Serverless: deleta usuário
  update-password.js→ Vercel Serverless: atualiza senha
supabase/
  migrations/       → SQL do banco de dados
```
