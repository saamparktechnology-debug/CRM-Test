"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  X, Check, Users, Mail, ArrowRight, ArrowLeft, Send, Sparkles, 
  Building2, Calendar, FileText, CheckSquare, Search, AlertCircle, Shield
} from "lucide-react"
import { useAuthStore, getCompanyFullName, getCompanyLogoUrl } from "@/store/useAuthStore"
import { getUsers } from "@/features/users/services/userService"
import { getClients } from "@/features/clients/services/clientService"
import { createAndSendLetter } from "@/features/letters/services/letterService"
import { LetterRecord, LetterType, LetterRecipient, LetterCustomFields } from "@/features/letters/types"

export interface LetterComposerModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export const TEMPLATES: { type: LetterType; label: string; desc: string; icon: string }[] = [
  { type: "offer_letter", label: "Offer Letter", desc: "Employment offer with CTC, role, and joining date", icon: "💼" },
  { type: "office_close", label: "Office Close / Holiday Notice", desc: "Scheduled holiday, maintenance, or emergency closure notice", icon: "🏢" },
  { type: "appointment", label: "Appointment Letter", desc: "Formal appointment confirmation and terms", icon: "📜" },
  { type: "experience", label: "Experience / Relieving Letter", desc: "Service completion and conduct certificate", icon: "🎓" },
  { type: "warning", label: "Warning / Disciplinary Notice", desc: "Formal policy adherence or performance warning", icon: "⚠️" },
  { type: "announcement", label: "General Announcement / Circular", desc: "Company-wide or client circular update", icon: "📢" },
  { type: "custom", label: "Custom Blank Letter", desc: "Free-form official letterhead document", icon: "✍️" },
]
