// Core React ecosystem library imports
import { useId } from 'react'
import type { ReactNode } from 'react'

// Material UI components and styling imports
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import { Box, ButtonBase, Collapse, Paper, Stack, Typography } from '@mui/material'
import type { SxProps, Theme } from '@mui/material/styles'

// Props for the titled panel card
export interface IAppCardProps {
  stepNumber?: number
  title: string
  subtitle?: string
  headerAction?: ReactNode
  children: ReactNode
  fillHeight?: boolean
  noBodyPadding?: boolean
  expanded?: boolean
  onToggle?: () => void
  sx?: SxProps<Theme>
}

// Stretches collapsible content to the card height
const FILL_COLLAPSE_SX: SxProps<Theme> = {
  flex: '1 1 0%',
  minBlockSize: 0,
  '& .MuiCollapse-wrapper': { blockSize: '100%' },
  '& .MuiCollapse-wrapperInner': {
    display: 'flex',
    flexDirection: 'column',
    blockSize: '100%',
    minBlockSize: 0,
  },
}

// Numbered panel card with header action
export function AppCard({
  stepNumber,
  title,
  subtitle,
  headerAction,
  children,
  fillHeight = false,
  noBodyPadding = false,
  expanded = true,
  onToggle,
  sx,
}: IAppCardProps) {
  const bodyId = useId()
  const fillsHeight = fillHeight && expanded

  const heading = (
    <>
      {stepNumber !== undefined && (
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            inlineSize: 26,
            blockSize: 26,
            borderRadius: 1.5,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            fontWeight: 700,
            fontSize: '0.82rem',
            flexShrink: 0,
          }}
        >
          {stepNumber}
        </Box>
      )}
      <Box sx={{ minInlineSize: 0 }}>
        <Typography variant="h6" component={onToggle ? 'span' : 'h2'} noWrap sx={{ display: 'block' }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </>
  )

  const body = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: fillsHeight ? '1 1 0%' : '0 0 auto',
        minBlockSize: 0,
        minInlineSize: 0,
        p: noBodyPadding ? 0 : 2,
      }}
    >
      {children}
    </Box>
  )

  return (
    <Paper
      sx={[
        {
          display: 'flex',
          flexDirection: 'column',
          minInlineSize: 0,
          ...(fillsHeight ? { flex: '1 1 0%', minBlockSize: 0 } : {}),
          overflow: 'clip',
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={1.5}
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: expanded ? 1 : 0,
          borderColor: 'divider',
          flexWrap: 'wrap',
          rowGap: 1,
        }}
      >
        {onToggle ? (
          <ButtonBase
            onClick={onToggle}
            aria-expanded={expanded}
            aria-controls={bodyId}
            sx={{
              flex: '1 1 auto',
              justifyContent: 'flex-start',
              gap: 1.25,
              minInlineSize: 0,
              borderRadius: 1,
              textAlign: 'start',
            }}
          >
            {heading}
            <ExpandMoreRoundedIcon
              fontSize="small"
              color="action"
              sx={{
                flexShrink: 0,
                transform: expanded ? 'rotate(180deg)' : 'none',
                transition: 'transform 160ms ease',
              }}
            />
          </ButtonBase>
        ) : (
          <Stack direction="row" alignItems="center" spacing={1.25} sx={{ minInlineSize: 0 }}>
            {heading}
          </Stack>
        )}
        {headerAction && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
            {headerAction}
          </Box>
        )}
      </Stack>

      {onToggle ? (
        <Collapse id={bodyId} in={expanded} sx={fillsHeight ? FILL_COLLAPSE_SX : undefined}>
          {body}
        </Collapse>
      ) : (
        body
      )}
    </Paper>
  )
}
