// Core React ecosystem library imports
import type { ReactNode } from 'react'

// Material UI components and styling imports
import { Button, CircularProgress } from '@mui/material'
import type { ButtonProps } from '@mui/material'

// Button props with loading and icon
export interface IAppButtonProps extends ButtonProps {
  loading?: boolean
  icon?: ReactNode
}

// MUI button with loading spinner state
export function AppButton({
  loading = false,
  icon,
  disabled,
  children,
  startIcon,
  sx,
  ...rest
}: IAppButtonProps) {
  const resolvedStartIcon = loading ? (
    <CircularProgress size={16} color="inherit" />
  ) : (
    (icon ?? startIcon)
  )

  return (
    <Button
      disabled={disabled || loading}
      startIcon={resolvedStartIcon}
      sx={[
        {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.5,
          whiteSpace: 'nowrap',
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
      {...rest}
    >
      {children}
    </Button>
  )
}
