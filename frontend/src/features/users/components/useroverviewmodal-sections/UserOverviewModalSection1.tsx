"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  X, User, Mail, Phone, Building2, MapPin, Shield, Calendar, 
  CheckCircle2, Clock, AlertCircle, XCircle, FileText, ExternalLink, 
  CreditCard, Landmark, Eye, Check, RefreshCw, Lock, Award, Send, 
  Printer, Sparkles, UserCheck, Briefcase, DollarSign, Layers,
  Camera, Users, Home, Copy
} from "lucide-react"
import { UserItem, KycStatus } from "@/features/users/types"
import { recordUserAccount, updateUser } from "@/features/users/services/userService"
import { api } from "@/lib/api"
import { saveModuleDataToDB } from "@/lib/storageSync"
import { useAuthStore, getSelectableCompanies, isMatchingCompany } from "@/store/useAuthStore"
import { createNotification } from "@/services/notificationService"
import { sendKycStatusEmailNotification } from "@/services/emailNotificationService"
import { OfferLetterDocument } from "@/features/users/components/OfferLetterDocument"
import { IdentityCardDocument } from "@/features/users/components/IdentityCardDocument"
import { type UserOverviewModalProps, KYC_BADGE_CONFIG } from "@/features/users/components/useroverviewmodal-sections/UserOverviewModalHelpers"

export function UserOverviewModalSection1({ ctrl }: { ctrl: any }) {
  const { activeTab, user, companies, kycConfig, KycIcon, kycStatus, kyc, setPreviewDocUrl, canReviewKyc, handleApproveBankChange, isProcessingAction, handleRejectBankChange, showRejectInput, setShowRejectInput, handleApproveKyc, rejectReason, setRejectReason, handleRejectKyc } = ctrl;
  return (
    <>
      {activeTab === "kyc" && (
            <div className="space-y-6">
              {/* Organization & Location Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-3.5 rounded-2xl bg-surface-hover/20 border border-border/60 space-y-1.5">
                  <div className="flex items-center gap-2 text-muted-foreground font-semibold">
                    <Building2 size={14} className="text-primary" />
                    <span>Assigned Company</span>
                  </div>
                  <p className="text-sm font-bold text-foreground">
                    {user.companyName || (user.companyId === "digital" ? "SAAMPARK Digital Marketing" : "SAAMPARK Technology")}
                  </p>
                  {(() => {
                    const activeCompIds = (user.companyIds && user.companyIds.length > 0 ? user.companyIds : [user.companyId || "tech"])
                      .filter(cId => {
                        const norm = String(cId).toLowerCase().trim()
                        return companies.some(c => String(c.id).toLowerCase().trim() === norm || String(c.slug || "").toLowerCase().trim() === norm)
                      })

                    if (activeCompIds.length > 1) {
                      return (
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          {activeCompIds.map((cId) => {
                            const match = companies.find(c => String(c.id).toLowerCase().trim() === String(cId).toLowerCase().trim() || String(c.slug || "").toLowerCase().trim() === String(cId).toLowerCase().trim())
                            return (
                              <span key={cId} className="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase bg-surface-pressed border border-border text-muted-foreground">
                                {match?.name || cId}
                              </span>
                            )
                          })}
                        </div>
                      )
                    }
                    return null
                  })()}
                </div>

                <div className="p-3.5 rounded-2xl bg-surface-hover/20 border border-border/60 space-y-1.5">
                  <div className="flex items-center gap-2 text-muted-foreground font-semibold">
                    <MapPin size={14} className="text-primary" />
                    <span>Location / Operations</span>
                  </div>
                  <p className="text-sm font-bold text-foreground">
                    {user.branchName && !user.branchName.toLowerCase().includes("all") && !user.branchName.toLowerCase().includes("headquarters")
                      ? user.branchName 
                      : (user.companyName || "Corporate Headquarters (Central Operations)")}
                  </p>
                  <p className="text-[11px] text-muted-foreground">Unit / Dept: {user.department || "Enterprise Operations"}</p>
                </div>
              </div>

              {/* Contact & Meta Data */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-surface-hover/20 border border-border/60">
                <div>
                  <span className="text-[11px] text-muted-foreground font-semibold">Employee ID</span>
                  <p className="font-mono font-bold text-foreground mt-0.5 text-xs text-primary">
                    {user.employeeId || `SP-EMP-${String(user.id).replace(/[^0-9]/g, "").slice(-4).padStart(4, "0") || "0041"}`}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground font-semibold">Phone Number</span>
                  <p className="font-semibold text-foreground mt-0.5 text-xs">{user.phone || "Not provided"}</p>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground font-semibold">Joined Date</span>
                  <p className="font-semibold text-foreground mt-0.5 text-xs">{user.joinedDate || "Recent"}</p>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground font-semibold">Last Active</span>
                  <p className="font-semibold text-foreground mt-0.5 text-xs">{user.lastLogin || "Active"}</p>
                </div>
              </div>

              {/* ── KYC VERIFICATION & BANK DETAILS ────────────────────────────── */}
              <div className="p-5 rounded-3xl bg-surface-hover/30 border border-border space-y-4">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <div className="flex items-center gap-2">
                    <Shield size={16} className="text-primary" />
                    <h4 className="font-bold text-sm text-foreground">KYC Identity & Banking Details</h4>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${kycConfig.bg} ${kycConfig.text}`}>
                    <KycIcon size={12} className={kycStatus === "Processing" ? "animate-spin" : ""} />
                    <span>{kycConfig.label}</span>
                  </span>
                </div>

                {kyc ? (
                  <div className="space-y-5">
                    {/* 1. Passport Photo & Personal Identity Header */}
                    <div className="p-4 rounded-2xl bg-surface border border-border/80 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      {kyc.passportPhotoUrl ? (
                        <div className="relative group shrink-0">
                          <img
                            src={kyc.passportPhotoUrl}
                            alt="Passport Photo"
                            className="w-20 h-24 object-cover rounded-xl border-2 border-primary/30 shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setPreviewDocUrl(kyc.passportPhotoUrl)}
                          />
                          <button
                            type="button"
                            onClick={() => setPreviewDocUrl(kyc.passportPhotoUrl)}
                            className="absolute -bottom-1 -right-1 p-1 bg-primary text-white rounded-lg shadow-sm hover:bg-primary/90"
                            title="View Full Size"
                          >
                            <Eye size={12} />
                          </button>
                        </div>
                      ) : (
                        <div className="w-20 h-24 rounded-xl bg-surface-hover border border-border/80 flex flex-col items-center justify-center text-muted-foreground shrink-0 text-center p-1">
                          <Camera size={20} className="mb-1 text-muted-foreground/60" />
                          <span className="text-[9px] font-semibold">No Passport Pic</span>
                        </div>
                      )}

                      <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                        <div>
                          <span className="text-[10px] text-muted-foreground font-semibold uppercase block">Legal Name</span>
                          <p className="font-bold text-foreground mt-0.5">{kyc.fullName || user.name}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground font-semibold uppercase block">Father / Guardian</span>
                          <p className="font-semibold text-foreground mt-0.5">{kyc.fatherOrGuardianName || "Not specified"}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground font-semibold uppercase block">Date of Birth (DOB)</span>
                          <p className="font-semibold text-foreground mt-0.5">{kyc.dob || "Not provided"}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground font-semibold uppercase block">Gender</span>
                          <p className="font-semibold text-foreground mt-0.5">{kyc.gender || "N/A"}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground font-semibold uppercase block">Blood Group</span>
                          <span className="inline-block px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-[11px] mt-0.5">
                            {kyc.bloodGroup || (user as any).bloodGroup || "O+"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground font-semibold uppercase block">Marital Status</span>
                          <p className="font-semibold text-foreground mt-0.5">{kyc.maritalStatus || "Single"}</p>
                        </div>
                      </div>

                      {/* Pending Bank Detail Change Request (if submitted by team member) */}
                      {kyc.bankChangeRequest && kyc.bankChangeRequest.status === "pending" && (
                        <div className="mt-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                              <AlertCircle size={15} />
                              <span>⚠️ Employee Requested Bank Detail Update</span>
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-200">
                              Submitted {new Date(kyc.bankChangeRequest.requestedAt || Date.now()).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 rounded-lg bg-surface border border-border">
                            <div>
                              <span className="text-[10px] text-muted-foreground uppercase font-bold">New Bank:</span>
                              <p className="font-bold text-foreground">{kyc.bankChangeRequest.bankName}</p>
                            </div>
                            <div>
                              <span className="text-[10px] text-muted-foreground uppercase font-bold">New A/C No:</span>
                              <p className="font-mono font-bold text-foreground">{kyc.bankChangeRequest.accountNumber}</p>
                            </div>
                            <div>
                              <span className="text-[10px] text-muted-foreground uppercase font-bold">New IFSC:</span>
                              <p className="font-mono font-bold text-foreground">{kyc.bankChangeRequest.ifscCode}</p>
                            </div>
                            <div>
                              <span className="text-[10px] text-muted-foreground uppercase font-bold">New UPI:</span>
                              <p className="font-mono font-bold text-foreground">{kyc.bankChangeRequest.upiId || "N/A"}</p>
                            </div>
                          </div>

                          {kyc.bankChangeRequest.reason && (
                            <p className="text-[11px] text-muted-foreground">
                              <span className="font-bold">Reason:</span> {kyc.bankChangeRequest.reason}
                            </p>
                          )}

                          {kyc.bankChangeRequest.bankProofUrl && (
                            <div>
                              <button
                                type="button"
                                onClick={() => setPreviewDocUrl(kyc.bankChangeRequest.bankProofUrl)}
                                className="text-xs text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <Eye size={12} /> View New Cancelled Cheque / Passbook Proof
                              </button>
                            </div>
                          )}

                          {canReviewKyc && (
                            <div className="flex items-center gap-2 pt-1 border-t border-amber-500/20">
                              <button
                                type="button"
                                onClick={handleApproveBankChange}
                                disabled={isProcessingAction}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <Check size={13} /> Approve New Bank Details
                              </button>
                              <button
                                type="button"
                                onClick={handleRejectBankChange}
                                disabled={isProcessingAction}
                                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <X size={13} /> Reject Request
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 2. Emergency Contacts (Contact 1 & Contact 2) */}
                    <div className="p-4 rounded-2xl bg-surface border border-border/80 space-y-2.5">
                      <div className="flex items-center gap-1.5 text-foreground font-bold text-xs">
                        <Users size={14} className="text-primary" />
                        <span>Registered Emergency Contacts</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        {/* Contact 1 */}
                        <div className="p-3 rounded-xl bg-surface-hover/30 border border-border/60 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-primary uppercase">Emergency Contact 1 (Primary)</span>
                            <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                              {kyc.emergencyContact1?.relation || (user as any).emergencyContactRelation || "Family"}
                            </span>
                          </div>
                          <p className="font-bold text-foreground text-sm">
                            {kyc.emergencyContact1?.name || (user as any).emergencyContactName || user.name + " Guardian"}
                          </p>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Phone size={12} className="text-primary" />
                            <a 
                              href={`tel:${kyc.emergencyContact1?.phone || user.emergencyContact || ""}`} 
                              className="font-mono text-xs font-semibold text-primary hover:underline"
                            >
                              {kyc.emergencyContact1?.phone || user.emergencyContact || "Not provided"}
                            </a>
                          </div>
                        </div>

                        {/* Contact 2 */}
                        <div className="p-3 rounded-xl bg-surface-hover/30 border border-border/60 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-indigo-500 uppercase">Emergency Contact 2 (Secondary)</span>
                            <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                              {kyc.emergencyContact2?.relation || "Family"}
                            </span>
                          </div>
                          <p className="font-bold text-foreground text-sm">
                            {kyc.emergencyContact2?.name || "Not provided"}
                          </p>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Phone size={12} className="text-indigo-500" />
                            <a 
                              href={`tel:${kyc.emergencyContact2?.phone || ""}`} 
                              className="font-mono text-xs font-semibold text-indigo-500 hover:underline"
                            >
                              {kyc.emergencyContact2?.phone || "Not provided"}
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Pending Bank Detail Change Request (if submitted by team member) */}
                      {kyc.bankChangeRequest && kyc.bankChangeRequest.status === "pending" && (
                        <div className="mt-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                              <AlertCircle size={15} />
                              <span>⚠️ Employee Requested Bank Detail Update</span>
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-200">
                              Submitted {new Date(kyc.bankChangeRequest.requestedAt || Date.now()).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 rounded-lg bg-surface border border-border">
                            <div>
                              <span className="text-[10px] text-muted-foreground uppercase font-bold">New Bank:</span>
                              <p className="font-bold text-foreground">{kyc.bankChangeRequest.bankName}</p>
                            </div>
                            <div>
                              <span className="text-[10px] text-muted-foreground uppercase font-bold">New A/C No:</span>
                              <p className="font-mono font-bold text-foreground">{kyc.bankChangeRequest.accountNumber}</p>
                            </div>
                            <div>
                              <span className="text-[10px] text-muted-foreground uppercase font-bold">New IFSC:</span>
                              <p className="font-mono font-bold text-foreground">{kyc.bankChangeRequest.ifscCode}</p>
                            </div>
                            <div>
                              <span className="text-[10px] text-muted-foreground uppercase font-bold">New UPI:</span>
                              <p className="font-mono font-bold text-foreground">{kyc.bankChangeRequest.upiId || "N/A"}</p>
                            </div>
                          </div>

                          {kyc.bankChangeRequest.reason && (
                            <p className="text-[11px] text-muted-foreground">
                              <span className="font-bold">Reason:</span> {kyc.bankChangeRequest.reason}
                            </p>
                          )}

                          {kyc.bankChangeRequest.bankProofUrl && (
                            <div>
                              <button
                                type="button"
                                onClick={() => setPreviewDocUrl(kyc.bankChangeRequest.bankProofUrl)}
                                className="text-xs text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <Eye size={12} /> View New Cancelled Cheque / Passbook Proof
                              </button>
                            </div>
                          )}

                          {canReviewKyc && (
                            <div className="flex items-center gap-2 pt-1 border-t border-amber-500/20">
                              <button
                                type="button"
                                onClick={handleApproveBankChange}
                                disabled={isProcessingAction}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <Check size={13} /> Approve New Bank Details
                              </button>
                              <button
                                type="button"
                                onClick={handleRejectBankChange}
                                disabled={isProcessingAction}
                                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <X size={13} /> Reject Request
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 3. Verified Residential Address via India Postal PIN Code */}
                    <div className="p-4 rounded-2xl bg-surface border border-border/80 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-foreground font-bold">
                          <Home size={14} className="text-primary" />
                          <span>Residential Address (India Postal PIN Code Verified)</span>
                        </div>
                        {kyc.currentAddress?.pincode && (
                          <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            PIN: {kyc.currentAddress.pincode}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs p-2.5 rounded-xl bg-surface-hover/20 border border-border/40">
                        <div>
                          <span className="text-[10px] text-muted-foreground">Post Office / Area:</span>
                          <p className="font-semibold text-foreground">{kyc.currentAddress?.postOffice || "Local PO"}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground">City / Town:</span>
                          <p className="font-semibold text-foreground">{kyc.currentAddress?.city || "City"}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground">District:</span>
                          <p className="font-semibold text-foreground">{kyc.currentAddress?.district || "District"}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground">State:</span>
                          <p className="font-semibold text-foreground">{kyc.currentAddress?.state || "State"}</p>
                        </div>
                      </div>

                      <div className="text-xs">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold">Full Address:</span>
                        <p className="font-medium text-foreground mt-0.5">
                          {kyc.currentAddress?.fullAddress || kyc.currentAddress?.streetAddress || (user as any).address || "Address not submitted"}
                        </p>
                      </div>
                    </div>

                    {/* 4. Government Identity Proofs */}
                    <div className="p-4 rounded-2xl bg-surface border border-border/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-foreground font-bold text-xs">
                          <FileText size={14} className="text-primary" />
                          <span>Government Identity Documents ({kyc.docType || "Aadhaar Card"})</span>
                        </div>
                        <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded-lg bg-surface-hover border border-border">
                          No: {kyc.docNumber || "N/A"}
                        </span>
                      </div>

                      {(kyc.docFrontUrl || kyc.docBackUrl || kyc.panDocUrl) ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {kyc.docFrontUrl && (
                            <div className="relative group border border-border rounded-xl overflow-hidden bg-surface p-2 space-y-1 text-center">
                              <p className="text-[10px] font-bold text-muted-foreground uppercase">{kyc.docType || "ID"} Front Photo</p>
                              <img
                                src={kyc.docFrontUrl}
                                alt="Front Document"
                                className="w-full h-28 object-contain rounded-lg cursor-pointer hover:opacity-90 transition-opacity bg-black/5 dark:bg-black/40"
                                onClick={() => setPreviewDocUrl(kyc.docFrontUrl)}
                              />
                              <button
                                type="button"
                                onClick={() => setPreviewDocUrl(kyc.docFrontUrl)}
                                className="w-full py-1 text-center text-[10px] font-bold text-primary hover:underline flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Eye size={11} /> View Full Size
                              </button>
                            </div>
                          )}

                          {kyc.docBackUrl && (
                            <div className="relative group border border-border rounded-xl overflow-hidden bg-surface p-2 space-y-1 text-center">
                              <p className="text-[10px] font-bold text-muted-foreground uppercase">{kyc.docType || "ID"} Back Photo</p>
                              <img
                                src={kyc.docBackUrl}
                                alt="Back Document"
                                className="w-full h-28 object-contain rounded-lg cursor-pointer hover:opacity-90 transition-opacity bg-black/5 dark:bg-black/40"
                                onClick={() => setPreviewDocUrl(kyc.docBackUrl)}
                              />
                              <button
                                type="button"
                                onClick={() => setPreviewDocUrl(kyc.docBackUrl)}
                                className="w-full py-1 text-center text-[10px] font-bold text-primary hover:underline flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Eye size={11} /> View Full Size
                              </button>
                            </div>
                          )}

                          {kyc.panDocUrl && (
                            <div className="relative group border border-border rounded-xl overflow-hidden bg-surface p-2 space-y-1 text-center">
                              <p className="text-[10px] font-bold text-muted-foreground uppercase">PAN Card Photo ({kyc.panNumber || "PAN"})</p>
                              <img
                                src={kyc.panDocUrl}
                                alt="PAN Document"
                                className="w-full h-28 object-contain rounded-lg cursor-pointer hover:opacity-90 transition-opacity bg-black/5 dark:bg-black/40"
                                onClick={() => setPreviewDocUrl(kyc.panDocUrl)}
                              />
                              <button
                                type="button"
                                onClick={() => setPreviewDocUrl(kyc.panDocUrl)}
                                className="w-full py-1 text-center text-[10px] font-bold text-primary hover:underline flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Eye size={11} /> View Full Size
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">No document image files uploaded yet.</p>
                      )}
                    </div>

                    {/* 5. Bank Remittance Details & Uploaded Passbook/Statement */}
                    <div className="p-4 rounded-2xl bg-surface border border-border/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          <Landmark size={14} className="text-emerald-500" />
                          <span>Salary Remittance Bank Details &amp; Passbook Proof</span>
                        </span>
                        {kyc.bankProofUrl && (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            Passbook Document Uploaded
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Bank Details Table */}
                        <div className="md:col-span-2 grid grid-cols-2 gap-2.5 text-xs p-3 rounded-xl bg-surface-hover/20 border border-border/40">
                          <div>
                            <span className="text-muted-foreground text-[10px] uppercase font-bold">Bank Name:</span>
                            <p className="font-semibold text-foreground text-sm">{kyc.bankName || "Not provided"}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground text-[10px] uppercase font-bold">Account Holder:</span>
                            <p className="font-semibold text-foreground text-sm">{kyc.accountHolderName || kyc.fullName || user.name}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground text-[10px] uppercase font-bold">Account Number:</span>
                            <p className="font-mono font-bold text-foreground text-sm">{kyc.accountNumber || "N/A"}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground text-[10px] uppercase font-bold">IFSC Code:</span>
                            <p className="font-mono font-bold text-foreground text-sm">{kyc.ifscCode || "N/A"}</p>
                          </div>
                          {kyc.bankBranch && (
                            <div>
                              <span className="text-muted-foreground text-[10px] uppercase font-bold">Branch:</span>
                              <p className="font-semibold text-foreground">{kyc.bankBranch}</p>
                            </div>
                          )}
                          {kyc.upiId && (
                            <div>
                              <span className="text-muted-foreground text-[10px] uppercase font-bold">UPI ID:</span>
                              <p className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">{kyc.upiId}</p>
                            </div>
                          )}
                        </div>

                        {/* Passbook / Statement Image Preview */}
                        <div className="md:col-span-1 border border-emerald-500/30 rounded-xl p-2 bg-emerald-500/5 text-center space-y-1">
                          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase block">
                            Bank Passbook / Statement
                          </span>
                          {kyc.bankProofUrl ? (
                            <>
                              <img
                                src={kyc.bankProofUrl}
                                alt="Bank Passbook / Statement"
                                className="w-full h-24 object-contain rounded-lg cursor-pointer hover:opacity-90 transition-opacity bg-black/10 dark:bg-black/40"
                                onClick={() => setPreviewDocUrl(kyc.bankProofUrl)}
                              />
                              <button
                                type="button"
                                onClick={() => setPreviewDocUrl(kyc.bankProofUrl)}
                                className="w-full py-1 text-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Eye size={11} /> View Passbook Full Size
                              </button>
                            </>
                          ) : (
                            <div className="h-24 flex items-center justify-center text-[11px] text-muted-foreground">
                              No passbook photo attached
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Pending Bank Detail Change Request (if submitted by team member) */}
                      {kyc.bankChangeRequest && kyc.bankChangeRequest.status === "pending" && (
                        <div className="mt-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                              <AlertCircle size={15} />
                              <span>⚠️ Employee Requested Bank Detail Update</span>
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-200">
                              Submitted {new Date(kyc.bankChangeRequest.requestedAt || Date.now()).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 rounded-lg bg-surface border border-border">
                            <div>
                              <span className="text-[10px] text-muted-foreground uppercase font-bold">New Bank:</span>
                              <p className="font-bold text-foreground">{kyc.bankChangeRequest.bankName}</p>
                            </div>
                            <div>
                              <span className="text-[10px] text-muted-foreground uppercase font-bold">New A/C No:</span>
                              <p className="font-mono font-bold text-foreground">{kyc.bankChangeRequest.accountNumber}</p>
                            </div>
                            <div>
                              <span className="text-[10px] text-muted-foreground uppercase font-bold">New IFSC:</span>
                              <p className="font-mono font-bold text-foreground">{kyc.bankChangeRequest.ifscCode}</p>
                            </div>
                            <div>
                              <span className="text-[10px] text-muted-foreground uppercase font-bold">New UPI:</span>
                              <p className="font-mono font-bold text-foreground">{kyc.bankChangeRequest.upiId || "N/A"}</p>
                            </div>
                          </div>

                          {kyc.bankChangeRequest.reason && (
                            <p className="text-[11px] text-muted-foreground">
                              <span className="font-bold">Reason:</span> {kyc.bankChangeRequest.reason}
                            </p>
                          )}

                          {kyc.bankChangeRequest.bankProofUrl && (
                            <div>
                              <button
                                type="button"
                                onClick={() => setPreviewDocUrl(kyc.bankChangeRequest.bankProofUrl)}
                                className="text-xs text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <Eye size={12} /> View New Cancelled Cheque / Passbook Proof
                              </button>
                            </div>
                          )}

                          {canReviewKyc && (
                            <div className="flex items-center gap-2 pt-1 border-t border-amber-500/20">
                              <button
                                type="button"
                                onClick={handleApproveBankChange}
                                disabled={isProcessingAction}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <Check size={13} /> Approve New Bank Details
                              </button>
                              <button
                                type="button"
                                onClick={handleRejectBankChange}
                                disabled={isProcessingAction}
                                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <X size={13} /> Reject Request
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Rejection Note if Rejected */}
                    {kycStatus === "Rejected" && kyc.rejectionReason && (
                      <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 space-y-1">
                        <span className="font-bold flex items-center gap-1.5">
                          <XCircle size={14} /> Rejection Reason / Note:
                        </span>
                        <p>{kyc.rejectionReason}</p>
                      </div>
                    )}

                    {/* Verification Metadata if Verified */}
                    {kycStatus === "Verified" && kyc.verifiedAt && (
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                        <CheckCircle2 size={14} />
                        <span>Verified on {new Date(kyc.verifiedAt).toLocaleDateString()} by {kyc.verifiedBy || "Super Admin"}</span>
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="py-6 text-center text-muted-foreground space-y-1">
                    <Clock size={24} className="mx-auto text-muted-foreground/60 mb-2" />
                    <p className="font-bold">No KYC documents or bank details submitted yet.</p>
                    <p className="text-[11px]">The team member will be prompted to complete onboarding upon login.</p>
                  </div>
                )}

                {/* ── SUPER ADMIN / ADMIN / BRANCH ADMIN KYC DECISION BUTTONS ──────────────────── */}
                {canReviewKyc && kycStatus !== "Verified" && (
                  <div className="pt-3 border-t border-border/50 space-y-2">
                    {!showRejectInput ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowRejectInput(true)}
                          disabled={isProcessingAction}
                          className="px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 text-xs font-bold hover:bg-rose-100 transition-colors cursor-pointer"
                        >
                          Reject KYC
                        </button>
                        <button
                          type="button"
                          onClick={handleApproveKyc}
                          disabled={isProcessingAction}
                          className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <CheckCircle2 size={14} className="text-white" />
                          <span>Approve KYC &amp; Send Success Email</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2 bg-surface p-3.5 rounded-2xl border border-rose-300 dark:border-rose-800">
                        <label className="block text-xs font-semibold text-foreground">
                          Reason for Rejection:
                        </label>
                        <input
                          type="text"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="e.g. Document image is blurry or expired. Please re-upload a clear photo."
                          className="w-full px-3 py-1.5 rounded-xl bg-surface border border-border text-xs focus:outline-hidden focus:border-rose-500"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setShowRejectInput(false)}
                            className="px-3 py-1 rounded-lg text-muted-foreground hover:text-foreground font-medium"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleRejectKyc}
                            disabled={isProcessingAction}
                            className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
                          >
                            Confirm Rejection
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
    </>
  );
}
