"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Building2, Plus, Pencil, Trash2, Shield, MapPin, Phone, Mail, 
  User, Check, X, AlertTriangle, Layers, ChevronDown, ChevronRight, ChevronLeft,
  Globe, CreditCard, FileText, QrCode, Sparkles, Lock, UploadCloud,
  Image as ImageIcon, CheckCircle2
} from "lucide-react"
import { useAuthStore, Company, Branch, SubBranch, getCompanyFullName, getCompanyLogoUrl, isMatchingCompany } from "@/store/useAuthStore"
import { getUsers } from "@/features/users/services/userService"
import { executeWithFeedback, useActionFeedbackStore } from "@/store/useActionFeedbackStore"
import { usePermissionStore, ALL_APP_MODULES, CLEAN_MODULE_CATEGORIES } from "@/store/usePermissionStore"
import { CompanyBranchSettingsSection1 } from "@/features/settings/components/companybranchsettings-sections/CompanyBranchSettingsSection1"
import { CompanyBranchSettingsSection2 } from "@/features/settings/components/companybranchsettings-sections/CompanyBranchSettingsSection2"
import { CompanyBranchSettingsSection3 } from "@/features/settings/components/companybranchsettings-sections/CompanyBranchSettingsSection3"
import { CompanyBranchSettingsSection4 } from "@/features/settings/components/companybranchsettings-sections/CompanyBranchSettingsSection4"
import { createCompanyBranchSettingsHandler1 } from "@/features/settings/hooks/companybranchsettings-hooks/createCompanyBranchSettingsHandler1.hooks"
import { createCompanyBranchSettingsHandler2 } from "@/features/settings/hooks/companybranchsettings-hooks/createCompanyBranchSettingsHandler2.hooks"
import { createCompanyBranchSettingsHandler3 } from "@/features/settings/hooks/companybranchsettings-hooks/createCompanyBranchSettingsHandler3.hooks"
import { createCompanyBranchSettingsHandler4 } from "@/features/settings/hooks/companybranchsettings-hooks/createCompanyBranchSettingsHandler4.hooks"

export function createCompanyBranchSettingsAction21(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { companySmtpHost, companySmtpPort, companySmtpUser, companySmtpPass, companyTestEmail, setIsTestingCompanySmtp, setCompanySmtpTestResult, companySmtpSecure, companySmtpFromName, companyBrandName, companySmtpFromEmail } = getCtrl();
    const __fn: any = async () => {
    if (!companySmtpHost || !companySmtpPort || !companySmtpUser || !companySmtpPass) {
      alert("Please fill in SMTP host, port, username, and password before testing.")
      return
    }
    const targetRecipient = companyTestEmail.trim() || companySmtpUser.trim()
    if (!targetRecipient) {
      alert("Please enter a test recipient email address.")
      return
    }

    setIsTestingCompanySmtp(true)
    setCompanySmtpTestResult(null)

    try {
      const { api } = await import("@/lib/api")
      const res: any = await api.post("/email/test-smtp", {
        host: companySmtpHost,
        port: parseInt(companySmtpPort, 10),
        secure: companySmtpSecure,
        user: companySmtpUser,
        pass: companySmtpPass,
        from_name: companySmtpFromName || companyBrandName || "SAAMPARK",
        from_email: companySmtpFromEmail || companySmtpUser,
        test_recipient: targetRecipient
      })

      if (res?.data?.success || res?.status === 200 || res?.success) {
        setCompanySmtpTestResult({ success: true, message: `Handshake successful! Test dispatch sent to ${targetRecipient}` })
      } else {
        setCompanySmtpTestResult({ success: false, message: res?.data?.error || res?.error || "SMTP test failed. Please check credentials." })
      }
    } catch (err: any) {
      setCompanySmtpTestResult({ 
        success: false, 
        message: err?.response?.data?.error || err.message || "Failed to establish secure TLS SMTP connection." 
      })
    } finally {
      setIsTestingCompanySmtp(false)
    }
  };
    return __fn(...__args);
  };
}
