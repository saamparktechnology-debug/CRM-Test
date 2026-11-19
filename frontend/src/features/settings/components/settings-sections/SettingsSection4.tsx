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

export function SettingsSection4({ ctrl }: { ctrl: any }) {
  const { activeTab, isSuperAdmin, handleSaveSmtp, activeSmtpCompany, selectedSmtpCompanyId, effectiveCompanies, companySmtpMap, getInitialSmtpForCompany, setSelectedSmtpCompanyId, setSmtpTestResult, setSmtpTestRecipient, applySmtpPreset, currentSmtp, updateCurrentSmtp, smtpTestRecipient, setShowSmtpPass, showSmtpPass, isTestingSmtp, handleTestSmtpConnection, smtpTestResult, loading } = ctrl;
  return (
    <>
      {/* ── TAB 3: MULTI-COMPANY SMTP SETUP (Super Admin Only) ─────────────── */}
      {activeTab === "smtp" && isSuperAdmin && (
        <form onSubmit={handleSaveSmtp} className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 space-y-6 max-w-4xl text-xs shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-4">
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Mail size={18} className="text-blue-600" />
                <span>Multi-Company SMTP Mail Server Configurations</span>
              </h3>
              <p className="text-muted-foreground text-xs mt-0.5">
                Configure separate SMTP credentials and email dispatch gateways for each company in SAAMPARK Group.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shrink-0 w-fit">
              Super Admin Exclusive
            </span>
          </div>

          {/* 🏢 Company Switcher Tabs */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 rounded-2xl space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-bold text-zinc-800 dark:text-zinc-200 text-xs flex items-center gap-1.5">
                <Building2 size={14} className="text-blue-600" />
                <span>Select Company to Configure SMTP:</span>
              </span>
              <span className="text-[11px] text-zinc-500">
                Active Gateway: <strong className="text-zinc-800 dark:text-zinc-200">{activeSmtpCompany?.name || selectedSmtpCompanyId}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap pt-1">
              {effectiveCompanies.map((comp) => {
                const compKey = String(comp.id || comp.slug || "").toLowerCase()
                const isSelected = compKey === String(selectedSmtpCompanyId).toLowerCase() || String(comp.slug || '').toLowerCase() === String(selectedSmtpCompanyId).toLowerCase()
                const cSmtp = companySmtpMap[comp.id] || getInitialSmtpForCompany(comp, comp.id)
                const isConfigured = Boolean(cSmtp.user && cSmtp.pass)

                return (
                  <button
                    key={comp.id}
                    type="button"
                    onClick={() => {
                      setSelectedSmtpCompanyId(comp.id)
                      setSmtpTestResult(null)
                      if (cSmtp.user) setSmtpTestRecipient(cSmtp.user)
                    }}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 ring-2 ring-blue-500/30"
                        : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <span className="text-sm">{comp.id === "consultancy" || String(comp.name).toLowerCase().includes("consult") ? "💼" : "🏢"}</span>
                    <span className="font-semibold">{comp.brand_name ? `${comp.brand_name} ${comp.division_name || comp.name || ""}`.trim() : comp.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isSelected
                        ? "bg-white/25 text-white"
                        : isConfigured
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                    }`}>
                      {isConfigured ? "✅ Configured" : "⚠️ Empty / Unset"}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[11px] text-blue-900 dark:text-blue-200 mt-2">
              ℹ️ Users who log in under <strong>{activeSmtpCompany?.name || selectedSmtpCompanyId}</strong> will only dispatch and receive emails through this dedicated SMTP channel.
            </div>
          </div>

          {/* Quick Presets for Selected Company */}
          <div className="space-y-1.5">
            <label className="block font-bold text-foreground text-[11px]">Mail Provider Preset for {activeSmtpCompany?.name}:</label>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => applySmtpPreset("gmail")}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  currentSmtp.preset === "gmail"
                    ? "bg-red-600 text-white shadow-sm"
                    : "bg-surface border border-border text-foreground hover:bg-surface-hover"
                }`}
              >
                <span>Gmail / Google Workspace</span>
              </button>
              <button
                type="button"
                onClick={() => applySmtpPreset("zoho")}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  currentSmtp.preset === "zoho"
                    ? "bg-amber-600 text-white shadow-sm"
                    : "bg-surface border border-border text-foreground hover:bg-surface-hover"
                }`}
              >
                <span>Zoho Mail</span>
              </button>
              <button
                type="button"
                onClick={() => applySmtpPreset("outlook")}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  currentSmtp.preset === "outlook"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-surface border border-border text-foreground hover:bg-surface-hover"
                }`}
              >
                <span>Outlook / Microsoft 365</span>
              </button>
              <button
                type="button"
                onClick={() => applySmtpPreset("custom")}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  currentSmtp.preset === "custom"
                    ? "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900 shadow-sm"
                    : "bg-surface border border-border text-foreground hover:bg-surface-hover"
                }`}
              >
                <span>Custom SMTP Server</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">SMTP Host</label>
              <input
                type="text"
                value={currentSmtp.host}
                onChange={(e) => updateCurrentSmtp({ host: e.target.value })}
                placeholder="e.g. smtp.gmail.com"
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Port</label>
                <input
                  type="text"
                  value={currentSmtp.port}
                  onChange={(e) => {
                    const p = e.target.value
                    updateCurrentSmtp({
                      port: p,
                      secure: p === "465",
                    })
                  }}
                  placeholder="587 / 465"
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Encryption</label>
                <select
                  value={currentSmtp.secure ? "ssl" : "tls"}
                  onChange={(e) => updateCurrentSmtp({ secure: e.target.value === "ssl" })}
                  className="w-full px-2.5 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold focus:outline-hidden cursor-pointer"
                >
                  <option value="tls">STARTTLS (587)</option>
                  <option value="ssl">SSL / TLS (465)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Sender Email (Username) *</label>
              <input
                type="email"
                value={currentSmtp.user}
                onChange={(e) => {
                  const val = e.target.value
                  updateCurrentSmtp({
                    user: val,
                    fromEmail: currentSmtp.fromEmail || val,
                  })
                  if (!smtpTestRecipient) setSmtpTestRecipient(val)
                }}
                placeholder={selectedSmtpCompanyId === "tech" ? "supriyogod@gmail.com" : "consultancy@saampark.in"}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono focus:outline-hidden"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-zinc-600 dark:text-zinc-400 font-semibold">App Password / Auth Token *</label>
                <button
                  type="button"
                  onClick={() => setShowSmtpPass(!showSmtpPass)}
                  className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
                >
                  {showSmtpPass ? "Hide" : "Show"}
                </button>
              </div>
              <input
                type={showSmtpPass ? "text" : "password"}
                value={currentSmtp.pass}
                onChange={(e) => updateCurrentSmtp({ pass: e.target.value })}
                placeholder="16-digit Google App Password"
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Sender From Name</label>
              <input
                type="text"
                value={currentSmtp.fromName}
                onChange={(e) => updateCurrentSmtp({ fromName: e.target.value })}
                placeholder={activeSmtpCompany?.name || "SAAMPARK CRM"}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Sender From Email (Header)</label>
              <input
                type="email"
                value={currentSmtp.fromEmail}
                onChange={(e) => updateCurrentSmtp({ fromEmail: e.target.value })}
                placeholder={currentSmtp.user || "info@saampark.in"}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono focus:outline-hidden"
              />
            </div>
          </div>

          {/* Google App Password Help Banner */}
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-[11px] text-amber-900 dark:text-amber-200 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <span>💡 Google / Custom SMTP Security Notice for {activeSmtpCompany?.name}:</span>
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Google requires a 16-character <strong>App Password</strong>. Navigate to <strong>Google Account ➔ Security ➔ 2-Step Verification ➔ App passwords</strong>, create an app password (name it "{activeSmtpCompany?.name || 'CRM'}"), and paste it above.
            </p>
          </div>

          {/* Live Test Connection Tool */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-2xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-bold text-foreground text-xs block">Verify SMTP for {activeSmtpCompany?.name}</span>
                <span className="text-[10px] text-muted-foreground">Test credentials in real time and deliver a branded test verification email.</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  value={smtpTestRecipient}
                  onChange={(e) => setSmtpTestRecipient(e.target.value)}
                  placeholder="Test recipient email..."
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-mono w-48 focus:outline-hidden"
                />
                <button
                  type="button"
                  disabled={isTestingSmtp || !currentSmtp.user || !currentSmtp.pass}
                  onClick={handleTestSmtpConnection}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all shrink-0"
                >
                  <Sparkles size={13} className={isTestingSmtp ? "animate-spin" : ""} />
                  <span>{isTestingSmtp ? "Verifying..." : `⚡ Test SMTP (${activeSmtpCompany?.id || selectedSmtpCompanyId})`}</span>
                </button>
              </div>
            </div>

            {smtpTestResult && (
              <div className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                smtpTestResult.success
                  ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                  : "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
              }`}>
                {smtpTestResult.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{smtpTestResult.message}</span>
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
            >
              <Save size={14} />
              <span>Save & Apply {activeSmtpCompany?.name || selectedSmtpCompanyId} SMTP Settings</span>
            </button>
          </div>
        </form>
      )}
    </>
  );
}
