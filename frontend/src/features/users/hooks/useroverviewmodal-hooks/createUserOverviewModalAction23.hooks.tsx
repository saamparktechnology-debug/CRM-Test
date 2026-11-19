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

export function createUserOverviewModalAction23(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { kyc, setIsProcessingAction, activeUser, user, setLiveUser, onUserUpdated } = getCtrl();
    const __fn: any = async () => {
    if (!kyc?.bankChangeRequest) return
    const reason = prompt("Enter reason for rejecting this bank change request:", "Proof unclear or account mismatch")
    if (!reason) return

    setIsProcessingAction(true)
    try {
      const updatedKyc = {
        ...kyc,
        bankChangeRequest: {
          ...kyc.bankChangeRequest,
          status: "rejected",
          rejectionReason: reason,
          rejectedAt: new Date().toISOString(),
        }
      }

      const updated: UserItem = {
        ...activeUser,
        kycData: updatedKyc,
      }

      await recordUserAccount(updated)
      await updateUser(user.id, updated).catch(console.warn)

      const targetIdentifier = user.id || user.email
      if (targetIdentifier) {
        await api.put(`/users/${encodeURIComponent(targetIdentifier)}`, {
          kyc_data: updatedKyc,
          kycData: updatedKyc,
        }).catch(console.warn)
      }

      setLiveUser(updated)
      onUserUpdated?.(updated)
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("saampark_kyc_updated", { detail: updated }))
        window.dispatchEvent(new Event("storage"))
      }
      alert("❌ Bank change request rejected. Payouts will continue to the existing verified account.")
    } catch (err: any) {
      alert(`Failed to reject bank change: ${err.message}`)
    } finally {
      setIsProcessingAction(false)
    }
  };
    return __fn(...__args);
  };
}
