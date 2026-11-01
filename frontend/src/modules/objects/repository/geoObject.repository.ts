// Shared application components and services imports
import { BaseRepository } from '@shared/repository/BaseRepository'
import { httpClient } from '@shared/repository/httpClient'

// Local type and interface definition imports
import type {
  ICreateGeoObject,
  IGeoObject,
  IUpdateGeoObject,
} from '@objects/types/IGeoObject.types'
import type { IGeoObjectRepository } from '@objects/types/IGeoObjectRepository.types'
import type { IApiEnvelope, IApiResponse } from '@shared/types/api.types'

// Repository adding batch object REST endpoints
class GeoObjectRepository
  extends BaseRepository<IGeoObject, ICreateGeoObject, IUpdateGeoObject>
  implements IGeoObjectRepository
{
  public constructor() {
    super('/objects', 'objects', 'object')
  }

  public async createBatch(items: ICreateGeoObject[]): Promise<IApiResponse<IGeoObject[]>> {
    const response = await httpClient.post<IApiEnvelope<unknown>>(`${this.endpoint}/batch`, {
      objects: items,
    })
    return this.wrap<IGeoObject[]>(response, this.collectionKey, [])
  }

  public async deleteAll(): Promise<IApiResponse<boolean>> {
    const response = await httpClient.delete<IApiEnvelope<unknown>>(this.endpoint)
    return this.wrap<boolean>(response, null, true)
  }
}

// Singleton repository for geo object endpoints
const geoObjectRepository: IGeoObjectRepository = new GeoObjectRepository()
export default geoObjectRepository
