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

export type Tab = "branches" | "sub-branches"

export type BranchModalTab = "basic" | "address" | "tax" | "bank" | "signatory"

export type SubBranchModalTab = "basic" | "address" | "tax" | "bank" | "signatory"

export const cleanStr = (val: any) => (val && typeof val === "string" ? val.trim() : "")

export const cleanUpper = (val: any) => (val && typeof val === "string" ? val.trim().toUpperCase() : "")

export class SafeModalBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error }
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error("Branch Modal Error:", error, errorInfo)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 rounded-2xl m-4 space-y-3">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertCircle size={18} className="text-rose-600" />
            <span>Form Render Issue</span>
          </div>
          <pre className="text-xs bg-white dark:bg-zinc-900 p-3 rounded-xl border border-rose-200 dark:border-rose-800/60 overflow-auto max-h-48 whitespace-pre-wrap font-mono">
            {String(this.state.error?.message || this.state.error)}
          </pre>
          <button 
            type="button" 
            onClick={() => this.setState({ hasError: false, error: null })} 
            className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all"
          >
            Reset Form
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
