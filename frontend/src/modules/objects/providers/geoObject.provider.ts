import { StatusCodes } from 'http-status-codes'
import geoObjectRepository from '@objects/repository/geoObject.repository'
import { BaseCrudProvider } from '@shared/providers/BaseCrudProvider'
import type {
  ICreateGeoObject,
  IGeoObject,
  IUpdateGeoObject,
} from '@objects/types/IGeoObject.types'
import type { IGeoObjectProvider } from '@objects/types/IGeoObjectProvider.types'
import type { IGeoObjectRepository } from '@objects/types/IGeoObjectRepository.types'
import type { IProviderResult } from '@shared/types/api.types'

export class GeoObjectProvider
  extends BaseCrudProvider<IGeoObject, ICreateGeoObject, IUpdateGeoObject, IGeoObjectRepository>
  implements IGeoObjectProvider
{
  public createBatch(items: ICreateGeoObject[]): Promise<IProviderResult<IGeoObject[]>> {
    return this.safeCall(
      () => this.repository.createBatch(items),
      [StatusCodes.CREATED, StatusCodes.OK],
    )
  }

  public async save(items: ICreateGeoObject[]): Promise<IProviderResult<IGeoObject[]>> {
    if (items.length !== 1) return this.createBatch(items)

    const result = await this.create(items[0])
    return { ...result, data: result.data ? [result.data] : null }
  }

  public deleteAll(): Promise<IProviderResult<boolean>> {
    return this.safeCall(
      () => this.repository.deleteAll(),
      [StatusCodes.OK, StatusCodes.NO_CONTENT],
    )
  }
}

export const geoObjectProvider: IGeoObjectProvider = new GeoObjectProvider(geoObjectRepository)
