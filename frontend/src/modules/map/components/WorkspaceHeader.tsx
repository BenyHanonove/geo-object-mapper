// Material UI components and styling imports
import PublicRoundedIcon from '@mui/icons-material/PublicRounded'
import { Box, Paper, Stack, Typography } from '@mui/material'

// Typed application environment configuration imports
import { env } from '@plugins'

// Top header with application name
export function WorkspaceHeader() {
  return (
    <Paper
      component="header"
      sx={{
        px: 2.5,
        py: 1.25,
        borderRadius: 0,
        borderTop: 0,
        borderInline: 0,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.25}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            inlineSize: 34,
            blockSize: 34,
            borderRadius: 2,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
          }}
        >
          <PublicRoundedIcon fontSize="small" />
        </Box>
        <Box>
          <Typography variant="subtitle1" component="h1" sx={{ lineHeight: 1.2 }}>
            {env.app.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Interactive GeoJSON Polygon &amp; Tactical Object Management
          </Typography>
        </Box>
      </Stack>
    </Paper>
  )
}
