"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Plus,
  Search,
  Edit2,
  Trash2,
  ChevronRight,
  ChevronDown,
  MapPin,
  Phone,
  Mail,
  Globe,
  Users,
  Briefcase,
  DollarSign,
  Building,
  Loader2,
  AlertCircle,
  Shield,
  CreditCard,
  Award,
  CheckCircle2,
  Image,
  X,
  Sparkles,
  Eye,
  Landmark,
  QrCode,
  FileText,
  Check,
  ShieldCheck,
  Columns,
  Maximize2,
  Minimize2,
  Split,
  LayoutTemplate,
  Save,
  Copy,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  CompanyApiService,
  BranchApiService,
  SubBranchApiService,
} from "@/features/companies/services/companyService";
import { Company, Branch, SubBranch } from "@/features/companies/types";
import { useAuthStore, isMatchingCompany } from "@/store/useAuthStore";
import {
  markGlobalItemDeleted,
  unmarkGlobalItemDeleted,
  fetchModuleDataFromDB,
  saveModuleDataToDB,
  syncGlobalDeletedIds,
  isGlobalItemDeleted,
  getLocalDeletedIds,
} from "@/lib/storageSync";
import { ImageUploadField } from "@/components/ui/ImageUploadField";
import {
  OfficialInvoiceDocument,
  CustomTextStamp,
} from "@/features/invoice/components/OfficialInvoiceDocument";
import {
  InvoiceItem,
  InvoiceLineItem,
} from "@/features/invoice/services/invoiceService";
import {
  INDUSTRIES,
  CURRENCIES,
  PARTNER_TYPES,
  CANONICAL_COMPANIES,
  CANONICAL_BRANCHES,
  cleanStr,
  cleanUpper,
  isBranchDeleted,
  SafeModalBoundary,
} from "@/features/companies/components/companies-sections/CompaniesHelpers";

export function CompaniesSection4({ ctrl }: { ctrl: any }) {
  const {
    searchQuery,
    setSearchQuery,
    industryFilter,
    setIndustryFilter,
    filteredCompanies,
    getBranchesForCompany,
    expandedCompanies,
    toggleCompanyExpand,
    getUserCountForCompany,
    openEditCompany,
    setCompanyModalViewMode,
    openAddBranch,
    getSubBranchesForBranch,
    expandedBranches,
    toggleBranchExpand,
    openEditBranch,
    setBranchModalViewMode,
    openAddSubBranch,
    openEditSubBranch,
    setSubBranchModalViewMode,
    isSuperAdmin,
    confirmDelete,
  } = ctrl;
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-linear-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
              <Building2 size={18} />
            </div>
            <span>Companies & Branches Management</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Configure corporate entities, divisions, legal tax IDs, authorized
            stamps, and percentage-share franchise sub-branches
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search companies by name or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>
        <select
          value={industryFilter}
          onChange={(e) => setIndustryFilter(e.target.value)}
          className="px-3 py-2 rounded-md border border-border bg-surface text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Industries</option>
          {INDUSTRIES.map((ind) => (
            <option key={ind} value={ind}>
              {ind}
            </option>
          ))}
        </select>
      </div>

      <div className="text-xs text-muted-foreground font-semibold">
        {filteredCompanies.length}{" "}
        {filteredCompanies.length === 1 ? "company" : "companies"} active in
        workspace
      </div>

      {/* Company List Cards */}
      <div className="space-y-4">
        {filteredCompanies.map((company: Company, index: number) => {
          const cBranches = Array.from(
            new Map<string, Branch>(
              getBranchesForCompany(company.id).map((b: Branch) => [
                String(b.id),
                b,
              ]),
            ).values(),
          );
          const isExpanded = expandedCompanies.has(company.id);
          return (
            <motion.div
              key={company.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs"
            >
              <div
                className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/40 transition-colors"
                onClick={() => toggleCompanyExpand(company.id)}
              >
                {isExpanded ? (
                  <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                )}
                {company.logo_url ? (
                  <img
                    src={company.logo_url}
                    alt={company.name}
                    className="h-11 w-11 rounded-xl object-contain border border-border p-1 bg-white"
                  />
                ) : (
                  <div className="h-11 w-11 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold shrink-0">
                    <Building2 className="h-5 w-5" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-foreground text-sm truncate whitespace-pre">
                      {company.name}
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold font-mono tracking-wider whitespace-pre">
                      (
                      {String(company.slug || company.name || "")
                        .toLowerCase()
                        .includes("consult") ||
                      String((company as any).numeric_id) === "2"
                        ? "SCS"
                        : "STR"}
                      )
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                      {company.status || "active"}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground flex-wrap">
                    {company.industry && (
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3.5 w-3.5" />
                        {company.industry}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Building className="h-3.5 w-3.5" />
                      {cBranches.length}{" "}
                      {cBranches.length === 1 ? "branch" : "branches"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {getUserCountForCompany(company.id)} members
                    </span>
                    {company.gstin && (
                      <span className="font-mono text-[10px] text-zinc-400">
                        GST: {company.gstin}
                      </span>
                    )}
                  </div>
                </div>
                <div
                  className="flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      openEditCompany(company);
                      setCompanyModalViewMode("preview");
                    }}
                    title="Live Preview Document & Stamps"
                    className="h-8 gap-1 text-xs text-primary font-bold"
                  >
                    <Eye className="h-4 w-4" />
                    Preview
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openAddBranch(company.id)}
                    title="Add Branch"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditCompany(company)}
                    title="Edit Full Company Details"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-border/80">
                  {/* Company Quick Metadata Header */}
                  <div className="p-4 bg-muted/20 text-xs text-muted-foreground grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {company.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-blue-500" />
                        <span>{company.address}</span>
                      </div>
                    )}
                    {company.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-blue-500" />
                        <span>{company.email}</span>
                      </div>
                    )}
                    {company.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-blue-500" />
                        <span>{company.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Branches Section */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-foreground flex items-center gap-1.5">
                        <Building className="h-4 w-4 text-blue-600" />
                        Branches ({cBranches.length})
                      </h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openAddBranch(company.id)}
                        className="flex items-center gap-1 text-xs"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Branch
                      </Button>
                    </div>

                    {cBranches.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground text-xs border border-dashed rounded-xl">
                        <p>
                          No branches attached yet. Click "Add Branch" to set up
                          operational branches.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {cBranches.map((branch: Branch) => {
                          const bSubBranches = getSubBranchesForBranch(
                            branch.id,
                          );
                          const isBrExpanded = expandedBranches.has(branch.id);
                          return (
                            <div
                              key={branch.id}
                              className="rounded-xl border border-border bg-surface p-3 space-y-3"
                            >
                              <div
                                className="flex items-center justify-between cursor-pointer"
                                onClick={() => toggleBranchExpand(branch.id)}
                              >
                                <div className="flex items-center gap-2.5">
                                  {isBrExpanded ? (
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                  )}
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-xs text-foreground">
                                        {branch.name}
                                      </span>
                                      {branch.code && (
                                        <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono font-semibold">
                                          {branch.code}
                                        </span>
                                      )}
                                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                                        {branch.status || "active"}
                                      </span>
                                    </div>
                                    <div className="text-[11px] text-muted-foreground flex items-center gap-3 mt-0.5">
                                      {branch.city && (
                                        <span className="inline-flex items-center gap-1">
                                          <MapPin
                                            size={11}
                                            className="text-muted-foreground"
                                          />{" "}
                                          {branch.city}
                                          {branch.state
                                            ? `, ${branch.state}`
                                            : ""}
                                        </span>
                                      )}
                                      <span className="inline-flex items-center gap-1">
                                        <Layers
                                          size={11}
                                          className="text-muted-foreground"
                                        />{" "}
                                        {bSubBranches.length} Sub-Branches
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div
                                  className="flex items-center gap-1"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      openEditBranch(branch);
                                      setBranchModalViewMode("preview");
                                    }}
                                    title="Live Preview Branch Invoice"
                                    className="text-xs h-7 gap-1 text-blue-600 font-semibold"
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                    Preview
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      openAddSubBranch(
                                        branch.id,
                                        branch.company_id,
                                      )
                                    }
                                    title="Add Sub-Branch"
                                    className="text-xs h-7 gap-1"
                                  >
                                    <Plus className="h-3 w-3" />
                                    Sub-Branch
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openEditBranch(branch)}
                                    title="Edit Branch"
                                    className="h-7 w-7 p-0"
                                  >
                                    <Edit2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>

                              {/* Sub-Branches Accordion */}
                              {isBrExpanded && (
                                <div className="pt-3 border-t border-border/60 pl-6 space-y-2">
                                  <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                                    <span>
                                      Sub-Branches & Percentage Partners (
                                      {bSubBranches.length})
                                    </span>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        openAddSubBranch(
                                          branch.id,
                                          branch.company_id,
                                        )
                                      }
                                      className="h-6 text-[10px] px-2 gap-1"
                                    >
                                      <Plus className="h-3 w-3" />
                                      Add Sub-Branch
                                    </Button>
                                  </div>
                                  {bSubBranches.length === 0 ? (
                                    <p className="text-[11px] text-muted-foreground italic">
                                      No sub-branches registered under this
                                      branch.
                                    </p>
                                  ) : (
                                    bSubBranches.map((sb: SubBranch) => (
                                      <div
                                        key={sb.id}
                                        className="p-2.5 rounded-lg border border-border/80 bg-muted/20 flex items-center justify-between text-xs"
                                      >
                                        <div>
                                          <div className="flex items-center gap-2 font-bold text-foreground">
                                            <span>{sb.name}</span>
                                            {sb.code && (
                                              <span className="font-mono text-[10px] bg-muted px-1 rounded">
                                                {sb.code}
                                              </span>
                                            )}
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                                              {sb.revenue_share_pct || 0}%
                                              Partner Share
                                            </span>
                                          </div>
                                          <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-3">
                                            {sb.partner_name && (
                                              <span className="inline-flex items-center gap-1">
                                                <Users
                                                  size={11}
                                                  className="text-muted-foreground"
                                                />{" "}
                                                Partner: {sb.partner_name}
                                              </span>
                                            )}
                                            {sb.partner_type && (
                                              <span className="inline-flex items-center gap-1">
                                                <Briefcase
                                                  size={11}
                                                  className="text-muted-foreground"
                                                />{" "}
                                                {sb.partner_type}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                              openEditSubBranch(sb);
                                              setSubBranchModalViewMode(
                                                "preview",
                                              );
                                            }}
                                            title="Live Preview Sub-Branch Invoice"
                                            className="text-xs h-7 gap-1 text-emerald-600 font-semibold"
                                          >
                                            <Eye className="h-3.5 w-3.5" />
                                            Preview
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                              openEditSubBranch(sb)
                                            }
                                            title="Edit Sub-Branch"
                                            className="h-7 w-7 p-0"
                                          >
                                            <Edit2 className="h-3 w-3" />
                                          </Button>
                                          {isSuperAdmin && (
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() =>
                                                confirmDelete(
                                                  "sub_branch",
                                                  sb.id,
                                                )
                                              }
                                              title="Delete Sub-Branch"
                                              className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                            >
                                              <Trash2 className="h-3 w-3" />
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* ── UPGRADED COMPANY MODAL (SPLIT-SCREEN STUDIO) ────────────────── */}
    </>
  );
}
