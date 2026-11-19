/**
 * Global Frontend API Response & Error Handler
 * Ensures frontend and backend stay strictly in sync:
 * - Any HTTP >= 400 or { success: false } / { status: 'error' } payload throws ApiError
 * - Never silently treats backend errors as success
 * - Extracts only real backend data (never dummy/local fallback)
 */

export class ApiError extends Error {
  public readonly statusCode: number
  public readonly errors?: any
  public readonly response?: any
  public readonly isApiError = true

  constructor(message: string, statusCode = 500, errors?: any, response?: any) {
    super(message || 'Request failed')
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.errors = errors
    this.response = response
    Object.setPrototypeOf(this, ApiError.prototype)
  }
}

export function isErrorResponse(payload: any, httpStatus?: number): boolean {
  if (typeof httpStatus === 'number' && httpStatus >= 400) {
    return true
  }
  if (!payload || typeof payload !== 'object') {
    return false
  }
  if (payload.success === false) return true
  if (typeof payload.status === 'string' && payload.status.toLowerCase() === 'error') return true
  if (payload.error === true) return true
  if (typeof payload.error === 'string' && payload.error.trim().length > 0) return true
  if (typeof payload.statusCode === 'number' && payload.statusCode >= 400) return true
  return false
}

export function getErrorMessage(err: any, fallback = 'Request failed. Please try again.'): string {
  if (!err) return fallback
  if (typeof err === 'string') return err
  if (err?.response?.data?.message) return String(err.response.data.message)
  if (err?.data?.message) return String(err.data.message)
  if (err?.message) return String(err.message)
  if (typeof err?.error === 'string') return err.error
  return fallback
}

/**
 * Validates any backend response. Throws ApiError on error payloads or HTTP >= 400.
 */
export function handleApiResponse<T = any>(payload: T, httpStatus = 200): T {
  if (isErrorResponse(payload, httpStatus)) {
    const p: any = payload || {}
    const message =
      p.message ||
      (typeof p.error === 'string' ? p.error : null) ||
      `Request failed with status ${httpStatus || p.statusCode || 500}`
    const statusCode = httpStatus >= 400 ? httpStatus : p.statusCode || 500
    throw new ApiError(message, statusCode, p.errors, payload)
  }
  return payload
}

/**
 * Unwraps the `data` field from a verified successful backend response.
 * Throws ApiError if the response indicates failure.
 */
export function extractApiData<T = any>(payload: any, httpStatus = 200): T {
  const verified = handleApiResponse(payload, httpStatus)
  if (verified && typeof verified === 'object' && 'data' in verified) {
    return verified.data as T
  }
  return verified as T
}

/**
 * Resolves a stored upload URL (e.g. `/uploads/file.png`) cleanly for rendering.
 */
export function resolveUploadUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return ''
  const trimmed = url.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (trimmed.startsWith('/uploads/')) return trimmed
  if (trimmed.startsWith('uploads/')) return `/${trimmed}`
  return trimmed
}
