import React from 'react';
import { useRoles } from '../../hooks/useRoles';
import { AdminDashboard } from './AdminDashboard';
import { SiteDashboard } from './SiteDashboard';

export const Dashboard: React.FC = () => {
  const { isAdminFonctionnel } = useRoles();
  return isAdminFonctionnel ? <AdminDashboard /> : <SiteDashboard />;
};

export default Dashboard;
