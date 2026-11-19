"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  X, Check, DollarSign, Calculator, UserCheck, Users, Calendar, Briefcase, FileText, 
  Coins, RefreshCw, Layers, CreditCard, Building2, Mail, Phone, MapPin, 
  Plus, Trash2, Tag, ChevronDown, ChevronUp, Sparkles, Search, Receipt,
  ShieldCheck, AlertCircle, Eye, Landmark, QrCode, Award, Clock, CheckCircle2, ListChecks
} from "lucide-react"
import { useAuthStore, Company, Branch, SubBranch, getCompanyLogoUrl, getCanonicalCompanyId, getSelectableCompanies, getUserEntityScope, isMatchingCompany } from "@/store/useAuthStore"
import { getClients, saveStoredClient } from "@/features/clients/services/clientService"
import { ClientItem } from "@/features/clients/types"
import { 
  InvoiceItem, 
  InvoiceLineItem, 
  AppliedDiscount,
  AssignedMemberAttribution,
  addInvoice, 
  updateInvoice, 
  generateInvoiceNumber, 
  getInvoices 
} from "@/features/invoice/services/invoiceService"
import { UserService } from "@/services/apiServices"
import { QuotationService, EstimateService } from "@/services/salesService"
import { numberToIndianWords } from "@/features/invoice/components/OfficialInvoiceDocument"
import { lookupPincode } from "@/lib/pincodeService"
import { addSubscription, saveInstallmentRecord } from "@/features/subscriptions/services/subscriptionService"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { executeWithFeedback } from "@/store/useActionFeedbackStore"
import { DigitalMarketingPackageBuilder } from "@/components/documents/DigitalMarketingPackageBuilder"
import { DigitalMarketingPackage, createDefaultMarketingPackage } from "@/types/digitalMarketing"
import { DocumentStudioModalSection1 } from "@/components/documents/components/documentstudiomodal-sections/DocumentStudioModalSection1"
import { DocumentStudioModalSection2 } from "@/components/documents/components/documentstudiomodal-sections/DocumentStudioModalSection2"
import { type DocumentStudioModalProps, SERVICE_PRESETS } from "@/components/documents/components/documentstudiomodal-sections/DocumentStudioModalHelpers"
import { createDocumentStudioModalAction20 } from "@/components/documents/hooks/documentstudiomodal-hooks/createDocumentStudioModalAction20.hooks"

export function createDocumentStudioModalFn52(getCtrl: () => any) {
  return (...__args: any[]) => {
    const {  } = getCtrl();
    const __fn: any = (baseDateStr: string, cycle: string, count: number): string => {
    const d = baseDateStr ? new Date(baseDateStr) : new Date()
    const valid = isNaN(d.getTime()) ? new Date() : new Date(d.getTime())
    const cyclesToAdd = count > 0 ? count : 1
    if (cycle === "Weekly") {
      valid.setDate(valid.getDate() + 7 * cyclesToAdd)
    } else if (cycle === "Quarterly") {
      const curDay = valid.getDate()
      valid.setDate(1)
      valid.setMonth(valid.getMonth() + 3 * cyclesToAdd)
      const maxDays = new Date(valid.getFullYear(), valid.getMonth() + 1, 0).getDate()
      valid.setDate(Math.min(curDay, maxDays))
    } else if (cycle === "Yearly") {
      const curDay = valid.getDate()
      const curMonth = valid.getMonth()
      valid.setFullYear(valid.getFullYear() + cyclesToAdd)
      const maxDays = new Date(valid.getFullYear(), curMonth + 1, 0).getDate()
      valid.setDate(Math.min(curDay, maxDays))
    } else {
      // Monthly default
      const curDay = valid.getDate()
      valid.setDate(1)
      valid.setMonth(valid.getMonth() + cyclesToAdd)
      const maxDays = new Date(valid.getFullYear(), valid.getMonth() + 1, 0).getDate()
      valid.setDate(Math.min(curDay, maxDays))
    }
    const y = valid.getFullYear()
    const m = String(valid.getMonth() + 1).padStart(2, "0")
    const dt = String(valid.getDate()).padStart(2, "0")
    return `${y}-${m}-${dt}`
  };
    return __fn(...__args);
  };
}
