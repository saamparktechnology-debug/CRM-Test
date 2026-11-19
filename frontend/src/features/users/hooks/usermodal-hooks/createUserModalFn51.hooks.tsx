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
import { UserModalSection1 } from "@/features/users/components/usermodal-sections/UserModalSection1"
import { UserModalSection2 } from "@/features/users/components/usermodal-sections/UserModalSection2"
import { UserModalSection3 } from "@/features/users/components/usermodal-sections/UserModalSection3"
import { createUserModalHandler1 } from "@/features/users/hooks/usermodal-hooks/createUserModalHandler1.hooks"
import { type UserModalProps, MODULE_CATEGORIES, DEPARTMENT_SUGGESTIONS } from "@/features/users/components/usermodal-sections/UserModalHelpers"

export function createUserModalFn51(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { setActionMatrix, setAllowedModules } = getCtrl();
    const __fn: any = (presetType: "full" | "viewOnly" | "clientPortal" | "salesCRM" | "finance" | "revoke") => {
    const nextMatrix: Record<string, ModuleActionFlags> = {}

    CONFIGURABLE_MODULES.forEach((m) => {
      if (presetType === "full") {
        nextMatrix[m] = { view: true, add: true, edit: true, delete: true }
      } else if (presetType === "viewOnly") {
        nextMatrix[m] = { view: true, add: false, edit: false, delete: false }
      } else if (presetType === "revoke") {
        nextMatrix[m] = { view: false, add: false, edit: false, delete: false }
      } else if (presetType === "clientPortal") {
        const clientMods: ModuleName[] = ["Projects", "Invoices", "Subscriptions", "EMI", "Tickets", "Files", "Messages", "Quotations"] as ModuleName[]
        const isClientMod = clientMods.includes(m as ModuleName)
        nextMatrix[m] = isClientMod ? { view: true, add: m === "Tickets" || m === "Messages", edit: false, delete: false } : { view: false, add: false, edit: false, delete: false }
      } else if (presetType === "salesCRM") {
        const salesMods: ModuleName[] = ["Leads", "Clients", "Quotations", "Estimates", "Sales Orders", "Invoices", "Digital Marketing", "Tasks", "Messages", "Events"] as ModuleName[]
        const isSalesMod = salesMods.includes(m as ModuleName)
        nextMatrix[m] = isSalesMod ? { view: true, add: true, edit: true, delete: false } : { view: false, add: false, edit: false, delete: false }
      } else if (presetType === "finance") {
        const finMods: ModuleName[] = ["Invoices", "Payments", "Estimates", "Expenses", "Subscriptions", "EMI", "Credit Notes", "Debit Notes", "Reports"] as ModuleName[]
        const isFinMod = finMods.includes(m as ModuleName)
        nextMatrix[m] = isFinMod ? { view: true, add: true, edit: true, delete: false } : { view: false, add: false, edit: false, delete: false }
      }
    })

    setActionMatrix(nextMatrix)
    setAllowedModules(CONFIGURABLE_MODULES.filter(m => {
      const flags = nextMatrix[m]
      return flags ? (flags.view || flags.add || flags.edit || flags.delete) : false
    }))
  };
    return __fn(...__args);
  };
}
