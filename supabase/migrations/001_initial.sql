-- ============================================
-- Eye Agenda - Migration Inicial
-- Execute no SQL Editor do Supabase Dashboard
-- ============================================

-- Limpeza preventiva de objetos anteriores para evitar erros de "já existe"
DROP TRIGGER IF EXISTS trg_new_user ON auth.users CASCADE;
DROP TRIGGER IF EXISTS trg_agendamentos_updated ON agendamentos CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at() CASCADE;
DROP TABLE IF EXISTS agendamentos CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Tabela de profiles (vincula auth.users com dados do app)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  login TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('gerencia','sdr','vendedor')),
  cor TEXT DEFAULT '#5B6EFF',
  criado_em TIMESTAMPTZ DEFAULT now()
);

-- Tabela de agendamentos
CREATE TABLE IF NOT EXISTS agendamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cli TEXT NOT NULL,
  tel TEXT,
  data DATE NOT NULL,
  hora TEXT,
  vnd TEXT NOT NULL,
  orig TEXT NOT NULL,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente','agendado','confirmado','realizado','nao_compareceu','vendido')),
  modelo TEXT,
  valor TEXT,
  pgto TEXT,
  obs TEXT,
  prox TEXT,
  criado_por UUID REFERENCES profiles(id),
  criado_em TIMESTAMPTZ DEFAULT now(),
  atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;

-- Policies para profiles
CREATE POLICY "profiles_select_all" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_all" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "profiles_update_all" ON profiles FOR UPDATE USING (true);
CREATE POLICY "profiles_delete_all" ON profiles FOR DELETE USING (true);

-- Policies para agendamentos
CREATE POLICY "agendamentos_select_all" ON agendamentos FOR SELECT USING (true);
CREATE POLICY "agendamentos_insert_all" ON agendamentos FOR INSERT WITH CHECK (true);
CREATE POLICY "agendamentos_update_all" ON agendamentos FOR UPDATE USING (true);
CREATE POLICY "agendamentos_delete_all" ON agendamentos FOR DELETE USING (true);

-- Trigger para atualizar atualizado_em
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_agendamentos_updated ON agendamentos;
CREATE TRIGGER trg_agendamentos_updated
  BEFORE UPDATE ON agendamentos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Função para auto-criar profile ao registrar via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, login, role, cor)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'login', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'vendedor'),
    COALESCE(NEW.raw_user_meta_data->>'cor', '#5B6EFF')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_new_user ON auth.users;
CREATE TRIGGER trg_new_user
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- SEED DATA - Usuários
-- ATENÇÃO: Execute DEPOIS de criar as tabelas
-- Os usuários são criados via Supabase Auth,
-- o trigger handle_new_user cria os profiles
-- ============================================

-- Para criar os usuários via Auth, use o script JS abaixo
-- ou crie manualmente no Dashboard > Authentication > Users
-- com os emails e senhas desejados, incluindo metadata:
-- { "nome": "Daniel", "login": "daniel", "role": "gerencia", "cor": "#F5A623" }
