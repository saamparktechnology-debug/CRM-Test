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

export interface UserOverviewModalProps {
  isOpen: boolean
  user: UserItem | null
  onClose: () => void
  onEdit?: (user: UserItem) => void
  onUserUpdated?: (updatedUser: UserItem) => void
}

export const KYC_BADGE_CONFIG: Record<KycStatus, { label: string; bg: string; text: string; icon: any }> = {
  Pending: {
    label: "KYC Pending",
    bg: "bg-amber-500/10 dark:bg-amber-500/20 border-amber-500/30",
    text: "text-amber-600 dark:text-amber-400",
    icon: Clock,
  },
  Processing: {
    label: "KYC Under Review",
    bg: "bg-blue-500/10 dark:bg-blue-500/20 border-blue-500/30",
    text: "text-blue-600 dark:text-blue-400",
    icon: RefreshCw,
  },
  Verified: {
    label: "KYC Verified (Done)",
    bg: "bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500/30",
    text: "text-emerald-600 dark:text-emerald-400",
    icon: CheckCircle2,
  },
  Rejected: {
    label: "KYC Rejected",
    bg: "bg-rose-500/10 dark:bg-rose-500/20 border-rose-500/30",
    text: "text-rose-600 dark:text-rose-400",
    icon: XCircle,
  },
}
