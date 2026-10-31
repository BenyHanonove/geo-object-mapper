// Supported application color scheme modes
export type ThemeMode = 'light' | 'dark'


// Color tokens for map overlay elements
export interface IMapThemeTokens {
  polygonSavedStroke: string
  polygonSavedFill: string
  polygonSelectedStroke: string
  polygonSelectedFill: string
  polygonDraftStroke: string
  polygonDraftFill: string
  drawingLine: string
  vertexDefault: string
  vertexStartReady: string
  vertexRingBg: string
  symbolMarker: string
  symbolJeep: string
  symbolRadar: string
  symbolDrone: string
  symbolDraftBorder: string
  symbolSelectedHalo: string
  badgeSurface: string
  badgeText: string
  symbolGlyph: string
}

// Light and dark MUI palette definitions
export const LIGHT_PALETTE = {
  primary: {
    main: '#2563eb',
    light: '#60a5fa',
    dark: '#1d4ed8',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#0d9488',
    light: '#2dd4bf',
    dark: '#0f766e',
    contrastText: '#ffffff',
  },
  success: {
    main: '#16a34a',
    light: '#4ade80',
    dark: '#15803d',
    contrastText: '#ffffff',
  },
  warning: {
    main: '#d97706',
    light: '#fbbf24',
    dark: '#b45309',
    contrastText: '#ffffff',
  },
  error: {
    main: '#dc2626',
    light: '#f87171',
    dark: '#b91c1c',
    contrastText: '#ffffff',
  },
  info: {
    main: '#0284c7',
    light: '#38bdf8',
    dark: '#0369a1',
    contrastText: '#ffffff',
  },
  background: {
    default: '#f1f5f9',
    paper: '#ffffff',
  },
  text: {
    primary: '#0f172a',
    secondary: '#475569',
  },
  divider: '#e2e8f0',
} as const

export const DARK_PALETTE = {
  primary: {
    main: '#3b82f6',
    light: '#60a5fa',
    dark: '#2563eb',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#14b8a6',
    light: '#5eead4',
    dark: '#0d9488',
    contrastText: '#042f2e',
  },
  success: {
    main: '#22c55e',
    light: '#4ade80',
    dark: '#16a34a',
    contrastText: '#052e16',
  },
  warning: {
    main: '#f59e0b',
    light: '#fbbf24',
    dark: '#d97706',
    contrastText: '#451a03',
  },
  error: {
    main: '#ef4444',
    light: '#f87171',
    dark: '#dc2626',
    contrastText: '#ffffff',
  },
  info: {
    main: '#38bdf8',
    light: '#7dd3fc',
    dark: '#0284c7',
    contrastText: '#082f49',
  },
  background: {
    default: '#0b1120',
    paper: '#111827',
  },
  text: {
    primary: '#f8fafc',
    secondary: '#94a3b8',
  },
  divider: '#1e293b',
} as const

// Map always retains the crisp default light street-map appearance across all system themes
export const DEFAULT_MAP_TOKENS: IMapThemeTokens = {
  polygonSavedStroke: '#2563eb',
  polygonSavedFill: '#3b82f6',
  polygonSelectedStroke: '#facc15',
  polygonSelectedFill: '#fde047',
  polygonDraftStroke: '#d97706',
  polygonDraftFill: '#f59e0b',
  drawingLine: '#7c3aed',
  vertexDefault: '#2563eb',
  vertexStartReady: '#16a34a',
  vertexRingBg: '#ffffff',
  symbolMarker: '#2563eb',
  symbolJeep: '#15803d',
  symbolRadar: '#7c3aed',
  symbolDrone: '#0284c7',
  symbolDraftBorder: '#d97706',
  symbolSelectedHalo: '#facc15',
  badgeSurface: '#ffffff',
  badgeText: '#0f172a',
  symbolGlyph: '#ffffff',
}

export const POLYGON_SWATCH_TOKENS = [
  '#2563eb',
  '#0d9488',
  '#7c3aed',
  '#ea580c',
  '#db2777',
] as const

export const FONT_FAMILIES = {
  sans: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
} as const
