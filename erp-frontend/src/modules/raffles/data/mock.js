    // PATH: erp-frontend/src/modules/raffles/data/mock.js
export const mockRaffles = [
  { id: 'r1', name: 'Rifa Moto 0KM', status: 'Activa', price: 20000, totalTickets: 5000, ticketsSold: 1320, startDate: '2025-01-01', endDate: '2025-12-31' },
  { id: 'r2', name: 'Rifa TV 75"',   status: 'Activa', price: 15000, totalTickets: 3000, ticketsSold: 980,  startDate: '2025-02-01', endDate: '2025-10-01' },
  { id: 'r3', name: 'Rifa Viaje Cancún', status: 'Pausada', price: 25000, totalTickets: 2000, ticketsSold: 420, startDate: '2025-03-15', endDate: '2025-09-15' },
];

export const mockTickets = [
  { id: 't-0001', number: '0001', raffleId: 'r1', buyer: 'Ana Torres',   phone: '3001112233', status: 'Pagado',    purchaseDate: '2025-04-10' },
  { id: 't-0002', number: '0002', raffleId: 'r1', buyer: 'Luis Pérez',   phone: '3002223344', status: 'Pendiente', purchaseDate: '2025-04-10' },
  { id: 't-2140', number: '2140', raffleId: 'r1', buyer: 'Carlos Díaz',  phone: '3013334455', status: 'Pagado',    purchaseDate: '2025-04-12' },
  { id: 't-0088', number: '0088', raffleId: 'r2', buyer: 'María Rojas',  phone: '3024445566', status: 'Pagado',    purchaseDate: '2025-04-09' },
];

export const mockSales = [
  { id: 's-01', raffleId: 'r1', amount: 20000, method: 'Efectivo', date: '2025-04-10' },
  { id: 's-02', raffleId: 'r1', amount: 20000, method: 'Nequi',    date: '2025-04-10' },
  { id: 's-03', raffleId: 'r2', amount: 15000, method: 'Bancolombia', date: '2025-04-09' },
];

export const mockRaffleById = (id) => mockRaffles.find(r => r.id === id);
export const mockTicketById = (id) => mockTickets.find(t => t.id === id);
