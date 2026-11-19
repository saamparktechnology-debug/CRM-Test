"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Building2, Plus, Search, Edit2, Trash2, MapPin, Users, X, Check, 
  ChevronDown, Globe, CreditCard, FileText, QrCode, Sparkles, Lock, 
  UploadCloud, CheckCircle2, Shield, Eye, Phone, Mail, Building,
  AlertCircle, ExternalLink, Image as ImageIcon, Briefcase, Info,
  Landmark, Stamp, FileCheck
} from "lucide-react"
import { useAuthStore, Branch, SubBranch, Company, isMatchingCompany, getSelectableCompanies } from "@/store/useAuthStore"
import { usePermissionStore } from "@/store/usePermissionStore"
import { executeWithFeedback } from "@/store/useActionFeedbackStore"
import { ImageUploadField } from "@/components/ui/ImageUploadField"
import { BranchApiService, SubBranchApiService } from "@/features/companies/services/companyService"
import { type Tab, type BranchModalTab, type SubBranchModalTab, cleanStr, cleanUpper , SafeModalBoundary } from "@/features/branches/components/branches-sections/BranchesHelpers"

export function BranchesSection3({ ctrl }: { ctrl: any }) {
  const { canAdd, activeTab, openAddBranch, openAddSubBranch, setActiveTab, setSearchQuery, branches, subBranches, selectedCompanyFilter, setSelectedCompanyFilter, companies, selectedParentBranchFilter, setSelectedParentBranchFilter, searchQuery, filteredBranches, filteredSubBranches } = ctrl;
  return (
    <>
      {/* ── HEADER ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900">
              <Building2 size={22} />
            </div>
            <span>Branch &amp; Organisation Management</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Configure operational branches with full legal GSTIN/PAN, Bank &amp; UPI accounts, Signatories, and Sub-branch franchise networks
          </p>
        </div>

        {canAdd && (
          <button 
            onClick={activeTab === "branches" ? openAddBranch : openAddSubBranch} 
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md hover:shadow-blue-500/20 active:scale-95"
          >
            <Plus size={15} />
            <span>Add {activeTab === "branches" ? "Branch" : "Sub-Branch"}</span>
          </button>
        )}
      </div>

      {/* ── TABS & COUNTERS ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-px">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => { setActiveTab("branches"); setSearchQuery("") }} 
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
              activeTab === "branches" 
                ? "border-blue-600 text-blue-600 bg-blue-50/50 dark:bg-blue-950/30" 
                : "border-transparent text-zinc-500 hover:text-zinc-900"
            }`}
          >
            <Building2 size={15} />
            <span>Operational Branches</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              {branches.length}
            </span>
          </button>
          <button 
            onClick={() => { setActiveTab("sub-branches"); setSearchQuery("") }} 
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
              activeTab === "sub-branches" 
                ? "border-emerald-600 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30" 
                : "border-transparent text-zinc-500 hover:text-zinc-900"
            }`}
          >
            <MapPin size={15} />
            <span>Sub-Branches &amp; Franchises</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              {subBranches.length}
            </span>
          </button>
        </div>

        {/* Company & Parent Branch Quick Filters */}
        <div className="hidden sm:flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400 font-medium">Company:</span>
            <select 
              value={selectedCompanyFilter}
              onChange={(e) => setSelectedCompanyFilter(e.target.value)}
              className="px-2.5 py-1 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none"
            >
              <option value="all">All Companies ({companies.length})</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.brand_name || c.name}</option>
              ))}
            </select>
          </div>

          {activeTab === "sub-branches" && (
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-400 font-medium">Under Branch:</span>
              <select 
                value={selectedParentBranchFilter}
                onChange={(e) => setSelectedParentBranchFilter(e.target.value)}
                className="px-2.5 py-1 text-xs rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 font-medium focus:outline-none"
              >
                <option value="all">All Parent Branches ({branches.length})</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ── SEARCH & FILTERS BAR ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input 
            type="text" 
            placeholder={`Search ${activeTab === "branches" ? "branches by name, code, city, GSTIN..." : "sub-branches by name, partner..."}`} 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500" 
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end text-xs text-zinc-500">
          <span>Showing {activeTab === "branches" ? filteredBranches.length : filteredSubBranches.length} records</span>
        </div>
      </div>

      {/* ── DATA TABLE ──────────────────────────────────────────────── */}
    </>
  );
}
