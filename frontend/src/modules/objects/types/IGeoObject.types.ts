// Local type and interface definition imports
import type { IGeoJsonPoint } from '@shared/types/geojson.types'

// Supported map object symbol types
export const ObjectSymbolType = {
  MARKER: 'marker',
  JEEP: 'jeep',
  RADAR: 'radar',
  DRONE: 'drone',
} as const

// Union of supported symbol type values
export type ObjectSymbolType = (typeof ObjectSymbolType)[keyof typeof ObjectSymbolType]

// Payload for creating a geo object
export interface ICreateGeoObject {
  name: string
  symbolType: ObjectSymbolType
  geometry: IGeoJsonPoint
}

// Partial payload for updating geo object
export interface IUpdateGeoObject extends Partial<ICreateGeoObject> {
  id: string
  timestamp: string
}

// Persisted geo object returned by API
export interface IGeoObject extends ICreateGeoObject {
  id: string
  timestamp: string
}

// Unsaved geo object placed on map
export interface IDraftGeoObject {
  tempId: string
  name: string
  symbolType: ObjectSymbolType
  geometry: IGeoJsonPoint
}
