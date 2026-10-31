// Material UI components and styling imports
import { Chip } from '@mui/material'
import type { ChipProps } from '@mui/material'

// Chip props with a compact toggle
export interface IStatusChipProps extends Omit<ChipProps, 'size'> {
  compact?: boolean
}

// Small MUI chip for status labels
export function StatusChip({ compact = true, sx, ...props }: IStatusChipProps) {
  return (
    <Chip
      size={compact ? 'small' : 'medium'}
      sx={[
        {
          height: compact ? 22 : 28,
          fontSize: compact ? '0.72rem' : '0.8rem',
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
      {...props}
    />
  )
}
