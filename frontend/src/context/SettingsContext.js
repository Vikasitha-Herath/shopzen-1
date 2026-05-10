import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import API from '../utils/api';

const CACHE_KEY = 'shopzen_settings_v1';
const POLL_MS = 8000; // Poll every 8s (reduced from 5s to ease server load)

const SettingsContext = createContext(null);

// Read from cache synchronously — used for instant initial render
const readCache = () => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
};

const writeCache = (data) => {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch {}
};

export const SettingsProvider = ({ children }) => {
  // Initialize from cache instantly — no null flash
  const [settings, setSettings] = useState(() => readCache() || {});
  const [loaded, setLoaded] = useState(() => !!readCache()); // true if we have cached data
  const fetchingRef = useRef(false);

  const fetchSettings = useCallback(async () => {
    if (fetchingRef.current) return; // Prevent concurrent fetches
    fetchingRef.current = true;
    try {
      const { data } = await API.get('/settings');
      setSettings(data);
      setLoaded(true);
      writeCache(data);
    } catch {}
    finally { fetchingRef.current = false; }
  }, []);

  useEffect(() => {
    fetchSettings();
    const id = setInterval(fetchSettings, POLL_MS);
    return () => clearInterval(id);
  }, [fetchSettings]);

  const refresh = useCallback(() => fetchSettings(), [fetchSettings]);

  return (
    <SettingsContext.Provider value={{ settings, loaded, refresh }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);