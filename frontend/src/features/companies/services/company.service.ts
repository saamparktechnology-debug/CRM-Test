import { api } from '@/lib/api'
import axiosInstance, { toFormData } from '@/lib/axios'
import { extractApiData } from '@/lib/responseHandler'
import {
  fetchModuleDataFromDB,
  saveModuleDataToDB,
  invalidateModuleCache,
} from '@/lib/storageSync'
import type { Company } from '@/store/auth/auth.types'
import { getCanonicalCompanyId, getCompanyFullName, isMatchingCompany } from '@/store/auth/auth.helpers'

function unpack(res: any): any {
  if (!res || res.error || res.status === 'error') return null
  return res.data ?? res
}

function unpackArray(res: any): any[] {
  const data = unpack(res)
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.companies)) return data.companies
  if (Array.isArray(data?.data)) return data.data
  return []
}

function mergeNonEmpty(targetObj: any, sourceObj: any): any {
  if (!sourceObj || typeof sourceObj !== 'object') return targetObj
  const result = { ...targetObj }
  for (const [k, v] of Object.entries(sourceObj)) {
    if (v !== null && v !== undefined) {
      if (typeof v === 'object' && !Array.isArray(v)) {
        result[k] = mergeNonEmpty(result[k] || {}, v)
      } else {
        result[k] = v
      }
    }
  }
  return result
}

let _inFlightCompaniesGetAll: Promise<Company[]> | null = null

export const CompanyApiService = {
  getAll: async (): Promise<Company[]> => {
    if (_inFlightCompaniesGetAll) return _inFlightCompaniesGetAll
    _inFlightCompaniesGetAll = api
      .get('/companies')
      .then((res) => unpackArray(res))
      .finally(() => {
        _inFlightCompaniesGetAll = null
      })
    return _inFlightCompaniesGetAll
  },

  getById: async (id: string): Promise<Company | null> => {
    const res = await api.get(`/companies/${encodeURIComponent(id)}`)
    return unpack(res)
  },

  getMembers: async (id: string): Promise<any[]> => {
    const res = await api.get(`/companies/${encodeURIComponent(id)}/members`)
    return unpackArray(res)
  },

  create: async (data: Partial<Company> | FormData): Promise<Company> => {
    const formData = toFormData(data)
    const res = await axiosInstance.postForm('/companies', formData)
    return extractApiData<Company>(res.data, res.status)
  },

  update: async (id: string | number, data: Partial<Company> | FormData): Promise<Company> => {
    const formData = toFormData(data)
    const res = await axiosInstance.putForm(`/companies/${encodeURIComponent(String(id))}`, formData)
    return extractApiData<Company>(res.data, res.status)
  },

  uploadAsset: async (
    companyId: string | number,
    assetType: 'logo' | 'signature' | 'stamp' | 'qr',
    file: File | Blob,
    extraFields: Record<string, any> = {}
  ) => {
    const formData = toFormData({
      file,
      assetType,
      companyId: String(companyId),
      ...extraFields,
    })
    const res = await axiosInstance.postForm(`/companies/${encodeURIComponent(String(companyId))}/assets`, formData)
    return unpack(res.data)
  },

  delete: async (id: string): Promise<any> => {
    const res = await api.delete(`/companies/${encodeURIComponent(id)}`)
    return unpack(res)
  },

  /**
   * Fetches and normalizes companies from the backend `/companies` API and module store.
   * All company API calls live strictly in `company.service.ts`.
   */
  fetchAndMergeCompanies: async (cachedCompanies: Company[] = []): Promise<Company[]> => {
    const [dbCompanies, apiRaw] = await Promise.all([
      fetchModuleDataFromDB<Company[]>('companies', [], 'all').catch(() => []),
      CompanyApiService.getAll().catch(() => []),
    ])

    const apiList: Company[] = (Array.isArray(apiRaw) ? apiRaw : []).map((c: any) => ({
      ...c,
      id: c.slug || String(c.id),
      numeric_id: Number(c.id) || c.numeric_id,
      slug: c.slug || String(c.id),
      brand_name: c.brand_name !== undefined ? c.brand_name : c.name?.startsWith('SAAMPARK') ? 'SAAMPARK' : c.name,
      division_name: c.division_name !== undefined ? c.division_name : '',
      subtitle: c.subtitle !== undefined ? c.subtitle : '',
      logo: c.logo || c.logo_url || '',
      currency: c.currency || 'INR',
      currency_symbol: c.currency_symbol || '₹',
    }))

    const map = new Map<string, Company>()
    const getCanonicalKey = (c: Partial<Company>) => {
      const canon = getCanonicalCompanyId(c.slug || c.id || (c as any)?.numeric_id || c.name)
      if (canon === 'consultancy' || canon.includes('consult')) return 'consultancy'
      if (canon === 'tech' || canon === '1' || canon.includes('tech') || canon.includes('research')) return 'tech'
      return String(c.id || c.slug || '').toLowerCase().trim()
    }

    const applyList = (list: Company[]) => {
      if (!Array.isArray(list)) return
      list.forEach((c) => {
        if (!c) return
        const key = getCanonicalKey(c)
        if (!key) return
        const existing = map.get(key)
        const explicitName = c.name && c.name.trim() !== '' ? c.name : existing?.name
        const merged = mergeNonEmpty(existing || {}, c)
        map.set(key, {
          ...merged,
          id: key,
          slug: key,
          name: explicitName || getCompanyFullName(merged),
          logo_position: merged.logo_position || { x: 0, y: 0 },
          signature_position: merged.signature_position || { x: 0, y: 0 },
          stamp_position: merged.stamp_position || { x: 0, y: 0 },
          logo_scale: merged.logo_scale ?? 1,
          stamp_scale: merged.stamp_scale ?? 1,
          signature_scale: merged.signature_scale ?? 1,
          custom_stamps: Array.isArray(merged.custom_stamps) ? merged.custom_stamps : [],
          invoice_customization: merged.invoice_customization || { hidden_fields: [] },
        })
      })
    }

    applyList(cachedCompanies)
    applyList(dbCompanies)
    applyList(apiList)

    return Array.from(map.values())
  },

  /**
   * Persists company updates to the backend `/companies/:id` endpoint and module store.
   */
  updateCompanyRecord: async (
    companyId: string,
    updates: Partial<Company>,
    existingCompanies: Company[] = []
  ): Promise<{ updatedCompany: Company | null; updatedList: Company[] }> => {
    const compIndex = existingCompanies.findIndex(
      (c) =>
        String(c.id).toLowerCase() === String(companyId).toLowerCase() ||
        String(c.slug || '').toLowerCase() === String(companyId).toLowerCase() ||
        String((c as any).numeric_id || '').toLowerCase() === String(companyId).toLowerCase() ||
        isMatchingCompany(c, companyId)
    )

    const target =
      compIndex !== -1
        ? existingCompanies[compIndex]
        : ({
            id: getCanonicalCompanyId(companyId) || companyId,
            slug: getCanonicalCompanyId(companyId) || companyId,
            name: updates.name || '',
          } as Company)

    const isConsultancy =
      isMatchingCompany(target, 'consultancy') || String(companyId) === '2' || String(target.id) === 'consultancy'
    const isTech = isMatchingCompany(target, 'tech') || String(companyId) === '1' || String(target.id) === 'tech'
    const canonId = isConsultancy ? 'consultancy' : isTech ? 'tech' : updates.slug || target.id

    const merged: Company = {
      ...target,
      ...updates,
      id: canonId,
      slug: canonId,
      numeric_id: isConsultancy ? 2 : isTech ? 1 : (target as any).numeric_id || 1,
      brand_name: updates.brand_name !== undefined ? updates.brand_name : target.brand_name || '',
      division_name: updates.division_name !== undefined ? updates.division_name : target.division_name || '',
      subtitle: updates.subtitle !== undefined ? updates.subtitle : target.subtitle || '',
      trademark_symbol:
        updates.trademark_symbol !== undefined ? updates.trademark_symbol : target.trademark_symbol || '',
      logo_url: updates.logo_url !== undefined ? updates.logo_url : target.logo_url || '',
      logo: updates.logo_url || updates.logo || target.logo || '',
      name: updates.name || getCompanyFullName({ ...target, ...updates }),
    }

    const apiTargetId = isConsultancy ? 2 : isTech ? 1 : (target as any).numeric_id || target.id
    const backendUpdated = await CompanyApiService.update(apiTargetId, {
      ...merged,
      name: merged.name,
      slug: merged.slug || merged.id,
    })

    const savedCompany: Company = {
      ...(backendUpdated || {}),
      id: (backendUpdated as any)?.slug || (backendUpdated as any)?.id || canonId,
      slug: (backendUpdated as any)?.slug || canonId,
    } as Company

    const updatedList = [...existingCompanies]
    if (compIndex !== -1) {
      updatedList[compIndex] = savedCompany
    } else {
      updatedList.push(savedCompany)
    }

    invalidateModuleCache('companies')
    return { updatedCompany: savedCompany, updatedList }
  },
}

export const companyService = CompanyApiService
export default CompanyApiService
