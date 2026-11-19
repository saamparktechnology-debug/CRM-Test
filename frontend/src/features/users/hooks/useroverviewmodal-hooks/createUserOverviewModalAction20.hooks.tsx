"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  X, User, Mail, Phone, Building2, MapPin, Shield, Calendar, 
  CheckCircle2, Clock, AlertCircle, XCircle, FileText, ExternalLink, 
  CreditCard, Landmark, Eye, Check, RefreshCw, Lock, Award, Send, 
  Printer, Sparkles, UserCheck, Briefcase, DollarSign, Layers,
  Camera, Users, Home, Copy
} from "lucide-react"
import { UserItem, KycStatus } from "@/features/users/types"
import { recordUserAccount, updateUser } from "@/features/users/services/userService"
import { api } from "@/lib/api"
import { saveModuleDataToDB } from "@/lib/storageSync"
import { useAuthStore, getSelectableCompanies, isMatchingCompany } from "@/store/useAuthStore"
import { createNotification } from "@/services/notificationService"
import { sendKycStatusEmailNotification } from "@/services/emailNotificationService"
import { OfferLetterDocument } from "@/features/users/components/OfferLetterDocument"
import { IdentityCardDocument } from "@/features/users/components/IdentityCardDocument"
import { UserOverviewModalSection1 } from "@/features/users/components/useroverviewmodal-sections/UserOverviewModalSection1"
import { UserOverviewModalSection2 } from "@/features/users/components/useroverviewmodal-sections/UserOverviewModalSection2"
import { UserOverviewModalSection3 } from "@/features/users/components/useroverviewmodal-sections/UserOverviewModalSection3"
import { type UserOverviewModalProps, KYC_BADGE_CONFIG } from "@/features/users/components/useroverviewmodal-sections/UserOverviewModalHelpers"

export function createUserOverviewModalAction20(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { user, setIsProcessingAction, currentUser, setLiveUser, onUserUpdated } = getCtrl();
    const __fn: any = async () => {
    if (!confirm(`Are you sure you want to approve and mark KYC as Verified for ${user.name}?`)) {
      return
    }

    setIsProcessingAction(true)
    const approverName = currentUser?.name ? `${currentUser.name} (${currentUser.role})` : "Branch Management"

    const updated: UserItem = {
      ...user,
      kycStatus: "Verified",
      kycData: {
        ...(user.kycData || { fullName: user.name, docType: "Aadhaar Card", docNumber: "N/A" }),
        verifiedAt: new Date().toISOString(),
        verifiedBy: approverName,
        rejectionReason: undefined,
      },
    }

    await recordUserAccount(updated)
    await updateUser(user.id, updated).catch(console.warn)

    // Direct MySQL update via backend API to ensure instant persistence
    const targetIdentifier = user.id || user.email
    if (targetIdentifier) {
      await api.put(`/users/${encodeURIComponent(targetIdentifier)}`, {
        kyc_status: "Verified",
        kycStatus: "Verified",
        kyc_data: updated.kycData,
        kycData: updated.kycData,
      }).catch(console.warn)
    }

    setLiveUser(updated)

    // Clear backup localStorage for this employee since they are now verified
    try {
      const emailOrId = (user.email || user.id || "").toLowerCase().trim()
      localStorage.removeItem(`saampark_kyc_submission_${emailOrId}`)
    } catch {}

    // Send official KYC verification successful confirmation email
    sendKycStatusEmailNotification({
      user: updated,
      status: "Verified",
      verifiedBy: approverName,
    }).catch(console.warn)
    
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("saampark_kyc_updated", { detail: updated }))
      window.dispatchEvent(new Event("storage"))
    }

    if (currentUser && (String(currentUser.id) === String(user.id) || currentUser.email?.toLowerCase().trim() === user.email?.toLowerCase().trim())) {
      useAuthStore.setState({
        user: {
          ...currentUser,
          kycStatus: "Verified",
          kycData: updated.kycData,
        }
      })
    }

    onUserUpdated?.(updated)
    setIsProcessingAction(false)
  };
    return __fn(...__args);
  };
}
