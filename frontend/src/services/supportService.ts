import { api, unwrapList } from '@/lib/api'
import axiosInstance, { isMultipartPayload, toFormData } from '@/lib/axios'

export const KnowledgeBaseService = {
  getAll: async (params: Record<string, any> = {}) => {
    const q = new URLSearchParams(params).toString()
    const res = await api.get(`/support/kb${q ? `?${q}` : ''}`)
    return unwrapList(res)
  },
  getById: async (id: string | number) => api.get(`/support/kb/${id}`),
  create: async (data: any) => api.post('/support/kb', data),
  update: async (id: string | number, data: any) => api.put(`/support/kb/${id}`, data),
  delete: async (id: string | number) => api.delete(`/support/kb/${id}`),
}

export const DocumentService = {
  getAll: async (params: Record<string, any> = {}) => {
    const q = new URLSearchParams(params).toString()
    const res = await api.get(`/support/documents${q ? `?${q}` : ''}`)
    return unwrapList(res)
  },
  create: async (data: any) => {
    const formData = toFormData(data)
    const res = await axiosInstance.postForm('/support/documents', formData)
    return res.data?.data ?? res.data
  },
  uploadMultipart: async (
    formDataOrPayload: FormData | Record<string, any>,
    onUploadProgress?: (e: { loaded: number; total?: number; progress?: number }) => void
  ) => {
    const formData = toFormData(formDataOrPayload)
    const res = await axiosInstance.postForm('/support/documents', formData, { onUploadProgress })
    return res.data?.data ?? res.data
  },
  delete: async (id: string | number) => api.delete(`/support/documents/${id}`),
  getExpiring: async (days = 30) => {
    const res = await api.get(`/support/documents/expiring?days=${days}`)
    return unwrapList(res)
  },
}

export const EmailTemplateService = {
  getAll: async () => {
    const res = await api.get('/support/templates')
    return unwrapList(res)
  },
  create: async (data: any) => api.post('/support/templates', data),
  update: async (id: string | number, data: any) => api.put(`/support/templates/${id}`, data),
  delete: async (id: string | number) => api.delete(`/support/templates/${id}`),
}

export const NotificationService = {
  getAll: async () => {
    const res = await api.get('/support/notifications')
    return unwrapList(res)
  },
  markRead: async (id: string | number) => api.put(`/support/notifications/${id}/read`),
  markAllRead: async () => api.put('/support/notifications/read-all'),
}

export const SlaService = {
  getAll: async () => {
    const res = await api.get('/support/sla')
    return unwrapList(res)
  },
  create: async (data: any) => api.post('/support/sla', data),
  update: async (id: string | number, data: any) => api.put(`/support/sla/${id}`, data),
  delete: async (id: string | number) => api.delete(`/support/sla/${id}`),
}
