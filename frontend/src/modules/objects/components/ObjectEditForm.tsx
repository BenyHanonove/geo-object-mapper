// Core React ecosystem library imports
import { useState } from 'react'

// Material UI components and styling imports
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import { MenuItem, Stack, TextField, Typography } from '@mui/material'

// Object feature module implementation imports
import { OBJECT_MESSAGES, OBJECT_SYMBOL_OPTIONS } from '@objects/constants/object.constants'

// Shared application components and services imports
import { AppButton } from '@shared/components'

// Local type and interface definition imports
import type {
  ICreateGeoObject,
  IGeoObject,
  ObjectSymbolType,
} from '@objects/types/IGeoObject.types'

// Props for the saved object form
interface IObjectEditFormProps {
  object: IGeoObject
  isUpdating: boolean
  onUpdate: (id: string, changes: Partial<ICreateGeoObject>) => Promise<void>
}

// Form updating a saved map object
export function ObjectEditForm({ object, isUpdating, onUpdate }: IObjectEditFormProps) {
  const [name, setName] = useState(object.name)
  const [symbolType, setSymbolType] = useState<ObjectSymbolType>(object.symbolType)

  const trimmedName = name.trim()
  const changes: Partial<ICreateGeoObject> = {
    ...(trimmedName !== object.name && { name: trimmedName }),
    ...(symbolType !== object.symbolType && { symbolType }),
  }
  const canUpdate = trimmedName.length > 0 && Object.keys(changes).length > 0

  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={1}>
        <TextField
          size="small"
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          slotProps={{ htmlInput: { maxLength: 100 } }}
          sx={{ flex: '1 1 auto', minInlineSize: 0 }}
        />
        <TextField
          select
          size="small"
          label="Symbol"
          value={symbolType}
          onChange={(e) => setSymbolType(e.target.value as ObjectSymbolType)}
          sx={{ flex: '0 0 110px' }}
        >
          {OBJECT_SYMBOL_OPTIONS.map((option) => (
            <MenuItem key={option.type} value={option.type}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
      <AppButton
        fullWidth
        size="small"
        variant="contained"
        color="primary"
        loading={isUpdating}
        disabled={!canUpdate}
        icon={<EditRoundedIcon />}
        onClick={() => void onUpdate(object.id, changes)}
      >
        Update
      </AppButton>
      <Typography variant="caption" color="text.secondary">
        {OBJECT_MESSAGES.MOVE_HINT}
      </Typography>
    </Stack>
  )
}
