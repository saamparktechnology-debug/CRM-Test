"use client"

import * as React from "react"
import { 
  X, Check, Bold, Italic, Underline, List, ListOrdered, Table, Link2, Code, Sparkles, 
  Minus, Maximize2, Users, UserCheck, Search, Percent, ExternalLink, Globe, GitBranch, 
  Server, Layers, Megaphone, Video, Image as ImageIcon, Calendar, MapPin, Receipt, 
  RefreshCw, FileText, CheckCircle2, DollarSign, Clock
} from "lucide-react"
import { Project, ProjectMember, ProjectStatus, ProjectType, isMarketingProject } from "@/features/projects/types"
import { updateProject } from "@/features/projects/services/projectService"
import { getInvoices, updateInvoice } from "@/features/invoice/services/invoiceService"
import { getUsers } from "@/features/users/services/userService"
import { UserService } from "@/services/apiServices"
import { ProjectCompletionModal } from "@/features/projects/components/ProjectCompletionModal"
import { type EditProjectModalProps, toDateInputValue } from "@/features/projects/components/editprojectmodal-sections/EditProjectModalHelpers"

export function createEditProjectModalHandler1(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { title, setIsSubmitting, selectedMemberIds, teamMembers, memberPayoutTypes, memberShares, memberAmounts, numericProjectTotal, status, project, setIsCompletionModalOpen, price, attachedInvoice, labelsList, projectCategory, projectType, client, description, startDate, deadline, techStack, gitUrl, liveUrl, hostingEnvironment, scopeDeliverables, planTier, postersQuota, reelsQuota, shootDate, shootLocation, targetGeo, monthlyAdBudget, driveUrl, clientPaidAmount, clientDueAmount, onProjectUpdated, onClose } = getCtrl();
    const __fn: any = async () => {
    if (!title.trim()) {
      alert("Please enter a project title.")
      return
    }

    setIsSubmitting(true)
    try {
      const assignedMembers: ProjectMember[] = selectedMemberIds.map((mId) => {
        const found = teamMembers.find(
          (t) => String(t.id).toLowerCase() === mId.toLowerCase()
        )
        const pType = memberPayoutTypes[mId] || "percentage"
        const sharePct = memberShares[mId] !== undefined ? Number(memberShares[mId]) : 15
        const manualAmt = memberAmounts[mId] !== undefined ? Number(memberAmounts[mId]) : Math.round((numericProjectTotal * sharePct) / 100)
        const finalPayoutAmt = pType === "fixed" ? manualAmt : Math.round((numericProjectTotal * sharePct) / 100)

        return {
          id: mId,
          name: found?.name || "Team Member",
          role: found?.role || "Developer",
          avatar: found?.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${found?.name || mId}`,
          email: found?.email || "",
          payoutType: pType,
          payoutValue: pType === "fixed" ? manualAmt : sharePct,
          payoutAmount: finalPayoutAmt,
          sharePercentage: pType === "fixed" && numericProjectTotal > 0
            ? Number(((manualAmt / numericProjectTotal) * 100).toFixed(1))
            : sharePct,
        }
      })

      if (status === "Completed" && project.status !== "Completed") {
        setIsCompletionModalOpen(true)
        return
      }

      // Live bidirectional sync: If price changed, update attached invoice!
      const newPriceNum = parseFloat(String(price).replace(/[^0-9.]/g, "")) || 0
      if (attachedInvoice && newPriceNum > 0 && newPriceNum !== (attachedInvoice.totalAmount || 0)) {
        try {
          const invGstRate = attachedInvoice.gstRate || 18
          const invBase = attachedInvoice.invoiceType === "nongst" ? newPriceNum : Math.round(newPriceNum / (1 + invGstRate / 100))
          const invGst = newPriceNum - invBase
          const invDue = Math.max(0, newPriceNum - (attachedInvoice.paidAmount || 0))
          
          await updateInvoice({
            ...attachedInvoice,
            baseAmount: invBase,
            gstAmount: invGst,
            totalAmount: newPriceNum,
            due: `₹${invDue.toLocaleString("en-IN")}`,
            subtotal: invBase,
          }, attachedInvoice.companyId)
        } catch (syncErr) {
          console.warn("Could not sync invoice price:", syncErr)
        }
      }

      // Ensure appropriate labels list
      let finalLabels = [...labelsList]
      if (projectCategory === "Digital Marketing Retainer") {
        if (!finalLabels.includes("Digital Marketing")) finalLabels.push("Digital Marketing")
      } else {
        finalLabels = finalLabels.filter((l) => l.toLowerCase() !== "digital marketing")
      }

      const updated = await updateProject(project.id, {
        title,
        projectType,
        client: projectType === "Client Project" ? client : "-",
        description,
        startDate,
        deadline,
        price,
        labels: finalLabels,
        status,
        members: assignedMembers,
        progress: (status === "Completed" || status === "Finished") ? 100 : (status === "Open" ? 0 : (project.progress === 100 ? 50 : project.progress)),
        category: projectCategory === "Digital Marketing Retainer" ? "Digital Marketing" : (project.category || "Website"),
        techStack: projectCategory === "Technical Project" ? techStack : undefined,
        gitUrl: projectCategory === "Technical Project" ? gitUrl : undefined,
        liveUrl: projectCategory === "Technical Project" ? liveUrl : undefined,
        hostingEnvironment: projectCategory === "Technical Project" ? hostingEnvironment : undefined,
        scopeDeliverables: projectCategory === "Technical Project" ? scopeDeliverables : undefined,
        marketingRetainer: projectCategory === "Digital Marketing Retainer" ? {
          planTier,
          postersQuota,
          reelsQuota,
          shootDate,
          shootLocation,
          targetGeo,
          monthlyAdBudget,
          driveUrl,
        } : undefined,
        paidAmount: clientPaidAmount,
        dueAmount: clientDueAmount,
        invoiceId: attachedInvoice?.id || project.invoiceId,
        invoiceNumber: attachedInvoice?.invoiceNumber || project.invoiceNumber,
      })

      onProjectUpdated(updated)
      onClose()
    } catch (err) {
      console.error("Error saving updated project:", err)
      alert("Failed to save project updates.")
    } finally {
      setIsSubmitting(false)
    }
  };
    return __fn(...__args);
  };
}
