"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ChevronLeft, ChevronRight, Search, Download, Filter, 
  Calendar, CheckCircle2, Clock, AlertCircle, XCircle, 
  PlaneTakeoff, Sparkles, Coffee, RefreshCw, UserCheck, 
  Building2, MapPin, Eye, FileSpreadsheet
} from "lucide-react"
import { useAuthStore, isMatchingCompany, getCanonicalCompanyId } from "@/store/useAuthStore"
import { fetchModuleDataFromDB, filterGlobalDeletedItems } from "@/lib/storageSync"
import { LeaveService } from "@/services/hrService"
import { getUsers, getUserAvatar } from "@/features/users/services/userService"
import { TimeCardRecord } from "@/features/team-timecards"
import { EmployeeMonthlyAttendance, DayPunchDetail, AttendanceDayStatus } from "@/features/attendance/types"
import AttendanceTypeLegend from "@/features/attendance/components/AttendanceTypeLegend"
import AttendanceSummaryCards from "@/features/attendance/components/AttendanceSummaryCards"
import DayPunchModal from "@/features/attendance/components/DayPunchModal"
import { Button } from "@/components/ui/Button"

export const STANDARD_HOLIDAYS: Record<string, string> = {
  "01-01": "New Year's Day",
  "01-26": "Republic Day",
  "05-01": "May Day",
  "08-15": "Independence Day",
  "10-02": "Gandhi Jayanti",
  "10-24": "Dussehra",
  "11-01": "Diwali Festival",
  "11-15": "Guru Nanak Jayanti",
  "12-25": "Christmas Day"
}
