import React from 'react';
import SubscriberTable from '../components/SubscriberTable';

const subscribers = [
  { id: 1, name: 'Empresa ABC', type: 'Empresa', status: 'Activa' },
  { id: 2, name: 'Juan Pérez', type: 'Persona', status: 'Activa' },
];

const SubscriberListPage = () => (
  <div>
    <h1>Suscriptores</h1>
    <SubscriberTable data={subscribers} />
  </div>
);

export default SubscriberListPage;
