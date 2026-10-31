// Local type and interface definition imports
import type { GeoPosition, IGeoJsonPoint, IGeoJsonPolygon, ILatLon } from '@shared/types/geojson.types'

// Keep value inside an inclusive range
const clamp = (value: number, limit: number): number => Math.min(Math.max(value, -limit), limit)

// Convert lat lon to GeoJSON position inside the valid world range
export const latLonToGeoPosition = (point: ILatLon): GeoPosition => [
  Number(clamp(point.lon, 180).toFixed(6)),
  Number(clamp(point.lat, 90).toFixed(6)),
]

// Compare points at stored coordinate precision
export const isSameLatLon = (a: ILatLon, b: ILatLon): boolean => {
  const [aLon, aLat] = latLonToGeoPosition(a)
  const [bLon, bLat] = latLonToGeoPosition(b)
  return aLon === bLon && aLat === bLat
}

// Convert GeoJSON position to lat lon
export const geoPositionToLatLon = (position: GeoPosition): ILatLon => ({
  lon: position[0],
  lat: position[1],
})

// Create GeoJSON point from lat lon
export const createGeoJsonPoint = (point: ILatLon): IGeoJsonPoint => ({
  type: 'Point',
  coordinates: latLonToGeoPosition(point),
})

// Extract lat lon from GeoJSON point
export const geoJsonPointToLatLon = (point: IGeoJsonPoint): ILatLon =>
  geoPositionToLatLon(point.coordinates)

// Builds a valid RFC 7946 closed linear ring (first and last positions match)
export const verticesToClosedGeoJsonPolygon = (vertices: ILatLon[]): IGeoJsonPolygon => {
  const ring = vertices.map(latLonToGeoPosition)
  if (ring.length > 0) {
    const [firstLon, firstLat] = ring[0]
    const [lastLon, lastLat] = ring[ring.length - 1]
    if (firstLon !== lastLon || firstLat !== lastLat) {
      ring.push([firstLon, firstLat])
    }
  }
  return {
    type: 'Polygon',
    coordinates: [ring],
  }
}

// Extracts open vertices (without the duplicate closing vertex) for map rendering
export const geoJsonPolygonToVertices = (polygon: IGeoJsonPolygon): ILatLon[] => {
  const outerRing = polygon.coordinates[0] ?? []
  if (outerRing.length === 0) return []

  const vertices = outerRing.map(geoPositionToLatLon)
  if (vertices.length > 1) {
    const first = vertices[0]
    const last = vertices[vertices.length - 1]
    if (first.lat === last.lat && first.lon === last.lon) {
      return vertices.slice(0, -1)
    }
  }
  return vertices
}

// Computes planar area-weighted centroid (falling back to vertex average if collinear)
export const computePolygonCentroid = (polygon: IGeoJsonPolygon): ILatLon => {
  const vertices = geoJsonPolygonToVertices(polygon)
  if (vertices.length === 0) return { lat: 0, lon: 0 }
  if (vertices.length < 3) {
    const sum = vertices.reduce(
      (acc, v) => ({ lat: acc.lat + v.lat, lon: acc.lon + v.lon }),
      { lat: 0, lon: 0 },
    )
    return { lat: sum.lat / vertices.length, lon: sum.lon / vertices.length }
  }

  let twiceSignedArea = 0
  let centroidLon = 0
  let centroidLat = 0

  for (let i = 0; i < vertices.length; i += 1) {
    const current = vertices[i]
    const next = vertices[(i + 1) % vertices.length]
    const cross = current.lon * next.lat - next.lon * current.lat
    twiceSignedArea += cross
    centroidLon += (current.lon + next.lon) * cross
    centroidLat += (current.lat + next.lat) * cross
  }

  if (Math.abs(twiceSignedArea) < 1e-10) {
    const sum = vertices.reduce(
      (acc, v) => ({ lat: acc.lat + v.lat, lon: acc.lon + v.lon }),
      { lat: 0, lon: 0 },
    )
    return { lat: sum.lat / vertices.length, lon: sum.lon / vertices.length }
  }

  const factor = 1 / (3 * twiceSignedArea)
  return {
    lat: centroidLat * factor,
    lon: centroidLon * factor,
  }
}

// Format coordinate to fixed decimal digits
export const formatCoordinate = (value: number, fractionDigits = 5): string =>
  value.toFixed(fractionDigits)

// Approximate geodesic area in square kilometers using equirectangular projection
export const calculatePolygonAreaKm2 = (polygon: IGeoJsonPolygon): number => {
  const vertices = geoJsonPolygonToVertices(polygon)
  if (vertices.length < 3) return 0

  const earthRadiusKm = 6371
  const meanLatRad =
    (vertices.reduce((sum, v) => sum + v.lat, 0) / vertices.length) * (Math.PI / 180)

  let shoelaceSum = 0
  for (let i = 0; i < vertices.length; i += 1) {
    const p1 = vertices[i]
    const p2 = vertices[(i + 1) % vertices.length]
    const x1 = p1.lon * (Math.PI / 180) * earthRadiusKm * Math.cos(meanLatRad)
    const y1 = p1.lat * (Math.PI / 180) * earthRadiusKm
    const x2 = p2.lon * (Math.PI / 180) * earthRadiusKm * Math.cos(meanLatRad)
    const y2 = p2.lat * (Math.PI / 180) * earthRadiusKm
    shoelaceSum += x1 * y2 - x2 * y1
  }

  return Math.abs(shoelaceSum) / 2
}
