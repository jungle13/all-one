import React, { useState, useEffect } from 'react';
import apiClient from '../../../core/api/apiClient';
import CompanyTable from '../components/CompanyTable';

const CompanyListPage = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/admin/companies');
        setCompanies(response.data);
      } catch (error) {
        console.error("Error fetching companies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Gestión de Empresas</h1>
      <p>Aquí se listan todas las empresas registradas en erp-all-one.</p>
      <CompanyTable data={companies} />
    </div>
  );
};

export default CompanyListPage;
