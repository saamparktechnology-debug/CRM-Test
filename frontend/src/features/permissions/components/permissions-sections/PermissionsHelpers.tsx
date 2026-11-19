"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Shield, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  X, 
  Check, 
  Lock, 
  UserCheck, 
  RotateCcw, 
  Save, 
  Loader2, 
  Sparkles,
  Layers,
  CheckCheck,
  CheckCircle2,
  Database,
  ChevronDown,
  User
} from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"
import { PermissionService } from "@/services/permissionService"
import { 
  CONFIGURABLE_MODULES, 
  CLEAN_MODULE_CATEGORIES,
  ALL_ACTIONS,
  usePermissionStore, 
  ModuleActionFlags,
  DEFAULT_ROLE_ACTION_PERMISSIONS
} from "@/store/usePermissionStore"
import { executeWithFeedback } from "@/store/useActionFeedbackStore"
import { getUsers } from "@/features/users/services/userService"
import { UserItem } from "@/features/users/types"

export type Tab = "permissions" | "user-permissions" | "roles" | "custom-roles"

export interface CustomRole { id: string; name: string; description?: string; permissionCount?: number }

export const ACTIONS = [
  { key: "view", label: "View", icon: "👁️" },
  { key: "add", label: "Add", icon: "➕" },
  { key: "edit", label: "Edit", icon: "✏️" },
  { key: "delete", label: "Delete", icon: "🗑️" },
] as const

export const DEFAULT_ROLES_CONFIG = [
  { 
    name: "Super Admin", 
    description: "Full master governance with unrestricted access across all companies and branches", 
    permissionCount: 4 * CONFIGURABLE_MODULES.length,
    badge: "Master Access",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800"
  },
  { 
    name: "Admin", 
    description: "Administrative access to configure and manage operational modules and team records", 
    permissionCount: 4 * CONFIGURABLE_MODULES.length,
    badge: "Full Admin",
    badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800"
  },
  { 
    name: "Teams", 
    description: "Operational staff executing assigned daily CRM telecalling, projects, tasks & records", 
    permissionCount: 3 * CONFIGURABLE_MODULES.length,
    badge: "Operational",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800"
  },
  { 
    name: "Clients", 
    description: "Restricted client portal access to digital proposals, milestones, tickets & invoices", 
    permissionCount: 15,
    badge: "Client Portal",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
  },
]
