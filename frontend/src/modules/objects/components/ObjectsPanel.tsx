// Material UI components and styling imports
import AddLocationAltRoundedIcon from '@mui/icons-material/AddLocationAltRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded'
import SaveRoundedIcon from '@mui/icons-material/SaveRounded'
import {
  Box,
  IconButton,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material'
import { alpha } from '@mui/material/styles'

// Object feature module implementation imports
import { OBJECT_SYMBOL_LABEL_MAP, OBJECT_SYMBOL_OPTIONS } from '@objects/constants/object.constants'
import { useGeoObjectCrud } from '@objects/hooks/geoObject.crud'

// Shared application components and services imports
import { AppButton, AppCard, AppDialog, StatusChip } from '@shared/components'

// Global Zustand stores and helpers imports
import { useMapWorkspaceStore } from '@stores'

// Local sibling module and definition imports
import { ObjectEditForm } from './ObjectEditForm'
import { ObjectSymbolIcon } from './ObjectSymbolIcon'

// Local type and interface definition imports
import type { ObjectSymbolType } from '@objects/types/IGeoObject.types'

// Panel for placing and managing map objects
export function ObjectsPanel() {
  const {
    objects,
    isPlacing,
    activeSymbol,
    pendingName,
    draftObjects,
    isSaving,
    isDeleting,
    isUpdating,
    selectedObject,
    editableObject,
    canSave,
    totalObjectCount,
    deleteAllDialogOpen,
    openDeleteAllDialog,
    closeDeleteAllDialog,
    setPendingName,
    handleToggleAdd,
    handleSelectSymbol,
    handleSave,
    handleUpdate,
    handleDelete,
    handleConfirmDeleteAll,
  } = useGeoObjectCrud()

  const isExpanded = useMapWorkspaceStore((s) => s.activePanel === 'objects')
  const togglePanel = useMapWorkspaceStore((s) => s.togglePanel)

  return (
    <AppCard
      stepNumber={3}
      title="Objects"
      expanded={isExpanded}
      onToggle={() => togglePanel('objects')}
      headerAction={
        <Stack direction="row" spacing={0.75} alignItems="center">
          <StatusChip label={`${objects.length} saved`} variant="outlined" />
          {draftObjects.length > 0 && (
            <StatusChip
              label={`${draftObjects.length} unsaved`}
              color="warning"
            />
          )}
          {totalObjectCount > 0 && selectedObject && (
            <Tooltip title="Delete all objects">
              <IconButton
                size="small"
                color="error"
                aria-label="Delete all objects"
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
        {/* Symbol selector: Marker vs Custom Symbols (Jeep, Radar, Drone) */}
        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}
          >
            Symbol Type
          </Typography>
          <ToggleButtonGroup
            exclusive
            fullWidth
            size="small"
            value={activeSymbol}
            onChange={(_event, value: ObjectSymbolType | null) => {
              if (value) handleSelectSymbol(value)
            }}
            aria-label="Object symbol type"
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 0.75,
              '& .MuiToggleButtonGroup-grouped': {
                border: 1,
                borderColor: 'divider',
                borderRadius: '8px !important',
                flex: '1 1 72px',
                py: 0.5,
                textTransform: 'none',
                fontWeight: 600,
                gap: 0.5,
              },
            }}
          >
            {OBJECT_SYMBOL_OPTIONS.map((option) => (
              <ToggleButton key={option.type} value={option.type}>
                <ObjectSymbolIcon symbolType={option.type} fontSize="small" />
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  {option.label}
                </Typography>
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        {/* Optional custom object label */}
        <TextField
          size="small"
          fullWidth
          label="Object label (optional)"
          placeholder={`Auto: ${OBJECT_SYMBOL_LABEL_MAP[activeSymbol]} ${objects.length + draftObjects.length + 1}`}
          value={pendingName}
          onChange={(e) => setPendingName(e.target.value)}
        />

        {/* Primary wireframe actions: Add + Delete + Save */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <AppButton
            size="small"
            variant={isPlacing ? 'contained' : 'outlined'}
            color={isPlacing ? 'secondary' : 'primary'}
            icon={isPlacing ? <CloseRoundedIcon /> : <AddLocationAltRoundedIcon />}
            onClick={handleToggleAdd}
            sx={{ flex: '1 1 110px' }}
          >
            {isPlacing ? 'Done' : 'Add'}
          </AppButton>

          <Tooltip
            title={
              selectedObject
                ? `Delete "${selectedObject.name}"`
                : totalObjectCount > 0
                  ? 'Delete all objects from map and database'
                  : 'No objects to delete'
            }
          >
            <Box sx={{ display: 'flex', flex: '1 1 110px' }}>
              <AppButton
                fullWidth
                size="small"
                variant="outlined"
                color="error"
                loading={isDeleting}
                disabled={totalObjectCount === 0}
                icon={<DeleteOutlineRoundedIcon />}
                onClick={() => void handleDelete()}
              >
                {selectedObject ? 'Delete' : totalObjectCount > 0 ? 'Delete All' : 'Delete'}
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
            {draftObjects.length > 0 ? `Save (${draftObjects.length})` : 'Save'}
          </AppButton>
        </Box>

        {/* Contextual status indicator */}
        {(isPlacing || selectedObject) && (
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={1}
            sx={{
              px: 1.25,
              py: 0.75,
              borderRadius: 1.5,
              bgcolor: (theme) =>
                alpha(
                  isPlacing ? theme.palette.secondary.main : theme.palette.primary.main,
                  0.09,
                ),
            }}
          >
            <Typography variant="caption" color="text.primary" sx={{ fontWeight: 500 }}>
              {isPlacing
                ? `Click map to place ${OBJECT_SYMBOL_LABEL_MAP[activeSymbol]}`
                : `Selected: ${selectedObject?.name ?? ''}${selectedObject?.isDraft ? ' (unsaved)' : ''}`}
            </Typography>
          </Stack>
        )}

        {editableObject && (
          <ObjectEditForm
            key={`${editableObject.id}:${editableObject.timestamp}`}
            object={editableObject}
            isUpdating={isUpdating}
            onUpdate={handleUpdate}
          />
        )}
      </Stack>

      <AppDialog
        type="delete"
        open={deleteAllDialogOpen}
        title="Delete All Objects"
        description={`Are you sure you want to delete all ${totalObjectCount} object(s) from the map and database?`}
        confirmText="Delete All"
        loading={isDeleting}
        onClose={closeDeleteAllDialog}
        onConfirm={() => void handleConfirmDeleteAll()}
      />
    </AppCard>
  )
}
