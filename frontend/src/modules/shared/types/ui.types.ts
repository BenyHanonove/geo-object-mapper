// Core React ecosystem library imports
import type { ReactNode } from 'react'

// Severity levels supported by the snackbar
export type SnackbarSeverity = 'success' | 'info' | 'warning' | 'error'

// Horizontal alignment options for table cells
export type TableAlign = 'left' | 'center' | 'right'

// Column definition for the data table
export interface ITableHeader<T> {
  key: (keyof T & string) | 'actions'
  title: string
  align?: TableAlign
  minWidth?: number
  isRowHeader?: boolean
}

// Clickable action item with optional icon
export interface IListAction {
  title: string
  icon?: ReactNode
  color?: 'inherit' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
  disabled?: boolean
  handler: () => void
}
