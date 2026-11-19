import { OrgService } from './orgService'
import { api, unwrapList } from '@/lib/api'
import axiosInstance, { toFormData } from '@/lib/axios'

export const EmployeeService = {
  getAll: async (params: Record<string, any> = {}) => {
    const q = new URLSearchParams(params).toString()
    const res = await api.get(`/hr/employees${q ? `?${q}` : ''}`)
    return unwrapList(res)
  },
  getById: async (id: string | number) => api.get(`/hr/employees/${id}`),
  create: async (data: any) => {
    if (typeof FormData !== 'undefined' && data instanceof FormData) {
      const res = await axiosInstance.postForm('/hr/employees', data)
      return res.data
    }
    return api.post('/hr/employees', data)
  },
  update: async (id: string | number, data: any) => {
    if (typeof FormData !== 'undefined' && data instanceof FormData) {
      const res = await axiosInstance.putForm(`/hr/employees/${id}`, data)
      return res.data
    }
    return api.put(`/hr/employees/${id}`, data)
  },
  delete: async (id: string | number) => api.delete(`/hr/employees/${id}`),
}

export const AttendanceService = {
  getAll: async (params: Record<string, any> = {}) => {
    const q = new URLSearchParams(params).toString()
    const res = await api.get(`/hr/attendance/company${q ? `?${q}` : ''}`)
    return unwrapList(res)
  },
  clockIn: async (data: any) => api.post('/hr/attendance/clock-in', data),
  clockOut: async (data: any) => api.post('/hr/attendance/clock-out', data),
  getStatus: async (employeeId: string | number) =>
    api.get(`/hr/attendance/status?employee_id=${encodeURIComponent(String(employeeId))}`),
  getByEmployee: async (employeeId: string | number, params: Record<string, any> = {}) => {
    const q = new URLSearchParams(params).toString()
    const res = await api.get(`/hr/attendance/employee/${encodeURIComponent(String(employeeId))}${q ? `?${q}` : ''}`)
    return unwrapList(res)
  },
  getByCompany: async (params: Record<string, any> = {}) => {
    const q = new URLSearchParams(params).toString()
    const res = await api.get(`/hr/attendance/company${q ? `?${q}` : ''}`)
    return unwrapList(res)
  },
}

export const LeaveService = {
  getTypes: async () => {
    const res = await api.get('/hr/leave/types')
    return unwrapList(res)
  },
  createType: async (data: any) => {
    const res = await api.post('/hr/leave/types', data)
    return res?.data ?? res
  },
  getRequests: async (params: Record<string, any> = {}) => {
    const q = new URLSearchParams(params).toString()
    const res = await api.get(`/hr/leave/requests${q ? `?${q}` : ''}`)
    return unwrapList(res)
  },
  createRequest: async (data: any) => LeaveService.requestLeave(data),
  requestLeave: async (data: any) => {
    if (typeof FormData !== 'undefined' && data instanceof FormData) {
      const res = await axiosInstance.postForm('/hr/leave/requests', data)
      return res.data?.data ?? res.data
    }
    const res = await api.post('/hr/leave/requests', data)
    return res?.data ?? res
  },
  approve: async (id: string | number, notes = '') => {
    const res = await api.put(`/hr/leave/requests/${id}/approve`, { review_notes: notes })
    return res?.data ?? res
  },
  reject: async (id: string | number, notes = '') => {
    const res = await api.put(`/hr/leave/requests/${id}/reject`, { review_notes: notes })
    return res?.data ?? res
  },
  updateStatus: async (id: string | number, status: string, notes = '') => {
    if (status?.toLowerCase() === 'rejected') {
      return LeaveService.reject(id, notes)
    }
    return LeaveService.approve(id, notes)
  },
}

export const PayrollService = {
  getAll: async (params: Record<string, any> = {}) => {
    const q = new URLSearchParams(params).toString()
    const res = await api.get(`/hr/payroll${q ? `?${q}` : ''}`)
    return unwrapList(res)
  },
  create: async (data: any) => api.post('/hr/payroll', data),
  updateStatus: async (id: string | number, status: string, paymentDate?: string) =>
    api.put(`/hr/payroll/${id}/status`, { status, payment_date: paymentDate }),
  markPaid: async (id: string | number, paymentDate?: string) =>
    api.put(`/hr/payroll/${id}/status`, {
      status: 'Paid',
      payment_date: paymentDate || new Date().toISOString().split('T')[0],
    }),
  generateBulk: async (month: string | number, year: string | number) =>
    api.post('/hr/payroll/bulk-generate', { month, year }),
}

export const PerformanceService = {
  getByEmployee: async (employeeId: string | number) =>
    api.get(`/hr/performance/employee/${encodeURIComponent(String(employeeId))}`),
  create: async (data: any) => api.post('/hr/performance', data),
}

export { OrgService }
