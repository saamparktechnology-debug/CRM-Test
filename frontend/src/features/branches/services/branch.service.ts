import { api } from '@/lib/api'
import axiosInstance, { toFormData } from '@/lib/axios'
import { extractApiData } from '@/lib/responseHandler'
import {
  fetchModuleDataFromDB,
  saveModuleDataToDB,
  markGlobalItemDeleted,
  isGlobalItemDeleted,
  getLocalDeletedIds,
} from '@/lib/storageSync'
import type { Branch, SubBranch, Company } from '@/store/auth/auth.types'
import { getCanonicalCompanyId, isMatchingCompany } from '@/store/auth/auth.helpers'

function unpack(res: any): any {
  if (!res || res.error || res.status === 'error') return null
  return res.data ?? res
}

function unpackArray(res: any): any[] {
  const data = unpack(res)
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.branches)) return data.branches
  if (Array.isArray(data?.subBranches)) return data.subBranches
  if (Array.isArray(data?.data)) return data.data
  return []
}

function toNumericCompanyHeader(companyId?: string): string {
  if (!companyId || companyId === 'all') return 'all'
  const lower = String(companyId).toLowerCase().trim()
  if (lower === 'consultancy' || lower === 'digital' || lower === 'print' || lower === '2') return '2'
  if (lower === 'tech' || lower === '1') return '1'
  return companyId
}

const _inFlightBranchesGetAll = new Map<string, Promise<Branch[]>>()
const _inFlightSubBranchesGetAll = new Map<string, Promise<SubBranch[]>>()

export const BranchApiService = {
  getAll: async (companyId?: string): Promise<Branch[]> => {
    const key = companyId && companyId !== 'all' ? companyId : 'all'
    const existing = _inFlightBranchesGetAll.get(key)
    if (existing) return existing
    const headers: Record<string, string> = {
      'x-company-id': key,
    }
    const query = key !== 'all' ? `?company_id=${encodeURIComponent(key)}` : ''
    const p = api
      .get(`/branches${query}`, { headers })
      .then((res) => unpackArray(res))
      .finally(() => {
        _inFlightBranchesGetAll.delete(key)
      })
    _inFlightBranchesGetAll.set(key, p)
    return p
  },

  getById: async (id: string): Promise<Branch | null> => {
    const res = await api.get(`/branches/${encodeURIComponent(id)}`)
    return unpack(res)
  },

  getStats: async (): Promise<any> => {
    const res = await api.get('/branches/stats')
    return unpack(res)
  },

  create: async (companyId: string, data: Partial<Branch> | FormData): Promise<Branch> => {
    const numComp = toNumericCompanyHeader(companyId)
    const formData = toFormData(data)
    formData.set('company_id', numComp)
    const res = await axiosInstance.postForm('/branches', formData, {
      headers: { 'x-company-id': numComp },
    })
    return extractApiData<Branch>(res.data, res.status)
  },

  update: async (id: string, data: Partial<Branch> | FormData): Promise<Branch> => {
    const formData = toFormData(data)
    const res = await axiosInstance.putForm(`/branches/${encodeURIComponent(id)}`, formData)
    return extractApiData<Branch>(res.data, res.status)
  },

  uploadAsset: async (
    branchId: string,
    assetType: 'logo' | 'signature' | 'stamp' | 'qr',
    file: File | Blob,
    extraFields: Record<string, any> = {}
  ) => {
    const formData = toFormData({
      file,
      assetType,
      branchId,
      ...extraFields,
    })
    const res = await axiosInstance.postForm(`/branches/${encodeURIComponent(branchId)}/assets`, formData)
    return unpack(res.data)
  },

  delete: async (id: string): Promise<any> => {
    const res = await api.delete(`/branches/${encodeURIComponent(id)}`)
    return unpack(res)
  },
}

export const SubBranchApiService = {
  getAll: async (branchId?: string, companyId?: string): Promise<SubBranch[]> => {
    const compKey = companyId && companyId !== 'all' ? companyId : 'all'
    const brKey = branchId && branchId !== 'all' ? branchId : 'all'
    const key = `${compKey}::${brKey}`
    const existing = _inFlightSubBranchesGetAll.get(key)
    if (existing) return existing
    const query = brKey !== 'all' ? `?branch_id=${encodeURIComponent(brKey)}` : ''
    const headers: Record<string, string> = {
      'x-company-id': compKey,
    }
    const p = api
      .get(`/branches/sub-branches/all${query}`, { headers })
      .then((res) => unpackArray(res))
      .finally(() => {
        _inFlightSubBranchesGetAll.delete(key)
      })
    _inFlightSubBranchesGetAll.set(key, p)
    return p
  },

  create: async (companyId: string, data: Partial<SubBranch> | FormData): Promise<SubBranch> => {
    const numComp = toNumericCompanyHeader(companyId)
    const formData = toFormData(data)
    formData.set('company_id', numComp)
    const res = await axiosInstance.postForm('/branches/sub-branches', formData, {
      headers: { 'x-company-id': numComp },
    })
    return extractApiData<SubBranch>(res.data, res.status)
  },

  update: async (id: string, data: Partial<SubBranch> | FormData): Promise<SubBranch> => {
    const formData = toFormData(data)
    const res = await axiosInstance.putForm(`/branches/sub-branches/${encodeURIComponent(id)}`, formData)
    return extractApiData<SubBranch>(res.data, res.status)
  },

  delete: async (id: string): Promise<any> => {
    const res = await api.delete(`/branches/sub-branches/${encodeURIComponent(id)}`)
    return unpack(res)
  },
}

/**
 * Unified Branch & Sub-Branch Domain Service.
 * All branch and sub-branch HTTP requests and persistence live strictly in this file.
 */
export const branchFeatureService = {
  getBranches: BranchApiService.getAll,
  getBranchById: BranchApiService.getById,
  getBranchStats: BranchApiService.getStats,
  createBranch: BranchApiService.create,
  updateBranch: BranchApiService.update,
  deleteBranch: BranchApiService.delete,
  uploadBranchAsset: BranchApiService.uploadAsset,

  getSubBranches: SubBranchApiService.getAll,
  createSubBranch: SubBranchApiService.create,
  updateSubBranch: SubBranchApiService.update,
  deleteSubBranch: SubBranchApiService.delete,

  /**
   * Fetches and merges branches from backend `/branches` and module store WITHOUT firing any POST/write calls.
   */
  fetchAndMergeBranches: async (currentCompanies: Company[] = [], companyId?: string): Promise<Branch[]> => {
    const apiList = await BranchApiService.getAll(companyId || 'all')
    return (Array.isArray(apiList) ? apiList : []).map((b: any) => {
      const finalId = String(b.id)
      return {
        ...b,
        id: finalId,
        numeric_id: Number(b.id) || b.numeric_id,
      }
    }).map((b) => {
      const rawComp = b.companyId || (b as any).company_id
      const matchedComp = currentCompanies.find((c) => isMatchingCompany(c, rawComp))
      const compSlug = matchedComp?.slug || matchedComp?.id || (b as any).company_slug || String(rawComp || 'tech')
      const numericId =
        matchedComp?.numeric_id || (compSlug === 'tech' ? 1 : compSlug === 'consultancy' ? 2 : Number((b as any).company_id) || 1)
      const branchName = String(b.name || (b as any).branch_name || b.code || 'Branch').trim()
      return {
        ...b,
        name: branchName,
        branch_name: branchName,
        companyId: b.companyId || compSlug,
        company_id: (b as any).company_id || numericId,
        code: b.code ? b.code.toUpperCase() : b.code,
      }
    })
  },

  /**
   * Creates a branch via `/branches` API and updates the store list.
   */
  createBranchRecord: async (
    branchData: Partial<Branch>,
    existingBranches: Branch[] = [],
    defaultCompanyId = 'tech',
    defaultManagerName = ''
  ): Promise<{ createdBranch: Branch; updatedList: Branch[] }> => {
    const targetCompanyId = getCanonicalCompanyId(branchData.companyId || defaultCompanyId) || 'tech'
    const newBranch: Branch = {
      ...branchData,
      id: branchData.id || `branch_${Date.now()}`,
      companyId: targetCompanyId,
      name: branchData.name || 'New Branch',
      code: branchData.code ? branchData.code.trim().toUpperCase() : `BR-${Math.floor(100 + Math.random() * 900)}`,
      city: branchData.city || '',
      address: branchData.address || '',
      phone: branchData.phone || '',
      email: branchData.email || '',
      managerName: branchData.managerName || defaultManagerName,
      status: branchData.status || 'Active',
      createdAt: new Date().toISOString().split('T')[0],
    }

    const apiCreated = await BranchApiService.create(targetCompanyId, newBranch)
    const createdBranch: Branch = {
      ...apiCreated,
      id: String(apiCreated.id),
      companyId: (apiCreated as any).companyId || targetCompanyId,
    }
    const updatedList = [...existingBranches.filter((b) => b && String(b.id) !== String(createdBranch.id)), createdBranch]
    return { createdBranch, updatedList }
  },

  /**
   * Updates a branch via `PUT /branches/:id` ONLY — never triggers any DELETE call!
   */
  updateBranchRecord: async (
    branchId: string,
    updates: Partial<Branch>,
    existingBranches: Branch[] = []
  ): Promise<Branch[]> => {
    const sanitizedUpdates: Partial<Branch> = {
      ...updates,
      ...(updates.code ? { code: updates.code.trim().toUpperCase() } : {}),
    }

    const backendUpdated = await BranchApiService.update(branchId, sanitizedUpdates)
    const updatedList = existingBranches
      .filter(Boolean)
      .map((b) => (String(b.id) === String(branchId) ? { ...b, ...backendUpdated, id: String(backendUpdated?.id || branchId) } : b))
    return updatedList
  },

  /**
   * Deletes a branch via `DELETE /branches/:id` (single clean API call).
   */
  deleteBranchRecord: async (branchId: string, existingBranches: Branch[] = []): Promise<Branch[]> => {
    const strId = String(branchId).toLowerCase().trim()
    const targetBranch = existingBranches.find(
      (b) => String(b.id).toLowerCase().trim() === strId || (b.code && String(b.code).toLowerCase().trim() === strId)
    )

    await BranchApiService.delete(String(targetBranch?.id || branchId))
    await markGlobalItemDeleted(branchId, 'branches')
    if (targetBranch?.code) {
      await markGlobalItemDeleted(targetBranch.code, 'branches')
    }
    const updatedList = existingBranches.filter(
      (b) =>
        String(b.id).toLowerCase().trim() !== strId &&
        (!targetBranch?.code || String(b.code || '').toLowerCase().trim() !== String(targetBranch.code).toLowerCase().trim())
    )
    return updatedList
  },

  /**
   * Fetches and merges sub-branches from `/branches/sub-branches/all` and module store.
   */
  fetchAndMergeSubBranches: async (): Promise<SubBranch[]> => {
    const deletedIds = getLocalDeletedIds('sub_branches')
    const isSubBranchDeleted = (id?: string | number, code?: string) => {
      if (id && isGlobalItemDeleted(id, deletedIds, 'sub_branches')) return true
      if (code && isGlobalItemDeleted(code, deletedIds, 'sub_branches')) return true
      return false
    }

    const [dbSubBranches, apiList] = await Promise.all([
      fetchModuleDataFromDB<SubBranch[]>('sub_branches', [], 'all').catch(() => []),
      SubBranchApiService.getAll().catch(() => []),
    ])

    const subMap = new Map<string, SubBranch>()
    if (Array.isArray(dbSubBranches)) {
      dbSubBranches.forEach((sb) => {
        if (sb && !isSubBranchDeleted(sb.id, sb.code)) {
          subMap.set(String(sb.id), { ...sb })
        }
      })
    }

    if (Array.isArray(apiList)) {
      apiList.forEach((sb: SubBranch) => {
        if (sb && !isSubBranchDeleted(sb.id, sb.code)) {
          const strKey = String(sb.id)
          const existing = subMap.get(strKey)
          subMap.set(strKey, { ...(existing || {}), ...sb })
        }
      })
    }

    return Array.from(subMap.values())
  },

  /**
   * Creates a sub-branch via `POST /branches/sub-branches`.
   */
  createSubBranchRecord: async (
    subBranchData: Partial<SubBranch>,
    existingSubBranches: SubBranch[] = [],
    existingBranches: Branch[] = [],
    defaultCompanyId = 'tech'
  ): Promise<{ createdSubBranch: SubBranch; updatedList: SubBranch[] }> => {
    const rawParentId = subBranchData.parentBranchId || (subBranchData as any)?.branch_id
    const parentBranch =
      existingBranches.find(
        (b) =>
          String(b.id).toLowerCase() === String(rawParentId || '').toLowerCase() ||
          (b.code && String(b.code).toLowerCase() === String(rawParentId || '').toLowerCase())
      ) || existingBranches[0]

    const targetParentId = parentBranch?.id || rawParentId || ''
    const numericParentId =
      (parentBranch as any)?.numeric_id || (!isNaN(Number(targetParentId)) ? Number(targetParentId) : undefined)
    const targetCompId =
      getCanonicalCompanyId(subBranchData.companyId || parentBranch?.companyId || defaultCompanyId) || 'tech'

    const newSubBranch: SubBranch = {
      ...subBranchData,
      id: subBranchData.id || `subbranch_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      parentBranchId: targetParentId,
      companyId: targetCompId,
      name: subBranchData.name || 'New Sub-Branch',
      code: subBranchData.code || `SB-${Math.floor(100 + Math.random() * 900)}`,
      partnerName: subBranchData.partnerName || '',
      partnerPhone: subBranchData.partnerPhone || '',
      partnerEmail: subBranchData.partnerEmail || '',
      city: subBranchData.city || '',
      address: subBranchData.address || '',
      revenueSharePct: subBranchData.revenueSharePct !== undefined ? Number(subBranchData.revenueSharePct) : 30,
      partnerType: subBranchData.partnerType || 'Franchise Partner',
      status: subBranchData.status || 'Active',
      createdAt: new Date().toISOString().split('T')[0],
    }

    const apiRes = await SubBranchApiService.create(targetCompId, {
      ...newSubBranch,
      branch_id: numericParentId || targetParentId,
      parentBranchId: targetParentId,
    } as any)
    const createdSubBranch: SubBranch = {
      ...apiRes,
      id: String(apiRes.id),
      numeric_id: Number(apiRes.id) || undefined,
      parentBranchId: String((apiRes as any).branch_id || targetParentId),
      companyId: (apiRes as any).companyId || targetCompId,
    }
    const updatedList = [...existingSubBranches.filter((sb) => sb && String(sb.id) !== String(createdSubBranch.id)), createdSubBranch]
    return { createdSubBranch, updatedList }
  },

  /**
   * Updates a sub-branch via `PUT /branches/sub-branches/:id` ONLY — never triggers any DELETE call!
   */
  updateSubBranchRecord: async (
    subBranchId: string,
    updates: Partial<SubBranch>,
    existingSubBranches: SubBranch[] = []
  ): Promise<SubBranch[]> => {
    const backendUpdated = await SubBranchApiService.update(subBranchId, updates)
    const updatedList = existingSubBranches.map((sb) =>
      String(sb.id) === String(subBranchId) ? { ...sb, ...backendUpdated, id: String(backendUpdated?.id || subBranchId) } : sb
    )
    return updatedList
  },

  /**
   * Deletes a sub-branch via a single `DELETE /branches/sub-branches/:id` call.
   */
  deleteSubBranchRecord: async (subBranchId: string, existingSubBranches: SubBranch[] = []): Promise<SubBranch[]> => {
    const strId = String(subBranchId).toLowerCase().trim()
    const targetSub = existingSubBranches.find((sb) => {
      const sId = String(sb.id).toLowerCase().trim()
      const sCode = String(sb.code || '').toLowerCase().trim()
      return sId === strId || (sCode && sCode === strId)
    })

    const apiDeleteId = String(targetSub?.numeric_id || targetSub?.id || subBranchId)
    await SubBranchApiService.delete(apiDeleteId)
    await markGlobalItemDeleted(subBranchId, 'sub_branches')
    if (targetSub?.id) await markGlobalItemDeleted(targetSub.id, 'sub_branches')
    if (targetSub?.code) await markGlobalItemDeleted(targetSub.code, 'sub_branches')

    const targetId = targetSub ? String(targetSub.id).toLowerCase().trim() : strId
    const targetCode = targetSub?.code ? String(targetSub.code).toLowerCase().trim() : ''

    const updatedList = existingSubBranches.filter((sb) => {
      const sId = String(sb.id).toLowerCase().trim()
      const sCode = String(sb.code || '').toLowerCase().trim()
      if (sId === strId || sId === targetId) return false
      if (targetCode && (sId === targetCode || sCode === targetCode)) return false
      if (sCode && sCode === strId) return false
      return true
    })

    await saveModuleDataToDB('sub_branches', updatedList, 'all').catch(() => {})
    return updatedList
  },
}

export const BranchService = {
  getAll: BranchApiService.getAll,
  getById: BranchApiService.getById,
  create: (data: any) => BranchApiService.create(data?.companyId || data?.company_id || 'tech', data),
  update: BranchApiService.update,
  delete: BranchApiService.delete,
  getStats: BranchApiService.getStats,
  getSubBranches: SubBranchApiService.getAll,
  createSubBranch: (data: any) => SubBranchApiService.create(data?.companyId || data?.company_id || 'tech', data),
  updateSubBranch: SubBranchApiService.update,
  deleteSubBranch: SubBranchApiService.delete,
}

export const branchService = branchFeatureService
export default branchFeatureService
