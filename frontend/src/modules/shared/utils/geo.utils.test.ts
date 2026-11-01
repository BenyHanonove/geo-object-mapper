// Unit test framework imports
import { describe, expect, it } from 'vitest'

// Local sibling module and definition imports
import {
  computePolygonCentroid,
  geoJsonPolygonToVertices,
  isSameLatLon,
  latLonToGeoPosition,
  verticesToClosedGeoJsonPolygon,
} from './geo.utils'

// Unit square shared across the tests
const SQUARE = [
  { lat: 0, lon: 0 },
  { lat: 0, lon: 2 },
  { lat: 2, lon: 2 },
  { lat: 2, lon: 0 },
]

describe('geo.utils', () => {
  it('writes positions in GeoJSON [lon, lat] order', () => {
    expect(latLonToGeoPosition({ lat: 32.1, lon: 34.8 })).toEqual([34.8, 32.1])
  })

  it('keeps positions inside the valid world range', () => {
    expect(latLonToGeoPosition({ lat: 95, lon: 199.5 })).toEqual([180, 90])
    expect(latLonToGeoPosition({ lat: -95, lon: -199.5 })).toEqual([-180, -90])
  })

  it('closes the ring by repeating the first vertex', () => {
    const [ring] = verticesToClosedGeoJsonPolygon(SQUARE).coordinates

    expect(ring).toHaveLength(5)
    expect(ring[4]).toEqual(ring[0])
  })

  it('does not duplicate the closing vertex of a closed ring', () => {
    const [ring] = verticesToClosedGeoJsonPolygon([...SQUARE, SQUARE[0]]).coordinates

    expect(ring).toHaveLength(5)
  })

  it('round-trips vertices without the closing vertex', () => {
    const polygon = verticesToClosedGeoJsonPolygon(SQUARE)

    expect(geoJsonPolygonToVertices(polygon)).toEqual(SQUARE)
  })

  it('finds the centroid of a polygon', () => {
    const centroid = computePolygonCentroid(verticesToClosedGeoJsonPolygon(SQUARE))

    expect(centroid.lat).toBeCloseTo(1)
    expect(centroid.lon).toBeCloseTo(1)
  })

  it('treats points equal at stored precision as the same point', () => {
    expect(isSameLatLon({ lat: 1.00000001, lon: 2 }, { lat: 1.00000002, lon: 2 })).toBe(true)
    expect(isSameLatLon({ lat: 1.1, lon: 2 }, { lat: 1.2, lon: 2 })).toBe(false)
  })
})
