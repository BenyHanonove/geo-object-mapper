// Core React ecosystem library imports
import type { ReactNode } from 'react'

// Material UI components and styling imports
import { Box, Stack, Typography } from '@mui/material'

// Props for the empty placeholder state
export interface IEmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

// Centered placeholder shown when content missing
export function EmptyState({ icon, title, description, action }: IEmptyStateProps) {
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      spacing={1}
      sx={{
        py: 4,
        px: 2,
        textAlign: 'center',
        color: 'text.secondary',
      }}
    >
      {icon && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'text.disabled',
            mb: 0.5,
          }}
        >
          {icon}
        </Box>
      )}
      <Typography variant="subtitle2" color="text.primary">
        {title}
      </Typography>
      {description && (
        <Typography variant="caption" color="text.secondary" sx={{ maxInlineSize: 280 }}>
          {description}
        </Typography>
      )}
      {action && <Box sx={{ pt: 1 }}>{action}</Box>}
    </Stack>
  )
}
