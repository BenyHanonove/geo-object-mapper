// Core React ecosystem library imports
import { useMemo } from 'react'

// Material UI components and styling imports
import { useTheme } from '@mui/material'

// Leaflet mapping library and styles imports
import type L from 'leaflet'
import { Marker } from 'react-leaflet'

// Map feature module implementation imports
import { buildVertexDivIcon } from '@map/utils/leafletIcons.utils'

// Shared application components and services imports
import { geoJsonPolygonToVertices } from '@shared/utils/geo.utils'

// Local type and interface definition imports
import type { IPolygon } from '@polygons/types/IPolygon.types'
import type { ILatLon } from '@shared/types/geojson.types'

// Props for the polygon vertex handles
interface IPolygonVertexHandlesProps {
  polygon: IPolygon
  onMoveVertex: (id: string, index: number, point: ILatLon) => Promise<void>
}

// Draggable handles reshaping a saved polygon
export function PolygonVertexHandles({ polygon, onMoveVertex }: IPolygonVertexHandlesProps) {
  const mapTokens = useTheme().mapTokens
  const icon = useMemo(() => buildVertexDivIcon(mapTokens), [mapTokens])

  return geoJsonPolygonToVertices(polygon.geometry).map((vertex, index) => (
    <Marker
      key={`${polygon.id}-${index}`}
      position={[vertex.lat, vertex.lon]}
      icon={icon}
      draggable
      eventHandlers={{
        dragend(e) {
          const marker = e.target as L.Marker
          const { lat, lng } = marker.getLatLng()
          // The store moves the handle once the server accepts the change
          marker.setLatLng([vertex.lat, vertex.lon])
          void onMoveVertex(polygon.id, index, { lat, lon: lng })
        },
      }}
    />
  ))
}
