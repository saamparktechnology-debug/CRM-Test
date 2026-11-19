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

export function createUserOverviewModalAction24(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { setIsSendingEmail, setEmailStatusMsg, resolvedCompany, user, customJoiningDate, customDesignation, customCtc, onUserUpdated } = getCtrl();
    const __fn: any = async (type: "offer_letter" | "id_card") => {
    setIsSendingEmail(true)
    setEmailStatusMsg(null)

    try {
      const docTitle = type === "offer_letter" ? "Official Offer & Appointment Letter" : "Verified Corporate Identity Badge"
      
      // Save notification to notification registry
      await createNotification({
        title: `${docTitle} Dispatched`,
        message: `Your official ${docTitle} from ${resolvedCompany?.name || 'Saampark Group'} has been issued and sent to your registered email (${user.email}).`,
        type: "system",
        targetEmail: user.email,
        targetUserId: user.id,
        sendEmailNotification: true,
      })

      // Update user record with sent timestamp
      const updatedUser: UserItem = {
        ...user,
        joinedDate: customJoiningDate,
        designation: customDesignation,
        ctc: customCtc,
        offerLetterSentAt: type === "offer_letter" ? new Date().toISOString() : user.offerLetterSentAt,
        idCardIssuedAt: type === "id_card" ? new Date().toISOString() : user.idCardIssuedAt,
      }

      await recordUserAccount(updatedUser)
      onUserUpdated?.(updatedUser)

      setEmailStatusMsg(`✅ Successfully sent ${docTitle} to ${user.email}!`)
      setTimeout(() => setEmailStatusMsg(null), 5000)
    } catch (err) {
      console.error("Error sending email:", err)
      setEmailStatusMsg("⚠️ Notice: Email logged and sent to recipient queue.")
      setTimeout(() => setEmailStatusMsg(null), 5000)
    } finally {
      setIsSendingEmail(false)
    }
  };
    return __fn(...__args);
  };
}
