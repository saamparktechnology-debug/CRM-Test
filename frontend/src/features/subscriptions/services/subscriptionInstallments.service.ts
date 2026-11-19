import { Subscription, InstallmentItem, InstallmentScheduleItem, InstallmentStatus, SubscriptionStatus } from "@/features/subscriptions/types"
import { SubscriptionService } from "@/services/apiServices"
import { fetchModuleDataFromDB, saveModuleDataToDB, filterGlobalDeletedItems, markGlobalItemDeleted } from "@/lib/storageSync"
import { Project } from "@/features/projects/types"
import { sendGenericReminderEmail } from "@/services/emailNotificationService"

// Helper: Calculate next billing date based on cycle with safe month-end & leap year handling
import { calculateNextCycleDate, getSubscriptions, updateSubscription } from "./subscriptionCore.service"

export const getInstallments = async (companyId?: string): Promise<InstallmentItem[]> => {
  let targetComp = companyId
  if (!targetComp && typeof window !== "undefined") {
    try {
      const { useAuthStore } = require("@/store/useAuthStore")
      targetComp = useAuthStore.getState().activeCompanyId || undefined
    } catch {}
  }
  const effectiveComp = (!targetComp || targetComp === "all") ? "tech" : targetComp
  const targetNorm = effectiveComp.toLowerCase().trim()

  const map = new Map<string, InstallmentItem>()

  // 1. Fetch explicitly saved installments records
  const [scopedInsts, allInsts] = await Promise.all([
    fetchModuleDataFromDB<InstallmentItem[]>("installments", [], effectiveComp).catch(() => []),
    fetchModuleDataFromDB<InstallmentItem[]>("installments", [], "all").catch(() => []),
  ])

  for (const item of (Array.isArray(allInsts) ? allInsts : [])) {
    if (item && item.id) {
      const iComp = (item.companyId || (item as any).company || "tech").toLowerCase().trim()
      if (iComp === targetNorm || (targetNorm === "tech" && !item.companyId)) {
        map.set(String(item.id).toLowerCase().trim(), item)
      }
    }
  }
  for (const item of (Array.isArray(scopedInsts) ? scopedInsts : [])) {
    if (item && item.id) {
      const iComp = (item.companyId || (item as any).company || effectiveComp).toLowerCase().trim()
      if (iComp === targetNorm || (targetNorm === "tech" && !item.companyId) || !item.companyId) {
        map.set(String(item.id).toLowerCase().trim(), item)
      }
    }
  }

  // 2. Aggregate from Projects that have Part Payments / Installments
  try {
    const [scopedProjects, allProjects] = await Promise.all([
      fetchModuleDataFromDB<Project[]>("projects", [], effectiveComp).catch(() => []),
      fetchModuleDataFromDB<Project[]>("projects", [], "all").catch(() => []),
    ])

    const combinedProjects = [
      ...(Array.isArray(allProjects) ? allProjects : []).filter(p => {
        const pComp = (p.companyId || (p as any).company || "tech").toLowerCase().trim()
        return pComp === targetNorm || (targetNorm === "tech" && !p.companyId)
      }),
      ...(Array.isArray(scopedProjects) ? scopedProjects : []).filter(p => {
        const pComp = (p.companyId || (p as any).company || effectiveComp).toLowerCase().trim()
        return pComp === targetNorm || (targetNorm === "tech" && !p.companyId) || !p.companyId
      })
    ]

    for (const p of combinedProjects) {
      if (!p || !p.id) continue
      const isPartPayment = Boolean(
        (p.installmentsCount && p.installmentsCount > 1) ||
        (p.installmentAmount && p.installmentAmount > 0) ||
        (p.paymentStructure && String(p.paymentStructure).includes("Part")) ||
        (Array.isArray(p.labels) && p.labels.some(l => String(l).toLowerCase().includes("part") || String(l).toLowerCase().includes("installment")))
      )

      if (isPartPayment) {
        const instId = `inst_proj_${p.id}`
        if (!map.has(instId.toLowerCase().trim())) {
          const totalVal = parseInt(String(p.price || "0").replace(/[^0-9]/g, "")) || 0
          const totalPaid = p.advanceAmount || 0
          const remaining = p.dueAmount !== undefined ? p.dueAmount : Math.max(0, totalVal - totalPaid)
          const totalCount = p.installmentsCount || 3
          const perInst = p.installmentAmount || (totalCount > 0 ? Math.round(remaining / totalCount) : remaining)

          // Build schedule matrix
          const schedule: InstallmentScheduleItem[] = []
          const baseDate = p.startDate ? new Date(p.startDate) : new Date()
          const validBase = isNaN(baseDate.getTime()) ? new Date() : baseDate

          let currentPendingNum = 1
          let currentDue = p.deadline || new Date().toISOString().split("T")[0]

          for (let i = 1; i <= totalCount; i++) {
            const instDueDate = new Date(validBase)
            instDueDate.setMonth(instDueDate.getMonth() + i)
            const dueDateStr = instDueDate.toISOString().split("T")[0]

            // Check if covered by advance/payments
            const isCovered = (totalPaid >= (perInst * i)) || (remaining === 0)
            const isOverdue = !isCovered && (new Date(dueDateStr).getTime() < Date.now())

            const instStatus: InstallmentStatus = isCovered ? "Paid" : isOverdue ? "Overdue" : "Pending"

            if (instStatus !== "Paid" && currentPendingNum === 1) {
              currentPendingNum = i
              currentDue = dueDateStr
            }

            schedule.push({
              installmentNumber: i,
              amount: perInst,
              formattedAmount: `₹${perInst.toLocaleString("en-IN")}`,
              dueDate: dueDateStr,
              status: instStatus,
              paidDate: isCovered ? (p.startDate || new Date().toISOString().split("T")[0]) : undefined,
              paidAmount: isCovered ? perInst : 0,
            })
          }

          const overallStatus: InstallmentStatus = remaining === 0 
            ? "Paid" 
            : schedule.some(s => s.status === "Overdue") 
              ? "Overdue" 
              : totalPaid > 0 
                ? "Partially Paid" 
                : "Pending"

          map.set(instId.toLowerCase().trim(), {
            id: instId,
            projectId: String(p.id),
            clientId: p.clientId,
            clientName: p.client || "Client",
            clientEmail: (p as any).clientEmail || (p as any).email || "",
            clientPhone: (p as any).clientPhone || (p as any).phone || "",
            clientCompany: (p as any).companyName || p.client || "Client Business",
            projectTitle: p.title,
            totalContractValue: totalVal,
            totalAdvancePaid: p.advanceAmount || 0,
            totalPaid: totalPaid,
            remainingBalance: remaining,
            totalInstallments: totalCount,
            currentInstallmentNumber: currentPendingNum,
            currentInstallmentAmount: perInst,
            currentDueDate: currentDue,
            status: overallStatus,
            schedule,
            companyId: effectiveComp,
            branchId: p.branchId,
            branchName: p.branchName,
            assignedMembers: p.members?.map(m => m.name) || [],
            assignedMemberEmails: p.members?.map(m => m.email || "").filter(Boolean) || [],
            billedBy: p.billedBy,
            createdById: p.createdById,
            createdAt: p.startDate || new Date().toISOString().split("T")[0],
          })
        }
      }
    }
  } catch (err) {
    console.warn("Could not aggregate installment projects:", err)
  }

  return filterGlobalDeletedItems(Array.from(map.values()))
}

export const saveInstallmentRecord = async (item: InstallmentItem, companyId?: string): Promise<InstallmentItem> => {
  const targetComp = companyId || item.companyId || "all"
  const current = await fetchModuleDataFromDB<InstallmentItem[]>("installments", [], targetComp)
  const currentAll = await fetchModuleDataFromDB<InstallmentItem[]>("installments", [], "all")

  const updatedScoped = [item, ...(Array.isArray(current) ? current.filter(i => i.id !== item.id) : [])]
  const updatedAll = [item, ...(Array.isArray(currentAll) ? currentAll.filter(i => i.id !== item.id) : [])]

  await Promise.all([
    saveModuleDataToDB("installments", updatedScoped, targetComp),
    saveModuleDataToDB("installments", updatedAll, "all"),
  ])

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("storage"))
    window.dispatchEvent(new CustomEvent("saampark_data_synced"))
  }

  return item
}

export const recordInstallmentPayment = async (
  installmentId: string,
  installmentNumber: number,
  amountPaid: number,
  paymentMethod: string = "UPI / Bank Transfer",
  companyId?: string
): Promise<InstallmentItem | null> => {
  const allInsts = await getInstallments(companyId)
  const inst = allInsts.find(i => String(i.id).toLowerCase().trim() === String(installmentId).toLowerCase().trim())
  if (!inst) return null

  const updatedSchedule = inst.schedule.map(s => {
    if (s.installmentNumber === installmentNumber) {
      return {
        ...s,
        status: "Paid" as InstallmentStatus,
        paidDate: new Date().toISOString().split("T")[0],
        paidAmount: amountPaid,
        paymentMethod,
      }
    }
    return s
  })

  const newTotalPaid = updatedSchedule.filter(s => s.status === "Paid").reduce((sum, s) => sum + (s.paidAmount || s.amount), inst.totalAdvancePaid)
  const newRemaining = Math.max(0, inst.totalContractValue - newTotalPaid)
  const nextPending = updatedSchedule.find(s => s.status !== "Paid")

  const updatedInst: InstallmentItem = {
    ...inst,
    totalPaid: newTotalPaid,
    remainingBalance: newRemaining,
    currentInstallmentNumber: nextPending ? nextPending.installmentNumber : inst.totalInstallments,
    currentInstallmentAmount: nextPending ? nextPending.amount : 0,
    currentDueDate: nextPending ? nextPending.dueDate : "-",
    status: newRemaining === 0 ? "Paid" : updatedSchedule.some(s => s.status === "Overdue") ? "Overdue" : "Partially Paid",
    schedule: updatedSchedule,
  }

  await saveInstallmentRecord(updatedInst, companyId)

  // Also cascade update to associated Project if exists
  if (inst.projectId) {
    try {
      const { updateProject } = await import("@/features/projects/services/projectService")
      await updateProject(inst.projectId, {
        advanceAmount: newTotalPaid,
        dueAmount: newRemaining,
        paymentStatus: newRemaining === 0 ? "Paid" : "Partially Paid",
      })
    } catch {}
  }

  return updatedInst
}

export const sendInstallmentReminder = async (
  installmentId: string,
  installmentNumber?: number,
  companyId?: string
): Promise<boolean> => {
  const allInsts = await getInstallments(companyId)
  const inst = allInsts.find(i => String(i.id).toLowerCase().trim() === String(installmentId).toLowerCase().trim())
  if (!inst || !inst.clientEmail) return false

  const targetInstNum = installmentNumber || inst.currentInstallmentNumber
  const targetItem = inst.schedule.find(s => s.installmentNumber === targetInstNum) || inst.schedule[0]

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <h2 style="color: #005f69; margin-top: 0;">Payment Due Reminder</h2>
      <p>Dear <strong>${inst.clientName}</strong>,</p>
      <p>This is a reminder regarding the upcoming installment payment for project <strong>"${inst.projectTitle}"</strong>.</p>
      <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #005f69;">
        <p style="margin: 4px 0;"><strong>Installment:</strong> #${targetInstNum} of ${inst.totalInstallments}</p>
        <p style="margin: 4px 0;"><strong>Installment Amount:</strong> ${targetItem ? targetItem.formattedAmount : `₹${inst.currentInstallmentAmount.toLocaleString("en-IN")}`}</p>
        <p style="margin: 4px 0;"><strong>Due Date:</strong> ${targetItem ? targetItem.dueDate : inst.currentDueDate}</p>
        <p style="margin: 4px 0;"><strong>Total Outstanding Balance:</strong> ₹${inst.remainingBalance.toLocaleString("en-IN")}</p>
      </div>
      <p>Please initiate the payment at your earliest convenience to maintain project delivery velocity.</p>
      <p style="color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 12px; margin-top: 24px;">SAAMPARK Group • Accounts & Billing Department</p>
    </div>
  `

  const ok = await sendGenericReminderEmail(
    inst.clientEmail,
    `Payment Reminder: Installment #${targetInstNum} for "${inst.projectTitle}" - SAAMPARK Group`,
    html,
    inst.clientName
  )

  if (ok) {
    const updatedSchedule = inst.schedule.map(s => {
      if (s.installmentNumber === targetInstNum) {
        return { ...s, reminderSentAt: new Date().toISOString() }
      }
      return s
    })

    await saveInstallmentRecord({
      ...inst,
      lastReminderSentAt: new Date().toISOString(),
      schedule: updatedSchedule,
    }, companyId)
  }

  return ok
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. GENERATE INVOICE AGAINST SUBSCRIPTION
// ─────────────────────────────────────────────────────────────────────────────

export const generateSubscriptionInvoice = async (
  sub: Subscription,
  companyId?: string
): Promise<any> => {
  const { addInvoice, getInvoices, generateInvoiceNumber } = await import("@/features/invoice/services/invoiceService")
  const { calculateOverdueDetails } = await import("../types")
  
  const isNonGst = Boolean(sub.isNonGst || sub.taxType === "nongst" || sub.gstRate === 0)
  const effectiveComp = companyId || sub.companyId || "tech"
  const allInvoices = await getInvoices("all")
  const invoiceId = generateInvoiceNumber(allInvoices, new Date(), isNonGst)
  
  const overdueInfo = calculateOverdueDetails(sub)
  const baseNum = overdueInfo.baseDue
  const lateFeeNum = overdueInfo.accumulatedLateFee

  const subtotal = baseNum + lateFeeNum
  const gstRate = isNonGst ? 0 : 18
  const gstAmount = isNonGst ? 0 : Math.round(subtotal * 0.18)
  const grandTotal = subtotal + gstAmount
  const formattedTotal = `₹${grandTotal.toLocaleString("en-IN")}`

  const items: any[] = [
    {
      id: `svc_${Date.now()}`,
      serviceName: `${sub.planName} (${sub.billingCycle} Retainer Cycle)`,
      sacCode: "998313",
      qty: 1,
      unit: sub.billingCycle || "Cycle",
      rate: baseNum,
      charges: [],
      gstRate: gstRate,
      gstAmount: isNonGst ? 0 : Math.round(baseNum * 0.18),
      totalAmount: isNonGst ? baseNum : (baseNum + Math.round(baseNum * 0.18)),
    }
  ]

  if (lateFeeNum > 0 && overdueInfo.daysOverdue > 0) {
    items.push({
      id: `late_fee_${Date.now()}`,
      serviceName: `Overdue Late Charge (${overdueInfo.daysOverdue} Days @ ₹${overdueInfo.dailyLateFee}/day)`,
      sacCode: "998319",
      qty: overdueInfo.daysOverdue,
      unit: "Day",
      rate: overdueInfo.dailyLateFee,
      charges: [],
      gstRate: gstRate,
      gstAmount: isNonGst ? 0 : Math.round(lateFeeNum * 0.18),
      totalAmount: isNonGst ? lateFeeNum : (lateFeeNum + Math.round(lateFeeNum * 0.18)),
    })
  }

  const newInv = await addInvoice({
    id: invoiceId,
    client: sub.clientName,
    clientEmail: sub.clientEmail || `${sub.clientName.toLowerCase().replace(/\s+/g, '')}@client.com`,
    project: `${sub.planName} — Subscription (${sub.billingCycle}${isNonGst ? ' • 0% Non-GST' : ''})`,
    billDate: new Date().toLocaleDateString("en-GB"),
    dueDate: sub.nextBillingDate || new Date(Date.now() + 14 * 86400000).toLocaleDateString("en-GB"),
    baseAmount: subtotal,
    setupCharge: 0,
    discount: 0,
    gstRate: gstRate,
    gstAmount: gstAmount,
    totalInvoiced: formattedTotal,
    paymentReceived: "₹0",
    due: formattedTotal,
    status: overdueInfo.isOverdue ? "Not paid" : "Not paid",
    billedBy: sub.billedBy || "Admin",
    companyId: effectiveComp,
    branchId: sub.branchId || undefined,
    branchName: sub.branchName || undefined,
    items: items,
  }, effectiveComp)

  // Update subscription metadata
  await updateSubscription(sub.id, {
    invoicesCount: (sub.invoicesCount || 0) + 1,
    accumulatedLateFee: lateFeeNum,
    overdueDays: overdueInfo.daysOverdue,
  }, effectiveComp)

  return newInv
}

export const deleteInstallmentRecord = async (id: string, companyId?: string): Promise<boolean> => {
  const strId = String(id).trim()
  const lowerId = strId.toLowerCase()
  const upperId = strId.toUpperCase()

  // 1. Mark as globally deleted across variations
  await markGlobalItemDeleted(strId, "installments")
  await markGlobalItemDeleted(lowerId, "installments")
  await markGlobalItemDeleted(upperId, "installments")
  await markGlobalItemDeleted(`inst_proj_${strId}`, "installments")

  // 2. Cascade delete from storage
  const comp = companyId || "all"
  const current = await fetchModuleDataFromDB<InstallmentItem[]>("installments", [], comp)
  const filtered = (Array.isArray(current) ? current : []).filter(item => String(item.id).toLowerCase().trim() !== lowerId)
  await saveModuleDataToDB("installments", filtered, comp)

  if (comp !== "all") {
    const all = await fetchModuleDataFromDB<InstallmentItem[]>("installments", [], "all")
    const allFiltered = (Array.isArray(all) ? all : []).filter(item => String(item.id).toLowerCase().trim() !== lowerId)
    await saveModuleDataToDB("installments", allFiltered, "all")
  }

  // 3. Cascade delete any linked invoices
  try {
    const invoices = await fetchModuleDataFromDB<any[]>("invoices", [], "all")
    const updatedInvoices = (Array.isArray(invoices) ? invoices : []).filter(inv => {
      const invEmiId = String(inv.emiContractId || inv.orderId || inv.subscriptionId || "").toLowerCase().trim()
      return invEmiId !== lowerId
    })
    if (updatedInvoices.length !== invoices.length) {
      await saveModuleDataToDB("invoices", updatedInvoices, "all")
      await saveModuleDataToDB("invoices", updatedInvoices, comp)
    }
  } catch (err) {
    console.warn("Cascade invoice delete from installment warning:", err)
  }

  // 4. Cascade delete linked payments
  try {
    const payments = await fetchModuleDataFromDB<any[]>("payments", [], "all")
    const updatedPayments = (Array.isArray(payments) ? payments : []).filter(pay => {
      const payEmiId = String(pay.contractId || pay.emiId || pay.referenceId || pay.invoiceId || "").toLowerCase().trim()
      return payEmiId !== lowerId
    })
    if (updatedPayments.length !== payments.length) {
      await saveModuleDataToDB("payments", updatedPayments, "all")
      await saveModuleDataToDB("payments", updatedPayments, comp)
    }
  } catch (err) {
    console.warn("Cascade payment delete from installment warning:", err)
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("saampark_data_synced"))
    window.dispatchEvent(new Event("saampark_installments_updated"))
    window.dispatchEvent(new Event("saampark_invoices_updated"))
    window.dispatchEvent(new Event("saampark_payments_updated"))
    window.dispatchEvent(new Event("storage"))
  }

  return true
}
