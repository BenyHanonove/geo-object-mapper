// Core React ecosystem library imports
import { useCallback, useState } from 'react'

// HTTP client and status code imports
import { StatusCodes } from 'http-status-codes'

// Polygon feature module implementation imports
import { POLYGON_MESSAGES } from '@polygons/constants/polygon.constants'
import { polygonProvider } from '@polygons/providers/polygon.provider'

// Shared application components and services imports
import { useSnackbar } from '@shared/hooks/snackbar.store'
import {
  geoJsonPolygonToVertices,
  verticesToClosedGeoJsonPolygon,
} from '@shared/utils/geo.utils'

// Global Zustand stores and helpers imports
import { useGeoObjectsStore, useMapWorkspaceStore, usePolygonsStore } from '@stores'

// Local type and interface definition imports
import type { ICreatePolygon } from '@polygons/types/IPolygon.types'
import type { ILatLon } from '@shared/types/geojson.types'

// Polygon drawing, save, update and delete handlers
export const usePolygonCrud = () => {
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false)
  const { notifySuccess, notifyError, notifyInfo, notifyWarning } = useSnackbar()

  const polygons = usePolygonsStore((s) => s.items)
  const isDrawing = usePolygonsStore((s) => s.isDrawing)
  const activeVertices = usePolygonsStore((s) => s.activeVertices)
  const draftPolygons = usePolygonsStore((s) => s.draftPolygons)
  const pendingName = usePolygonsStore((s) => s.pendingName)
  const activeColor = usePolygonsStore((s) => s.activeColor)
  const isSaving = usePolygonsStore((s) => s.isSaving)
  const isDeleting = usePolygonsStore((s) => s.isDeleting)
  const isUpdating = usePolygonsStore((s) => s.isUpdating)

  const startDrawing = usePolygonsStore((s) => s.startDrawing)
  const cancelDrawing = usePolygonsStore((s) => s.cancelDrawing)
  const setPendingName = usePolygonsStore((s) => s.setPendingName)
  const setActiveColor = usePolygonsStore((s) => s.setActiveColor)
  const appendVertex = usePolygonsStore((s) => s.appendVertex)
  const undoVertex = usePolygonsStore((s) => s.undoVertex)
  const closeActivePolygon = usePolygonsStore((s) => s.closeActivePolygon)
  const removeDraftPolygon = usePolygonsStore((s) => s.removeDraftPolygon)
  const removeDraftPolygons = usePolygonsStore((s) => s.removeDraftPolygons)
  const clearDraftPolygons = usePolygonsStore((s) => s.clearDraftPolygons)
  const addSavedPolygons = usePolygonsStore((s) => s.addMany)
  const upsertSavedPolygon = usePolygonsStore((s) => s.add)
  const removeSavedPolygon = usePolygonsStore((s) => s.remove)
  const clearSavedPolygons = usePolygonsStore((s) => s.clearItems)
  const setIsSaving = usePolygonsStore((s) => s.setIsSaving)
  const setIsDeleting = usePolygonsStore((s) => s.setIsDeleting)
  const setIsUpdating = usePolygonsStore((s) => s.setIsUpdating)

  const stopObjectPlacing = useGeoObjectsStore((s) => s.stopPlacing)
  const selection = useMapWorkspaceStore((s) => s.selection)
  const selectOnMap = useMapWorkspaceStore((s) => s.selectOnMap)
  const clearSelection = useMapWorkspaceStore((s) => s.clearSelection)
  const clearSelectionOf = useMapWorkspaceStore((s) => s.clearSelectionOf)
  const renameSelection = useMapWorkspaceStore((s) => s.renameSelection)

  const selectedPolygon = selection?.kind === 'polygon' ? selection : null

  const handleStartAdd = useCallback(() => {
    stopObjectPlacing()
    if (isDrawing) {
      cancelDrawing()
      notifyInfo(POLYGON_MESSAGES.DRAWING_CANCELLED)
      return
    }
    clearSelection()
    startDrawing()
    notifyInfo(POLYGON_MESSAGES.DRAWING_STARTED)
  }, [
    stopObjectPlacing,
    isDrawing,
    cancelDrawing,
    notifyInfo,
    clearSelection,
    startDrawing,
  ])

  const handleAddVertex = useCallback(
    (point: ILatLon) => {
      appendVertex(point)
    },
    [appendVertex],
  )

  const handleClosePolygon = useCallback(() => {
    if (usePolygonsStore.getState().activeVertices.length < 3) {
      notifyWarning(POLYGON_MESSAGES.MIN_VERTICES_REQUIRED)
      return
    }
    const createdDraft = closeActivePolygon()
    if (createdDraft) {
      selectOnMap({
        kind: 'polygon',
        id: createdDraft.tempId,
        name: createdDraft.name,
        isDraft: true,
      })
      notifyInfo(POLYGON_MESSAGES.POLYGON_CLOSED_DRAFT)
    }
  }, [closeActivePolygon, notifyInfo, notifyWarning, selectOnMap])

  const handleSave = useCallback(async () => {
    const currentState = usePolygonsStore.getState()
    let draftsToSave = [...currentState.draftPolygons]

    // Auto-close active polygon if user drew >= 3 vertices and clicked Save directly
    if (currentState.isDrawing && currentState.activeVertices.length >= 3) {
      const autoClosed = closeActivePolygon()
      if (autoClosed) {
        draftsToSave = [...draftsToSave, autoClosed]
      }
    } else if (
      currentState.isDrawing &&
      currentState.activeVertices.length > 0 &&
      draftsToSave.length === 0
    ) {
      notifyWarning(POLYGON_MESSAGES.MIN_VERTICES_REQUIRED)
      return
    }

    if (draftsToSave.length === 0) {
      notifyInfo(POLYGON_MESSAGES.NOTHING_TO_SAVE)
      return
    }

    const payloads: ICreatePolygon[] = draftsToSave.map((draft) => ({
      name: draft.name,
      color: draft.color,
      geometry: draft.geometry,
    }))

    setIsSaving(true)
    const result = await polygonProvider.save(payloads)
    setIsSaving(false)

    if (!result.success || !result.data) {
      notifyError(result.message)
      return
    }

    // Drafts added during the request stay unsaved
    const savedTempIds = draftsToSave.map((draft) => draft.tempId)
    addSavedPolygons(result.data)
    removeDraftPolygons(savedTempIds)
    clearSelectionOf('polygon', savedTempIds)
    notifySuccess(result.message || POLYGON_MESSAGES.SAVED_FALLBACK)
  }, [
    closeActivePolygon,
    notifyWarning,
    notifyInfo,
    setIsSaving,
    notifyError,
    addSavedPolygons,
    removeDraftPolygons,
    clearSelectionOf,
    notifySuccess,
  ])

  const reloadPolygon = useCallback(
    async (id: string) => {
      const result = await polygonProvider.get(id)
      if (result.success && result.data) {
        upsertSavedPolygon(result.data)
        renameSelection(id, result.data.name)
        return
      }
      if (result.statusCode === StatusCodes.NOT_FOUND) {
        removeSavedPolygon(id)
        clearSelectionOf('polygon', [id])
      }
    },
    [upsertSavedPolygon, removeSavedPolygon, clearSelectionOf, renameSelection],
  )

  const applyUpdate = useCallback(
    async (id: string, changes: Partial<ICreatePolygon>) => {
      const current = usePolygonsStore.getState().get(id)
      if (!current) return false

      setIsUpdating(true)
      const result = await polygonProvider.update(id, {
        ...changes,
        id,
        timestamp: current.timestamp,
      })
      setIsUpdating(false)

      if (!result.success || !result.data) {
        // Stale or removed polygons are refreshed from the server
        if (
          result.statusCode === StatusCodes.CONFLICT ||
          result.statusCode === StatusCodes.NOT_FOUND
        ) {
          await reloadPolygon(id)
        }
        notifyError(result.message)
        return false
      }

      upsertSavedPolygon(result.data)
      renameSelection(id, result.data.name)
      notifySuccess(result.message || POLYGON_MESSAGES.UPDATED_FALLBACK)
      return true
    },
    [setIsUpdating, reloadPolygon, notifyError, upsertSavedPolygon, renameSelection, notifySuccess],
  )

  const handleUpdate = useCallback(
    async (id: string, changes: Partial<ICreatePolygon>) => {
      await applyUpdate(id, changes)
    },
    [applyUpdate],
  )

  const handleMoveVertex = useCallback(
    async (id: string, index: number, point: ILatLon) => {
      const current = usePolygonsStore.getState().get(id)
      if (!current) return

      const vertices = geoJsonPolygonToVertices(current.geometry)
      vertices[index] = point
      const outerRing = verticesToClosedGeoJsonPolygon(vertices).coordinates[0]

      await applyUpdate(id, {
        geometry: {
          ...current.geometry,
          coordinates: [outerRing, ...current.geometry.coordinates.slice(1)],
        },
      })
    },
    [applyUpdate],
  )

  const handleDelete = useCallback(async () => {
    // 1. Delete selected polygon (either unsaved draft or persisted in DB)
    if (selectedPolygon) {
      if (selectedPolygon.isDraft) {
        removeDraftPolygon(selectedPolygon.id)
        clearSelection()
        notifyInfo(POLYGON_MESSAGES.DRAFT_REMOVED)
        return
      }

      setIsDeleting(true)
      const result = await polygonProvider.delete(selectedPolygon.id)
      setIsDeleting(false)

      if (!result.success) {
        // An item removed elsewhere is refreshed from the server
        if (result.statusCode === StatusCodes.NOT_FOUND) {
          await reloadPolygon(selectedPolygon.id)
        }
        notifyError(result.message)
        return
      }

      removeSavedPolygon(selectedPolygon.id)
      clearSelectionOf('polygon', [selectedPolygon.id])
      notifySuccess(result.message || POLYGON_MESSAGES.DELETED_FALLBACK)
      return
    }

    // 2. Cancel active drawing if in progress with no polygon selected
    if (isDrawing) {
      cancelDrawing()
      notifyInfo(POLYGON_MESSAGES.DRAWING_CANCELLED)
      return
    }

    // 3. Otherwise offer to delete all polygons (per spec: "Deletes a selected polygon or all polygons")
    const totalCount = (polygons?.length ?? 0) + draftPolygons.length
    if (totalCount === 0) {
      notifyInfo(POLYGON_MESSAGES.NO_POLYGONS_TO_DELETE)
      return
    }
    setDeleteAllDialogOpen(true)
  }, [
    selectedPolygon,
    removeDraftPolygon,
    clearSelection,
    clearSelectionOf,
    notifyInfo,
    setIsDeleting,
    notifyError,
    removeSavedPolygon,
    reloadPolygon,
    notifySuccess,
    isDrawing,
    cancelDrawing,
    polygons,
    draftPolygons.length,
  ])

  const handleConfirmDeleteAll = useCallback(async () => {
    const savedCount = polygons?.length ?? 0
    if (savedCount > 0) {
      setIsDeleting(true)
      const result = await polygonProvider.deleteAll()
      setIsDeleting(false)

      if (!result.success) {
        notifyError(result.message)
        return
      }
      clearSavedPolygons()
      clearDraftPolygons()
      clearSelectionOf('polygon')
      setDeleteAllDialogOpen(false)
      notifySuccess(result.message || POLYGON_MESSAGES.DELETED_ALL_FALLBACK)
      return
    }

    clearDraftPolygons()
    clearSelectionOf('polygon')
    setDeleteAllDialogOpen(false)
    notifyInfo(POLYGON_MESSAGES.DRAFT_REMOVED)
  }, [
    polygons,
    setIsDeleting,
    notifyError,
    clearSavedPolygons,
    clearDraftPolygons,
    clearSelectionOf,
    notifySuccess,
    notifyInfo,
  ])

  const canSave =
    draftPolygons.length > 0 || (isDrawing && activeVertices.length >= 3)
  const totalPolygonCount = (polygons?.length ?? 0) + draftPolygons.length
  const editablePolygon =
    selectedPolygon && !selectedPolygon.isDraft && !isDrawing
      ? (polygons?.find((polygon) => polygon.id === selectedPolygon.id) ?? null)
      : null

  return {
    polygons: polygons ?? [],
    isDrawing,
    activeVertices,
    draftPolygons,
    pendingName,
    activeColor,
    isSaving,
    isDeleting,
    isUpdating,
    canSave,
    totalPolygonCount,
    selectedPolygon,
    editablePolygon,
    deleteAllDialogOpen,
    openDeleteAllDialog: () => setDeleteAllDialogOpen(true),
    closeDeleteAllDialog: () => setDeleteAllDialogOpen(false),
    setPendingName,
    setActiveColor,
    undoVertex,
    cancelDrawing,
    handleStartAdd,
    handleAddVertex,
    handleClosePolygon,
    handleSave,
    handleUpdate,
    handleMoveVertex,
    handleDelete,
    handleConfirmDeleteAll,
  }
}
