// Zustand state management library imports
import { create } from 'zustand'

// Object feature module implementation imports
import { OBJECT_SYMBOL_LABEL_MAP } from '@objects/constants/object.constants'
import { ObjectSymbolType } from '@objects/types/IGeoObject.types'

// Shared application components and services imports
import { createGeoJsonPoint } from '@shared/utils/geo.utils'

// Global Zustand stores and helpers imports
import { createEntityStore, nextAvailableName, sortByLocale } from '@stores/utils/createEntityStore'

// Local type and interface definition imports
import type { IDraftGeoObject, IGeoObject } from '@objects/types/IGeoObject.types'
import type { ILatLon } from '@shared/types/geojson.types'
import type { IEntityState } from '@stores/utils/createEntityStore'

// Entity state plus object placement drafts
export interface IGeoObjectsState extends IEntityState<IGeoObject> {
  isPlacing: boolean
  activeSymbol: ObjectSymbolType
  pendingName: string
  draftObjects: IDraftGeoObject[]
  isSaving: boolean
  isDeleting: boolean
  isUpdating: boolean
  startPlacing: (symbol?: ObjectSymbolType) => void
  stopPlacing: () => void
  setActiveSymbol: (symbol: ObjectSymbolType) => void
  setPendingName: (name: string) => void
  placeDraftObject: (point: ILatLon) => IDraftGeoObject
  removeDraftObject: (tempId: string) => void
  removeDraftObjects: (tempIds: string[]) => void
  clearDraftObjects: () => void
  setIsSaving: (isSaving: boolean) => void
  setIsDeleting: (isDeleting: boolean) => void
  setIsUpdating: (isUpdating: boolean) => void
}

// Generate temporary id for draft objects
const makeTempObjectId = (): string =>
  `draft-obj-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`

// Zustand store for saved and draft objects
export const useGeoObjectsStore = create<IGeoObjectsState>()((...a) => {
  const [set, get] = a
  const entitySlice = createEntityStore<IGeoObject>(sortByLocale((o) => o.name))(...a)

  return {
    ...entitySlice,
    isPlacing: false,
    activeSymbol: ObjectSymbolType.MARKER,
    pendingName: '',
    draftObjects: [],
    isSaving: false,
    isDeleting: false,
    isUpdating: false,
    startPlacing: (symbol) =>
      set((state) => ({
        isPlacing: true,
        activeSymbol: symbol ?? state.activeSymbol,
      })),
    stopPlacing: () => set({ isPlacing: false }),
    setActiveSymbol: (activeSymbol) => set({ activeSymbol }),
    setPendingName: (pendingName) => set({ pendingName }),
    placeDraftObject: (point) => {
      const state = get()
      const symbol = state.activeSymbol
      const sameSymbolSaved = (state.items ?? []).filter((o) => o.symbolType === symbol).length
      const sameSymbolDraft = state.draftObjects.filter((o) => o.symbolType === symbol).length
      const nextNum = sameSymbolSaved + sameSymbolDraft + 1
      const takenNames = [...(state.items ?? []), ...state.draftObjects].map((o) => o.name)
      const customTrimmed = state.pendingName.trim()
      const resolvedName =
        customTrimmed || nextAvailableName(OBJECT_SYMBOL_LABEL_MAP[symbol], nextNum, takenNames)

      const draft: IDraftGeoObject = {
        tempId: makeTempObjectId(),
        name: resolvedName,
        symbolType: symbol,
        geometry: createGeoJsonPoint(point),
      }

      set({
        pendingName: '',
        draftObjects: [...state.draftObjects, draft],
      })

      return draft
    },
    removeDraftObject: (tempId) =>
      set((state) => ({
        draftObjects: state.draftObjects.filter((d) => d.tempId !== tempId),
      })),
    removeDraftObjects: (tempIds) =>
      set((state) => ({
        draftObjects: state.draftObjects.filter((d) => !tempIds.includes(d.tempId)),
      })),
    clearDraftObjects: () => set({ draftObjects: [] }),
    setIsSaving: (isSaving) => set({ isSaving }),
    setIsDeleting: (isDeleting) => set({ isDeleting }),
    setIsUpdating: (isUpdating) => set({ isUpdating }),
    reset: () => {
      entitySlice.reset()
      set({
        isPlacing: false,
        activeSymbol: ObjectSymbolType.MARKER,
        pendingName: '',
        draftObjects: [],
        isSaving: false,
        isDeleting: false,
        isUpdating: false,
      })
    },
  }
})
