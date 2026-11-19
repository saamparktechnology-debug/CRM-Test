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
import { type ForgotStep, type LoginMode, type SavedUser, OTPInput, PINInput, evaluatePasswordPolicy } from "@/features/auth/components/login-sections/LoginHelpers"

export function LoginSection1({ ctrl }: { ctrl: any }) {
  const { loginMode, savedUser, email, loginPin, setLoginPin, handlePinLogin, pinLoading, success, pinError, setLoginMode, openForgotPinModal, setSavedUser, setEmail, setPassword, handlePasswordSubmit, successMessage, showPassword, password, setShowPassword, openForgotModal, error, isLoading } = ctrl;
  return (
    <>
      {/* Ambient Liquid Glass Color Mesh */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none">
        <div className="absolute top-[-15%] left-[-10%] w-[55vw] h-[55vw] max-w-[700px] max-h-[700px] bg-gradient-to-br from-indigo-500/20 via-purple-500/15 to-transparent rounded-full blur-[140px] animate-liquid-1" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[55vw] h-[55vw] max-w-[700px] max-h-[700px] bg-gradient-to-tl from-cyan-500/18 via-teal-500/12 to-transparent rounded-full blur-[140px] animate-liquid-2" />
        <div className="absolute top-[40%] left-[30%] w-[30vw] h-[30vw] max-w-[450px] max-h-[450px] bg-gradient-to-tr from-pink-500/10 via-amber-500/8 to-transparent rounded-full blur-[120px] animate-liquid-3" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(150,150,150,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(150,150,150,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-70" />
      </div>

      <div className="w-full max-w-4xl z-10">
        <AnimatePresence mode="wait">

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* 1. QUICK 4-DIGIT PIN LOGIN MODE (DEFAULT ON RETURN / AUTO-LOGOUT)   */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {loginMode === "pin" ? (
            <motion.div
              key="pin-login-card"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="max-w-md mx-auto liquid-glass-card rounded-[2rem] p-8 sm:p-10 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.35)] relative border border-white/40 dark:border-white/10"
            >
              <div className="flex flex-col items-center mb-6">
                {/* User Avatar Badge */}
                <div className="relative mb-3">
                  <div className="w-20 h-20 rounded-full border-2 border-primary/50 overflow-hidden shadow-xl bg-surface flex items-center justify-center p-1">
                    {savedUser?.avatar ? (
                      <img src={savedUser.avatar} alt="User Avatar" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                        <UserIcon size={32} />
                      </div>
                    )}
                  </div>
                  <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-500 border-2 border-surface flex items-center justify-center text-[11px] text-white font-bold" title="PIN Protected">
                    🛡️
                  </span>
                </div>

                <h2 className="text-xl font-extrabold text-foreground tracking-tight">
                  {savedUser?.name || "Welcome Back"}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                  {savedUser?.email || email}
                </p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-2.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
                  <ShieldCheck size={13} />
                  <span>Enter 4-Digit Security PIN</span>
                </div>
              </div>

              {/* PIN Input */}
              <div className="space-y-4">
                <PINInput
                  value={loginPin}
                  onChange={setLoginPin}
                  onComplete={(val) => handlePinLogin(val)}
                  disabled={pinLoading || success}
                />

                {pinError && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="p-2.5 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs font-semibold text-center flex items-center justify-center gap-1.5">
                    <AlertCircle size={14} />
                    <span>{pinError}</span>
                  </motion.div>
                )}

                <Button
                  type="button"
                  onClick={() => handlePinLogin()}
                  variant="primary"
                  className="w-full h-11 text-sm font-bold shadow-md cursor-pointer"
                  disabled={pinLoading || loginPin.length < 4 || success}
                >
                  {pinLoading ? (
                    <span className="flex items-center gap-2 justify-center">
                      <Loader2 size={16} className="animate-spin" />
                      Verifying PIN...
                    </span>
                  ) : "Sign In with PIN →"}
                </Button>

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-3 border-t border-border/40 text-xs">
                  <button
                    type="button"
                    onClick={() => setLoginMode("password")}
                    className="font-medium text-primary hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Lock size={12} />
                    <span>Login with Password</span>
                  </button>

                  <button
                    type="button"
                    onClick={openForgotPinModal}
                    className="font-medium text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Forgot PIN?
                  </button>
                </div>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSavedUser(null)
                      setLoginMode("password")
                      setEmail("")
                      setPassword("")
                    }}
                    className="text-[11px] text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                  >
                    Sign in to another account
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (

            /* ═══════════════════════════════════════════════════════════════════ */
            /* 2. PASSWORD LOGIN FORM                                              */
            /* ═══════════════════════════════════════════════════════════════════ */
            <motion.div
              key="password-login-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md mx-auto liquid-glass-card rounded-[2rem] p-8 sm:p-10 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.35)] relative border border-white/40 dark:border-white/10"
            >
              <div className="flex flex-col items-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl liquid-glass-pill border border-white/40 dark:border-white/10 text-primary mb-3 shadow-lg p-2">
                  <img src="/logo.png" alt="SAAMPARK Logo" className="w-full h-full rounded-xl object-contain" />
                </div>
                <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
                  SAAMPARK Group CRM
                </h2>
                <p className="text-xs text-muted-foreground mt-1">Sign in with your email and password</p>

                {/* If a PIN-enabled saved user exists, offer 1-click switch */}
                {savedUser?.hasPin && (
                  <button
                    type="button"
                    onClick={() => setLoginMode("pin")}
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition-all hover:scale-103 cursor-pointer shadow-xs"
                  >
                    <Sparkles size={13} />
                    <span>⚡ Quick Sign In with PIN as {savedUser.name.split(" ")[0]}</span>
                  </button>
                )}
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4 relative">
                <AnimatePresence>
                  {success && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-surface/95 backdrop-blur-sm rounded-2xl p-6 text-center"
                    >
                      <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="w-16 h-16 bg-success/20 text-success rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 size={32} />
                      </motion.div>
                      <p className="text-base font-bold text-foreground">{successMessage}</p>
                      <p className="text-xs text-muted-foreground mt-1">Entering your workspace...</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email or Username */}
                <div>
                  <label className="block text-xs font-medium mb-1">Email Address or Username *</label>
                  <Input
                    id="login-email"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 bg-surface"
                    placeholder="e.g. user@saampark.in or your_username"
                    leftIcon={<Mail size={18} />}
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-medium mb-1">Password *</label>
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 bg-surface"
                    placeholder="••••••••"
                    leftIcon={<Lock size={18} />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="text-muted-foreground hover:text-foreground cursor-pointer flex items-center justify-center transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    }
                    required
                  />
                  <div className="flex justify-between items-center mt-1.5 text-xs">
                    {savedUser?.hasPin ? (
                      <button
                        type="button"
                        onClick={() => setLoginMode("pin")}
                        className="font-medium text-primary hover:underline cursor-pointer"
                      >
                        Use 4-digit PIN instead
                      </button>
                    ) : <span />}

                    <button
                      type="button"
                      onClick={openForgotModal}
                      className="font-medium text-primary hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs font-medium">
                    {error}
                  </motion.div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full h-11 text-sm font-bold shadow-md mt-2 cursor-pointer"
                  disabled={isLoading || success}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2 justify-center">
                      <Loader2 size={16} className="animate-spin" />
                      Authenticating...
                    </span>
                  ) : "Sign In →"}
                </Button>
              </form>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </>
  );
}
