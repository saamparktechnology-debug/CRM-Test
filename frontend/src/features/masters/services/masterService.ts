import { api } from '@/lib/api'
import type {
  CreateMasterOptionPayload,
  CreateMasterTypePayload,
  MasterBundle,
  MasterOption,
  MasterType,
} from '../types/masters.types'

function unwrapData<T>(res: any, fallback: T): T {
  if (res && typeof res === 'object' && 'data' in res && res.data !== undefined && res.data !== null) {
    return res.data as T
  }
  return (res as T) ?? fallback
}

export const masterService = {
  async getBundle(companyId?: string | null, includeInactive = false): Promise<MasterBundle> {
    const params: Record<string, any> = {}
    if (companyId && companyId !== 'all') params.company_id = companyId
    if (includeInactive) params.include_inactive = 'true'
    const res = await api.get('/masters/bundle', { params })
    return unwrapData<MasterBundle>(res, { types: [], options: {} })
  },

  async getTypes(includeInactive = false): Promise<MasterType[]> {
    const res = await api.get('/masters/types', {
      params: includeInactive ? { include_inactive: 'true' } : undefined,
    })
    return unwrapData<MasterType[]>(res, [])
  },

  async createType(payload: CreateMasterTypePayload): Promise<MasterType> {
    const res = await api.post('/masters/types', payload)
    return unwrapData<MasterType>(res, {} as MasterType)
  },

  async updateType(id: number, payload: Partial<MasterType>): Promise<MasterType> {
    const res = await api.put(`/masters/types/${id}`, payload)
    return unwrapData<MasterType>(res, {} as MasterType)
  },

  async getOptionsByType(
    typeCode: string,
    companyId?: string | null,
    includeInactive = false
  ): Promise<MasterOption[]> {
    const params: Record<string, any> = {}
    if (companyId && companyId !== 'all') params.company_id = companyId
    if (includeInactive) params.include_inactive = 'true'
    const res = await api.get(`/masters/options/${encodeURIComponent(typeCode)}`, { params })
    return unwrapData<MasterOption[]>(res, [])
  },

  async createOption(payload: CreateMasterOptionPayload): Promise<MasterOption> {
    const res = await api.post('/masters/options', payload)
    return unwrapData<MasterOption>(res, {} as MasterOption)
  },

  async updateOption(id: number, payload: Partial<CreateMasterOptionPayload>): Promise<MasterOption> {
    const res = await api.put(`/masters/options/${id}`, payload)
    return unwrapData<MasterOption>(res, {} as MasterOption)
  },

  async deleteOption(id: number): Promise<void> {
    await api.delete(`/masters/options/${id}`)
  },

  async reorderOptions(items: Array<{ id: number; sort_order: number }>): Promise<void> {
    await api.patch('/masters/options/reorder', { items })
  },
}
