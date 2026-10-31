// Core React ecosystem library imports
import { createContext, useContext } from 'react'

// Local type and interface definition imports
import type { ThemeMode } from './tokens'


// Shape of the theme mode context
export interface IThemeModeContextValue {
  mode: ThemeMode
}

// Context holding the active theme mode
export const ThemeModeContext = createContext<IThemeModeContextValue>({
  mode: 'light',
})

// Hook reading the active theme mode
export const useThemeMode = (): IThemeModeContextValue => useContext(ThemeModeContext)
