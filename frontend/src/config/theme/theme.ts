// Material UI components and styling imports
import { alpha, createTheme } from '@mui/material/styles'
import type { Theme } from '@mui/material/styles'

// Local sibling module and definition imports
import { DARK_PALETTE, DEFAULT_MAP_TOKENS, FONT_FAMILIES, LIGHT_PALETTE } from './tokens'
import type { IMapThemeTokens, ThemeMode } from './tokens'

// Typed application environment configuration imports
import { env } from '@plugins/env'

// Extend MUI theme with custom tokens
declare module '@mui/material/styles' {
  interface Theme {
    mapTokens: IMapThemeTokens
    fontMono: string
  }
  interface ThemeOptions {
    mapTokens?: IMapThemeTokens
    fontMono?: string
  }
}

// Build the app theme per mode
export const buildAppTheme = (mode: ThemeMode): Theme => {
  const palette = mode === 'dark' ? DARK_PALETTE : LIGHT_PALETTE

  return createTheme({
    direction: env.app.dir,
    palette: {
      mode,
      ...palette,
    },
    mapTokens: DEFAULT_MAP_TOKENS,
    fontMono: FONT_FAMILIES.mono,
    shape: {
      borderRadius: 12,
    },
    typography: {
      fontFamily: FONT_FAMILIES.sans,
      h5: { fontWeight: 700, letterSpacing: '-0.02em' },
      h6: { fontWeight: 700, letterSpacing: '-0.015em', fontSize: '1.05rem' },
      subtitle1: { fontWeight: 600, fontSize: '0.95rem' },
      subtitle2: { fontWeight: 600, fontSize: '0.825rem' },
      body2: { fontSize: '0.85rem' },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          ':root': {
            colorScheme: 'light dark',
          },
          'html, body, #root': {
            blockSize: '100%',
            margin: 0,
            padding: 0,
          },
          body: {
            overflowX: 'clip',
          },
          // Force map subtree to stay in light color-scheme with explicit surface & text colors
          '.leaflet-container': {
            colorScheme: 'only light',
            backgroundColor: LIGHT_PALETTE.background.default,
            color: LIGHT_PALETTE.text.primary,
            fontFamily: FONT_FAMILIES.sans,
            inlineSize: '100%',
            blockSize: '100%',
            zIndex: 0,
          },
          '.leaflet-div-icon': {
            background: 'transparent',
            border: 'none',
          },
        },
      },
      MuiPaper: {
        defaultProps: {
          elevation: 0,
        },
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            border: `1px solid ${palette.divider}`,
          },
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            borderRadius: 10,
            paddingInline: 16,
            paddingBlock: 8,
          },
          outlined: {
            borderWidth: '1.5px',
            '&:hover': {
              borderWidth: '1.5px',
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            fontWeight: 700,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            paddingInline: 12,
            paddingBlock: 8,
            backgroundColor: palette.background.paper,
            color: palette.text.secondary,
            borderBottom: `1px solid ${palette.divider}`,
          },
          body: {
            fontSize: '0.82rem',
            paddingInline: 12,
            paddingBlock: 8,
            borderBottom: `1px solid ${alpha(palette.divider, 0.7)}`,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            borderRadius: 8,
          },
        },
      },
    },
  })
}
