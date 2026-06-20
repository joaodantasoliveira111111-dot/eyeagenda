import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables');
}

export const sb: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export const DB = {
  profiles: () => sb.from('profiles'),
  agendamentos: () => sb.from('agendamentos'),
} as const;

export type Profile = {
  id: string;
  nome: string;
  login: string;
  role: 'gerencia' | 'sdr' | 'vendedor';
  cor: string;
  criado_em: string;
};

export type Agendamento = {
  id: string;
  cli: string;
  tel?: string | null;
  data: string;
  hora?: string | null;
  vnd: string;
  orig: string;
  status: 'pendente' | 'agendado' | 'confirmado' | 'realizado' | 'nao_compareceu' | 'vendido';
  modelo?: string | null;
  valor?: string | null;
  pgto?: string | null;
  obs?: string | null;
  prox?: string | null;
  criado_por?: string | null;
  criado_em: string;
  atualizado_em: string;
  deleted_at?: string | null;
};

export type CurrentUser = Profile & { id: string };