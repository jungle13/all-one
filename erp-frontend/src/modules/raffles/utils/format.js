// PATH: erp-frontend/src/modules/raffles/utils/format.js
export const pesoCol = (v) => {
  const n = typeof v === 'number' ? v : Number(v ?? 0);
  if (Number.isNaN(n)) return '—';
  return `$${n.toLocaleString()}`;
};

export const entero = (v) => {
  const n = typeof v === 'number' ? v : Number(v ?? 0);
  if (Number.isNaN(n)) return '0';
  return n.toLocaleString();
};