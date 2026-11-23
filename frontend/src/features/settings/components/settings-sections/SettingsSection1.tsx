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

export function SettingsSection1({ ctrl }: { ctrl: any }) {
  const { data: masterBundle } = useMasterBundle()
  const { activeTab, handleSaveProfile, avatar, name, fileInputRef, isUploadingAvatar, user, handlePhotoUpload, setAvatar, isSuperAdmin, setName, email, phone, setPhone, department, setDepartment, location, setLocation, jobTitle, setJobTitle, skills, setSkills, bio, setBio, username, setUsername, handleOpenUsernameConfirm, usernameStatus, isSavingUsername, usernameStatusMsg, currentPassword, setCurrentPassword, newPassword, setNewPassword, confirmPassword, setConfirmPassword, loading } = ctrl;
  return (
    <>
      {activeTab === "profile" && (
        <form onSubmit={handleSaveProfile} className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-2xs space-y-6">
          {/* Avatar Upload Card */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-5 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60">
            <div className="relative group shrink-0">
              <img
                src={avatar}
                alt={name}
                className="w-24 h-24 rounded-2xl object-cover border-4 border-white dark:border-zinc-800 shadow-md bg-transparent"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-bold transition-opacity cursor-pointer"
                title="Upload Profile Picture"
              >
                {isUploadingAvatar ? <RefreshCw size={20} className="animate-spin" /> : <Camera size={20} className="mb-0.5" />}
                <span>{isUploadingAvatar ? "Uploading..." : "Change"}</span>
              </button>
            </div>

            <div className="space-y-2 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">{name || "User Account"}</h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
                  {user?.role}
                </span>
                {user?.branchName && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    📍 {user.branchName}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 max-w-xl">
                Upload your profile photo from your device. Your photo is permanently hosted on cloud storage and live-synced across Topbar, Leads, Tasks, and Account Overview.
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Upload size={13} />
                  <span>{isUploadingAvatar ? "Uploading to Cloud..." : "Upload Profile Photo"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAvatar(`https://api.dicebear.com/7.x/notionists/svg?seed=${name || Date.now()}`)}
                  className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-semibold transition-colors"
                >
                  Random Avatar
                </button>
              </div>
            </div>
          </div>

          {!isSuperAdmin && (
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-2.5 text-xs text-amber-700 dark:text-amber-300">
              <Lock size={16} className="shrink-0 mt-0.5" />
              <span>
                <strong>Organization Policy:</strong> Your core identity details (Name, Email, Phone, Department, Company Address) are managed by Super Admin and cannot be modified here. Contact your administrator if corrections are required.
              </span>
            </div>
          )}

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">
                Full Name {isSuperAdmin ? "*" : "(Locked)"}
              </label>
              <input
                type="text"
                required
                disabled={!isSuperAdmin}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border transition-all ${
                  isSuperAdmin
                    ? "bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 focus:ring-1 focus:ring-blue-500"
                    : "bg-zinc-100 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700 text-muted-foreground cursor-not-allowed opacity-80"
                }`}
              />
            </div>

            <div>
              <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">
                Email Address (Locked)
              </label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full px-3 py-2 bg-zinc-100 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 rounded-xl text-muted-foreground cursor-not-allowed opacity-80 font-mono"
              />
            </div>

            <div>
              <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">
                Phone Number {isSuperAdmin ? "" : "(Locked)"}
              </label>
              <input
                type="text"
                disabled={!isSuperAdmin}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                className={`w-full px-3 py-2 rounded-xl border transition-all ${
                  isSuperAdmin
                    ? "bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 focus:ring-1 focus:ring-blue-500"
                    : "bg-zinc-100 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700 text-muted-foreground cursor-not-allowed opacity-80"
                }`}
              />
            </div>

            <div>
              <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">
                Department {isSuperAdmin ? "" : "(Locked)"}
              </label>
              {isSuperAdmin ? (
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-1 focus:ring-blue-500"
                >
                  {(masterBundle?.options?.["department"] || []).map((opt) => (
                  <option key={opt.id} value={opt.value}>{opt.label}</option>
                ))}
                </select>
              ) : (
                <input
                  type="text"
                  disabled
                  value={department || "Assigned by Administrator"}
                  className="w-full px-3 py-2 bg-zinc-100 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 rounded-xl text-muted-foreground cursor-not-allowed opacity-80"
                />
              )}
            </div>

            <div>
              <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">
                Office Location / City {isSuperAdmin ? "" : "(Locked)"}
              </label>
              <input
                type="text"
                disabled={!isSuperAdmin}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Kolkata, India"
                className={`w-full px-3 py-2 rounded-xl border transition-all ${
                  isSuperAdmin
                    ? "bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 focus:ring-1 focus:ring-blue-500"
                    : "bg-zinc-100 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700 text-muted-foreground cursor-not-allowed opacity-80"
                }`}
              />
            </div>

            <div>
              <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Job Title / Designation</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Senior Project Manager"
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1 text-xs">Skills & Specializations</label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. Next.js, React, Node.js, UI/UX, Sales Lead, Client Management"
              className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1 text-xs">Professional Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell team members and clients about your responsibilities..."
              className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* ── CUSTOM USERNAME & DUAL LOGIN SECTION ── */}
          <div className="p-4 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5 dark:from-blue-500/10 dark:via-indigo-500/10 dark:to-purple-500/10 rounded-2xl border border-blue-200/50 dark:border-blue-800/40 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-foreground font-bold text-xs">
                <Tag size={15} className="text-blue-600 dark:text-blue-400" />
                <span>Custom Username & Dual Login</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  Login with Email or Username
                </span>
              </div>
              {user?.username && (
                <span className="text-[11px] font-mono text-zinc-500 bg-white dark:bg-zinc-800 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
                  Current: <strong className="text-foreground">@{user.username}</strong>
                </span>
              )}
            </div>

            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Set a unique personal username. Once saved, you can log into the CRM using either your registered email address or your username.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-xs">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  placeholder="choose_username"
                  maxLength={30}
                  className="w-full pl-7 pr-3 py-2 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <button
                type="button"
                onClick={handleOpenUsernameConfirm}
                disabled={usernameStatus !== "available" || isSavingUsername}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <Save size={13} />
                <span>Set Username</span>
              </button>
            </div>

            {/* Status indicator */}
            {usernameStatusMsg && (
              <div className="flex items-center gap-1.5 text-[11px] pt-0.5">
                {usernameStatus === "checking" && (
                  <>
                    <RefreshCw size={12} className="animate-spin text-blue-500" />
                    <span className="text-blue-500">{usernameStatusMsg}</span>
                  </>
                )}
                {usernameStatus === "available" && (
                  <>
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{usernameStatusMsg}</span>
                  </>
                )}
                {usernameStatus === "taken" && (
                  <>
                    <AlertCircle size={12} className="text-rose-500" />
                    <span className="text-rose-600 dark:text-rose-400 font-semibold">{usernameStatusMsg}</span>
                  </>
                )}
                {usernameStatus === "invalid" && (
                  <>
                    <AlertCircle size={12} className="text-amber-500" />
                    <span className="text-amber-600 dark:text-amber-400">{usernameStatusMsg}</span>
                  </>
                )}
                {usernameStatus === "idle" && (
                  <span className="text-zinc-500 dark:text-zinc-400">{usernameStatusMsg}</span>
                )}
              </div>
            )}
          </div>

          {/* ── SECURE PASSWORD CHANGE SECTION ── */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60 space-y-3">
            <div className="flex items-center gap-2 text-foreground font-bold text-xs">
              <Key size={14} className="text-primary" />
              <span>Change Password (Requires Previous/Current Password Verification)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 font-medium mb-1">Current Password *</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 font-medium mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 font-medium mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Save size={14} />
              <span>{loading ? "Saving Profile..." : "Save Complete Profile"}</span>
            </button>
          </div>
        </form>
      )}
    </>
  );
}
