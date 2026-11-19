"use client"

import * as React from "react"
import { 
  X, Check, DollarSign, Calculator, UserCheck, Users, Calendar, Briefcase, FileText, 
  Coins, RefreshCw, Layers, CreditCard, Building2, Mail, Phone, MapPin, 
  Plus, Trash2, Tag, ChevronDown, ChevronUp, Sparkles, Search, Receipt
} from "lucide-react"
import { useRouter } from "next/navigation"
import { ClientItem } from "@/features/clients/types"
import { getUsers } from "@/features/users/services/userService"
import { addProject } from "@/features/projects/services/projectService"
import { addInvoice, getInvoices, generateInvoiceNumber, InvoiceLineItem, AppliedDiscount } from "@/features/invoice/services/invoiceService"
import { addOrder } from "@/features/orders/services/orderService"
import { addPayment } from "@/features/payments/services/paymentService"
import { addSubscription, saveInstallmentRecord } from "@/features/subscriptions/services/subscriptionService"
import { taskService } from "@/features/tasks/services/taskService"
import { saveStoredClient, getClients, formatDisplayEmail } from "@/features/clients/services/clientService"
import { useAuthStore, getSelectableCompanies } from "@/store/useAuthStore"
import { sendInvoiceDetailsEmailNotification, sendPaymentReceiptEmailNotification } from "@/services/emailNotificationService"
import { lookupPincode } from "@/lib/pincodeService"

export interface AddClientProjectModalProps {
  isOpen: boolean
  client: ClientItem | null
  initialMode?: "project_and_invoice" | "invoice_only"
  onClose: () => void
  onProjectCreated: () => void
  onInvoiceCreated?: (invoice: any) => void
}

export interface ServiceFormItem {
  id: string
  serviceName: string
  sacCode: string
  qty: number
  unit: string
  rate: number | ""
  charges: { id: string; name: string; amount: number | "" }[]
  gstRate: number
}

export interface FormDiscountItem {
  id: string
  name: string
  amount: number | ""
}

export interface AssignedMemberAllocation {
  id: string
  name: string
  email?: string
  role?: string
  avatar?: string
  payoutType: "percentage" | "fixed"
  payoutValue: number | ""
}

export const SERVICE_PRESETS = [
  { name: "Website Development", sac: "998313", gst: 18, unit: "Project" },
  { name: "Software Development", sac: "998314", gst: 18, unit: "Project" },
  { name: "Android / iOS App", sac: "998314", gst: 18, unit: "Project" },
  { name: "Cloud & Domain Hosting", sac: "998315", gst: 18, unit: "Month" },
  { name: "UI/UX & Graphics", sac: "998312", gst: 18, unit: "Design" },
  { name: "Digital Marketing & SEO", sac: "998311", gst: 18, unit: "Month" },
  { name: "Print & Media Works", sac: "998912", gst: 12, unit: "Job" },
  { name: "General Consulting (Non-GST)", sac: "998319", gst: 0, unit: "Nos" },
]
