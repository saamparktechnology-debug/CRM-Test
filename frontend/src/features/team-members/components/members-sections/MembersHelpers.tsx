"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Plus, Download, Mail, X, ExternalLink, CheckCircle2, 
  Briefcase, CheckSquare, Clock, Phone, User, Shield, Building2, Eye,
  DollarSign, Percent, Sparkles, RefreshCw, Lock, Layers, Trash2, Pencil,
  CreditCard, Calendar, FolderKanban, Check, ChevronRight
} from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/DataTable"
import { Button } from "@/components/ui/Button"
import { useAuthStore } from "@/store/useAuthStore"
import { usePermissionStore } from "@/store/usePermissionStore"
import { taskService } from "@/features/tasks/services/taskService"
import { Task } from "@/features/tasks/types"
import { getUsers, getUserAvatar, deleteUser } from "@/features/users/services/userService"
import { getSubscriptions } from "@/features/subscriptions/services/subscriptionService"
import { Subscription, calculateTeamRevenueShare } from "@/features/subscriptions/types"
import { getProjectWiseUserEarnings, getTeamBankingMap, updateMemberBankingDetails } from "@/features/team/services/teamPaymentService"
import { ProjectUserEarningsRecord, TeamMemberBankingInfo } from "@/features/team/types"
import { AddTeamMemberModal } from "@/features/team/components/AddTeamMemberModal"
import { EditTeamMemberModal } from "@/features/team/components/EditTeamMemberModal"
import { RecordPayoutModal } from "@/features/team/components/RecordPayoutModal"
import { confirmTwoStepDelete } from "@/lib/confirmDialog"

export type TeamMember = {
  id: string
  name: string
  avatarUrl: string
  jobTitle: string
  email: string
  phone: string
  department?: string
  branchId?: string
  branchName?: string
  subBranchId?: string
  subbranchName?: string
  companyId?: string
  status: "Online" | "Offline"
  assignedTasksCount: number
  activeTasks: Task[]
  assignedSubscriptions: Subscription[]
  totalMonthlyCommission: number
  assignedProjects: ProjectUserEarningsRecord[]
  totalProjectEarnings: number
  bankingInfo?: TeamMemberBankingInfo
}
