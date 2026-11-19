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

export function createBranchesAction25(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { subBranchForm, setIsSaving, subBranchCompanyId, subBranchParentBranchId, editingSubBranch, updateSubBranch, addSubBranch, setIsSubBranchModalOpen, fetchSubBranches } = getCtrl();
    const __fn: any = async (e: React.FormEvent) => {
    e.preventDefault()
    const subName = cleanStr(subBranchForm?.name)
    if (!subName) return

    setIsSaving(true)
    try {
      const subCode = cleanUpper(subBranchForm?.code) || `SB-${Math.floor(100 + Math.random() * 900)}`
      const bankName = cleanStr(subBranchForm?.gst_bank_name || subBranchForm?.bank_name || subBranchForm?.nongst_bank_name)
      const accHolder = cleanStr(subBranchForm?.gst_account_holder || subBranchForm?.account_holder || subBranchForm?.nongst_account_holder)
      const accNum = cleanStr(subBranchForm?.gst_account_number || subBranchForm?.account_number || subBranchForm?.nongst_account_number)
      const ifsc = cleanUpper(subBranchForm?.gst_ifsc_code || subBranchForm?.ifsc_code || subBranchForm?.nongst_ifsc_code)
      const bankBranch = cleanStr(subBranchForm?.gst_bank_branch || subBranchForm?.bank_branch || subBranchForm?.nongst_bank_branch)
      const upiId = cleanStr(subBranchForm?.gst_upi_id || subBranchForm?.upi_id || subBranchForm?.nongst_upi_id)
      const qrUrl = cleanStr(subBranchForm?.gst_payment_qr_url || subBranchForm?.payment_qr_url || subBranchForm?.nongst_payment_qr_url)

      const payload: any = {
        ...subBranchForm,
        name: subName,
        code: subCode,
        companyId: subBranchCompanyId || "tech",
        company_id: subBranchCompanyId || "tech",
        parentBranchId: subBranchParentBranchId,
        branch_id: subBranchParentBranchId,
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

      if (editingSubBranch) {
        await executeWithFeedback(async () => {
          await updateSubBranch(editingSubBranch.id, payload)
        }, {
          actionType: "update",
          successTitle: "Sub-Branch Updated",
          successMsg: `${subName} updated successfully.`,
        })
      } else {
        await executeWithFeedback(async () => {
          await addSubBranch(payload)
        }, {
          actionType: "create",
          successTitle: "Sub-Branch Created",
          successMsg: `${subName} created successfully.`,
        })
      }
      setIsSubBranchModalOpen(false)
      await fetchSubBranches().catch(() => {})
    } catch (err) {
      console.error("Save sub-branch error:", err)
    } finally {
      setIsSaving(false)
    }
  };
    return __fn(...__args);
  };
}
