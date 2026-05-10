import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { useSettings } from './SettingsContext';
import API from '../utils/api';

const AnimationContext = createContext({});

export const ANIMATION_DEFAULTS = {
  heroStyle:           'cinematic',
  heroParallax:        true,
  heroOrbs:            true,
  heroOrbCount:        4,
  heroDotGrid:         true,
  heroScanlines:       false,
  heroWave:            true,
  heroTextStyle:       '3d',
  heroAutoplay:        true,
  heroInterval:        6000,
  cardTilt:            true,
  cardTiltMax:         16,
  cardShine:           true,
  cardImageParallax:   true,
  cardHoverGlow:       true,
  cardRevealStyle:     '3d',
  pageParticles:       false,
  pageFloatingShapes:  true,
  cursorTrail:         false,
  sectionReveal:       '3d',
  staggerDelay:        0.09,
  cartToastStyle:      'cinematic',
  cartToastPos:        'bottom-right',
  cartToastDuration:   3000,
  scrollProgress:      true,
  parallaxIntensity:   1.0,
  bannerParallax:      true,
  bannerShine:         true,
  bannerScale:         true,
  reducedMotion:       false,
  gpuAccelerate:       true,
};

export const AnimationProvider = ({ children }) => {
  const { settings, loaded } = useSettings();

  // Derive animation config directly from shared settings — no separate fetch
  const config = useMemo(() => {
    if (!settings?.animationConfig) return ANIMATION_DEFAULTS;
    try {
      return { ...ANIMATION_DEFAULTS, ...JSON.parse(settings.animationConfig) };
    } catch {
      return ANIMATION_DEFAULTS;
    }
  }, [settings?.animationConfig]);

  const save = useCallback(async (updates) => {
    const next = { ...config, ...updates };
    try { await API.put('/settings', { animationConfig: JSON.stringify(next) }); } catch {}
  }, [config]);

  return (
    <AnimationContext.Provider value={{ config, save, loaded }}>
      {children}
    </AnimationContext.Provider>
  );
};

export const useAnimation = () => useContext(AnimationContext);