import { RouterProvider } from 'react-router'
import { AppThemeProvider } from '@plugins'
import { appRouter } from '@router'
import { AppSnackbar } from '@shared/components'

export default function App() {
  return (
    <AppThemeProvider>
      <RouterProvider router={appRouter} />
      <AppSnackbar />
    </AppThemeProvider>
  )
}
