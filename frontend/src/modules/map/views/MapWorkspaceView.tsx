// Material UI components and styling imports
import { Box, Stack } from '@mui/material'

// Map feature module implementation imports
import { MapDataPanel } from '@map/components/MapDataPanel'
import { MapPanel } from '@map/components/MapPanel'
import { WorkspaceHeader } from '@map/components/WorkspaceHeader'

// Object feature module implementation imports
import { ObjectsPanel } from '@objects/components/ObjectsPanel'

// Polygon feature module implementation imports
import { PolygonPanel } from '@polygons/components/PolygonPanel'

// Four panel map workspace page layout
export default function MapWorkspaceView() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minBlockSize: '100dvh',
        blockSize: { xs: 'auto', lg: '100dvh' },
        bgcolor: 'background.default',
      }}
    >
      <WorkspaceHeader />

      {/* Four-Panel Flexbox Layout matching wireframe:
          Left:  1 Map
          Right: 2 Polygon -> 3 Objects -> 4 Map Data */}
      <Stack
        component="main"
        direction={{ xs: 'column', lg: 'row' }}
        spacing={2}
        sx={{
          flex: '1 1 0%',
          minBlockSize: 0,
          minInlineSize: 0,
          p: 2,
        }}
      >
        {/* Left Column: Panel 1 (Map) */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flex: { xs: '0 0 auto', lg: '1 1 0%' },
            minInlineSize: 0,
            minBlockSize: { xs: 460, lg: 0 },
          }}
        >
          <MapPanel />
        </Box>

        {/* Right Column: Panel 2 (Polygon), Panel 3 (Objects), Panel 4 (Map Data) */}
        <Stack
          spacing={2}
          sx={{
            flex: { xs: '1 1 auto', lg: '0 0 400px', xl: '0 0 430px' },
            minInlineSize: 0,
            minBlockSize: 0,
            overflowY: { lg: 'auto' },
          }}
        >
          <PolygonPanel />
          <ObjectsPanel />
          <MapDataPanel />
        </Stack>
      </Stack>
    </Box>
  )
}
