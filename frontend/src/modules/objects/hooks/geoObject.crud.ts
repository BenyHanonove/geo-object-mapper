// Core React ecosystem library imports
import { useCallback, useState } from 'react'

// HTTP client and status code imports
import { StatusCodes } from 'http-status-codes'

// Object feature module implementation imports
import { OBJECT_MESSAGES, OBJECT_SYMBOL_LABEL_MAP } from '@objects/constants/object.constants'
import { geoObjectProvider } from '@objects/providers/geoObject.provider'

// Shared application components and services imports
import { useSnackbar } from '@shared/hooks/snackbar.store'
import { createGeoJsonPoint } from '@shared/utils/geo.utils'

// Global Zustand stores and helpers imports
import { useGeoObjectsStore, useMapWorkspaceStore, usePolygonsStore } from '@stores'

// Local type and interface definition imports
import type { ICreateGeoObject, ObjectSymbolType } from '@objects/types/IGeoObject.types'
import type { ILatLon } from '@shared/types/geojson.types'

// Object placement, save, update and delete handlers
export const useGeoObjectCrud = () => {
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false)
  const { notifySuccess, notifyError, notifyInfo } = useSnackbar()

  const objects = useGeoObjectsStore((s) => s.items)
  const isPlacing = useGeoObjectsStore((s) => s.isPlacing)
  const activeSymbol = useGeoObjectsStore((s) => s.activeSymbol)
  const pendingName = useGeoObjectsStore((s) => s.pendingName)
  const draftObjects = useGeoObjectsStore((s) => s.draftObjects)
  const isSaving = useGeoObjectsStore((s) => s.isSaving)
  const isDeleting = useGeoObjectsStore((s) => s.isDeleting)
  const isUpdating = useGeoObjectsStore((s) => s.isUpdating)

  const startPlacing = useGeoObjectsStore((s) => s.startPlacing)
  const stopPlacing = useGeoObjectsStore((s) => s.stopPlacing)
  const setActiveSymbol = useGeoObjectsStore((s) => s.setActiveSymbol)
  const setPendingName = useGeoObjectsStore((s) => s.setPendingName)
  const placeDraftObject = useGeoObjectsStore((s) => s.placeDraftObject)
  const removeDraftObject = useGeoObjectsStore((s) => s.removeDraftObject)
  const removeDraftObjects = useGeoObjectsStore((s) => s.removeDraftObjects)
  const clearDraftObjects = useGeoObjectsStore((s) => s.clearDraftObjects)
  const addSavedObjects = useGeoObjectsStore((s) => s.addMany)
  const upsertSavedObject = useGeoObjectsStore((s) => s.add)
  const removeSavedObject = useGeoObjectsStore((s) => s.remove)
  const clearSavedObjects = useGeoObjectsStore((s) => s.clearItems)
  const setIsSaving = useGeoObjectsStore((s) => s.setIsSaving)
  const setIsDeleting = useGeoObjectsStore((s) => s.setIsDeleting)
  const setIsUpdating = useGeoObjectsStore((s) => s.setIsUpdating)

  const cancelPolygonDrawing = usePolygonsStore((s) => s.cancelDrawing)
  const selection = useMapWorkspaceStore((s) => s.selection)
  const selectOnMap = useMapWorkspaceStore((s) => s.selectOnMap)
  const clearSelection = useMapWorkspaceStore((s) => s.clearSelection)
  const clearSelectionOf = useMapWorkspaceStore((s) => s.clearSelectionOf)
  const renameSelection = useMapWorkspaceStore((s) => s.renameSelection)

  const selectedObject = selection?.kind === 'object' ? selection : null

  const handleToggleAdd = useCallback(() => {
    cancelPolygonDrawing()
    if (isPlacing) {
      stopPlacing()
      notifyInfo(OBJECT_MESSAGES.PLACEMENT_STOPPED)
      return
    }
    startPlacing()
    notifyInfo(OBJECT_MESSAGES.PLACEMENT_STARTED(OBJECT_SYMBOL_LABEL_MAP[activeSymbol]))
  }, [cancelPolygonDrawing, isPlacing, stopPlacing, notifyInfo, startPlacing, activeSymbol])

  const handleSelectSymbol = useCallback(
    (symbol: ObjectSymbolType) => {
      setActiveSymbol(symbol)
      if (isPlacing) {
        notifyInfo(OBJECT_MESSAGES.PLACEMENT_STARTED(OBJECT_SYMBOL_LABEL_MAP[symbol]))
      }
    },
    [setActiveSymbol, isPlacing, notifyInfo],
  )

  const handlePlaceOnMap = useCallback(
    (point: ILatLon) => {
      const draft = placeDraftObject(point)
      selectOnMap({
        kind: 'object',
        id: draft.tempId,
        name: draft.name,
        isDraft: true,
      })
      notifyInfo(OBJECT_MESSAGES.OBJECT_PLACED_DRAFT(draft.name))
    },
    [placeDraftObject, selectOnMap, notifyInfo],
  )

  const handleSave = useCallback(async () => {
    const currentDrafts = useGeoObjectsStore.getState().draftObjects
    if (currentDrafts.length === 0) {
      notifyInfo(OBJECT_MESSAGES.NOTHING_TO_SAVE)
      return
    }

    const payloads: ICreateGeoObject[] = currentDrafts.map((draft) => ({
      name: draft.name,
      symbolType: draft.symbolType,
      geometry: draft.geometry,
    }))

    setIsSaving(true)
    const result = await geoObjectProvider.save(payloads)
    setIsSaving(false)

    if (!result.success || !result.data) {
      notifyError(result.message)
      return
    }

    // Drafts added during the request stay unsaved
    const savedTempIds = currentDrafts.map((draft) => draft.tempId)
    addSavedObjects(result.data)
    removeDraftObjects(savedTempIds)
    stopPlacing()
    clearSelectionOf('object', savedTempIds)
    notifySuccess(result.message || OBJECT_MESSAGES.SAVED_FALLBACK)
  }, [
    notifyInfo,
    setIsSaving,
    notifyError,
    addSavedObjects,
    removeDraftObjects,
    stopPlacing,
    clearSelectionOf,
    notifySuccess,
  ])

  const reloadObject = useCallback(
    async (id: string) => {
      const result = await geoObjectProvider.get(id)
      if (result.success && result.data) {
        upsertSavedObject(result.data)
        renameSelection(id, result.data.name)
        return
      }
      if (result.statusCode === StatusCodes.NOT_FOUND) {
        removeSavedObject(id)
        clearSelectionOf('object', [id])
      }
    },
    [upsertSavedObject, removeSavedObject, clearSelectionOf, renameSelection],
  )

  const applyUpdate = useCallback(
    async (id: string, changes: Partial<ICreateGeoObject>) => {
      const current = useGeoObjectsStore.getState().get(id)
      if (!current) return false

      setIsUpdating(true)
      const result = await geoObjectProvider.update(id, {
        ...changes,
        id,
        timestamp: current.timestamp,
      })
      setIsUpdating(false)

      if (!result.success || !result.data) {
        // Stale or removed objects are refreshed from the server
        if (
          result.statusCode === StatusCodes.CONFLICT ||
          result.statusCode === StatusCodes.NOT_FOUND
        ) {
          await reloadObject(id)
        }
        notifyError(result.message)
        return false
      }

      upsertSavedObject(result.data)
      renameSelection(id, result.data.name)
      notifySuccess(result.message || OBJECT_MESSAGES.UPDATED_FALLBACK)
      return true
    },
    [setIsUpdating, reloadObject, notifyError, upsertSavedObject, renameSelection, notifySuccess],
  )

  const handleUpdate = useCallback(
    async (id: string, changes: Partial<ICreateGeoObject>) => {
      await applyUpdate(id, changes)
    },
    [applyUpdate],
  )

  const handleMove = useCallback(
    (id: string, point: ILatLon) => applyUpdate(id, { geometry: createGeoJsonPoint(point) }),
    [applyUpdate],
  )

  const handleDelete = useCallback(async () => {
    if (!selectedObject) {
      if ((objects?.length ?? 0) + draftObjects.length === 0) {
        notifyInfo(OBJECT_MESSAGES.NO_OBJECTS_TO_DELETE)
        return
      }
      setDeleteAllDialogOpen(true)
      return
    }

    if (selectedObject.isDraft) {
      removeDraftObject(selectedObject.id)
      clearSelection()
      notifyInfo(OBJECT_MESSAGES.DRAFT_REMOVED)
      return
    }

    setIsDeleting(true)
    const result = await geoObjectProvider.delete(selectedObject.id)
    setIsDeleting(false)

    if (!result.success) {
      // An item removed elsewhere is refreshed from the server
      if (result.statusCode === StatusCodes.NOT_FOUND) {
        await reloadObject(selectedObject.id)
      }
      notifyError(result.message)
      return
    }

    removeSavedObject(selectedObject.id)
    clearSelectionOf('object', [selectedObject.id])
    notifySuccess(result.message || OBJECT_MESSAGES.DELETED_FALLBACK)
  }, [
    selectedObject,
    notifyInfo,
    removeDraftObject,
    clearSelection,
    clearSelectionOf,
    setIsDeleting,
    notifyError,
    removeSavedObject,
    reloadObject,
    notifySuccess,
    objects,
    draftObjects.length,
  ])

  const handleConfirmDeleteAll = useCallback(async () => {
    if ((objects?.length ?? 0) > 0) {
      setIsDeleting(true)
      const result = await geoObjectProvider.deleteAll()
      setIsDeleting(false)

      if (!result.success) {
        notifyError(result.message)
        return
      }
      clearSavedObjects()
      clearDraftObjects()
      clearSelectionOf('object')
      setDeleteAllDialogOpen(false)
      notifySuccess(result.message || OBJECT_MESSAGES.DELETED_ALL_FALLBACK)
      return
    }

    clearDraftObjects()
    clearSelectionOf('object')
    setDeleteAllDialogOpen(false)
    notifyInfo(OBJECT_MESSAGES.DRAFT_REMOVED)
  }, [
    objects,
    setIsDeleting,
    notifyError,
    clearSavedObjects,
    clearDraftObjects,
    clearSelectionOf,
    notifySuccess,
    notifyInfo,
  ])

  const editableObject =
    selectedObject && !selectedObject.isDraft && !isPlacing
      ? (objects?.find((object) => object.id === selectedObject.id) ?? null)
      : null

  return {
    objects: objects ?? [],
    isPlacing,
    activeSymbol,
    pendingName,
    draftObjects,
    isSaving,
    isDeleting,
    isUpdating,
    selectedObject,
    editableObject,
    canSave: draftObjects.length > 0,
    totalObjectCount: (objects?.length ?? 0) + draftObjects.length,
    deleteAllDialogOpen,
    openDeleteAllDialog: () => setDeleteAllDialogOpen(true),
    closeDeleteAllDialog: () => setDeleteAllDialogOpen(false),
    setPendingName,
    stopPlacing,
    handleToggleAdd,
    handleSelectSymbol,
    handlePlaceOnMap,
    handleSave,
    handleUpdate,
    handleMove,
    handleDelete,
    handleConfirmDeleteAll,
  }
}
