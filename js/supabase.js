const SUPABASE_URL = 'https://egmmzromkuwjhdpwzmon.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_h4Btoeb7ISZkEXCkRS4EbA_skrFZb5-';

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

const DB = {
  profiles: () => sb.from('profiles'),
  agendamentos: () => sb.from('agendamentos')
};

const STATUS_MAP = {
  pendente:        { l:'Pendente',       cls:'s-pd', c:'var(--txt2)' },
  agendado:        { l:'Agendado',       cls:'s-ag', c:'var(--ind)' },
  confirmado:      { l:'Confirmado',     cls:'s-cf', c:'var(--grn)' },
  realizado:       { l:'Realizado',      cls:'s-rl', c:'var(--amb)' },
  nao_compareceu:  { l:'Não compareceu', cls:'s-nc', c:'var(--red)' },
  vendido:         { l:'Vendido',        cls:'s-cf', c:'var(--grn)' }
};

const ORIGINS = {
  'Meta Ads':'📘','Instagram Orgânico':'📸','WhatsApp Direto':'💬',
  'Indicação':'🤝','Walk-in':'🚶','Outros':'📌'
};

const ROLE_LABELS = { gerencia:'Gerência', sdr:'SDR', vendedor:'Vendedor' };

window.sb = sb;
window.DB = DB;
window.STATUS_MAP = STATUS_MAP;
window.ORIGINS = ORIGINS;
window.ROLE_LABELS = ROLE_LABELS;
