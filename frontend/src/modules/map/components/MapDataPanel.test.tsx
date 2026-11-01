// Testing library matchers and cleanup imports
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Typed application environment configuration imports
import { AppThemeProvider } from '@plugins'

// Shared application components and services imports
import { loadAppData } from '@shared/services/app-init.service'

// Global Zustand stores and helpers imports
import { useGeoObjectsStore, usePolygonsStore } from '@stores'

// Local sibling module and definition imports
import { MapDataPanel } from './MapDataPanel'

vi.mock('@shared/services/app-init.service', () => ({ loadAppData: vi.fn() }))

// Renders the panel inside the app theme
const renderPanel = () =>
  render(
    <AppThemeProvider>
      <MapDataPanel />
    </AppThemeProvider>,
  )

describe('MapDataPanel', () => {
  beforeEach(() => {
    usePolygonsStore.getState().reset()
    useGeoObjectsStore.getState().reset()
    vi.mocked(loadAppData).mockClear()
  })

  it('shows the Object, Lat and Lon of saved entities', () => {
    useGeoObjectsStore.getState().set([
      {
        id: '1',
        timestamp: '2026-01-01T00:00:00.000Z',
        name: 'Jeep 1',
        symbolType: 'jeep',
        geometry: { type: 'Point', coordinates: [34.8, 32.1] },
      },
    ])
    usePolygonsStore.getState().set([])

    renderPanel()

    expect(screen.getByRole('columnheader', { name: 'Object' })).toBeInTheDocument()
    expect(screen.getByText('Jeep 1')).toBeInTheDocument()
    expect(screen.getByText('32.1000')).toBeInTheDocument()
    expect(screen.getByText('34.8000')).toBeInTheDocument()
  })

  it('shows an empty state when nothing is saved', () => {
    renderPanel()

    expect(screen.getByText('No saved geographic data')).toBeInTheDocument()
  })

  it('says when the filter matches nothing', async () => {
    useGeoObjectsStore.getState().set([
      {
        id: '1',
        timestamp: '2026-01-01T00:00:00.000Z',
        name: 'Jeep 1',
        symbolType: 'jeep',
        geometry: { type: 'Point', coordinates: [34.8, 32.1] },
      },
    ])

    renderPanel()
    await userEvent.type(screen.getByPlaceholderText('Filter saved map data…'), 'zzz')

    expect(screen.getByText('No results for "zzz"')).toBeInTheDocument()
    expect(screen.queryByText('No saved geographic data')).not.toBeInTheDocument()
  })

  it('offers Retry instead of the empty state when loading failed', async () => {
    usePolygonsStore.getState().setError('Unable to reach the server.')

    renderPanel()

    expect(screen.queryByText('No saved geographic data')).not.toBeInTheDocument()
    expect(screen.getByText('Unable to reach the server.')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Retry' }))

    expect(loadAppData).toHaveBeenCalledOnce()
  })
})
