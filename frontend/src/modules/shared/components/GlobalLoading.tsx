// Material UI components and styling imports
import { CircularProgress, Stack, Typography } from '@mui/material'

// Props for the fullscreen loading indicator
export interface IGlobalLoadingProps {
  label?: string
}

// Fullscreen spinner with optional status label
export function GlobalLoading({ label = 'Loading spatial workspace…' }: IGlobalLoadingProps) {
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      spacing={2}
      sx={{
        minBlockSize: '100dvh',
        inlineSize: '100%',
        bgcolor: 'background.default',
      }}
    >
      <CircularProgress size={36} />
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Stack>
  )
}
