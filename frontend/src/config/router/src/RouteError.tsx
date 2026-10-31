// Core React ecosystem library imports
import { useEffect } from 'react'
import { isRouteErrorResponse, useRouteError } from 'react-router'

// Material UI components and styling imports
import { Paper, Stack, Typography } from '@mui/material'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'

// Shared application components and services imports
import { AppButton } from '@shared/components'

// Local sibling module and definition imports
import { reloadOnceAfterChunkFailure } from './chunkReload.utils'

// Route error screen with chunk recovery
export function RouteError() {
  const error = useRouteError()

  useEffect(() => {
    const message = error instanceof Error ? error.message : ''
    const isChunkLoadFailure =
      message.includes('Failed to fetch dynamically imported module') ||
      message.includes('Importing a module script failed') ||
      message.includes('error loading dynamically imported module')

    if (isChunkLoadFailure) reloadOnceAfterChunkFailure()
  }, [error])

  const statusText = isRouteErrorResponse(error)
    ? `${error.status} — ${error.statusText}`
    : 'Unexpected Application Error'

  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      sx={{ minBlockSize: '100dvh', p: 3, bgcolor: 'background.default' }}
    >
      <Paper sx={{ p: 4, maxInlineSize: 440, textAlign: 'center' }}>
        <Stack spacing={2} alignItems="center">
          <WarningAmberRoundedIcon color="warning" sx={{ fontSize: 44 }} />
          <Typography variant="h6">{statusText}</Typography>
          <Typography variant="body2" color="text.secondary">
            The workspace encountered a routing error. Reload the page to continue.
          </Typography>
          <AppButton
            variant="contained"
            icon={<RefreshRoundedIcon />}
            onClick={() => window.location.assign('/')}
          >
            Reload Workspace
          </AppButton>
        </Stack>
      </Paper>
    </Stack>
  )
}
