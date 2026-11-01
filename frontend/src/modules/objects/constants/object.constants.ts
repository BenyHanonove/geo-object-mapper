// Object feature module implementation imports
import { ObjectSymbolType } from '@objects/types/IGeoObject.types'

// Display metadata for one object symbol
export interface ISymbolDescriptor {
  type: ObjectSymbolType
  label: string
  shortPrefix: string
}

// Selectable symbol options for the panel
export const OBJECT_SYMBOL_OPTIONS: ISymbolDescriptor[] = [
  { type: ObjectSymbolType.MARKER, label: 'Marker', shortPrefix: 'Marker' },
  { type: ObjectSymbolType.JEEP, label: 'Jeep', shortPrefix: 'Jeep' },
  { type: ObjectSymbolType.RADAR, label: 'Radar', shortPrefix: 'Radar' },
  { type: ObjectSymbolType.DRONE, label: 'Drone', shortPrefix: 'Drone' },
]

// Display label for each symbol type
export const OBJECT_SYMBOL_LABEL_MAP: Record<ObjectSymbolType, string> = {
  [ObjectSymbolType.MARKER]: 'Marker',
  [ObjectSymbolType.JEEP]: 'Jeep',
  [ObjectSymbolType.RADAR]: 'Radar',
  [ObjectSymbolType.DRONE]: 'Drone',
}

// User feedback messages for object actions
export const OBJECT_MESSAGES = {
  PLACEMENT_STARTED: (label: string) =>
    `${label} placement active: click anywhere on the map to add objects, then click Save.`,
  PLACEMENT_STOPPED: 'Object placement mode exited.',
  OBJECT_PLACED_DRAFT: (name: string) =>
    `Placed "${name}" on map. Click Save to persist & update Map Data.`,
  NOTHING_TO_SAVE: 'No unsaved objects to save. Click Add and place an object on the map first.',
  SAVED_FALLBACK: 'Objects saved and Map Data updated.',
  DRAFT_REMOVED: 'Unsaved draft object removed from map.',
  DELETED_FALLBACK: 'Object deleted from map and database.',
  DELETED_ALL_FALLBACK: 'All objects deleted from map and database.',
  NO_OBJECTS_TO_DELETE: 'No objects available to delete.',
  UPDATED_FALLBACK: 'Object updated.',
  MOVE_HINT: 'Drag the selected object on the map to move it.',
} as const
