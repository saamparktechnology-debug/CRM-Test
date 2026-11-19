"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  X, 
  Shield, 
  Check, 
  RotateCcw, 
  Save, 
  Loader2, 
  Search, 
  Layers, 
  CheckCheck, 
  UserCheck, 
  Crown
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { UserItem } from "@/features/users/types"
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
import { recordActivityLog } from "@/services/activityLogService"

export const ACTIONS = [
  { key: "view", label: "View", icon: "👁️" },
  { key: "add", label: "Add", icon: "➕" },
  { key: "edit", label: "Edit", icon: "✏️" },
  { key: "delete", label: "Delete", icon: "🗑️" },
] as const

export interface UserPermissionsModalProps {
  isOpen: boolean
  onClose: () => void
  user: UserItem | null
  onSaved?: () => void
}
