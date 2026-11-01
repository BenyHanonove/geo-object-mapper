// Core React ecosystem library imports
import { Fragment, useMemo } from 'react'

// Material UI components and styling imports
import MyLocationRoundedIcon from '@mui/icons-material/MyLocationRounded'
import { Box, IconButton, Paper, Stack, Tooltip, Typography, useTheme } from '@mui/material'
import { alpha } from '@mui/material/styles'

// Leaflet mapping library and styles imports
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  CircleMarker,
  MapContainer,
  Marker,
  Polygon,
  Polyline,
  TileLayer,
  Tooltip as LeafletTooltip,
} from 'react-leaflet'

// Map feature module implementation imports
import {
  DEFAULT_MAP_TILE_SOURCE,
  MAP_MIN_ZOOM,
  MAP_PANEL_COPY,
  MAP_WORLD_BOUNDS,
} from '@map/constants/map.constants'
import { buildObjectDivIcon } from '@map/utils/leafletIcons.utils'

// Object feature module implementation imports
import { OBJECT_SYMBOL_LABEL_MAP } from '@objects/constants/object.constants'
import { useGeoObjectCrud } from '@objects/hooks/geoObject.crud'

// Typed application environment configuration imports
import { env } from '@plugins'

// Polygon feature module implementation imports
import { usePolygonCrud } from '@polygons/hooks/polygon.crud'

// Shared application components and services imports
import { AppCard, StatusChip } from '@shared/components'
import {
  formatCoordinate,
  geoJsonPointToLatLon,
  geoJsonPolygonToVertices,
} from '@shared/utils/geo.utils'

// Global Zustand stores and helpers imports
import { useGeoObjectsStore, useMapWorkspaceStore, usePolygonsStore } from '@stores'

// Local sibling module and definition imports
import { MapCanvasController } from './MapCanvasController'
import { MapCursorStrip } from './MapCursorStrip'
import { PolygonVertexHandles } from './PolygonVertexHandles'

// Leaflet map rendering polygons and objects
export function MapPanel() {
  const theme = useTheme()
  const mapTokens = theme.mapTokens

  const savedPolygons = usePolygonsStore((s) => s.items)
  const draftPolygons = usePolygonsStore((s) => s.draftPolygons)
  const isDrawing = usePolygonsStore((s) => s.isDrawing)
  const activeVertices = usePolygonsStore((s) => s.activeVertices)
  const activeColor = usePolygonsStore((s) => s.activeColor)
  const { editablePolygon, handleClosePolygon, handleMoveVertex } = usePolygonCrud()

  const savedObjects = useGeoObjectsStore((s) => s.items)
  const draftObjects = useGeoObjectsStore((s) => s.draftObjects)
  const isPlacing = useGeoObjectsStore((s) => s.isPlacing)
  const activeSymbol = useGeoObjectsStore((s) => s.activeSymbol)
  const { handleMove } = useGeoObjectCrud()

  const selection = useMapWorkspaceStore((s) => s.selection)
  const selectOnMap = useMapWorkspaceStore((s) => s.selectOnMap)
  const flyTo = useMapWorkspaceStore((s) => s.flyTo)

  const isInteractiveToolActive = isDrawing || isPlacing

  const modeChip = useMemo(() => {
    if (isDrawing) {
      return <StatusChip label="Drawing Polygon" color="secondary" />
    }
    if (isPlacing) {
      return (
        <StatusChip
          label={`Placing ${OBJECT_SYMBOL_LABEL_MAP[activeSymbol]}`}
          color="secondary"
        />
      )
    }
    return <StatusChip label="Interactive" variant="outlined" />
  }, [isDrawing, isPlacing, activeSymbol])

  const bannerMessage = useMemo(() => {
    if (isDrawing) {
      return activeVertices.length >= 3
        ? MAP_PANEL_COPY.DRAWING_HINT_CLOSEABLE
        : MAP_PANEL_COPY.DRAWING_HINT_INITIAL
    }
    if (isPlacing) {
      return MAP_PANEL_COPY.PLACING_OBJECT_HINT(OBJECT_SYMBOL_LABEL_MAP[activeSymbol])
    }
    return null
  }, [isDrawing, activeVertices.length, isPlacing, activeSymbol])

  return (
    <AppCard
      stepNumber={1}
      title="Map"
      fillHeight
      noBodyPadding
      headerAction={
        <Stack direction="row" spacing={1} alignItems="center">
          {modeChip}
          <Tooltip title="Reset camera to Gush Dan (Tel Aviv)">
            <IconButton
              size="small"
              aria-label="Center map on Tel Aviv area"
              onClick={() => flyTo(env.map.defaultLat, env.map.defaultLon, env.map.defaultZoom)}
            >
              <MyLocationRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      }
      sx={{ minBlockSize: { xs: 440, lg: 0 } }}
    >
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          flex: '1 1 0%',
          minBlockSize: { xs: 380, lg: 0 },
          inlineSize: '100%',
        }}
      >
        {/* Floating instructional banner when drawing or placing */}
        {bannerMessage && (
          <Paper
            sx={{
              position: 'absolute',
              insetBlockStart: 12,
              insetInline: 12,
              mx: 'auto',
              maxInlineSize: 520,
              zIndex: 500,
              px: 2,
              py: 1,
              bgcolor: (t) => alpha(t.palette.background.paper, 0.94),
              backdropFilter: 'blur(8px)',
              boxShadow: 2,
              pointerEvents: 'none',
              textAlign: 'center',
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              {bannerMessage}
            </Typography>
          </Paper>
        )}

        <Box sx={{ position: 'relative', flex: '1 1 0%', minBlockSize: 0, inlineSize: '100%' }}>
          <MapContainer
            center={[env.map.defaultLat, env.map.defaultLon]}
            zoom={env.map.defaultZoom}
            minZoom={MAP_MIN_ZOOM}
            maxBounds={MAP_WORLD_BOUNDS}
            maxBoundsViscosity={1}
            scrollWheelZoom
            style={{ position: 'absolute', inset: 0 }}
          >
            <TileLayer
              url={DEFAULT_MAP_TILE_SOURCE.url}
              attribution={DEFAULT_MAP_TILE_SOURCE.attribution}
              noWrap
            />

            <MapCanvasController mapTokens={mapTokens} />

            {/* 1. Saved Polygons */}
            {(savedPolygons ?? []).map((polygon) => {
              const positions = geoJsonPolygonToVertices(polygon.geometry).map(
                (v) => [v.lat, v.lon] as [number, number],
              )
              const isSelected =
                selection?.kind === 'polygon' &&
                !selection.isDraft &&
                selection.id === polygon.id
              const baseStroke = polygon.color ?? mapTokens.polygonSavedStroke

              return (
                <Polygon
                  key={polygon.id}
                  positions={positions}
                  pathOptions={{
                    color: isSelected ? mapTokens.polygonSelectedStroke : baseStroke,
                    fillColor: isSelected ? mapTokens.polygonSelectedFill : baseStroke,
                    fillOpacity: isSelected ? 0.34 : 0.2,
                    weight: isSelected ? 3.5 : 2.5,
                  }}
                  eventHandlers={{
                    click(e) {
                      if (isInteractiveToolActive) return
                      L.DomEvent.stopPropagation(e)
                      selectOnMap({
                        kind: 'polygon',
                        id: polygon.id,
                        name: polygon.name,
                        isDraft: false,
                      })
                    },
                  }}
                >
                  <LeafletTooltip sticky>
                    <strong>{polygon.name}</strong>
                    <br />
                    Saved Polygon ({positions.length} vertices)
                  </LeafletTooltip>
                </Polygon>
              )
            })}

            {editablePolygon && !isPlacing && (
              <PolygonVertexHandles polygon={editablePolygon} onMoveVertex={handleMoveVertex} />
            )}

            {/* 2. Unsaved Draft Polygons */}
            {draftPolygons.map((draft) => {
              const positions = geoJsonPolygonToVertices(draft.geometry).map(
                (v) => [v.lat, v.lon] as [number, number],
              )
              const isSelected =
                selection?.kind === 'polygon' &&
                selection.isDraft &&
                selection.id === draft.tempId

              return (
                <Polygon
                  key={draft.tempId}
                  positions={positions}
                  pathOptions={{
                    color: isSelected ? mapTokens.polygonSelectedStroke : mapTokens.polygonDraftStroke,
                    fillColor: draft.color || mapTokens.polygonDraftFill,
                    fillOpacity: 0.26,
                    weight: 2.5,
                    dashArray: '7 5',
                  }}
                  eventHandlers={{
                    click(e) {
                      if (isInteractiveToolActive) return
                      L.DomEvent.stopPropagation(e)
                      selectOnMap({
                        kind: 'polygon',
                        id: draft.tempId,
                        name: draft.name,
                        isDraft: true,
                      })
                    },
                  }}
                >
                  <LeafletTooltip sticky>
                    <strong>{draft.name}</strong> (Unsaved — click Save)
                  </LeafletTooltip>
                </Polygon>
              )
            })}

            {/* 3. Active Polygon Drawing Vertices & Edges */}
            {isDrawing && activeVertices.length > 0 && (
              <Fragment>
                {activeVertices.length >= 2 && (
                  <Polyline
                    positions={activeVertices.map((v) => [v.lat, v.lon] as [number, number])}
                    pathOptions={{
                      color: activeColor || mapTokens.drawingLine,
                      weight: 3,
                    }}
                    interactive={false}
                  />
                )}
                {activeVertices.map((vertex, idx) => {
                  const isStartVertex = idx === 0
                  const canClose = isStartVertex && activeVertices.length >= 3

                  return (
                    <CircleMarker
                      key={`vertex-${idx}-${vertex.lat}-${vertex.lon}`}
                      center={[vertex.lat, vertex.lon]}
                      radius={canClose ? 9 : isStartVertex ? 7 : 5}
                      pathOptions={{
                        color: mapTokens.vertexRingBg,
                        weight: 2.5,
                        fillColor: canClose
                          ? mapTokens.vertexStartReady
                          : activeColor || mapTokens.vertexDefault,
                        fillOpacity: 1,
                      }}
                      eventHandlers={
                        canClose
                          ? {
                              click(e) {
                                L.DomEvent.stopPropagation(e)
                                handleClosePolygon()
                              },
                            }
                          : undefined
                      }
                    >
                      {canClose && (
                        <LeafletTooltip direction="top" offset={[0, -8]}>
                          Click starting point to close polygon
                        </LeafletTooltip>
                      )}
                    </CircleMarker>
                  )
                })}
              </Fragment>
            )}

            {/* 4. Saved GeoObjects (Markers, Jeeps, Radars, Drones) */}
            {(savedObjects ?? []).map((obj) => {
              const point = geoJsonPointToLatLon(obj.geometry)
              const isSelected =
                selection?.kind === 'object' &&
                !selection.isDraft &&
                selection.id === obj.id
              const icon = buildObjectDivIcon({
                symbolType: obj.symbolType,
                tokens: mapTokens,
                isSelected,
                isDraft: false,
              })

              return (
                <Marker
                  key={obj.id}
                  position={[point.lat, point.lon]}
                  icon={icon}
                  draggable={isSelected && !isInteractiveToolActive}
                  bubblingMouseEvents
                  eventHandlers={{
                    dragend(e) {
                      const marker = e.target as L.Marker
                      const { lat, lng } = marker.getLatLng()
                      // The store moves the marker once the server accepts the change
                      marker.setLatLng([point.lat, point.lon])
                      void handleMove(obj.id, { lat, lon: lng })
                    },
                    click(e) {
                      if (isInteractiveToolActive) return
                      L.DomEvent.stopPropagation(e)
                      selectOnMap({
                        kind: 'object',
                        id: obj.id,
                        name: obj.name,
                        isDraft: false,
                      })
                    },
                  }}
                >
                  <LeafletTooltip direction="top">
                    <strong>{obj.name}</strong> ({OBJECT_SYMBOL_LABEL_MAP[obj.symbolType]})
                    <br />
                    {formatCoordinate(point.lat, 4)}, {formatCoordinate(point.lon, 4)}
                  </LeafletTooltip>
                </Marker>
              )
            })}

            {/* 5. Unsaved Draft GeoObjects */}
            {draftObjects.map((draft) => {
              const point = geoJsonPointToLatLon(draft.geometry)
              const isSelected =
                selection?.kind === 'object' &&
                selection.isDraft &&
                selection.id === draft.tempId
              const icon = buildObjectDivIcon({
                symbolType: draft.symbolType,
                tokens: mapTokens,
                isSelected,
                isDraft: true,
              })

              return (
                <Marker
                  key={draft.tempId}
                  position={[point.lat, point.lon]}
                  icon={icon}
                  bubblingMouseEvents
                  eventHandlers={{
                    click(e) {
                      if (isInteractiveToolActive) return
                      L.DomEvent.stopPropagation(e)
                      selectOnMap({
                        kind: 'object',
                        id: draft.tempId,
                        name: draft.name,
                        isDraft: true,
                      })
                    },
                  }}
                >
                  <LeafletTooltip direction="top">
                    <strong>{draft.name}</strong> (Unsaved — click Save)
                  </LeafletTooltip>
                </Marker>
              )
            })}
          </MapContainer>
        </Box>

        {/* Bottom Map Coordinate Telemetry Strip */}
        <MapCursorStrip />
      </Box>
    </AppCard>
  )
}
