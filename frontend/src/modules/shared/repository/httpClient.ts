import axios from 'axios'

import { env } from '@plugins'

// Shared axios instance for API calls
export const httpClient = axios.create({
  baseURL: env.api.baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})
