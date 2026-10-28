import React from 'react';
import BusinessReportsPage from '../../business-reports/components/BusinessReportsPage';
import { BusinessReportsProps } from '../../business-reports/types/businessReports.types';

export const ClientReports: React.FC<BusinessReportsProps> = (props) => {
  return <BusinessReportsPage {...props} />;
};

export default ClientReports;
