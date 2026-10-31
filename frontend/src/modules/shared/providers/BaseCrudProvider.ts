// HTTP client and status code imports
import axios from 'axios'
import { StatusCodes } from 'http-status-codes'

// Shared application components and services imports
import { MESSAGES } from '@shared/constants/messages'

// Local type and interface definition imports
import type { IApiProblem, IApiResponse, IProviderResult } from '@shared/types/api.types'

// Repository contract required by crud providers
export interface ICrudRepository<TEntity, TCreate, TUpdate> {
  list(ids?: string[]): Promise<IApiResponse<TEntity[]>>
  get(id: string): Promise<IApiResponse<TEntity>>
  create(data: TCreate): Promise<IApiResponse<TEntity>>
  update(id: string, data: TUpdate): Promise<IApiResponse<TEntity>>
  delete(id: string): Promise<IApiResponse<boolean>>
}

// Stateless provider wrapper: never re-throws, never logs, preserves HTTP statusCode
export class BaseCrudProvider<
  TEntity,
  TCreate,
  TUpdate,
  TRepo extends ICrudRepository<TEntity, TCreate, TUpdate> = ICrudRepository<TEntity, TCreate, TUpdate>,
> {
  protected readonly repository: TRepo

  public constructor(repository: TRepo) {
    this.repository = repository
  }

  protected async safeCall<T>(
    operation: () => Promise<IApiResponse<T>>,
    expectedStatuses: number[] = [StatusCodes.OK],
  ): Promise<IProviderResult<T>> {
    try {
      const response = await operation()
      const success = expectedStatuses.includes(response.statusCode)
      return {
        success,
        message: response.message || (success ? '' : MESSAGES.UNEXPECTED_ERROR),
        data: success ? response.data : null,
        statusCode: response.statusCode,
      }
    } catch (err: unknown) {
      if (axios.isAxiosError<IApiProblem>(err)) {
        const statusCode = err.response?.status ?? StatusCodes.SERVICE_UNAVAILABLE
        const serverMessage = err.response?.data?.detail || err.response?.data?.message
        const fallback =
          statusCode === StatusCodes.CONFLICT
            ? MESSAGES.CONFLICT_ERROR
            : err.response
              ? MESSAGES.UNEXPECTED_ERROR
              : MESSAGES.NETWORK_ERROR

        return {
          success: false,
          message: serverMessage || fallback,
          data: null,
          statusCode,
        }
      }

      return {
        success: false,
        message: MESSAGES.UNEXPECTED_ERROR,
        data: null,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      }
    }
  }

  public list(ids?: string[]): Promise<IProviderResult<TEntity[]>> {
    return this.safeCall(() => this.repository.list(ids), [StatusCodes.OK])
  }

  public get(id: string): Promise<IProviderResult<TEntity>> {
    return this.safeCall(() => this.repository.get(id), [StatusCodes.OK])
  }

  public create(data: TCreate): Promise<IProviderResult<TEntity>> {
    return this.safeCall(() => this.repository.create(data), [StatusCodes.CREATED, StatusCodes.OK])
  }

  public update(id: string, data: TUpdate): Promise<IProviderResult<TEntity>> {
    return this.safeCall(() => this.repository.update(id, data), [StatusCodes.OK])
  }

  public delete(id: string): Promise<IProviderResult<boolean>> {
    return this.safeCall(
      () => this.repository.delete(id),
      [StatusCodes.OK, StatusCodes.NO_CONTENT],
    )
  }
}
