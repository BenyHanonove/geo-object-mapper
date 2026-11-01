// HTTP client and status code imports
import { StatusCodes } from 'http-status-codes'

// Object feature module implementation imports
import geoObjectRepository from '@objects/repository/geoObject.repository'

// Shared application components and services imports
import { BaseCrudProvider } from '@shared/providers/BaseCrudProvider'

// Local type and interface definition imports
import type {
  ICreateGeoObject,
  IGeoObject,
  IUpdateGeoObject,
} from '@objects/types/IGeoObject.types'
import type { IGeoObjectRepository } from '@objects/types/IGeoObjectRepository.types'
import type { IProviderResult } from '@shared/types/api.types'

// Provider adding batch create and delete
class GeoObjectProvider extends BaseCrudProvider<
  IGeoObject,
  ICreateGeoObject,
  IUpdateGeoObject,
  IGeoObjectRepository
> {
  public createBatch(items: ICreateGeoObject[]): Promise<IProviderResult<IGeoObject[]>> {
    return this.safeCall(
      () => this.repository.createBatch(items),
      [StatusCodes.CREATED, StatusCodes.OK],
    )
  }

  // A single item uses the single create endpoint
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

// Singleton provider for geo object operations
export const geoObjectProvider = new GeoObjectProvider(geoObjectRepository)
