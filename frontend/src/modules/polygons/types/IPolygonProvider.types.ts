import type { ICreatePolygon, IPolygon, IUpdatePolygon } from './IPolygon.types'
import type { ICrudProvider } from '@shared/providers/BaseCrudProvider'
import type { IProviderResult } from '@shared/types/api.types'

export interface IPolygonProvider
  extends ICrudProvider<IPolygon, ICreatePolygon, IUpdatePolygon> {
  createBatch(items: ICreatePolygon[]): Promise<IProviderResult<IPolygon[]>>
  save(items: ICreatePolygon[]): Promise<IProviderResult<IPolygon[]>>
  deleteAll(): Promise<IProviderResult<boolean>>
}
