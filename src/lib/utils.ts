export function initials(nome: string): string {
  return (nome || '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function fmtDate(data: string): string {
  if (!data) return '—';
  const parts = data.split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return data;
}

export function formatDateISO(data: string): string {
  if (!data) return '';
  if (data.includes('-')) return data;
  const parts = data.split('/');
  if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
  return data;
}

export function parseValor(valor: string): number {
  const n = parseFloat(valor.replace(/[^0-9,.]/g, '').replace(',', '.'));
  return isNaN(n) ? 0 : n;
}

export function sanitize(html: string): string {
  return html
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), ms);
  };
}