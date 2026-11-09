/**
 * BAGANI — Centralized Semantic Design System, Brand Color Tokens & Typography
 * Strictly implements DESIGN_SYSTEM.md specifications:
 * - Botanical Green Brand Identity (#167A45, #20A464, #E7F4EB, #123B29, #B9DB54)
 * - Light Theme (#F7F9F7 / #FFFFFF / #17231C / #66736A / #E5EBE6 / #167A45 / #E7F4EB)
 * - Dark Theme (#101713 / #19231D / #222E26 / #EDF5EF / #A1B0A5 / #2D3B32 / #55C889 / #83D6A5 / #233D2D)
 * - Typography: Bengali (Hind Siliguri -> Noto Sans Bengali), English (Inter -> Roboto)
 */

import { Platform } from 'react-native';

export type ThemeModePreference = 'light' | 'dark' | 'system';
export type FontScalePreference = 'normal' | 'large';

export const BRAND_COLORS = {
  primaryGreen: '#167A45',
  secondaryGreen: '#20A464',
  softGreen: '#E7F4EB',
  deepForest: '#123B29',
  freshLime: '#B9DB54',
} as const;

export const DESIGN_TOKENS = {
  mainCardRadius: 16,
  smallCardRadius: 12,
  buttonRadius: 12,
  inputRadius: 12,
  screenHorizontalPadding: 20,
  cardPadding: 16,
  spacing: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
  },
  buttonHeight: 46,
  iconSize: 22,
} as const;

export interface AppThemeColors {
  mode: 'light' | 'dark';
  background: string;
  surface: string;
  surfaceElevated: string;
  selectedSurface: string;
  cardBackground: string;
  primary: string;
  primaryAccent: string;
  secondary: string;
  deepForest: string;
  freshLime: string;
  earthAccent: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  adBannerBg: string;
  statusBarStyle: 'dark' | 'light';
}

export const LIGHT_THEME: AppThemeColors = {
  mode: 'light',
  background: '#F7F9F7',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  selectedSurface: '#E7F4EB',
  cardBackground: '#FFFFFF',
  primary: '#167A45',
  primaryAccent: '#20A464',
  secondary: '#20A464',
  deepForest: '#123B29',
  freshLime: '#B9DB54',
  earthAccent: '#8C5A2B',
  textPrimary: '#17231C',
  textSecondary: '#66736A',
  textMuted: '#7E9185',
  border: '#E5EBE6',
  success: '#167A45',
  warning: '#D97706',
  danger: '#DC2626',
  info: '#0284C7',
  adBannerBg: '#E7F4EB',
  statusBarStyle: 'dark',
};

export const DARK_THEME: AppThemeColors = {
  mode: 'dark',
  background: '#101713',
  surface: '#19231D',
  surfaceElevated: '#222E26',
  selectedSurface: '#233D2D',
  cardBackground: '#19231D',
  primary: '#55C889',
  primaryAccent: '#83D6A5',
  secondary: '#83D6A5',
  deepForest: '#123B29',
  freshLime: '#B9DB54',
  earthAccent: '#EAB308',
  textPrimary: '#EDF5EF',
  textSecondary: '#A1B0A5',
  textMuted: '#A1B0A5',
  border: '#2D3B32',
  success: '#55C889',
  warning: '#FBBF24',
  danger: '#F87171',
  info: '#38BDF8',
  adBannerBg: '#19231D',
  statusBarStyle: 'light',
};

const BENGALI_FONT_STACK = Platform.select({
  web: '"Hind Siliguri", "Noto Sans Bengali", "Inter", "Roboto", sans-serif',
  default: 'System',
});

const ENGLISH_FONT_STACK = Platform.select({
  web: '"Inter", "Roboto", "Hind Siliguri", "Noto Sans Bengali", sans-serif',
  default: 'System',
});

export const APP_TYPOGRAPHY = {
  fontFamilyBengali: BENGALI_FONT_STACK,
  fontFamilyEnglish: ENGLISH_FONT_STACK,
  headingFont: ENGLISH_FONT_STACK,
  bodyFont: BENGALI_FONT_STACK,
};

/**
 * Injects Google Fonts:
 * - Bengali: 'Hind Siliguri' (Primary) + 'Noto Sans Bengali' (Fallback)
 * - English: 'Inter' (Primary) + 'Roboto' (Fallback)
 * Uses clean inheritance without breaking icon fonts or line-heights.
 */
export function ensureWebFontsLoaded(): void {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;

  // Remove any older style tags that had !important on span/*
  const oldIds = ['bagani-global-ui-polish', 'bagani-design-system-reset', 'bagani-clean-layout-v3'];
  oldIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.remove();
  });

  const fontLinkId = 'bagani-design-system-fonts-v3';
  if (!document.getElementById(fontLinkId)) {
    const link = document.createElement('link');
    link.id = fontLinkId;
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Noto+Sans+Bengali:wght@400;500;600;700&family=Roboto:wght@400;500;700&display=swap';
    document.head.appendChild(link);
  }

  const styleId = 'bagani-clean-layout-v4';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      html, body, #root {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        font-family: 'Inter', 'Hind Siliguri', 'Noto Sans Bengali', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      input, textarea, button, select {
        font-family: 'Inter', 'Hind Siliguri', 'Noto Sans Bengali', 'Roboto', sans-serif;
      }

      /* Hide scrollbars cleanly while keeping smooth scrolling */
      * {
        scrollbar-width: none;
        -ms-overflow-style: none;
        box-sizing: border-box;
      }
      *::-webkit-scrollbar {
        width: 0px;
        height: 0px;
        display: none;
        background: transparent;
      }

      input:focus, textarea:focus {
        outline: none;
      }

      /* Smooth & Gentle Paper Page Transition */
      @keyframes baganiPaperSlideFade {
        0% {
          opacity: 0.15;
          transform: translate3d(0, 5px, 0);
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.02);
        }
        100% {
          opacity: 1;
          transform: translate3d(0, 0, 0);
          box-shadow: 0 4px 20px -2px rgba(0, 25, 12, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.02);
        }
      }

      .bagani-paper-page-transition {
        animation: baganiPaperSlideFade 240ms cubic-bezier(0.16, 1, 0.3, 1) both;
        will-change: opacity, transform, box-shadow;
      }
    `;
    document.head.appendChild(style);
  }
}

/**
 * Dynamically adjusts global font scale across the entire web application within safe bounds (88% to 118%)
 * to guarantee that text never overflows containers or disrupts the layout architecture.
 */
export function applyGlobalFontScale(scalePercent: number): void {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  const clamped = Math.max(88, Math.min(118, Math.round(scalePercent)));
  const styleId = 'bagani-dynamic-font-scale';
  let el = document.getElementById(styleId) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement('style');
    el.id = styleId;
    document.head.appendChild(el);
  }
  el.textContent = `
    html {
      font-size: ${clamped}%;
    }
  `;
}
