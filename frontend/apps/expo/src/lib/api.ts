import Constants from 'expo-constants'

const FALLBACK_API_URL = 'http://localhost:8000'

export const API_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  process.env.EXPO_PUBLIC_API_URL ||
  Constants.expoConfig?.extra?.apiUrl ||
  FALLBACK_API_URL

export class ApiError extends Error {
  status: number
  details?: unknown

  constructor(message: string, status: number, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

type ApiOptions = RequestInit & { token?: string | null }

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { token, ...rest } = options
  const headers = new Headers(rest.headers)
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers,
  })

  const contentType = response.headers.get('content-type') || ''
  const hasJson = contentType.includes('application/json')
  const data = hasJson ? await response.json().catch(() => null) : null

  if (!response.ok) {
    const message =
      (data && typeof data === 'object' && 'detail' in data && String(data.detail)) ||
      'Something went wrong. Please try again.'
    throw new ApiError(message, response.status, data)
  }

  return data as T
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Something went wrong. Please try again.'
}
