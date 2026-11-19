"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Clock, Plus, Search, Calendar, CheckCircle2, AlertCircle, 
  Users, Monitor, Building2, MapPin, X, Trash2, Edit2, Play, Square,
  Filter, Download, ChevronDown, Coffee, Briefcase, Home, Navigation,
  Printer, ShieldCheck, Check, Sparkles, AlertTriangle, ArrowUpRight
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useAuthStore, getCompanyFullName, isMatchingCompany } from "@/store/useAuthStore"
import { useTimerStore, WorkMode } from "@/store/useTimerStore"
import { fetchModuleDataFromDB, saveModuleDataToDB, filterGlobalDeletedItems } from "@/lib/storageSync"
import { getUsers, getUserAvatar } from "@/features/users/services/userService"
import MonthlyAttendanceMatrix from "@/features/attendance/components/MonthlyAttendanceMatrix"

export interface TimeCardRecord {
  id: string
  userId?: string
  memberName: string
  memberEmail: string
  memberRole?: string
  memberAvatar?: string
  companyId: string
  branchName?: string
  subBranchName?: string
  workMode?: WorkMode
  inDate: string
  inTime: string
  outDate?: string
  outTime?: string
  breakDurationMins?: number
  durationSecs: number
  status: "Active Shift" | "Completed" | "Late" | "Half Day" | "On Break" | "Overtime"
  isVerified?: boolean
  notes?: string
}
