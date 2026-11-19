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

export function createQuotationsHandler2(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { activeCompanyId, user, setViewingItem } = getCtrl();
    const __fn: any = async (quotation: QuotationData) => {
    const invId = `INV-${Math.floor(100 + Math.random() * 900)}`
    await executeWithFeedback(async () => {
      const qAny = quotation as any
      const isDigitalMarketing = (qAny.category && qAny.category.toLowerCase().includes("marketing")) || Boolean(qAny.marketingPackage?.enabled)
      const targetCompanyId = quotation.companyId || activeCompanyId || "tech"
      const resolvedProjectName = quotation.project || qAny.projectName || `Project from ${quotation.number}`
      const mappedItems = quotation.items ? quotation.items.map((it, idx) => ({
        id: it.id || `item_${idx + 1}`,
        serviceName: it.name || (it as any).serviceName || "Service",
        sacCode: it.sac || "998311",
        qty: it.quantity || 1,
        unit: "Nos",
        rate: it.unitPrice || 0,
        gstRate: 18,
        gstAmount: Math.round(((it.total || 0) * 18) / 100),
        charges: [],
        totalAmount: it.total || 0,
      })) : undefined

      await addInvoice({
        id: invId,
        client: quotation.customer,
        clientEmail: quotation.customerEmail,
        project: resolvedProjectName,
        billDate: new Date().toLocaleDateString("en-GB"),
        dueDate: quotation.validTill || new Date(Date.now() + 15 * 86400000).toLocaleDateString("en-GB"),
        baseAmount: quotation.subtotal || Math.round(quotation.total / 1.18),
        gstRate: 18,
        gstAmount: quotation.tax || (quotation.total - (quotation.subtotal || 0)),
        totalInvoiced: `₹${quotation.total.toLocaleString("en-IN")}`,
        paymentReceived: "₹0",
        due: `₹${quotation.total.toLocaleString("en-IN")}`,
        status: "Not paid",
        billedBy: user?.name || "Admin",
        companyId: targetCompanyId,
        branchId: quotation.branchId,
        branchName: quotation.branchName,
        category: isDigitalMarketing ? "Digital Marketing" : qAny.category,
        marketingPackage: qAny.marketingPackage,
        items: mappedItems,
        notes: quotation.notes,
        terms: quotation.terms,
      }, targetCompanyId)

      // Auto-create/sync Project in Projects module
      try {
        const { getProjects, addProject } = await import("@/features/projects/services/projectService")
        const existingProjects = await getProjects(targetCompanyId)
        const projTitle = (resolvedProjectName || `${quotation.customer} - ${isDigitalMarketing ? "Digital Marketing Campaign" : "Project"}`).trim()
        const found = existingProjects.find(p => p.title.toLowerCase().trim() === projTitle.toLowerCase())
        if (!found) {
          await addProject({
            title: projTitle,
            client: quotation.customer,
            clientId: qAny.clientId || qAny.customerId,
            projectType: isDigitalMarketing ? "Digital Marketing Campaign" : "Client Project",
            price: `₹${quotation.total.toLocaleString("en-IN")}`,
            startDate: new Date().toISOString().split("T")[0],
            deadline: quotation.validTill || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
            progress: 10,
            status: "In Progress",
            paymentStatus: "Payment Pending",
            baseAmount: quotation.subtotal || Math.round(quotation.total / 1.18),
            totalAmount: quotation.total,
            labels: [],
            companyId: targetCompanyId,
            branchId: quotation.branchId,
            branchName: quotation.branchName,
            marketingPackage: isDigitalMarketing ? qAny.marketingPackage : undefined,
            members: qAny.assignedMembers ? qAny.assignedMembers.map((m: any) => ({
              id: m.memberId || m.id,
              name: m.memberName || m.name,
              role: m.memberRole || m.role || "Marketing Specialist",
              avatar: m.memberAvatar || m.avatar,
              avatarUrl: m.memberAvatar || m.avatarUrl,
            })) : undefined,
          }, targetCompanyId)
        }
      } catch (err) {
        console.warn("Auto project creation notice:", err)
      }

      setViewingItem(null)
    }, {
      actionType: "process",
      loadingTitle: "Converting to Tax Invoice...",
      loadingMsg: `Generating formal Invoice ${invId} from ${quotation.number}...`,
      successTitle: "Converted Successfully!",
      successMsg: `Invoice ${invId} created. You can view it under Invoices.`,
    })
  };
    return __fn(...__args);
  };
}
