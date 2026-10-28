import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { darkenColor, hexToHsl, lightenColor } from '../../constants';

interface ThemeContextValue {
  theme: 'light';
  accentColor: string;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  accentColor: '#5D87FF',
});

export interface ThemeProviderProps {
  children: React.ReactNode;
  brandColor?: string;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, brandColor }) => {
  // Enforce consistent light theme across all devices
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    try {
      localStorage.setItem('theme', 'light');
    } catch {
      // Storage unavailable or disabled
    }
  }, []);

  // Synchronize CSS design tokens and accent color variables
  useEffect(() => {
    const rootStyle = document.documentElement.style;
    const accentColor = brandColor;
    const variables = [
      '--color-accent',
      '--color-accent-hover',
      '--color-accent-light',
      '--color-accent-dark',
      '--color-accent-hsl',
      '--public-accent',
      '--public-accent-hover',
      '--public-accent-hsl',
    ];

    if (!accentColor || !/^#[0-9a-f]{6}$/i.test(accentColor)) {
      variables.forEach(variable => rootStyle.removeProperty(variable));
      return;
    }

    const hoverColor = darkenColor(accentColor, 10);
    const lightColor = lightenColor(accentColor, 88);
    const darkColor = darkenColor(accentColor, 20);
    const accentHsl = hexToHsl(accentColor);

    rootStyle.setProperty('--color-accent', accentColor);
    rootStyle.setProperty('--color-accent-hover', hoverColor);
    rootStyle.setProperty('--color-accent-light', lightColor);
    rootStyle.setProperty('--color-accent-dark', darkColor);
    rootStyle.setProperty('--color-accent-hsl', accentHsl);
    rootStyle.setProperty('--public-accent', accentColor);
    rootStyle.setProperty('--public-accent-hover', hoverColor);
    rootStyle.setProperty('--public-accent-hsl', accentHsl);
  }, [brandColor]);

  const value = useMemo<ThemeContextValue>(() => ({
    theme: 'light',
    accentColor: brandColor || '#5D87FF',
  }), [brandColor]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => useContext(ThemeContext);
