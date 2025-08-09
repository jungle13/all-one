// PATH: erp-frontend/src/modules/admin/components/SubscriberTable.jsx
import React from 'react';
import { Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';

const SubscriberTable = ({ data = [] }) => (
  <Table>
    <TableHead>
      <TableRow>
        <TableCell>Nombre</TableCell>
        <TableCell>Tipo</TableCell>
        <TableCell>Estado</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {data.map((subscriber) => (
        <TableRow key={subscriber.id}>
          <TableCell>{subscriber.name}</TableCell>
          <TableCell>{subscriber.type}</TableCell>
          <TableCell>{subscriber.status}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

export default SubscriberTable;


