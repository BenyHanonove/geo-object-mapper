import { StatusCodes } from 'http-status-codes'
import polygonRepository from '@polygons/repository/polygon.repository'
import { BaseCrudProvider } from '@shared/providers/BaseCrudProvider'
import type { ICreatePolygon, IPolygon, IUpdatePolygon } from '@polygons/types/IPolygon.types'
import type { IPolygonProvider } from '@polygons/types/IPolygonProvider.types'
import type { IPolygonRepository } from '@polygons/types/IPolygonRepository.types'
import type { IProviderResult } from '@shared/types/api.types'

export class PolygonProvider
  extends BaseCrudProvider<IPolygon, ICreatePolygon, IUpdatePolygon, IPolygonRepository>
  implements IPolygonProvider
{
  public createBatch(items: ICreatePolygon[]): Promise<IProviderResult<IPolygon[]>> {
    return this.safeCall(
      () => this.repository.createBatch(items),
      [StatusCodes.CREATED, StatusCodes.OK],
    )
  }

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

export const polygonProvider: IPolygonProvider = new PolygonProvider(polygonRepository)
