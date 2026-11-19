"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Calculator, Plus, Search, Download, Trash2, CheckCircle2, 
  Clock, XCircle, FileText, Printer, X, Check, DollarSign,
  Briefcase, Users, TrendingUp, Percent, ArrowUpRight, ArrowDownRight,
  Receipt, Building2, Tag, Layers, CreditCard, ShieldAlert, Sparkles, User
} from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"
import { usePermissionStore } from "@/store/usePermissionStore"
import { fetchModuleDataFromDB, saveModuleDataToDB, filterGlobalDeletedItems, markGlobalItemDeleted } from "@/lib/storageSync"
import { exportToExcel, printPDFReport } from "@/lib/exportUtils"
import { getProjects } from "@/features/projects/services/projectService"
import { Project, ProjectMember } from "@/features/projects/types"
import { getInvoices, InvoiceItem } from "@/features/invoice/services/invoiceService"
import { executeWithFeedback } from "@/store/useActionFeedbackStore"
import { formatDisplayDate } from "@/lib/utils"
import { ExpensesSection1 } from "@/features/expenses/components/expenses-sections/ExpensesSection1"
import { ExpensesSection2 } from "@/features/expenses/components/expenses-sections/ExpensesSection2"
import { ExpensesSection3 } from "@/features/expenses/components/expenses-sections/ExpensesSection3"
import { ExpensesSection4 } from "@/features/expenses/components/expenses-sections/ExpensesSection4"
import { ExpensesSection5 } from "@/features/expenses/components/expenses-sections/ExpensesSection5"


import { type ProjectExtraCharge, type ExpenseItem, type ExpenseTab } from "@/features/expenses/components/expenses-sections/ExpensesHelpers"
export * from "@/features/expenses/components/expenses-sections/ExpensesHelpers"

export default function ExpensesMain() {
  const __ctrlRef = React.useRef<any>({});
  let __ctrl: any = {};

  const { user, companies, activeCompanyId, activeBranchId, activeSubBranchId, branches, subBranches } = useAuthStore()
  const { canPerformAction } = usePermissionStore()
  
  const targetComp = activeCompanyId || user?.companyId || "tech"
  const isAdmin = user?.role === "Super Admin" || user?.role === "Admin"
  const canAddExpense = canPerformAction(user, "Expenses", "add")
  const canEditExpense = canPerformAction(user, "Expenses", "edit")
  const canDeleteExpense = canPerformAction(user, "Expenses", "delete")

  const [activeViewTab, setActiveViewTab] = React.useState<ExpenseTab>("all")
  const [expenses, setExpenses] = React.useState<ExpenseItem[]>([])
  const [projects, setProjects] = React.useState<Project[]>([])
  const [extraCharges, setExtraCharges] = React.useState<ProjectExtraCharge[]>([])
  const [invoices, setInvoices] = React.useState<InvoiceItem[]>([])
  
  // Selected Project for Project-Wise Ledger
  const [selectedProjectId, setSelectedProjectId] = React.useState<string>("")
  
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState("all")
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
  const [isAddExtraChargeModalOpen, setIsAddExtraChargeModalOpen] = React.useState(false)

  // Form State: Add Expense
  const [formCompanyId, setFormCompanyId] = React.useState<string>(activeCompanyId && activeCompanyId !== "all" ? activeCompanyId : (user?.companyId || "tech"))
  const [formBranchId, setFormBranchId] = React.useState<string>(activeBranchId || user?.branchId || "")
  const [formSubBranchId, setFormSubBranchId] = React.useState<string>(activeSubBranchId || (user as any)?.subBranchId || "")
  const [title, setTitle] = React.useState("")
  const [amount, setAmount] = React.useState("")
  const [category, setCategory] = React.useState("Cloud & Server Infrastructure")
  const [member, setMember] = React.useState(user?.name || "Admin")
  const [receiptUrl, setReceiptUrl] = React.useState("")
  const [notes, setNotes] = React.useState("")
  const [isProjectScoped, setIsProjectScoped] = React.useState(false)
  const [formProjectId, setFormProjectId] = React.useState("")
  const [formMemberId, setFormMemberId] = React.useState("")

  const availableBranchesForForm = React.useMemo(() => {
    if (!branches || !Array.isArray(branches)) return []
    const tComp = formCompanyId || "tech"
    if (tComp && tComp !== "all") {
      return branches.filter((b) => {
        const bComp = String((b as any).companyId || (b as any).company_id || "").toLowerCase().trim()
        return bComp === tComp.toLowerCase().trim() || (!bComp && tComp === "tech")
      })
    }
    return branches
  }, [branches, formCompanyId])

  const availableSubBranchesForForm = React.useMemo(() => {
    if (!formBranchId || !subBranches || !Array.isArray(subBranches)) return []
    const normB = String(formBranchId).toLowerCase().trim()
    return subBranches.filter(sb => {
      const pId = String(sb.parentBranchId || (sb as any).branch_id || (sb as any).branchId || "").toLowerCase().trim()
      return pId === normB
    })
  }, [formBranchId, subBranches])

  // Form State: Add Project Extra Charge
  const [extraChargeTitle, setExtraChargeTitle] = React.useState("")
  const [extraChargeAmount, setExtraChargeAmount] = React.useState("")
  const [extraChargeCategory, setExtraChargeCategory] = React.useState("Subcontractor & Specialist Fees")
  const [extraChargeVendor, setExtraChargeVendor] = React.useState("")
  const [extraChargeNotes, setExtraChargeNotes] = React.useState("")

  const loadData = React.useCallback(async () => {
    try {
      const [expData, projData, chargesData, invData] = await Promise.all([
        fetchModuleDataFromDB<ExpenseItem[]>("expenses", [], targetComp).catch(() => []),
        getProjects(targetComp).catch(() => []),
        fetchModuleDataFromDB<ProjectExtraCharge[]>("project_extra_charges", [], targetComp).catch(() => []),
        getInvoices(targetComp).catch(() => []),
      ])

      const cleanExpenses = Array.isArray(expData) ? filterGlobalDeletedItems(expData) : []
      const cleanProjects = Array.isArray(projData) ? filterGlobalDeletedItems(projData) : []
      const cleanCharges = Array.isArray(chargesData) ? filterGlobalDeletedItems(chargesData) : []

      setExpenses(cleanExpenses)
      setProjects(cleanProjects)
      setExtraCharges(cleanCharges)
      setInvoices(Array.isArray(invData) ? invData : [])

      if (cleanProjects.length > 0 && !selectedProjectId) {
        setSelectedProjectId(cleanProjects[0].id)
      }
    } catch (err) {
      console.warn("Error loading expenses data:", err)
    }
  }, [targetComp, selectedProjectId])

  React.useEffect(() => {
    loadData()
    window.addEventListener("storage", loadData)
    window.addEventListener("saampark_data_synced", loadData)
    window.addEventListener("saampark_company_switched", loadData)
    window.addEventListener("saampark_branch_switched", loadData)
    window.addEventListener("saampark_projects_updated", loadData)
    return () => {
      window.removeEventListener("storage", loadData)
      window.removeEventListener("saampark_data_synced", loadData)
      window.removeEventListener("saampark_company_switched", loadData)
      window.removeEventListener("saampark_branch_switched", loadData)
      window.removeEventListener("saampark_projects_updated", loadData)
    }
  }, [loadData])

  // Current active project in Project-Wise view
  const currentProject = React.useMemo(() => {
    if (!selectedProjectId) return projects[0] || null
    return projects.find(p => String(p.id).toLowerCase().trim() === String(selectedProjectId).toLowerCase().trim()) || projects[0] || null
  }, [projects, selectedProjectId])

  // Project revenue parsing
  const projectRevenueNum = React.useMemo(() => {
    if (!currentProject) return 0
    if (typeof currentProject.totalAmount === "number" && currentProject.totalAmount > 0) {
      return currentProject.totalAmount
    }
    const rawPrice = currentProject.price || "₹0"
    const parsed = parseInt(String(rawPrice).replace(/[^0-9]/g, "")) || 0
    return parsed
  }, [currentProject])

  // Filtered expenses for general view
  const filteredExpenses = React.useMemo(() => {
    const { activeCompanyId: freshComp, activeBranchId: freshBranch, activeSubBranchId: freshSubBranch, branches: freshBranches, subBranches: freshSubBranches } = useAuthStore.getState()
    const userComp = (freshComp || user?.companyId || "").toLowerCase().trim()
    // Strict: activeBranchId takes priority
    const targetBranch = freshBranch
    const targetBranchObj = (freshBranches || []).find(b => b.id === targetBranch || b.name.toLowerCase() === (targetBranch || "").toLowerCase())
    const targetBranchId = String(targetBranchObj?.id || targetBranch || "").toLowerCase().trim()
    const targetBranchName = targetBranchObj?.name?.toLowerCase().trim() || ""

    const targetSubBranch = freshSubBranch
    const targetSubBranchObj = (freshSubBranches || []).find(sb => sb.id === targetSubBranch || (sb as any).name?.toLowerCase() === (targetSubBranch || "").toLowerCase())
    const targetSubBranchId = String(targetSubBranchObj?.id || targetSubBranch || "").toLowerCase().trim()
    const targetSubBranchName = targetSubBranchObj?.name?.toLowerCase().trim() || ""

    return expenses.filter((e) => {
      // Company filter
      if (userComp && userComp !== "all") {
        const eComp = String((e as any).companyId || "").toLowerCase().trim()
        if (eComp && eComp !== userComp) return false
        if (!eComp && userComp !== "tech") return false
      }
      // Branch filter (strict)
      if (targetBranch && targetBranch !== "all" && targetBranch !== "main" && targetBranch !== "hq") {
        const eBranch = String((e as any).branchId || (e as any).branch_id || "").toLowerCase().trim()
        const eBranchName = String((e as any).branchName || (e as any).branch_name || "").toLowerCase().trim()
        if (!eBranch && !eBranchName) return false
        const isMatch =
          (eBranch && (eBranch === targetBranchId || (targetBranchName && eBranch === targetBranchName))) ||
          (eBranchName && (eBranchName === targetBranchName || eBranchName === targetBranchId))
        if (!isMatch) return false
      }
      // Sub-Branch filter (strict)
      if (targetSubBranch && targetSubBranch !== "all" && targetSubBranch !== "main" && targetSubBranch !== "hq" && targetSubBranch !== "all_subbranches") {
        const eSubBranch = String((e as any).subBranchId || (e as any).sub_branch_id || "").toLowerCase().trim()
        const eSubBranchName = String((e as any).subBranchName || (e as any).sub_branch_name || "").toLowerCase().trim()
        if (!eSubBranch && !eSubBranchName) return false
        const isMatch =
          (eSubBranch && (eSubBranch === targetSubBranchId || (targetSubBranchName && eSubBranch === targetSubBranchName))) ||
          (eSubBranchName && (eSubBranchName === targetSubBranchName || eSubBranchName === targetSubBranchId))
        if (!isMatch) return false
      }
      const matchSearch =
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.member.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.amount.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.projectName && e.projectName.toLowerCase().includes(searchQuery.toLowerCase()))
      if (!matchSearch) return false
      if (selectedCategory === "all") return true
      return e.category === selectedCategory
    }).sort((a, b) => {
      const timeA = new Date(a.date || (a as any).createdAt || 0).getTime()
      const timeB = new Date(b.date || (b as any).createdAt || 0).getTime()
      if (timeA && timeB && timeA !== timeB) return timeB - timeA
      return String(b.id || "").localeCompare(String(a.id || ""))
    })
  }, [expenses, searchQuery, selectedCategory, activeCompanyId, activeBranchId, activeSubBranchId, branches, subBranches, user])

  // Project-specific expenses
  const projectExpenses = React.useMemo(() => {
    if (!currentProject) return []
    const pId = String(currentProject.id).toLowerCase().trim()
    const pTitle = String(currentProject.title || "").toLowerCase().trim()

    return expenses.filter(e => {
      const eProjId = String(e.projectId || "").toLowerCase().trim()
      const eProjName = String(e.projectName || "").toLowerCase().trim()
      return (eProjId && eProjId === pId) || (eProjName && eProjName === pTitle)
    })
  }, [expenses, currentProject])

  // Project-specific custom extra charges
  const projectExtraCharges = React.useMemo(() => {
    if (!currentProject) return []
    const pId = String(currentProject.id).toLowerCase().trim()
    return extraCharges.filter(c => String(c.projectId).toLowerCase().trim() === pId)
  }, [extraCharges, currentProject])

  // Financial Calculations for Selected Project
  const totalMemberExpensesNum = projectExpenses.reduce((sum, e) => sum + (e.amountNum || 0), 0)
  const totalExtraChargesNum = projectExtraCharges.reduce((sum, c) => sum + (c.amount || 0), 0)
  const totalProjectExpenses = totalMemberExpensesNum + totalExtraChargesNum
  const netProfit = projectRevenueNum - totalProjectExpenses
  const profitMarginPct = projectRevenueNum > 0 ? Math.round((netProfit / projectRevenueNum) * 100) : 0
  const isProfitable = netProfit >= 0

  // Per-member expense breakdown on this project
  const memberCostMap = React.useMemo(() => {
    const map: Record<string, number> = {}
    projectExpenses.forEach(e => {
      const key = (e.member || "Unassigned").toLowerCase().trim()
      map[key] = (map[key] || 0) + (e.amountNum || 0)
    })
    return map
  }, [projectExpenses])

  // ── HANDLERS ──────────────────────────────────────────────────────────────
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !amount.trim()) {
      alert("Please fill in title and amount.")
      return
    }

    const numAmount = parseInt(amount.replace(/[^0-9]/g, "")) || 0
    const formattedAmount = `₹${numAmount.toLocaleString("en-IN")}`
    const maxNum = expenses.reduce((max, exp) => {
      const num = parseInt(String(exp.expenseNumber || "").replace(/[^0-9]/g, "")) || 0
      return Math.max(max, num)
    }, 100)

    const targetProject = isProjectScoped && formProjectId 
      ? projects.find(p => p.id === formProjectId) 
      : null

    const matchedBranch = (branches || []).find(b => b.id === formBranchId)
    const matchedSubBranch = (subBranches || []).find(sb => sb.id === formSubBranchId)

    const newExp: ExpenseItem = {
      id: `exp_${Date.now()}`,
      expenseNumber: `EXP #${maxNum + 1}`,
      title,
      amount: formattedAmount,
      amountNum: numAmount,
      category,
      date: new Date().toLocaleDateString("en-IN", { dateStyle: "medium" }),
      member: member || user?.name || "Admin",
      receiptUrl,
      status: isAdmin ? "Approved" : "Pending",
      notes,
      projectId: targetProject?.id,
      projectName: targetProject?.title,
      isProjectExpense: Boolean(targetProject),
      assignedMemberId: formMemberId || undefined,
      companyId: formCompanyId || targetComp || "tech",
      branchId: formBranchId || undefined,
      branchName: matchedBranch?.name || undefined,
      subBranchId: formSubBranchId || undefined,
      subBranchName: matchedSubBranch?.name || undefined,
    }

    await executeWithFeedback(async () => {
      const updated = [newExp, ...expenses]
      setExpenses(updated)
      await saveModuleDataToDB("expenses", updated, targetComp)

      setIsAddModalOpen(false)
      setTitle("")
      setAmount("")
      setNotes("")
      setIsProjectScoped(false)
      setFormProjectId("")
      setFormMemberId("")
    }, {
      actionType: "create",
      loadingTitle: "Recording Expense...",
      loadingMsg: `Logging ${newExp.expenseNumber} for ${title}...`,
      successTitle: "Expense Recorded!",
      successMsg: `Expense ${newExp.expenseNumber} recorded successfully.`,
      errorTitle: "Expense Failed",
    })
  }

  const handleAddExtraCharge = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!extraChargeTitle.trim() || !extraChargeAmount.trim() || !currentProject) {
      alert("Please fill in all extra charge details.")
      return
    }

    const numAmount = parseInt(extraChargeAmount.replace(/[^0-9]/g, "")) || 0
    const newCharge: ProjectExtraCharge = {
      id: `charge_${Date.now()}`,
      projectId: currentProject.id,
      title: extraChargeTitle.trim(),
      amount: numAmount,
      category: extraChargeCategory,
      date: new Date().toLocaleDateString("en-IN", { dateStyle: "medium" }),
      vendor: extraChargeVendor.trim() || undefined,
      notes: extraChargeNotes.trim() || undefined,
    }

    await executeWithFeedback(async () => {
      const updated = [newCharge, ...extraCharges]
      setExtraCharges(updated)
      await saveModuleDataToDB("project_extra_charges", updated, targetComp)

      setIsAddExtraChargeModalOpen(false)
      setExtraChargeTitle("")
      setExtraChargeAmount("")
      setExtraChargeVendor("")
      setExtraChargeNotes("")
    }, {
      actionType: "create",
      loadingTitle: "Applying Extra Charge...",
      loadingMsg: `Adding "${newCharge.title}" to ${currentProject.title}...`,
      successTitle: "Extra Charge Added!",
      successMsg: `₹${numAmount.toLocaleString("en-IN")} direct cost added to ${currentProject.title}.`,
      errorTitle: "Failed to Add Charge",
    })
  }

  const handleDeleteExtraCharge = async (chargeId: string, cTitle: string) => {
    await executeWithFeedback(async () => {
      const updated = extraCharges.filter(c => c.id !== chargeId)
      setExtraCharges(updated)
      await saveModuleDataToDB("project_extra_charges", updated, targetComp)
    }, {
      actionType: "delete",
      loadingTitle: "Removing Extra Charge...",
      loadingMsg: `Deleting charge "${cTitle}"...`,
      successTitle: "Charge Removed",
      successMsg: `Extra charge "${cTitle}" removed from project ledger.`,
      errorTitle: "Delete Failed",
    })
  }

  const handleUpdateStatus = async (id: string, status: ExpenseItem["status"]) => {
    await executeWithFeedback(async () => {
      const updated = expenses.map(e => e.id === id ? { ...e, status } : e)
      setExpenses(updated)
      await saveModuleDataToDB("expenses", updated, targetComp)
    }, {
      actionType: "update",
      loadingTitle: "Updating Status...",
      loadingMsg: `Marking expense as ${status}...`,
      successTitle: `Expense ${status}`,
      successMsg: `Status updated to ${status}.`,
      errorTitle: "Update Failed",
    })
  }

  const handleDelete = async (id: string) => {
    const exp = expenses.find(e => e.id === id)
    const expNum = exp?.expenseNumber || "Expense"

    await executeWithFeedback(async () => {
      await markGlobalItemDeleted(id, "expenses")
      const updated = expenses.filter(e => e.id !== id)
      setExpenses(updated)
      await saveModuleDataToDB("expenses", updated, targetComp)
    }, {
      actionType: "delete",
      loadingTitle: "Deleting Expense...",
      loadingMsg: `Removing ${expNum}...`,
      successTitle: "Expense Deleted",
      successMsg: `${expNum} removed successfully.`,
      errorTitle: "Delete Failed",
    })
  }

  const totalExpenseNum = expenses.reduce((sum, e) => sum + (e.amountNum || 0), 0)
  const approvedNum = expenses.filter(e => e.status === "Approved").reduce((sum, e) => sum + (e.amountNum || 0), 0)
  const pendingCount = expenses.filter(e => e.status === "Pending").length

  
  __ctrl = { user, companies, activeCompanyId, activeBranchId, activeSubBranchId, branches, subBranches, canPerformAction, targetComp, isAdmin, canAddExpense, canEditExpense, canDeleteExpense, activeViewTab, setActiveViewTab, expenses, setExpenses, projects, setProjects, extraCharges, setExtraCharges, invoices, setInvoices, selectedProjectId, setSelectedProjectId, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, isAddModalOpen, setIsAddModalOpen, isAddExtraChargeModalOpen, setIsAddExtraChargeModalOpen, formCompanyId, setFormCompanyId, formBranchId, setFormBranchId, formSubBranchId, setFormSubBranchId, title, setTitle, amount, setAmount, category, setCategory, member, setMember, receiptUrl, setReceiptUrl, notes, setNotes, isProjectScoped, setIsProjectScoped, formProjectId, setFormProjectId, formMemberId, setFormMemberId, availableBranchesForForm, availableSubBranchesForForm, extraChargeTitle, setExtraChargeTitle, extraChargeAmount, setExtraChargeAmount, extraChargeCategory, setExtraChargeCategory, extraChargeVendor, setExtraChargeVendor, extraChargeNotes, setExtraChargeNotes, loadData, currentProject, projectRevenueNum, filteredExpenses, projectExpenses, projectExtraCharges, totalMemberExpensesNum, totalExtraChargesNum, totalProjectExpenses, netProfit, profitMarginPct, isProfitable, memberCostMap, handleAddExpense, handleAddExtraCharge, handleDeleteExtraCharge, handleUpdateStatus, handleDelete, totalExpenseNum, approvedNum, pendingCount };
  __ctrlRef.current = __ctrl;
return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6 max-w-[1600px] mx-auto p-4 sm:p-6"
    >
      <ExpensesSection1 ctrl={__ctrl} />
      <ExpensesSection2 ctrl={__ctrl} />

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* ── TAB 2: PROJECT-WISE EXPENSES, EXTRA CHARGES & NET PROFIT ───────── */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      <ExpensesSection3 ctrl={__ctrl} />

      <ExpensesSection4 ctrl={__ctrl} />

      <ExpensesSection5 ctrl={__ctrl} />
    </motion.div>
  )
}
