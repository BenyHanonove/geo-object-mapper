// Core React ecosystem library imports
import type { ReactNode } from 'react'

// Material UI components and styling imports
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'

// Local sibling module and definition imports
import { AppButton } from './AppButton'

// Props for the confirmation dialog wrapper
export interface IAppDialogProps {
  open: boolean
  title: string
  description?: string
  type?: 'default' | 'delete'
  confirmText?: string
  cancelText?: string
  loading?: boolean
  onClose: () => void
  onConfirm?: () => void
  children?: ReactNode
}

// Modal dialog with confirm and cancel
export function AppDialog({
  open,
  title,
  description,
  type = 'default',
  confirmText,
  cancelText = 'Cancel',
  loading = false,
  onClose,
  onConfirm,
  children,
}: IAppDialogProps) {
  const isDelete = type === 'delete'
  const resolvedConfirmText = confirmText ?? (isDelete ? 'Delete' : 'Confirm')

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle sx={{ fontWeight: 700 }}>{title}</DialogTitle>
      <DialogContent>
        {description && <DialogContentText>{description}</DialogContentText>}
        {children}
      </DialogContent>
      {onConfirm && (
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <AppButton variant="outlined" color="inherit" onClick={onClose} disabled={loading}>
            {cancelText}
          </AppButton>
          <AppButton
            variant="contained"
            color={isDelete ? 'error' : 'primary'}
            loading={loading}
            onClick={onConfirm}
          >
            {resolvedConfirmText}
          </AppButton>
        </DialogActions>
      )}
    </Dialog>
  )
}
