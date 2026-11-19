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

export function createQuotationsHandler1(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { form, branches, formBranchId, user, editingItem, selectedClientId, subtotal, tax, grandTotal, items, activeCompanyId, activeCompany, setQuotations, setIsModalOpen } = getCtrl();
    const __fn: any = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.customer.trim()) return

    const assignedBranch = branches.find(b => b.id === formBranchId)

    const isTeamMember = user && String(user.role || "").toLowerCase().trim().includes("team")
    const approvalStatus: "pending" | "approved" | "rejected" = (editingItem as any)?.approvalStatus || (isTeamMember ? "pending" : "approved")
    const quoteStatus = (isTeamMember && approvalStatus === "pending") 
      ? "Pending Approval" 
      : (form.customerEmail ? "Pending Client Approval" : form.status)

    const effClientId = selectedClientId || (editingItem as any)?.clientId || (editingItem as any)?.customerId || undefined

    const payload: QuotationData = {
      id: editingItem ? editingItem.id : `qt_${Date.now()}`,
      ...form,
      clientId: effClientId,
      customerId: effClientId,
      client_id: effClientId,
      clientName: form.customer,
      clientEmail: form.customerEmail,
      status: quoteStatus,
      approvalStatus,
      subtotal,
      tax,
      total: grandTotal,
      items,
      companyId: activeCompanyId || "tech",
      companyName: activeCompany?.brand_name || activeCompany?.name,
      branchId: formBranchId || undefined,
      branchName: assignedBranch?.name || undefined,
      preparedBy: user?.name || "Sales Manager"
    }

    // Auto-send Quotation Email to Client upon creation
    if (!editingItem && payload.customerEmail) {
      sendQuotationDetailsEmailNotification(payload).catch(err => {
        console.warn("Auto-dispatch quotation email notice:", err)
      })
    }

    if (isTeamMember && approvalStatus === "pending" && !editingItem) {
      try {
        const { submitForApproval } = await import("@/services/approvalService")
        submitForApproval({
          type: "quotation",
          title: `Quotation #${payload.number} for ${payload.customer}`,
          documentNumber: payload.number,
          documentId: payload.id,
          clientName: payload.customer,
          clientEmail: payload.customerEmail,
          amount: grandTotal,
          submittedBy: {
            id: String(user.id || ""),
            name: user.name || "Team Member",
            email: user.email || "",
            role: user.role || "Teams",
          },
          companyId: activeCompanyId || "tech",
          branchId: formBranchId || undefined,
          branchName: assignedBranch?.name,
          dataSnapshot: payload,
        }).catch(() => {})
      } catch {}
    }

    await executeWithFeedback(async () => {
      if (editingItem) {
        await QuotationService.update(editingItem.id, payload).catch(() => {})
        setQuotations(prev => prev.map(q => q.id === editingItem.id ? payload : q))
      } else {
        await QuotationService.create(payload).catch(() => {})
        setQuotations(prev => [payload, ...prev.filter(q => q.id !== payload.id)])
      }
      setIsModalOpen(false)
    }, {
      actionType: editingItem ? "update" : "create",
      loadingTitle: editingItem ? "Updating Quotation..." : "Generating Quotation...",
      loadingMsg: `Saving commercial tender ${payload.number}...`,
      successTitle: editingItem ? "Quotation Updated" : (isTeamMember ? "Submitted for Admin Approval" : "Quotation Generated!"),
      successMsg: isTeamMember 
        ? `Quotation ${payload.number} has been submitted for Admin approval.` 
        : `Quotation ${payload.number} is ready.`,
    })
  };
    return __fn(...__args);
  };
}
