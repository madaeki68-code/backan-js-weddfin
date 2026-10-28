import React from 'react';
import { DashboardContainer } from '../../features/dashboard';
import type { DashboardProps } from '../../features/dashboard/types';

/**
 * DashboardPage - Backward-compatible delegator for the modular Dashboard feature
 */
export const DashboardPage: React.FC<DashboardProps> = (props) => {
  return <DashboardContainer {...props} />;
};

export type { DashboardProps };
export default DashboardPage;
