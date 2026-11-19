"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Building2, GitBranch, MapPin, CheckCircle2, AlertCircle, 
  Search, SlidersHorizontal, ShieldCheck, Check, X, 
  RotateCcw, Sparkles, Layers, Eye, EyeOff, Save, Info
} from "lucide-react"

import { useAuthStore, Company, Branch, SubBranch, DEFAULT_COMPANIES } from "@/store/useAuthStore"
import { 
  usePermissionStore, 
  ALL_APP_MODULES, 
  CONFIGURABLE_MODULES, 
  CLEAN_MODULE_CATEGORIES 
} from "@/store/usePermissionStore"
import { saveModuleDataToDB, fetchModuleDataFromDB } from "@/lib/storageSync"
import { Button } from "@/components/ui/Button"
import { EntityModulePermissionsTabSection1 } from "@/features/settings/components/entitymodulepermissionstab-sections/EntityModulePermissionsTabSection1"
import { EntityModulePermissionsTabSection2 } from "@/features/settings/components/entitymodulepermissionstab-sections/EntityModulePermissionsTabSection2"


import { type EntityTier } from "@/features/settings/components/entitymodulepermissionstab-sections/EntityModulePermissionsTabHelpers"
export * from "@/features/settings/components/entitymodulepermissionstab-sections/EntityModulePermissionsTabHelpers"

export function EntityModulePermissionsTab() {
  const __ctrlRef = React.useRef<any>({});
  let __ctrl: any = {};

  const { 
    companies, 
    branches, 
    subBranches, 
    fetchCompanies, 
    fetchBranches, 
    fetchSubBranches 
  } = useAuthStore()

  const {
    companyEnabledModules,
    branchEnabledModules,
    subBranchEnabledModules,
    setCompanyEnabledModules,
    setBranchEnabledModules,
    setSubBranchEnabledModules,
  } = usePermissionStore()

  // State
  const [tier, setTier] = React.useState<EntityTier>("company")
  const [selectedEntityId, setSelectedEntityId] = React.useState<string>("")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all")
  const [draftModules, setDraftModules] = React.useState<string[]>([...CONFIGURABLE_MODULES])
  const [isSaving, setIsSaving] = React.useState(false)
  const [successMessage, setSuccessMessage] = React.useState("")
  const [errorMessage, setErrorMessage] = React.useState("")

  // Ensure fresh entity data from DB on mount
  React.useEffect(() => {
    fetchCompanies?.().catch(() => {})
    fetchBranches?.().catch(() => {})
    fetchSubBranches?.().catch(() => {})
  }, [fetchCompanies, fetchBranches, fetchSubBranches])

  // Companies list fallback
  const effectiveCompanies = React.useMemo(() => {
    return companies && companies.length > 0 ? companies : DEFAULT_COMPANIES
  }, [companies])

  // Auto-select initial entity when tier changes
  React.useEffect(() => {
    if (tier === "company") {
      const first = effectiveCompanies[0]?.id || "tech"
      setSelectedEntityId(first)
    } else if (tier === "branch") {
      const first = branches[0]?.id || ""
      setSelectedEntityId(first)
    } else if (tier === "subbranch") {
      const first = subBranches[0]?.id || ""
      setSelectedEntityId(first)
    }
  }, [tier, effectiveCompanies, branches, subBranches])

  // Load current modules for selected entity into draft state
  React.useEffect(() => {
    if (!selectedEntityId) return

    let current: string[] | undefined
    const normId = String(selectedEntityId).toLowerCase().trim()

    if (tier === "company") {
      const canonKey = (normId.includes("consult") || normId === "2") ? "consultancy" : (normId.includes("tech") || normId === "1" ? "tech" : normId)
      current = companyEnabledModules[selectedEntityId] || companyEnabledModules[canonKey]
    } else if (tier === "branch") {
      current = branchEnabledModules[selectedEntityId] || branchEnabledModules[normId]
    } else if (tier === "subbranch") {
      current = subBranchEnabledModules[selectedEntityId] || subBranchEnabledModules[normId]
    }

    if (current && Array.isArray(current)) {
      setDraftModules([...current])
    } else {
      // Default: all configurable modules enabled
      setDraftModules([...CONFIGURABLE_MODULES])
    }
  }, [selectedEntityId, tier, companyEnabledModules, branchEnabledModules, subBranchEnabledModules])

  // Selected entity display metadata
  const selectedEntityMeta = React.useMemo(() => {
    if (tier === "company") {
      const comp = effectiveCompanies.find(c => String(c.id).toLowerCase() === String(selectedEntityId).toLowerCase())
      return {
        name: comp?.name || selectedEntityId || "Selected Company",
        subtitle: comp?.division_name || comp?.subtitle || "Company Scope",
        type: "Company",
      }
    }
    if (tier === "branch") {
      const br = branches.find(b => String(b.id).toLowerCase() === String(selectedEntityId).toLowerCase())
      const comp = effectiveCompanies.find(c => String(c.id).toLowerCase() === String(br?.companyId).toLowerCase())
      return {
        name: br?.name || selectedEntityId || "Selected Branch",
        subtitle: `Belongs to: ${comp?.name || br?.companyId || "Parent Company"}`,
        type: "Branch",
      }
    }
    const sb = subBranches.find(s => String(s.id).toLowerCase() === String(selectedEntityId).toLowerCase())
    const parentBr = branches.find(b => String(b.id).toLowerCase() === String(sb?.parentBranchId).toLowerCase())
    return {
      name: sb?.name || selectedEntityId || "Selected Sub-Branch",
      subtitle: `Under branch: ${parentBr?.name || sb?.parentBranchId || "Parent Branch"}`,
      type: "Sub-Branch",
    }
  }, [tier, selectedEntityId, effectiveCompanies, branches, subBranches])

  // Toggle single module
  const toggleModule = (moduleKey: string) => {
    setDraftModules(prev => {
      if (prev.includes(moduleKey)) {
        return prev.filter(m => m !== moduleKey)
      } else {
        return [...prev, moduleKey]
      }
    })
  }

  // Bulk enable all
  const handleEnableAll = () => {
    setDraftModules([...CONFIGURABLE_MODULES])
  }

  // Bulk disable all
  const handleDisableAll = () => {
    // Keep Settings enabled so Super Admin can always configure system
    setDraftModules(["Settings"])
  }

  // Toggle all in a category
  const toggleCategory = (modules: { key: string }[]) => {
    const keys = modules.map(m => m.key)
    const allEnabled = keys.every(k => draftModules.includes(k))
    if (allEnabled) {
      // Disable all in this category
      setDraftModules(prev => prev.filter(k => !keys.includes(k)))
    } else {
      // Enable all in this category
      setDraftModules(prev => Array.from(new Set([...prev, ...keys])))
    }
  }

  // Save changes to Zustand Store & MySQL database
  const handleSave = async () => {
    if (!selectedEntityId) return
    setIsSaving(true)
    setSuccessMessage("")
    setErrorMessage("")

    try {
      const modulesToSave = [...draftModules]

      // 1. Update Zustand store
      if (tier === "company") {
        setCompanyEnabledModules(selectedEntityId, modulesToSave)
      } else if (tier === "branch") {
        setBranchEnabledModules(selectedEntityId, modulesToSave)
      } else if (tier === "subbranch") {
        setSubBranchEnabledModules(selectedEntityId, modulesToSave)
      }

      // 2. Persist to database storageSync
      const payload = {
        tier,
        entityId: selectedEntityId,
        modules: modulesToSave,
        updatedAt: new Date().toISOString(),
      }

      await saveModuleDataToDB(
        `entity_permissions_${tier}_${selectedEntityId}`,
        payload,
        "all"
      ).catch(() => {})

      // Also persist consolidated map
      const storageKey = `saampark_entity_modules_${tier}`
      try {
        const rawExisting = await fetchModuleDataFromDB<Record<string, string[]>>(storageKey, {}, "all").catch(() => ({}))
        const existing: Record<string, string[]> = (rawExisting && typeof rawExisting === "object") ? { ...rawExisting } : {}
        existing[selectedEntityId] = modulesToSave
        await saveModuleDataToDB(storageKey, existing, "all").catch(() => {})
      } catch {}

      // 3. Dispatch global sync event
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("saampark_entity_permissions_updated"))
        window.dispatchEvent(new CustomEvent("saampark_data_synced"))
      }

      setSuccessMessage(`✅ Module permissions for "${selectedEntityMeta.name}" saved successfully!`)
      setTimeout(() => setSuccessMessage(""), 4000)
    } catch (err: any) {
      setErrorMessage(`Failed to save entity permissions: ${err?.message || "Unknown error"}`)
    } finally {
      setIsSaving(false)
    }
  }

  // Filter modules by search & category
  const filteredCategories = React.useMemo(() => {
    const query = searchQuery.toLowerCase().trim()
    const result: Array<{
      id: string
      label: string
      icon: string
      modules: Array<{ key: string; name: string; description: string }>
    }> = []

    for (const [catId, cat] of Object.entries(CLEAN_MODULE_CATEGORIES)) {
      if (selectedCategory !== "all" && selectedCategory !== catId) continue

      const matchedMods = cat.modules.filter(m => {
        if (!query) return true
        return (
          m.name.toLowerCase().includes(query) ||
          m.description.toLowerCase().includes(query) ||
          m.key.toLowerCase().includes(query)
        )
      })

      if (matchedMods.length > 0) {
        result.push({
          id: catId,
          label: cat.label,
          icon: cat.icon,
          modules: matchedMods,
        })
      }
    }

    return result
  }, [searchQuery, selectedCategory])

  const totalModulesCount = CONFIGURABLE_MODULES.length
  const activeCount = draftModules.filter(m => CONFIGURABLE_MODULES.includes(m as any)).length

  
  __ctrl = { companies, branches, subBranches, fetchCompanies, fetchBranches, fetchSubBranches, companyEnabledModules, branchEnabledModules, subBranchEnabledModules, setCompanyEnabledModules, setBranchEnabledModules, setSubBranchEnabledModules, tier, setTier, selectedEntityId, setSelectedEntityId, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, draftModules, setDraftModules, isSaving, setIsSaving, successMessage, setSuccessMessage, errorMessage, setErrorMessage, effectiveCompanies, selectedEntityMeta, toggleModule, handleEnableAll, handleDisableAll, toggleCategory, handleSave, filteredCategories, totalModulesCount, activeCount };
  __ctrlRef.current = __ctrl;
return (
    <div className="space-y-6">
      <EntityModulePermissionsTabSection1 ctrl={__ctrl} />

      <EntityModulePermissionsTabSection2 ctrl={__ctrl} />

      {/* Floating or Bottom Save Bar */}
      <div className="sticky bottom-4 z-20 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
          <Info size={15} className="text-blue-500 shrink-0" />
          <span>
            Ready to commit module permissions for <strong className="text-zinc-900 dark:text-zinc-100">{selectedEntityMeta.name}</strong> ({activeCount} enabled).
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleEnableAll}
            className="text-xs font-semibold"
          >
            Reset to All
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !selectedEntityId}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs gap-2 px-6 shadow-md shadow-blue-600/20 cursor-pointer disabled:opacity-50"
          >
            <Save size={14} />
            <span>{isSaving ? "Saving..." : "Save Entity Permissions"}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
