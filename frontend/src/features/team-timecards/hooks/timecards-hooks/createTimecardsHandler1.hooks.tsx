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
import { type TimeCardRecord } from "@/features/team-timecards/components/timecards-sections/TimecardsHelpers"

export function createTimecardsHandler1(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { manualForm, teamMembers, activeCompanyId, user, editingCardId, timecards, setTimecards, setIsAddModalOpen, setEditingCardId, setManualForm } = getCtrl();
    const __fn: any = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualForm.memberEmail) return

    const memberObj = teamMembers.find(m => m.email.toLowerCase() === manualForm.memberEmail.toLowerCase()) || {
      name: manualForm.memberEmail.split("@")[0],
      email: manualForm.memberEmail,
      role: "Teams",
      companyId: activeCompanyId || "tech"
    }

    // Calculate duration in seconds (net after breaks)
    const [inH, inM] = manualForm.inTime.split(":").map(Number)
    const [outH, outM] = manualForm.outTime.split(":").map(Number)
    let totalMins = (outH * 60 + outM) - (inH * 60 + inM)
    if (totalMins < 0) totalMins += 24 * 60
    totalMins = Math.max(0, totalMins - (manualForm.breakMins || 0))

    const effectiveCompanyId = (activeCompanyId && activeCompanyId !== "all") 
      ? activeCompanyId 
      : (memberObj.companyId || user?.companyId || "tech")

    if (editingCardId) {
      const updated = timecards.map(tc => {
        if (tc.id === editingCardId) {
          return {
            ...tc,
            memberName: memberObj.name || manualForm.memberEmail,
            memberEmail: manualForm.memberEmail,
            workMode: manualForm.workMode,
            inDate: manualForm.date,
            inTime: manualForm.inTime,
            outDate: manualForm.date,
            outTime: manualForm.outTime,
            breakDurationMins: manualForm.breakMins,
            durationSecs: totalMins * 60,
            status: manualForm.status,
            notes: manualForm.notes || "Updated by administrator"
          }
        }
        return tc
      })
      setTimecards(updated)
      await saveModuleDataToDB("timecards", updated, "all").catch(() => {})
    } else {
      const newCard: TimeCardRecord = {
        id: `tc_manual_${Date.now()}`,
        userId: String(memberObj.id || ""),
        memberName: memberObj.name || manualForm.memberEmail,
        memberEmail: manualForm.memberEmail,
        memberRole: memberObj.role || "Teams",
        memberAvatar: memberObj.avatar || memberObj.avatarUrl || getUserAvatar(memberObj.name, undefined, memberObj.name),
        companyId: effectiveCompanyId,
        branchName: memberObj.branchName || "Main HQ",
        workMode: manualForm.workMode,
        inDate: manualForm.date,
        inTime: manualForm.inTime,
        outDate: manualForm.date,
        outTime: manualForm.outTime,
        breakDurationMins: manualForm.breakMins,
        durationSecs: totalMins * 60,
        status: manualForm.status,
        isVerified: true,
        notes: manualForm.notes || "Manually recorded by administrator"
      }
      const updated = [newCard, ...timecards]
      setTimecards(updated)
      await saveModuleDataToDB("timecards", updated, "all").catch(() => {})
    }

    setIsAddModalOpen(false)
    setEditingCardId(null)
    setManualForm({
      memberEmail: "",
      date: new Date().toISOString().split("T")[0],
      inTime: "09:30",
      outTime: "18:30",
      workMode: "Office",
      breakMins: 45,
      status: "Completed",
      notes: ""
    })
  };
    return __fn(...__args);
  };
}
