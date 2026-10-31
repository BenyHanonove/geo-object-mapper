// HTTP client and status code imports
import type { AxiosResponse } from 'axios'

// Local sibling module and definition imports
import { httpClient } from './httpClient'

// Local type and interface definition imports
import type { IApiEnvelope, IApiResponse } from '@shared/types/api.types'

// Type guard for plain object values
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

// Generic REST repository unwrapping API envelopes
export class BaseRepository<TEntity, TCreate, TUpdate> {
  protected readonly endpoint: string
  protected readonly collectionKey: string
  protected readonly itemKey: string

  public constructor(endpoint: string, collectionKey: string, itemKey: string) {
    this.endpoint = endpoint
    this.collectionKey = collectionKey
    this.itemKey = itemKey
  }

  protected wrap<TResult>(
    response: AxiosResponse<IApiEnvelope<unknown>>,
    key: string | null,
    fallback: TResult,
  ): IApiResponse<TResult> {
    const body = response.data
    const message = typeof body?.message === 'string' ? body.message : ''
    const payload = body?.data

    let extracted: TResult = fallback
    if (key && isRecord(payload) && key in payload && payload[key] !== undefined) {
      extracted = payload[key] as object as TResult
    } else if (payload !== undefined && payload !== null) {
      extracted = payload as object as TResult
    }

    // Reject malformed list payloads before they reach the stores
    if (Array.isArray(fallback) && !Array.isArray(extracted)) {
      throw new TypeError(`Expected a list from ${this.endpoint}`)
    }

    return {
      statusCode: response.status,
      message,
      data: extracted,
    }
  }

  public async list(ids?: string[]): Promise<IApiResponse<TEntity[]>> {
    const params = ids && ids.length > 0 ? { ids: ids.join(',') } : undefined
    const response = await httpClient.get<IApiEnvelope<unknown>>(this.endpoint, { params })
    return this.wrap<TEntity[]>(response, this.collectionKey, [])
  }

  public async get(id: string): Promise<IApiResponse<TEntity>> {
    const response = await httpClient.get<IApiEnvelope<unknown>>(`${this.endpoint}/${id}`)
    return this.wrap<TEntity>(response, this.itemKey, {} as object as TEntity)
  }

  public async create(data: TCreate): Promise<IApiResponse<TEntity>> {
    const response = await httpClient.post<IApiEnvelope<unknown>>(this.endpoint, data)
    return this.wrap<TEntity>(response, this.itemKey, {} as object as TEntity)
  }

  public async update(id: string, data: TUpdate): Promise<IApiResponse<TEntity>> {
    const response = await httpClient.put<IApiEnvelope<unknown>>(`${this.endpoint}/${id}`, data)
    return this.wrap<TEntity>(response, this.itemKey, {} as object as TEntity)
  }

  public async delete(id: string): Promise<IApiResponse<boolean>> {
    const response = await httpClient.delete<IApiEnvelope<unknown>>(`${this.endpoint}/${id}`)
    return this.wrap<boolean>(response, null, true)
  }
}
