import type {
  ICreateGeoObject,
  IGeoObject,
  IUpdateGeoObject,
} from './IGeoObject.types'
import type { ICrudProvider } from '@shared/providers/BaseCrudProvider'
import type { IProviderResult } from '@shared/types/api.types'

export interface IGeoObjectProvider
  extends ICrudProvider<IGeoObject, ICreateGeoObject, IUpdateGeoObject> {
  createBatch(items: ICreateGeoObject[]): Promise<IProviderResult<IGeoObject[]>>
  save(items: ICreateGeoObject[]): Promise<IProviderResult<IGeoObject[]>>
  deleteAll(): Promise<IProviderResult<boolean>>
}
