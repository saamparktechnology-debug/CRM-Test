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
import { type UserModalProps, MODULE_CATEGORIES, DEPARTMENT_SUGGESTIONS } from "@/features/users/components/usermodal-sections/UserModalHelpers"

export function createUserModalHandler1(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { name, setActiveTab, email, editingUser, password, isEditingRootSuperAdmin, isRootSuperAdminEmail, role, selectedCompanyId, targetCompanyObj, companies, subBranches, branches, scopeType, selectedSubBranchId, activeSubBranchId, selectedBranchId, activeBranchId, status, department, phone, avatarUrl, kycStatus, joiningDate, employeeId, designation, ctc, autoSendOfferLetter, allowedModules, actionMatrix, commissionRate, onSave, onClose } = getCtrl();
    const __fn: any = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setActiveTab("profile")
      alert("Please enter the user full name.")
      return
    }
    if (!email.trim()) {
      setActiveTab("profile")
      alert("Please enter the user email address.")
      return
    }
    if (!editingUser && !password.trim()) {
      setActiveTab("profile")
      alert("Please enter or generate a password.")
      return
    }

    const finalRoleToSave: UserRole = (isEditingRootSuperAdmin || isRootSuperAdminEmail(email)) ? "Super Admin" : role
    const isAllCompanies = selectedCompanyId === "all" || finalRoleToSave === "Super Admin"
    const canonCompId = isAllCompanies ? "all" : (targetCompanyObj?.id || targetCompanyObj?.slug || selectedCompanyId || "tech")
    const allCompIds = companies && companies.length > 0 ? companies.map(c => c.id || c.slug).filter(Boolean) as string[] : ["tech", "digital", "saampark-ai-solutions"]
    const companyIds = isAllCompanies ? allCompIds : [canonCompId]
    const companyNameToSave = isAllCompanies ? "SAAMPARK Group (All Companies)" : getCompanyFullName(targetCompanyObj)

    const safeSubBranches = Array.isArray(subBranches) ? subBranches : []
    const safeBranches = Array.isArray(branches) ? branches : []

    const effectiveSubBranchId = scopeType === "subbranch" ? (selectedSubBranchId || activeSubBranchId || undefined) : undefined
    const matchedSubBranch = effectiveSubBranchId ? safeSubBranches.find(sb => String(sb.id) === String(effectiveSubBranchId) || String(sb.name || (sb as any).sub_branch_name || '').toLowerCase() === String(effectiveSubBranchId).toLowerCase()) : undefined
    const subBranchNameToSave = matchedSubBranch?.name || (effectiveSubBranchId ? (isNaN(Number(effectiveSubBranchId)) ? effectiveSubBranchId : `Sub-Branch (${effectiveSubBranchId})`) : undefined)

    const effectiveBranchId = scopeType === "subbranch"
      ? (selectedBranchId || matchedSubBranch?.parentBranchId || undefined)
      : (scopeType === "branch" ? (selectedBranchId || activeBranchId || undefined) : undefined)

    const matchedBranch = effectiveBranchId ? safeBranches.find(b => String(b.id) === String(effectiveBranchId) || String(b.name || (b as any).branch_name || '').toLowerCase() === String(effectiveBranchId).toLowerCase()) : undefined
    const branchNameToSave = matchedBranch?.name || (effectiveBranchId ? (isNaN(Number(effectiveBranchId)) ? effectiveBranchId : `Branch (${effectiveBranchId})`) : undefined)

    const finalStatus: UserStatus = (finalRoleToSave === "Super Admin" || role === "Super Admin") ? "Active" : status

    const userData: Partial<UserType> = {
      ...(editingUser ? { id: editingUser.id } : {}),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: finalRoleToSave,
      companyId: canonCompId,
      companyIds,
      companyName: companyNameToSave,
      branchId: effectiveBranchId || undefined,
      branchIds: effectiveBranchId ? [effectiveBranchId] : undefined,
      branchName: branchNameToSave || undefined,
      subBranchId: effectiveSubBranchId || undefined,
      subBranchIds: effectiveSubBranchId ? [effectiveSubBranchId] : undefined,
      subBranchName: subBranchNameToSave || undefined,
      department: department.trim() || (role === "Clients" ? "Client Accounts" : "General"),
      phone: phone.trim(),
      ...(editingUser
        ? (password.trim() ? { password: password.trim() } : (editingUser.password ? { password: editingUser.password } : {}))
        : { password: password.trim() || "Password123" }),
      status: finalStatus,
      avatarUrl: avatarUrl || undefined,
      kycStatus: role === "Clients" ? undefined : kycStatus,
      joinedDate: joiningDate || editingUser?.joinedDate || new Date().toISOString().split("T")[0],
      employeeId: employeeId.trim() || editingUser?.employeeId || undefined,
      designation: designation.trim() || (role === "Teams" ? "Technical Specialist" : undefined),
      ctc: ctc.trim() || undefined,
      offerLetterSentAt: (!editingUser && autoSendOfferLetter) ? new Date().toISOString() : editingUser?.offerLetterSentAt,
      allowedModules,
      permissions: {
        allowedModules,
        actionMatrix,
      },
      ...((role === "Teams" && designation) ? { designation: designation.trim() } : {}),
      ...((role === "Teams" && commissionRate) ? { commissionRate: commissionRate.trim() } : {}),
    }

    if (!editingUser && autoSendOfferLetter && email.trim()) {
      const isClient = role === "Clients"
      createNotification({
        title: isClient ? `Welcome to ${companyNameToSave} - Client Portal Access` : `Welcome to ${companyNameToSave} - Account Credentials`,
        message: isClient
          ? `Welcome to ${companyNameToSave}! Your client portal access has been created. Email: ${email.trim()}, Temporary Password: ${password.trim() || 'Password123'}. You can now view your projects, invoices, and estimates.`
          : `Welcome to ${companyNameToSave}! Your team login credentials have been issued. Email: ${email.trim()}, Temporary Password: ${password.trim() || 'Password123'}. Please log in, configure your 4-digit security PIN, and submit your KYC documents for approval.`,
        type: "system",
        targetEmail: email.trim().toLowerCase(),
        sendEmailNotification: false, // Official credentials email is dispatched directly by backend /users service
      }).catch(console.warn)
    }

    onSave(userData)
    onClose()
  };
    return __fn(...__args);
  };
}
