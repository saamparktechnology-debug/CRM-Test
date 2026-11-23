"use client"

import { CompanyApiService } from "@/features/companies/services/companyService"
import { useMasterBundle } from "@/features/masters/hooks/useMasters"
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

export function SettingsSection2({ ctrl }: { ctrl: any }) {
  const { data: masterBundle } = useMasterBundle()
  const { activeTab, handleSubmitKyc, kycStatus, kycRejectionReason, kycFullName, setKycFullName, kycDocType, setKycDocType, kycDocNumber, setKycDocNumber, kycDocFrontUrl, frontDocInputRef, handleFrontDocUpload, isUploadingFront, kycDocBackUrl, backDocInputRef, handleBackDocUpload, isUploadingBack, kycBankName, setKycBankName, kycAccountHolderName, setKycAccountHolderName, kycAccountNumber, setKycAccountNumber, kycIfscCode, setKycIfscCode, kycUpiId, setKycUpiId, user, setNewReqBankName, setNewReqAccountHolderName, setNewReqAccountNumber, setNewReqConfirmAccountNumber, setNewReqIfscCode, setNewReqUpiId, setNewReqProofUrl, setNewReqReason, setShowBankChangeModal, loading } = ctrl;
  return (
    <>
      {activeTab === "kyc" && (
        <form onSubmit={handleSubmitKyc} className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-2xs space-y-6">
          {/* Status Banner */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 flex-wrap ${
            kycStatus === "Verified"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300"
              : kycStatus === "Processing"
              ? "bg-blue-500/10 border-blue-500/20 text-blue-800 dark:text-blue-300"
              : kycStatus === "Rejected"
              ? "bg-rose-500/10 border-rose-500/20 text-rose-800 dark:text-rose-300"
              : "bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-300"
          }`}>
            <div className="flex items-center gap-3">
              <ShieldCheck size={24} className="shrink-0" />
              <div>
                <h4 className="font-bold text-sm">
                  KYC Verification Status: {kycStatus === "Processing" ? "Under Review" : kycStatus === "Verified" ? "Verified & Approved (Done)" : kycStatus}
                </h4>
                <p className="text-xs opacity-80 mt-0.5">
                  {kycStatus === "Verified"
                    ? "Your identity and bank details have been verified by the administrator."
                    : kycStatus === "Processing"
                    ? "Your KYC documents have been submitted and are currently under review by Super Admin / Admin."
                    : kycStatus === "Rejected"
                    ? `KYC application was rejected: ${kycRejectionReason || "Please re-upload clear document photos."}`
                    : "KYC is pending. Please fill in your legal identification, upload documents, and provide payout bank/UPI details."}
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-bold bg-surface border border-border">
              {kycStatus}
            </span>
          </div>

          {/* Section 1: Identification Details */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/50 pb-2">
              <span>1. Identity Document Information</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Legal Full Name (as per ID) *</label>
                <input
                  type="text"
                  required
                  disabled={kycStatus === "Verified"}
                  value={kycFullName}
                  onChange={(e) => setKycFullName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-1 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Document Type *</label>
                <select
                  disabled={kycStatus === "Verified"}
                  value={kycDocType}
                  onChange={(e) => setKycDocType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-1 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {(masterBundle?.options?.["kyc_id_type"] || []).map((opt) => (
                  <option key={opt.id} value={opt.value}>{opt.label}</option>
                ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Document Number *</label>
                <input
                  type="text"
                  required
                  disabled={kycStatus === "Verified"}
                  value={kycDocNumber}
                  onChange={(e) => setKycDocNumber(e.target.value)}
                  placeholder="e.g. 1234 5678 9012 or ABCDE1234F"
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono focus:ring-1 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Document Photo Uploads (ImgBB Cloud Hosted) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Front Photo */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">Document Front Photo *</span>
                  {kycDocFrontUrl && <span className="text-[10px] text-emerald-600 font-bold">Uploaded ✓</span>}
                </div>

                {kycDocFrontUrl ? (
                  <div className="relative rounded-xl overflow-hidden border border-border bg-surface h-36">
                    <img src={kycDocFrontUrl} alt="Front Document" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="h-36 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl flex flex-col items-center justify-center text-zinc-400 text-xs">
                    <Upload size={24} className="mb-1" />
                    <span>Upload Front Photo (PNG / JPG)</span>
                  </div>
                )}

                {kycStatus !== "Verified" && (
                  <div>
                    <input
                      type="file"
                      ref={frontDocInputRef}
                      accept="image/*"
                      onChange={handleFrontDocUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => frontDocInputRef.current?.click()}
                      disabled={isUploadingFront}
                      className="w-full py-2 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 text-foreground rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {isUploadingFront ? <RefreshCw size={14} className="animate-spin" /> : <Upload size={14} />}
                      <span>{isUploadingFront ? "Uploading..." : kycDocFrontUrl ? "Change Front Photo" : "Upload Front Photo"}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Back Photo */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">Document Back Photo / Address Page</span>
                  {kycDocBackUrl && <span className="text-[10px] text-emerald-600 font-bold">Uploaded ✓</span>}
                </div>

                {kycDocBackUrl ? (
                  <div className="relative rounded-xl overflow-hidden border border-border bg-surface h-36">
                    <img src={kycDocBackUrl} alt="Back Document" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="h-36 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl flex flex-col items-center justify-center text-zinc-400 text-xs">
                    <Upload size={24} className="mb-1" />
                    <span>Upload Back Photo (Optional)</span>
                  </div>
                )}

                {kycStatus !== "Verified" && (
                  <div>
                    <input
                      type="file"
                      ref={backDocInputRef}
                      accept="image/*"
                      onChange={handleBackDocUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => backDocInputRef.current?.click()}
                      disabled={isUploadingBack}
                      className="w-full py-2 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 text-foreground rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {isUploadingBack ? <RefreshCw size={14} className="animate-spin" /> : <Upload size={14} />}
                      <span>{isUploadingBack ? "Uploading..." : kycDocBackUrl ? "Change Back Photo" : "Upload Back Photo"}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Bank & UPI Details */}
          <div className="space-y-4 pt-2">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/50 pb-2">
              <span>2. Bank Account & UPI Payout Details</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Bank Name</label>
                <input
                  type="text"
                  disabled={kycStatus === "Verified"}
                  value={kycBankName}
                  onChange={(e) => setKycBankName(e.target.value)}
                  placeholder="e.g. HDFC Bank / State Bank of India"
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-1 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Account Holder Name</label>
                <input
                  type="text"
                  disabled={kycStatus === "Verified"}
                  value={kycAccountHolderName}
                  onChange={(e) => setKycAccountHolderName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-1 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Bank Account Number</label>
                <input
                  type="text"
                  disabled={kycStatus === "Verified"}
                  value={kycAccountNumber}
                  onChange={(e) => setKycAccountNumber(e.target.value)}
                  placeholder="e.g. 50100234567890"
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono focus:ring-1 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">IFSC Code</label>
                <input
                  type="text"
                  disabled={kycStatus === "Verified"}
                  value={kycIfscCode}
                  onChange={(e) => setKycIfscCode(e.target.value.toUpperCase())}
                  placeholder="e.g. HDFC0001234"
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono focus:ring-1 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">UPI ID / VPA</label>
                <input
                  type="text"
                  disabled={kycStatus === "Verified"}
                  value={kycUpiId}
                  onChange={(e) => setKycUpiId(e.target.value)}
                  placeholder="e.g. rahul@okaxis or 9876543210@paytm"
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono focus:ring-1 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Bank Change Request Actions & Status Banner for Verified Team Members */}
          {kycStatus === "Verified" && (
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
              {user?.kycData?.bankChangeRequest?.status === "pending" ? (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                      <AlertCircle size={15} />
                      <span>Bank Detail Change Request Pending Admin Approval</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-200">
                      Submitted on {new Date(user.kycData.bankChangeRequest.requestedAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs p-2.5 rounded-xl bg-white/60 dark:bg-zinc-800/60 border border-amber-500/20">
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase font-bold">Requested Bank:</span>
                      <p className="font-bold text-zinc-900 dark:text-zinc-100">{user.kycData.bankChangeRequest.bankName}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase font-bold">A/C Number:</span>
                      <p className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{user.kycData.bankChangeRequest.accountNumber}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase font-bold">IFSC Code:</span>
                      <p className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{user.kycData.bankChangeRequest.ifscCode}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase font-bold">UPI ID:</span>
                      <p className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{user.kycData.bankChangeRequest.upiId || "N/A"}</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-amber-800 dark:text-amber-300 font-medium">
                    ⚠️ <strong>Notice:</strong> Your payout remittances and salary will strictly continue to route to your currently verified account until an Administrator approves this change.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300 text-xs">
                    <ShieldCheck size={20} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="font-bold">Verified Remittance Account Active</p>
                      <p className="text-[11px] opacity-80">All company payroll and project payouts are securely deposited into this account.</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setNewReqBankName(kycBankName || "")
                      setNewReqAccountHolderName(kycAccountHolderName || user?.name || "")
                      setNewReqAccountNumber("")
                      setNewReqConfirmAccountNumber("")
                      setNewReqIfscCode(kycIfscCode || "")
                      setNewReqUpiId(kycUpiId || "")
                      setNewReqProofUrl("")
                      setNewReqReason("")
                      setShowBankChangeModal(true)
                    }}
                    className="px-4 py-2 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
                  >
                    <CreditCard size={14} />
                    <span>Request Bank / UPI Change</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          {kycStatus !== "Verified" && (
            <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <ShieldCheck size={16} />
                <span>{loading ? "Submitting KYC..." : "Submit KYC for Verification"}</span>
              </button>
            </div>
          )}
        </form>
      )}
    </>
  );
}
