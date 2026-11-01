// Local type and interface definition imports
import type {
  ICreateGeoObject,
  IGeoObject,
  IUpdateGeoObject,
} from './IGeoObject.types'
import type { IApiResponse } from '@shared/types/api.types'

// Repository contract for geo object endpoints
export interface IGeoObjectRepository {
  list(ids?: string[]): Promise<IApiResponse<IGeoObject[]>>
  get(id: string): Promise<IApiResponse<IGeoObject>>
  create(data: ICreateGeoObject): Promise<IApiResponse<IGeoObject>>
  createBatch(items: ICreateGeoObject[]): Promise<IApiResponse<IGeoObject[]>>
  update(id: string, data: IUpdateGeoObject): Promise<IApiResponse<IGeoObject>>
  delete(id: string): Promise<IApiResponse<boolean>>
  deleteAll(): Promise<IApiResponse<boolean>>
}
