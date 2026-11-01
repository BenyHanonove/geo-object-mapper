// Zustand state management library imports
import { create } from 'zustand'

// Application theme design token imports
import { POLYGON_SWATCH_TOKENS } from '@plugins'

// Global Zustand stores and helpers imports
import { createEntityStore, nextAvailableName, sortByLocale } from '@stores/utils/createEntityStore'

// Shared application components and services imports
import { isSameLatLon, verticesToClosedGeoJsonPolygon } from '@shared/utils/geo.utils'

// Local type and interface definition imports
import type { IEntityState } from '@stores/utils/createEntityStore'
import type { IDraftPolygon, IPolygon } from '@polygons/types/IPolygon.types'
import type { ILatLon } from '@shared/types/geojson.types'

// Entity state plus polygon drawing drafts
export interface IPolygonsState extends IEntityState<IPolygon> {
  isDrawing: boolean
  pendingName: string
  activeColor: string
  activeVertices: ILatLon[]
  draftPolygons: IDraftPolygon[]
  isSaving: boolean
  isDeleting: boolean
  isUpdating: boolean
  startDrawing: () => void
  cancelDrawing: () => void
  setPendingName: (name: string) => void
  setActiveColor: (color: string) => void
  appendVertex: (point: ILatLon) => void
  undoVertex: () => void
  closeActivePolygon: () => IDraftPolygon | null
  removeDraftPolygon: (tempId: string) => void
  removeDraftPolygons: (tempIds: string[]) => void
  clearDraftPolygons: () => void
  setIsSaving: (isSaving: boolean) => void
  setIsDeleting: (isDeleting: boolean) => void
  setIsUpdating: (isUpdating: boolean) => void
}

// Generate temporary id for draft polygons
const makeTempPolygonId = (): string =>
  `draft-poly-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`

// Zustand store for saved and draft polygons
export const usePolygonsStore = create<IPolygonsState>()((...a) => {
  const [set, get] = a
  const entitySlice = createEntityStore<IPolygon>(sortByLocale((p) => p.name))(...a)

  return {
    ...entitySlice,
    isDrawing: false,
    pendingName: '',
    activeColor: POLYGON_SWATCH_TOKENS[0],
    activeVertices: [],
    draftPolygons: [],
    isSaving: false,
    isDeleting: false,
    isUpdating: false,
    startDrawing: () => set({ isDrawing: true, activeVertices: [] }),
    cancelDrawing: () => set({ isDrawing: false, activeVertices: [] }),
    setPendingName: (pendingName) => set({ pendingName }),
    setActiveColor: (activeColor) => set({ activeColor }),
    appendVertex: (point) =>
      set((state) => {
        const lastVertex = state.activeVertices[state.activeVertices.length - 1]
        if (lastVertex && isSameLatLon(lastVertex, point)) return state
        return { activeVertices: [...state.activeVertices, point] }
      }),
    undoVertex: () =>
      set((state) => ({
        activeVertices: state.activeVertices.slice(0, -1),
      })),
    closeActivePolygon: () => {
      const state = get()
      if (state.activeVertices.length < 3) return null

      const nextIndex = (state.items?.length ?? 0) + state.draftPolygons.length + 1
      const trimmedName = state.pendingName.trim()
      const takenNames = [...(state.items ?? []), ...state.draftPolygons].map((p) => p.name)
      const resolvedName = trimmedName || nextAvailableName('Polygon', nextIndex, takenNames)
      const nextSwatchIndex = nextIndex % POLYGON_SWATCH_TOKENS.length

      const draft: IDraftPolygon = {
        tempId: makeTempPolygonId(),
        name: resolvedName,
        color: state.activeColor,
        geometry: verticesToClosedGeoJsonPolygon(state.activeVertices),
      }

      set({
        isDrawing: false,
        activeVertices: [],
        pendingName: '',
        activeColor: POLYGON_SWATCH_TOKENS[nextSwatchIndex],
        draftPolygons: [...state.draftPolygons, draft],
      })

      return draft
    },
    removeDraftPolygon: (tempId) =>
      set((state) => ({
        draftPolygons: state.draftPolygons.filter((d) => d.tempId !== tempId),
      })),
    removeDraftPolygons: (tempIds) =>
      set((state) => ({
        draftPolygons: state.draftPolygons.filter((d) => !tempIds.includes(d.tempId)),
      })),
    clearDraftPolygons: () => set({ draftPolygons: [] }),
    setIsSaving: (isSaving) => set({ isSaving }),
    setIsDeleting: (isDeleting) => set({ isDeleting }),
    setIsUpdating: (isUpdating) => set({ isUpdating }),
    reset: () => {
      entitySlice.reset()
      set({
        isDrawing: false,
        activeVertices: [],
        draftPolygons: [],
        pendingName: '',
        isSaving: false,
        isDeleting: false,
        isUpdating: false,
      })
    },
  }
})
