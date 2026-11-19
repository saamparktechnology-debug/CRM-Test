"use client"

import * as React from "react"
import { X, Check, Users, Shield, UserCheck, Search, Percent, Sparkles, Building2 } from "lucide-react"
import { Project, ProjectType, ProjectMember, ProjectMilestone } from "@/features/projects/types"
import { addProject } from "@/features/projects/services/projectService"
import { getUsers } from "@/features/users/services/userService"
import { getClients } from "@/features/clients/services/clientService"
import { UserService } from "@/services/apiServices"
import { useAuthStore, getSelectableCompanies } from "@/store/useAuthStore"
import { executeWithFeedback } from "@/store/useActionFeedbackStore"
import { type AddProjectModalProps } from "@/features/projects/components/addprojectmodal-sections/AddProjectModalHelpers"

export function createAddProjectModalHandler1(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { title, selectedMemberIds, teamMembers, memberPayoutTypes, memberShares, memberAmounts, numericComputedPrice, labels, baseAmount, price, selectedCompanyId, activeCompanyId, user, branches, selectedBranchId, isBranchLocked, activeBranchId, selectedSubBranchId, subBranches, projectType, client, startDate, deadline, description, setupCharge, discount, gstRate, setIsSubmitting, onProjectAdded, onClose, setTitle, setDescription, setPrice, setBaseAmount, setSetupCharge, setDiscount, setLabels, setSelectedMemberIds, setMemberShares } = getCtrl();
    const __fn: any = async (continueAdding = false) => {
    if (!title.trim()) {
      alert("Please enter a project title.")
      return
    }

    const assignedMembers: ProjectMember[] = selectedMemberIds.map((mId) => {
      const found = teamMembers.find(
        (t) => String(t.id).toLowerCase() === mId.toLowerCase()
      )
      const pType = memberPayoutTypes[mId] || "percentage"
      const sharePct = memberShares[mId] !== undefined ? Number(memberShares[mId]) : 15
      const manualAmt = memberAmounts[mId] !== undefined ? Number(memberAmounts[mId]) : Math.round((numericComputedPrice * sharePct) / 100)
      const finalPayoutAmt = pType === "fixed" ? manualAmt : Math.round((numericComputedPrice * sharePct) / 100)

      return {
        id: mId,
        name: found?.name || "Team Member",
        role: found?.role || "Developer",
        avatar: found?.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${found?.name || mId}`,
        email: found?.email || "",
        payoutType: pType,
        payoutValue: pType === "fixed" ? manualAmt : sharePct,
        payoutAmount: finalPayoutAmt,
        sharePercentage: pType === "fixed" && numericComputedPrice > 0 
          ? Number(((manualAmt / numericComputedPrice) * 100).toFixed(1)) 
          : sharePct,
      }
    })

    // Starter milestones
    const defaultMilestones: ProjectMilestone[] = [
      {
        id: `ms_fe_${Date.now()}`,
        title: "Frontend Development & UI",
        stage: "Frontend",
        status: "Pending",
        notes: "Next.js UI components and client view",
        updatedBy: assignedMembers[0]?.name || "Assigned Team",
        updatedAt: new Date().toISOString(),
      },
      {
        id: `ms_be_${Date.now() + 1}`,
        title: "Backend API & Database Integration",
        stage: "Backend",
        status: "Pending",
        notes: "MySQL Schema & Storage Sync endpoints",
        updatedBy: assignedMembers[0]?.name || "Assigned Team",
        updatedAt: new Date().toISOString(),
      }
    ]

    const labelsArray = labels.split(",").map(l => l.trim()).filter(Boolean)

    const finalPriceString = (typeof baseAmount === "number" && baseAmount > 0)
      ? `₹${numericComputedPrice.toLocaleString("en-IN")}`
      : (price || "₹0")

    const targetCompany = selectedCompanyId || activeCompanyId || user?.companyId || "tech"
    const matchedBranch = (branches || []).find((b: any) => {
      if (!b) return false
      const target = String(selectedBranchId || (isBranchLocked ? user?.branchId : activeBranchId) || "").toLowerCase().trim()
      return String(b.id || "").toLowerCase().trim() === target ||
             String(b.name || b.branch_name || b.code || "").toLowerCase().trim() === target
    })

    const targetSubBranch = selectedSubBranchId ? (subBranches || []).find(sb => sb.id === selectedSubBranchId) : null

    const newProjData: Omit<Project, "id"> = {
      title,
      projectType,
      client: projectType === "Client Project" ? (client || "Client") : "-",
      price: finalPriceString,
      startDate: startDate || new Date().toISOString().split('T')[0],
      deadline: deadline || new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
      progress: 0,
      status: "Open",
      labels: labelsArray.length > 0 ? labelsArray : ["Active"],
      description,
      members: assignedMembers,
      milestones: defaultMilestones,
      companyId: targetCompany,
      branchId: selectedBranchId || (isBranchLocked ? user?.branchId : activeBranchId) || undefined,
      branchName: matchedBranch?.name || undefined,
      branchCode: matchedBranch?.code ? matchedBranch.code.toUpperCase() : undefined,
      subBranchId: selectedSubBranchId || undefined,
      subBranchName: targetSubBranch?.name || undefined,
      baseAmount: typeof baseAmount === "number" ? baseAmount : undefined,
      setupCharge: typeof setupCharge === "number" ? setupCharge : undefined,
      discount: typeof discount === "number" ? discount : undefined,
      gstRate: gstRate,
      gstAmount: (typeof baseAmount === "number" && baseAmount > 0)
        ? Math.round(Math.max(0, baseAmount + (typeof setupCharge === "number" ? setupCharge : 0) - (typeof discount === "number" ? discount : 0)) * (gstRate / 100))
        : 0,
      totalAmount: numericComputedPrice,
      paymentStatus: "Payment Pending",
      paymentStructure: "Full",
      totalHours: 0,
    }

    setIsSubmitting(true)
    try {
      const created = await executeWithFeedback(
        () => addProject(newProjData, targetCompany),
        {
          loadingMsg: `Creating project "${title}"...`,
          successMsg: `Project "${title}" created successfully!`,
          errorMsg: "Failed to create project."
        }
      )

      if (created) {
        onProjectAdded(created)
        if (!continueAdding) {
          onClose()
        } else {
          setTitle("")
          setDescription("")
          setPrice("")
          setBaseAmount("")
          setSetupCharge("")
          setDiscount("")
          setLabels("")
          setSelectedMemberIds([])
          setMemberShares({})
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  };
    return __fn(...__args);
  };
}
