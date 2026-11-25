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

export function runDocumentStudioModalEffect51(getCtrl: () => any) {
  const { isOpen, fetchCompanies, fetchBranches, fetchSubBranches, setAvailableTeamMembers, setAvailableReferers, setAllClients, initialData, setSelectedClient, setClientMode, setClientName, setClientDesignation, setContactPersonName, setClientEmail, setClientPhone, setClientAddress, setClientCity, setClientState, setClientGst, prefilledClient, handleSelectClient, setDocScheme, setCompanyId, activeCompanyId, setBranchId, setSubBranchId, setDocNumber, setIssueDate, setDueDate, setPaymentPlan, setSelectedTargetModule, setIsSplitPayment, setSplitPayments, setEmiCustomSchedule, setClientDob, setClientPoliceStation, setReferByCategory, setReferredByName, setProjectTitle, setProjectOverview, setProjectTimeline, setTurnaroundTime, setDeliverables, setScopeInclusions, setScopeExclusions, setPaymentMilestones, setItems, setDiscountValue, setSetupCharge, setNotes, setTerms, setMarketingPackage, setAssignedMembers, activeBranchId, generateDocNumber, docScheme, mode } = getCtrl();
  const __fn: any = () => {
    if (!isOpen) return

    fetchCompanies?.()
    fetchBranches?.()
    fetchSubBranches?.()

    import("@/features/users/services/userService").then(({ getStoredUserAccountsAsync }) =>
      getStoredUserAccountsAsync().then((allU: any[]) => {
        const list = Array.isArray(allU) ? allU : [];
        const nonClientsAll = list.filter((u: any) => !String(u.role || u.role_name || "").toLowerCase().includes("client"));
        setAvailableReferers?.(nonClientsAll.map((u: any) => ({
          ...u,
          name: u.name || u.full_name || u.fullName || u.username || u.email || "User",
          role: u.role || u.role_name || u.roleName || "User",
          referByCategory: u.referByCategory || u.refer_by_category || ""
        })));
      })
    ).catch(() => {});

    UserService.getTeamMembers().then(users => {
      if (Array.isArray(users)) {
        const nonClients = users.filter((u: any) => !((u.role || u.role_name || "").toLowerCase().includes("client")))
        setAvailableTeamMembers(nonClients.map((u: any) => ({
          ...u,
          name: u.name || u.full_name || u.fullName || u.username || u.email || "Team Member",
          role: u.role || u.role_name || u.roleName || "Team Member"
        })))
      }
    }).catch(() => {})

    getClients("all").then(cl => {
      setAllClients(cl)

      if (initialData) {
      if (initialData.paymentPlan) setPaymentPlan?.(initialData.paymentPlan)
      setSelectedTargetModule?.(initialData.targetModule || (initialData.primaryCategory === "Digital Marketing" ? "digital_marketing" : "project"))
      const initSplits = Array.isArray(initialData.splitPayments) ? initialData.splitPayments : []
      setIsSplitPayment?.(initSplits.length > 0)
      setSplitPayments?.(initSplits.length > 0 ? initSplits : [{ id: "sp-1", method: "UPI / Net Banking", amount: "", reference: "" }])
      setEmiCustomSchedule?.(Array.isArray(initialData.emiCustomSchedule) ? initialData.emiCustomSchedule : [])
      setClientDob?.(initialData.clientDob || "")
      setClientPoliceStation?.(initialData.clientPoliceStation || "")
      setReferByCategory?.(initialData.referByCategory || "")
      setReferredByName?.(initialData.referredByName || "")
        const initClient = String(initialData.client || initialData.customer || initialData.clientName || "").trim()
        const initEmail = initialData.clientEmail || initialData.customerEmail || ""
        const initPhone = initialData.clientPhone || initialData.customerPhone || ""
        const initAddress = initialData.clientAddress || initialData.customerAddress || ""
        const initCity = initialData.clientCity || ""
        const initState = initialData.clientState || ""
        const initGst = initialData.clientGstin || initialData.clientGst || ""

        const match = initClient 
          ? cl.find(c => String(c.name || "").toLowerCase().trim() === initClient.toLowerCase().trim())
          : null

        if (match) {
          setSelectedClient(match)
          setClientMode("select")
          setClientName(match.name)
          setClientDesignation(initialData.clientDesignation || (match as any).designation || "Proprietor")
          setContactPersonName(initialData.contactPersonName || initialData.primaryContact || initialData.clientContactPerson || match.primaryContact || "")
          setClientEmail(initEmail || match.email || "")
          setClientPhone(initPhone || match.phone || "")
          setClientAddress(initAddress || match.address || "")
          setClientCity(initCity || match.city || "")
          setClientState(initState || match.state || "")
          setClientGst(initGst || match.gstNumber || match.vatNumber || "")
        } else if (initClient) {
          setSelectedClient(null)
          setClientMode("custom")
          setClientName(initClient)
          setClientDesignation(initialData.clientDesignation || "Proprietor")
          setContactPersonName(initialData.contactPersonName || initialData.primaryContact || initialData.clientContactPerson || "")
          setClientEmail(initEmail)
          setClientPhone(initPhone)
          setClientAddress(initAddress)
          setClientCity(initCity)
          setClientState(initState)
          setClientGst(initGst)
        } else {
          setSelectedClient(null)
          setClientMode("select")
          setClientName("")
          setContactPersonName("")
          setClientEmail("")
          setClientPhone("")
          setClientAddress("")
          setClientCity("")
          setClientState("")
          setClientGst("")
        }
      } else if (prefilledClient) {
        handleSelectClient(prefilledClient)
      } else {
        // Clean blank state for new document creation - never auto-select cl[0]
        setSelectedClient(null)
        setClientMode("select")
        setClientName("")
        setClientEmail("")
        setClientPhone("")
        setClientAddress("")
        setClientCity("")
        setClientState("")
        setClientGst("")
      }
    }).catch(() => {})

    if (initialData) {
      const isNonGst = initialData.taxType === "nongst" || initialData.isNonGst || String(initialData.id || "").toUpperCase().startsWith("NGINV") || (initialData.gstRate === 0 && (!initialData.items || initialData.items.every((it: any) => !it.gstRate || it.gstRate === 0)))
      const resolvedScheme = isNonGst ? "nongst" : "gst"
      setDocScheme(resolvedScheme)
      setCompanyId(initialData.companyId || activeCompanyId || "tech")
      setBranchId(initialData.branchId || (initialData as any).branch_id || "")
      setSubBranchId(initialData.subBranchId || (initialData as any).sub_branch_id || "")
      setDocNumber(initialData.id || initialData.invoiceNumber || initialData.number || "")

      if (initialData.invoiceDate || initialData.billDate || initialData.date) {
        const raw = String(initialData.invoiceDate || initialData.billDate || initialData.date).trim()
        if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
          setIssueDate(raw.slice(0, 10))
        } else {
          const dmy = raw.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/)
          if (dmy) setIssueDate(`${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`)
        }
      }

      if (initialData.dueDate || initialData.validTill) {
        const raw = String(initialData.dueDate || initialData.validTill).trim()
        if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
          setDueDate(raw.slice(0, 10))
        } else {
          const dmy = raw.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/)
          if (dmy) setDueDate(`${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`)
        }
      }

      setProjectTitle(initialData.project || initialData.projectTitle || "")
      if (initialData.overview) setProjectOverview(initialData.overview)
      if (initialData.timeline) setProjectTimeline(initialData.timeline)
      if (initialData.turnaroundTime) setTurnaroundTime(initialData.turnaroundTime)
      if (initialData.deliverables && Array.isArray(initialData.deliverables)) setDeliverables(initialData.deliverables)
      if (initialData.scopeInclusions) setScopeInclusions(initialData.scopeInclusions)
      if (initialData.scopeExclusions) setScopeExclusions(initialData.scopeExclusions)
      if (initialData.paymentMilestones && Array.isArray(initialData.paymentMilestones)) setPaymentMilestones(initialData.paymentMilestones)

      if (initialData.items && Array.isArray(initialData.items) && initialData.items.length > 0) {
        setItems(initialData.items.map((it: any) => ({
          id: it.id || `item_${Date.now()}_${Math.random()}`,
          serviceName: it.serviceName || it.name || it.description || "Service",
          description: it.description || "",
          deliverableTime: it.deliverableTime || it.duration || it.timeline || "1-2 Weeks",
          sacCode: it.sacCode || it.sac || (resolvedScheme === "gst" ? "998313" : ""),
          qty: it.qty || it.quantity || 1,
          unit: it.unit || "Project",
          rate: it.rate !== undefined ? it.rate : (it.unitPrice !== undefined ? it.unitPrice : 0),
          gstRate: resolvedScheme === "gst" ? (it.gstRate !== undefined ? it.gstRate : 18) : 0,
          gstAmount: it.gstAmount || 0,
          charges: it.charges || [],
          totalAmount: it.totalAmount || it.total || (it.rate * (it.qty || 1)),
        })))
      } else {
        const baseNum = initialData.baseAmount || initialData.subtotal || 0
        setItems([{
          id: `item_${Date.now()}`,
          serviceName: initialData.project || "Custom Service",
          sacCode: resolvedScheme === "gst" ? "998313" : "",
          qty: 1,
          unit: "Project",
          rate: baseNum,
          gstRate: resolvedScheme === "gst" ? 18 : 0,
          gstAmount: 0,
          charges: [],
          totalAmount: baseNum,
        }])
      }

      setDiscountValue(initialData.discount !== undefined ? initialData.discount : "")
      setSetupCharge(initialData.setupCharge !== undefined ? initialData.setupCharge : "")
      if (initialData.notes) setNotes(initialData.notes)
      if (initialData.terms) setTerms(initialData.terms)

      if (initialData?.marketingPackage) {
        setMarketingPackage(initialData.marketingPackage)
      } else {
        setMarketingPackage(createDefaultMarketingPackage("Grow - 2"))
      }

      if (initialData.assignedMembers && Array.isArray(initialData.assignedMembers) && initialData.assignedMembers.length > 0) {
        setAssignedMembers(initialData.assignedMembers)
      } else if (initialData.assignedMemberId) {
        setAssignedMembers([{
          memberId: initialData.assignedMemberId,
          memberName: initialData.assignedMemberName || "Team Member",
          memberRole: initialData.assignedMemberRole || "Team Member",
          memberAvatar: initialData.assignedMemberAvatar,
          payoutType: initialData.memberPayoutType || "percentage",
          payoutValue: initialData.memberPayoutValue !== undefined ? initialData.memberPayoutValue : (initialData.memberSharePct !== undefined ? initialData.memberSharePct : 50),
        }])
      } else {
        setAssignedMembers([])
      }
    } else {
      setCompanyId(activeCompanyId || "tech")
      setBranchId(activeBranchId || "")
      setSubBranchId("")
      generateDocNumber(docScheme)
      setProjectTitle("")
      setProjectOverview("")
      setProjectTimeline("")
      setTurnaroundTime("")
      setDeliverables([])
      setScopeInclusions("")
      setScopeExclusions("")
      setPaymentMilestones([])
      setItems([
        {
          id: `item_${Date.now()}`,
          serviceName: "",
          sacCode: "",
          qty: 1,
          unit: "Project",
          rate: "" as any,
          gstRate: mode === "invoice" && docScheme === "gst" ? 18 : 0,
          gstAmount: 0,
          charges: [],
          totalAmount: 0
        }
      ])
      setDiscountValue("")
      setSetupCharge("")
      setAssignedMembers([])
      setSelectedTargetModule?.("project")
    }
  };
  return __fn();
}
