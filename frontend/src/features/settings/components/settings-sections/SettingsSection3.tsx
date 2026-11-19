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

export function SettingsSection3({ ctrl }: { ctrl: any }) {
  const { showBankChangeModal, setShowBankChangeModal, handleSubmitBankChangeRequest, newReqBankName, setNewReqBankName, newReqAccountHolderName, setNewReqAccountHolderName, newReqAccountNumber, setNewReqAccountNumber, newReqConfirmAccountNumber, setNewReqConfirmAccountNumber, newReqIfscCode, setNewReqIfscCode, newReqUpiId, setNewReqUpiId, newReqReason, setNewReqReason, bankProofInputRef, handleBankProofUpload, isUploadingBankProof, newReqProofUrl, isSubmittingBankChange, activeTab, isSuperAdmin, handleSaveCompany, companyName, setCompanyName, currency, setCurrency, currencySymbol, setCurrencySymbol, address, setAddress, loading } = ctrl;
  return (
    <>
      {/* ── MODAL: REQUEST BANK & UPI DETAILS CHANGE ────────────────────────── */}
      {showBankChangeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl max-w-lg w-full space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600">
                  <CreditCard size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Request Bank / UPI Details Change</h3>
                  <p className="text-[11px] text-muted-foreground">Submit updated remittance account for Admin verification</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBankChangeModal(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitBankChangeRequest} className="space-y-3">
              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">New Bank Name *</label>
                <input
                  type="text"
                  required
                  value={newReqBankName}
                  onChange={(e) => setNewReqBankName(e.target.value)}
                  placeholder="e.g. State Bank of India / HDFC Bank"
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Account Holder Legal Name *</label>
                <input
                  type="text"
                  required
                  value={newReqAccountHolderName}
                  onChange={(e) => setNewReqAccountHolderName(e.target.value)}
                  placeholder="Must match your KYC ID legal name"
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">New Account Number *</label>
                  <input
                    type="password"
                    required
                    value={newReqAccountNumber}
                    onChange={(e) => setNewReqAccountNumber(e.target.value)}
                    placeholder="Enter account number"
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Confirm Account Number *</label>
                  <input
                    type="text"
                    required
                    value={newReqConfirmAccountNumber}
                    onChange={(e) => setNewReqConfirmAccountNumber(e.target.value)}
                    placeholder="Re-type account number"
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">IFSC Code *</label>
                  <input
                    type="text"
                    required
                    value={newReqIfscCode}
                    onChange={(e) => setNewReqIfscCode(e.target.value.toUpperCase())}
                    placeholder="e.g. SBIN0001234"
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">UPI ID / VPA</label>
                  <input
                    type="text"
                    value={newReqUpiId}
                    onChange={(e) => setNewReqUpiId(e.target.value)}
                    placeholder="e.g. yourname@okhdfcbank"
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Reason for Bank Change</label>
                <input
                  type="text"
                  value={newReqReason}
                  onChange={(e) => setNewReqReason(e.target.value)}
                  placeholder="e.g. Primary salary account updated"
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Upload New Passbook / Cheque Proof */}
              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">New Bank Passbook / Cancelled Cheque Photo</label>
                <input
                  type="file"
                  ref={bankProofInputRef}
                  accept="image/*"
                  onChange={handleBankProofUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => bankProofInputRef.current?.click()}
                  disabled={isUploadingBankProof}
                  className="w-full px-3 py-2 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 text-center flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Upload size={14} className={isUploadingBankProof ? "animate-bounce" : ""} />
                  <span>{newReqProofUrl ? "✅ Document Photo Attached (Click to change)" : isUploadingBankProof ? "Uploading..." : "Click to Upload New Cheque / Passbook Image"}</span>
                </button>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-300">
                🔒 <strong>Security Policy:</strong> Until verified and approved by the company administrator, your previous verified bank account will remain active.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowBankChangeModal(false)}
                  className="px-4 py-2 rounded-xl text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBankChange}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <CheckCircle2 size={14} />
                  <span>{isSubmittingBankChange ? "Submitting..." : "Submit Change Request"}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ── TAB 2: COMPANY PROFILE (Super Admin Only) ───────────────────────── */}
      {activeTab === "company" && isSuperAdmin && (
        <form onSubmit={handleSaveCompany} className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 space-y-4 max-w-2xl text-xs shadow-2xs">
          <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Building2 size={16} className="text-blue-600" />
            <span>Company & Organization Details</span>
          </h3>

          <div>
            <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Currency Code</label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden font-mono"
              />
            </div>
            <div>
              <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Currency Symbol</label>
              <input
                type="text"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Registered Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Save size={14} />
              <span>Save Company Settings</span>
            </button>
          </div>
        </form>
      )}
    </>
  );
}
