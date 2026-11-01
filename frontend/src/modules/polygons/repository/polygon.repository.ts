// Shared application components and services imports
import { BaseRepository } from '@shared/repository/BaseRepository'
import { httpClient } from '@shared/repository/httpClient'

// Local type and interface definition imports
import type { ICreatePolygon, IPolygon, IUpdatePolygon } from '@polygons/types/IPolygon.types'
import type { IPolygonRepository } from '@polygons/types/IPolygonRepository.types'
import type { IApiEnvelope, IApiResponse } from '@shared/types/api.types'

// Repository adding batch polygon REST endpoints
class PolygonRepository
  extends BaseRepository<IPolygon, ICreatePolygon, IUpdatePolygon>
  implements IPolygonRepository
{
  public constructor() {
    super('/polygons', 'polygons', 'polygon')
  }

  public async createBatch(items: ICreatePolygon[]): Promise<IApiResponse<IPolygon[]>> {
    const response = await httpClient.post<IApiEnvelope<unknown>>(`${this.endpoint}/batch`, {
      polygons: items,
    })
    return this.wrap<IPolygon[]>(response, this.collectionKey, [])
  }

  public async deleteAll(): Promise<IApiResponse<boolean>> {
    const response = await httpClient.delete<IApiEnvelope<unknown>>(this.endpoint)
    return this.wrap<boolean>(response, null, true)
  }
}

// Singleton repository for polygon endpoints
const polygonRepository: IPolygonRepository = new PolygonRepository()
export default polygonRepository
