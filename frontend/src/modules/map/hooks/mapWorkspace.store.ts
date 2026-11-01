// Zustand state management library imports
import { create } from 'zustand'

// Local type and interface definition imports
import type {
  IFlyToTarget,
  IMapSelection,
  MapEntityKind,
  WorkspacePanel,
} from '@map/types/IMapWorkspace.types'
import type { ILatLon } from '@shared/types/geojson.types'

// Panel holding the controls of each entity kind
const ENTITY_PANELS: Record<MapEntityKind, WorkspacePanel> = {
  polygon: 'polygons',
  object: 'objects',
}

// State and actions of map workspace
export interface IMapWorkspaceState {
  selection: IMapSelection | null
  flyToTarget: IFlyToTarget | null
  cursorLatLon: ILatLon | null
  activePanel: WorkspacePanel | null
  selectOnMap: (selection: IMapSelection) => void
  clearSelection: () => void
  clearSelectionOf: (kind: MapEntityKind, ids?: string[]) => void
  renameSelection: (id: string, name: string) => void
  flyTo: (lat: number, lon: number, zoom?: number) => void
  setCursorLatLon: (point: ILatLon | null) => void
  togglePanel: (panel: WorkspacePanel) => void
  reset: () => void
}

// Zustand store for selection and camera
export const useMapWorkspaceStore = create<IMapWorkspaceState>()((set) => ({
  selection: null,
  flyToTarget: null,
  cursorLatLon: null,
  activePanel: 'polygons',
  selectOnMap: (selection) => set({ selection, activePanel: ENTITY_PANELS[selection.kind] }),
  clearSelection: () => set({ selection: null }),
  clearSelectionOf: (kind, ids) =>
    set((state) => {
      const current = state.selection
      const matches = current?.kind === kind && (!ids || ids.includes(current.id))
      return matches ? { selection: null } : state
    }),
  renameSelection: (id, name) =>
    set((state) =>
      state.selection?.id === id ? { selection: { ...state.selection, name } } : state,
    ),
  flyTo: (lat, lon, zoom) =>
    set((state) => ({
      flyToTarget: {
        lat,
        lon,
        zoom,
        nonce: (state.flyToTarget?.nonce ?? 0) + 1,
      },
    })),
  setCursorLatLon: (cursorLatLon) => set({ cursorLatLon }),
  togglePanel: (panel) =>
    set((state) => ({ activePanel: state.activePanel === panel ? null : panel })),
  reset: () =>
    set({ selection: null, flyToTarget: null, cursorLatLon: null, activePanel: 'polygons' }),
}))
