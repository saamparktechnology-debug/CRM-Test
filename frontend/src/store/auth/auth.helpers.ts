import type { Branch, Company, Role, SubBranch, User, UserEntityScope } from './auth.types'

export function getCompanyLogoUrl(company?: Partial<Company> | null): string | null {
  if (!company) return null
  const candidates = [company.logo_url, (company as any)?.logoUrl, company.logo]
  for (const c of candidates) {
    if (typeof c === 'string') {
      const trimmed = c.trim()
      if (
        trimmed.startsWith('http://') ||
        trimmed.startsWith('https://') ||
        trimmed.startsWith('data:image/') ||
        trimmed.startsWith('/') ||
        trimmed.includes('.png') ||
        trimmed.includes('.jpg') ||
        trimmed.includes('.jpeg') ||
        trimmed.includes('.svg') ||
        trimmed.includes('.webp')
      ) {
        return trimmed
      }
    }
  }
  return null
}

export function getCanonicalCompanyId(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return ''
  const str = String(val).toLowerCase().trim()
  if (!str) return ''
  if (str === 'all') return 'all'
  if (
    str === '2' ||
    str === 'consultancy' ||
    str.includes('consult') ||
    str === 'digital' ||
    str.includes('digital') ||
    str === 'print' ||
    str.includes('print')
  ) {
    return 'consultancy'
  }
  if (str === '1' || str === 'tech' || str.includes('tech') || str.includes('research')) {
    return 'tech'
  }
  if (str === 'saampark-ai-solutions' || str.includes('ai-solutions') || str.includes('ai')) {
    return 'saampark-ai-solutions'
  }
  return str
}

export function getCompanyFullName(company?: Partial<Company> | null): string {
  if (!company) return ''

  const explicitName = company.name !== undefined && company.name !== null ? String(company.name).trim() : ''
  if (explicitName && explicitName.toLowerCase() !== 'saampark' && explicitName.toLowerCase() !== 'saampark group') {
    return String(company.name)
  }

  const brand = company.brand_name !== undefined && company.brand_name !== null ? String(company.brand_name) : ''
  const div = company.division_name !== undefined && company.division_name !== null ? String(company.division_name) : ''
  if (brand.trim() && div.trim()) {
    return `${brand} ${div}`
  }
  if (brand.trim()) {
    return brand
  }

  return explicitName
}

export function isMatchingCompany(
  comp: Partial<Company> | null | undefined,
  targetIdOrSlug: string | number | null | undefined
): boolean {
  if (!comp || targetIdOrSlug === null || targetIdOrSlug === undefined) return false
  const target = String(targetIdOrSlug).toLowerCase().trim()
  if (!target) return false
  if (target === 'all') return true

  const canonTarget = getCanonicalCompanyId(target)
  const canonComp = getCanonicalCompanyId(
    comp.id || comp.slug || (comp as any)?.numeric_id || comp.name || comp.division_name
  )

  if (canonTarget && canonComp) {
    return canonTarget === canonComp
  }

  const compIdStr = String(comp.id || '').toLowerCase().trim()
  const compSlugStr = String(comp.slug || '').toLowerCase().trim()
  return compIdStr === target || compSlugStr === target
}

export function isMatchingBranch(
  branch: Partial<Branch> | null | undefined,
  targetBranchId: string | number | null | undefined
): boolean {
  if (!branch || targetBranchId === null || targetBranchId === undefined) return false
  const target = String(targetBranchId).toLowerCase().trim()
  if (!target || target === 'all') return true

  return (
    String(branch.id || '').toLowerCase().trim() === target ||
    String(branch.name || '').toLowerCase().trim() === target ||
    String(branch.code || '').toLowerCase().trim() === target
  )
}

export function getUserEntityScope(
  user: Partial<User> | null | undefined,
  allCompanies: Company[] = [],
  allBranches: Branch[] = [],
  allSubBranches: SubBranch[] = []
): UserEntityScope {
  if (!user) {
    return {
      isSuperAdmin: false,
      scopeLevel: 'subbranch',
      allowedCompanyIds: [],
      allowedBranchIds: [],
      allowedSubBranchIds: [],
      canAccessCompanyHq: false,
      canAccessBranchHq: false,
    }
  }

  const isSuper =
    user.role === 'Super Admin' || (user as any).role_id === 1 || user.email === 'saampark.official@gmail.com'
  if (isSuper) {
    return {
      isSuperAdmin: true,
      scopeLevel: 'global',
      allowedCompanyIds: allCompanies.map((c) => String(c.id)),
      allowedBranchIds: allBranches.map((b) => String(b.id)),
      allowedSubBranchIds: allSubBranches.map((sb) => String(sb.id)),
      canAccessCompanyHq: true,
      canAccessBranchHq: true,
    }
  }

  const rawSubBranchIds: string[] = []
  if (Array.isArray((user as any).subBranchIds)) {
    rawSubBranchIds.push(...(user as any).subBranchIds)
  }
  const singleSub = (user as any).subBranchId || (user as any).sub_branch_id
  if (singleSub && !rawSubBranchIds.includes(singleSub)) {
    rawSubBranchIds.push(singleSub)
  }

  if (rawSubBranchIds.length > 0) {
    const matchedSubs = allSubBranches.filter((sb) =>
      rawSubBranchIds.some((id) => String(id).toLowerCase().trim() === String(sb.id).toLowerCase().trim())
    )
    const allowedSubIds = matchedSubs.length > 0 ? matchedSubs.map((s) => String(s.id)) : rawSubBranchIds
    const parentBranchIds = Array.from(new Set(matchedSubs.map((s) => String(s.parentBranchId)).filter(Boolean)))
    const parentBranches = allBranches.filter((b) => parentBranchIds.includes(String(b.id)))
    const parentCompanyIds = Array.from(
      new Set([
        ...parentBranches.map((b) => String(b.companyId || (b as any).company_id)),
        String(user.companyId || ''),
      ].filter(Boolean))
    )

    return {
      isSuperAdmin: false,
      scopeLevel: 'subbranch',
      allowedCompanyIds: parentCompanyIds,
      allowedBranchIds: parentBranchIds,
      allowedSubBranchIds: allowedSubIds,
      canAccessCompanyHq: false,
      canAccessBranchHq: false,
    }
  }

  const rawBranchIds: string[] = []
  if (Array.isArray(user.branchIds)) {
    rawBranchIds.push(...user.branchIds)
  }
  const singleBranch = user.branchId || (user as any).branch_id
  if (singleBranch && !rawBranchIds.includes(singleBranch)) {
    rawBranchIds.push(singleBranch)
  }

  if (rawBranchIds.length > 0) {
    const matchedBranches = allBranches.filter((b) =>
      rawBranchIds.some((id) => String(id).toLowerCase().trim() === String(b.id).toLowerCase().trim())
    )
    const allowedBIds = matchedBranches.length > 0 ? matchedBranches.map((b) => String(b.id)) : rawBranchIds
    const parentCompanyIds = Array.from(
      new Set([
        ...matchedBranches.map((b) => String(b.companyId || (b as any).company_id)),
        String(user.companyId || ''),
      ].filter(Boolean))
    )
    const allowedSubIds = allSubBranches
      .filter((sb) => allowedBIds.includes(String(sb.parentBranchId)))
      .map((sb) => String(sb.id))

    return {
      isSuperAdmin: false,
      scopeLevel: 'branch',
      allowedCompanyIds: parentCompanyIds,
      allowedBranchIds: allowedBIds,
      allowedSubBranchIds: allowedSubIds,
      canAccessCompanyHq: false,
      canAccessBranchHq: true,
    }
  }

  const rawCompanyIds: string[] = []
  if (Array.isArray(user.companyIds)) {
    rawCompanyIds.push(...user.companyIds)
  }
  const singleComp = user.companyId || (user as any).company_id || (user as any).company
  if (singleComp && !rawCompanyIds.includes(singleComp)) {
    rawCompanyIds.push(String(singleComp))
  }
  if (rawCompanyIds.length === 0 && (user as any).companyName) {
    const matchedByName = allCompanies.find(
      (c) =>
        c.name.toLowerCase().trim() === String((user as any).companyName).toLowerCase().trim() ||
        (c.brand_name && c.brand_name.toLowerCase().trim() === String((user as any).companyName).toLowerCase().trim())
    )
    if (matchedByName) {
      rawCompanyIds.push(String(matchedByName.id))
    }
  }
  if (rawCompanyIds.length === 0) {
    rawCompanyIds.push('tech')
  }

  const matchedCompanies = allCompanies.filter((c) => rawCompanyIds.some((id) => isMatchingCompany(c, id)))
  const allowedCIds = matchedCompanies.length > 0 ? matchedCompanies.map((c) => String(c.id)) : rawCompanyIds

  const allowedBIds = allBranches
    .filter((b) => allowedCIds.some((cId) => isMatchingCompany({ id: cId } as any, b.companyId || (b as any).company_id)))
    .map((b) => String(b.id))

  const allowedSubIds = allSubBranches
    .filter((sb) => allowedBIds.includes(String(sb.parentBranchId)))
    .map((sb) => String(sb.id))

  return {
    isSuperAdmin: false,
    scopeLevel: 'company',
    allowedCompanyIds: allowedCIds,
    allowedBranchIds: allowedBIds,
    allowedSubBranchIds: allowedSubIds,
    canAccessCompanyHq: true,
    canAccessBranchHq: true,
  }
}

export function getSelectableCompanies(
  allCompanies: Company[] = [],
  activeCompanyId?: string | null,
  user?: Partial<User> | null,
  allBranches: Branch[] = [],
  allSubBranches: SubBranch[] = []
): Company[] {
  if (activeCompanyId && activeCompanyId !== 'all') {
    const matched = allCompanies.filter((c) => isMatchingCompany(c, activeCompanyId))
    if (matched.length > 0) return matched
    return allCompanies.slice(0, 1)
  }

  if (user && user.role !== 'Super Admin' && !(user as any).isMaster) {
    const userScope = getUserEntityScope(user, allCompanies, allBranches, allSubBranches)
    if (userScope?.allowedCompanyIds?.length > 0) {
      const userMatched = allCompanies.filter((c) => userScope.allowedCompanyIds.some((id) => isMatchingCompany(c, id)))
      if (userMatched.length > 0) return userMatched
    }
  }

  return allCompanies
}

// Empty defaults — all company and branch data comes from backend APIs
export const DEFAULT_COMPANIES: Company[] = []
export const DEFAULT_BRANCHES: Branch[] = []
export const COMPANIES: Company[] = []

export const DEMO_USERS: Record<Role, User | null> = {
  'Super Admin': null,
  Admin: null,
  Teams: null,
  Clients: null,
}
