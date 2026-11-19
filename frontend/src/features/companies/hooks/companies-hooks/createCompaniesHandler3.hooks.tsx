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

export function createCompaniesHandler3(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { subBranchForm, setSaving, branches, subBranchBranchId, companies, subBranchCompanyId, resolveNumericCompId, subBranchSignaturePos, subBranchStampPos, subBranchLogoScale, subBranchStampScale, subBranchSignatureScale, subBranchCustomStamps, subBranchZoom, previewInvoiceType, editingSubBranch, setEditingSubBranch, setSubBranches, setSubBranchPreviewSaveSuccess, setShowSubBranchModal, setExpandedBranches } = getCtrl();
    const __fn: any = async (keepModalOpen = false) => {
    const cleanSubName = cleanStr(subBranchForm.name)
    if (!cleanSubName) return
    setSaving(true)
    try {
      const curBranch = branches.find(b => String(b.id) === String(subBranchBranchId) || (b.code && b.code === subBranchBranchId))
      const resolvedBranchId = curBranch?.id || subBranchBranchId
      const curComp = companies.find(c => isMatchingCompany(c, subBranchCompanyId) || (curBranch && isMatchingCompany(c, curBranch.company_id)))
      const resolvedCompNumeric = resolveNumericCompId(curComp, subBranchCompanyId || (curBranch as any)?.company_id)
      const resolvedCompSlug = curComp?.slug || (resolvedCompNumeric === 2 ? "consultancy" : "tech")

      const payload: any = {
        branch_id: resolvedBranchId,
        parentBranchId: resolvedBranchId,
        companyId: resolvedCompSlug,
        company_id: resolvedCompNumeric,
        ...subBranchForm,
        name: cleanSubName,
        code: cleanUpper(subBranchForm.code) || `SB-${Math.floor(100 + Math.random() * 900)}`,
        revenue_share_pct: Number(subBranchForm.revenue_share_pct || 0),
        revenueSharePct: Number(subBranchForm.revenue_share_pct || 0),
        signature_position: subBranchSignaturePos,
        stamp_position: subBranchStampPos,
        logo_scale: subBranchLogoScale,
        stamp_scale: subBranchStampScale,
        signature_scale: subBranchSignatureScale,
        custom_stamps: subBranchCustomStamps,
        zoom: subBranchZoom,
        preview_invoice_type: previewInvoiceType,
        // Base fallback banking
        bank_name: cleanStr(subBranchForm.gst_bank_name || subBranchForm.bank_name || subBranchForm.nongst_bank_name),
        account_holder: cleanStr(subBranchForm.gst_account_holder || subBranchForm.account_holder || subBranchForm.nongst_account_holder),
        account_number: cleanStr(subBranchForm.gst_account_number || subBranchForm.account_number || subBranchForm.nongst_account_number),
        ifsc_code: cleanUpper(subBranchForm.gst_ifsc_code || subBranchForm.ifsc_code || subBranchForm.nongst_ifsc_code),
        bank_branch: cleanStr(subBranchForm.gst_bank_branch || subBranchForm.bank_branch || subBranchForm.nongst_bank_branch),
        upi_id: cleanStr(subBranchForm.gst_upi_id || subBranchForm.upi_id || subBranchForm.nongst_upi_id),
        payment_qr_url: subBranchForm.gst_payment_qr_url || subBranchForm.payment_qr_url || subBranchForm.nongst_payment_qr_url || "",
      }

      // Sub-branch saved via PUT/POST without triggering delete endpoint
      

      // Strictly persist to backend API first — never fabricate local IDs or display frontend-entered data on failure
      let savedSub: any = null
      if (editingSubBranch) {
        const apiRes = await SubBranchApiService.update(String(editingSubBranch.id), payload)
        savedSub = { ...apiRes, id: String(apiRes?.id || editingSubBranch.id) }
        setEditingSubBranch(savedSub)
        setSubBranches(prev => prev.map(sb => String(sb.id) === String(editingSubBranch.id) ? savedSub : sb))
      } else {
        const apiRes = await SubBranchApiService.create(String(resolvedCompNumeric), payload)
        if (!apiRes?.id) {
          throw new Error("Backend did not return a valid sub-branch ID.")
        }
        savedSub = { ...apiRes, id: String(apiRes.id), branch_id: apiRes.branch_id ?? resolvedBranchId, company_id: apiRes.company_id ?? resolvedCompNumeric, companyId: resolvedCompSlug }
        setSubBranches(prev => [...prev.filter(sb => String(sb.id) !== String(savedSub.id)), savedSub])
      }

      await useAuthStore.getState().fetchSubBranches(true)

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("storage"))
        window.dispatchEvent(new CustomEvent("saampark_data_synced"))
      }

      if (keepModalOpen) {
        setSubBranchPreviewSaveSuccess(true)
        setTimeout(() => setSubBranchPreviewSaveSuccess(false), 3000)
      } else {
        setShowSubBranchModal(false)
        setEditingSubBranch(null)
      }
      setExpandedBranches(prev => new Set([...prev, subBranchBranchId]))
    } catch (err) {
      console.error("Error saving sub-branch:", err)
      alert("Failed to save sub-branch.")
    } finally {
      setSaving(false)
    }
  };
    return __fn(...__args);
  };
}
