"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Building2, Plus, Search, Edit2, Trash2, ChevronRight, ChevronDown, 
  MapPin, Phone, Mail, Globe, Users, Briefcase, DollarSign, Building, 
  Loader2, AlertCircle, Shield, CreditCard, Award, CheckCircle2, Image,
  X, Sparkles, Eye, Landmark, QrCode, FileText, Check, ShieldCheck,
  Columns, Maximize2, Minimize2, Split, LayoutTemplate, Save, Copy, Layers
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { CompanyApiService, BranchApiService, SubBranchApiService } from "@/features/companies/services/companyService"
import { Company, Branch, SubBranch } from "@/features/companies/types"
import { useAuthStore, isMatchingCompany } from "@/store/useAuthStore"
import { markGlobalItemDeleted, unmarkGlobalItemDeleted, fetchModuleDataFromDB, saveModuleDataToDB, syncGlobalDeletedIds, isGlobalItemDeleted, getLocalDeletedIds } from "@/lib/storageSync"
import { ImageUploadField } from "@/components/ui/ImageUploadField"
import { OfficialInvoiceDocument, CustomTextStamp } from "@/features/invoice/components/OfficialInvoiceDocument"
import { InvoiceItem, InvoiceLineItem } from "@/features/invoice/services/invoiceService"
import { INDUSTRIES, CURRENCIES, PARTNER_TYPES, CANONICAL_COMPANIES, CANONICAL_BRANCHES, cleanStr, cleanUpper, isBranchDeleted , SafeModalBoundary } from "@/features/companies/components/companies-sections/CompaniesHelpers"

export function createCompaniesHandler4(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { deleteTarget, isSuperAdmin, setSaving, companies, setCompanies, branches, setBranches, setShowDeleteConfirm, setDeleteTarget, subBranches, setSubBranches, loadData } = getCtrl();
    const __fn: any = async () => {
    if (!deleteTarget) return
    if (!isSuperAdmin) {
      alert("Permission denied: Only Super Admin can delete companies or branches.")
      return
    }
    setSaving(true)
    try {
      if (deleteTarget.type === "company") {
        const comp = companies.find(c => isMatchingCompany(c, deleteTarget.id))
        const targetId = comp?.id || deleteTarget.id
        const targetSlug = comp?.slug || deleteTarget.id
        const targetNumericId = (comp as any)?.numeric_id ? String((comp as any).numeric_id) : ""

        // Mark deleted in universal registry with module 'companies'
        await markGlobalItemDeleted(targetId, "companies")
        if (targetSlug && targetSlug !== targetId) {
          await markGlobalItemDeleted(targetSlug, "companies")
        }
        if (targetNumericId) {
          await markGlobalItemDeleted(targetNumericId, "companies")
        }

        // Call backend API
        await CompanyApiService.delete(targetId).catch(() => {})

        // Update auth store
        try {
          await useAuthStore.getState().deleteCompany(targetId)
        } catch (e) {
          console.warn("deleteCompany store warning:", e)
        }

        // Immediately update state - keep all other companies intact
        const remainingComps = companies.filter(c => 
          !isMatchingCompany(c, targetId) && 
          !isMatchingCompany(c, targetSlug)
        )
        setCompanies(remainingComps)
        await saveModuleDataToDB("companies", remainingComps, "all").catch(() => {})

        // ONLY filter out branches belonging to the deleted company!
        // Preserve all branches belonging to remaining active companies!
        const remainingBranches = branches.filter(b => {
          const bComp = b.company_id || (b as any).companyId
          return !isMatchingCompany({ id: targetId, slug: targetSlug, numeric_id: targetNumericId } as any, bComp)
        })
        setBranches(remainingBranches)
        await saveModuleDataToDB("branches", remainingBranches, "all").catch(() => {})
      } else if (deleteTarget.type === "branch") {
        alert("Branches cannot be deleted once created. They can only be edited or updated.")
        setShowDeleteConfirm(false)
        setDeleteTarget(null)
        setSaving(false)
        return
      } else {
        const targetSubId = String(deleteTarget.id).toLowerCase().trim()
        const targetSub = subBranches.find(sb => 
          String(sb.id).toLowerCase().trim() === targetSubId || 
          (sb.code && String(sb.code).toLowerCase().trim() === targetSubId)
        )
        // Single clean delete via auth store (handles markGlobalItemDeleted, 1x DELETE API call, and 1x store sync)
        await useAuthStore.getState().deleteSubBranch(deleteTarget.id)

        const targetId = targetSub ? String(targetSub.id).toLowerCase().trim() : targetSubId
        const targetCode = targetSub?.code ? String(targetSub.code).toLowerCase().trim() : ""

        const remainingSub = subBranches.filter(sb => {
          const sId = String(sb.id).toLowerCase().trim()
          const sCode = String(sb.code || "").toLowerCase().trim()
          if (sId === targetSubId || sId === targetId) return false
          if (targetCode && (sId === targetCode || sCode === targetCode)) return false
          if (sCode && sCode === targetSubId) return false
          return true
        })
        setSubBranches(remainingSub)
      }
      setShowDeleteConfirm(false)
      setDeleteTarget(null)
      await loadData()
    } catch (err) {
      console.error("Error deleting:", err)
      alert("Failed to delete record.")
    } finally {
      setSaving(false)
    }
  };
    return __fn(...__args);
  };
}
