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
import { type UserOverviewModalProps, KYC_BADGE_CONFIG } from "@/features/users/components/useroverviewmodal-sections/UserOverviewModalHelpers"

export function UserOverviewModalSection3({ ctrl }: { ctrl: any }) {
  const { user, kycConfig, KycIcon, kycStatus, setActiveTab, activeTab, onEdit, onClose, emailStatusMsg } = ctrl;
  return (
    <>
      {/* Modal Top Header */}
        <div className="p-5 border-b border-border/60 bg-surface-hover/30 flex items-center justify-between shrink-0 flex-wrap gap-3">
          <div className="flex items-center gap-3.5">
            {/* Avatar */}
            <div className="relative">
              {(() => {
                const avatarSrc = user.avatarUrl || (user as any).avatar
                return avatarSrc && !avatarSrc.includes("dicebear") ? (
                  <img
                    src={avatarSrc}
                    alt={user.name}
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-primary/20 shadow-xs"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-base shadow-xs">
                    {user.name.substring(0, 2).toUpperCase()}
                  </div>
                )
              })()}
              <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-surface ${
                user.status === "Active" ? "bg-emerald-500" : "bg-zinc-400"
              }`} />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-foreground">{user.name}</h3>
                <span className="inline-flex items-center gap-1 font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  ID: {user.employeeId || `SP-EMP-${String(user.id).replace(/[^0-9]/g, "").slice(-4).padStart(4, "0") || "0041"}`}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                  {user.role}
                </span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${kycConfig.bg} ${kycConfig.text}`}>
                  <KycIcon size={12} className={kycStatus === "Processing" ? "animate-spin" : ""} />
                  <span>{kycConfig.label}</span>
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
            </div>
          </div>

          {/* Navigation Tab Pills */}
          <div className="flex items-center gap-1.5 bg-surface-hover p-1 rounded-2xl border border-border shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("kyc")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "kyc" 
                  ? "bg-primary text-white shadow-xs" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <User size={13} />
              <span>Profile &amp; KYC</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("offer_letter")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "offer_letter" 
                  ? "bg-primary text-white shadow-xs" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileText size={13} />
              <span>Official Offer Letter</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("id_card")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "id_card" 
                  ? "bg-primary text-white shadow-xs" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Award size={13} />
              <span>Identity Card (ID Badge)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                type="button"
                onClick={() => { onClose(); onEdit(user) }}
                className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold transition-colors cursor-pointer"
              >
                Edit Account
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Global Feedback Banner */}
        {emailStatusMsg && (
          <div className="px-6 py-2 bg-emerald-500/15 border-b border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
            <Check size={14} />
            <span>{emailStatusMsg}</span>
          </div>
        )}

        {/* Modal Scrollable Body */}
    </>
  );
}
