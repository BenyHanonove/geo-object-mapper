import { isRouteErrorResponse, useRouteError } from 'react-router'
import { Paper, Stack, Typography } from '@mui/material'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import { AppButton } from '@shared/components'

export function RouteError() {
  const error = useRouteError()

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
