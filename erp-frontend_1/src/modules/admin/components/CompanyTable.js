import React from 'react';

const CompanyTable = ({ data }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>RUC</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        {data.map((company) => (
          <tr key={company.id}>
            <td>{company.name}</td>
            <td>{company.ruc}</td>
            <td>{company.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default CompanyTable;
