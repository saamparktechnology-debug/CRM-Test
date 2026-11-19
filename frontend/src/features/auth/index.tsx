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
import { LoginSection1 } from "@/features/auth/components/login-sections/LoginSection1"
import { LoginSection2 } from "@/features/auth/components/login-sections/LoginSection2"
import { LoginSection3 } from "@/features/auth/components/login-sections/LoginSection3"
import { createLoginHandler1 } from "@/features/auth/hooks/login-hooks/createLoginHandler1.hooks"


import { type ForgotStep, type LoginMode, type SavedUser, OTPInput, PINInput, evaluatePasswordPolicy } from "@/features/auth/components/login-sections/LoginHelpers"
export * from "@/features/auth/components/login-sections/LoginHelpers"

// ─── Main Login Page ───────────────────────────────────────────────────────────
export default function LoginPage() {
  const __ctrlRef = React.useRef<any>({});
  let __ctrl: any = {};

  const router = useRouter()
  const { loginAs } = useAuthStore()

  const [savedUser, setSavedUser] = React.useState<SavedUser | null>(null)
  const [loginMode, setLoginMode] = React.useState<LoginMode>("password")

  // Password Login State
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [success, setSuccess] = React.useState(false)
  const [successMessage, setSuccessMessage] = React.useState("")

  // Quick PIN Login State
  const [loginPin, setLoginPin] = React.useState("")
  const [pinLoading, setPinLoading] = React.useState(false)
  const [pinError, setPinError] = React.useState("")

  // First-Time PIN Setup State
  const [isPinSetupOpen, setIsPinSetupOpen] = React.useState(false)
  const [pinSetupData, setPinSetupData] = React.useState<{
    email: string
    name: string
    role: Role
    account: any
    token?: string
  } | null>(null)
  const [pinSetupOTP, setPinSetupOTP] = React.useState("")
  const [pinSetupNewPin, setPinSetupNewPin] = React.useState("")
  const [pinSetupConfirmPin, setPinSetupConfirmPin] = React.useState("")
  const [pinSetupLoading, setPinSetupLoading] = React.useState(false)
  const [pinSetupError, setPinSetupError] = React.useState("")
  const [pinSetupMsg, setPinSetupMsg] = React.useState("")
  const [pinSetupCooldown, setPinSetupCooldown] = React.useState(0)

  // Forgot PIN State
  const [isForgotPinOpen, setIsForgotPinOpen] = React.useState(false)
  const [forgotPinEmail, setForgotPinEmail] = React.useState("")
  const [forgotPinOTP, setForgotPinOTP] = React.useState("")
  const [forgotPinNew, setForgotPinNew] = React.useState("")
  const [forgotPinConfirm, setForgotPinConfirm] = React.useState("")
  const [forgotPinLoading, setForgotPinLoading] = React.useState(false)
  const [forgotPinError, setForgotPinError] = React.useState("")
  const [forgotPinMsg, setForgotPinMsg] = React.useState("")
  const [forgotPinCooldown, setForgotPinCooldown] = React.useState(0)

  // Email Verification OTP State
  const [verifyEmailModal, setVerifyEmailModal] = React.useState(false)
  const [verifyEmail, setVerifyEmail] = React.useState("")
  const [verifyOTP, setVerifyOTP] = React.useState("")
  const [verifyLoading, setVerifyLoading] = React.useState(false)
  const [verifyError, setVerifyError] = React.useState("")
  const [verifySuccess, setVerifySuccess] = React.useState(false)

  // Forgot Password States
  const [isForgotOpen, setIsForgotOpen] = React.useState(false)
  const [forgotStep, setForgotStep] = React.useState<ForgotStep>("email")
  const [forgotEmail, setForgotEmail] = React.useState("")
  const [forgotOTP, setForgotOTP] = React.useState("")
  const [forgotResetToken, setForgotResetToken] = React.useState("")
  const [forgotNewPass, setForgotNewPass] = React.useState("")
  const [forgotConfirmPass, setForgotConfirmPass] = React.useState("")
  const [forgotLoading, setForgotLoading] = React.useState(false)
  const [forgotError, setForgotError] = React.useState("")
  const [forgotMsg, setForgotMsg] = React.useState("")
  const [resendCooldown, setResendCooldown] = React.useState(0)

  // Load Saved User and check inactivity/session notices
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const rawSaved = localStorage.getItem("saampark_last_user")
        if (rawSaved) {
          const parsed: SavedUser = JSON.parse(rawSaved)
          if (parsed && parsed.email) {
            setSavedUser(parsed)
            setEmail(parsed.email)
            if (parsed.hasPin) {
              setLoginMode("pin")
            }
          }
        }
      } catch {}

      const notice = sessionStorage.getItem("saampark_inactive_logout")
      const searchParams = new URLSearchParams(window.location.search)
      const searchParamError = searchParams.get("error")
      const searchParamReason = searchParams.get("reason")

      if (notice || searchParamReason === "inactivity") {
        setError("You were automatically locked out due to inactivity. Enter your 4-digit PIN to quickly resume.")
        sessionStorage.removeItem("saampark_inactive_logout")
      } else if (searchParamReason === "session_expired") {
        setError("Your previous session ended. Please enter your PIN or password to sign in.")
      } else if (searchParamError === "inactive") {
        setError("Your account is on inactive stage, please contact your administration.")
      }
    }
  }, [])

  // Cooldown timers
  React.useEffect(() => {
    if (resendCooldown > 0) {
      const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [resendCooldown])

  React.useEffect(() => {
    if (pinSetupCooldown > 0) {
      const t = setTimeout(() => setPinSetupCooldown((c) => c - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [pinSetupCooldown])

  React.useEffect(() => {
    if (forgotPinCooldown > 0) {
      const t = setTimeout(() => setForgotPinCooldown((c) => c - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [forgotPinCooldown])

  // Helper to commit successful login and redirect
  const completeSuccessfulLogin = (
    matchedRole: Role,
    matchedAccount: any,
    effectiveEmail: string,
    displayName: string,
    backendToken?: string | null,
    hasPin: boolean = false
  ) => {
    // Save last user info in localStorage for next PIN login
    const savedInfo: SavedUser = {
      email: effectiveEmail,
      name: displayName,
      avatar: matchedAccount.avatarUrl || (matchedAccount as any).avatar || matchedAccount.avatar_url,
      role: matchedRole,
      hasPin: hasPin,
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("saampark_last_user", JSON.stringify(savedInfo))
      sessionStorage.removeItem("saampark_inactivity_logout")
      sessionStorage.removeItem("saampark_inactive_logout")
      localStorage.removeItem("saampark_session_revoked")
      if (window.location.search) {
        window.history.replaceState({}, document.title, window.location.pathname)
      }
      sessionStorage.setItem("saampark_session_active", "true")
      localStorage.removeItem("saampark_session_active")
      localStorage.setItem("saampark_last_activity_time", String(Date.now()))
      if (backendToken) {
        localStorage.setItem("saampark_token", backendToken)
      }
    }

    recordUserAccount({ ...matchedAccount, name: displayName, email: effectiveEmail, lastLogin: "Just now" })
    setSuccessMessage(`Welcome back, ${displayName}! 👋`)
    setSuccess(true)

    let parsedCompanyIds: string[] = []
    const rawCompIds = matchedAccount.company_ids || matchedAccount.companyIds || (matchedAccount as any)?.company_ids
    if (typeof rawCompIds === "string") {
      try { parsedCompanyIds = JSON.parse(rawCompIds) } catch { parsedCompanyIds = [rawCompIds] }
    } else if (Array.isArray(rawCompIds)) {
      parsedCompanyIds = rawCompIds
    }
    if (!Array.isArray(parsedCompanyIds) || parsedCompanyIds.length === 0) {
      const fallbackSingle = matchedAccount.companyId || matchedAccount.company_id || "tech"
      parsedCompanyIds = matchedRole === "Super Admin" ? ["tech", "consultancy"] : [fallbackSingle]
    }

    const selectedCompanyId = matchedRole === "Super Admin" ? "all" : (parsedCompanyIds[0] || "tech")

    loginAs(matchedRole, {
      id: String(matchedAccount.sql_id || matchedAccount.id || matchedAccount.email),
      name: displayName,
      email: effectiveEmail,
      username: matchedAccount.username || (!effectiveEmail.includes("@") ? effectiveEmail : undefined),
      role: matchedRole,
      companyId: selectedCompanyId as any,
      companyIds: parsedCompanyIds,
      avatar: matchedAccount.avatarUrl || (matchedAccount as any).avatar || matchedAccount.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${effectiveEmail}`,
      avatarUrl: matchedAccount.avatarUrl || (matchedAccount as any).avatar || matchedAccount.avatar_url || undefined,
      phone: matchedAccount.phone,
      branchId: matchedAccount.branchId || matchedAccount.branch_id || undefined,
      branchName: matchedAccount.branchName || matchedAccount.branch_name || undefined,
      allowedModules: matchedAccount.allowedModules || (matchedAccount as any)?.permissions?.allowedModules,
      permissions: matchedAccount.permissions,
      token: backendToken || undefined,
    } as any)

    setTimeout(() => {
      router.replace("/feature/dashboard")
    }, 500)
  }

  // ─── PIN LOGIN HANDLER ────────────────────────────────────────────────────────
  const handlePinLogin = async (pinValue?: string) => {
    const targetPin = pinValue || loginPin
    if (!targetPin || targetPin.length < 4) {
      setPinError("Please enter your complete 4-digit PIN.")
      return
    }
    const targetEmail = (savedUser?.email || email || "").toLowerCase().trim()
    if (!targetEmail) {
      setPinError("Please enter your email or username.")
      return
    }

    setPinLoading(true)
    setPinError("")

    try {
      const res: any = await AuthService.loginWithPin({
        email: targetEmail,
        identifier: targetEmail,
        pin: targetPin,
      })

      if (res?.data?.user || res?.user) {
        const u = res.data?.user || res.user
        const token = res.data?.token || res.token
        const role = normalizeRole(u.role_name || u.role || "")
        completeSuccessfulLogin(role, u, targetEmail, u.full_name || u.name || targetEmail, token, true)
      } else {
        setPinError(res?.message || "Invalid Security PIN. Please try again.")
        setLoginPin("")
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Invalid Security PIN."
      setPinError(msg)
      setLoginPin("")
    } finally {
      setPinLoading(false)
    }
  }

  // ─── PASSWORD LOGIN HANDLER ──────────────────────────────────────────────────
  const handlePasswordSubmit: any = createLoginHandler1(() => __ctrlRef.current);

  // ─── COMPLETE PIN SETUP (WITH EMAIL OTP) ──────────────────────────────────────
  const handleCompletePinSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pinSetupData) return
    if (pinSetupOTP.length < 6) {
      setPinSetupError("Please enter the 6-digit OTP code sent to your email.")
      return
    }
    if (pinSetupNewPin.length < 4) {
      setPinSetupError("Please enter your new 4-digit PIN.")
      return
    }
    if (pinSetupNewPin !== pinSetupConfirmPin) {
      setPinSetupError("PIN confirmation does not match. Please re-enter.")
      return
    }

    setPinSetupLoading(true)
    setPinSetupError("")

    try {
      await AuthService.setupPin({
        email: pinSetupData.email,
        pin: pinSetupNewPin,
        otp: pinSetupOTP,
      })

      if (typeof window !== "undefined") {
        try {
          const lastUser = JSON.parse(localStorage.getItem("saampark_last_user") || "{}")
          lastUser.hasPin = true
          lastUser.email = pinSetupData.email
          localStorage.setItem("saampark_last_user", JSON.stringify(lastUser))
        } catch {}
      }

      setIsPinSetupOpen(false)
      completeSuccessfulLogin(
        pinSetupData.role,
        { ...pinSetupData.account, hasPin: true, pin_setup_completed: 1 },
        pinSetupData.email,
        pinSetupData.name,
        pinSetupData.token,
        true
      )
    } catch (err: any) {
      setPinSetupError(err?.response?.data?.message || "Verification code is invalid or expired.")
    } finally {
      setPinSetupLoading(false)
    }
  }

  // ─── FORGOT PIN HANDLERS ──────────────────────────────────────────────────────
  const openForgotPinModal = async () => {
    const target = (savedUser?.email || email || "").toLowerCase().trim()
    setForgotPinEmail(target)
    setForgotPinOTP("")
    setForgotPinNew("")
    setForgotPinConfirm("")
    setForgotPinError("")
    setIsForgotPinOpen(true)
    if (target) {
      setForgotPinLoading(true)
      try {
        await AuthService.sendPinOTP({ email: target })
        setForgotPinMsg(`Verification code sent to ${target}`)
        setForgotPinCooldown(60)
      } catch {}
      setForgotPinLoading(false)
    }
  }

  const handleResetPin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (forgotPinOTP.length < 6) {
      setForgotPinError("Please enter the 6-digit verification code.")
      return
    }
    if (forgotPinNew.length < 4) {
      setForgotPinError("Please enter a 4-digit PIN.")
      return
    }
    if (forgotPinNew !== forgotPinConfirm) {
      setForgotPinError("PINs do not match.")
      return
    }

    setForgotPinLoading(true)
    setForgotPinError("")

    try {
      await AuthService.resetPin({
        email: forgotPinEmail,
        otp: forgotPinOTP,
        newPin: forgotPinNew,
      })
      setForgotPinMsg("PIN successfully updated! You can now sign in.")
      setLoginPin(forgotPinNew)
      setTimeout(() => {
        setIsForgotPinOpen(false)
      }, 1500)
    } catch (err: any) {
      setForgotPinError(err?.response?.data?.message || "Invalid or expired verification code.")
    } finally {
      setForgotPinLoading(false)
    }
  }

  // ─── FORGOT PASSWORD HANDLERS WITH STRICT 8-CHAR POLICY ──────────────────────
  const openForgotModal = () => {
    setForgotEmail(email)
    setForgotStep("email")
    setForgotOTP("")
    setForgotNewPass("")
    setForgotConfirmPass("")
    setForgotError("")
    setForgotMsg("")
    setIsForgotOpen(true)
  }

  const handleSendForgotOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!forgotEmail) { setForgotError("Please enter your email address."); return }
    setForgotLoading(true)
    setForgotError("")
    try {
      await AuthService.sendForgotPasswordOTP({ email: forgotEmail.toLowerCase() })
      setForgotMsg("OTP sent! Check your inbox (also spam folder).")
      setForgotStep("otp")
      setResendCooldown(60)
    } catch (err: any) {
      setForgotError(err?.response?.data?.message || "Failed to send OTP. Please try again.")
    } finally {
      setForgotLoading(false)
    }
  }

  const handleVerifyForgotOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (forgotOTP.length < 6) { setForgotError("Please enter the complete 6-digit OTP."); return }
    setForgotLoading(true)
    setForgotError("")
    try {
      const res = await AuthService.verifyResetOTP({ email: forgotEmail.toLowerCase(), otp: forgotOTP })
      setForgotResetToken(res.data.resetToken)
      setForgotStep("newpass")
    } catch (err: any) {
      setForgotError(err?.response?.data?.message || "Invalid or expired OTP.")
    } finally {
      setForgotLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const policy = evaluatePasswordPolicy(forgotNewPass)
    if (!policy.length || !policy.upper || !policy.lower || !policy.number || !policy.special) {
      setForgotError("Password does not meet all security requirements.")
      return
    }
    if (forgotNewPass !== forgotConfirmPass) {
      setForgotError("Passwords do not match.")
      return
    }

    setForgotLoading(true)
    setForgotError("")
    try {
      await AuthService.resetPassword({
        email: forgotEmail.toLowerCase(),
        newPassword: forgotNewPass,
        resetToken: forgotResetToken,
      })

      const stored = await getStoredUserAccountsAsync()
      const existing = stored.find((a) => a.email.toLowerCase().trim() === forgotEmail.toLowerCase().trim())
      if (existing) {
        recordUserAccount({ ...existing, password: forgotNewPass })
      } else {
        recordUserAccount({ email: forgotEmail.toLowerCase().trim(), password: forgotNewPass })
      }

      setForgotStep("done")
      setForgotMsg("Password reset successfully! You can now log in.")
      setEmail(forgotEmail.toLowerCase())
      setPassword(forgotNewPass)
      setTimeout(() => setIsForgotOpen(false), 2500)
    } catch (err: any) {
      setForgotError(err?.response?.data?.message || "Failed to reset password.")
    } finally {
      setForgotLoading(false)
    }
  }

  // ─── EMAIL VERIFICATION HANDLER ──────────────────────────────────────────────
  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (verifyOTP.length < 6) { setVerifyError("Please enter the complete 6-digit OTP."); return }
    setVerifyLoading(true)
    setVerifyError("")
    try {
      await AuthService.verifyEmail({ email: verifyEmail, otp: verifyOTP })
      setVerifySuccess(true)
      setTimeout(() => {
        setVerifyEmailModal(false)
        setVerifyOTP("")
        setVerifySuccess(false)
      }, 2000)
    } catch (err: any) {
      setVerifyError(err?.response?.data?.message || "Invalid OTP. Please try again.")
    } finally {
      setVerifyLoading(false)
    }
  }

  const pwdPolicy = evaluatePasswordPolicy(forgotNewPass)
  const isPwdAllValid = pwdPolicy.length && pwdPolicy.upper && pwdPolicy.lower && pwdPolicy.number && pwdPolicy.special
  const isPwdMatch = forgotNewPass.length > 0 && forgotNewPass === forgotConfirmPass

  
  __ctrl = { router, loginAs, savedUser, setSavedUser, loginMode, setLoginMode, email, setEmail, password, setPassword, showPassword, setShowPassword, isLoading, setIsLoading, error, setError, success, setSuccess, successMessage, setSuccessMessage, loginPin, setLoginPin, pinLoading, setPinLoading, pinError, setPinError, isPinSetupOpen, setIsPinSetupOpen, pinSetupData, setPinSetupData, pinSetupOTP, setPinSetupOTP, pinSetupNewPin, setPinSetupNewPin, pinSetupConfirmPin, setPinSetupConfirmPin, pinSetupLoading, setPinSetupLoading, pinSetupError, setPinSetupError, pinSetupMsg, setPinSetupMsg, pinSetupCooldown, setPinSetupCooldown, isForgotPinOpen, setIsForgotPinOpen, forgotPinEmail, setForgotPinEmail, forgotPinOTP, setForgotPinOTP, forgotPinNew, setForgotPinNew, forgotPinConfirm, setForgotPinConfirm, forgotPinLoading, setForgotPinLoading, forgotPinError, setForgotPinError, forgotPinMsg, setForgotPinMsg, forgotPinCooldown, setForgotPinCooldown, verifyEmailModal, setVerifyEmailModal, verifyEmail, setVerifyEmail, verifyOTP, setVerifyOTP, verifyLoading, setVerifyLoading, verifyError, setVerifyError, verifySuccess, setVerifySuccess, isForgotOpen, setIsForgotOpen, forgotStep, setForgotStep, forgotEmail, setForgotEmail, forgotOTP, setForgotOTP, forgotResetToken, setForgotResetToken, forgotNewPass, setForgotNewPass, forgotConfirmPass, setForgotConfirmPass, forgotLoading, setForgotLoading, forgotError, setForgotError, forgotMsg, setForgotMsg, resendCooldown, setResendCooldown, completeSuccessfulLogin, handlePinLogin, handlePasswordSubmit, handleCompletePinSetup, openForgotPinModal, handleResetPin, openForgotModal, handleSendForgotOTP, handleVerifyForgotOTP, handleResetPassword, handleVerifyEmail, pwdPolicy, isPwdAllValid, isPwdMatch };
  __ctrlRef.current = __ctrl;
return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-4">
      <LoginSection1 ctrl={__ctrl} />

      <LoginSection2 ctrl={__ctrl} />

      <LoginSection3 ctrl={__ctrl} />
    </div>
  )
}
