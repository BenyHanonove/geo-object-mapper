// Local type and interface definition imports
import type { ICreatePolygon, IPolygon, IUpdatePolygon } from './IPolygon.types'
import type { IApiResponse } from '@shared/types/api.types'

// Repository contract for polygon endpoints
export interface IPolygonRepository {
  list(ids?: string[]): Promise<IApiResponse<IPolygon[]>>
  get(id: string): Promise<IApiResponse<IPolygon>>
  create(data: ICreatePolygon): Promise<IApiResponse<IPolygon>>
  createBatch(items: ICreatePolygon[]): Promise<IApiResponse<IPolygon[]>>
  update(id: string, data: IUpdatePolygon): Promise<IApiResponse<IPolygon>>
  delete(id: string): Promise<IApiResponse<boolean>>
  deleteAll(): Promise<IApiResponse<boolean>>
}
