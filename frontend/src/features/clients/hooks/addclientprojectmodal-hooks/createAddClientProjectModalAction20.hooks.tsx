"use client"

import * as React from "react"
import { 
  X, Check, DollarSign, Calculator, UserCheck, Users, Calendar, Briefcase, FileText, 
  Coins, RefreshCw, Layers, CreditCard, Building2, Mail, Phone, MapPin, 
  Plus, Trash2, Tag, ChevronDown, ChevronUp, Sparkles, Search, Receipt
} from "lucide-react"
import { useRouter } from "next/navigation"
import { ClientItem } from "@/features/clients/types"
import { getUsers } from "@/features/users/services/userService"
import { addProject } from "@/features/projects/services/projectService"
import { addInvoice, getInvoices, generateInvoiceNumber, InvoiceLineItem, AppliedDiscount } from "@/features/invoice/services/invoiceService"
import { addOrder } from "@/features/orders/services/orderService"
import { addPayment } from "@/features/payments/services/paymentService"
import { addSubscription, saveInstallmentRecord } from "@/features/subscriptions/services/subscriptionService"
import { taskService } from "@/features/tasks/services/taskService"
import { saveStoredClient, getClients, formatDisplayEmail } from "@/features/clients/services/clientService"
import { useAuthStore, getSelectableCompanies } from "@/store/useAuthStore"
import { sendInvoiceDetailsEmailNotification, sendPaymentReceiptEmailNotification } from "@/services/emailNotificationService"
import { lookupPincode } from "@/lib/pincodeService"
import { AddClientProjectModalSection1 } from "@/features/clients/components/addclientprojectmodal-sections/AddClientProjectModalSection1"
import { AddClientProjectModalSection2 } from "@/features/clients/components/addclientprojectmodal-sections/AddClientProjectModalSection2"
import { AddClientProjectModalSection3 } from "@/features/clients/components/addclientprojectmodal-sections/AddClientProjectModalSection3"
import { AddClientProjectModalSection4 } from "@/features/clients/components/addclientprojectmodal-sections/AddClientProjectModalSection4"
import { AddClientProjectModalSection5 } from "@/features/clients/components/addclientprojectmodal-sections/AddClientProjectModalSection5"
import { AddClientProjectModalSection6 } from "@/features/clients/components/addclientprojectmodal-sections/AddClientProjectModalSection6"
import { AddClientProjectModalSection7 } from "@/features/clients/components/addclientprojectmodal-sections/AddClientProjectModalSection7"
import { type AddClientProjectModalProps, type ServiceFormItem, type FormDiscountItem, type AssignedMemberAllocation, SERVICE_PRESETS } from "@/features/clients/components/addclientprojectmodal-sections/AddClientProjectModalHelpers"

export function createAddClientProjectModalAction20(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { effectiveClient, projectTitle, serviceItems, setIsSubmitting, totalAmount, effectiveAdvance, remainingDue, itemCalculations, discountsList, selectedCompanyId, activeCompanyId, user, branches, selectedBranchId, isBranchLocked, activeBranchId, subBranches, selectedSubBranchId, creationMode, memberPayouts, paymentModel, paymentStatus, billedByAdmin, startDate, effectiveDeadline, activeInstallmentsCount, perInstallment, totalServicesBase, totalPlatformCharges, totalDiscounts, totalGstAmount, effectiveCategory, subscriptionMonths, description, clientContactPersonName, clientEmail, clientDesignation, clientCustomDesignation, clientPhone, clientAddress, clientDistrict, clientCity, clientState, clientZip, clientGst, assignedMembers, billingCycle, onProjectCreated, onInvoiceCreated, onClose, router } = getCtrl();
    const __fn: any = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!effectiveClient) {
      alert("Please select or search for a client first.")
      return
    }
    if (!projectTitle.trim()) {
      alert("Please enter a project title.")
      return
    }

    if (serviceItems.some(s => !s.serviceName.trim())) {
      alert("Please ensure every service has a valid name.")
      return
    }

    setIsSubmitting(true)
    try {
      const formattedTotal = `₹${totalAmount.toLocaleString("en-IN")}`
      const formattedAdvance = `₹${effectiveAdvance.toLocaleString("en-IN")}`
      const formattedDue = `₹${remainingDue.toLocaleString("en-IN")}`

      // Prepared structured line items for invoice & project
      const finalInvoiceItems: InvoiceLineItem[] = itemCalculations.map(it => ({
        id: it.id,
        serviceName: it.serviceName.trim(),
        sacCode: it.sacCode || "998313",
        qty: it.qty,
        unit: it.unit,
        rate: it.numRate,
        charges: it.charges.map(c => ({
          id: c.id,
          name: c.name.trim() || "Additional Setup",
          amount: typeof c.amount === "number" ? c.amount : 0,
        })),
        gstRate: it.gstRate,
        gstAmount: it.itemGst,
        totalAmount: it.itemTotal,
      }))

      const finalDiscounts: AppliedDiscount[] = discountsList
        .filter(d => (typeof d.amount === "number" && d.amount > 0))
        .map(d => ({
          id: d.id,
          name: d.name.trim() || "Discount",
          amount: Number(d.amount),
        }))

      const targetCompany = selectedCompanyId || activeCompanyId || user?.companyId || "tech"
      const matchedBranch = (branches || []).find((b: any) => {
        if (!b) return false
        const target = String(selectedBranchId || (isBranchLocked ? user?.branchId : activeBranchId) || "").toLowerCase().trim()
        return String(b.id || "").toLowerCase().trim() === target ||
               String(b.name || b.branch_name || b.code || "").toLowerCase().trim() === target
      })
      const matchedSubBranch = subBranches.find(sb => sb.id === selectedSubBranchId)

      const effectiveBranchId = (selectedBranchId || (isBranchLocked ? user?.branchId : (activeBranchId || matchedSubBranch?.parentBranchId))) || undefined
      const effectiveBranchName = matchedBranch?.name || undefined
      const effectiveBranchCode = matchedBranch?.code ? matchedBranch.code.toUpperCase() : undefined
      const effectiveSubBranchId = selectedSubBranchId || undefined
      const effectiveSubBranchName = matchedSubBranch?.name || undefined
      const effectiveSubBranchCode = matchedSubBranch?.code ? matchedSubBranch.code.toUpperCase() : undefined

      // 1. Add Project (Only in Project & Invoice mode)
      let createdProject: any = null
      if (creationMode === "project_and_invoice") {
        const projectMembers = memberPayouts.map(m => ({
          id: m.id || `mem_${m.name}`,
          name: m.name,
          role: m.role || "Developer",
          email: m.email || "",
          avatar: m.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${m.name}`,
          sharePercentage: m.calculatedPercentage,
          payoutType: m.payoutType,
          payoutValue: typeof m.payoutValue === "number" ? m.payoutValue : (Number(m.payoutValue) || 0),
          payoutAmount: m.calculatedAmount,
        }))


        const computedProjectStatus = remainingDue === 0 
          ? "In Progress" 
          : effectiveAdvance > 0 
            ? "In Progress" 
            : "Payment Pending"

        const computedPaymentStatus = remainingDue === 0 
          ? "Paid" 
          : effectiveAdvance > 0 
            ? (paymentModel === "advance" ? "Advance Received" : "Partially Paid") 
            : "Payment Pending"

        const paymentStructureLabel = paymentModel === "advance"
          ? "Advance Payment"
          : paymentModel === "part"
            ? "Part Payment (Subscription)"
            : "Full Payment"

        const starterMilestones: any[] = [
          {
            id: `ms_fe_${Date.now()}`,
            title: "Phase 1: Architecture & UI Setup",
            stage: "Frontend",
            status: effectiveAdvance > 0 ? "Completed" : "Pending",
            notes: `Project scope initiated. Advance status: ${paymentStatus}.`,
            updatedBy: projectMembers[0]?.name || billedByAdmin,
            updatedAt: new Date().toISOString(),
          },
          {
            id: `ms_be_${Date.now() + 1}`,
            title: "Phase 2: Core Development & Integration",
            stage: "Backend",
            status: "Pending",
            notes: "Development in progress",
            updatedBy: projectMembers[0]?.name || billedByAdmin,
            updatedAt: new Date().toISOString(),
          }
        ]

        createdProject = await addProject({
          title: projectTitle,
          client: effectiveClient.name,
          clientId: effectiveClient.id,
          projectType: "Client Project",
          price: formattedTotal,
          startDate: startDate || new Date().toISOString().split("T")[0],
          deadline: effectiveDeadline,
          progress: effectiveAdvance > 0 ? 15 : 0,
          status: computedProjectStatus as any,
          paymentStatus: computedPaymentStatus as any,
          paymentStructure: paymentStructureLabel as any,
          advanceAmount: effectiveAdvance,
          dueAmount: remainingDue,
          installmentsCount: paymentModel === "part" ? activeInstallmentsCount : undefined,
          installmentAmount: paymentModel === "part" ? perInstallment : undefined,
          baseAmount: totalServicesBase,
          setupCharge: totalPlatformCharges,
          discount: totalDiscounts,
          gstRate: totalGstAmount > 0 ? (itemCalculations[0]?.gstRate !== undefined ? itemCalculations[0].gstRate : 18) : 0,
          gstAmount: totalGstAmount,
          totalAmount,
          items: finalInvoiceItems,
          discountsList: finalDiscounts,
          billedBy: billedByAdmin,
          companyId: targetCompany,
          branchId: effectiveBranchId,
          branchName: effectiveBranchName,
          branchCode: effectiveBranchCode,
          subBranchId: effectiveSubBranchId,
          subBranchName: effectiveSubBranchName,
          subBranchCode: effectiveSubBranchCode,
          createdById: user?.id ? String(user.id) : undefined,
          createdByEmail: user?.email,
          labels: [effectiveCategory, computedPaymentStatus, ...(paymentModel === "part" ? [`${subscriptionMonths}-Month Subscription`] : [])],
          description: description || `Client Project for ${effectiveClient.name}. ${serviceItems.map(s => s.serviceName).join(", ")}. Billed by ${billedByAdmin}.`,
          members: projectMembers,
          milestones: starterMilestones,
        }, targetCompany)

        // Generate Tasks for assigned project team members
        if (projectMembers.length > 0) {
          try {
            const taskItems: any[] = projectMembers.map((m: any, idx: number) => {
              const compText = m.payoutAmount > 0 
                ? ` [Compensation: ₹${m.payoutAmount.toLocaleString("en-IN")}${m.payoutType === "percentage" ? ` (${m.payoutValue}%)` : ""}]`
                : ""
              return {
                id: `tsk_${Date.now()}_${idx}`,
                title: `[${projectTitle}] - Milestone & Core Deliverables`,
                description: `Task for project "${projectTitle}". Client: ${effectiveClient.name}. Category: ${effectiveCategory}.${compText} Assigned to: ${m.name}.`,
                startDate: startDate || new Date().toISOString().split("T")[0],
                deadline: effectiveDeadline,
                status: "In progress",
                priority: "High",
                assignedTo: m.name,
                assignedToEmail: m.email || "",
                assignedToId: m.id || "",
                createdBy: billedByAdmin,
                companyId: targetCompany,
                branchId: effectiveBranchId,
                branchName: effectiveBranchName,
                branchCode: effectiveBranchCode,
                projectName: projectTitle,
                tags: [effectiveCategory, "Project Task"],
              }
            })
            await taskService.addTasks(taskItems, targetCompany)
          } catch (err) {
            console.warn("Could not generate tasks for project members:", err)
          }
        }
      }

      // 2. Generate Invoice with automatic fast number & exact date & time
      const invoiceStatus = remainingDue === 0 
        ? "Fully paid" 
        : effectiveAdvance > 0 
          ? "Partially paid" 
          : "Not paid"

      const now = new Date()
      const billTime = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })

      const createdInvoice = await addInvoice({
        client: effectiveClient.name,
        contactPersonName: clientContactPersonName.trim(),
        primaryContact: clientContactPersonName.trim(),
        clientContactPerson: clientContactPersonName.trim(),
        clientEmail: clientEmail.trim() || effectiveClient.email,
        clientId: effectiveClient.id,
        clientDesignation: clientDesignation === "Other" ? (clientCustomDesignation.trim() || "Other") : clientDesignation,
        clientPhone: clientPhone.trim() || effectiveClient.phone,
        clientAddress: clientAddress.trim() || effectiveClient.address,
        clientDistrict: clientDistrict.trim() || effectiveClient.district,
        clientCity: clientCity.trim() || effectiveClient.city,
        clientState: clientState.trim() || effectiveClient.state,
        clientZip: clientZip.trim() || effectiveClient.zip,
        clientGst: clientGst.trim() || effectiveClient.gstNumber,
        category: effectiveCategory,
        project: projectTitle,
        billDate: startDate || now.toISOString().split("T")[0],
        billTime: billTime,
        createdAt: now.getTime(),
        dueDate: effectiveDeadline,
        baseAmount: totalServicesBase,
        setupCharge: totalPlatformCharges,
        discount: totalDiscounts,
        gstRate: totalGstAmount > 0 ? (itemCalculations[0]?.gstRate !== undefined ? itemCalculations[0].gstRate : 18) : 0,
        gstAmount: totalGstAmount,
        invoiceType: totalGstAmount > 0 ? "gst" : "nongst",
        totalInvoiced: formattedTotal,
        paymentReceived: formattedAdvance,
        due: formattedDue,
        status: invoiceStatus,
        billedBy: billedByAdmin,
        companyId: targetCompany,
        branchId: effectiveBranchId,
        branchName: effectiveBranchName,
        branchCode: effectiveBranchCode,
        subBranchId: effectiveSubBranchId,
        subBranchName: effectiveSubBranchName,
        subBranchCode: effectiveSubBranchCode,
        items: finalInvoiceItems,
        discountsList: finalDiscounts,
      } as any, targetCompany)

      const invoiceId = createdInvoice.id

      // Auto-create client user account with role "Clients"
      const targetClientEmail = clientEmail.trim() || effectiveClient.email
      if (targetClientEmail) {
        import("@/features/users/services/userService").then(({ ensureClientUserAccount }) => {
          ensureClientUserAccount({
            email: targetClientEmail,
            name: clientContactPersonName.trim() || effectiveClient.name,
            phone: clientPhone.trim() || effectiveClient.phone,
            companyId: targetCompany,
          }).catch(() => {})
        }).catch(() => {})
      }

      // 3. Concurrently create Order and Initial Payment (if advance paid)
      const followUpTasks: Promise<any>[] = [
        addOrder({
          client: effectiveClient.name,
          clientEmail: effectiveClient.email || clientEmail,
          clientId: effectiveClient.id,
          project: projectTitle,
          orderDate: startDate || now.toISOString().split("T")[0],
          deliveryDate: effectiveDeadline,
          itemsCount: serviceItems.length,
          totalAmount: formattedTotal,
          paymentStatus: remainingDue === 0 ? "Paid" : effectiveAdvance > 0 ? "Partially paid" : "Unpaid",
          status: effectiveAdvance > 0 ? "Processing" : "Pending",
          notes: description || `Order for: ${projectTitle}. Services: ${serviceItems.map(s => s.serviceName).join(", ")}.`,
          invoiceId: invoiceId,
        } as any, targetCompany)
      ]

      if (effectiveAdvance > 0) {
        followUpTasks.push(
          addPayment({
            invoiceId: invoiceId,
            client: effectiveClient.name,
            clientEmail: effectiveClient.email || clientEmail,
            project: projectTitle,
            paymentDate: startDate || now.toISOString().split("T")[0],
            paymentMethod: paymentModel === "advance" ? "Advance (Initial Deposit)" : "Initial Milestone / Part Payment",
            transactionRef: `REC_${Date.now().toString().slice(-6)}`,
            note: `Initial payment for ${projectTitle} (${serviceItems.length} services)`,
            amount: formattedAdvance,
            amountNum: effectiveAdvance,
            status: "Completed",
            companyId: targetCompany,
          }, targetCompany)
        )

        // Non-blocking dispatch Payment Receipt Email
        sendPaymentReceiptEmailNotification({
          invoice: createdInvoice,
          paidAmount: formattedAdvance,
          remainingDue: formattedDue,
          nextDueDate: effectiveDeadline,
          paymentMethod: paymentModel === "advance" ? "Advance (Initial Deposit)" : "Initial Milestone / Part Payment",
          recipientEmail: effectiveClient.email || clientEmail,
        }).catch(() => null)
      } else {
        // Non-blocking dispatch Invoice Details Email
        sendInvoiceDetailsEmailNotification(createdInvoice, effectiveClient.email || clientEmail).catch(() => null)
      }

      // 4. Automatically add to Installments & Subscriptions if Part Payment or Subscription is selected
      if (paymentModel === "part" || paymentModel === "subscription") {
        const scheduleItems = []
        const baseDate = startDate ? new Date(startDate) : new Date()
        const validBase = isNaN(baseDate.getTime()) ? new Date() : baseDate

        for (let i = 1; i <= subscriptionMonths; i++) {
          const instDueDate = new Date(validBase)
          instDueDate.setMonth(instDueDate.getMonth() + i)
          const dueDateStr = instDueDate.toISOString().split("T")[0]
          const isCovered = (effectiveAdvance >= (perInstallment * i)) || (remainingDue === 0)
          
          scheduleItems.push({
            installmentNumber: i,
            amount: perInstallment,
            formattedAmount: `₹${perInstallment.toLocaleString("en-IN")}`,
            dueDate: dueDateStr,
            status: isCovered ? ("Paid" as const) : ("Pending" as const),
            paidDate: isCovered ? (startDate || new Date().toISOString().split("T")[0]) : undefined,
            paidAmount: isCovered ? perInstallment : 0,
          })
        }

        const overallStatus = remainingDue === 0 ? ("Paid" as const) : effectiveAdvance > 0 ? ("Partially Paid" as const) : ("Pending" as const)

        const currentProjId = createdProject?.id || String(Date.now())

        if (paymentModel === "part") {
          followUpTasks.push(
            saveInstallmentRecord({
              id: `inst_proj_${currentProjId}`,
              projectId: currentProjId,
              clientId: effectiveClient.id,
              invoiceId: invoiceId,
              clientName: effectiveClient.name,
              clientEmail: effectiveClient.email || clientEmail,
              clientPhone: effectiveClient.phone || clientPhone,
              clientCompany: effectiveClient.companyName || effectiveClient.name,
              clientGst: effectiveClient.gstNumber || clientGst,
              projectTitle: projectTitle,
              totalContractValue: totalAmount,
              totalAdvancePaid: effectiveAdvance,
              totalPaid: effectiveAdvance,
              remainingBalance: remainingDue,
              totalInstallments: subscriptionMonths,
              currentInstallmentNumber: effectiveAdvance > 0 ? 2 : 1,
              currentInstallmentAmount: perInstallment,
              currentDueDate: effectiveDeadline,
              status: overallStatus,
              schedule: scheduleItems,
              companyId: targetCompany,
              assignedMembers: assignedMembers,
              billedBy: billedByAdmin,
              createdById: user?.id ? String(user.id) : undefined,
              createdAt: startDate || new Date().toISOString().split("T")[0],
            }, targetCompany)
          )
        }

        followUpTasks.push(
          addSubscription({
            clientId: effectiveClient.id,
            clientName: effectiveClient.name,
            clientEmail: effectiveClient.email || clientEmail,
            clientPhone: effectiveClient.phone || clientPhone,
            clientCompany: effectiveClient.companyName || effectiveClient.name,
            planName: paymentModel === "subscription" 
              ? `${projectTitle} (${billingCycle} Subscription)`
              : `${projectTitle} (${subscriptionMonths}-Month Part Payment / EMI)`,
            status: "Active",
            amount: paymentModel === "subscription" ? `₹${totalAmount.toLocaleString("en-IN")}` : `₹${perInstallment.toLocaleString("en-IN")}`,
            numericAmount: paymentModel === "subscription" ? totalAmount : perInstallment,
            billingCycle: (paymentModel === "subscription" ? (billingCycle === "Yearly" ? "Annually" : billingCycle) : "Monthly") as any,
            startDate: startDate || new Date().toISOString().split("T")[0],
            nextBillingDate: effectiveDeadline,
            autoRenew: true,
            assignedMembers: assignedMembers,
            billedBy: billedByAdmin,
            createdById: user?.id ? String(user.id) : undefined,
            createdProjectId: currentProjId,
          }, targetCompany)
        )
      }

      await Promise.all(followUpTasks)

      // 5. Update Stored Client Record with Latest Contact Info
      try {
        const allClients = await getClients()
        const currentStored = allClients.find(c => c.name.toLowerCase().trim() === effectiveClient.name.toLowerCase().trim())
        if (currentStored) {
          const currentTotal = parseInt(currentStored.totalInvoiced.replace(/[^0-9]/g, "")) || 0
          const currentPaid = parseInt(currentStored.paymentReceived.replace(/[^0-9]/g, "")) || 0
          const currentDue = parseInt(currentStored.due.replace(/[^0-9]/g, "")) || 0

          await saveStoredClient({
            ...currentStored,
            primaryContact: clientContactPersonName.trim() || currentStored.primaryContact,
            designation: clientDesignation === "Other" ? (clientCustomDesignation.trim() || "Other") : clientDesignation,
            district: clientDistrict.trim() || currentStored.district,
            zip: clientZip.trim() || currentStored.zip,
            email: clientEmail.trim() || currentStored.email,
            phone: clientPhone.trim() || currentStored.phone,
            address: clientAddress.trim() || currentStored.address,
            city: clientCity.trim() || currentStored.city,
            state: clientState.trim() || currentStored.state,
            gstNumber: clientGst.trim() || currentStored.gstNumber,
            companyId: currentStored.companyId || targetCompany,
            branchId: currentStored.branchId || effectiveBranchId,
            branchName: currentStored.branchName || effectiveBranchName,
            branchCode: currentStored.branchCode || effectiveBranchCode,
            totalInvoiced: `₹${(currentTotal + totalAmount).toLocaleString("en-IN")}`,
            paymentReceived: `₹${(currentPaid + effectiveAdvance).toLocaleString("en-IN")}`,
            due: `₹${(currentDue + remainingDue).toLocaleString("en-IN")}`,
            projectsCount: (currentStored.projectsCount || 0) + (creationMode === "project_and_invoice" ? 1 : 0),
          }, targetCompany)
        }
      } catch (err) {
        console.warn("Could not sync client record:", err)
      }

      // Automatically register / sync Client User Account if email is present
      const finalEmail = clientEmail.trim() || effectiveClient.email
      if (finalEmail) {
        try {
          const { recordUserAccountAsync } = await import("@/features/users/services/userService")
          recordUserAccountAsync({
            name: effectiveClient.name,
            email: finalEmail,
            phone: clientPhone || effectiveClient.phone || "",
            role: "Clients",
            companyId: targetCompany,
            companyIds: [targetCompany],
            branchId: effectiveBranchId,
            branchName: effectiveBranchName,
            status: "Active",
          }, false).catch(() => {})
        } catch {}
      }

      // Dispatch all update events so all sections reload
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("saampark_clients_updated"))
        window.dispatchEvent(new CustomEvent("saampark_projects_updated"))
        window.dispatchEvent(new CustomEvent("saampark_invoices_updated"))
        window.dispatchEvent(new CustomEvent("saampark_payments_updated"))
        window.dispatchEvent(new CustomEvent("saampark_tasks_updated"))
        window.dispatchEvent(new CustomEvent("saampark_data_synced"))
      }

      onProjectCreated()
      if (onInvoiceCreated) onInvoiceCreated(createdInvoice)
      onClose()

      // When "With Project" is selected, directly navigate to the Project Section
      if (creationMode === "project_and_invoice") {
        router.push("/feature/projects")
      }

    } catch (err) {
      console.error(err)
      alert("An error occurred while creating the project and invoice.")
    } finally {
      setIsSubmitting(false)
    }
  };
    return __fn(...__args);
  };
}
