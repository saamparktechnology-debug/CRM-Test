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

export function createCompaniesHandler1(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { companyForm, setSaving, editingCompany, generateSlug, companyLogoPos, companySignaturePos, companyStampPos, companyLogoScale, companyStampScale, companySignatureScale, companyCustomStamps, companyZoom, previewInvoiceType, setCompanies, setEditingCompany, setPreviewSaveSuccess, setShowCompanyModal } = getCtrl();
    const __fn: any = async (keepModalOpen = false) => {
    const finalBrand = companyForm.brand_name || ""
    const finalName = companyForm.name || finalBrand
    if (!finalBrand.trim() && !finalName.trim()) return
    setSaving(true)
    try {
      const targetId = (editingCompany as any)?.numeric_id || editingCompany?.id || editingCompany?.slug || "1"
      const compKey = editingCompany ? (editingCompany.slug || String(editingCompany.id)) : "tech"
      const isConsultancy = isMatchingCompany(editingCompany, "consultancy") || String(targetId) === "2" || compKey === "consultancy" || String(companyForm.division_name || "").toLowerCase().includes("consult") || String(companyForm.name || "").toLowerCase().includes("consult")
      const isTech = isMatchingCompany(editingCompany, "tech") || String(targetId) === "1" || compKey === "tech" || String(companyForm.division_name || "").toLowerCase().includes("tech") || String(companyForm.name || "").toLowerCase().includes("tech")
      const finalCanonicalSlug = isConsultancy ? "consultancy" : (isTech ? "tech" : ((companyForm.slug || "").trim() || generateSlug(finalBrand.trim() || finalName.trim())))
      const resolvedCurrency = (CURRENCIES.find(c => c.code === companyForm.currency)?.symbol) || "₹"

      const payload = {
        ...companyForm,
        id: finalCanonicalSlug,
        numeric_id: isConsultancy ? 2 : (isTech ? 1 : Number(targetId) || 1),
        brand_name: finalBrand,
        name: finalName,
        short_code: isConsultancy ? "SCS" : "STR",
        slug: finalCanonicalSlug,
        trademark_symbol: companyForm.trademark_symbol || "",
        currency_symbol: resolvedCurrency,
        logo: companyForm.logo_url || "",
        logo_url: companyForm.logo_url || "",
        logo_position: companyLogoPos,
        signature_position: companySignaturePos,
        stamp_position: companyStampPos,
        logo_scale: companyLogoScale,
        stamp_scale: companyStampScale,
        signature_scale: companySignatureScale,
        custom_stamps: companyCustomStamps,
        zoom: companyZoom,
        preview_invoice_type: previewInvoiceType,
        // Align legacy bank fields to edited profile so old values don't linger
        bank_name: companyForm.gst_bank_name || companyForm.nongst_bank_name || "",
        account_holder: companyForm.gst_account_holder || companyForm.nongst_account_holder || "",
        account_number: companyForm.gst_account_number || companyForm.nongst_account_number || "",
        ifsc_code: companyForm.gst_ifsc_code || companyForm.nongst_ifsc_code || "",
        bank_branch: companyForm.gst_bank_branch || companyForm.nongst_bank_branch || "",
        upi_id: companyForm.gst_upi_id || companyForm.nongst_upi_id || "",
        payment_qr_url: companyForm.gst_payment_qr_url || companyForm.nongst_payment_qr_url || "",
      }

      // 1. Persist strictly to backend API first (multipart payload) — never display unverified frontend data
      const apiTarget = isConsultancy ? "2" : (isTech ? "1" : String(targetId))
      const backendSaved = editingCompany
        ? await CompanyApiService.update(apiTarget, payload)
        : await CompanyApiService.create(payload)

      if (!backendSaved) {
        throw new Error("Backend did not return the saved company record.")
      }

      const savedCompany: Company = {
        ...backendSaved,
        id: (backendSaved as any).slug || String((backendSaved as any).id || finalCanonicalSlug),
        slug: (backendSaved as any).slug || finalCanonicalSlug,
      }

      // 2. Update React & auth store state strictly with backend-returned data
      setCompanies(prev => {
        const idx = prev.findIndex(c => isMatchingCompany(c, savedCompany.slug || savedCompany.id) || isMatchingCompany(c, compKey))
        if (idx >= 0) {
          const next = [...prev]
          next[idx] = savedCompany
          return next
        }
        return [...prev, savedCompany]
      })

      if (editingCompany) {
        setEditingCompany(savedCompany)
      }

      await useAuthStore.getState().fetchCompanies(true)

      // 5. Dispatch events so all tabs / preview sync immediately
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("saampark_company_updated", { detail: payload }))
        window.dispatchEvent(new CustomEvent("saampark_data_synced"))
        window.dispatchEvent(new Event("storage"))
      }

      if (keepModalOpen) {
        setPreviewSaveSuccess(true)
        setTimeout(() => setPreviewSaveSuccess(false), 3000)
      } else {
        setShowCompanyModal(false)
        setEditingCompany(null)
      }

      // 6. Refresh companies in auth store in background (non-blocking)
      useAuthStore.getState().fetchCompanies().catch(() => {})
    } catch (err) {
      console.error("Error saving company:", err)
      alert("Failed to save company.")
    } finally {
      setSaving(false)
    }
  };
    return __fn(...__args);
  };
}
