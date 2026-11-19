"use client"

import * as React from "react"
import { X, Check, Paperclip, Mic, HelpCircle, Trash2, Plus, Tag } from "lucide-react"
import { Task, TaskStatus, TaskPriority } from "@/features/tasks/types"
import { taskService } from "@/features/tasks/services/taskService"
import { useAuthStore } from "@/store/useAuthStore"
import { usePermissionStore } from "@/store/usePermissionStore"
import { getUsers, getUserAvatar } from "@/features/users/services/userService"
import { UserItem } from "@/features/users/types"

export interface EditTaskModalProps {
  isOpen: boolean
  task: Task | null
  onClose: () => void
  onTaskUpdated: (updatedTask: Task) => void
  onDeleteTask?: (id: string) => void
}
