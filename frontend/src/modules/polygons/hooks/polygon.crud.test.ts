import { act, renderHook } from '@testing-library/react'
import { StatusCodes } from 'http-status-codes'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GeoObjectProvider } from '@objects/providers/geoObject.provider'
import { ObjectSymbolType } from '@objects/types/IGeoObject.types'
import { PolygonProvider } from '@polygons/providers/polygon.provider'
import { useGeoObjectCrud } from '@objects/hooks/geoObject.crud'
import { usePolygonCrud } from './polygon.crud'
import { useGeoObjectsStore, useMapWorkspaceStore, usePolygonsStore } from '@stores'
import type { IGeoObject } from '@objects/types/IGeoObject.types'
import type { IGeoObjectProvider } from '@objects/types/IGeoObjectProvider.types'
import type { IGeoObjectRepository } from '@objects/types/IGeoObjectRepository.types'
import type { IPolygon } from '@polygons/types/IPolygon.types'
import type { IPolygonProvider } from '@polygons/types/IPolygonProvider.types'
import type { IPolygonRepository } from '@polygons/types/IPolygonRepository.types'

const TRIANGLE = [
  { lat: 32.04, lon: 34.78 },
  { lat: 32.04, lon: 34.81 },
  { lat: 32.07, lon: 34.81 },
]

const createMockPolygonProvider = (
  overrides: Partial<IPolygonProvider> = {},
): IPolygonProvider => ({
  list: vi.fn(),
  get: vi.fn(),
  create: vi.fn(),
  createBatch: vi.fn(),
  save: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  deleteAll: vi.fn(),
  ...overrides,
})

const createMockGeoObjectProvider = (
  overrides: Partial<IGeoObjectProvider> = {},
): IGeoObjectProvider => ({
  list: vi.fn(),
  get: vi.fn(),
  create: vi.fn(),
  createBatch: vi.fn(),
  save: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  deleteAll: vi.fn(),
  ...overrides,
})

describe('CRUD hooks and provider contracts', () => {
  beforeEach(() => {
    usePolygonsStore.getState().reset()
    useGeoObjectsStore.getState().reset()
    useMapWorkspaceStore.getState().reset()
  })

  it('auto-closes an active 3-vertex polygon on Save and persists via IPolygonProvider', async () => {
    const savedPolygon: IPolygon = {
      id: 'poly-101',
      name: 'Polygon 1',
      color: '#2563EB',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [34.78, 32.04],
            [34.81, 32.04],
            [34.81, 32.07],
            [34.78, 32.04],
          ],
        ],
      },
      timestamp: '2026-11-03T12:00:00.000Z',
    }

    const saveMock = vi.fn().mockResolvedValue({
      success: true,
      message: 'Saved "Polygon 1" to MongoDB (GeoJSON).',
      data: [savedPolygon],
      statusCode: StatusCodes.CREATED,
    })

    const provider = createMockPolygonProvider({ save: saveMock })
    const { result } = renderHook(() => usePolygonCrud(provider))

    act(() => {
      result.current.handleStartAdd()
      TRIANGLE.forEach((pt) => result.current.handleAddVertex(pt))
    })

    await act(async () => {
      await result.current.handleSave()
    })

    expect(saveMock).toHaveBeenCalledTimes(1)
    expect(usePolygonsStore.getState().items).toEqual([savedPolygon])
    expect(usePolygonsStore.getState().draftPolygons).toHaveLength(0)
    expect(usePolygonsStore.getState().isDrawing).toBe(false)
  })

  it('handles 204 No Content when deleting a selected saved polygon', async () => {
    const existing: IPolygon = {
      id: 'poly-del-1',
      name: 'Zone A',
      color: '#2563EB',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [34.78, 32.04],
            [34.81, 32.04],
            [34.81, 32.07],
            [34.78, 32.04],
          ],
        ],
      },
      timestamp: '2026-11-03T12:00:00.000Z',
    }

    usePolygonsStore.getState().set([existing])
    useMapWorkspaceStore.getState().selectOnMap({
      kind: 'polygon',
      id: existing.id,
      name: existing.name,
      isDraft: false,
    })

    const deleteMock = vi.fn().mockResolvedValue({
      success: true,
      message: '',
      data: true,
      statusCode: StatusCodes.NO_CONTENT,
    })

    const provider = createMockPolygonProvider({ delete: deleteMock })
    const { result } = renderHook(() => usePolygonCrud(provider))

    await act(async () => {
      await result.current.handleDelete()
    })

    expect(deleteMock).toHaveBeenCalledWith('poly-del-1')
    expect(usePolygonsStore.getState().items).toEqual([])
    expect(useMapWorkspaceStore.getState().selection).toBeNull()
  })

  it('reloads latest server version automatically on 409 Conflict during object update', async () => {
    const stale: IGeoObject = {
      id: 'obj-99',
      name: 'Jeep 1',
      symbolType: ObjectSymbolType.JEEP,
      geometry: { type: 'Point', coordinates: [34.78, 32.08] },
      timestamp: '2026-11-03T10:00:00.000Z',
    }
    const freshFromServer: IGeoObject = {
      ...stale,
      name: 'Server Updated Jeep',
      timestamp: '2026-11-03T10:05:00.000Z',
    }

    useGeoObjectsStore.getState().set([stale])

    const updateMock = vi.fn().mockResolvedValue({
      success: false,
      message: 'Object was modified elsewhere. Loaded latest version.',
      data: null,
      statusCode: StatusCodes.CONFLICT,
    })
    const getMock = vi.fn().mockResolvedValue({
      success: true,
      message: '',
      data: freshFromServer,
      statusCode: StatusCodes.OK,
    })

    const provider = createMockGeoObjectProvider({ update: updateMock, get: getMock })
    const { result } = renderHook(() => useGeoObjectCrud(provider))

    await act(async () => {
      await result.current.handleUpdate(stale.id, { name: 'My Conflicting Edit' })
    })

    expect(updateMock).toHaveBeenCalledTimes(1)
    expect(getMock).toHaveBeenCalledWith(stale.id)
    expect(useGeoObjectsStore.getState().get(stale.id)?.name).toBe('Server Updated Jeep')
  })

  it('routes single save to create() and multi-item save to createBatch() in providers', async () => {
    const repo: IPolygonRepository = {
      list: vi.fn(),
      get: vi.fn(),
      create: vi.fn().mockResolvedValue({
        statusCode: StatusCodes.CREATED,
        message: 'Created one',
        data: { id: 'p1', name: 'One', geometry: { type: 'Polygon', coordinates: [] }, timestamp: 't' },
      }),
      createBatch: vi.fn().mockResolvedValue({
        statusCode: StatusCodes.CREATED,
        message: 'Created two',
        data: [
          { id: 'p1', name: 'One', geometry: { type: 'Polygon', coordinates: [] }, timestamp: 't' },
          { id: 'p2', name: 'Two', geometry: { type: 'Polygon', coordinates: [] }, timestamp: 't' },
        ],
      }),
      update: vi.fn(),
      delete: vi.fn(),
      deleteAll: vi.fn(),
    }

    const polyProvider = new PolygonProvider(repo)
    const singlePayload = [{ name: 'One', geometry: { type: 'Polygon' as const, coordinates: [] } }]
    const batchPayload = [
      { name: 'One', geometry: { type: 'Polygon' as const, coordinates: [] } },
      { name: 'Two', geometry: { type: 'Polygon' as const, coordinates: [] } },
    ]

    const singleRes = await polyProvider.save(singlePayload)
    expect(repo.create).toHaveBeenCalledTimes(1)
    expect(repo.createBatch).not.toHaveBeenCalled()
    expect(singleRes.data).toHaveLength(1)

    const batchRes = await polyProvider.save(batchPayload)
    expect(repo.createBatch).toHaveBeenCalledTimes(1)
    expect(batchRes.data).toHaveLength(2)

    const objRepo: IGeoObjectRepository = {
      list: vi.fn(),
      get: vi.fn(),
      create: vi.fn(),
      createBatch: vi.fn(),
      update: vi.fn(),
      delete: vi.fn().mockResolvedValue({
        statusCode: StatusCodes.NO_CONTENT,
        message: '',
        data: true,
      }),
      deleteAll: vi.fn(),
    }
    const objProvider = new GeoObjectProvider(objRepo)
    const delRes = await objProvider.delete('obj-1')
    expect(delRes.success).toBe(true)
    expect(delRes.statusCode).toBe(StatusCodes.NO_CONTENT)
  })
})
