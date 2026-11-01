// Material UI components and styling imports
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded'
import PolylineRoundedIcon from '@mui/icons-material/PolylineRounded'
import SaveRoundedIcon from '@mui/icons-material/SaveRounded'
import UndoRoundedIcon from '@mui/icons-material/UndoRounded'
import { Box, IconButton, Stack, TextField, Tooltip, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'

// Polygon feature module implementation imports
import { usePolygonCrud } from '@polygons/hooks/polygon.crud'

// Shared application components and services imports
import { AppButton, AppCard, AppDialog, StatusChip } from '@shared/components'

// Global Zustand stores and helpers imports
import { useMapWorkspaceStore } from '@stores'

// Local sibling module and definition imports
import { PolygonColorSwatches } from './PolygonColorSwatches'
import { PolygonEditForm } from './PolygonEditForm'

// Panel for drawing and managing polygons
export function PolygonPanel() {
  const {
    polygons,
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
    openDeleteAllDialog,
    closeDeleteAllDialog,
    setPendingName,
    setActiveColor,
    undoVertex,
    handleStartAdd,
    handleClosePolygon,
    handleSave,
    handleUpdate,
    handleDelete,
    handleConfirmDeleteAll,
  } = usePolygonCrud()

  const isExpanded = useMapWorkspaceStore((s) => s.activePanel === 'polygons')
  const togglePanel = useMapWorkspaceStore((s) => s.togglePanel)

  return (
    <>
      <AppCard
        stepNumber={2}
        title="Polygon"
        expanded={isExpanded}
        onToggle={() => togglePanel('polygons')}
        headerAction={
          <Stack direction="row" spacing={0.75} alignItems="center">
            <StatusChip label={`${polygons.length} saved`} variant="outlined" />
            {draftPolygons.length > 0 && (
              <StatusChip label={`${draftPolygons.length} unsaved`} color="warning" />
            )}
            {totalPolygonCount > 0 && selectedPolygon && (
              <Tooltip title="Delete all polygons">
                <IconButton
                  size="small"
                  color="error"
                  aria-label="Delete all polygons"
                  onClick={openDeleteAllDialog}
                >
                  <DeleteSweepRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        }
      >
        <Stack spacing={1.25}>
          {/* Optional polygon label + theme color swatch row */}
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              size="small"
              label="Polygon name (optional)"
              placeholder={`Auto: Polygon ${polygons.length + draftPolygons.length + 1}`}
              value={pendingName}
              onChange={(e) => setPendingName(e.target.value)}
              sx={{ flex: '1 1 auto', minInlineSize: 0 }}
            />
            <PolygonColorSwatches value={activeColor} onChange={setActiveColor} />
          </Stack>

          {/* Primary actions: Add / Delete / Save */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <AppButton
              size="small"
              variant={isDrawing ? 'contained' : 'outlined'}
              color={isDrawing ? 'secondary' : 'primary'}
              icon={isDrawing ? <CloseRoundedIcon /> : <PolylineRoundedIcon />}
              onClick={handleStartAdd}
              sx={{ flex: '1 1 100px' }}
            >
              {isDrawing ? 'Cancel' : 'Add'}
            </AppButton>

            <Tooltip
              title={
                selectedPolygon
                  ? `Delete "${selectedPolygon.name}"`
                  : totalPolygonCount > 0
                    ? 'Delete all polygons from map and database'
                    : 'No polygons to delete'
              }
            >
              <Box sx={{ display: 'flex', flex: '1 1 100px' }}>
                <AppButton
                  fullWidth
                  size="small"
                  variant="outlined"
                  color="error"
                  loading={isDeleting}
                  disabled={totalPolygonCount === 0 && !isDrawing}
                  icon={<DeleteOutlineRoundedIcon />}
                  onClick={() => void handleDelete()}
                >
                  {selectedPolygon ? 'Delete' : totalPolygonCount > 0 ? 'Delete All' : 'Delete'}
                </AppButton>
              </Box>
            </Tooltip>

            <AppButton
              size="small"
              variant="contained"
              color="primary"
              loading={isSaving}
              disabled={!canSave}
              icon={<SaveRoundedIcon />}
              onClick={() => void handleSave()}
              sx={{ flex: '1 1 100%' }}
            >
              {draftPolygons.length > 0 ? `Save (${draftPolygons.length})` : 'Save'}
            </AppButton>
          </Box>

          {/* Live vertex drawing controls */}
          {isDrawing && (
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={1}
              sx={{
                px: 1.25,
                py: 0.75,
                borderRadius: 1.5,
                bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.1),
                flexWrap: 'wrap',
                rowGap: 0.5,
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 500 }}>
                {activeVertices.length < 3
                  ? `Vertices: ${activeVertices.length} (click ${3 - activeVertices.length} more)`
                  : `Vertices: ${activeVertices.length} — click start point to close`}
              </Typography>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Tooltip title="Undo last vertex">
                  <span>
                    <IconButton
                      size="small"
                      disabled={activeVertices.length === 0}
                      onClick={undoVertex}
                      aria-label="Undo last vertex"
                    >
                      <UndoRoundedIcon fontSize="inherit" />
                    </IconButton>
                  </span>
                </Tooltip>
                {activeVertices.length >= 3 && (
                  <AppButton
                    size="small"
                    variant="contained"
                    color="success"
                    icon={<CheckCircleOutlineRoundedIcon fontSize="small" />}
                    onClick={handleClosePolygon}
                    sx={{ py: 0.25, px: 1, fontSize: '0.75rem' }}
                  >
                    Close
                  </AppButton>
                )}
              </Stack>
            </Stack>
          )}

          {/* Selected polygon indicator */}
          {!isDrawing && selectedPolygon && (
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{
                px: 1.25,
                py: 0.75,
                borderRadius: 1.5,
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 500 }}>
                Selected: {selectedPolygon.name}
                {selectedPolygon.isDraft ? ' (unsaved)' : ''}
              </Typography>
            </Stack>
          )}

          {editablePolygon && (
            <PolygonEditForm
              key={`${editablePolygon.id}:${editablePolygon.timestamp}`}
              polygon={editablePolygon}
              isUpdating={isUpdating}
              onUpdate={handleUpdate}
            />
          )}
        </Stack>
      </AppCard>

      <AppDialog
        type="delete"
        open={deleteAllDialogOpen}
        title="Delete All Polygons"
        description={`Are you sure you want to delete all ${totalPolygonCount} polygon(s) from the map and database?`}
        confirmText="Delete All"
        loading={isDeleting}
        onClose={closeDeleteAllDialog}
        onConfirm={() => void handleConfirmDeleteAll()}
      />
    </>
  )
}
