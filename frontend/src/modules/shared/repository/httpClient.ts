// HTTP client and status code imports
import axios from 'axios'

// Typed application environment configuration imports
import { env } from '@plugins'

// Shared axios instance for API calls
export const httpClient = axios.create({
  baseURL: env.api.baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})
