// User feedback messages for polygon actions
export const POLYGON_MESSAGES = {
  DRAWING_STARTED:
    'Polygon drawing active: click map to place vertices, then click the green starting point to close.',
  DRAWING_CANCELLED: 'Polygon drawing cancelled.',
  MIN_VERTICES_REQUIRED: 'Place at least 3 vertices on the map before closing a polygon.',
  POLYGON_CLOSED_DRAFT: 'Polygon closed on map. Click Save to persist to MongoDB & update Map Data.',
  NOTHING_TO_SAVE: 'No unsaved polygons to save. Click Add and draw a polygon on the map first.',
  SAVED_FALLBACK: 'Polygons saved and Map Data updated.',
  DRAFT_REMOVED: 'Unsaved draft polygon removed from map.',
  DELETED_FALLBACK: 'Polygon deleted from map and database.',
  DELETED_ALL_FALLBACK: 'All polygons deleted from map and database.',
  NO_POLYGONS_TO_DELETE: 'No polygons available to delete.',
  UPDATED_FALLBACK: 'Polygon updated.',
  RESHAPE_HINT: 'Drag a vertex on the map to reshape the polygon.',
} as const
