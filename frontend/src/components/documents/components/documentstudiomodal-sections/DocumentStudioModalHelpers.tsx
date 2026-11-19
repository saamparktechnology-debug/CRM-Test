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

export interface DocumentStudioModalProps {
  isOpen: boolean
  mode?: "invoice" | "quotation" | "estimate"
  initialData?: any
  prefilledClient?: ClientItem | null
  isMarketingMode?: boolean
  onClose: () => void
  onSaveSuccess?: (savedData: any) => void
}

export const SERVICE_PRESETS = [
  { name: "Website Development", sac: "998313", gst: 18, unit: "Project", rate: 25000 },
  { name: "Custom Software Application", sac: "998314", gst: 18, unit: "Project", rate: 45000 },
  { name: "Android / iOS Mobile App", sac: "998314", gst: 18, unit: "Project", rate: 55000 },
  { name: "Cloud Infrastructure & Hosting", sac: "998315", gst: 18, unit: "Month", rate: 3500 },
  { name: "UI/UX & Brand Identity", sac: "998312", gst: 18, unit: "Design", rate: 15000 },
  { name: "Database & Backend API", sac: "998314", gst: 18, unit: "Project", rate: 20000 },
  { name: "Printing & Media Collateral", sac: "998912", gst: 12, unit: "Job", rate: 8000 },
  { name: "Enterprise Consultation", sac: "998319", gst: 18, unit: "Nos", rate: 10000 },
]
