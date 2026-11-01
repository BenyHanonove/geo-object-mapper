// Local type and interface definition imports
import type { IGeoJsonPolygon } from '@shared/types/geojson.types'

// Payload for creating a polygon
export interface ICreatePolygon {
  name: string
  color?: string
  geometry: IGeoJsonPolygon
}

// Partial payload for updating a polygon
export interface IUpdatePolygon extends Partial<ICreatePolygon> {
  id: string
  timestamp: string
}

// Persisted polygon returned by API
export interface IPolygon extends ICreatePolygon {
  id: string
  timestamp: string
}

// Unsaved polygon drawn on map
export interface IDraftPolygon {
  tempId: string
  name: string
  color: string
  geometry: IGeoJsonPolygon
}
