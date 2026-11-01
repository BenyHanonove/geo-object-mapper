// Core React ecosystem library imports
import type { RouteObject } from 'react-router'

// Local sibling module and definition imports
import { MapRoutePath } from './map.route.type'
import type { IMapRouteHandle } from './map.route.type'

// Lazy loaded map workspace index route
export const mapWorkspaceRoute: RouteObject = {
  index: true,
  lazy: async () => ({
    Component: (await import('@map/views/MapWorkspaceView')).default,
  }),
  handle: {
    isPublic: true,
    title: 'Map Workspace',
    description: 'Manage geographic polygons and tactical objects on an interactive map',
  } satisfies IMapRouteHandle,
}

// Route tree exported by map module
export const mapRoutes: RouteObject[] = [
  {
    path: MapRoutePath.ROOT,
    handle: { isPublic: true } satisfies IMapRouteHandle,
    children: [mapWorkspaceRoute],
  },
]
