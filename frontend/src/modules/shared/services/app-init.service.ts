// Object feature module implementation imports
import { geoObjectProvider } from '@objects/providers/geoObject.provider'

// Polygon feature module implementation imports
import { polygonProvider } from '@polygons/providers/polygon.provider'

// Shared application components and services imports
import { MESSAGES } from '@shared/constants/messages'

// Global Zustand stores and helpers imports
import { useGeoObjectsStore, usePolygonsStore, useSnackbarStore } from '@stores'

// Deduplicates concurrent app data load calls
let initPromise: Promise<void> | null = null

// Load polygons and objects into stores
export const loadAppData = async (): Promise<void> => {
  if (initPromise) return initPromise

  initPromise = (async () => {
    const polygonsStore = usePolygonsStore.getState()
    const objectsStore = useGeoObjectsStore.getState()

    polygonsStore.setLoading(true)
    objectsStore.setLoading(true)

    const [polygonsResult, objectsResult] = await Promise.all([
      polygonProvider.list(),
      geoObjectProvider.list(),
    ])

    if (polygonsResult.success && polygonsResult.data) {
      polygonsStore.set(polygonsResult.data)
    } else {
      polygonsStore.setError(polygonsResult.message || MESSAGES.INITIAL_LOAD_ERROR)
      useSnackbarStore
        .getState()
        .show(polygonsResult.message || MESSAGES.INITIAL_LOAD_ERROR, 'error')
    }

    if (objectsResult.success && objectsResult.data) {
      objectsStore.set(objectsResult.data)
    } else {
      objectsStore.setError(objectsResult.message || MESSAGES.INITIAL_LOAD_ERROR)
      useSnackbarStore
        .getState()
        .show(objectsResult.message || MESSAGES.INITIAL_LOAD_ERROR, 'error')
    }
  })()
    .catch(() => {
      usePolygonsStore.getState().setError(MESSAGES.INITIAL_LOAD_ERROR)
      useGeoObjectsStore.getState().setError(MESSAGES.INITIAL_LOAD_ERROR)
      useSnackbarStore.getState().show(MESSAGES.INITIAL_LOAD_ERROR, 'error')
    })
    .finally(() => {
      initPromise = null
    })

  return initPromise
}
