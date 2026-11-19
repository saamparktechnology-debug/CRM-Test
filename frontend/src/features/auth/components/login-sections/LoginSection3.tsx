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

export function LoginSection3({ ctrl }: { ctrl: any }) {
  const { verifyEmailModal, setVerifyEmailModal, verifySuccess, handleVerifyEmail, verifyEmail, verifyOTP, setVerifyOTP, verifyError, verifyLoading, isForgotOpen, setIsForgotOpen, forgotStep, handleSendForgotOTP, forgotEmail, setForgotEmail, forgotError, forgotLoading, handleVerifyForgotOTP, forgotMsg, forgotOTP, setForgotOTP, resendCooldown, setForgotLoading, setForgotMsg, setResendCooldown, setForgotStep, handleResetPassword, forgotNewPass, setForgotNewPass, forgotConfirmPass, setForgotConfirmPass, pwdPolicy, isPwdMatch, isPwdAllValid } = ctrl;
  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* 5. EMAIL VERIFICATION MODAL                                             */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {verifyEmailModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-surface border border-border rounded-2xl p-6 shadow-2xl"
            >
              <button onClick={() => setVerifyEmailModal(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>

              {verifySuccess ? (
                <div className="flex flex-col items-center py-6 text-center">
                  <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 size={32} className="text-success" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Email Verified!</h3>
                  <p className="text-sm text-muted-foreground mt-2">You can now sign in to your account.</p>
                </div>
              ) : (
                <form onSubmit={handleVerifyEmail} className="space-y-5">
                  <div className="text-center">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Mail size={28} className="text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">Verify Your Email</h3>
                    <p className="text-sm text-muted-foreground mt-1">Enter the 6-digit OTP sent to</p>
                    <p className="text-sm font-semibold text-primary">{verifyEmail}</p>
                  </div>

                  <OTPInput value={verifyOTP} onChange={setVerifyOTP} />

                  {verifyError && <p className="text-xs text-danger text-center font-medium">{verifyError}</p>}

                  <Button type="submit" variant="primary" className="w-full h-11 font-bold" disabled={verifyLoading || verifyOTP.length < 6}>
                    {verifyLoading ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Verify Email →"}
                  </Button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* 6. FORGOT PASSWORD MODAL WITH 8-CHAR / 1-CAP / 1-SPECIAL CHECKLIST      */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isForgotOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-surface border border-border rounded-2xl p-6 shadow-2xl"
            >
              <button onClick={() => setIsForgotOpen(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border/50">
                <div className="p-2 rounded-xl bg-primary/10 text-primary"><KeyRound size={20} /></div>
                <div>
                  <h3 className="font-bold text-lg text-foreground">Reset Password</h3>
                  <p className="text-xs text-muted-foreground">
                    {forgotStep === "email" && "Enter your email to receive an OTP"}
                    {forgotStep === "otp" && "Enter the OTP from your email"}
                    {forgotStep === "newpass" && "Create a strong new password"}
                    {forgotStep === "done" && "All done!"}
                  </p>
                </div>
              </div>

              {/* Progress indicator */}
              <div className="flex gap-1 mb-6">
                {(["email", "otp", "newpass", "done"] as ForgotStep[]).map((s, i) => (
                  <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${
                    forgotStep === "done" || i <= ["email","otp","newpass","done"].indexOf(forgotStep)
                      ? "bg-primary" : "bg-border"
                  }`} />
                ))}
              </div>

              {/* Step 1: Enter Email */}
              {forgotStep === "email" && (
                <form onSubmit={handleSendForgotOTP} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5">Registered Email *</label>
                    <Input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="bg-background"
                      leftIcon={<Mail size={16} />}
                    />
                  </div>
                  {forgotError && <p className="text-xs text-danger font-medium">{forgotError}</p>}
                  <div className="flex gap-2 pt-1">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setIsForgotOpen(false)}>Cancel</Button>
                    <Button type="submit" variant="primary" className="flex-1" disabled={forgotLoading}>
                      {forgotLoading ? <Loader2 size={14} className="animate-spin mx-auto" /> : "Send OTP →"}
                    </Button>
                  </div>
                </form>
              )}

              {/* Step 2: Enter OTP */}
              {forgotStep === "otp" && (
                <form onSubmit={handleVerifyForgotOTP} className="space-y-5">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">OTP sent to</p>
                    <p className="text-sm font-bold text-primary">{forgotEmail}</p>
                    {forgotMsg && <p className="text-xs text-success mt-1">{forgotMsg}</p>}
                  </div>

                  <OTPInput value={forgotOTP} onChange={setForgotOTP} />

                  {forgotError && <p className="text-xs text-danger text-center font-medium">{forgotError}</p>}

                  <button
                    type="button"
                    onClick={async () => {
                      if (resendCooldown > 0) return
                      setForgotLoading(true)
                      try {
                        await AuthService.sendForgotPasswordOTP({ email: forgotEmail.toLowerCase() })
                        setForgotMsg("New OTP sent!")
                        setResendCooldown(60)
                      } catch {}
                      setForgotLoading(false)
                    }}
                    disabled={resendCooldown > 0 || forgotLoading}
                    className="w-full text-xs text-muted-foreground hover:text-primary flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    <RefreshCw size={12} />
                    {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : "Resend OTP"}
                  </button>

                  <div className="flex gap-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setForgotStep("email")}>Back</Button>
                    <Button type="submit" variant="primary" className="flex-1" disabled={forgotLoading || forgotOTP.length < 6}>
                      {forgotLoading ? <Loader2 size={14} className="animate-spin mx-auto" /> : "Verify OTP →"}
                    </Button>
                  </div>
                </form>
              )}

              {/* Step 3: New Password with Strict Policy Checklist */}
              {forgotStep === "newpass" && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5">New Password *</label>
                    <Input
                      type="password"
                      required
                      value={forgotNewPass}
                      onChange={(e) => setForgotNewPass(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="bg-background"
                      leftIcon={<Lock size={16} />}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1.5">Confirm Password *</label>
                    <Input
                      type="password"
                      required
                      value={forgotConfirmPass}
                      onChange={(e) => setForgotConfirmPass(e.target.value)}
                      placeholder="Re-type new password"
                      className="bg-background"
                      leftIcon={<Lock size={16} />}
                    />
                  </div>

                  {/* Password Strength Checklist */}
                  <div className="p-3 bg-background/80 rounded-xl border border-border/60 space-y-1.5 text-[11px]">
                    <p className="font-bold text-foreground text-[11px] mb-1">Password Requirements:</p>
                    <div className={`flex items-center gap-1.5 ${pwdPolicy.length ? "text-emerald-500 font-semibold" : "text-muted-foreground"}`}>
                      <Check size={12} className={pwdPolicy.length ? "stroke-[3]" : "opacity-40"} />
                      <span>At least 8 characters long</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${pwdPolicy.upper ? "text-emerald-500 font-semibold" : "text-muted-foreground"}`}>
                      <Check size={12} className={pwdPolicy.upper ? "stroke-[3]" : "opacity-40"} />
                      <span>At least 1 uppercase letter (A-Z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${pwdPolicy.lower ? "text-emerald-500 font-semibold" : "text-muted-foreground"}`}>
                      <Check size={12} className={pwdPolicy.lower ? "stroke-[3]" : "opacity-40"} />
                      <span>At least 1 lowercase letter (a-z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${pwdPolicy.number ? "text-emerald-500 font-semibold" : "text-muted-foreground"}`}>
                      <Check size={12} className={pwdPolicy.number ? "stroke-[3]" : "opacity-40"} />
                      <span>At least 1 number (0-9)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${pwdPolicy.special ? "text-emerald-500 font-semibold" : "text-muted-foreground"}`}>
                      <Check size={12} className={pwdPolicy.special ? "stroke-[3]" : "opacity-40"} />
                      <span>At least 1 special character (!@#$%^&* etc.)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${isPwdMatch ? "text-emerald-500 font-semibold" : "text-muted-foreground"}`}>
                      <Check size={12} className={isPwdMatch ? "stroke-[3]" : "opacity-40"} />
                      <span>Passwords match</span>
                    </div>
                  </div>

                  {forgotError && <p className="text-xs text-danger font-medium">{forgotError}</p>}

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full h-11 font-bold shadow-md"
                    disabled={forgotLoading || !isPwdAllValid || !isPwdMatch}
                  >
                    {forgotLoading ? <Loader2 size={14} className="animate-spin mx-auto" /> : "Set New Password →"}
                  </Button>
                </form>
              )}

              {/* Step 4: Done */}
              {forgotStep === "done" && (
                <div className="flex flex-col items-center py-4 text-center space-y-3">
                  <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={32} className="text-success" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Password Reset!</h3>
                  <p className="text-sm text-muted-foreground">{forgotMsg}</p>
                  <p className="text-xs text-muted-foreground">Closing in a moment...</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
