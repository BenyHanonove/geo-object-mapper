// Raw response body sent by server
export interface IApiEnvelope<TData = unknown> {
  message: string
  data: TData
}

// Error body from server ProblemDetails or mock adapter
export interface IApiProblem {
  detail?: string
  message?: string
}

// Repository result with HTTP status code
export interface IApiResponse<T> {
  statusCode: number
  message: string
  data: T
}

// Provider result with success flag
export interface IProviderResult<T> {
  success: boolean
  message: string
  data: T | null
  statusCode: number
}
