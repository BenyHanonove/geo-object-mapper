import { geoObjectProvider } from '@objects/providers/geoObject.provider'
import { polygonProvider } from '@polygons/providers/polygon.provider'
import { MESSAGES } from '@shared/constants/messages'
import { useGeoObjectsStore, usePolygonsStore, useSnackbarStore } from '@stores'
import type { IGeoObjectProvider } from '@objects/types/IGeoObjectProvider.types'
import type { IPolygonProvider } from '@polygons/types/IPolygonProvider.types'

export interface IAppInitProviders {
  polygons: IPolygonProvider
  objects: IGeoObjectProvider
}

const defaultProviders: IAppInitProviders = {
  polygons: polygonProvider,
  objects: geoObjectProvider,
}

let initPromise: Promise<void> | null = null

export const loadAppData = async (
  providers: IAppInitProviders = defaultProviders,
): Promise<void> => {
  if (initPromise) return initPromise

  initPromise = (async () => {
    const polygonsStore = usePolygonsStore.getState()
    const objectsStore = useGeoObjectsStore.getState()

    polygonsStore.setLoading(true)
    objectsStore.setLoading(true)

    const [polygonsResult, objectsResult] = await Promise.all([
      providers.polygons.list(),
      providers.objects.list(),
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
