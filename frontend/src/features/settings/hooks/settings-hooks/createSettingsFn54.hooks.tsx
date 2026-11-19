"use client"

import { CompanyApiService } from "@/features/companies/services/companyService"
import { api } from "@/lib/api"
import * as React from "react"
import { motion } from "framer-motion"
import { 
  Settings, Building2, Mail, Lock, Sun, Moon, ShieldCheck, 
  Save, CheckCircle2, Globe, Key, AlertCircle, RefreshCw,
  Camera, Upload, User, Sparkles, Phone, MapPin, Briefcase, Tag,
  QrCode, CreditCard
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { useAuthStore, Company, DEFAULT_COMPANIES } from "@/store/useAuthStore"
import { useTheme } from "next-themes"
import { fetchModuleDataFromDB, saveModuleDataToDB } from "@/lib/storageSync"
import { 
  getUsers, 
  recordUserAccount, 
  getStoredUserAccountsAsync,
  cascadeUserAvatarChange, 
  checkUsernameAvailabilityAsync, 
  updateUserUsernameAsync 
} from "@/features/users/services/userService"
import { uploadToImgBB } from "@/lib/imgbbUpload"
import { KycData, KycStatus } from "@/features/users/types"
import { 
  getCompanyPaymentSettings, 
  saveCompanyPaymentSettings, 
  CompanyPaymentSettings,
  DEFAULT_COMPANY_PAYMENT_SETTINGS 
} from "@/features/settings/services/companyPaymentService"
import { EntityModulePermissionsTab } from "@/features/settings/components/EntityModulePermissionsTab"
import { SettingsSection1 } from "@/features/settings/components/settings-sections/SettingsSection1"
import { SettingsSection2 } from "@/features/settings/components/settings-sections/SettingsSection2"
import { SettingsSection3 } from "@/features/settings/components/settings-sections/SettingsSection3"
import { SettingsSection4 } from "@/features/settings/components/settings-sections/SettingsSection4"
import { SettingsSection5 } from "@/features/settings/components/settings-sections/SettingsSection5"
import { createSettingsHandler1 } from "@/features/settings/hooks/settings-hooks/createSettingsHandler1.hooks"
import { type SettingsTab } from "@/features/settings/components/settings-sections/SettingsHelpers"
import { createSettingsAction20 } from "@/features/settings/hooks/settings-hooks/createSettingsAction20.hooks"
import { createSettingsAction21 } from "@/features/settings/hooks/settings-hooks/createSettingsAction21.hooks"
import { createSettingsAction22 } from "@/features/settings/hooks/settings-hooks/createSettingsAction22.hooks"
import { createSettingsAction23 } from "@/features/settings/hooks/settings-hooks/createSettingsAction23.hooks"
import { createSettingsAction24 } from "@/features/settings/hooks/settings-hooks/createSettingsAction24.hooks"
import { createSettingsAction25 } from "@/features/settings/hooks/settings-hooks/createSettingsAction25.hooks"

export function createSettingsFn54(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { setLoading, payQrUrl, payBankName, payAccountHolder, payAccountNumber, payIfsc, payUpiId, payBranch, paySwiftCode, payNotes, setSuccessMsg, setErrorMsg } = getCtrl();
    const __fn: any = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload: CompanyPaymentSettings = {
        qrCodeUrl: payQrUrl,
        bankName: payBankName.trim() || "State Bank of India",
        accountHolderName: payAccountHolder.trim() || "Saampark Technology & Research Pvt. Ltd.",
        accountNumber: payAccountNumber.trim() || "40912384759",
        ifscCode: payIfsc.trim().toUpperCase() || "SBIN0001234",
        upiId: payUpiId.trim() || "saampark@sbi",
        branch: payBranch.trim() || "Balichak Station Road",
        swiftCode: paySwiftCode.trim() || undefined,
        notes: payNotes.trim() || undefined,
      }
      await saveCompanyPaymentSettings(payload)
      setSuccessMsg("✅ Payment QR & Official Bank Details saved! These will now appear on all client Invoices.")
      setTimeout(() => setSuccessMsg(""), 4000)
    } catch (err: any) {
      setErrorMsg(`Error saving payment settings: ${err.message}`)
    } finally {
      setLoading(false)
    }
  };
    return __fn(...__args);
  };
}
