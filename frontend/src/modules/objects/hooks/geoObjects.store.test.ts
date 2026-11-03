import { beforeEach, describe, expect, it } from 'vitest'
import { ObjectSymbolType } from '@objects/types/IGeoObject.types'
import { useGeoObjectsStore } from './geoObjects.store'

const store = () => useGeoObjectsStore.getState()

describe('geoObjects store placement flow', () => {
  beforeEach(() => {
    store().reset()
  })

  it('starts placement mode with custom jeep symbol and places RFC 7946 [lon, lat] Point draft', () => {
    store().startPlacing(ObjectSymbolType.JEEP)
    expect(store().isPlacing).toBe(true)
    expect(store().activeSymbol).toBe(ObjectSymbolType.JEEP)

    const draft = store().placeDraftObject({ lat: 32.0853, lon: 34.7818 })

    expect(draft.name).toBe('Jeep 1')
    expect(draft.symbolType).toBe(ObjectSymbolType.JEEP)
    expect(draft.geometry).toEqual({
      type: 'Point',
      coordinates: [34.7818, 32.0853],
    })
    expect(store().draftObjects).toHaveLength(1)
  })

  it('uses custom pendingName once and resets pendingName for subsequent placements', () => {
    store().startPlacing(ObjectSymbolType.MARKER)
    store().setPendingName('  HQ Checkpoint  ')

    const first = store().placeDraftObject({ lat: 32.04, lon: 34.79 })
    const second = store().placeDraftObject({ lat: 32.05, lon: 34.8 })

    expect(first.name).toBe('HQ Checkpoint')
    expect(store().pendingName).toBe('')
    expect(second.name).toBe('Marker 2')
  })

  it('skips auto-generated names already taken by saved objects', () => {
    store().set([
      {
        id: 'obj-1',
        name: 'Jeep 2',
        symbolType: ObjectSymbolType.JEEP,
        geometry: { type: 'Point', coordinates: [34.78, 32.08] },
        timestamp: '2026-11-03T10:00:00.000Z',
      },
    ])

    store().startPlacing(ObjectSymbolType.JEEP)
    const draft = store().placeDraftObject({ lat: 32.09, lon: 34.79 })

    expect(draft.name).toBe('Jeep 3')
  })

  it('removes individual and batched draft objects cleanly', () => {
    store().startPlacing(ObjectSymbolType.DRONE)
    const d1 = store().placeDraftObject({ lat: 32.01, lon: 34.75 })
    const d2 = store().placeDraftObject({ lat: 32.02, lon: 34.76 })
    const d3 = store().placeDraftObject({ lat: 32.03, lon: 34.77 })

    store().removeDraftObject(d1.tempId)
    expect(store().draftObjects.map((d) => d.tempId)).toEqual([d2.tempId, d3.tempId])

    store().removeDraftObjects([d2.tempId])
    expect(store().draftObjects.map((d) => d.tempId)).toEqual([d3.tempId])
  })
})
