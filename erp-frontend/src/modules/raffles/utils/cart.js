// PATH: erp-frontend/src/modules/raffles/utils/cart.js
const CART_KEY = "raffles:cart";
const SALES_KEY = "raffles:sales";

/** Lee un arreglo desde localStorage con fallback [] */
function readList(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function writeList(key, arr) {
  localStorage.setItem(key, JSON.stringify(arr || []));
}

/** Simula “Añadir a la compra” (estado pending) */
export function addToCart(ticketDraft) {
  const list = readList(CART_KEY);
  const withId = {
    ...ticketDraft,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };
  list.push(withId);
  writeList(CART_KEY, list);
  return withId;
}

/** Simula “Confirmar compra” (estado paid) y limpia del carrito */
export function confirmPurchase(ticketDraft) {
  // quita draft similar del carrito si existe
  const cart = readList(CART_KEY).filter(
    (t) => !(t.raffle_id === ticketDraft.raffle_id && t.name === ticketDraft.name && t.phone === ticketDraft.phone)
  );
  writeList(CART_KEY, cart);

  const sales = readList(SALES_KEY);
  const withId = {
    ...ticketDraft,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    payment_date: new Date().toISOString(),
  };
  sales.push(withId);
  writeList(SALES_KEY, sales);
  return withId;
}
