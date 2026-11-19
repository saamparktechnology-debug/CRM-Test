"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  FileText, Plus, Search, Edit, Trash2, X, ArrowRight, Send, 
  Printer, UserCheck, Mail, Building2, Phone, Sparkles, CheckCircle2,
  Download, Calculator, Clock, Check, AlertCircle, Eye, RefreshCw
} from "lucide-react"
import { useAuthStore, getCompanyFullName, getCompanyLogoUrl } from "@/store/useAuthStore"
import { usePermissionStore } from "@/store/usePermissionStore"
import { QuotationService } from "@/services/salesService"
import { getClients, saveStoredClient } from "@/features/clients/services/clientService"
import { addInvoice } from "@/features/invoice/services/invoiceService"
import { createNotification } from "@/services/notificationService"
import { executeWithFeedback } from "@/store/useActionFeedbackStore"
import { exportToExcel, printPDFReport } from "@/lib/exportUtils"
import { OfficialQuotationDocument, QuotationData, QuotationLineItem } from "@/features/quotations/components/OfficialQuotationDocument"
import { sendQuotationDetailsEmailNotification } from "@/services/emailNotificationService"
import { DocumentStudioModal } from "@/components/documents/DocumentStudioModal"
import { isRecordAssignedToClient, isRecordAssignedToTeamMember } from "@/lib/clientScopeUtils"
import { formatDisplayDate } from "@/lib/utils"

export function createQuotationsHandler3(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { user, activeCompanyId, activeCompany, setQuotations, loadData } = getCtrl();
    const __fn: any = async (quotation: QuotationData) => {
    await executeWithFeedback(async () => {
      const existingClients = await getClients("all").catch(() => [])
      const custEmailNorm = (quotation.customerEmail || "").toLowerCase().trim()
      const custNameNorm = (quotation.customer || "").toLowerCase().trim()
      
      let matchedClient = existingClients.find(c => 
        (custEmailNorm && (c.email || "").toLowerCase().trim() === custEmailNorm) ||
        (custNameNorm && (c.name || "").toLowerCase().trim() === custNameNorm)
      )

      if (!matchedClient) {
        await saveStoredClient({
          id: `cli_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: quotation.customer,
          email: quotation.customerEmail || "",
          phone: quotation.customerPhone || "",
          address: quotation.customerAddress || "",
          city: "",
          state: "",
          gstNumber: quotation.clientGstin || "",
          primaryContact: quotation.customer,
          group: "VIP",
          label: "Quotation Convert",
          labelColor: "#10b981",
          projectsCount: 0,
          totalInvoiced: "₹0",
          paymentReceived: "₹0",
          due: "₹0",
          type: "Organization",
          owner: user?.name || "Admin",
          createdAt: Date.now(),
          companyId: quotation.companyId || activeCompanyId || "tech",
          companyName: activeCompany?.brand_name || activeCompany?.name || "SAAMPARK",
          branchId: quotation.branchId,
          branchName: quotation.branchName,
        }, quotation.companyId || activeCompanyId || "tech")
      }

      // Update quotation status to "Accepted"
      const updated = { ...quotation, status: "Accepted" }
      await QuotationService.update(quotation.id, updated).catch(() => {})
      setQuotations(prev => prev.map(q => q.id === quotation.id ? updated : q))

      // Check if quotation includes digital marketing package -> Auto-provision Marketing Campaign
      const hasMarketing = (quotation.items || []).some((it: any) => 
        (it.name || '').toLowerCase().includes("marketing") || 
        (it.name || '').toLowerCase().includes("social media") || 
        (it.name || '').toLowerCase().includes("poster") || 
        (it.name || '').toLowerCase().includes("video") ||
        (it.name || '').toLowerCase().includes("package")
      ) || quotation.companyId === "consultancy"

      if (hasMarketing) {
        import("@/features/marketing/services/marketingService").then(({ MarketingService }) => {
          MarketingService.autoProvisionFromQuotation(
            {
              id: matchedClient?.id || quotation.clientId || `CLT-${Date.now().toString().slice(-4)}`,
              name: quotation.customer,
              email: quotation.customerEmail,
              branchName: quotation.branchName
            },
            quotation.items?.[0]?.name || "Digital Marketing Growth Retainer",
            { poster: 20, video: 15, real_model: 10, customName: "Tutor Service", custom: 15 },
            quotation.companyId || "consultancy"
          ).catch(() => {})
        })
      }
      
      // Dispatch sync events
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("saampark_clients_updated"))
        window.dispatchEvent(new CustomEvent("saampark_data_synced"))
      }
      loadData()
    }, {
      actionType: "process",
      loadingTitle: "Converting to Client...",
      loadingMsg: `Adding ${quotation.customer} to official CRM Clients database...`,
      successTitle: "Client Registered Successfully!",
      successMsg: `${quotation.customer} is now a registered CRM client. You can now send Estimates, Invoices, and Projects to them.`,
    })
  };
    return __fn(...__args);
  };
}
