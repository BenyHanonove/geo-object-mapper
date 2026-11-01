// Pixel radius snapping click to start
export const START_VERTEX_SNAP_PX = 16

// Map shows one world, never repeated copies
export const MAP_MIN_ZOOM = 2
export const MAP_WORLD_BOUNDS: [[number, number], [number, number]] = [
  [-85, -180],
  [85, 180],
]

// Default street map tile source
export const DEFAULT_MAP_TILE_SOURCE = {
  url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
  attribution: 'Tiles &copy; Esri &mdash; OpenStreetMap contributors, GIS User Community',
} as const

// Hint and empty state copy text
export const MAP_PANEL_COPY = {
  DRAWING_HINT_INITIAL: 'Click anywhere on the map to place polygon vertices (minimum 3).',
  DRAWING_HINT_CLOSEABLE:
    'Click the green starting vertex to close the polygon, or continue adding vertices.',
  PLACING_OBJECT_HINT: (symbolLabel: string) =>
    `Click anywhere on the map to drop a ${symbolLabel}. Click Save in Panel 3 when finished.`,
  LOAD_ERROR_TITLE: 'Could not load map data',
  RETRY_LABEL: 'Retry',
  NO_MATCHES_TITLE: (query: string) => `No results for "${query}"`,
  NO_MATCHES_DESC: 'Try a different name, type or coordinate.',
  EMPTY_TABLE_TITLE: 'No saved geographic data',
  EMPTY_TABLE_DESC:
    'Draw a polygon or add map objects and click Save to populate the Map Data table.',
} as const
