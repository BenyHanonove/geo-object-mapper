// Material UI components and styling imports
import CloudOffRoundedIcon from '@mui/icons-material/CloudOffRounded'
import LayersClearRoundedIcon from '@mui/icons-material/LayersClearRounded'
import PentagonRoundedIcon from '@mui/icons-material/PentagonRounded'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import { Box, InputAdornment, Stack, TextField, Typography } from '@mui/material'

// Map feature module implementation imports
import { MAP_PANEL_COPY } from '@map/constants/map.constants'
import { useMapDataRows } from '@map/hooks/mapData.calc'

// Object feature module implementation imports
import { ObjectSymbolIcon } from '@objects/components/ObjectSymbolIcon'

// Shared application components and services imports
import { AppButton, AppCard, AppTable, EmptyState, StatusChip } from '@shared/components'
import { useSearch } from '@shared/hooks/useSearch'
import { loadAppData } from '@shared/services/app-init.service'

// Global Zustand stores and helpers imports
import { useMapWorkspaceStore } from '@stores'

// Local type and interface definition imports
import type { IMapDataRow } from '@map/types/IMapWorkspace.types'
import type { ITableHeader } from '@shared/types/ui.types'

// Column definitions for the data table
const HEADERS: ITableHeader<IMapDataRow>[] = [
  { key: 'object', title: 'Object', isRowHeader: true },
  { key: 'lat', title: 'Lat', align: 'right' },
  { key: 'lon', title: 'Lon', align: 'right' },
]

// Row fields included in table search
const SEARCH_KEYS: (keyof IMapDataRow)[] = ['object', 'subtitle', 'lat', 'lon']

// Searchable table of saved map entities
export function MapDataPanel() {
  const { rows, loading, error } = useMapDataRows()
  const { query, setQuery, results } = useSearch(rows, SEARCH_KEYS)

  const selection = useMapWorkspaceStore((s) => s.selection)
  const selectOnMap = useMapWorkspaceStore((s) => s.selectOnMap)
  const flyTo = useMapWorkspaceStore((s) => s.flyTo)

  const selectedRowId =
    selection && !selection.isDraft ? `${selection.kind}:${selection.id}` : null

  const handleRowClick = (row: IMapDataRow) => {
    selectOnMap({
      kind: row.kind,
      id: row.entityId,
      name: row.object,
      isDraft: false,
    })
    flyTo(row.rawLat, row.rawLon, row.kind === 'polygon' ? 12 : 13)
  }

  return (
    <AppCard
      stepNumber={4}
      title="Map Data"
      fillHeight
      noBodyPadding
      headerAction={<StatusChip label={`${rows.length} rows`} variant="outlined" />}
      sx={{ minBlockSize: 240 }}
    >
      {error ? (
        <EmptyState
          icon={<CloudOffRoundedIcon sx={{ fontSize: 32 }} />}
          title={MAP_PANEL_COPY.LOAD_ERROR_TITLE}
          description={error}
          action={
            <AppButton
              size="small"
              variant="outlined"
              loading={loading}
              icon={<RefreshRoundedIcon />}
              onClick={() => void loadAppData()}
            >
              {MAP_PANEL_COPY.RETRY_LABEL}
            </AppButton>
          }
        />
      ) : (
        <>
          {rows.length > 0 && (
            <Box sx={{ px: 2, py: 1.25, borderBottom: 1, borderColor: 'divider' }}>
              <TextField
                size="small"
                fullWidth
                placeholder="Filter saved map data…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchRoundedIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Box>
          )}

          <AppTable
            headers={HEADERS}
            items={results}
            loading={loading}
            ariaLabel="Saved geographic objects and polygons table"
            selectedId={selectedRowId}
            onRowClick={handleRowClick}
            emptyIcon={<LayersClearRoundedIcon sx={{ fontSize: 32 }} />}
            emptyTitle={
              rows.length > 0
                ? MAP_PANEL_COPY.NO_MATCHES_TITLE(query.trim())
                : MAP_PANEL_COPY.EMPTY_TABLE_TITLE
            }
            emptyDescription={
              rows.length > 0 ? MAP_PANEL_COPY.NO_MATCHES_DESC : MAP_PANEL_COPY.EMPTY_TABLE_DESC
            }
            renderCell={{
              object: (row) => (
                <Stack direction="row" spacing={1} alignItems="center" sx={{ minInlineSize: 0 }}>
                  {row.kind === 'object' && row.symbolType ? (
                    <ObjectSymbolIcon
                      symbolType={row.symbolType}
                      fontSize="small"
                      color="primary"
                    />
                  ) : (
                    <PentagonRoundedIcon
                      fontSize="small"
                      sx={{ color: row.polygonColor ?? 'secondary.main', flexShrink: 0 }}
                    />
                  )}
                  <Box sx={{ minInlineSize: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                      {row.object}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                      {row.subtitle}
                    </Typography>
                  </Box>
                </Stack>
              ),
              lat: (row) => (
                <Typography variant="body2" sx={{ fontFamily: (t) => t.fontMono }}>
                  {row.lat}
                </Typography>
              ),
              lon: (row) => (
                <Typography variant="body2" sx={{ fontFamily: (t) => t.fontMono }}>
                  {row.lon}
                </Typography>
              ),
            }}
          />
        </>
      )}
    </AppCard>
  )
}
