import React from 'react';
import { ThemeProvider } from './ThemeProvider';
import { NotificationProvider } from './NotificationProvider';
import ErrorBoundary from '../../shared/ui/ErrorBoundary';

export interface AppProvidersProps {
  children: React.ReactNode;
  brandColor?: string;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children, brandColor }) => {
  return (
    <ErrorBoundary>
      <ThemeProvider brandColor={brandColor}>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default AppProviders;
