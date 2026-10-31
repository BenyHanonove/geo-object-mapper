// RFC 7946 GeoJSON coordinate tuple: [longitude, latitude]
export type GeoPosition = [number, number]

// Plain latitude and longitude map point
export interface ILatLon {
  lat: number
  lon: number
}

// GeoJSON point geometry object shape
export interface IGeoJsonPoint {
  type: 'Point'
  coordinates: GeoPosition
}

// GeoJSON polygon geometry object shape
export interface IGeoJsonPolygon {
  type: 'Polygon'
  coordinates: GeoPosition[][]
}
