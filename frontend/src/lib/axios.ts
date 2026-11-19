import { getAuthToken, getActiveCompanyScope, getBaseUrl } from './api'
import { ApiError, handleApiResponse, isErrorResponse } from './responseHandler'

export interface AxiosRequestConfig {
  url?: string
  method?: string
  baseURL?: string
  headers?: Record<string, string>
  params?: Record<string, any>
  data?: any
  timeout?: number
  responseType?: 'json' | 'blob' | 'text' | 'arraybuffer'
  onUploadProgress?: (progressEvent: { loaded: number; total?: number; progress?: number }) => void
  signal?: AbortSignal
}

export interface AxiosResponse<T = any> {
  data: T
  status: number
  statusText: string
  headers: Record<string, string>
  config: AxiosRequestConfig
}

/**
 * Converts a plain object or File/Blob payload into a multipart FormData instance.
 * Preserves existing FormData instances without modification.
 */
export function toFormData(payload: any): FormData {
  if (typeof FormData !== 'undefined' && payload instanceof FormData) {
    return payload
  }
  const formData = new FormData()
  if (!payload || typeof payload !== 'object') {
    return formData
  }
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return
    if (typeof File !== 'undefined' && value instanceof File) {
      formData.append(key, value, value.name)
    } else if (typeof Blob !== 'undefined' && value instanceof Blob) {
      formData.append(key, value)
    } else if (Array.isArray(value)) {
      value.forEach((item) => {
        if (typeof File !== 'undefined' && item instanceof File) {
          formData.append(key, item, item.name)
        } else if (typeof Blob !== 'undefined' && item instanceof Blob) {
          formData.append(key, item)
        } else if (typeof item === 'object' && item !== null) {
          formData.append(key, JSON.stringify(item))
        } else if (item !== undefined && item !== null) {
          formData.append(key, String(item))
        }
      })
    } else if (typeof value === 'object') {
      formData.append(key, JSON.stringify(value))
    } else {
      formData.append(key, String(value))
    }
  })
  return formData
}

export function isMultipartPayload(body: any, headers?: Record<string, string>): boolean {
  if (typeof FormData !== 'undefined' && body instanceof FormData) return true
  if (typeof File !== 'undefined' && body instanceof File) return true
  if (typeof Blob !== 'undefined' && body instanceof Blob) return true
  if (headers) {
    const contentType = headers['Content-Type'] || headers['content-type'] || ''
    if (contentType.toLowerCase().includes('multipart/form-data')) return true
  }
  if (body && typeof body === 'object' && !Array.isArray(body)) {
    return Object.values(body).some(
      (v) =>
        (typeof File !== 'undefined' && v instanceof File) ||
        (typeof Blob !== 'undefined' && v instanceof Blob) ||
        (Array.isArray(v) &&
          v.some(
            (item) =>
              (typeof File !== 'undefined' && item instanceof File) ||
              (typeof Blob !== 'undefined' && item instanceof Blob)
          ))
    )
  }
  return false
}

function buildUrl(baseUrl: string, endpoint: string, params?: Record<string, any>): string {
  const isAbsolute = /^https?:\/\//i.test(endpoint)
  const cleanEndpoint = isAbsolute ? endpoint : `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
  if (!params || Object.keys(params).length === 0) return cleanEndpoint
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      searchParams.append(k, String(v))
    }
  })
  const queryString = searchParams.toString()
  if (!queryString) return cleanEndpoint
  return `${cleanEndpoint}${cleanEndpoint.includes('?') ? '&' : '?'}${queryString}`
}

async function executeXhrRequest<T = any>(
  url: string,
  method: string,
  headers: Record<string, string>,
  body: BodyInit | null,
  config: AxiosRequestConfig
): Promise<AxiosResponse<T>> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open(method, url, true)
    xhr.timeout = config.timeout || 30000

    Object.entries(headers).forEach(([k, v]) => {
      // Never set Content-Type manually for FormData so browser attaches multipart boundary
      if (k.toLowerCase() === 'content-type' && typeof FormData !== 'undefined' && body instanceof FormData) {
        return
      }
      if (v !== undefined && v !== null) {
        xhr.setRequestHeader(k, v)
      }
    })

    if (config.onUploadProgress && xhr.upload) {
      xhr.upload.onprogress = (event) => {
        const total = event.lengthComputable ? event.total : undefined
        const progress = total ? Math.round((event.loaded * 100) / total) : undefined
        config.onUploadProgress?.({ loaded: event.loaded, total, progress })
      }
    }

    xhr.onload = () => {
      let parsed: any = xhr.responseText
      try {
        parsed = xhr.responseText ? JSON.parse(xhr.responseText) : {}
      } catch {}

      if (xhr.status < 200 || xhr.status >= 300 || isErrorResponse(parsed, xhr.status)) {
        const message =
          parsed?.message ||
          (typeof parsed?.error === 'string' ? parsed.error : null) ||
          xhr.statusText ||
          `Request failed with status ${xhr.status}`
        return reject(new ApiError(message, xhr.status || 500, parsed?.errors, parsed))
      }

      resolve({
        data: parsed,
        status: xhr.status,
        statusText: xhr.statusText,
        headers: {},
        config,
      })
    }

    xhr.onerror = () => {
      reject(new ApiError('Network error during file upload', xhr.status || 0))
    }

    xhr.ontimeout = () => {
      reject(new ApiError('Upload request timed out', 408))
    }

    xhr.send(body)
  })
}

export function createAxiosInstance(defaultConfig: AxiosRequestConfig = {}) {
  const interceptors = {
    request: {
      handlers: [] as Array<(cfg: AxiosRequestConfig) => AxiosRequestConfig | Promise<AxiosRequestConfig>>,
      use(fn: (cfg: AxiosRequestConfig) => AxiosRequestConfig | Promise<AxiosRequestConfig>) {
        this.handlers.push(fn)
        return this.handlers.length - 1
      },
    },
    response: {
      handlers: [] as Array<(res: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>>,
      use(fn: (res: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>) {
        this.handlers.push(fn)
        return this.handlers.length - 1
      },
    },
  }

  async function request<T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    let mergedConfig: AxiosRequestConfig = {
      ...defaultConfig,
      ...config,
      headers: {
        ...(defaultConfig.headers || {}),
        ...(config.headers || {}),
      },
    }

    for (const handler of interceptors.request.handlers) {
      mergedConfig = await handler(mergedConfig)
    }

    const method = (mergedConfig.method || 'GET').toUpperCase()
    const baseUrl = mergedConfig.baseURL || getBaseUrl()
    const url = buildUrl(baseUrl, mergedConfig.url || '', mergedConfig.params)

    const token = getAuthToken()
    const scope = getActiveCompanyScope()
    const headers: Record<string, string> = { ...(mergedConfig.headers || {}) }

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

    const multipart = isMultipartPayload(mergedConfig.data, headers)
    let body: BodyInit | undefined

    if (method !== 'GET' && method !== 'HEAD' && mergedConfig.data !== undefined) {
      if (multipart) {
        body = toFormData(mergedConfig.data)
        // Remove Content-Type so browser sets multipart/form-data; boundary=...
        delete headers['Content-Type']
        delete headers['content-type']
      } else if (typeof mergedConfig.data === 'string') {
        body = mergedConfig.data
        if (!headers['Content-Type'] && !headers['content-type']) {
          headers['Content-Type'] = 'application/json'
        }
      } else {
        body = JSON.stringify(mergedConfig.data)
        if (!headers['Content-Type'] && !headers['content-type']) {
          headers['Content-Type'] = 'application/json'
        }
      }
    }

    // Use XMLHttpRequest when upload progress tracking or multipart upload in browser is used
    if (typeof window !== 'undefined' && (mergedConfig.onUploadProgress || multipart) && typeof XMLHttpRequest !== 'undefined') {
      let xhrRes = await executeXhrRequest<T>(url, method, headers, body ?? null, mergedConfig)
      for (const handler of interceptors.response.handlers) {
        xhrRes = await handler(xhrRes)
      }
      return xhrRes
    }

    const controller = new AbortController()
    const timeoutMs = mergedConfig.timeout || (multipart ? 30000 : 12000)
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const response = await fetch(url, {
        method,
        headers,
        body,
        signal: mergedConfig.signal || controller.signal,
      })
      clearTimeout(timeoutId)

      let data: any = null
      if (response.status !== 204) {
        if (mergedConfig.responseType === 'blob') {
          data = await response.blob()
        } else if (mergedConfig.responseType === 'text') {
          data = await response.text()
        } else {
          data = await response.json().catch(() => ({}))
        }
      } else {
        data = {}
      }

      if (!response.ok) {
        const errorMessage = data?.message || data?.error || `Request failed with status ${response.status}`
        throw new ApiError(errorMessage, response.status, data?.errors, data)
      }

      if (mergedConfig.responseType !== 'blob' && mergedConfig.responseType !== 'text') {
        handleApiResponse(data, response.status)
      }

      let axiosRes: AxiosResponse<T> = {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: {},
        config: mergedConfig,
      }

      for (const handler of interceptors.response.handlers) {
        axiosRes = await handler(axiosRes)
      }
      return axiosRes
    } catch (error: any) {
      clearTimeout(timeoutId)
      if (error instanceof ApiError || error?.isApiError) {
        throw error
      }
      const msg =
        error?.name === 'AbortError'
          ? `Request timed out after ${timeoutMs / 1000}s`
          : error?.message || 'Network error'
      throw new ApiError(msg, 0, undefined, error)
    }
  }

  return {
    interceptors,
    request,
    get: <T = any>(url: string, config?: AxiosRequestConfig) =>
      request<T>({ ...config, url, method: 'GET' }),
    delete: <T = any>(url: string, config?: AxiosRequestConfig) =>
      request<T>({ ...config, url, method: 'DELETE' }),
    post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
      request<T>({ ...config, url, data, method: 'POST' }),
    put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
      request<T>({ ...config, url, data, method: 'PUT' }),
    patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
      request<T>({ ...config, url, data, method: 'PATCH' }),
    postForm: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
      request<T>({
        ...config,
        url,
        data: toFormData(data),
        method: 'POST',
        headers: { ...(config?.headers || {}), 'Content-Type': 'multipart/form-data' },
      }),
    putForm: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
      request<T>({
        ...config,
        url,
        data: toFormData(data),
        method: 'PUT',
        headers: { ...(config?.headers || {}), 'Content-Type': 'multipart/form-data' },
      }),
    patchForm: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
      request<T>({
        ...config,
        url,
        data: toFormData(data),
        method: 'PATCH',
        headers: { ...(config?.headers || {}), 'Content-Type': 'multipart/form-data' },
      }),
    create: (cfg?: AxiosRequestConfig) => createAxiosInstance({ ...defaultConfig, ...cfg }),
  }
}

export const axiosInstance = createAxiosInstance()
export default axiosInstance
