const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '')

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `API request failed with status ${response.status}`)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export const api = {
  recipes: {
    list: (params = '') => apiFetch(`/api/v1/recipes/${params ? `?${params}` : ''}`),
    search: (q: string, params = '') => apiFetch(`/api/v1/recipes/search?q=${encodeURIComponent(q)}${params ? `&${params}` : ''}`),
    get: (id: number) => apiFetch(`/api/v1/recipes/${id}`),
  },
  routines: {
    list: (params = '') => apiFetch(`/api/v1/routines/${params ? `?${params}` : ''}`),
    search: (q: string, params = '') => apiFetch(`/api/v1/routines/search?q=${encodeURIComponent(q)}${params ? `&${params}` : ''}`),
    get: (id: number) => apiFetch(`/api/v1/routines/${id}`),
  },
  cart: {
    get: (days = 7) => apiFetch(`/api/v1/cart/?days=${days}`),
  },
  categories: {
    list: (page = 1, pageSize = 20) => apiFetch(`/api/v1/categories/?page=${page}&page_size=${pageSize}`),
    search: (q: string) => apiFetch(`/api/v1/categories/search?q=${encodeURIComponent(q)}`),
  },
  ingredients: {
    list: (page = 1, pageSize = 20) => apiFetch(`/api/v1/ingredients/?page=${page}&page_size=${pageSize}`),
    search: (q: string) => apiFetch(`/api/v1/ingredients/search?q=${encodeURIComponent(q)}`),
  },
}
