// Core React ecosystem library imports
import { useMemo } from 'react'

// Object feature module implementation imports
import { OBJECT_SYMBOL_LABEL_MAP } from '@objects/constants/object.constants'

// Shared application components and services imports
import {
  calculatePolygonAreaKm2,
  computePolygonCentroid,
  formatCoordinate,
  geoJsonPointToLatLon,
  geoJsonPolygonToVertices,
} from '@shared/utils/geo.utils'

// Global Zustand stores and helpers imports
import { useGeoObjectsStore, usePolygonsStore } from '@stores'

// Local type and interface definition imports
import type { IMapDataRow } from '@map/types/IMapWorkspace.types'

// Derives unified Map Data rows (Object / Lat / Lon) strictly from saved server entities
export const useMapDataRows = (): {
  rows: IMapDataRow[]
  loading: boolean
  error: string | null
} => {
  const polygons = usePolygonsStore((s) => s.items)
  const polygonsLoading = usePolygonsStore((s) => s.loading)
  const polygonsError = usePolygonsStore((s) => s.error)
  const objects = useGeoObjectsStore((s) => s.items)
  const objectsLoading = useGeoObjectsStore((s) => s.loading)
  const objectsError = useGeoObjectsStore((s) => s.error)

  const rows = useMemo<IMapDataRow[]>(() => {
    const polygonRows: IMapDataRow[] = (polygons ?? []).map((polygon) => {
      const centroid = computePolygonCentroid(polygon.geometry)
      const verticesCount = geoJsonPolygonToVertices(polygon.geometry).length
      const areaKm2 = calculatePolygonAreaKm2(polygon.geometry)

      return {
        id: `polygon:${polygon.id}`,
        entityId: polygon.id,
        kind: 'polygon',
        object: polygon.name,
        subtitle: `Polygon · ${verticesCount} pts · ${areaKm2.toFixed(1)} km²`,
        polygonColor: polygon.color,
        lat: formatCoordinate(centroid.lat, 4),
        lon: formatCoordinate(centroid.lon, 4),
        rawLat: centroid.lat,
        rawLon: centroid.lon,
      }
    })

    const objectRows: IMapDataRow[] = (objects ?? []).map((geoObj) => {
      const latLon = geoJsonPointToLatLon(geoObj.geometry)
      const symbolLabel = OBJECT_SYMBOL_LABEL_MAP[geoObj.symbolType] ?? geoObj.symbolType

      return {
        id: `object:${geoObj.id}`,
        entityId: geoObj.id,
        kind: 'object',
        object: geoObj.name,
        subtitle: symbolLabel,
        symbolType: geoObj.symbolType,
        lat: formatCoordinate(latLon.lat, 4),
        lon: formatCoordinate(latLon.lon, 4),
        rawLat: latLon.lat,
        rawLon: latLon.lon,
      }
    })

    return [...objectRows, ...polygonRows]
  }, [polygons, objects])

  return {
    rows,
    loading: polygonsLoading || objectsLoading,
    error: polygonsError ?? objectsError,
  }
}
