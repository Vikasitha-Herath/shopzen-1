import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../utils/api';

const SeasonalContext = createContext();

export const SeasonalProvider = ({ children }) => {
  const [campaign, setCampaign] = useState(null);

  useEffect(() => {
    API.get('/seasonal/active').then(r => {
      const c = r.data;
      setCampaign(c);
      if (c?.theme) {
        const root = document.documentElement;
        if (c.theme.primaryColor) root.style.setProperty('--seasonal-primary', c.theme.primaryColor);
        if (c.theme.secondaryColor) root.style.setProperty('--seasonal-secondary', c.theme.secondaryColor);
        if (c.theme.accentColor) root.style.setProperty('--seasonal-accent', c.theme.accentColor);
        if (c.theme.bgColor) root.style.setProperty('--seasonal-bg', c.theme.bgColor);
        if (c.theme.customCSS) {
          const style = document.createElement('style');
          style.id = 'seasonal-css';
          style.textContent = c.theme.customCSS;
          document.head.appendChild(style);
        }
      }
    }).catch(() => {});
  }, []);

  return (
    <SeasonalContext.Provider value={{ campaign }}>
      {children}
    </SeasonalContext.Provider>
  );
};

export const useSeasonal = () => useContext(SeasonalContext);
