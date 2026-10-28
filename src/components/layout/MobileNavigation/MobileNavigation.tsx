import React from 'react';
import BottomNavBar, { BottomNavBarProps } from '../../../layouts/BottomNavBar';

export type MobileNavigationProps = BottomNavBarProps;

export const MobileNavigation: React.FC<MobileNavigationProps> = (props) => {
  return <BottomNavBar {...props} />;
};

export default MobileNavigation;
