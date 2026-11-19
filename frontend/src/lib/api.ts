import { isMultipartPayload, toFormData } from './axios'
import { ApiError, handleApiResponse } from './responseHandler'

export const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    if (envUrl && !envUrl.includes('127.0.0.1') && !envUrl.includes('localhost')) {
      return envUrl
    }
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return '/api/v1'
    }
    return envUrl || 'http://127.0.0.1:5000/api/v1'
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:5000/api/v1'
}

export interface ApiResponse<T = any> {
  success?: boolean
  data?: T
  error?: string
  status: number
  message?: string
}

export interface ApiRequestOptions extends RequestInit {
  onUploadProgress?: (progressEvent: { loaded: number; total?: number; progress?: number }) => void
  params?: Record<string, any>
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  const directToken = localStorage.getItem('saampark_token')
  if (directToken) return directToken

  try {
    const raw = localStorage.getItem('saampark-auth-v3')
    if (raw) {
      const parsed = JSON.parse(raw)
      const token = parsed?.state?.token
      if (token && typeof token === 'string') {
        localStorage.setItem('saampark_token', token)
        return token
      }
    }
  } catch {}

  try {
    const { useAuthStore } = require('@/store/useAuthStore')
    const storeToken = useAuthStore.getState()?.token
    if (storeToken && typeof storeToken === 'string') {
      localStorage.setItem('saampark_token', storeToken)
      return storeToken
    }
  } catch {}

  return null
}

export function setAuthToken(token: string | null) {
  if (typeof window === 'undefined') return
  if (token) {
    localStorage.setItem('saampark_token', token)
  } else {
    localStorage.removeItem('saampark_token')
    localStorage.removeItem('token')
  }
}

export function getActiveCompanyScope(): {
  companyId?: string
  branchId?: string
  subBranchId?: string
  userRole?: string
  userId?: string
  userEmail?: string
} {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem('saampark-auth-v3')
    if (raw) {
      const parsed = JSON.parse(raw)
      const state = parsed?.state
      return {
        companyId: state?.activeCompanyId || state?.user?.companyId,
        branchId: state?.activeBranchId || state?.user?.branchId,
        subBranchId: state?.activeSubBranchId || state?.user?.subBranchId,
        userRole: state?.user?.role,
        userId: state?.user?.id ? String(state?.user?.id) : undefined,
        userEmail: state?.user?.email,
      }
    }
  } catch {}
  return {}
}

function prepareBodyAndHeaders(
  rawBody: any,
  rawHeaders?: HeadersInit
): { body?: BodyInit; headers: Record<string, string>; isMultipart: boolean } {
  const headers: Record<string, string> = {
    ...((rawHeaders as Record<string, string>) || {}),
  }
  const multipart = isMultipartPayload(rawBody, headers)

  if (rawBody === undefined || rawBody === null) {
    if (!multipart && !headers['Content-Type'] && !headers['content-type']) {
      headers['Content-Type'] = 'application/json'
    }
    return { body: undefined, headers, isMultipart: false }
  }

  if (multipart) {
    // Always convert to FormData and omit Content-Type header so browser sets multipart boundary
    const formData = toFormData(rawBody)
    delete headers['Content-Type']
    delete headers['content-type']
    return { body: formData, headers, isMultipart: true }
  }

  if (!headers['Content-Type'] && !headers['content-type']) {
    headers['Content-Type'] = 'application/json'
  }

  const serializedBody = typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody)
  return { body: serializedBody, headers, isMultipart: false }
}

async function request<T = any>(endpoint: string, options: ApiRequestOptions = {}, rawBody?: any): Promise<T> {
  const token = getAuthToken()
  const scope = getActiveCompanyScope()

  const { body, headers, isMultipart } = prepareBodyAndHeaders(
    rawBody !== undefined ? rawBody : options.body,
    options.headers
  )

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`
  }
  if (scope.companyId && !headers['x-company-id']) {
    headers['x-company-id'] = String(scope.companyId)
  }
  if (scope.branchId && !headers['x-branch-id']) {
    headers['x-branch-id'] = String(scope.branchId)
  }
  if (scope.subBranchId && !headers['x-sub-branch-id']) {
    headers['x-sub-branch-id'] = String(scope.subBranchId)
  }
  if (scope.userRole && !headers['x-user-role']) {
    headers['x-user-role'] = String(scope.userRole)
  }
  if (scope.userId && !headers['x-user-id']) {
    headers['x-user-id'] = String(scope.userId)
  }
  if (scope.userEmail && !headers['x-user-email']) {
    headers['x-user-email'] = String(scope.userEmail)
  }

  const baseUrl = getBaseUrl()
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  let url = `${baseUrl}${cleanEndpoint}`

  if (options.params && Object.keys(options.params).length > 0) {
    const sp = new URLSearchParams()
    Object.entries(options.params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') sp.append(k, String(v))
    })
    const qs = sp.toString()
    if (qs) url += `${url.includes('?') ? '&' : '?'}${qs}`
  }

  // Use Axios XHR transport for multipart uploads when progress callback is provided
  if (isMultipart && options.onUploadProgress && typeof window !== 'undefined') {
    const { axiosInstance } = await import('./axios')
    const res = await axiosInstance.request<T>({
      url: cleanEndpoint,
      method: options.method || 'POST',
      data: body,
      headers,
      onUploadProgress: options.onUploadProgress,
    })
    return handleApiResponse<T>(res.data, res.status)
  }

  const controller = new AbortController()
  const timeoutMs = isMultipart ? 30000 : 12000
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      ...options,
      body,
      headers,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData?.message || errorData?.error || `Request failed with status ${response.status}`

      if (response.status === 401 && typeof window !== 'undefined') {
        const isAuthVerification =
          endpoint.includes('/auth/me') || endpoint.includes('/auth/check') || endpoint.includes('/auth/verify')
        const isLoginPage = window.location.pathname.includes('/login')
        if (isAuthVerification && !isLoginPage) {
          const lastLoginTime = Number(localStorage.getItem('saampark_last_activity_time') || 0)
          const justLoggedIn = Date.now() - lastLoginTime < 30000
          if (!justLoggedIn) {
            try {
              const { useAuthStore } = require('@/store/useAuthStore')
              useAuthStore.getState().logout()
            } catch {}
            try {
              localStorage.removeItem('saampark-auth-v3')
              localStorage.removeItem('saampark_token')
              localStorage.removeItem('auth-storage')
              localStorage.removeItem('token')
              sessionStorage.clear()
            } catch {}
            window.location.href = '/login?expired=1'
          }
        }
      }

      throw new ApiError(errorMessage, response.status, errorData?.errors, errorData)
    }

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('saampark_last_activity_time', String(Date.now()))
      } catch {}
    }

    if (response.status === 204) {
      return {} as T
    }

    const parsed = await response.json()
    return handleApiResponse<T>(parsed, response.status)
  } catch (error: any) {
    clearTimeout(timeoutId)
    if (error instanceof ApiError || error?.isApiError) {
      throw error
    }
    const msg =
      error?.name === 'AbortError'
        ? `Request timed out after ${timeoutMs / 1000}s`
        : error?.message || 'Network error: unable to reach backend server'
    throw new ApiError(msg, 0, undefined, error)
  }
}

export function unwrapList<T = any>(res: any): T[] {
  if (Array.isArray(res)) return res
  if (res && Array.isArray(res.data)) return res.data
  if (res && res.data && Array.isArray(res.data.data)) return res.data.data
  if (res && res.data && Array.isArray(res.data.items)) return res.data.items
  return []
}

export const api = {
  get: <T = any>(endpoint: string, options?: ApiRequestOptions) =>
    request<T>(endpoint, { method: 'GET', ...options }),
  post: <T = any>(endpoint: string, body?: any, options?: ApiRequestOptions) =>
    request<T>(endpoint, { method: 'POST', ...options }, body),
  put: <T = any>(endpoint: string, body?: any, options?: ApiRequestOptions) =>
    request<T>(endpoint, { method: 'PUT', ...options }, body),
  patch: <T = any>(endpoint: string, body?: any, options?: ApiRequestOptions) =>
    request<T>(endpoint, { method: 'PATCH', ...options }, body),
  delete: <T = any>(endpoint: string, options?: ApiRequestOptions) =>
    request<T>(endpoint, { method: 'DELETE', ...options }),
  upload: <T = any>(
    endpoint: string,
    formDataOrPayload: FormData | Record<string, any>,
    options?: ApiRequestOptions
  ) =>
    request<T>(
      endpoint,
      {
        method: options?.method || 'POST',
        ...options,
        headers: {
          ...((options?.headers as Record<string, string>) || {}),
          'Content-Type': 'multipart/form-data',
        },
      },
      toFormData(formDataOrPayload)
    ),
}
