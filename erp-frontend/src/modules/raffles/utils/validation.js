// PATH: erp-frontend/src/modules/raffles/utils/validation.js
// Utilidades de validación para Final Form

export const STATUS = ['Borrador', 'Activa', 'Pausada'];
export const NUMBER_LENGTH = [2, 4];

export const composeValidators =
  (...validators) =>
  (value, allValues) =>
    validators.reduce((error, validator) => error || validator(value, allValues), undefined);

// Reglas básicas
export const required = (msg = 'Requerido') => (v) =>
  v === undefined || v === null || v === '' ? msg : undefined;

export const minLength = (n, msg = `Mínimo ${n} caracteres`) => (v) =>
  v && String(v).trim().length < n ? msg : undefined;

export const isPositiveNumber = (msg = 'Número inválido') => (v) => {
  if (v === '' || v === undefined || v === null) return 'Requerido';
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? undefined : msg;
};

export const isPositiveInt = (msg = 'Entero positivo requerido') => (v) => {
  if (v === '' || v === undefined || v === null) return 'Requerido';
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? undefined : msg;
};

export const oneOf = (arr, msg = 'Valor inválido') => (v) =>
  arr.includes(v) ? undefined : msg;

export const dateRequired = required('Fecha requerida');

export const endDateGteStartDate = (v, all) => {
  if (!v || !all?.startDate) return undefined;
  return v < all.startDate ? 'Fin debe ser mayor o igual a inicio' : undefined;
};

// Regla de negocio: límite por longitud de número
// 2 dígitos -> máx 100 (00–99), 4 dígitos -> máx 10000 (0001–9999 o 0000–9999)
export const totalTicketsByLength = (v, all) => {
  const len = Number(all?.numberLength);
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0) return 'Entero positivo requerido';
  const max = len === 2 ? 100 : 10000;
  return n > max ? `Para ${len} dígitos, máximo ${max} tiquetes` : undefined;
};
