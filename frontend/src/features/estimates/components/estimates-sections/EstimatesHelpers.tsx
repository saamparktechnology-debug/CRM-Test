"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  FileText, Plus, Search, Edit, Trash2, X, Send, 
  Printer, UserCheck, Mail, Building2, Phone, Sparkles, ArrowRight,
  Calculator, Clock, CheckCircle2
} from "lucide-react"
import { useAuthStore, getCompanyFullName, getCompanyLogoUrl } from "@/store/useAuthStore"
import { usePermissionStore } from "@/store/usePermissionStore"
import { EstimateService } from "@/services/salesService"
import { getClients } from "@/features/clients/services/clientService"
import { createNotification } from "@/services/notificationService"
import { executeWithFeedback } from "@/store/useActionFeedbackStore"
import { DocumentStudioModal } from "@/components/documents/DocumentStudioModal"
import { addInvoice } from "@/features/invoice/services/invoiceService"
import { sendEstimateDetailsEmailNotification } from "@/services/emailNotificationService"
import { formatDisplayDate } from "@/lib/utils"

export interface LineItem { 
  id: string
  name: string
  quantity: number
  unitPrice: number
  total: number 
}

export interface Estimate { 
  id: string
  number: string
  customer: string
  customerEmail?: string
  customerPhone?: string
  customerAddress?: string
  date: string
  validTill?: string
  notes?: string
  terms?: string
  total: number
  subtotal?: number
  tax?: number
  status: string
  items?: LineItem[]
  companyId?: string
}
