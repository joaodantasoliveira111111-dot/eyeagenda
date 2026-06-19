export const STATUS_MAP = {
  pendente: { label: 'Pendente', class: 's-pd', color: 'var(--txt2)' },
  agendado: { label: 'Agendado', class: 's-ag', color: 'var(--ind)' },
  confirmado: { label: 'Confirmado', class: 's-cf', color: 'var(--grn)' },
  realizado: { label: 'Realizado', class: 's-rl', color: 'var(--amb)' },
  nao_compareceu: { label: 'Não compareceu', class: 's-nc', color: 'var(--red)' },
  vendido: { label: 'Vendido', class: 's-cf', color: 'var(--grn)' },
} as const;

export const ORIGINS = {
  'Meta Ads': '📘',
  'Instagram Orgânico': '📸',
  'WhatsApp Direto': '💬',
  Indicação: '🤝',
  'Walk-in': '🚶',
  Outros: '📌',
} as const;

export const ROLE_LABELS = {
  gerencia: 'Gerência',
  sdr: 'SDR',
  vendedor: 'Vendedor',
} as const;

export const PGTO_OPTIONS = [
  '',
  'À vista',
  'Financiamento',
  'Troca + financiamento',
  'Troca + à vista',
  'FGTS / Consórcio',
] as const;

export type StatusKey = keyof typeof STATUS_MAP;
export type OriginKey = keyof typeof ORIGINS;
export type RoleKey = keyof typeof ROLE_LABELS;