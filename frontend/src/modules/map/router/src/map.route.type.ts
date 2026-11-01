// Local type and interface definition imports
import type { IRouteHandle } from '@router'

// Path constants for map routes
export enum MapRoutePath {
  ROOT = '/',
}

// Route handle metadata for map pages
export interface IMapRouteHandle extends IRouteHandle {
  readonly isPublic: boolean
}
