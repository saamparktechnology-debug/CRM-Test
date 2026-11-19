"use client"

import * as React from "react"
import {
  Tag,
  Upload,
  Plus,
  Filter,
  FileSpreadsheet,
  Printer,
  Search,
  ArrowDown,
  Layout,
  Pencil,
  X,
  User,
  MapPin,
  Info,
  Receipt,
  Megaphone,
  Clock,
} from "lucide-react"
import { Project } from "@/features/projects/types"
import { ProjectFiltersDropdown } from "@/features/projects/components/ProjectFiltersDropdown"
import { ProjectCompletionModal } from "@/features/projects/components/ProjectCompletionModal"
import { useAuthStore } from "@/store/useAuthStore"
import { usePermissionStore } from "@/store/usePermissionStore"
import { exportToExcel, printPDFReport } from "@/lib/exportUtils"
import { getUserAvatar } from "@/features/users/services/userService"
import { confirmTwoStepDelete } from "@/lib/confirmDialog"
import { formatDisplayDate } from "@/lib/utils"

export interface ProjectListProps {
  projects: Project[]
  hasMarketingAccess?: boolean
  onOpenAddModal: () => void
  onOpenEditModal: (project: Project) => void
  onDeleteProject: (projectId: string) => void
  onSelectProjectDetail: (project: Project, tab?: string) => void
}
