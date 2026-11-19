"use client"

import { CompanyApiService } from "@/features/companies/services/companyService"
import { api } from "@/lib/api"
import * as React from "react"
import { motion } from "framer-motion"
import { 
  Settings, Building2, Mail, Lock, Sun, Moon, ShieldCheck, 
  Save, CheckCircle2, Globe, Key, AlertCircle, RefreshCw,
  Camera, Upload, User, Sparkles, Phone, MapPin, Briefcase, Tag,
  QrCode, CreditCard
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { useAuthStore, Company, DEFAULT_COMPANIES } from "@/store/useAuthStore"
import { useTheme } from "next-themes"
import { fetchModuleDataFromDB, saveModuleDataToDB } from "@/lib/storageSync"
import { 
  getUsers, 
  recordUserAccount, 
  getStoredUserAccountsAsync,
  cascadeUserAvatarChange, 
  checkUsernameAvailabilityAsync, 
  updateUserUsernameAsync 
} from "@/features/users/services/userService"
import { uploadToImgBB } from "@/lib/imgbbUpload"
import { KycData, KycStatus } from "@/features/users/types"
import { 
  getCompanyPaymentSettings, 
  saveCompanyPaymentSettings, 
  CompanyPaymentSettings,
  DEFAULT_COMPANY_PAYMENT_SETTINGS 
} from "@/features/settings/services/companyPaymentService"
import { EntityModulePermissionsTab } from "@/features/settings/components/EntityModulePermissionsTab"
import { type SettingsTab } from "@/features/settings/components/settings-sections/SettingsHelpers"

export function SettingsSection5({ ctrl }: { ctrl: any }) {
  const { activeTab, handleSavePaymentSettings, isSuperAdmin, payQrUrl, isUploadingQr, qrInputRef, handleQrUpload, payBankName, setPayBankName, payAccountHolder, setPayAccountHolder, payAccountNumber, setPayAccountNumber, payIfsc, setPayIfsc, payUpiId, setPayUpiId, payBranch, setPayBranch, payNotes, setPayNotes, loading } = ctrl;
  return (
    <>
      {/* ── TAB: INVOICE PAYMENT QR & BANK DETAILS ─────────────────────────── */}
      {activeTab === "payments" && (
        <div className="space-y-6">
          <form onSubmit={handleSavePaymentSettings} className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 space-y-6 max-w-4xl text-xs shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <div>
                <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <QrCode size={18} className="text-blue-600" />
                  <span>Invoice Payment QR & Official Bank Account</span>
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  These details and payment QR code are dynamically printed on all tax invoices sent to clients.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!isSuperAdmin && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                    <Lock size={10} /> View Only (Super Admin Editable)
                  </span>
                )}
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 w-fit">
                  Printed on Invoice PDF
                </span>
              </div>
            </div>

            {!isSuperAdmin && (
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-2.5 text-amber-900 dark:text-amber-200 text-xs">
                <Lock size={15} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Organization Security Policy</p>
                  <p className="text-[11px] text-amber-800/90 dark:text-amber-300/90 mt-0.5">
                    Payment QR & Official Bank details are displayed here for your verification and reference. Only <strong>Super Admin</strong> is authorized to edit or update company banking credentials.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* QR Code Upload Card */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 flex flex-col items-center justify-center text-center space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Payment QR Code
                </span>

                <div className="w-36 h-36 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-600 flex items-center justify-center overflow-hidden bg-white dark:bg-zinc-900 shadow-inner relative group">
                  {payQrUrl ? (
                    <img src={payQrUrl} alt="Payment QR" className="w-full h-full object-contain p-2" />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-zinc-400 p-2">
                      <QrCode size={36} className="text-zinc-300 dark:text-zinc-600" />
                      <span className="text-[10px]">No QR Uploaded</span>
                    </div>
                  )}

                  {isUploadingQr && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center text-white text-[11px] font-bold">
                      Uploading to Cloud...
                    </div>
                  )}
                </div>

                {isSuperAdmin && (
                  <>
                    <input
                      type="file"
                      ref={qrInputRef}
                      onChange={handleQrUpload}
                      accept="image/*"
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => qrInputRef.current?.click()}
                      disabled={isUploadingQr}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Upload size={13} />
                      <span>{payQrUrl ? "Change QR Code" : "Upload QR Image"}</span>
                    </button>
                  </>
                )}
                <p className="text-[10px] text-zinc-400">Supports GPay, PhonePe, Paytm, BharatPe, BHIM (PNG, JPG)</p>
              </div>

              {/* Bank Details Inputs */}
              <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">
                      Bank Name *
                    </label>
                    <input
                      type="text"
                      disabled={!isSuperAdmin}
                      value={payBankName}
                      onChange={(e) => setPayBankName(e.target.value)}
                      placeholder="e.g. State Bank of India"
                      required
                      className={`w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden text-xs ${
                        !isSuperAdmin ? "opacity-75 cursor-not-allowed" : ""
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">
                      Account Holder / Company Name *
                    </label>
                    <input
                      type="text"
                      disabled={!isSuperAdmin}
                      value={payAccountHolder}
                      onChange={(e) => setPayAccountHolder(e.target.value)}
                      placeholder="e.g. Saampark Technology & Research Pvt. Ltd."
                      required
                      className={`w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden text-xs ${
                        !isSuperAdmin ? "opacity-75 cursor-not-allowed" : ""
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">
                      Account Number *
                    </label>
                    <input
                      type="text"
                      disabled={!isSuperAdmin}
                      value={payAccountNumber}
                      onChange={(e) => setPayAccountNumber(e.target.value)}
                      placeholder="e.g. 40912384759"
                      required
                      className={`w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono focus:outline-hidden text-xs font-bold ${
                        !isSuperAdmin ? "opacity-75 cursor-not-allowed" : ""
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">
                      IFSC Code *
                    </label>
                    <input
                      type="text"
                      disabled={!isSuperAdmin}
                      value={payIfsc}
                      onChange={(e) => setPayIfsc(e.target.value.toUpperCase())}
                      placeholder="e.g. SBIN0001234"
                      required
                      className={`w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono focus:outline-hidden text-xs font-bold ${
                        !isSuperAdmin ? "opacity-75 cursor-not-allowed" : ""
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">
                      UPI ID / VPA *
                    </label>
                    <input
                      type="text"
                      disabled={!isSuperAdmin}
                      value={payUpiId}
                      onChange={(e) => setPayUpiId(e.target.value)}
                      placeholder="e.g. saampark@sbi"
                      required
                      className={`w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono focus:outline-hidden text-xs ${
                        !isSuperAdmin ? "opacity-75 cursor-not-allowed" : ""
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">
                      Branch Name / Location
                    </label>
                    <input
                      type="text"
                      disabled={!isSuperAdmin}
                      value={payBranch}
                      onChange={(e) => setPayBranch(e.target.value)}
                      placeholder="e.g. Balichak Station Road"
                      className={`w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden text-xs ${
                        !isSuperAdmin ? "opacity-75 cursor-not-allowed" : ""
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">
                    Invoice Payment Instructions / Notes
                  </label>
                  <input
                    type="text"
                    disabled={!isSuperAdmin}
                    value={payNotes}
                    onChange={(e) => setPayNotes(e.target.value)}
                    placeholder="e.g. Please mention Invoice ID in transaction description."
                    className={`w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden text-xs ${
                      !isSuperAdmin ? "opacity-75 cursor-not-allowed" : ""
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                <CheckCircle2 size={13} className="text-emerald-500" />
                Auto-saved and synced across all invoice generation
              </span>
              {isSuperAdmin && (
                <button
                  type="submit"
                  disabled={loading || isUploadingQr}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Save size={14} />
                  <span>Save Payment QR & Bank Details</span>
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </>
  );
}
