/* =========================================
   ThemeContext.jsx
========================================= */

import React, {
  createContext,
  useContext,
  useLayoutEffect,
  useState,
} from 'react';

import { useSettings } from './SettingsContext';

/* =========================================
   CONTEXT
========================================= */

const ThemeContext = createContext();

/* =========================================
   THEMES
========================================= */

const THEMES = {
  default: {
    name: 'Ember Classic',

    primary: '#b5451b',
    primaryDark: '#8b3214',
    primaryLight: '#e8643c',

    accent: '#f0a500',

    dark: '#0f172a',
    surface: '#1e293b',

    gradient:
      'linear-gradient(135deg, #b5451b 0%, #e8643c 50%, #f0a500 100%)',

    heroGradient:
      'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #b5451b 100%)',

    cardBg: '#ffffff',
    bodyBg: '#fafaf8',
  },

  ocean: {
    name: 'Ocean Depths',

    primary: '#0369a1',
    primaryDark: '#024f7a',
    primaryLight: '#0ea5e9',

    accent: '#06b6d4',

    dark: '#0c1a2e',
    surface: '#0f2744',

    gradient:
      'linear-gradient(135deg, #0369a1 0%, #0ea5e9 50%, #06b6d4 100%)',

    heroGradient:
      'linear-gradient(135deg, #0c1a2e 0%, #0f2744 50%, #0369a1 100%)',

    cardBg: '#ffffff',
    bodyBg: '#f0f9ff',
  },

  forest: {
    name: 'Deep Forest',

    primary: '#15803d',
    primaryDark: '#0f5f2e',
    primaryLight: '#22c55e',

    accent: '#84cc16',

    dark: '#052e16',
    surface: '#0a3d20',

    gradient:
      'linear-gradient(135deg, #15803d 0%, #22c55e 50%, #84cc16 100%)',

    heroGradient:
      'linear-gradient(135deg, #052e16 0%, #0a3d20 50%, #15803d 100%)',

    cardBg: '#ffffff',
    bodyBg: '#f0fdf4',
  },

  royal: {
    name: 'Royal Purple',

    primary: '#7c3aed',
    primaryDark: '#5b21b6',
    primaryLight: '#a78bfa',

    accent: '#f59e0b',

    dark: '#1e1b4b',
    surface: '#2e1065',

    gradient:
      'linear-gradient(135deg, #7c3aed 0%, #a78bfa 50%, #f59e0b 100%)',

    heroGradient:
      'linear-gradient(135deg, #1e1b4b 0%, #2e1065 50%, #7c3aed 100%)',

    cardBg: '#ffffff',
    bodyBg: '#faf5ff',
  },

  rose: {
    name: 'Rose Gold',

    primary: '#be185d',
    primaryDark: '#9d174d',
    primaryLight: '#f43f5e',

    accent: '#fb7185',

    dark: '#1f0a14',
    surface: '#3b0a20',

    gradient:
      'linear-gradient(135deg, #be185d 0%, #f43f5e 50%, #fb7185 100%)',

    heroGradient:
      'linear-gradient(135deg, #1f0a14 0%, #3b0a20 50%, #be185d 100%)',

    cardBg: '#ffffff',
    bodyBg: '#fff1f2',
  },

  amber: {
    name: 'Golden Amber',

    primary: '#b45309',
    primaryDark: '#92400e',
    primaryLight: '#f59e0b',

    accent: '#fbbf24',

    dark: '#1c0a00',
    surface: '#451a03',

    gradient:
      'linear-gradient(135deg, #b45309 0%, #f59e0b 50%, #fbbf24 100%)',

    heroGradient:
      'linear-gradient(135deg, #1c0a00 0%, #451a03 50%, #b45309 100%)',

    cardBg: '#ffffff',
    bodyBg: '#fffbeb',
  },

  midnight: {
    name: 'Midnight Dark',

    primary: '#6366f1',
    primaryDark: '#4338ca',
    primaryLight: '#818cf8',

    accent: '#38bdf8',

    dark: '#0a0a0f',
    surface: '#111120',

    gradient:
      'linear-gradient(135deg, #4338ca 0%, #6366f1 50%, #38bdf8 100%)',

    heroGradient:
      'linear-gradient(135deg, #0a0a0f 0%, #111120 50%, #4338ca 100%)',

    cardBg: '#1a1a2e',
    bodyBg: '#0d0d1a',
  },
};

/* =========================================
   FONTS
========================================= */

const FONTS = {
  default: {
    name: 'Playfair Display + DM Sans',

    display: "'Playfair Display', serif",

    body: "'DM Sans', sans-serif",

    url:
      'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap',
  },

  modern: {
    name: 'Poppins + Inter',

    display: "'Poppins', sans-serif",

    body: "'Inter', sans-serif",

    url:
      'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&family=Inter:wght@300;400;500;600&display=swap',
  },

  elegant: {
    name:
      'Cormorant Garamond + Raleway',

    display:
      "'Cormorant Garamond', serif",

    body: "'Raleway', sans-serif",

    url:
      'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Raleway:wght@300;400;500;600;700&display=swap',
  },
};

/* =========================================
   APPLY THEME
========================================= */

export const applyTheme = (
  settings = {}
) => {
  const root =
    document.documentElement;

  const themeKey =
    settings?.theme || 'default';

  const themeData =
    THEMES[themeKey] ||
    THEMES.default;

  const primary =
    settings?.primaryColor ||
    themeData.primary;

  const primaryDark =
    settings?.primaryDarkColor ||
    themeData.primaryDark;

  const primaryLight =
    settings?.primaryLightColor ||
    themeData.primaryLight;

  const accent =
    settings?.secondaryColor ||
    themeData.accent;

  const dark =
    settings?.darkBgColor ||
    themeData.dark;

  /* ---------- COLORS ---------- */

  root.style.setProperty(
    '--color-primary',
    primary
  );

  root.style.setProperty(
    '--color-primary-dark',
    primaryDark
  );

  root.style.setProperty(
    '--color-primary-light',
    primaryLight
  );

  root.style.setProperty(
    '--color-accent',
    accent
  );

  root.style.setProperty(
    '--color-dark',
    dark
  );

  root.style.setProperty(
    '--color-surface',
    themeData.surface
  );

  root.style.setProperty(
    '--theme-gradient',
    themeData.gradient
  );

  root.style.setProperty(
    '--hero-gradient',
    themeData.heroGradient
  );

  root.style.setProperty(
    '--card-bg',
    themeData.cardBg
  );

  root.style.setProperty(
    '--body-bg',
    themeData.bodyBg
  );

  document.body.style.backgroundColor =
    themeData.bodyBg;

  /* ---------- FONTS ---------- */

  const fontKey =
    settings?.fontStyle ||
    'default';

  const fontData =
    FONTS[fontKey] ||
    FONTS.default;

  let fontLink =
    document.getElementById(
      'theme-font'
    );

  if (!fontLink) {
    fontLink =
      document.createElement('link');

    fontLink.id = 'theme-font';

    fontLink.rel = 'stylesheet';

    document.head.appendChild(
      fontLink
    );
  }

  if (
    fontLink.href !==
    fontData.url
  ) {
    fontLink.href =
      fontData.url;
  }

  root.style.setProperty(
    '--font-display',
    fontData.display
  );

  root.style.setProperty(
    '--font-body',
    fontData.body
  );

  /* ---------- CUSTOM CSS ---------- */

  let customStyle =
    document.getElementById(
      'custom-theme-css'
    );

  if (!customStyle) {
    customStyle =
      document.createElement(
        'style'
      );

    customStyle.id =
      'custom-theme-css';

    document.head.appendChild(
      customStyle
    );
  }

  customStyle.textContent =
    settings?.customCSS || '';
};

/* =========================================
   LOAD SAVED THEME BEFORE REACT
========================================= */

try {
  const savedSettings =
    JSON.parse(
      localStorage.getItem(
        'settings'
      ) || '{}'
    );

  applyTheme(savedSettings);
} catch (error) {
  applyTheme({});
}

/* =========================================
   PROVIDER
========================================= */

export const ThemeProvider = ({
  children,
}) => {
  const { settings, refresh } =
    useSettings();

  const [themeLoaded, setThemeLoaded] =
    useState(false);

  /*
    Apply theme BEFORE paint
  */

  useLayoutEffect(() => {
    if (settings) {
      applyTheme(settings);

      requestAnimationFrame(() => {
        setThemeLoaded(true);
      });
    }
  }, [settings]);

  const themeKey =
    settings?.theme || 'default';

  return (
    <div
      style={{
        visibility: themeLoaded
          ? 'visible'
          : 'hidden',
      }}
    >
      <ThemeContext.Provider
        value={{
          settings,
          themeKey,
          THEMES,
          FONTS,
          refreshTheme: refresh,
          applyTheme,
        }}
      >
        {children}
      </ThemeContext.Provider>
    </div>
  );
};

/* =========================================
   HOOK
========================================= */

export const useTheme = () =>
  useContext(ThemeContext);

/* =========================================
   EXPORTS
========================================= */

export {
  THEMES,
  FONTS,
};