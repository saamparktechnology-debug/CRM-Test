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

export function UserOverviewModalSection2({ ctrl }: { ctrl: any }) {
  const { activeTab, selectableCompanies, selectedCompanyId, setSelectedCompanyId, selectedBranchId, setSelectedBranchId, branches, customDesignation, setCustomDesignation, customDepartment, setCustomDepartment, customCtc, setCustomCtc, customMonthlySalary, setCustomMonthlySalary, customReportingManager, setCustomReportingManager, customJoiningDate, setCustomJoiningDate, user, resolvedCompany, resolvedBranch, resolvedSubBranch, customProbationPeriod, setCustomProbationPeriod, customWorkingHours, setCustomWorkingHours, customWorkMode, setCustomWorkMode, handleSendDocumentEmail, isSendingEmail } = ctrl;
  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════════
              TAB 2: OFFICIAL OFFER LETTER STUDIO
             ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === "offer_letter" && (
            <div className="space-y-4">
              {/* Entity & Offer Customization Selector Bar */}
              <div className="p-4 rounded-2xl bg-surface-hover/30 border border-border space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Sparkles size={14} className="text-primary" />
                    <span>Offer Letter Customization Controls</span>
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    All fields below update the letter live; you can also click directly on any text on the A4 page to edit!
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {/* Select Company */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Building2 size={12} className="text-primary" />
                        <span>Issuing Company:</span>
                      </span>
                      {selectableCompanies.length <= 1 && (
                        <span className="text-[9px] text-blue-600 font-bold bg-blue-50 dark:bg-blue-950/40 px-1 py-0.2 rounded border border-blue-200 dark:border-blue-800">
                          🔒 Active Company
                        </span>
                      )}
                    </label>
                    <select
                      value={selectedCompanyId}
                      onChange={(e) => setSelectedCompanyId(e.target.value)}
                      disabled={selectableCompanies.length <= 1}
                      className="w-full px-3 py-1.5 rounded-xl bg-surface border border-border text-xs font-semibold focus:outline-hidden cursor-pointer disabled:opacity-85 disabled:cursor-not-allowed"
                    >
                      {selectableCompanies.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} {c.brand_name ? `(${c.brand_name})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Select Branch */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
                      <MapPin size={12} className="text-primary" />
                      <span>Issuing Branch / Hub:</span>
                    </label>
                    <select
                      value={selectedBranchId}
                      onChange={(e) => setSelectedBranchId(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-surface border border-border text-xs font-semibold focus:outline-hidden cursor-pointer"
                    >
                      <option value="">Default Headquarters</option>
                      {branches.filter(b => !selectedCompanyId || String(b.company_id) === String(selectedCompanyId)).map(b => (
                        <option key={b.id} value={b.id}>
                          {b.name} {b.city ? `(${b.city})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Designation / Role */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
                      <Briefcase size={12} className="text-primary" />
                      <span>Appointed Designation:</span>
                    </label>
                    <input
                      type="text"
                      value={customDesignation}
                      onChange={(e) => setCustomDesignation(e.target.value)}
                      placeholder="e.g. Senior Software Engineer"
                      className="w-full px-3 py-1.5 rounded-xl bg-surface border border-border text-xs font-semibold focus:outline-hidden"
                    />
                  </div>

                  {/* Department */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
                      <Layers size={12} className="text-primary" />
                      <span>Department:</span>
                    </label>
                    <input
                      type="text"
                      value={customDepartment}
                      onChange={(e) => setCustomDepartment(e.target.value)}
                      placeholder="e.g. Technology & Engineering"
                      className="w-full px-3 py-1.5 rounded-xl bg-surface border border-border text-xs font-semibold focus:outline-hidden"
                    />
                  </div>

                  {/* Offer Salary (Annual CTC) */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
                      <DollarSign size={12} className="text-primary" />
                      <span>Annual Cost to Company (CTC):</span>
                    </label>
                    <input
                      type="text"
                      value={customCtc}
                      onChange={(e) => setCustomCtc(e.target.value)}
                      placeholder="e.g. ₹4,80,000 per Annum (INR 4.8 LPA)"
                      className="w-full px-3 py-1.5 rounded-xl bg-surface border border-border text-xs font-bold font-mono focus:outline-hidden"
                    />
                  </div>

                  {/* Monthly Gross Salary */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
                      <DollarSign size={12} className="text-emerald-500" />
                      <span>Monthly Gross Compensation:</span>
                    </label>
                    <input
                      type="text"
                      value={customMonthlySalary}
                      onChange={(e) => setCustomMonthlySalary(e.target.value)}
                      placeholder="e.g. ₹40,000 / Month (Gross)"
                      className="w-full px-3 py-1.5 rounded-xl bg-surface border border-border text-xs font-semibold font-mono focus:outline-hidden"
                    />
                  </div>

                  {/* Reporting Manager */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
                      <User size={12} className="text-primary" />
                      <span>Reporting Authority:</span>
                    </label>
                    <input
                      type="text"
                      value={customReportingManager}
                      onChange={(e) => setCustomReportingManager(e.target.value)}
                      placeholder="e.g. Head of Engineering / Branch Lead"
                      className="w-full px-3 py-1.5 rounded-xl bg-surface border border-border text-xs font-semibold focus:outline-hidden"
                    />
                  </div>

                  {/* Joining Date */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
                      <Calendar size={12} className="text-primary" />
                      <span>Date of Joining:</span>
                    </label>
                    <input
                      type="date"
                      value={customJoiningDate}
                      onChange={(e) => setCustomJoiningDate(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-surface border border-border text-xs font-bold focus:outline-hidden cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Offer Letter A4 Document Canvas */}
              <div className="overflow-x-auto p-2 flex justify-center bg-zinc-100 dark:bg-zinc-950/60 rounded-3xl border border-border/80">
                <OfferLetterDocument
                  user={user}
                  company={resolvedCompany}
                  branch={resolvedBranch}
                  subBranch={resolvedSubBranch}
                  interactive={true}
                  joiningDate={customJoiningDate}
                  onJoiningDateChange={setCustomJoiningDate}
                  designation={customDesignation}
                  onDesignationChange={setCustomDesignation}
                  ctc={customCtc}
                  onCtcChange={setCustomCtc}
                  monthlySalary={customMonthlySalary}
                  onMonthlySalaryChange={setCustomMonthlySalary}
                  department={customDepartment}
                  onDepartmentChange={setCustomDepartment}
                  reportingManager={customReportingManager}
                  onReportingManagerChange={setCustomReportingManager}
                  probationPeriod={customProbationPeriod}
                  onProbationPeriodChange={setCustomProbationPeriod}
                  workingHours={customWorkingHours}
                  onWorkingHoursChange={setCustomWorkingHours}
                  workMode={customWorkMode}
                  onWorkModeChange={setCustomWorkMode}
                  onSendEmail={() => handleSendDocumentEmail("offer_letter")}
                  isSendingEmail={isSendingEmail}
                />
              </div>
            </div>
          )}
    </>
  );
}
