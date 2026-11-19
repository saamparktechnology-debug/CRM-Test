"use client"

import * as React from "react"
import { 
  X, Briefcase, FileText, CheckCircle2, Clock, Calendar, AlertCircle, 
  Eye, FolderPlus, Building2, Mail, Phone, MapPin, CreditCard, ShoppingBag,
  User, Receipt, Shield, Tag, DollarSign, Trash2
} from "lucide-react"
import { ClientItem } from "@/features/clients/types"
import { formatDisplayEmail } from "@/features/clients/services/clientService"
import { getProjects, deleteProject } from "@/features/projects/services/projectService"
import { Project } from "@/features/projects/types"
import { getInvoices, deleteInvoice, InvoiceItem } from "@/features/invoice/services/invoiceService"
import { getPayments, deletePayment, PaymentItem } from "@/features/payments/services/paymentService"
import { fetchModuleDataFromDB, saveModuleDataToDB, markGlobalItemDeleted, filterGlobalDeletedItems } from "@/lib/storageSync"
import { useAuthStore } from "@/store/useAuthStore"
import { usePermissionStore } from "@/store/usePermissionStore"
import { confirmTwoStepDelete } from "@/lib/confirmDialog"

export interface ClientHistoryModalProps {
  isOpen: boolean
  client: ClientItem | null
  onClose: () => void
  onSelectInvoice?: (invoice: InvoiceItem) => void
  onAddProjectForClient?: (client: ClientItem) => void
}
