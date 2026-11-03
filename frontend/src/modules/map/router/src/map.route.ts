import type { RouteObject } from 'react-router'
import { MapRoutePath } from './map.route.type'
import type { IMapRouteHandle } from './map.route.type'

export const mapWorkspaceRoute: RouteObject = {
  index: true,
  lazy: async () => ({
    Component: (await import('@map/views/MapWorkspaceView')).default,
  }),
  handle: {
    title: 'Map Workspace',
    description: 'Manage geographic polygons and tactical objects on an interactive map',
  } satisfies IMapRouteHandle,
}

export const mapRoutes: RouteObject[] = [
  {
    path: MapRoutePath.ROOT,
    children: [mapWorkspaceRoute],
  },
]
