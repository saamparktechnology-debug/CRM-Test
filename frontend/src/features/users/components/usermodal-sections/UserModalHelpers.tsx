"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  X, User, Mail, Shield, Building, Phone, Lock, UserCheck, ShieldCheck, 
  Check, Info, Crown, MapPin, Eye, EyeOff, Sparkles, RefreshCw, Search,
  Briefcase, Percent, ChevronDown, ChevronRight, CheckCircle2, Layers,
  Globe, Radio, ShieldAlert, KeyRound, ArrowRight, CheckSquare, Square
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { UserItem as UserType, UserRole, UserStatus } from "@/features/users/types"
import { generateCompanyEmployeeId, getStoredUserAccountsAsync } from "@/features/users/services/userService"
import { useAuthStore, isMatchingCompany, getCompanyFullName } from "@/store/useAuthStore"
import { 
  usePermissionStore, 
  CONFIGURABLE_MODULES, 
  ModuleName, 
  ModuleActionFlags, 
  DEFAULT_FULL_ACTIONS, 
  DEFAULT_VIEW_ONLY_ACTIONS, 
  MODULE_ACTION_CONFIG,
  normalizeRole, 
  DEFAULT_ROLE_PERMISSIONS,
  DEFAULT_ROLE_ACTION_PERMISSIONS
} from "@/store/usePermissionStore"
import { createNotification } from "@/services/notificationService"

export interface UserModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (user: Partial<UserType>) => void
  editingUser?: UserType | null
  initialRole?: UserRole
}

export const MODULE_CATEGORIES: { name: string; icon: string; modules: ModuleName[] }[] = [
  {
    name: "Sales & Financial Suite",
    icon: "💰",
    modules: [
      "Invoices", "Quotations", "Estimates", "Sales Orders", "Payments", 
      "Credit Notes", "Debit Notes", "Subscriptions", "EMI", "Services & Store"
    ] as ModuleName[],
  },
  {
    name: "CRM & Client Engagement",
    icon: "🤝",
    modules: [
      "Leads", "Clients", "Messages", "Tickets", "Events", "Notes"
    ] as ModuleName[],
  },
  {
    name: "Digital Marketing & Campaigns",
    icon: "📢",
    modules: [
      "Digital Marketing"
    ] as ModuleName[],
  },
  {
    name: "Projects & Operations",
    icon: "🚀",
    modules: [
      "Projects", "Tasks", "Files", "Expenses", "Knowledge base"
    ] as ModuleName[],
  },
  {
    name: "HR, Analytics & Admin",
    icon: "🏢",
    modules: [
      "Teams", "Attendance", "Leave", "Payroll", "Reports", "Companies", "Branches", "Departments", "Settings", "Activity Logs"
    ] as ModuleName[],
  },
]

export const DEPARTMENT_SUGGESTIONS = [
  "Sales & Marketing",
  "Software Development",
  "Accounts & Finance",
  "Customer Support",
  "Design & Creative",
  "Operations",
  "Executive Management",
  "Human Resources",
]
