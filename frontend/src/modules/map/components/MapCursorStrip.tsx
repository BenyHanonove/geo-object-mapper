// Material UI components and styling imports
import { Stack, Typography } from '@mui/material'

// Shared application components and services imports
import { formatCoordinate } from '@shared/utils/geo.utils'

// Global Zustand stores and helpers imports
import { useMapWorkspaceStore } from '@stores'

// Bottom strip showing live cursor coordinates
export function MapCursorStrip() {
  const cursorLatLon = useMapWorkspaceStore((s) => s.cursorLatLon)

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      spacing={2}
      sx={{
        px: 2,
        py: 0.75,
        borderTop: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        flexWrap: 'wrap',
        rowGap: 0.5,
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontFamily: (t) => t.fontMono }}
      >
        {cursorLatLon
          ? `Cursor: ${formatCoordinate(cursorLatLon.lat, 5)}, ${formatCoordinate(cursorLatLon.lon, 5)}`
          : 'Hover map to inspect coordinates'}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        GeoJSON WGS84 (EPSG:4326)
      </Typography>
    </Stack>
  )
}
