"use client"

import * as React from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Clock,
  AlertCircle,
  CheckCircle2,
  FileText,
  Upload,
  MapPin,
  Phone,
  Mail,
  Landmark,
  RefreshCw,
  LogOut,
  ArrowRight,
  ShieldAlert,
  Camera,
  X,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { updateUser, getUsers } from "@/features/users/services/userService";
import { api } from "@/lib/api";
import { uploadToImgBB } from "@/lib/imgbbUpload";
import { createNotification } from "@/services/notificationService";
import { RELATIONSHIP_OPTIONS, checkIsVerified, type ContentProps } from "@/components/auth/components/employeekycgate-sections/EmployeeKycGateHelpers"

export function EmployeeKycGateSection1({ ctrl }: { ctrl: any }) {
  const { showForm, isReuploading, setIsReuploading, logout, effectiveUser, rawKyc, fullName, bloodGroup, phone, docType, bankName, ifscCode, statusMessage, handleCheckStatus, isRefreshing } = ctrl;
  return (
    <>
      {/* Top Header Card */}
        <div className="bg-linear-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl shadow-2xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck size={14} className="text-indigo-400" />
              <span>
                SAAMPARK Group • Team Member Onboarding &amp; Verification
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {showForm
                ? "Complete Team Member Onboarding"
                : "KYC Documents Under Review"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              {showForm
                ? "Please fill out your official profile, emergency contacts, address with PIN Code, identity documents, and salary remittance bank passbook."
                : "Your onboarding credentials have been submitted safely and are currently under verification by management."}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
            {isReuploading && (
              <button
                type="button"
                onClick={() => setIsReuploading(false)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-indigo-200 hover:text-white bg-indigo-900/60 hover:bg-indigo-800 border border-indigo-700/60 rounded-xl transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <span>Back to Status</span>
              </button>
            )}
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-rose-300 hover:text-white bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 rounded-xl transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <LogOut size={14} />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* ─── CASE A: PENDING REVIEW SCREEN ─────────────────────────────────── */}
        {!showForm && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-xl space-y-8 text-zinc-900 dark:text-zinc-100"
          >
            {/* Status Hero */}
            <div className="flex flex-col items-center text-center space-y-4 py-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-amber-500/10 border-2 border-amber-500/40 flex items-center justify-center text-amber-500 shadow-xl shadow-amber-500/10">
                  <Clock size={38} className="animate-pulse" />
                </div>
                <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-amber-500 border-2 border-white dark:border-zinc-900 flex items-center justify-center text-white text-[11px] font-bold">
                  !
                </span>
              </div>

              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                  <Clock size={12} />
                  <span>Verification Pending Approval</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black">
                  Documents Under Review by Management
                </h2>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto">
                  Your KYC credentials, emergency contacts, and bank passbook
                  details have been submitted. An Administrator or your Branch
                  Lead ({effectiveUser?.branchName || "Main Office"}) will
                  verify and approve your account shortly.
                </p>
              </div>
            </div>

            {/* Submitted Summary Details Card */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Profile Photo & Personal */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                  Identity Profile:
                </span>
                <div className="flex items-center gap-3">
                  {rawKyc?.passportPhotoUrl ? (
                    <img
                      src={rawKyc.passportPhotoUrl}
                      alt="Passport"
                      className="w-12 h-12 rounded-xl object-cover border border-indigo-500/30"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-600 flex items-center justify-center font-bold text-sm">
                      {fullName.substring(0, 2).toUpperCase() || "SP"}
                    </div>
                  )}
                  <div>
                    <h4 className="text-xs font-bold text-foreground">
                      {rawKyc?.fullName || fullName || effectiveUser?.name}
                    </h4>
                    <p className="text-[10px] text-zinc-500">
                      Blood Group: {rawKyc?.bloodGroup || bloodGroup}
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      {phone || effectiveUser?.phone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Govt Identity Document */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                  Government Identity:
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <FileText size={14} className="text-indigo-500" />
                    <span>{rawKyc?.docType || docType}</span>
                  </span>
                  <span className="font-mono text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                    {rawKyc?.docNumber
                      ? `•••• •••• ${String(rawKyc.docNumber).slice(-4)}`
                      : "Submitted"}
                  </span>
                </div>
                {rawKyc?.submittedAt && (
                  <p className="text-[10px] text-zinc-500">
                    Submitted:{" "}
                    {new Date(rawKyc.submittedAt).toLocaleDateString("en-IN", {
                      dateStyle: "medium",
                    })}
                  </p>
                )}
              </div>

              {/* Bank Passbook & Account */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                  Salary Bank Remittance:
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Landmark size={14} className="text-emerald-500" />
                    <span>{rawKyc?.bankName || bankName || "Bank"}</span>
                  </span>
                  <span className="font-mono text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                    {rawKyc?.accountNumber
                      ? `•••• ${String(rawKyc.accountNumber).slice(-4)}`
                      : "Uploaded"}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500">
                  IFSC:{" "}
                  <strong className="font-mono text-zinc-700 dark:text-zinc-300">
                    {rawKyc?.ifscCode || ifscCode || "N/A"}
                  </strong>
                  {rawKyc?.bankProofUrl && " • Passbook Uploaded"}
                </p>
              </div>
            </div>

            {/* Emergency Contacts Summary Card */}
            {(rawKyc?.emergencyContact1?.name ||
              rawKyc?.emergencyContact2?.name) && (
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 space-y-2 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                  Registered Emergency Contacts:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {rawKyc?.emergencyContact1?.name && (
                    <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-border/60">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">
                        Contact 1 (
                        {rawKyc.emergencyContact1.relation || "Emergency"})
                      </span>
                      <p className="font-bold text-foreground mt-0.5">
                        {rawKyc.emergencyContact1.name}
                      </p>
                      <p className="font-mono text-[11px] text-primary">
                        {rawKyc.emergencyContact1.phone}
                      </p>
                    </div>
                  )}
                  {rawKyc?.emergencyContact2?.name && (
                    <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-border/60">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">
                        Contact 2 (
                        {rawKyc.emergencyContact2.relation || "Emergency"})
                      </span>
                      <p className="font-bold text-foreground mt-0.5">
                        {rawKyc.emergencyContact2.name}
                      </p>
                      <p className="font-mono text-[11px] text-primary">
                        {rawKyc.emergencyContact2.phone}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Email Notification Notice */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 flex items-start gap-3 text-xs text-indigo-900 dark:text-indigo-200">
              <Mail size={18} className="text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">
                  Instant Activation upon Management Approval:
                </strong>
                <span>
                  Once verified by management, you will receive an official
                  approval email at <strong>{effectiveUser?.email}</strong> and
                  your CRM portal will unlock automatically in this window.
                </span>
              </div>
            </div>

            {statusMessage && (
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-center text-xs font-bold text-blue-700 dark:text-blue-300">
                {statusMessage}
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setIsReuploading(true)}
                className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
              >
                Edit or Re-upload Information
              </button>

              <button
                type="button"
                onClick={handleCheckStatus}
                disabled={isRefreshing}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw
                  size={14}
                  className={isRefreshing ? "animate-spin" : ""}
                />
                <span>
                  {isRefreshing
                    ? "Checking Server..."
                    : "Check Verification Status"}
                </span>
              </button>
            </div>
          </motion.div>
        )}
    </>
  );
}
