// Core React ecosystem library imports
import type { ReactNode } from 'react'

// Material UI components and styling imports
import {
  Box,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { alpha } from '@mui/material/styles'

// Local sibling module and definition imports
import { EmptyState } from './EmptyState'

// Local type and interface definition imports
import type { ITableHeader } from '@shared/types/ui.types'

// Props for the generic data table
export interface IAppTableProps<T extends { id: string }> {
  headers: ITableHeader<T>[]
  items: T[]
  loading?: boolean
  ariaLabel: string
  selectedId?: string | null
  onRowClick?: (item: T) => void
  emptyIcon?: ReactNode
  emptyTitle?: string
  emptyDescription?: string
  renderCell?: Partial<Record<(keyof T & string) | 'actions', (item: T) => ReactNode>>
}

// Sticky header table with row selection
export function AppTable<T extends { id: string }>({
  headers,
  items,
  loading = false,
  ariaLabel,
  selectedId = null,
  onRowClick,
  emptyIcon,
  emptyTitle = 'No map data saved yet',
  emptyDescription,
  renderCell,
}: IAppTableProps<T>) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: '1 1 0%',
        minBlockSize: 0,
        minInlineSize: 0,
      }}
    >
      {loading && <LinearProgress />}
      <TableContainer
        tabIndex={0}
        role="region"
        aria-label={ariaLabel}
        sx={{
          flex: '1 1 0%',
          minBlockSize: 0,
          maxInlineSize: '100%',
          overflow: 'auto',
          scrollbarGutter: 'stable',
          overscrollBehavior: 'contain',
          containerType: 'inline-size',
          '&:focus-visible': {
            outline: (theme) => `2px solid ${theme.palette.primary.main}`,
            outlineOffset: -2,
          },
        }}
      >
        {items.length === 0 && !loading ? (
          <EmptyState
            icon={emptyIcon}
            title={emptyTitle}
            description={emptyDescription}
          />
        ) : (
          <Table
            stickyHeader
            size="small"
            aria-label={ariaLabel}
            sx={{ borderCollapse: 'separate', borderSpacing: 0 }}
          >
            <TableHead>
              <TableRow>
                {headers.map((header) => (
                  <TableCell
                    key={header.key}
                    align={header.align ?? 'left'}
                    sx={{
                      minInlineSize: header.minWidth,
                      position: 'sticky',
                      insetBlockStart: 0,
                      zIndex: 2,
                    }}
                  >
                    {header.title}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => {
                const isSelected = selectedId === item.id
                return (
                  <TableRow
                    key={item.id}
                    hover={Boolean(onRowClick)}
                    selected={isSelected}
                    onClick={onRowClick ? () => onRowClick(item) : undefined}
                    sx={{
                      cursor: onRowClick ? 'pointer' : 'default',
                      transition: 'background-color 120ms ease',
                      '&.Mui-selected': {
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
                      },
                      '&.Mui-selected:hover': {
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.18),
                      },
                    }}
                  >
                    {headers.map((header) => {
                      const customRenderer = renderCell?.[header.key]
                      const rawValue =
                        header.key !== 'actions' ? item[header.key as keyof T] : undefined
                      const content = customRenderer
                        ? customRenderer(item)
                        : rawValue !== undefined && rawValue !== null
                          ? String(rawValue)
                          : ''

                      return (
                        <TableCell
                          key={header.key}
                          component={header.isRowHeader ? 'th' : 'td'}
                          scope={header.isRowHeader ? 'row' : undefined}
                          align={header.align ?? 'left'}
                        >
                          {content}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </TableContainer>
    </Box>
  )
}
