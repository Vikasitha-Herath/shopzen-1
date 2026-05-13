import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import API from '../utils/api';

const ThemeContext = createContext();

const THEMES = {
  default: {
    name: 'Ember Classic',
    primary: '#b5451b', primaryDark: '#8b3214', primaryLight: '#e8643c',
    accent: '#f0a500', dark: '#0f172a', surface: '#1e293b',
    gradient: 'linear-gradient(135deg, #b5451b 0%, #e8643c 50%, #f0a500 100%)',
    heroGradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #b5451b 100%)',
    cardBg: '#ffffff', bodyBg: '#fafaf8',
    font: 'Playfair Display', bodyFont: 'DM Sans',
  },
  ocean: {
    name: 'Ocean Depths',
    primary: '#0369a1', primaryDark: '#024f7a', primaryLight: '#0ea5e9',
    accent: '#06b6d4', dark: '#0c1a2e', surface: '#0f2744',
    gradient: 'linear-gradient(135deg, #0369a1 0%, #0ea5e9 50%, #06b6d4 100%)',
    heroGradient: 'linear-gradient(135deg, #0c1a2e 0%, #0f2744 50%, #0369a1 100%)',
    cardBg: '#ffffff', bodyBg: '#f0f9ff',
    font: 'Playfair Display', bodyFont: 'DM Sans',
  },
  forest: {
    name: 'Deep Forest',
    primary: '#15803d', primaryDark: '#0f5f2e', primaryLight: '#22c55e',
    accent: '#84cc16', dark: '#052e16', surface: '#0a3d20',
    gradient: 'linear-gradient(135deg, #15803d 0%, #22c55e 50%, #84cc16 100%)',
    heroGradient: 'linear-gradient(135deg, #052e16 0%, #0a3d20 50%, #15803d 100%)',
    cardBg: '#ffffff', bodyBg: '#f0fdf4',
    font: 'Cormorant Garamond', bodyFont: 'Raleway',
  },
  royal: {
    name: 'Royal Purple',
    primary: '#7c3aed', primaryDark: '#5b21b6', primaryLight: '#a78bfa',
    accent: '#f59e0b', dark: '#1e1b4b', surface: '#2e1065',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 50%, #f59e0b 100%)',
    heroGradient: 'linear-gradient(135deg, #1e1b4b 0%, #2e1065 50%, #7c3aed 100%)',
    cardBg: '#ffffff', bodyBg: '#faf5ff',
    font: 'Syne', bodyFont: 'Work Sans',
  },
  rose: {
    name: 'Rose Gold',
    primary: '#be185d', primaryDark: '#9d174d', primaryLight: '#f43f5e',
    accent: '#fb7185', dark: '#1f0a14', surface: '#3b0a20',
    gradient: 'linear-gradient(135deg, #be185d 0%, #f43f5e 50%, #fb7185 100%)',
    heroGradient: 'linear-gradient(135deg, #1f0a14 0%, #3b0a20 50%, #be185d 100%)',
    cardBg: '#ffffff', bodyBg: '#fff1f2',
    font: 'Cormorant Garamond', bodyFont: 'Raleway',
  },
  amber: {
    name: 'Golden Amber',
    primary: '#b45309', primaryDark: '#92400e', primaryLight: '#f59e0b',
    accent: '#fbbf24', dark: '#1c0a00', surface: '#451a03',
    gradient: 'linear-gradient(135deg, #b45309 0%, #f59e0b 50%, #fbbf24 100%)',
    heroGradient: 'linear-gradient(135deg, #1c0a00 0%, #451a03 50%, #b45309 100%)',
    cardBg: '#ffffff', bodyBg: '#fffbeb',
    font: 'Playfair Display', bodyFont: 'DM Sans',
  },
  midnight: {
    name: 'Midnight Dark',
    primary: '#6366f1', primaryDark: '#4338ca', primaryLight: '#818cf8',
    accent: '#38bdf8', dark: '#0a0a0f', surface: '#111120',
    gradient: 'linear-gradient(135deg, #4338ca 0%, #6366f1 50%, #38bdf8 100%)',
    heroGradient: 'linear-gradient(135deg, #0a0a0f 0%, #111120 50%, #4338ca 100%)',
    cardBg: '#1a1a2e', bodyBg: '#0d0d1a',
    font: 'Syne', bodyFont: 'Work Sans',
  },
  coral: {
    name: 'Coral Sunset',
    primary: '#f97316', primaryDark: '#ea580c', primaryLight: '#fb923c',
    accent: '#fcd34d', dark: '#1c0a00', surface: '#431407',
    gradient: 'linear-gradient(135deg, #ea580c 0%, #f97316 50%, #fcd34d 100%)',
    heroGradient: 'linear-gradient(135deg, #1c0a00 0%, #431407 50%, #ea580c 100%)',
    cardBg: '#ffffff', bodyBg: '#fff7ed',
    font: 'Playfair Display', bodyFont: 'DM Sans',
  },
  slate: {
    name: 'Slate Pro',
    primary: '#334155', primaryDark: '#1e293b', primaryLight: '#475569',
    accent: '#38bdf8', dark: '#0f172a', surface: '#1e293b',
    gradient: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #38bdf8 100%)',
    heroGradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
    cardBg: '#ffffff', bodyBg: '#f8fafc',
    font: 'Syne', bodyFont: 'Inter',
  },
  sakura: {
    name: 'Cherry Blossom',
    primary: '#db2777', primaryDark: '#be185d', primaryLight: '#f472b6',
    accent: '#a78bfa', dark: '#1a0a14', surface: '#2d1020',
    gradient: 'linear-gradient(135deg, #be185d 0%, #db2777 50%, #a78bfa 100%)',
    heroGradient: 'linear-gradient(135deg, #1a0a14 0%, #2d1020 50%, #db2777 100%)',
    cardBg: '#ffffff', bodyBg: '#fdf2f8',
    font: 'Cormorant Garamond', bodyFont: 'Raleway',
  },
  emerald: {
    name: 'Emerald City',
    primary: '#059669', primaryDark: '#047857', primaryLight: '#34d399',
    accent: '#6ee7b7', dark: '#022c22', surface: '#064e3b',
    gradient: 'linear-gradient(135deg, #047857 0%, #059669 50%, #34d399 100%)',
    heroGradient: 'linear-gradient(135deg, #022c22 0%, #064e3b 50%, #047857 100%)',
    cardBg: '#ffffff', bodyBg: '#ecfdf5',
    font: 'Playfair Display', bodyFont: 'DM Sans',
  },
  neon: {
    name: 'Neon Cyber',
    primary: '#a855f7', primaryDark: '#7c3aed', primaryLight: '#c084fc',
    accent: '#22d3ee', dark: '#050010', surface: '#0d001a',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #22d3ee 100%)',
    heroGradient: 'linear-gradient(135deg, #050010 0%, #0d001a 50%, #7c3aed 100%)',
    cardBg: '#0d001a', bodyBg: '#080010',
    font: 'Syne', bodyFont: 'Work Sans',
  },
};

const FONTS = {
  default: { name:'Playfair Display + DM Sans', display: "'Playfair Display', serif", body: "'DM Sans', sans-serif", url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap' },
  modern:  { name:'Poppins + Inter',            display: "'Poppins', sans-serif",           body: "'Inter', sans-serif",           url: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&family=Inter:wght@300;400;500;600&display=swap' },
  elegant: { name:'Cormorant Garamond + Raleway',display: "'Cormorant Garamond', serif",    body: "'Raleway', sans-serif",         url: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Raleway:wght@300;400;500;600;700&display=swap' },
  bold:    { name:'Syne + Work Sans',           display: "'Syne', sans-serif",              body: "'Work Sans', sans-serif",       url: 'https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Work+Sans:wght@300;400;500;600&display=swap' },
  luxury:  { name:'Bodoni Moda + Jost',         display: "'Bodoni Moda', serif",            body: "'Jost', sans-serif",           url: 'https://fonts.googleapis.com/css2?family=Bodoni+Moda:wght@400;600;700&family=Jost:wght@300;400;500;600&display=swap' },
  tech:    { name:'Space Grotesk + IBM Plex Sans',display:"'Space Grotesk', sans-serif",   body: "'IBM Plex Sans', sans-serif",   url: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap' },
  minimal: { name:'Outfit + Nunito',            display: "'Outfit', sans-serif",            body: "'Nunito', sans-serif",         url: 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Nunito:wght@300;400;500;600&display=swap' },
  classic: { name:'Libre Baskerville + Source Sans 3', display:"'Libre Baskerville', serif", body: "'Source Sans 3', sans-serif", url: 'https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Source+Sans+3:wght@300;400;500;600&display=swap' },
};

const LS_KEY = 'shopzen_theme_settings';

// Read cached settings from localStorage (sync, no flash)
const getCachedSettings = () => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
};

// Save settings to localStorage cache
const setCachedSettings = (data) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  } catch {}
};

export const applyTheme = (settings) => {
  const root = document.documentElement;
  const themeKey = settings?.theme || 'default';
  const themeData = THEMES[themeKey] || THEMES.default;

  const primary = settings?.primaryColor || themeData.primary;
  const primaryDark = settings?.primaryDarkColor || themeData.primaryDark;
  const primaryLight = settings?.primaryLightColor || themeData.primaryLight;
  const accent = settings?.secondaryColor || themeData.accent;
  const dark = settings?.darkBgColor || themeData.dark;
  const bodyBg = themeData.bodyBg;
  const cardBg = themeData.cardBg;

  root.style.setProperty('--color-primary', primary);
  root.style.setProperty('--color-primary-dark', primaryDark);
  root.style.setProperty('--color-primary-light', primaryLight);
  root.style.setProperty('--color-accent', accent);
  root.style.setProperty('--color-dark', dark);
  root.style.setProperty('--color-surface', themeData.surface);
  root.style.setProperty('--theme-gradient', themeData.gradient);
  root.style.setProperty('--hero-gradient', themeData.heroGradient);
  root.style.setProperty('--card-bg', cardBg);
  root.style.setProperty('--body-bg', bodyBg);

  // Apply body background immediately
  document.body.style.background = bodyBg;

  // Apply font
  const fontKey = settings?.fontStyle || 'default';
  const fontData = FONTS[fontKey] || FONTS.default;

  let fontLink = document.getElementById('theme-font');
  if (!fontLink) {
    fontLink = document.createElement('link');
    fontLink.id = 'theme-font';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);
  }
  if (fontLink.href !== fontData.url) {
    fontLink.href = fontData.url;
  }

  root.style.setProperty('--font-display', fontData.display);
  root.style.setProperty('--font-body', fontData.body);

  // Apply custom CSS
  let customStyle = document.getElementById('custom-theme-css');
  if (!customStyle) {
    customStyle = document.createElement('style');
    customStyle.id = 'custom-theme-css';
    document.head.appendChild(customStyle);
  }
  customStyle.textContent = settings?.customCSS || '';
};

export { THEMES, FONTS };

export const ThemeProvider = ({ children }) => {
  // ── Initialise from cache immediately so first paint uses correct theme ──
  const cached = getCachedSettings();
  const [settings, setSettings] = useState(cached);
  const [themeKey, setThemeKey] = useState(cached?.theme || 'default');
  const appliedRef = useRef(false);

  // Apply cached theme synchronously before first paint (runs before useEffect)
  if (!appliedRef.current && cached) {
    appliedRef.current = true;
    // Use queueMicrotask so it runs before browser paint
    applyTheme(cached);
  }

  const loadAndApply = useCallback(async () => {
    try {
      const { data } = await API.get('/settings');
      setSettings(data);
      setThemeKey(data.theme || 'default');
      applyTheme(data);
      setCachedSettings(data); // update cache with fresh data
    } catch {}
  }, []);

  useEffect(() => {
    // Apply cached theme immediately on mount to prevent any flash
    if (cached) {
      applyTheme(cached);
    }
    // Then fetch fresh settings from API
    loadAndApply();
    // Poll every 5 seconds for real-time admin sync
    const interval = setInterval(loadAndApply, 5000);
    return () => clearInterval(interval);
  }, [loadAndApply]);

  const refreshTheme = useCallback(() => {
    loadAndApply();
  }, [loadAndApply]);

  return (
    <ThemeContext.Provider value={{ settings, themeKey, THEMES, FONTS, refreshTheme, applyTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);