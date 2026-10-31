// Material UI components and styling imports
import { Alert, Snackbar } from '@mui/material'

// Shared application components and services imports
import { useSnackbarStore } from '@shared/hooks/snackbar.store'

// Global snackbar bound to store state
export function AppSnackbar() {
  const open = useSnackbarStore((s) => s.open)
  const message = useSnackbarStore((s) => s.message)
  const severity = useSnackbarStore((s) => s.severity)
  const close = useSnackbarStore((s) => s.close)

  return (
    <Snackbar
      key={`${severity}:${message}`}
      open={open}
      autoHideDuration={3800}
      onClose={(_event, reason) => {
        if (reason === 'clickaway') return
        close()
      }}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
    >
      <Alert
        onClose={close}
        severity={severity}
        variant="filled"
        sx={{ alignItems: 'center', fontWeight: 500, boxShadow: 3 }}
      >
        {message}
      </Alert>
    </Snackbar>
  )
}
