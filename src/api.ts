import axios from 'axios'
import { keycloak } from './keycloak'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '')

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use(async (config) => {
  if (keycloak.authenticated) {
    try {
      await keycloak.updateToken(30)
    } catch (error) {
      console.warn('Unable to refresh Keycloak token', error)
    }
  }
  if (keycloak.token) config.headers.Authorization = `Bearer ${keycloak.token}`
  return config
})

export const api = {
  recipes: {
    list: (params?: Record<string, unknown>) => apiClient.get('/api/v1/recipes/', { params }),
    search: (q: string, params?: Record<string, unknown>) => apiClient.get('/api/v1/recipes/search', { params: { q, ...params } }),
    get: (id: number | string) => apiClient.get(`/api/v1/recipes/${id}`),
  },
  routines: {
    list: (params?: Record<string, unknown>) => apiClient.get('/api/v1/routines/', { params }),
    search: (q: string, params?: Record<string, unknown>) => apiClient.get('/api/v1/routines/search', { params: { q, ...params } }),
    get: (id: number | string) => apiClient.get(`/api/v1/routines/${id}`),
  },
  cart: {
    get: (days = 7) => apiClient.get('/api/v1/cart/', { params: { days } }),
  },
  categories: {
    list: (page = 1, pageSize = 20) => apiClient.get('/api/v1/categories/', { params: { page, page_size: pageSize } }),
    search: (q: string) => apiClient.get('/api/v1/categories/search', { params: { q } }),
  },
  ingredients: {
    list: (page = 1, pageSize = 20) => apiClient.get('/api/v1/ingredients/', { params: { page, page_size: pageSize } }),
    search: (q: string) => apiClient.get('/api/v1/ingredients/search', { params: { q } }),
  },
}
