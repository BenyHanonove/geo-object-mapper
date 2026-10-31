// Core React ecosystem library imports
import type { RouteObject } from 'react-router'

// Metadata carried by a route handle
export interface IRouteHandle {
  isPublic?: boolean
  guestOnly?: boolean
  title?: string
  description?: string
}

// Shape of an auto-discovered feature module
export interface IDiscoveredModule {
  routes?: RouteObject[]
}
