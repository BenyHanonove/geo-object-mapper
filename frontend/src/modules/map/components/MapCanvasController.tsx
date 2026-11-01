// Core React ecosystem library imports
import { useEffect, useState } from 'react'

// Leaflet mapping library and styles imports
import { Polyline, useMap, useMapEvents } from 'react-leaflet'

// Map feature module implementation imports
import { START_VERTEX_SNAP_PX } from '@map/constants/map.constants'

// Object feature module implementation imports
import { useGeoObjectCrud } from '@objects/hooks/geoObject.crud'

// Polygon feature module implementation imports
import { usePolygonCrud } from '@polygons/hooks/polygon.crud'

// Global Zustand stores and helpers imports
import { useMapWorkspaceStore } from '@stores'

// Local type and interface definition imports
import type { IMapThemeTokens } from '@plugins'
import type { ILatLon } from '@shared/types/geojson.types'

// Props for the map canvas controller
interface IMapCanvasControllerProps {
  mapTokens: IMapThemeTokens
}

// Handle map clicks, hotkeys and camera
export function MapCanvasController({ mapTokens }: IMapCanvasControllerProps) {
  const map = useMap()
  const [hoverPoint, setHoverPoint] = useState<ILatLon | null>(null)

  const {
    isDrawing,
    activeVertices,
    cancelDrawing,
    handleAddVertex,
    handleClosePolygon,
  } = usePolygonCrud()

  const { isPlacing, stopPlacing, handlePlaceOnMap } = useGeoObjectCrud()

  const flyToTarget = useMapWorkspaceStore((s) => s.flyToTarget)
  const setCursorLatLon = useMapWorkspaceStore((s) => s.setCursorLatLon)
  const clearSelection = useMapWorkspaceStore((s) => s.clearSelection)

  // Keep Leaflet tile layout synced with Flexbox container resizes
  useEffect(() => {
    const container = map.getContainer()
    const observer = new ResizeObserver(() => {
      map.invalidateSize()
    })
    observer.observe(container)
    return () => {
      observer.disconnect()
    }
  }, [map])

  // Update map cursor based on active tool mode
  useEffect(() => {
    const container = map.getContainer()
    container.style.cursor = isDrawing || isPlacing ? 'crosshair' : ''
    return () => {
      container.style.cursor = ''
    }
  }, [map, isDrawing, isPlacing])

  // Double click must not zoom while drawing
  useEffect(() => {
    if (!isDrawing) return
    map.doubleClickZoom.disable()
    return () => {
      map.doubleClickZoom.enable()
    }
  }, [map, isDrawing])

  // Escape key cancels active drawing or placement mode
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isDrawing) cancelDrawing()
        if (isPlacing) stopPlacing()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isDrawing, isPlacing, cancelDrawing, stopPlacing])

  // Smooth camera flyTo when selecting an item from the Map Data table
  useEffect(() => {
    if (!flyToTarget) return
    map.flyTo([flyToTarget.lat, flyToTarget.lon], flyToTarget.zoom ?? Math.max(map.getZoom(), 12), {
      duration: 0.7,
    })
  }, [map, flyToTarget])

  useMapEvents({
    mousemove(event) {
      const point: ILatLon = { lat: event.latlng.lat, lon: event.latlng.lng }
      setCursorLatLon(point)
      if (isDrawing) {
        setHoverPoint(point)
      }
    },
    mouseout() {
      setCursorLatLon(null)
      setHoverPoint(null)
    },
    click(event) {
      const clickedPoint: ILatLon = { lat: event.latlng.lat, lon: event.latlng.lng }

      if (isDrawing) {
        if (activeVertices.length >= 3) {
          const startVertex = activeVertices[0]
          const startPx = map.latLngToContainerPoint([startVertex.lat, startVertex.lon])
          const clickPx = map.latLngToContainerPoint(event.latlng)
          if (startPx.distanceTo(clickPx) <= START_VERTEX_SNAP_PX) {
            setHoverPoint(null)
            handleClosePolygon()
            return
          }
        }
        handleAddVertex(clickedPoint)
        return
      }

      if (isPlacing) {
        handlePlaceOnMap(clickedPoint)
        return
      }

      clearSelection()
    },
  })

  if (!isDrawing || activeVertices.length === 0 || !hoverPoint) {
    return null
  }

  const lastVertex = activeVertices[activeVertices.length - 1]

  return (
    <Polyline
      positions={[
        [lastVertex.lat, lastVertex.lon],
        [hoverPoint.lat, hoverPoint.lon],
      ]}
      pathOptions={{
        color: mapTokens.drawingLine,
        weight: 2,
        dashArray: '6 6',
        opacity: 0.85,
      }}
      interactive={false}
    />
  )
}
