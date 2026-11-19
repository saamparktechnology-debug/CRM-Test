"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { 
  BarChart3, Download, Calendar, Filter, TrendingUp, Users, 
  DollarSign, CheckSquare, Target, PieChart, ArrowUpRight, ArrowDownRight, FileText,
  Receipt, ShieldCheck, AlertCircle, Building2, MapPin, Search, CheckCircle2, Clock, Landmark, Percent, Layers,
  Megaphone, Video, Image as ImageIcon, Sparkles, Printer
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useAuthStore, SubBranch, isMatchingCompany, getCanonicalCompanyId } from "@/store/useAuthStore"
import { getUsers, getUserAvatar } from "@/features/users/services/userService"
import { getInvoices, InvoiceItem, parseCurrencyNumber } from "@/features/invoice/services/invoiceService"
import { getPayments, PaymentItem } from "@/features/payments/services/paymentService"
import { fetchModuleDataFromDB, filterGlobalDeletedItems, isGlobalItemDeleted } from "@/lib/storageSync"
import { getClients } from "@/features/clients/services/clientService"
import { ClientItem } from "@/features/clients/types"
import { taskService } from "@/features/tasks/services/taskService"
import { Task } from "@/features/tasks/types"
import { getLeads } from "@/features/leads/services/leadService"
import { Lead } from "@/features/leads/types"
import { getSubscriptions } from "@/features/subscriptions/services/subscriptionService"
import { Subscription, BillingCycle } from "@/features/subscriptions/types"
import { getProjects } from "@/features/projects/services/projectService"
import { OfficialFormNo9Document } from "@/components/documents/OfficialFormNo9Document"
import { Repeat, Package, Zap, CalendarDays, RefreshCw } from "lucide-react"
import { resolveExportScope, exportToExcel, printPDFReport } from "@/lib/exportUtils"
import { ReportsSection1 } from "@/features/reports/components/reports-sections/ReportsSection1"
import { ReportsSection2 } from "@/features/reports/components/reports-sections/ReportsSection2"
import { ReportsSection3 } from "@/features/reports/components/reports-sections/ReportsSection3"
import { ReportsSection4 } from "@/features/reports/components/reports-sections/ReportsSection4"
import { ReportsSection5 } from "@/features/reports/components/reports-sections/ReportsSection5"
import { ReportsSection6 } from "@/features/reports/components/reports-sections/ReportsSection6"
import { createReportsHandler1 } from "@/features/reports/hooks/reports-hooks/createReportsHandler1.hooks"
import { type ReportTab, type InvoiceFilterType, type SubscriptionFilterType } from "@/features/reports/components/reports-sections/ReportsHelpers"

export function createReportsAction20(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { targetComp, setUsers, setInvoices, setPayments, setClients, setExpenses, setTasks, setLeads, setSubscriptions, setProjects } = getCtrl();
    const __fn: any = async () => {
    try {
      const [uList, invList, payList, cliList, expList, tList, lList, subList, projList] = await Promise.all([
        getUsers("all").catch(() => []),
        getInvoices(targetComp).catch(() => []),
        getPayments(targetComp).catch(() => []),
        getClients(targetComp).catch(() => []),
        fetchModuleDataFromDB<any[]>("expenses", [], targetComp).catch(() => []),
        taskService.getTasks(targetComp).catch(() => []),
        getLeads(targetComp).catch(() => []),
        getSubscriptions(targetComp).catch(() => []),
        getProjects(targetComp).catch(() => fetchModuleDataFromDB<any[]>("projects", [], targetComp).catch(() => [])),
      ])

      const cleanClients = filterGlobalDeletedItems(cliList || [], undefined, "clients")
      const clientNameSet = new Set(cleanClients.map(c => (c.name || "").toLowerCase().trim()).filter(Boolean))
      const clientIdSet = new Set(cleanClients.map(c => String(c.id || "").toLowerCase().trim()).filter(Boolean))
      const clientEmailSet = new Set(cleanClients.map(c => (c.email || "").toLowerCase().trim()).filter(Boolean))

      // Filter invoices: exclude deleted invoices, exclude invoices belonging to deleted clients or deleted projects
      const baseInvoices = filterGlobalDeletedItems(invList || [], undefined, "invoices")
      const validInvoices = baseInvoices.filter(inv => {
        if (!inv || !inv.id) return false
        if (isGlobalItemDeleted(inv.id, undefined, "invoices")) return false

        const cName = (inv.client || "").toLowerCase().trim()
        const cId = (inv.clientId || "").toLowerCase().trim()
        const cEmail = (inv.clientEmail || "").toLowerCase().trim()

        // If client details are provided, ensure client is not deleted
        if (cName && isGlobalItemDeleted(cName, undefined, "clients")) return false
        if (cId && isGlobalItemDeleted(cId, undefined, "clients")) return false
        if (cEmail && isGlobalItemDeleted(cEmail, undefined, "clients")) return false

        // If client exists in record, verify client is still active in cleanClients list
        if (cleanClients.length > 0 && (cName || cId || cEmail)) {
          const clientMatches = (cName && clientNameSet.has(cName)) || (cId && clientIdSet.has(cId)) || (cEmail && clientEmailSet.has(cEmail))
          if (!clientMatches) return false
        }

        // Check project link
        const pTitle = (inv.project || "").toLowerCase().trim()
        const pId = ((inv as any).projectId || "").toLowerCase().trim()
        if (pTitle && isGlobalItemDeleted(pTitle, undefined, "projects")) return false
        if (pId && isGlobalItemDeleted(pId, undefined, "projects")) return false

        return true
      })

      const validInvoiceIds = new Set(validInvoices.map(i => String(i.id).toUpperCase().trim()))

      // Filter payments: exclude deleted payments, payments for deleted invoices or deleted clients
      const basePayments = filterGlobalDeletedItems(payList || [], undefined, "payments")
      const validPayments = basePayments.filter(p => {
        if (!p || !p.id) return false
        if (isGlobalItemDeleted(p.id, undefined, "payments")) return false
        if (p.invoiceId) {
          const invIdNorm = String(p.invoiceId).toUpperCase().trim()
          if (isGlobalItemDeleted(invIdNorm, undefined, "invoices")) return false
          if (validInvoices.length > 0 && !validInvoiceIds.has(invIdNorm)) return false
        }
        const cName = (p.client || "").toLowerCase().trim()
        const cId = ((p as any).clientId || "").toLowerCase().trim()
        if (cName && isGlobalItemDeleted(cName, undefined, "clients")) return false
        if (cId && isGlobalItemDeleted(cId, undefined, "clients")) return false
        if (cleanClients.length > 0 && (cName || cId)) {
          const clientMatches = (cName && clientNameSet.has(cName)) || (cId && clientIdSet.has(cId))
          if (!clientMatches) return false
        }
        return true
      })

      // Filter subscriptions: exclude deleted subscriptions or subscriptions for deleted clients
      const baseSubs = filterGlobalDeletedItems(subList || [], undefined, "subscriptions")
      const validSubs = baseSubs.filter(s => {
        if (!s || !s.id) return false
        if (isGlobalItemDeleted(s.id, undefined, "subscriptions")) return false
        const cName = (s.clientName || "").toLowerCase().trim()
        const cId = ((s as any).clientId || "").toLowerCase().trim()
        const cEmail = ((s as any).clientEmail || "").toLowerCase().trim()
        if (cName && isGlobalItemDeleted(cName, undefined, "clients")) return false
        if (cId && isGlobalItemDeleted(cId, undefined, "clients")) return false
        if (cEmail && isGlobalItemDeleted(cEmail, undefined, "clients")) return false
        if (cleanClients.length > 0 && (cName || cId || cEmail)) {
          const clientMatches = (cName && clientNameSet.has(cName)) || (cId && clientIdSet.has(cId)) || (cEmail && clientEmailSet.has(cEmail))
          if (!clientMatches) return false
        }
        return true
      })

      // Filter expenses: exclude deleted expenses or expenses tied to deleted projects
      const baseExpenses = filterGlobalDeletedItems(expList || [], undefined, "expenses")
      const validExpenses = baseExpenses.filter(e => {
        if (!e || !e.id) return false
        if (isGlobalItemDeleted(e.id, undefined, "expenses")) return false
        const pTitle = ((e as any).project || (e as any).projectName || "").toLowerCase().trim()
        const pId = String((e as any).projectId || "").toLowerCase().trim()
        if (pTitle && isGlobalItemDeleted(pTitle, undefined, "projects")) return false
        if (pId && isGlobalItemDeleted(pId, undefined, "projects")) return false
        return true
      })

      // Filter tasks: exclude deleted tasks or tasks tied to deleted clients/projects
      const baseTasks = filterGlobalDeletedItems(tList || [], undefined, "tasks")
      const validTasks = baseTasks.filter(t => {
        if (!t || !t.id) return false
        if (isGlobalItemDeleted(t.id, undefined, "tasks")) return false
        const pTitle = ((t as any).project || (t as any).projectName || "").toLowerCase().trim()
        const pId = String((t as any).projectId || "").toLowerCase().trim()
        if (pTitle && isGlobalItemDeleted(pTitle, undefined, "projects")) return false
        if (pId && isGlobalItemDeleted(pId, undefined, "projects")) return false
        return true
      })

      // Filter leads: exclude deleted leads
      const validLeads = filterGlobalDeletedItems(lList || [], undefined, "leads")

      // Filter users: exclude deleted users
      const validUsers = filterGlobalDeletedItems(uList || [], undefined, "users")

      // Filter projects: exclude deleted projects
      const validProjects = filterGlobalDeletedItems(projList || [], undefined, "projects")

      setUsers(validUsers)
      setInvoices(validInvoices)
      setPayments(validPayments)
      setClients(cleanClients)
      setExpenses(validExpenses)
      setTasks(validTasks)
      setLeads(validLeads)
      setSubscriptions(validSubs)
      setProjects(validProjects)
    } catch (err) {
      console.error("Error loading reports data:", err)
    }
  };
    return __fn(...__args);
  };
}
