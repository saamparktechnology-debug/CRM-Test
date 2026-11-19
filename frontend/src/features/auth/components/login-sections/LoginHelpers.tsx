"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { 
  Lock, Mail, CheckCircle2, Eye, EyeOff, 
  KeyRound, X, RefreshCw, Loader2, Check,
  ShieldCheck, ArrowRight, User as UserIcon,
  Sparkles, AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { useAuthStore, DEMO_USERS, Role } from "@/store/useAuthStore"
import { recordUserAccount, getStoredUserAccountsAsync, unmarkUserAsDeleted } from "@/features/users/services/userService"
import { UserItem } from "@/features/users/types"
import { fetchModuleDataFromDB, isGlobalItemDeleted, getLocalDeletedIds } from "@/lib/storageSync"
import { normalizeRole } from "@/store/usePermissionStore"
import { AuthService } from "@/services/apiServices"

export type ForgotStep = "email" | "otp" | "newpass" | "done"

export type LoginMode = "password" | "pin"

export interface SavedUser {
  email: string
  name: string
  avatar?: string
  role?: string
  hasPin?: boolean
}

export function OTPInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const refs = Array.from({ length: 6 }, () => React.useRef<HTMLInputElement>(null))
  const digits = value.padEnd(6, " ").split("").slice(0, 6)

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    const el = e.currentTarget
    if (e.key === "Backspace") {
      if (el.value === "" && i > 0) refs[i - 1].current?.focus()
    }
  }

  const handleChange = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, "").slice(-1)
    const arr = value.padEnd(6, " ").split("")
    arr[i] = v || " "
    onChange(arr.join("").trimEnd())
    if (v && i < 5) refs[i + 1].current?.focus()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    onChange(pasted)
    const nextIndex = Math.min(pasted.length, 5)
    refs[nextIndex].current?.focus()
  }

  return (
    <div className="flex gap-2 justify-center">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={refs[i]}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d.trim()}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKey(i, e)}
          onPaste={handlePaste}
          className="w-11 h-13 text-center text-xl font-bold rounded-xl border-2 bg-surface border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground transition-all"
          style={{ caretColor: "transparent" }}
        />
      ))}
    </div>
  )
}

export function PINInput({
  value,
  onChange,
  onComplete,
  disabled = false,
  autoFocus = true,
}: {
  value: string
  onChange: (v: string) => void
  onComplete?: (v: string) => void
  disabled?: boolean
  autoFocus?: boolean
}) {
  const refs = Array.from({ length: 4 }, () => React.useRef<HTMLInputElement>(null))
  const digits = value.padEnd(4, " ").split("").slice(0, 4)

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[i].trim() && i > 0) {
        refs[i - 1].current?.focus()
      }
    }
  }

  const handleChange = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, "").slice(-1)
    const arr = value.padEnd(4, " ").split("").slice(0, 4)
    arr[i] = v || " "
    const nextVal = arr.join("").trimEnd()
    onChange(nextVal)
    if (v && i < 3) {
      refs[i + 1].current?.focus()
    }
    const cleanDigits = nextVal.replace(/\s/g, "")
    if (v && i === 3 && cleanDigits.length === 4) {
      onComplete?.(cleanDigits)
    }
  }

  return (
    <div className="flex gap-3 justify-center my-3">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={refs[i]}
          type="password"
          inputMode="numeric"
          maxLength={1}
          disabled={disabled}
          value={d.trim()}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKey(i, e)}
          className="w-13 h-15 text-center text-2xl font-black rounded-2xl border-2 bg-surface/90 border-border focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20 text-foreground transition-all shadow-sm"
          autoFocus={autoFocus && i === 0}
        />
      ))}
    </div>
  )
}

export function evaluatePasswordPolicy(password: string) {
  return {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  }
}
