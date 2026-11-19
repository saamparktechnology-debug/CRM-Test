"use client"

import * as React from "react"
import { X, Check, Paperclip, Mic, HelpCircle, Plus, Tag, Building, MapPin } from "lucide-react"
import { Task, TaskStatus, TaskPriority } from "@/features/tasks/types"
import { taskService } from "@/features/tasks/services/taskService"
import { getUsers, getUserAvatar } from "@/features/users/services/userService"
import { UserItem } from "@/features/users/types"
import { useAuthStore, isMatchingCompany, getSelectableCompanies } from "@/store/useAuthStore"
import { executeWithFeedback } from "@/store/useActionFeedbackStore"
import { type AddTaskModalProps } from "@/features/tasks/components/addtaskmodal-sections/AddTaskModalHelpers"

export function createAddTaskModalHandler1(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { title, setIsSubmitting, labels, priority, availableBranches, selectedBranchId, user, selectedRelatedTo, selectedSubBranchId, subBranches, description, points, assignedTo, allUsers, status, milestone, startDate, deadline, dueTime, sourceType, isRecurring, selectedCompanyId, activeCompanyId, onTaskAdded, onSelectTask, onClose , subBranchId } = getCtrl();
    const finalSubBranchId = subBranchId || undefined;
    const __fn: any = async (andShow: boolean = false) => {
    if (!title.trim()) {
      alert("Please enter a task title.")
      return
    }

    setIsSubmitting(true)
    await executeWithFeedback(async () => {
      const parsedLabels = labels
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean)

      let priorityIcon: "up" | "exclamation" | "down" | "none" = "none"
      if (priority === "High") priorityIcon = "up"
      else if (priority === "Urgent") priorityIcon = "exclamation"
      else if (priority === "Low") priorityIcon = "down"

      const targetBranchObj = availableBranches.find(b => String(b.id).toLowerCase().trim() === String(selectedBranchId).toLowerCase().trim() || String(b.name).toLowerCase().trim() === String(selectedBranchId).toLowerCase().trim())
      const finalBranchId = targetBranchObj ? String(targetBranchObj.id) : (selectedBranchId || undefined)
      const finalBranchName = targetBranchObj?.name || (finalBranchId ? user?.branchName : undefined)
      const finalRelatedTo = selectedRelatedTo.length > 0 ? selectedRelatedTo.join(", ") : undefined

      const targetSubBranchObj = selectedSubBranchId ? (subBranches || []).find(sb => String(sb.id).toLowerCase().trim() === String(selectedSubBranchId).toLowerCase().trim()) : undefined
      const finalSubBranchName = targetSubBranchObj?.name || undefined

      const created = await taskService.addTask({
        title,
        description,
        relatedTo: finalRelatedTo,
        points,
        assignedTo,
        assignedToAvatar: getUserAvatar(assignedTo, allUsers, assignedTo),
        status,
        milestone: milestone || "New",
        priority: priority === "Priority" ? "Normal" : (priority as TaskPriority),
        priorityIcon,
        labels: parsedLabels,
        startDate: startDate || "-",
        deadline: deadline || "30-06-2026",
        dueTime: dueTime.trim() || undefined,
        source: sourceType,
        isRecurring,
        branchId: finalBranchId,
        branchName: finalBranchName,
        subBranchId: finalSubBranchId,
        subBranchName: finalSubBranchName,
        companyId: selectedCompanyId || activeCompanyId || user?.companyId || "tech",
      })

      // Dispatch in-app notification to assigned user
      if (assignedTo && assignedTo !== "None" && assignedTo !== "Unassigned") {
        try {
          const { createNotification } = await import("@/services/notificationService")
          const matchedUser = allUsers.find(u => u.name === assignedTo || u.email === assignedTo)
          createNotification({
            title: `Task Assigned: ${title}`,
            message: `You have been assigned task "${title}". Deadline: ${deadline || 'Immediate'}${dueTime ? ` at ${dueTime}` : ''}.`,
            type: "task",
            linkUrl: "/feature/tasks",
            targetEmail: matchedUser?.email || (assignedTo.includes("@") ? assignedTo : undefined),
          }).catch(() => {})
        } catch {}
      }

      onTaskAdded(created)
      if (andShow && onSelectTask) {
        onSelectTask(created)
      }
      onClose()
    }, {
      actionType: "create",
      loadingTitle: "Creating Task...",
      loadingMsg: `Assigning and creating "${title}"...`,
      successTitle: "Task Created Successfully!",
      successMsg: `Task "${title}" created and scheduled.`,
      errorTitle: "Task Creation Failed",
    })
    setIsSubmitting(false)
  };
    return __fn(...__args);
  };
}
