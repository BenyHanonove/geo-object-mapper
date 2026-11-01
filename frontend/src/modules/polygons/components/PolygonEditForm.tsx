// Core React ecosystem library imports
import { useState } from 'react'

// Material UI components and styling imports
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import { Stack, TextField, Typography } from '@mui/material'

// Polygon feature module implementation imports
import { POLYGON_MESSAGES } from '@polygons/constants/polygon.constants'

// Shared application components and services imports
import { AppButton } from '@shared/components'

// Local sibling module and definition imports
import { PolygonColorSwatches } from './PolygonColorSwatches'

// Local type and interface definition imports
import type { ICreatePolygon, IPolygon } from '@polygons/types/IPolygon.types'

// Props for the saved polygon form
interface IPolygonEditFormProps {
  polygon: IPolygon
  isUpdating: boolean
  onUpdate: (id: string, changes: Partial<ICreatePolygon>) => Promise<void>
}

// Form updating a saved polygon
export function PolygonEditForm({ polygon, isUpdating, onUpdate }: IPolygonEditFormProps) {
  const [name, setName] = useState(polygon.name)
  const [color, setColor] = useState(polygon.color ?? '')

  const trimmedName = name.trim()
  const changes: Partial<ICreatePolygon> = {
    ...(trimmedName !== polygon.name && { name: trimmedName }),
    ...(color !== (polygon.color ?? '') && { color }),
  }
  const canUpdate = trimmedName.length > 0 && Object.keys(changes).length > 0

  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={1} alignItems="center">
        <TextField
          size="small"
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          slotProps={{ htmlInput: { maxLength: 100 } }}
          sx={{ flex: '1 1 auto', minInlineSize: 0 }}
        />
        <PolygonColorSwatches value={color} onChange={setColor} />
      </Stack>
      <AppButton
        fullWidth
        size="small"
        variant="contained"
        color="primary"
        loading={isUpdating}
        disabled={!canUpdate}
        icon={<EditRoundedIcon />}
        onClick={() => void onUpdate(polygon.id, changes)}
      >
        Update
      </AppButton>
      <Typography variant="caption" color="text.secondary">
        {POLYGON_MESSAGES.RESHAPE_HINT}
      </Typography>
    </Stack>
  )
}
