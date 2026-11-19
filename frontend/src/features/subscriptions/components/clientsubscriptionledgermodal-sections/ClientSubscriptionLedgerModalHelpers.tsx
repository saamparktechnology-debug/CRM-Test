"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { 
  X, 
  Mail, 
  Phone, 
  CheckCircle2, 
  Clock, 
  Receipt,
  Eye,
  Plus,
  RefreshCw,
  CreditCard,
  AlertTriangle
} from "lucide-react"
import { Subscription, InstallmentItem, SubscriptionStatus, calculateOverdueDetails } from "@/features/subscriptions/types"
import { getInvoices, InvoiceItem } from "@/features/invoice/services/invoiceService"
import { getInstallments } from "@/features/subscriptions/services/subscriptionService"
import { useAuthStore } from "@/store/useAuthStore"
import { formatDisplayDate } from "@/lib/utils"

export interface ClientSubscriptionLedgerModalProps {
  isOpen: boolean
  clientName: string | null
  clientEmail?: string
  subscriptions: Subscription[]
  onClose: () => void
  onGenerateInvoice: (sub: Subscription) => Promise<void>
  onRenewSubscription: (sub: Subscription) => void
  onViewInvoice?: (invoice: InvoiceItem) => void
  onOpenCreateSub?: (clientName: string) => void
}
