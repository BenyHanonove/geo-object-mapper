// Core React ecosystem library imports
import { useCallback } from 'react'

// Zustand state management library imports
import { create } from 'zustand'

// Local type and interface definition imports
import type { SnackbarSeverity } from '@shared/types/ui.types'

// State and actions of the snackbar
interface ISnackbarState {
  open: boolean
  message: string
  severity: SnackbarSeverity
  show: (message: string, severity?: SnackbarSeverity) => void
  close: () => void
}

// Zustand store controlling the global snackbar
export const useSnackbarStore = create<ISnackbarState>()((set) => ({
  open: false,
  message: '',
  severity: 'info',
  show: (message, severity = 'info') => set({ open: true, message, severity }),
  close: () => set({ open: false }),
}))

// Hook exposing severity specific notify helpers
export const useSnackbar = () => {
  const show = useSnackbarStore((s) => s.show)

  const notifySuccess = useCallback((msg: string) => show(msg, 'success'), [show])
  const notifyError = useCallback((msg: string) => show(msg, 'error'), [show])
  const notifyInfo = useCallback((msg: string) => show(msg, 'info'), [show])
  const notifyWarning = useCallback((msg: string) => show(msg, 'warning'), [show])

  return {
    showSnackbar: show,
    notifySuccess,
    notifyError,
    notifyInfo,
    notifyWarning,
  }
}
