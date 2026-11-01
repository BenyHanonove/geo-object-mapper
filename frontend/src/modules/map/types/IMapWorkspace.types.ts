// Local type and interface definition imports
import type { ObjectSymbolType } from '@objects/types/IGeoObject.types'

// Entity kinds shown on the map
export type MapEntityKind = 'polygon' | 'object'

// Collapsible panels of the workspace column
export type WorkspacePanel = 'polygons' | 'objects'

// Currently selected polygon or object
export interface IMapSelection {
  kind: MapEntityKind
  id: string
  name: string
  isDraft: boolean
}

// Camera fly to request with nonce
export interface IFlyToTarget {
  lat: number
  lon: number
  zoom?: number
  nonce: number
}

// Single row of the data table
export interface IMapDataRow {
  id: string
  entityId: string
  kind: MapEntityKind
  object: string
  subtitle: string
  symbolType?: ObjectSymbolType
  polygonColor?: string
  lat: string
  lon: string
  rawLat: number
  rawLon: number
}
