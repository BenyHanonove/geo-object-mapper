import { createBrowserRouter, redirect } from 'react-router'
import { mapRoutes } from '@map/router'
import { RootGuard } from './RootGuard'
import { RouteError } from './RouteError'

export const appRouter = createBrowserRouter([
  {
    Component: RootGuard,
    ErrorBoundary: RouteError,
    HydrateFallback: () => null,
    children: [
      ...mapRoutes,
      {
        path: '*',
        loader: () => redirect('/'),
      },
    ],
  },
])
