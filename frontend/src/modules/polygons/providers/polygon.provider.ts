// HTTP client and status code imports
import { StatusCodes } from 'http-status-codes'

// Polygon feature module implementation imports
import polygonRepository from '@polygons/repository/polygon.repository'

// Shared application components and services imports
import { BaseCrudProvider } from '@shared/providers/BaseCrudProvider'

// Local type and interface definition imports
import type { ICreatePolygon, IPolygon, IUpdatePolygon } from '@polygons/types/IPolygon.types'
import type { IPolygonRepository } from '@polygons/types/IPolygonRepository.types'
import type { IProviderResult } from '@shared/types/api.types'

// Provider adding batch create and delete
class PolygonProvider extends BaseCrudProvider<
  IPolygon,
  ICreatePolygon,
  IUpdatePolygon,
  IPolygonRepository
> {
  public createBatch(items: ICreatePolygon[]): Promise<IProviderResult<IPolygon[]>> {
    return this.safeCall(
      () => this.repository.createBatch(items),
      [StatusCodes.CREATED, StatusCodes.OK],
    )
  }

  // A single item uses the single create endpoint
  public async save(items: ICreatePolygon[]): Promise<IProviderResult<IPolygon[]>> {
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

// Singleton provider for polygon operations
export const polygonProvider = new PolygonProvider(polygonRepository)
