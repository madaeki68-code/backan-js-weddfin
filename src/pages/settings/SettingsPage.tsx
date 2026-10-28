import React from 'react';
import SettingsContainer from '../../features/settings';
import { SettingsProps } from '../../features/settings/types';

export const Settings: React.FC<SettingsProps> = props => {
  return <SettingsContainer {...props} />;
};

export default Settings;
