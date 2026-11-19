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

export function LoginSection2({ ctrl }: { ctrl: any }) {
  const { isPinSetupOpen, pinSetupData, pinSetupMsg, handleCompletePinSetup, pinSetupOTP, setPinSetupOTP, pinSetupCooldown, setPinSetupMsg, setPinSetupCooldown, pinSetupNewPin, setPinSetupNewPin, pinSetupConfirmPin, setPinSetupConfirmPin, pinSetupError, pinSetupLoading, isForgotPinOpen, setIsForgotPinOpen, forgotPinEmail, forgotPinMsg, handleResetPin, forgotPinOTP, setForgotPinOTP, forgotPinCooldown, setForgotPinMsg, setForgotPinCooldown, forgotPinNew, setForgotPinNew, forgotPinConfirm, setForgotPinConfirm, forgotPinError, forgotPinLoading } = ctrl;
  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* 3. FIRST-TIME 4-DIGIT PIN SETUP MODAL (WITH EMAIL OTP)                  */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isPinSetupOpen && pinSetupData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-2xl"
            >
              <div className="text-center mb-5">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3 text-primary">
                  <ShieldCheck size={32} />
                </div>
                <h3 className="text-xl font-extrabold text-foreground">Set Up 4-Digit Security PIN</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                  A 6-digit verification code was sent to <strong className="text-foreground">{pinSetupData.email}</strong>. Enter it below to activate your PIN.
                </p>
                {pinSetupMsg && <p className="text-xs text-primary font-medium mt-1">{pinSetupMsg}</p>}
              </div>

              <form onSubmit={handleCompletePinSetup} className="space-y-4">
                {/* Step 1: Email OTP */}
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1 text-center">
                    1. Enter Email Verification Code
                  </label>
                  <OTPInput value={pinSetupOTP} onChange={setPinSetupOTP} />
                  <div className="flex justify-center mt-1.5">
                    <button
                      type="button"
                      disabled={pinSetupCooldown > 0}
                      onClick={async () => {
                        if (pinSetupCooldown > 0) return
                        try {
                          await AuthService.sendPinOTP({ email: pinSetupData.email })
                          setPinSetupMsg("New verification code sent!")
                          setPinSetupCooldown(60)
                        } catch {}
                      }}
                      className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 disabled:opacity-50"
                    >
                      <RefreshCw size={11} />
                      {pinSetupCooldown > 0 ? `Resend OTP in ${pinSetupCooldown}s` : "Resend OTP"}
                    </button>
                  </div>
                </div>

                {/* Step 2: Choose 4-Digit PIN */}
                <div className="pt-2 border-t border-border/50">
                  <label className="block text-xs font-bold text-foreground mb-1 text-center">
                    2. Choose Your 4-Digit PIN
                  </label>
                  <PINInput value={pinSetupNewPin} onChange={setPinSetupNewPin} autoFocus={false} />
                </div>

                {/* Step 3: Confirm 4-Digit PIN */}
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1 text-center">
                    3. Re-enter PIN to Confirm
                  </label>
                  <PINInput value={pinSetupConfirmPin} onChange={setPinSetupConfirmPin} autoFocus={false} />
                </div>

                {pinSetupError && (
                  <p className="text-xs text-danger text-center font-semibold bg-danger/10 p-2 rounded-lg">
                    {pinSetupError}
                  </p>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full h-11 font-bold shadow-md cursor-pointer mt-2"
                  disabled={pinSetupLoading || pinSetupOTP.length < 6 || pinSetupNewPin.length < 4 || pinSetupConfirmPin.length < 4}
                >
                  {pinSetupLoading ? (
                    <span className="flex items-center gap-2 justify-center">
                      <Loader2 size={16} className="animate-spin" />
                      Activating PIN...
                    </span>
                  ) : "Complete PIN Setup & Enter CRM →"}
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* 4. FORGOT / RESET PIN MODAL                                             */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isForgotPinOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-2xl"
            >
              <button
                onClick={() => setIsForgotPinOpen(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
              >
                <X size={18} />
              </button>

              <div className="text-center mb-5">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3 text-primary">
                  <KeyRound size={28} />
                </div>
                <h3 className="text-xl font-extrabold text-foreground">Reset Security PIN</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  We sent a 6-digit verification code to <strong className="text-foreground">{forgotPinEmail}</strong>.
                </p>
                {forgotPinMsg && <p className="text-xs text-primary font-medium mt-1">{forgotPinMsg}</p>}
              </div>

              <form onSubmit={handleResetPin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold mb-1 text-center">Enter 6-Digit Email Code</label>
                  <OTPInput value={forgotPinOTP} onChange={setForgotPinOTP} />
                  <div className="flex justify-center mt-1">
                    <button
                      type="button"
                      disabled={forgotPinCooldown > 0}
                      onClick={async () => {
                        if (forgotPinCooldown > 0) return
                        try {
                          await AuthService.sendPinOTP({ email: forgotPinEmail })
                          setForgotPinMsg("New code sent!")
                          setForgotPinCooldown(60)
                        } catch {}
                      }}
                      className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 disabled:opacity-50"
                    >
                      <RefreshCw size={11} />
                      {forgotPinCooldown > 0 ? `Resend OTP in ${forgotPinCooldown}s` : "Resend OTP"}
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/50">
                  <label className="block text-xs font-bold mb-1 text-center">New 4-Digit PIN</label>
                  <PINInput value={forgotPinNew} onChange={setForgotPinNew} autoFocus={false} />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1 text-center">Confirm New 4-Digit PIN</label>
                  <PINInput value={forgotPinConfirm} onChange={setForgotPinConfirm} autoFocus={false} />
                </div>

                {forgotPinError && (
                  <p className="text-xs text-danger text-center font-semibold bg-danger/10 p-2 rounded-lg">
                    {forgotPinError}
                  </p>
                )}

                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setIsForgotPinOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1 font-bold shadow-md"
                    disabled={forgotPinLoading || forgotPinOTP.length < 6 || forgotPinNew.length < 4 || forgotPinConfirm.length < 4}
                  >
                    {forgotPinLoading ? <Loader2 size={14} className="animate-spin mx-auto" /> : "Save New PIN"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
