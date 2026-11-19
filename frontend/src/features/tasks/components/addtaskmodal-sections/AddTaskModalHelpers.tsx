"use client"

import * as React from "react"
import { X, Check, Paperclip, Mic, HelpCircle, Plus, Tag, Building, MapPin } from "lucide-react"
import { Task, TaskStatus, TaskPriority } from "@/features/tasks/types"
import { taskService } from "@/features/tasks/services/taskService"
import { getUsers, getUserAvatar } from "@/features/users/services/userService"
import { UserItem } from "@/features/users/types"
import { useAuthStore, isMatchingCompany, getSelectableCompanies } from "@/store/useAuthStore"
import { executeWithFeedback } from "@/store/useActionFeedbackStore"

export interface AddTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onTaskAdded: (newTask: Task) => void
  onSelectTask?: (task: Task) => void
}
