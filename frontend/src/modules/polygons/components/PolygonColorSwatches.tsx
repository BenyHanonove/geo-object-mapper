// Material UI components and styling imports
import { Box, Stack, Tooltip } from '@mui/material'

// Application theme design token imports
import { POLYGON_SWATCH_TOKENS } from '@plugins'

// Props for the polygon color picker
interface IPolygonColorSwatchesProps {
  value: string
  onChange: (color: string) => void
}

// Row of selectable polygon color swatches
export function PolygonColorSwatches({ value, onChange }: IPolygonColorSwatchesProps) {
  return (
    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flexShrink: 0 }}>
      {POLYGON_SWATCH_TOKENS.map((swatch) => {
        const isSelected = value === swatch
        return (
          <Tooltip key={swatch} title="Polygon color">
            <Box
              component="button"
              type="button"
              aria-label={`Select polygon color ${swatch}`}
              aria-pressed={isSelected}
              onClick={() => onChange(swatch)}
              sx={{
                inlineSize: 18,
                blockSize: 18,
                borderRadius: '50%',
                bgcolor: swatch,
                border: 2,
                borderColor: isSelected ? 'text.primary' : 'transparent',
                cursor: 'pointer',
                padding: 0,
                transition: 'transform 120ms ease',
                transform: isSelected ? 'scale(1.15)' : 'scale(1)',
              }}
            />
          </Tooltip>
        )
      })}
    </Stack>
  )
}
