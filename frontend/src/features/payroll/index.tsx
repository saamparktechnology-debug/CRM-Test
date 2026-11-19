"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  DollarSign, Plus, Search, Check, Clock, Edit, X, 
  FolderKanban, User, Users, Briefcase, Filter, Award, 
  FileText, Printer, Download, ShieldCheck, Percent, 
  TrendingUp, CheckCircle2, Building2, Sparkles, AlertCircle, 
  ArrowUpRight, ExternalLink
} from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"
import { usePermissionStore } from "@/store/usePermissionStore"
import { PayrollService } from "@/services/hrService"
import { getProjects } from "../projects/services/projectService"
import { getStoredUserAccountsAsync } from "../users/services/userService"
import { Project } from "../projects/types"
import { executeWithFeedback } from "@/store/useActionFeedbackStore"
import { PayrollSection1 } from "@/features/payroll/components/payroll-sections/PayrollSection1"
import { PayrollSection2 } from "@/features/payroll/components/payroll-sections/PayrollSection2"
import { PayrollSection3 } from "@/features/payroll/components/payroll-sections/PayrollSection3"
import { PayrollSection4 } from "@/features/payroll/components/payroll-sections/PayrollSection4"


import { type PayrollItem } from "@/features/payroll/components/payroll-sections/PayrollHelpers"
export * from "@/features/payroll/components/payroll-sections/PayrollHelpers"

export default function PayrollMain() {
  const __ctrlRef = React.useRef<any>({});
  let __ctrl: any = {};

  const { user, activeCompanyId } = useAuthStore()
  const { canPerformAction } = usePermissionStore()

  const roleNorm = String(user?.role || "").toLowerCase().trim()
  const isAdmin = roleNorm === "super admin" || roleNorm === "admin" || roleNorm.includes("admin")
  const isClient = roleNorm === "clients" || roleNorm === "client" || roleNorm.includes("client")
  const isTeamMember = !isAdmin && !isClient
  const canAdd = isAdmin || canPerformAction(user, "Users", "add")

  const [payrolls, setPayrolls] = React.useState<PayrollItem[]>([])
  const [projects, setProjects] = React.useState<Project[]>([])
  const [allUsers, setAllUsers] = React.useState<any[]>([])
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [projectFilter, setProjectFilter] = React.useState("all")
  const [isModalOpen, setIsModalOpen] = React.useState(false)

  // Payout request modal state (for team member self-service)
  const [isPayoutModalOpen, setIsPayoutModalOpen] = React.useState(false)
  const [payoutReqAmount, setPayoutReqAmount] = React.useState("")
  const [payoutReqType, setPayoutReqType] = React.useState<"Monthly Salary Payout" | "Salary Advance" | "Expense Reimbursement">("Monthly Salary Payout")
  const [payoutReqNotes, setPayoutReqNotes] = React.useState("")
  const [isSubmittingPayoutReq, setIsSubmittingPayoutReq] = React.useState(false)

  // Form state
  const [selectionMode, setSelectionMode] = React.useState<"project" | "individual">("project")
  const [selectedProjectId, setSelectedProjectId] = React.useState("")
  const [selectedProjectMembers, setSelectedProjectMembers] = React.useState<any[]>([])

  const [form, setForm] = React.useState({ 
    employee: "", 
    employeeId: "",
    projectId: "",
    projectName: "",
    month: new Date().toISOString().slice(0, 7), 
    basic: 0, 
    allowances: 0, 
    deductions: 0 
  })

  const loadData = React.useCallback(async () => {
    try { 
      const [payrollData, projectList, userList] = await Promise.all([
        PayrollService.getAll({}).catch(() => []),
        getProjects(activeCompanyId || undefined).catch(() => []),
        getStoredUserAccountsAsync().catch(() => [])
      ])

      setPayrolls(Array.isArray(payrollData) ? payrollData : [])
      setProjects(Array.isArray(projectList) ? projectList : [])
      setAllUsers(Array.isArray(userList) ? userList : [])
    } catch (err) {
      console.warn("Payroll loadData warning:", err)
    }
  }, [activeCompanyId])

  React.useEffect(() => { 
    loadData() 
  }, [loadData])

  // When project changes in form, update project members
  const handleProjectSelect = (projId: string) => {
    setSelectedProjectId(projId)
    const foundProject = projects.find(p => p.id === projId)
    if (foundProject) {
      const pMembers = foundProject.members || []
      // If project has defined members, use them, otherwise list users
      setSelectedProjectMembers(pMembers.length > 0 ? pMembers : allUsers)
      setForm(prev => ({
        ...prev,
        projectId: projId,
        projectName: foundProject.title,
        employee: pMembers[0]?.name || "",
        employeeId: pMembers[0]?.id || ""
      }))
    } else {
      setSelectedProjectMembers([])
      setForm(prev => ({ ...prev, projectId: "", projectName: "", employee: "", employeeId: "" }))
    }
  }

  const handleMemberSelect = (memberName: string) => {
    const memberObj = selectedProjectMembers.find(m => m.name === memberName) || allUsers.find(u => u.name === memberName)
    setForm(prev => ({
      ...prev,
      employee: memberName,
      employeeId: memberObj?.id || ""
    }))
  }

  const [activePayrollTab, setActivePayrollTab] = React.useState<"incentives" | "salaries" | "payslips">("incentives")
  const [selectedPayslipItem, setSelectedPayslipItem] = React.useState<any | null>(null)
  const [isPayslipModalOpen, setIsPayslipModalOpen] = React.useState(false)

  // User Projects & Incentives Attribution
  const userProjects = React.useMemo(() => {
    if (!user) return []
    const uId = String(user.id || "").toLowerCase().trim()
    const uEmail = String(user.email || "").toLowerCase().trim()
    const uName = String(user.name || "").toLowerCase().trim()

    return projects.filter((p) => {
      if (isAdmin) return true
      const members = Array.isArray(p.members) ? p.members : []
      return members.some((m: any) => {
        if (!m) return false
        const mId = String(m.id || "").toLowerCase().trim()
        const mEmail = String(m.email || "").toLowerCase().trim()
        const mName = String(m.name || "").toLowerCase().trim()
        return (uId && mId === uId) || (uEmail && mEmail === uEmail) || (uName && mName === uName)
      })
    })
  }, [projects, user, isAdmin])

  const userIncentivesList = React.useMemo(() => {
    const list: any[] = []
    const uId = String(user?.id || "").toLowerCase().trim()
    const uEmail = String(user?.email || "").toLowerCase().trim()
    const uName = String(user?.name || "").toLowerCase().trim()

    userProjects.forEach((p) => {
      const numProjTotal = parseFloat(
        String(p.totalAmount ?? p.baseAmount ?? p.price ?? "0").replace(/[^0-9.]/g, "")
      ) || 0

      const effectiveClientPaid = typeof p.paidAmount === "number"
        ? p.paidAmount
        : (p.paymentStatus === "Paid" || p.status === "Completed"
          ? numProjTotal
          : (typeof p.advanceAmount === "number" ? p.advanceAmount : 0))

      const effectiveClientDue = Math.max(0, numProjTotal - effectiveClientPaid)
      const paidRatio = numProjTotal > 0 ? Math.min(1, effectiveClientPaid / numProjTotal) : 0

      const members = Array.isArray(p.members) ? p.members : []
      const myMembers = isAdmin 
        ? (members.length > 0 ? members : [{ name: "Project Team", role: "Contributor", sharePercentage: 15 }])
        : members.filter((m: any) => {
            const mId = String(m.id || "").toLowerCase().trim()
            const mEmail = String(m.email || "").toLowerCase().trim()
            const mName = String(m.name || "").toLowerCase().trim()
            return (uId && mId === uId) || (uEmail && mEmail === uEmail) || (uName && mName === uName)
          })

      myMembers.forEach((mem: any) => {
        const sharePct = typeof mem?.sharePercentage === "number" ? mem.sharePercentage : 15
        const totalPotential = mem?.payoutType === "fixed" && typeof mem?.payoutAmount === "number"
          ? mem.payoutAmount
          : Math.round((numProjTotal * sharePct) / 100)

        const earnedIncentive = Math.round(paidRatio * totalPotential)
        const pendingIncentive = Math.max(0, totalPotential - earnedIncentive)

        list.push({
          projectId: p.id,
          projectTitle: p.title,
          client: p.client || "-",
          status: p.status,
          isCompleted: p.status === "Completed" || p.status === "Finished",
          projectTotal: numProjTotal,
          clientPaid: effectiveClientPaid,
          clientDue: effectiveClientDue,
          sharePct,
          memberName: mem?.name || user?.name || "Staff",
          memberRole: mem?.role || "Developer",
          totalPotential,
          earnedIncentive,
          pendingIncentive,
          category: p.category || (p.projectType === "Digital Marketing Campaign" ? "Digital Marketing" : "Website"),
        })
      })
    })
    return list
  }, [userProjects, user, isAdmin])

  const successfulProjectsCount = userIncentivesList.filter((item) => item.isCompleted).length
  const totalEarnedIncentives = userIncentivesList.reduce((sum, item) => sum + item.earnedIncentive, 0)
  const totalPendingIncentives = userIncentivesList.reduce((sum, item) => sum + item.pendingIncentive, 0)

  const handleRequestIncentiveForProject = (item: any) => {
    setPayoutReqType("Monthly Salary Payout")
    const amt = item.earnedIncentive > 0 ? item.earnedIncentive : item.totalPotential
    setPayoutReqAmount(String(amt))
    setPayoutReqNotes(`Incentive claim against project "${item.projectTitle}" (${item.sharePct}% share). Client paid: ₹${item.clientPaid.toLocaleString("en-IN")}.`)
    setIsPayoutModalOpen(true)
  }

  // Statutory India Compliant Payroll Breakdown (PF 12%, ESI 0.75%, P-Tax ₹200)
  const calculateStatutoryPayslip = (baseGross: number, incentiveAmt: number = 0) => {
    const gross = Math.max(0, baseGross + incentiveAmt)
    const basic = Math.round(gross * 0.50) // Statutory 50% Basic
    const hra = Math.round(basic * 0.40) // 40% of Basic
    const specialAllowance = Math.max(0, gross - (basic + hra + incentiveAmt))
    
    // Statutory Deductions:
    const pf = Math.round(basic * 0.12) // 12% statutory PF on Basic
    const esi = gross <= 21000 ? Math.round(gross * 0.0075) : Math.round(basic * 0.0075) // 0.75% ESI on Gross
    const pt = gross > 10000 ? 200 : 0 // Professional Tax
    const totalDeductions = pf + esi + pt
    const netSalary = Math.max(0, gross - totalDeductions)

    return {
      gross,
      basic,
      hra,
      specialAllowance,
      incentiveAmt,
      pf,
      esi,
      pt,
      totalDeductions,
      netSalary,
    }
  }

  const filtered = payrolls.filter(p => {
    // If team member: strictly only see their own payroll records
    if (isTeamMember) {
      const uId = String(user?.id || "").toLowerCase().trim()
      const uName = String(user?.name || "").toLowerCase().trim()
      const pEmp = (p.employee || "").toLowerCase().trim()
      const pEmpId = String(p.employeeId || "").toLowerCase().trim()

      const isMine = (uId && pEmpId === uId) || (uName && (pEmp === uName || pEmp.includes(uName)))
      if (!isMine) return false
    }

    const matchSearch = 
      p.employee.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.projectName || "").toLowerCase().includes(searchQuery.toLowerCase())
    if (statusFilter !== "all" && p.status !== statusFilter) return false
    if (projectFilter !== "all" && p.projectId !== projectFilter) return false
    return matchSearch
  })

  // Team Member Metrics
  const teamMetrics = React.useMemo(() => {
    const myRecords = filtered
    const totalDue = myRecords.filter(r => r.status === "Pending").reduce((sum, r) => sum + (r.net || 0), 0)
    const totalPaid = myRecords.filter(r => r.status === "Paid").reduce((sum, r) => sum + (r.net || 0), 0)
    const latest = myRecords[0]
    return {
      totalDue,
      totalPaid,
      latestNet: latest ? latest.net : 0,
      bankName: user?.kycData?.bankName || "Branch Remittance",
      accountNumber: user?.kycData?.accountNumber ? `••••${user.kycData.accountNumber.slice(-4)}` : "Verified Remittance",
    }
  }, [filtered, user])

  const handleSubmitPayoutRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!payoutReqAmount || Number(payoutReqAmount) <= 0) return

    setIsSubmittingPayoutReq(true)
    try {
      const { submitForApproval } = await import("@/services/approvalService")
      const reqId = `payreq_${Date.now()}`
      await submitForApproval({
        type: "payout",
        title: `${payoutReqType} of ₹${Number(payoutReqAmount).toLocaleString("en-IN")}`,
        documentNumber: reqId,
        documentId: reqId,
        clientName: user?.name || "Team Member",
        clientEmail: user?.email || "",
        amount: Number(payoutReqAmount),
        submittedBy: {
          id: String(user?.id || ""),
          name: user?.name || "Team Member",
          email: user?.email || "",
          role: user?.role || "Teams",
        },
        companyId: activeCompanyId || "tech",
        branchId: user?.branchId,
        branchName: user?.branchName,
        dataSnapshot: {
          amount: Number(payoutReqAmount),
          type: payoutReqType,
          notes: payoutReqNotes,
          bankDetails: user?.kycData ? {
            bankName: user.kycData.bankName,
            accountNumber: user.kycData.accountNumber,
            ifscCode: user.kycData.ifscCode,
            upiId: user.kycData.upiId,
          } : undefined,
          submittedAt: new Date().toISOString(),
        }
      })

      setIsPayoutModalOpen(false)
      setPayoutReqAmount("")
      setPayoutReqNotes("")
      alert("✅ Payout request submitted! Your request has been forwarded for Administrator review and disbursement.")
    } catch (err: any) {
      alert(`Failed to submit payout request: ${err.message}`)
    } finally {
      setIsSubmittingPayoutReq(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.employee.trim()) return
    const net = form.basic + form.allowances - form.deductions

    const payload = {
      ...form,
      net,
      status: "Pending"
    }

    await executeWithFeedback(async () => { 
      await PayrollService.create(payload) 
    }, { actionType: "create", successTitle: "Payroll Generated" })

    setIsModalOpen(false)
    loadData()
  }

  const handleMarkPaid = async (id: string) => {
    await executeWithFeedback(async () => { 
      await PayrollService.markPaid(id) 
    }, { actionType: "update", successTitle: "Marked as Paid" })
    loadData()
  }

  if (isClient) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-3">
          <DollarSign className="mx-auto text-blue-500" size={32} />
          <h2 className="text-lg font-bold">Client Portal Notice</h2>
          <p className="text-xs text-muted-foreground">The Payroll module is reserved for internal company staff and employee compensation. Please visit Invoices or Projects to view your commercial accounts.</p>
        </div>
      </div>
    )
  }

  
  __ctrl = { user, activeCompanyId, canPerformAction, roleNorm, isAdmin, isClient, isTeamMember, canAdd, payrolls, setPayrolls, projects, setProjects, allUsers, setAllUsers, searchQuery, setSearchQuery, statusFilter, setStatusFilter, projectFilter, setProjectFilter, isModalOpen, setIsModalOpen, isPayoutModalOpen, setIsPayoutModalOpen, payoutReqAmount, setPayoutReqAmount, payoutReqType, setPayoutReqType, payoutReqNotes, setPayoutReqNotes, isSubmittingPayoutReq, setIsSubmittingPayoutReq, selectionMode, setSelectionMode, selectedProjectId, setSelectedProjectId, selectedProjectMembers, setSelectedProjectMembers, form, setForm, loadData, handleProjectSelect, handleMemberSelect, activePayrollTab, setActivePayrollTab, selectedPayslipItem, setSelectedPayslipItem, isPayslipModalOpen, setIsPayslipModalOpen, userProjects, userIncentivesList, successfulProjectsCount, totalEarnedIncentives, totalPendingIncentives, handleRequestIncentiveForProject, calculateStatutoryPayslip, filtered, teamMetrics, handleSubmitPayoutRequest, handleSubmit, handleMarkPaid };
  __ctrlRef.current = __ctrl;
return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6 max-w-[1600px] mx-auto p-4 sm:p-6 pb-12">
      <PayrollSection3 ctrl={__ctrl} />

      <PayrollSection4 ctrl={__ctrl} />

      {/* Generate Payroll Modal */}
      <AnimatePresence>
        <PayrollSection1 ctrl={__ctrl} />
        <PayrollSection2 ctrl={__ctrl} />
      </AnimatePresence>
    </motion.div>
  )
}
