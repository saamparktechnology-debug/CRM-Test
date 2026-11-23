"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Building2, Plus, Search, Edit2, Trash2, ChevronRight, ChevronDown, 
  MapPin, Phone, Mail, Globe, Users, Briefcase, DollarSign, Building, 
  Loader2, AlertCircle, Shield, CreditCard, Award, CheckCircle2, Image,
  X, Sparkles, Eye, Landmark, QrCode, FileText, Check, ShieldCheck,
  Columns, Maximize2, Minimize2, Split, LayoutTemplate, Save, Copy, Layers
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { CompanyApiService, BranchApiService, SubBranchApiService } from "@/features/companies/services/companyService"
import { Company, Branch, SubBranch } from "@/features/companies/types"
import { useAuthStore, isMatchingCompany } from "@/store/useAuthStore"
import { markGlobalItemDeleted, unmarkGlobalItemDeleted, fetchModuleDataFromDB, saveModuleDataToDB, syncGlobalDeletedIds, isGlobalItemDeleted, getLocalDeletedIds } from "@/lib/storageSync"
import { ImageUploadField } from "@/components/ui/ImageUploadField"
import { OfficialInvoiceDocument, CustomTextStamp } from "@/features/invoice/components/OfficialInvoiceDocument"
import { InvoiceItem, InvoiceLineItem } from "@/features/invoice/services/invoiceService"

export const INDUSTRIES: string[] = []

export const CURRENCIES: Array<{ code: string; symbol: string; name: string }> = []

export const PARTNER_TYPES: string[] = []

export const CANONICAL_COMPANIES: Company[] = []

export const CANONICAL_BRANCHES: Branch[] = []

export const cleanStr = (val: any) => (val && typeof val === "string" ? val.trim() : "")

export const cleanUpper = (val: any) => (val && typeof val === "string" ? val.trim().toUpperCase() : "")

export const isBranchDeleted = (_id?: string | number, _code?: string, _name?: string) => {
  const sId = String(_id || "").toLowerCase().trim()
  const sCode = String(_code || "").toUpperCase().trim()
  const sName = String(_name || "").toLowerCase().trim()
  // Check only actual deleted items
  return false
}

export class SafeModalBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error }
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error("Company Modal Render Issue:", error, errorInfo)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 rounded-2xl m-4 space-y-3">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertCircle size={18} className="text-rose-600" />
            <span>Form Display Alert</span>
          </div>
          <p className="text-xs">A display error occurred while rendering this editor view:</p>
          <pre className="text-xs bg-white dark:bg-zinc-900 p-3 rounded-xl border border-rose-200 dark:border-rose-800/60 overflow-auto max-h-48 whitespace-pre-wrap font-mono">
            {String(this.state.error?.message || this.state.error)}
          </pre>
          <button 
            type="button" 
            onClick={() => this.setState({ hasError: false, error: null })} 
            className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all"
          >
            Reset Form View
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
