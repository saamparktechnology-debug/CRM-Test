"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Building2, Plus, Search, Edit2, Trash2, MapPin, Users, X, Check, 
  ChevronDown, Globe, CreditCard, FileText, QrCode, Sparkles, Lock, 
  UploadCloud, CheckCircle2, Shield, Eye, Phone, Mail, Building,
  AlertCircle, ExternalLink, Image as ImageIcon, Briefcase, Info,
  Landmark, Stamp, FileCheck
} from "lucide-react"
import { useAuthStore, Branch, SubBranch, Company, isMatchingCompany, getSelectableCompanies } from "@/store/useAuthStore"
import { usePermissionStore } from "@/store/usePermissionStore"
import { executeWithFeedback } from "@/store/useActionFeedbackStore"
import { ImageUploadField } from "@/components/ui/ImageUploadField"
import { BranchApiService, SubBranchApiService } from "@/features/companies/services/companyService"
import { BranchesSection1 } from "@/features/branches/components/branches-sections/BranchesSection1"
import { BranchesSection2 } from "@/features/branches/components/branches-sections/BranchesSection2"
import { BranchesSection3 } from "@/features/branches/components/branches-sections/BranchesSection3"
import { BranchesSection4 } from "@/features/branches/components/branches-sections/BranchesSection4"
import { BranchesSection5 } from "@/features/branches/components/branches-sections/BranchesSection5"
import { type Tab, type BranchModalTab, type SubBranchModalTab, cleanStr, cleanUpper , SafeModalBoundary } from "@/features/branches/components/branches-sections/BranchesHelpers"

export function createBranchesAction22(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { branchForm, setIsSaving, branchCompanyId, editingBranch, updateBranch, addBranch, setIsBranchModalOpen, fetchBranches } = getCtrl();
    const __fn: any = async (e: React.FormEvent) => {
    e.preventDefault()
    const branchName = cleanStr(branchForm?.name)
    if (!branchName) return

    setIsSaving(true)
    try {
      const branchCode = cleanUpper(branchForm?.code) || `BR-${Math.floor(100 + Math.random() * 900)}`
      const bankName = cleanStr(branchForm?.gst_bank_name || branchForm?.bank_name || branchForm?.nongst_bank_name)
      const accHolder = cleanStr(branchForm?.gst_account_holder || branchForm?.account_holder || branchForm?.nongst_account_holder)
      const accNum = cleanStr(branchForm?.gst_account_number || branchForm?.account_number || branchForm?.nongst_account_number)
      const ifsc = cleanUpper(branchForm?.gst_ifsc_code || branchForm?.ifsc_code || branchForm?.nongst_ifsc_code)
      const bankBranch = cleanStr(branchForm?.gst_bank_branch || branchForm?.bank_branch || branchForm?.nongst_bank_branch)
      const upiId = cleanStr(branchForm?.gst_upi_id || branchForm?.upi_id || branchForm?.nongst_upi_id)
      const qrUrl = cleanStr(branchForm?.gst_payment_qr_url || branchForm?.payment_qr_url || branchForm?.nongst_payment_qr_url)

      const payload: any = {
        ...branchForm,
        name: branchName,
        code: branchCode,
        companyId: branchCompanyId || "tech",
        company_id: branchCompanyId || "tech",
        bank_name: bankName,
        account_holder: accHolder,
        account_number: accNum,
        ifsc_code: ifsc,
        bank_branch: bankBranch,
        upi_id: upiId,
        payment_qr_url: qrUrl,
        bankDetails: {
          bankName,
          accountHolder: accHolder,
          accountNumber: accNum,
          ifscCode: ifsc,
          upiId,
        }
      }

      if (editingBranch) {
        await executeWithFeedback(async () => {
          await updateBranch(editingBranch.id, payload)
        }, {
          actionType: "update",
          successTitle: "Branch Updated",
          successMsg: `${branchName} updated with all legal, tax, banking, and signatory details.`,
        })
      } else {
        await executeWithFeedback(async () => {
          await addBranch(payload)
        }, {
          actionType: "create",
          successTitle: "Branch Created",
          successMsg: `${branchName} created successfully.`,
        })
      }
      setIsBranchModalOpen(false)
      await fetchBranches().catch(() => {})
    } catch (err) {
      console.error("Save branch error:", err)
    } finally {
      setIsSaving(false)
    }
  };
    return __fn(...__args);
  };
}
