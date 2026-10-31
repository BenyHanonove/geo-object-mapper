// Core React ecosystem library imports
import { createBrowserRouter, redirect } from 'react-router'
import type { RouteObject } from 'react-router'

// Local sibling module and definition imports
import { RootGuard } from './RootGuard'
import { RouteError } from './RouteError'

// Local type and interface definition imports
import type { IDiscoveredModule } from './router.type'

// Eagerly discover every feature module entry
const discoveredModules = import.meta.glob<IDiscoveredModule>('/src/modules/*/index.ts', {
  eager: true,
})


// Collect routes exposed by discovered modules
const moduleRoutes: RouteObject[] = Object.values(discoveredModules).flatMap(
  (mod) => mod.routes ?? [],
)


// Application router with guard and fallback
export const appRouter = createBrowserRouter([
  {
    Component: RootGuard,
    ErrorBoundary: RouteError,
    HydrateFallback: () => null,
    children: [
      ...moduleRoutes,
      {
        path: '*',
        loader: () => redirect('/'),
      },
    ],
  },
])
