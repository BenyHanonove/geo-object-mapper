// Unit test framework imports
import { beforeEach, describe, expect, it } from 'vitest'

// Local sibling module and definition imports
import { usePolygonsStore } from './polygons.store'

// Three vertices forming a valid triangle
const TRIANGLE = [
  { lat: 32, lon: 34 },
  { lat: 32, lon: 35 },
  { lat: 33, lon: 35 },
]

// Reads the current store state
const store = () => usePolygonsStore.getState()

describe('polygons store drawing flow', () => {
  beforeEach(() => {
    store().reset()
    store().startDrawing()
  })

  it('refuses to close with fewer than three vertices', () => {
    store().appendVertex(TRIANGLE[0])
    store().appendVertex(TRIANGLE[1])

    expect(store().closeActivePolygon()).toBeNull()
    expect(store().isDrawing).toBe(true)
    expect(store().draftPolygons).toHaveLength(0)
  })

  it('turns three vertices into a closed draft and leaves drawing mode', () => {
    TRIANGLE.forEach(store().appendVertex)

    const draft = store().closeActivePolygon()

    expect(draft?.name).toBe('Polygon 1')
    expect(draft?.geometry.coordinates[0]).toHaveLength(4)
    expect(store().isDrawing).toBe(false)
    expect(store().draftPolygons).toEqual([draft])
  })

  it('ignores a repeated click on the last vertex', () => {
    store().appendVertex(TRIANGLE[0])
    store().appendVertex(TRIANGLE[0])

    expect(store().activeVertices).toHaveLength(1)
  })

  it('undoes the last vertex', () => {
    TRIANGLE.forEach(store().appendVertex)

    store().undoVertex()

    expect(store().activeVertices).toEqual(TRIANGLE.slice(0, 2))
  })

  it('skips auto names that are already taken', () => {
    store().setPendingName('Polygon 2')
    TRIANGLE.forEach(store().appendVertex)
    store().closeActivePolygon()

    store().startDrawing()
    TRIANGLE.forEach(store().appendVertex)

    expect(store().closeActivePolygon()?.name).toBe('Polygon 3')
  })
})
