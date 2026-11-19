"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Building2, Plus, Pencil, Trash2, Shield, MapPin, Phone, Mail, 
  User, Check, X, AlertTriangle, Layers, ChevronDown, ChevronRight, ChevronLeft,
  Globe, CreditCard, FileText, QrCode, Sparkles, Lock, UploadCloud,
  Image as ImageIcon, CheckCircle2
} from "lucide-react"
import { useAuthStore, Company, Branch, SubBranch, getCompanyFullName, getCompanyLogoUrl, isMatchingCompany } from "@/store/useAuthStore"
import { getUsers } from "@/features/users/services/userService"
import { executeWithFeedback, useActionFeedbackStore } from "@/store/useActionFeedbackStore"
import { usePermissionStore, ALL_APP_MODULES, CLEAN_MODULE_CATEGORIES } from "@/store/usePermissionStore"

export function CompanyBranchSettingsSection4({ ctrl }: { ctrl: any }) {
  const { visibleCompanies, branches, allUsers, expandedCompanyIds, activeCompanyId, toggleCompanyExpand, isSuperAdmin, switchCompany, handleOpenEditCompany, handleOpenCreateBranch, handleOpenEditBranch, handleDeleteBranch, subBranches, handleOpenCreateSubBranch, handleOpenEditSubBranch, handleDeleteSubBranch } = ctrl;
  return (
    <>
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-6 rounded-3xl border border-border shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Layers size={18} />
            </div>
            <h2 className="text-xl font-black tracking-tight text-foreground">
              Company Entities & Branch Hubs
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Configure enterprise legal entities, registered tax IDs, invoice branding, company signatures, and regional branch networks.
          </p>
        </div>
      </div>

      {/* Companies & Branches Accordion List */}
      <div className="space-y-4">
        {visibleCompanies.map((company) => {
          const compBranches = branches.filter((b) => 
            isMatchingCompany(company, b.companyId || (b as any).company_id)
          )
          const compUsers = allUsers.filter((u) => {
            const cIds = u.companyIds || (u.companyId ? [u.companyId] : [])
            return cIds.some((id: string) => isMatchingCompany(company, id))
          })
          const isExpanded = expandedCompanyIds.includes(company.id)
          const compFullName = getCompanyFullName(company)
          const compLogoUrl = getCompanyLogoUrl(company)
          const isActive = isMatchingCompany(company, activeCompanyId)

          return (
            <div
              key={company.id}
              className="bg-surface rounded-3xl border border-border shadow-sm overflow-hidden transition-all"
            >
              {/* Company Header Row */}
              <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-hover/30 border-b border-border/60">
                <div 
                  className="flex items-center gap-3.5 cursor-pointer select-none flex-1"
                  onClick={() => toggleCompanyExpand(company.id)}
                >
                  <button type="button" className="text-muted-foreground">
                    {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </button>
                  <div className="w-12 h-12 rounded-2xl bg-surface border border-border shadow-xs flex items-center justify-center text-2xl shrink-0 overflow-hidden">
                    {compLogoUrl ? (
                      <img src={compLogoUrl} alt={compFullName} className="w-9 h-9 object-contain" />
                    ) : (
                      company.logo || "🏢"
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-foreground">
                        <span className="text-primary font-black">{compFullName}</span>
                      </h3>
                      {company.subtitle && (
                        <span className="text-xs font-semibold text-muted-foreground hidden md:inline">
                          • {company.subtitle}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                        {compBranches.length} Branch{compBranches.length === 1 ? "" : "es"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5 flex-wrap">
                      <span>Slug: <code className="font-mono text-[11px] text-foreground">{company.slug || company.id}</code></span>
                      {company.gstin && <span>• GST: <strong className="font-mono text-foreground">{company.gstin}</strong></span>}
                      {company.cin && <span>• CIN: <strong className="font-mono text-foreground">{company.cin}</strong></span>}
                      {company.signature_image_url && (
                        <span className="text-emerald-600 font-semibold flex items-center gap-0.5 text-[10.5px]">
                          • <CheckCircle2 size={11} /> Signature Uploaded
                        </span>
                      )}
                      <span>• Currency: {company.currency_symbol || "₹"} ({company.currency || "INR"})</span>
                      <span>• {compUsers.length} Users</span>
                    </div>
                  </div>
                </div>

                {/* Company Action Buttons */}
                <div className="flex items-center gap-2 ml-auto flex-wrap">
                  {/* Direct Switch Company Button / Active Badge */}
                  {isActive ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold shadow-2xs">
                      <CheckCircle2 size={13} />
                      <span>Active Workspace</span>
                    </span>
                  ) : (isSuperAdmin || visibleCompanies.length > 1) ? (
                    <button
                      type="button"
                      onClick={() => switchCompany(company.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold transition-all shadow-xs cursor-pointer"
                      title={`Switch active CRM workspace to ${compFullName}`}
                    >
                      <Building2 size={13} />
                      <span>Switch to this Company</span>
                    </button>
                  ) : null}

                  {/* Super Admin Edit Company & Invoice Details Button */}
                  {isSuperAdmin ? (
                    <button
                      type="button"
                      onClick={() => handleOpenEditCompany(company)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold hover:bg-amber-100 transition-colors cursor-pointer shadow-2xs"
                      title="Modify company, tax, signature, and invoice branding"
                    >
                      <Pencil size={13} />
                      <span>Edit Entity & Signature</span>
                    </button>
                  ) : (
                    <span className="text-[10.5px] text-muted-foreground flex items-center gap-1 px-2 py-1 bg-surface-pressed/40 rounded-lg border border-border/50">
                      <Lock size={11} className="text-amber-500" />
                      <span>Super Admin Locked</span>
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => handleOpenCreateBranch(company.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Add Branch</span>
                  </button>
                </div>
              </div>

              {/* Branches List Body */}
              {isExpanded && (
                <div className="p-5 space-y-4 bg-surface/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Branches & Location Hubs ({compBranches.length})
                    </span>
                  </div>

                  {compBranches.length === 0 ? (
                    <div className="py-8 text-center bg-surface rounded-2xl border border-dashed border-border p-6">
                      <p className="text-xs text-muted-foreground">No branches created for this company yet.</p>
                      <button
                        type="button"
                        onClick={() => handleOpenCreateBranch(company.id)}
                        className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors cursor-pointer"
                      >
                        <Plus size={14} />
                        <span>Create First Branch</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {compBranches.map((branch) => (
                        <div
                          key={branch.id}
                          className="bg-surface p-4 rounded-2xl border border-border shadow-xs hover:border-primary/40 transition-all space-y-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-xs text-foreground">{branch.name}</h4>
                                <span
                                  className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                                    branch.status === "Active"
                                      ? "bg-emerald-500/10 text-emerald-600"
                                      : "bg-zinc-500/10 text-zinc-500"
                                  }`}
                                >
                                  {branch.status}
                                </span>
                              </div>
                              {branch.code && (
                                <span className="font-mono text-[10px] text-muted-foreground">
                                  Code: {branch.code}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleOpenEditBranch(branch)}
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors"
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteBranch(branch.id, branch.name)}
                                className="p-1.5 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                          <div className="space-y-1 text-[11px] text-muted-foreground border-t border-border/40 pt-2.5">
                            {branch.city && (
                              <div className="flex items-center gap-1.5">
                                <MapPin size={12} className="text-primary/70 shrink-0" />
                                <span className="truncate">{branch.city}</span>
                              </div>
                            )}
                            {branch.phone && (
                              <div className="flex items-center gap-1.5">
                                <Phone size={12} className="text-emerald-500/70 shrink-0" />
                                <span className="font-mono">{branch.phone}</span>
                              </div>
                            )}
                            {branch.managerName && (
                              <div className="flex items-center gap-1.5">
                                <User size={12} className="text-blue-500/70 shrink-0" />
                                <span>Manager: {branch.managerName}</span>
                              </div>
                            )}
                          </div>

                          {/* 🌿 Sub-Branches Section (% Share / Franchise Network) */}
                          <div className="mt-3 pt-3 border-t border-dashed border-border space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                <span>🌿 Sub-Branches</span>
                                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 font-mono text-[9px]">
                                  {(subBranches || []).filter(sb => sb.parentBranchId === branch.id).length}
                                </span>
                              </span>
                              <button
                                type="button"
                                onClick={() => handleOpenCreateSubBranch(branch)}
                                className="inline-flex items-center gap-1 text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors cursor-pointer"
                              >
                                <Plus size={11} />
                                <span>Add Sub-Branch (% Share)</span>
                              </button>
                            </div>

                            {/* Sub-Branch list for this parent branch */}
                            <div className="space-y-1.5">
                              {(subBranches || []).filter(sb => sb.parentBranchId === branch.id).length === 0 ? (
                                <p className="text-[10px] text-muted-foreground italic py-1">
                                  No sub-branches attached yet. Click above to add a percentage-share partner.
                                </p>
                              ) : (
                                (subBranches || []).filter(sb => sb.parentBranchId === branch.id).map(sb => (
                                  <div
                                    key={sb.id}
                                    className="p-2.5 rounded-xl bg-surface-pressed/30 border border-border/70 hover:border-emerald-500/40 transition-colors space-y-1.5"
                                  >
                                    <div className="flex items-center justify-between gap-1">
                                      <div className="flex items-center gap-1.5 min-w-0">
                                        <span className="font-bold text-[11px] text-foreground truncate">{sb.name}</span>
                                        <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-mono font-bold text-[9.5px]">
                                          🪙 {sb.revenueSharePct}% Partner / {100 - (sb.revenueSharePct ?? 30)}% Company
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-0.5 shrink-0">
                                        <button
                                          type="button"
                                          onClick={() => handleOpenEditSubBranch(sb)}
                                          className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
                                          title="Edit Sub-Branch"
                                        >
                                          <Pencil size={11} />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteSubBranch(sb.id, sb.name)}
                                          className="p-1 rounded-md text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                          title="Delete Sub-Branch"
                                        >
                                          <Trash2 size={11} />
                                        </button>
                                      </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
                                      {sb.partnerName && (
                                        <span>Partner: <strong className="text-foreground">{sb.partnerName}</strong></span>
                                      )}
                                      {sb.partnerPhone && (
                                        <span className="font-mono">{sb.partnerPhone}</span>
                                      )}
                                      {sb.city && (
                                        <span>📍 {sb.city}</span>
                                      )}
                                      <span className={`px-1 py-0.2 rounded text-[8.5px] font-bold uppercase ${sb.status === "Active" ? "text-emerald-600 bg-emerald-500/10" : "text-zinc-500 bg-zinc-500/10"}`}>
                                        {sb.status}
                                      </span>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  );
}
