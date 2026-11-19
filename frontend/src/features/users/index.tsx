"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Users as UsersIcon, UserPlus, ShieldCheck, UserCheck, Briefcase, Download, CheckCircle2, AlertTriangle, X, Mail, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/Button"
import { useAuthStore, isMatchingCompany, isMatchingBranch } from "@/store/useAuthStore"
import { UserItem, UserStatus } from "./types"
import { recordUserAccount } from "./services/userService"
import { useDeleteUserMutation, useUsersQuery, USERS_QUERY_KEY } from "./hooks/useUsers"
import { useQueryClient } from "@tanstack/react-query"
import { saveModuleDataToDB } from "@/lib/storageSync"
import { UserList } from "./components/UserList"
import { UserModal } from "./components/UserModal"
import { UserOverviewModal } from "./components/UserOverviewModal"

import { usePermissionStore } from "@/store/usePermissionStore"
import { ThreeDotLoader } from "@/components/ui/ThreeDotLoader"
import { UsersSection1 } from "@/features/users/components/users-sections/UsersSection1"
import { createUsersHandler1 } from "@/features/users/hooks/users-hooks/createUsersHandler1.hooks"


export default function UsersMain() {
  const __ctrlRef = React.useRef<any>({});
  let __ctrl: any = {};

  const router = useRouter()
  const { activeCompanyId, activeBranchId, activeSubBranchId, branches, subBranches, companies, user } = useAuthStore()
  const { canPerformAction } = usePermissionStore()

  const canAddUser = user?.role === "Super Admin" || canPerformAction(user, "Users", "add")

  const queryClient = useQueryClient()
  const { data: users = [], isLoading, refetch: refetchUsers } = useUsersQuery()
  const deleteUserMutation = useDeleteUserMutation()
  const loadUsers = React.useCallback(async () => { await refetchUsers() }, [refetchUsers])
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [editingUser, setEditingUser] = React.useState<UserItem | null>(null)
  const [selectedUserForOverview, setSelectedUserForOverview] = React.useState<UserItem | null>(null)
  const [isOverviewModalOpen, setIsOverviewModalOpen] = React.useState(false)
  

  // Success / Failure Feedback Popup Modal State
  const [statusModalState, setStatusModalState] = React.useState<{
    isOpen: boolean
    type: "success" | "failed"
    title: string
    message: string
    details?: { oldEmail?: string; newEmail?: string }
  }>({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  })

  const isSuperAdminLoggedIn = user?.role === "Super Admin"

  

  // Strictly isolate visible users based on active company, branch, and sub-branch
  const isClientRole = user?.role === "Clients" || (user?.role as string) === "Client"
  const visibleUsers = React.useMemo(() => {
    if (isClientRole && user) {
      const uId = String(user.id || "").toLowerCase().trim()
      const uEmail = (user.email || "").toLowerCase().trim()
      return users.filter((u) => {
        const uid = String(u.id || "").toLowerCase().trim()
        const uClientId = String((u as any).clientId || (u as any).createdById || "").toLowerCase().trim()
        const uClientEmail = String((u as any).clientEmail || (u as any).createdByEmail || "").toLowerCase().trim()
        return (uid === uId) || (uId && uClientId === uId) || (uEmail && uClientEmail === uEmail)
      })
    }

    const targetComp = (activeCompanyId || (isSuperAdminLoggedIn ? "all" : user?.companyId) || "all").toLowerCase().trim()
    const targetBranch = activeBranchId || (isSuperAdminLoggedIn ? "all" : user?.branchId)
    const targetSubBranch = activeSubBranchId || (isSuperAdminLoggedIn ? "all" : (user as any)?.subBranchId)

    let filtered = users

    // Super Admin accounts visibility: Only visible if Super Admin is logged in
    if (!isSuperAdminLoggedIn) {
      filtered = filtered.filter((u) => u.role !== "Super Admin")
    }

    // 1. Strict Company Filter
    if (targetComp && targetComp !== "all") {
      filtered = filtered.filter((u) => {
        const rawCompList = (u.companyIds && u.companyIds.length > 0)
          ? u.companyIds
          : (u.companyId ? [u.companyId] : ["tech"])

        if (rawCompList.some(id => String(id).toLowerCase().trim() === "all")) return true

        return rawCompList.some(id => {
          const strId = String(id).toLowerCase().trim()
          return strId === targetComp || 
                 isMatchingCompany({ id: strId, slug: strId } as any, targetComp) ||
                 (u.companyId && isMatchingCompany({ id: u.companyId, slug: u.companyId } as any, targetComp))
        })
      })
    }

    // 2. Strict Branch Filter (Show ONLY users assigned to this branch, but keep Admins/Super Admins visible)
    if (targetBranch && targetBranch !== "all") {
      const targetBranchObj = branches.find(b => b.id === targetBranch || b.name.toLowerCase() === targetBranch.toLowerCase())
      const targetBranchId = String(targetBranchObj?.id || targetBranch).toLowerCase().trim()
      const targetBranchName = targetBranchObj?.name?.toLowerCase().trim() || ""

      filtered = filtered.filter((u) => {
        if (u.role === "Super Admin" || u.role === "Admin") return true

        const uBranchIds = (u.branchIds && u.branchIds.length > 0)
          ? u.branchIds.map(id => String(id).toLowerCase().trim())
          : (u.branchId ? [String(u.branchId).toLowerCase().trim()] : [])
        const uBranchName = String(u.branchName || "").toLowerCase().trim()

        if (uBranchIds.includes("all") || uBranchIds.includes("head-office")) return true

        // Strict separation: users with no branch assigned do not belong to a specific branch filter
        if (uBranchIds.length === 0 && !uBranchName) {
          return false
        }

        return (
          uBranchIds.includes(targetBranchId) ||
          (targetBranchName && uBranchIds.includes(targetBranchName)) ||
          String(u.branchId || "").toLowerCase().trim() === targetBranchId ||
          (targetBranchName && (uBranchName === targetBranchName || String(u.branchId || "").toLowerCase().trim() === targetBranchName))
        )
      })
    }

    // 3. Strict Sub-Branch Filter (Show ONLY users assigned to this sub-branch, but keep Admins/Super Admins visible)
    if (targetSubBranch && targetSubBranch !== "all") {
      const targetSubBranchObj = subBranches.find(sb => sb.id === targetSubBranch || sb.name.toLowerCase() === targetSubBranch.toLowerCase())
      const targetSubBranchId = String(targetSubBranchObj?.id || targetSubBranch).toLowerCase().trim()
      const targetSubBranchName = targetSubBranchObj?.name?.toLowerCase().trim() || ""

      filtered = filtered.filter((u) => {
        if (u.role === "Super Admin" || u.role === "Admin") return true

        const uSubIds = (u.subBranchIds && u.subBranchIds.length > 0)
          ? u.subBranchIds.map(id => String(id).toLowerCase().trim())
          : (u.subBranchId ? [String(u.subBranchId).toLowerCase().trim()] : [])
        const uSubName = String(u.subBranchName || "").toLowerCase().trim()

        if (uSubIds.includes("all") || uSubIds.includes("head-office")) return true

        // Strict separation: users with no sub-branch assigned do not belong to this sub-branch
        if (uSubIds.length === 0 && !uSubName) {
          return false
        }

        return (
          uSubIds.includes(targetSubBranchId) ||
          (targetSubBranchName && uSubIds.includes(targetSubBranchName)) ||
          String(u.subBranchId || "").toLowerCase().trim() === targetSubBranchId ||
          (targetSubBranchName && (uSubName === targetSubBranchName || String(u.subBranchId || "").toLowerCase().trim() === targetSubBranchName))
        )
      })
    }

    return filtered
  }, [users, isSuperAdminLoggedIn, isClientRole, user, activeCompanyId, activeBranchId, activeSubBranchId, branches, subBranches, companies])

  // Metric counts based on visible users
  const totalUsers = visibleUsers.length
  const totalAdmins = visibleUsers.filter((u) => u.role === "Super Admin" || u.role === "Admin").length
  const totalTeams = visibleUsers.filter((u) => u.role === "Teams").length
  const totalClients = visibleUsers.filter((u) => u.role === "Clients").length

  const handleOpenCreateModal = () => {
    setEditingUser(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (userItem: UserItem) => {
    setEditingUser(userItem)
    setIsModalOpen(true)
  }

  const handleSaveUser: any = createUsersHandler1(() => __ctrlRef.current);

  const handleToggleStatus = async (id: string) => {
    try {
      const { UserService } = await import("@/services/apiServices")
      await UserService.toggleStatus(id).catch((err) => console.warn("Status toggle warning:", err))
    } catch {}

    queryClient.setQueryData<UserItem[]>(USERS_QUERY_KEY, (prev = []) => {
      const updatedList: UserItem[] = prev.map((u) => {
        if (u.id === id) {
          const nextStatus: UserStatus = u.status === "Active" ? "Inactive" : "Active"
          const updatedUser: UserItem = { ...u, status: nextStatus }
          recordUserAccount(updatedUser, false)

          if (nextStatus === "Inactive") {
            const inactiveEmail = u.email.toLowerCase().trim()
            localStorage.setItem("saampark_session_revoked", `${inactiveEmail}_inactive_${Date.now()}`)
            window.dispatchEvent(new CustomEvent("saampark_session_revoked", { detail: { email: inactiveEmail, reason: "inactive" } }))
          }

          return updatedUser
        }
        return u
      })
      saveModuleDataToDB("users", updatedList, "all")
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("storage"))
      }
      return updatedList
    })
  }


  const handleDeleteUser = async (id: string) => {
    const targetUser = users.find((u) => u.id === id)
    const targetEmail = targetUser?.email
    if (targetEmail && (targetEmail.toLowerCase().trim() === "saampark.official@gmail.com" || targetEmail.toLowerCase().trim() === "saampark.official")) {
      alert("Primary Root Super Admin account cannot be deleted.")
      return
    }

    queryClient.setQueryData<UserItem[]>(USERS_QUERY_KEY, (prev = []) => prev.filter((u) => u.id !== id && (!targetEmail || u.email.toLowerCase().trim() !== targetEmail.toLowerCase().trim())))

    await deleteUserMutation.mutateAsync(id)
  }

  
  __ctrl = { router, activeCompanyId, activeBranchId, activeSubBranchId, branches, subBranches, companies, user, canPerformAction, canAddUser, queryClient, users, isLoading, refetchUsers, deleteUserMutation, loadUsers, isModalOpen, setIsModalOpen, editingUser, setEditingUser, selectedUserForOverview, setSelectedUserForOverview, isOverviewModalOpen, setIsOverviewModalOpen, statusModalState, setStatusModalState, isSuperAdminLoggedIn, isClientRole, visibleUsers, totalUsers, totalAdmins, totalTeams, totalClients, handleOpenCreateModal, handleOpenEditModal, handleSaveUser, handleToggleStatus, handleDeleteUser };
  __ctrlRef.current = __ctrl;
return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <UsersSection1 ctrl={__ctrl} />
    </motion.div>
  )
}
