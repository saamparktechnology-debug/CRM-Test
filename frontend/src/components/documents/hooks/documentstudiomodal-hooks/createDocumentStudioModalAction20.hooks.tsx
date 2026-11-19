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

export function createDocumentStudioModalAction20(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { clientName, selectedClient, items, mode, initialData, setIsSubmitting, isMarketing, primaryCategory, customPrimaryCategory, clientDesignation, customDesignation, marketingPackage, paymentPlan, netPayable, subContractTotal, advanceAmount, effectiveEmiAdvance, effectiveSubAdvance, docScheme, subscriptionDurationMonths, activeSubRate, subscriptionCycle, branches, branchId, subBranches, subBranchId, docNumber, contactPersonName, clientEmail, clientPhone, clientAddress, clientPincode, clientDistrict, clientCity, clientState, clientGst, emiTenureMonths, emiMonthlyAmount, subNextBillingDate, projectOverview, projectTimeline, turnaroundTime, deliverables, scopeInclusions, scopeExclusions, paymentMilestones, issueDate, dueDate, calculatedSubtotal, taxableBase, calculatedDiscount, effectiveCreditDeduction, numSetupCharge, calculatedGst, companyId, activeCompany, notes, terms, assignedMembers, emiRemainingBalance, subPrepaidCycles, subRemainingCycles, marketingObjective, marketingPlatforms, marketingGeography, creativeDriveUrl, clientMode, calculateCycleFutureDate, subBalanceDue, onSaveSuccess, projectTitle, grandTotal, onClose } = getCtrl();
    const __fn: any = async () => {
    if (!clientName.trim() && !selectedClient?.name) {
      alert("Please specify a client name.")
      return
    }
    if (items.length === 0 || !items[0].serviceName.trim()) {
      alert("Please add at least one line item with a service description.")
      return
    }

    const docLabel = mode === "invoice" ? "Invoice" : mode === "quotation" ? "Quotation" : "Estimate"
    const actionLabel = initialData?.id ? "Updating" : "Generating"

    setIsSubmitting(true)
    try {
      await executeWithFeedback(async () => {
        const effectiveCategory = isMarketing ? "Digital Marketing" : (primaryCategory === "Custom" ? (customPrimaryCategory.trim() || "Custom") : primaryCategory)
        const effectiveDesignation = clientDesignation === "Other" ? (customDesignation.trim() || "Client") : clientDesignation
        const effectiveProjectName = isMarketing
          ? (marketingPackage.planName ? `Digital Marketing Retainer (${marketingPackage.planName})` : "Digital Marketing Campaign")
          : (items[0]?.serviceName?.trim() || effectiveCategory || "Client Project")

        // Combined Project + Subscription Total
        // When subscription plan is active, contract total is added to netPayable (project deliverables)
        const combinedDocTotal = paymentPlan === "subscription"
          ? (netPayable + (subContractTotal > 0 ? subContractTotal : 0))
          : netPayable

        const advancePaidNum = paymentPlan === "full"
          ? combinedDocTotal
          : paymentPlan === "advance"
            ? (typeof advanceAmount === "number" ? Math.min(combinedDocTotal, advanceAmount) : 0)
            : paymentPlan === "part"
              ? effectiveEmiAdvance
              : paymentPlan === "subscription"
                ? Math.min(combinedDocTotal, effectiveSubAdvance + (typeof advanceAmount === "number" ? advanceAmount : 0))
                : 0

        const effectiveDue = Math.max(0, combinedDocTotal - advancePaidNum)

        const effectiveDocTotal = combinedDocTotal

        // Final line items compilation
        let finalItemsToSave = [...items]
        if (isMarketing) {
          const planTitle = marketingPackage.planName ? `Digital Marketing Retainer (${marketingPackage.planName})` : "Digital Marketing Retainer"
          const planPrice = marketingPackage.packagePrice || (typeof items[0]?.rate === "number" && items[0]?.rate > 0 ? items[0].rate : 12000)
          const base = planPrice
          const isGstActive = docScheme === "gst"
          const tax = isGstActive ? Math.round(base * 0.18) : 0
          finalItemsToSave = [{
            id: items[0]?.id || `mkt_item_${Date.now()}`,
            serviceName: planTitle,
            sacCode: isGstActive ? "998311" : "",
            qty: 1,
            unit: "Month",
            rate: planPrice,
            gstRate: isGstActive ? 18 : 0,
            gstAmount: tax,
            charges: [],
            totalAmount: base + tax
          }]
        } else if (mode === "invoice" && paymentPlan === "subscription" && subContractTotal > 0) {
          const hasSubItem = finalItemsToSave.some(it => 
            it.serviceName.toLowerCase().includes("subscription") || 
            it.serviceName.toLowerCase().includes("retainer")
          )
          if (!hasSubItem) {
          finalItemsToSave.push({
            id: `sub_retainer_${Date.now()}`,
            serviceName: `Recurring Subscription Plan (${subscriptionDurationMonths} Months @ ₹${activeSubRate}/${subscriptionCycle})`,
            sacCode: docScheme === "gst" ? "998313" : "",
            qty: subscriptionDurationMonths,
            unit: subscriptionCycle,
            rate: activeSubRate,
            gstRate: 0,
            gstAmount: 0,
            charges: [],
            totalAmount: subContractTotal
          })
        }
      }

      const selectedBranch = branches.find(b => String(b.id) === String(branchId) || b.name.toLowerCase() === String(branchId).toLowerCase())
      const selectedSubBranch = subBranches.find(sb => String(sb.id) === String(subBranchId) || sb.name.toLowerCase() === String(subBranchId).toLowerCase())

      const finalDocPayload: any = {
        id: docNumber,
        invoiceNumber: docNumber,
        number: docNumber,
        client: String(clientName || selectedClient?.name || "Client"),
        contactPersonName: contactPersonName.trim(),
        primaryContact: contactPersonName.trim(),
        clientContactPerson: contactPersonName.trim(),
        clientDesignation: effectiveDesignation,
        clientEmail: clientEmail || selectedClient?.email,
        clientPhone: clientPhone || selectedClient?.phone,
        clientAddress: clientAddress || selectedClient?.address,
        clientPincode: clientPincode || selectedClient?.zip,
        clientDistrict: clientDistrict || (selectedClient as any)?.district,
        clientCity: clientCity || selectedClient?.city,
        clientState: clientState || selectedClient?.state,
        clientGstin: docScheme === "nongst" ? "" : (clientGst || selectedClient?.gstNumber),
        category: effectiveCategory,
        primaryCategory: effectiveCategory,
        project: effectiveProjectName,
        paymentPlan: paymentPlan,
        paymentStructure: paymentPlan === "full" 
          ? "Full Payment" 
          : paymentPlan === "part" 
            ? `Part (EMI) - ${emiTenureMonths} Mo (${effectiveEmiAdvance > 0 ? `₹${effectiveEmiAdvance.toLocaleString("en-IN")} Adv Paid, ` : ""}₹${emiMonthlyAmount.toLocaleString("en-IN")}/mo)`
            : paymentPlan === "advance" 
              ? "Advance Payment" 
              : `Subscription - ${subscriptionDurationMonths} Mo @ ₹${activeSubRate}/${subscriptionCycle} (${effectiveSubAdvance > 0 ? `₹${effectiveSubAdvance.toLocaleString("en-IN")} Adv Paid, ` : ""}Next: ${subNextBillingDate})`,
        overview: projectOverview,
        timeline: projectTimeline,
        turnaroundTime: turnaroundTime,
        deliverables: deliverables,
        scopeInclusions: scopeInclusions,
        scopeExclusions: scopeExclusions,
        paymentMilestones: paymentMilestones,
        billDate: issueDate,
        invoiceDate: issueDate,
        date: issueDate,
        dueDate: dueDate,
        validTill: dueDate,
        baseAmount: calculatedSubtotal,
        subtotal: calculatedSubtotal,
        taxableBase: taxableBase,
        taxableAmount: taxableBase,
        discount: calculatedDiscount,
        creditDeduction: effectiveCreditDeduction,
        setupCharge: numSetupCharge,
        gstRate: mode === "invoice" && docScheme === "gst" ? 18 : 0,
        gstAmount: calculatedGst,
        tax: calculatedGst,
        totalInvoiced: `₹${effectiveDocTotal.toLocaleString("en-IN")}`,
        total: effectiveDocTotal,
        paymentReceived: `₹${advancePaidNum.toLocaleString("en-IN")}`,
        due: `₹${effectiveDue.toLocaleString("en-IN")}`,
        status: effectiveDue === 0 ? "Fully paid" : advancePaidNum > 0 ? "Partially paid" : "Not paid",
        companyId: companyId,
        branchId: branchId || undefined,
        branchName: selectedBranch?.name || undefined,
        branchCode: (selectedBranch as any)?.code || undefined,
        subBranchId: subBranchId || undefined,
        subBranchName: selectedSubBranch?.name || undefined,
        subBranchCode: (selectedSubBranch as any)?.code || undefined,
        companyDetails: activeCompany,
        items: finalItemsToSave,
        notes: notes,
        terms: terms ||  activeCompany?.terms_conditions || "1. Payment is due within statutory terms.\n2. Goods & Services once delivered are subject to project sign-off.\n3. Disputed items must be notified within 7 days.",
        assignedMembers: assignedMembers.length > 0 ? assignedMembers : undefined,
        assignedMemberId: assignedMembers.length > 0 ? assignedMembers[0].memberId : undefined,
        assignedMemberName: assignedMembers.length > 0 ? assignedMembers[0].memberName : undefined,
        assignedMemberRole: assignedMembers.length > 0 ? assignedMembers[0].memberRole : undefined,
        memberPayoutType: assignedMembers.length > 0 ? assignedMembers[0].payoutType : undefined,
        memberPayoutValue: assignedMembers.length > 0 ? assignedMembers[0].payoutValue : undefined,
        // Part Payment (EMI) specific fields
        emiMonths: emiTenureMonths,
        emiAdvanceAmount: effectiveEmiAdvance,
        emiRemainingBalance: emiRemainingBalance,
        emiMonthlyAmount: emiMonthlyAmount,
        // Subscription specific fields
        subscriptionCycle: subscriptionCycle,
        subscriptionDurationMonths: subscriptionDurationMonths,
        subscriptionRate: activeSubRate,
        subscriptionAdvance: effectiveSubAdvance,
        prepaidCycles: subPrepaidCycles,
        remainingCycles: subRemainingCycles,
        nextBillingDate: paymentPlan === "subscription" ? subNextBillingDate : dueDate,
        marketingPackage: effectiveCategory === "Digital Marketing" ? marketingPackage : undefined,
        isMarketingRetainer: effectiveCategory === "Digital Marketing",
        marketingObjective: isMarketing ? marketingObjective : undefined,
        marketingPlatforms: isMarketing ? marketingPlatforms : undefined,
        marketingGeography: isMarketing ? marketingGeography : undefined,
        creativeDriveUrl: isMarketing ? creativeDriveUrl : undefined,
        lifecycleStage: isMarketing ? (initialData?.lifecycleStage || "Pending") : undefined,
      }

      if (mode === "invoice") {
        // Check if client already exists before creating accounts
        const targetClientEmail = (clientEmail || selectedClient?.email || "").toLowerCase().trim()
        const targetClientPhone = (clientPhone || selectedClient?.phone || "").trim()
        let isExistingClient = Boolean(selectedClient)

        if (!isExistingClient && (targetClientEmail || targetClientPhone || clientName.trim())) {
          try {
            const { getClients } = await import("@/features/clients/services/clientService")
            const clientList = await getClients(companyId)
            const matched = (Array.isArray(clientList) ? clientList : []).find(c => 
              (targetClientEmail && c.email && c.email.toLowerCase().trim() === targetClientEmail) ||
              (targetClientPhone && c.phone && c.phone.trim() === targetClientPhone) ||
              (clientName && c.name && c.name.toLowerCase().trim() === clientName.toLowerCase().trim())
            )
            if (matched) isExistingClient = true
          } catch {}
        }

        // Auto-save client ONLY when creating an official invoice and client is new
        if (!isExistingClient && (clientMode === "custom" || (!selectedClient && clientName.trim()))) {
          try {
            await saveStoredClient({
              id: `cli_${Date.now()}`,
              name: clientName.trim(),
              primaryContact: contactPersonName.trim() || clientName.trim(),
              designation: effectiveDesignation,
              phone: clientPhone,
              email: clientEmail,
              address: clientAddress,
              city: clientCity,
              district: clientDistrict,
              state: clientState,
              zip: clientPincode,
              gstNumber: docScheme === "nongst" ? "" : clientGst,
              companyId: companyId,
              branchId: branchId || undefined,
              branchName: selectedBranch?.name || undefined,
              subBranchId: subBranchId || undefined,
              subBranchName: selectedSubBranch?.name || undefined,
              group: "Standard",
              label: "Active",
              labelColor: "#3B82F6",
              projectsCount: 1,
              totalInvoiced: `₹${effectiveDocTotal.toLocaleString("en-IN")}`,
              paymentReceived: `₹${advancePaidNum.toLocaleString("en-IN")}`,
              due: `₹${effectiveDue.toLocaleString("en-IN")}`,
            })
          } catch (cErr) {
            console.warn("Auto-save client error:", cErr)
          }
        }

        let saved
        if (initialData?.id) {
          saved = await updateInvoice(finalDocPayload)
        } else {
          saved = await addInvoice(finalDocPayload, companyId)
        }

        // Only send client portal login credentials if this is a NEW client account!
        // If client already existed, do NOT send login credentials again!
        if (targetClientEmail) {
          if (!isExistingClient) {
            try {
              const { ensureClientUserAccount } = await import("@/features/users/services/userService")
              await ensureClientUserAccount({
                email: targetClientEmail,
                name: contactPersonName.trim() || clientName.trim(),
                phone: clientPhone || selectedClient?.phone,
                companyId: companyId,
              })
              const { sendClientWelcomeEmailNotification } = await import("@/services/emailNotificationService")
              sendClientWelcomeEmailNotification({
                id: selectedClient?.id || `cli_${Date.now()}`,
                name: clientName.trim(),
                email: targetClientEmail,
                primaryContact: contactPersonName.trim() || clientName.trim(),
                companyId: companyId,
              } as any).catch(wErr => console.warn("Welcome email notice:", wErr))
            } catch (uErr) {
              console.warn("Auto-create client user error:", uErr)
            }
          }

          // Always send Invoice Details & Receipt Email to client for every invoice!
          try {
            const { sendInvoiceDetailsEmailNotification, sendPaymentReceiptEmailNotification } = await import("@/services/emailNotificationService")
            sendInvoiceDetailsEmailNotification(saved || finalDocPayload, targetClientEmail).catch(invErr => {
              console.warn("Invoice email dispatch notice:", invErr)
            })

            if (advancePaidNum > 0) {
              sendPaymentReceiptEmailNotification({
                invoice: saved || finalDocPayload,
                paidAmount: `₹${advancePaidNum.toLocaleString("en-IN")}`,
                remainingDue: `₹${effectiveDue.toLocaleString("en-IN")}`,
                nextDueDate: dueDate,
                paymentMethod: "Advance / Bank Transfer",
                recipientEmail: targetClientEmail,
              }).catch(rcptErr => console.warn("Receipt email dispatch notice:", rcptErr))
            }
          } catch (mailErr) {
            console.warn("Email service trigger error:", mailErr)
          }
        }

        // If credit note balance was deducted against this invoice, update customer's credit note(s)
        if (effectiveCreditDeduction > 0) {
          try {
            const { applyCreditNoteDeduction } = await import("@/features/credit-notes/services/creditNoteService")
            await applyCreditNoteDeduction(
              String(clientName || selectedClient?.name),
              effectiveCreditDeduction,
              docNumber,
              companyId
            )
          } catch (cnErr) {
            console.warn("Could not apply credit note deduction:", cnErr)
          }
        }

        // If Part Payment (EMI), auto-create Milestone Tracking Plan in /feature/emi
        if (paymentPlan === "part") {
          try {
            const now = issueDate || new Date().toISOString().split("T")[0]
            const installmentSchedule = Array.from({ length: emiTenureMonths }, (_, i) => {
              const instNum = i + 1
              const dueDateStr = calculateCycleFutureDate(now, "Monthly", instNum)
              const isLast = instNum === emiTenureMonths
              const amount = isLast 
                ? Math.max(0, emiRemainingBalance - emiMonthlyAmount * (emiTenureMonths - 1))
                : emiMonthlyAmount

              return {
                installmentNumber: instNum,
                amount: Math.max(0, amount),
                formattedAmount: `₹${Math.max(0, amount).toLocaleString("en-IN")}`,
                dueDate: dueDateStr,
                status: "Pending" as const,
                notes: `Installment #${instNum} of ${emiTenureMonths} for Invoice #${docNumber}`,
              }
            })

            await saveInstallmentRecord({
              id: `inst_${docNumber}_${Date.now()}`,
              invoiceId: docNumber,
              clientName: String(clientName || selectedClient?.name || "Client"),
              clientEmail: clientEmail || selectedClient?.email,
              clientPhone: clientPhone || selectedClient?.phone,
              clientCompany: selectedClient?.companyName || clientName,
              projectTitle: effectiveProjectName,
              totalContractValue: netPayable,
              totalAdvancePaid: effectiveEmiAdvance,
              totalPaid: effectiveEmiAdvance,
              remainingBalance: emiRemainingBalance,
              totalInstallments: emiTenureMonths,
              currentInstallmentNumber: 1,
              currentInstallmentAmount: emiMonthlyAmount,
              currentDueDate: installmentSchedule[0]?.dueDate || dueDate,
              status: emiRemainingBalance === 0 ? "Paid" : "Partially Paid",
              schedule: installmentSchedule,
              companyId: companyId,
              branchId: branchId || undefined,
              createdAt: now,
            }, companyId)
          } catch (emiErr) {
            console.warn("Auto-create EMI milestone error:", emiErr)
          }
        }

        // If Subscription based, auto create in Subscriptions section
        if (paymentPlan === "subscription") {
          try {
            await addSubscription({
              clientId: selectedClient?.id ? String(selectedClient.id) : undefined,
              clientName: String(clientName || selectedClient?.name || "Client"),
              clientEmail: clientEmail || selectedClient?.email,
              clientPhone: clientPhone || selectedClient?.phone,
              clientCompany: selectedClient?.companyName || clientName || "Client",
              planName: `${effectiveCategory} - ${items[0]?.serviceName || effectiveProjectName} (${subscriptionDurationMonths}-Month ${subscriptionCycle} @ ₹${activeSubRate})`,
              status: "Active",
              amount: `₹${activeSubRate.toLocaleString("en-IN")}`,
              numericAmount: activeSubRate,
              billingCycle: (subscriptionCycle === "Yearly" ? "Annually" : subscriptionCycle) as any,
              startDate: issueDate || new Date().toISOString().split("T")[0],
              firstPaymentDate: issueDate || new Date().toISOString().split("T")[0],
              firstPaymentAmount: effectiveSubAdvance,
              nextBillingDate: subNextBillingDate,
              totalDurationMonths: subscriptionDurationMonths,
              totalCycles: subscriptionDurationMonths,
              prepaidCycles: subPrepaidCycles,
              remainingCycles: subRemainingCycles,
              advanceAmount: effectiveSubAdvance,
              balanceDue: subBalanceDue,
              prepaidUntilDate: subNextBillingDate,
              description: `Auto-generated from Invoice #${docNumber} (${subscriptionDurationMonths}-Month ${subscriptionCycle} Plan @ ₹${activeSubRate}/${subscriptionCycle}. ₹${effectiveSubAdvance} paid in advance [${subPrepaidCycles} months prepaid upfront]. Next recurring invoice starts on ${subNextBillingDate})`,
            }, companyId)
          } catch (subErr) {
            console.warn("Auto-create subscription error:", subErr)
          }
        }

        // Auto-link/create project in Projects module
        if (effectiveProjectName && effectiveProjectName.trim()) {
          try {
            const { getProjects, addProject } = await import("@/features/projects/services/projectService")
            const existingProjects = await getProjects(companyId)
            const projectList = Array.isArray(existingProjects) ? existingProjects : []
            const cleanTitle = effectiveProjectName.trim()
            const found = projectList.find(p => p.invoiceId && String(p.invoiceId).toUpperCase().trim() === String(docNumber).toUpperCase().trim())
            const isDigitalMarketing = effectiveCategory === "Digital Marketing" || (
              effectiveCategory.toLowerCase().includes("marketing") &&
              !effectiveCategory.toLowerCase().includes("website") &&
              !effectiveCategory.toLowerCase().includes("software") &&
              !effectiveCategory.toLowerCase().includes("app") &&
              !effectiveCategory.toLowerCase().includes("android") &&
              !effectiveCategory.toLowerCase().includes("ios")
            )
            const mappedMembers = assignedMembers.map(m => {
              const sharePct = 10 // default 10% commission
              const totalPayout = Math.round((effectiveDocTotal * sharePct) / 100)
              const earnedPayout = effectiveDocTotal > 0 ? Math.round((advancePaidNum * sharePct) / 100) : 0
              return {
                id: m.memberId,
                name: m.memberName,
                role: m.memberRole || (isDigitalMarketing ? "Marketing Specialist" : "Developer"),
                avatar: m.memberAvatar,
                avatarUrl: m.memberAvatar,
                sharePercentage: sharePct,
                payoutType: "percentage" as const,
                payoutValue: sharePct,
                payoutAmount: totalPayout,
                earnedAmount: earnedPayout,
                pendingAmount: totalPayout - earnedPayout,
              }
            })
            if (!found) {
              await addProject({
                title: cleanTitle,
                client: String(clientName || selectedClient?.name || "Client"),
                clientName: String(clientName || selectedClient?.name || "Client"),
                clientEmail: targetClientEmail || clientEmail || selectedClient?.email,
                clientPhone: targetClientPhone || clientPhone || selectedClient?.phone,
                clientId: selectedClient?.id ? String(selectedClient.id) : (targetClientEmail || undefined),
                customer: String(clientName || selectedClient?.name || "Client"),
                customerEmail: targetClientEmail || clientEmail || selectedClient?.email,
                projectType: isDigitalMarketing ? "Digital Marketing Campaign" : "Client Project",
                price: `₹${effectiveDocTotal.toLocaleString("en-IN")}`,
                startDate: issueDate || new Date().toISOString().split("T")[0],
                deadline: dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
                progress: 0,
                status: "Open", // Default to Open when invoice created
                paymentStatus: effectiveDue === 0 ? "Paid" : advancePaidNum > 0 ? "Partially Paid" : "Payment Pending",
                baseAmount: taxableBase,
                totalAmount: effectiveDocTotal,
                paidAmount: advancePaidNum,
                dueAmount: effectiveDue,
                invoiceId: docNumber,
                invoiceNumber: docNumber,
                companyId: companyId,
                branchId: branchId || undefined,
                subBranchId: subBranchId || undefined,
                members: mappedMembers,
                marketingPackage: isDigitalMarketing ? marketingPackage : undefined,
                category: effectiveCategory,
                labels: [isDigitalMarketing ? "Digital Marketing" : "Client Project", effectiveCategory, paymentPlan.toUpperCase()].filter(Boolean),
                description: isDigitalMarketing
                  ? `Digital Marketing Campaign for ${clientName || "Client"} (${marketingPackage?.planName || "Grow Plan"}, ${marketingPackage?.packageDuration || "1 month"}). Posters: ${marketingPackage?.postersCount || 12}, Reels: ${marketingPackage?.videosCount || 2}. Target: ${marketingPackage?.targetLocations || "Regional"}`
                  : `Project for ${clientName || "Client"} - Invoice #${docNumber}. Category: ${effectiveCategory}`,
              }, companyId)
            } else {
              // Direct sync: Update existing project amount and payment balance to match this invoice
              try {
                const { updateProject } = await import("@/features/projects/services/projectService")
                await updateProject(found.id, {
                  clientEmail: targetClientEmail || clientEmail || selectedClient?.email,
                  clientPhone: targetClientPhone || clientPhone || selectedClient?.phone,
                  price: `₹${effectiveDocTotal.toLocaleString("en-IN")}`,
                  totalAmount: effectiveDocTotal,
                  paidAmount: advancePaidNum,
                  dueAmount: effectiveDue,
                  invoiceId: docNumber,
                  invoiceNumber: docNumber,
                  paymentStatus: effectiveDue === 0 ? "Paid" : advancePaidNum > 0 ? "Partially Paid" : "Payment Pending",
                  category: effectiveCategory,
                })
              } catch {}
            }
          } catch (projErr) {
            console.warn("Auto-create project error:", projErr)
          }
        }

        // Auto-create campaign in Digital Marketing Hub (/feature/marketing) if digital marketing package
        const isDigitalMarketingEntity = effectiveCategory === "Digital Marketing" || (
          effectiveCategory.toLowerCase().includes("marketing") &&
          !effectiveCategory.toLowerCase().includes("website") &&
          !effectiveCategory.toLowerCase().includes("software") &&
          !effectiveCategory.toLowerCase().includes("app") &&
          !effectiveCategory.toLowerCase().includes("android") &&
          !effectiveCategory.toLowerCase().includes("ios")
        )

        if (isDigitalMarketingEntity) {
          try {
            const { MarketingService } = await import("@/features/marketing/services/marketingService")
            const totalCommitment = (marketingPackage?.postersCount || 12) + (marketingPackage?.videosCount || 2)
            const durMonths = marketingPackage?.packageDuration ? parseInt(marketingPackage.packageDuration) || 1 : 1

            await MarketingService.saveCampaign({
              id: `camp_${docNumber}`,
              clientId: selectedClient?.id ? String(selectedClient.id) : (targetClientEmail || `cli_${Date.now()}`),
              clientName: String(clientName || selectedClient?.name || "Client"),
              clientEmail: targetClientEmail || clientEmail || selectedClient?.email,
              clientPhone: targetClientPhone || clientPhone || selectedClient?.phone,
              companyId: companyId,
              branchId: branchId || undefined,
              branchName: selectedBranch?.name || undefined,
              subBranchId: subBranchId || undefined,
              subBranchName: selectedSubBranch?.name || undefined,
              assignedMemberId: assignedMembers.length > 0 ? assignedMembers[0].memberId : undefined,
              assignedMemberName: assignedMembers.length > 0 ? assignedMembers[0].memberName : undefined,
              invoiceId: docNumber,
              packageName: marketingPackage?.planName || effectiveProjectName || "Digital Marketing Retainer",
              packageDurationMonths: durMonths,
              startDate: issueDate || new Date().toISOString().split("T")[0],
              endDate: dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
              stage: "Pending",
              status: "Active",
              totalCommitment: totalCommitment,
              totalPosted: 0,
              totalLeads: 0,
              services: {
                poster: {
                  serviceKey: "poster",
                  serviceName: "Poster",
                  commitment: marketingPackage?.postersCount || 12,
                  posted: 0,
                  views: 0,
                  reach: 0,
                  leads: 0,
                },
                video: {
                  serviceKey: "video",
                  serviceName: "Video",
                  commitment: marketingPackage?.videosCount || 2,
                  posted: 0,
                  views: 0,
                  reach: 0,
                  leads: 0,
                }
              } as any,
            })
          } catch (mktErr) {
            console.warn("Auto-create digital marketing campaign error:", mktErr)
          }
        }

        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("storage"))
          window.dispatchEvent(new CustomEvent("saampark_data_synced"))
          window.dispatchEvent(new CustomEvent("saampark_invoices_updated"))
          window.dispatchEvent(new CustomEvent("invoiceCreated", { detail: saved || finalDocPayload }))
        }

        onSaveSuccess?.(saved || finalDocPayload)
      } else if (mode === "quotation") {
        const effectiveQuotationItems = (deliverables.length > 0 && items.length <= 1)
          ? deliverables.map((del, dIdx) => {
              const baseShare = deliverables.length > 0 ? Math.floor(taxableBase / deliverables.length) : taxableBase
              const rem = taxableBase - (baseShare * deliverables.length)
              const modTotal = dIdx === deliverables.length - 1 ? (baseShare + rem) : baseShare
              return {
                id: del.id || `item_${dIdx + 1}`,
                name: del.title || `Module ${dIdx + 1}`,
                serviceName: del.title || `Module ${dIdx + 1}`,
                description: del.description || "",
                deliverableTime: del.duration || "1-2 Weeks",
                sac: items[0]?.sacCode || (docScheme === "gst" ? "998313" : "998311"),
                quantity: 1,
                unit: "Module",
                unitPrice: modTotal,
                rate: modTotal,
                gstRate: docScheme === "gst" ? 18 : 0,
                gstAmount: docScheme === "gst" ? Math.round(modTotal * 0.18) : 0,
                total: modTotal,
              }
            })
          : items.map(it => ({
              id: it.id,
              name: it.serviceName,
              serviceName: it.serviceName,
              description: it.description || "",
              deliverableTime: (it as any).deliverableTime || "1-2 Weeks",
              sac: it.sacCode,
              quantity: it.qty,
              unitPrice: it.rate,
              rate: it.rate,
              gstRate: docScheme === "gst" ? (it.gstRate ?? 18) : 0,
              gstAmount: docScheme === "gst" ? Math.round((it.rate * it.qty) * ((it.gstRate ?? 18) / 100)) : 0,
              total: it.totalAmount || (it.rate * it.qty)
            }))

        const quotationPayload = {
          id: initialData?.id || docNumber,
          number: docNumber,
          customer: String(clientName || selectedClient?.name || "Client"),
          client: String(clientName || selectedClient?.name || "Client"),
          customerEmail: clientEmail || selectedClient?.email,
          clientEmail: clientEmail || selectedClient?.email,
          customerPhone: clientPhone || selectedClient?.phone,
          clientPhone: clientPhone || selectedClient?.phone,
          customerAddress: clientAddress || selectedClient?.address,
          clientAddress: clientAddress || selectedClient?.address,
          clientGstin: clientGst || selectedClient?.gstNumber,
          primaryContact: contactPersonName.trim(),
          contactPersonName: contactPersonName.trim(),
          clientDesignation: effectiveDesignation,
          clientCity: clientCity || selectedClient?.city,
          clientDistrict: clientDistrict || (selectedClient as any)?.district,
          clientState: clientState || selectedClient?.state,
          clientPincode: clientPincode || selectedClient?.zip,
          category: effectiveCategory,
          primaryCategory: effectiveCategory,
          project: effectiveProjectName || projectTitle,
          overview: projectOverview,
          timeline: projectTimeline,
          turnaroundTime: turnaroundTime,
          deliverables: deliverables,
          scopeInclusions: scopeInclusions,
          scopeExclusions: scopeExclusions,
          paymentMilestones: paymentMilestones,
          date: issueDate,
          validTill: dueDate,
          notes: notes,
          terms: terms ||  activeCompany?.terms_conditions || "1. Payment is due within statutory terms.\n2. Goods & Services once delivered are subject to project sign-off.\n3. Disputed items must be notified within 7 days.",
          subtotal: taxableBase,
          taxType: docScheme,
          isNonGst: docScheme === "nongst",
          tax: docScheme === "gst" ? calculatedGst : 0,
          total: grandTotal,
          totalAmount: grandTotal,
          formattedTotal: `₹${grandTotal.toLocaleString("en-IN")}`,
          status: initialData?.status || "Draft",
          companyId: companyId,
          branchId: branchId,
          subBranchId: subBranchId,
          services: effectiveQuotationItems,
          items: effectiveQuotationItems,
          marketingPackage: effectiveCategory === "Digital Marketing" ? marketingPackage : undefined,
        isMarketingRetainer: effectiveCategory === "Digital Marketing",
        marketingObjective: isMarketing ? marketingObjective : undefined,
        marketingPlatforms: isMarketing ? marketingPlatforms : undefined,
        marketingGeography: isMarketing ? marketingGeography : undefined,
        creativeDriveUrl: isMarketing ? creativeDriveUrl : undefined,
        lifecycleStage: isMarketing ? (initialData?.lifecycleStage || "Pending") : undefined,
        }

        let saved: any = null
        try {
          if (initialData?.id) {
            saved = await QuotationService.update(initialData.id, quotationPayload)
          } else {
            saved = await QuotationService.create(quotationPayload)
          }
        } catch (apiErr) {
          console.warn("QuotationService API warning:", apiErr)
        }

        // Also save to app_data / local DB fallback so it immediately appears in quotations list
        try {
          const { fetchModuleDataFromDB, saveModuleDataToDB } = await import("@/lib/storageSync")
          const currentList = await fetchModuleDataFromDB<any[]>("quotations", [], companyId)
          const itemToSave = { ...quotationPayload, id: initialData?.id || (saved as any)?.data?.id || `qt_${Date.now()}` }
          const updated = [itemToSave, ...(Array.isArray(currentList) ? currentList.filter(x => x.id !== itemToSave.id && x.number !== itemToSave.number) : [])]
          await Promise.all([
            saveModuleDataToDB("quotations", updated, companyId),
            saveModuleDataToDB("quotations", updated, "all")
          ])
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("storage"))
            window.dispatchEvent(new CustomEvent("saampark_data_synced"))
          }
        } catch {}

        onSaveSuccess?.(saved || quotationPayload)
      } else if (mode === "estimate") {
        const estimatePayload = {
          id: initialData?.id || docNumber,
          number: docNumber,
          customer: String(clientName || selectedClient?.name || "Client"),
          client: String(clientName || selectedClient?.name || "Client"),
          customerEmail: clientEmail || selectedClient?.email,
          clientEmail: clientEmail || selectedClient?.email,
          customerPhone: clientPhone || selectedClient?.phone,
          clientPhone: clientPhone || selectedClient?.phone,
          customerAddress: clientAddress || selectedClient?.address,
          clientAddress: clientAddress || selectedClient?.address,
          clientGstin: clientGst || selectedClient?.gstNumber,
          primaryContact: contactPersonName.trim(),
          contactPersonName: contactPersonName.trim(),
          clientDesignation: effectiveDesignation,
          clientCity: clientCity || selectedClient?.city,
          clientDistrict: clientDistrict || (selectedClient as any)?.district,
          clientState: clientState || selectedClient?.state,
          clientPincode: clientPincode || selectedClient?.zip,
          category: effectiveCategory,
          primaryCategory: effectiveCategory,
          project: effectiveProjectName || projectTitle,
          turnaroundTime: turnaroundTime,
          overview: projectOverview,
          date: issueDate,
          validTill: dueDate,
          notes: notes,
          terms: terms ||  activeCompany?.terms_conditions || "1. Payment is due within statutory terms.\n2. Goods & Services once delivered are subject to project sign-off.\n3. Disputed items must be notified within 7 days.",
          subtotal: taxableBase,
          taxType: docScheme,
          isNonGst: docScheme === "nongst",
          tax: docScheme === "gst" ? calculatedGst : 0,
          total: grandTotal,
          totalAmount: grandTotal,
          formattedTotal: `₹${grandTotal.toLocaleString("en-IN")}`,
          status: initialData?.status || "Draft",
          companyId: companyId,
          branchId: branchId,
          subBranchId: subBranchId,
          services: items.map(it => ({
            id: it.id,
            name: it.serviceName,
            serviceName: it.serviceName,
            sac: it.sacCode,
            quantity: it.qty,
            unitPrice: it.rate,
            rate: it.rate,
            gstRate: docScheme === "gst" ? (it.gstRate ?? 18) : 0,
            gstAmount: docScheme === "gst" ? Math.round((it.rate * it.qty) * ((it.gstRate ?? 18) / 100)) : 0,
            total: it.totalAmount || (it.rate * it.qty)
          })),
          items: items.map(it => ({
            id: it.id,
            name: it.serviceName,
            serviceName: it.serviceName,
            sac: it.sacCode,
            quantity: it.qty,
            unitPrice: it.rate,
            rate: it.rate,
            gstRate: docScheme === "gst" ? (it.gstRate ?? 18) : 0,
            gstAmount: docScheme === "gst" ? Math.round((it.rate * it.qty) * ((it.gstRate ?? 18) / 100)) : 0,
            total: it.totalAmount || (it.rate * it.qty)
          })),
          marketingPackage: effectiveCategory === "Digital Marketing" ? marketingPackage : undefined,
        isMarketingRetainer: effectiveCategory === "Digital Marketing",
        marketingObjective: isMarketing ? marketingObjective : undefined,
        marketingPlatforms: isMarketing ? marketingPlatforms : undefined,
        marketingGeography: isMarketing ? marketingGeography : undefined,
        creativeDriveUrl: isMarketing ? creativeDriveUrl : undefined,
        lifecycleStage: isMarketing ? (initialData?.lifecycleStage || "Pending") : undefined,
        }

        let saved: any = null
        try {
          if (initialData?.id) {
            saved = await EstimateService.update(initialData.id, estimatePayload)
          } else {
            saved = await EstimateService.create(estimatePayload)
          }
        } catch (apiErr) {
          console.warn("EstimateService API warning:", apiErr)
        }

        // Also save to app_data / local DB fallback so it immediately appears in estimates list
        try {
          const { fetchModuleDataFromDB, saveModuleDataToDB } = await import("@/lib/storageSync")
          const currentList = await fetchModuleDataFromDB<any[]>("estimates", [], companyId)
          const itemToSave = { ...estimatePayload, id: initialData?.id || (saved as any)?.data?.id || `est_${Date.now()}` }
          const updated = [itemToSave, ...(Array.isArray(currentList) ? currentList.filter(x => x.id !== itemToSave.id && x.number !== itemToSave.number) : [])]
          await Promise.all([
            saveModuleDataToDB("estimates", updated, companyId),
            saveModuleDataToDB("estimates", updated, "all")
          ])
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("storage"))
            window.dispatchEvent(new CustomEvent("saampark_data_synced"))
          }
        } catch {}

        onSaveSuccess?.(saved || estimatePayload)
      }
      onClose()
    }, {
      actionType: initialData?.id ? "update" : "create",
      loadingTitle: `${actionLabel} Official ${docLabel}...`,
      loadingMsg: `Compiling line items, recalculating GST/discounts, and updating CRM records for ${clientName || "Client"}...`,
      successTitle: `${docLabel} ${initialData?.id ? "Updated" : "Created"} Successfully!`,
      successMsg: `Official ${docLabel} #${docNumber} has been safely saved and synchronized with your workspace.`,
      minLoadingMs: 650,
      autoCloseMs: 2200,
    })
    } catch (err: any) {
      console.error("Save Document error:", err)
    } finally {
      setIsSubmitting(false)
    }
  };
    return __fn(...__args);
  };
}
