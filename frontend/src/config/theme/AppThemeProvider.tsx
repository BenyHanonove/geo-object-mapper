// Core React ecosystem library imports
import { useMemo, useSyncExternalStore, type ReactNode } from 'react'

// Material UI components and styling imports
import { CssBaseline, ThemeProvider } from '@mui/material'

// Local sibling module and definition imports
import { buildAppTheme } from './theme'
import { ThemeModeContext } from './themeMode.context'

// Local type and interface definition imports
import type { ThemeMode } from './tokens'

// Media query detecting system dark preference
const DARK_MEDIA_QUERY = '(prefers-color-scheme: dark)'

// Subscribe to operating system theme changes
const subscribeToSystemTheme = (onStoreChange: () => void): (() => void) => {
  if (typeof window === 'undefined') return () => undefined
  const mediaQuery = window.matchMedia(DARK_MEDIA_QUERY)
  mediaQuery.addEventListener('change', onStoreChange)
  return () => {
    mediaQuery.removeEventListener('change', onStoreChange)
  }
}

// Client and server theme mode snapshots
const getSystemThemeSnapshot = (): ThemeMode =>
  window.matchMedia(DARK_MEDIA_QUERY).matches ? 'dark' : 'light'

const getServerThemeSnapshot = (): ThemeMode => 'light'

// Props accepted by the theme provider
interface IAppThemeProviderProps {
  children: ReactNode
}

// Provide MUI theme and mode context
export function AppThemeProvider({ children }: IAppThemeProviderProps) {
  const mode = useSyncExternalStore(
    subscribeToSystemTheme,
    getSystemThemeSnapshot,
    getServerThemeSnapshot,
  )

  const theme = useMemo(() => buildAppTheme(mode), [mode])
  const contextValue = useMemo(() => ({ mode }), [mode])

  return (
    <ThemeModeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  )
}
