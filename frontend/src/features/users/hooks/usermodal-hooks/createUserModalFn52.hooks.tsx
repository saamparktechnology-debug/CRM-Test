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

export function createUserModalFn52(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { actionMatrix, setActionMatrix, setAllowedModules, allowedModules } = getCtrl();
    const __fn: any = (mod: ModuleName, actionKey: keyof ModuleActionFlags, checked: boolean) => {
    const currentFlags = actionMatrix[mod] || { view: false, add: false, edit: false, delete: false }
    const updatedFlags = { ...currentFlags, [actionKey]: checked }

    if (actionKey === "view" && !checked) {
      updatedFlags.add = false
      updatedFlags.edit = false
      updatedFlags.delete = false
    }
    if ((actionKey === "add" || actionKey === "edit" || actionKey === "delete") && checked) {
      updatedFlags.view = true
    }

    const nextMatrix = { ...actionMatrix, [mod]: updatedFlags }
    setActionMatrix(nextMatrix)

    const hasAnyChecked = updatedFlags.view || updatedFlags.add || updatedFlags.edit || updatedFlags.delete
    if (!hasAnyChecked) {
      setAllowedModules(allowedModules.filter((m) => m !== mod))
    } else if (!allowedModules.includes(mod)) {
      setAllowedModules([...allowedModules, mod])
    }
  };
    return __fn(...__args);
  };
}
