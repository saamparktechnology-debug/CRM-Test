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

export function BranchesSection4({ ctrl }: { ctrl: any }) {
  const { activeTab, filteredBranches, filteredSubBranches, getCompanyName, branches, setViewingItem, setViewingType, canEdit, openEditBranch, openEditSubBranch, canDelete, setDeleteConfirm } = ctrl;
  return (
    <>
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">{activeTab === "branches" ? "Branch Identity" : "Sub-Branch / Hub"}</th>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Company</th>
                {activeTab === "sub-branches" && <th className="py-3 px-4">Parent Branch</th>}
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Tax / GSTIN</th>
                <th className="py-3 px-4">{activeTab === "branches" ? "Manager" : "Partner / Share"}</th>
                <th className="py-3 px-4">Banking &amp; Stamp</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80 text-zinc-700 dark:text-zinc-300">
              {(activeTab === "branches" ? filteredBranches : filteredSubBranches).length === 0 ? (
                <tr>
                  <td colSpan={activeTab === "sub-branches" ? 10 : 9} className="py-12 text-center text-zinc-400">
                    <Building2 className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="font-semibold">No records found matching your filter.</p>
                  </td>
                </tr>
              ) : (
                (activeTab === "branches" ? filteredBranches : filteredSubBranches).map((item) => {
                  const compName = getCompanyName((item as any).companyId || (item as any).company_id)
                  const hasGstin = !!(item as any).gstin
                  const hasBank = !!((item as any).bank_name || (item as Branch).bankDetails?.bankName)
                  const hasSignature = !!(item as any).signature_image_url
                  const hasStamp = !!(item as any).stamp_image_url
                  const logoUrl = (item as any).logo_url
                  const parentBranch = activeTab === "sub-branches" ? branches.find(b => b.id === (item as SubBranch).parentBranchId) : null

                  return (
                    <tr key={item.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50 transition-colors">
                      {/* Identity & Logo */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {logoUrl ? (
                            <img src={logoUrl} alt={item.name} className="w-8 h-8 rounded-lg object-contain bg-zinc-100 dark:bg-zinc-800 p-0.5 border border-zinc-200 dark:border-zinc-700 shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                              {item.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                              <span>{item.name}</span>
                              {(item as any).division_name && (
                                <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                  {(item as any).division_name}
                                </span>
                              )}
                            </div>
                            {(item as any).subtitle && (
                              <p className="text-[10px] text-zinc-400 truncate max-w-[200px]">{(item as any).subtitle}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Code */}
                      <td className="py-3 px-4">
                        <span className="font-mono text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded border border-blue-200/50 dark:border-blue-800/50">
                          {item.code || "-"}
                        </span>
                      </td>

                      {/* Company */}
                      <td className="py-3 px-4">
                        <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                          {compName}
                        </span>
                      </td>

                      {/* Parent Branch for Sub-Branches */}
                      {activeTab === "sub-branches" && (
                        <td className="py-3 px-4">
                          {parentBranch ? (
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-zinc-800 dark:text-zinc-200">{parentBranch.name}</span>
                              <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.2 rounded border border-blue-200/40">
                                {parentBranch.code}
                              </span>
                            </div>
                          ) : (
                            <span className="text-zinc-400 italic text-[10px]">Unassigned</span>
                          )}
                        </td>
                      )}

                      {/* Location */}
                      <td className="py-3 px-4">
                        <div className="text-[11px]">
                          <span className="font-medium text-zinc-800 dark:text-zinc-200">{item.city || "-"}</span>
                          {item.state && <span className="text-zinc-400">, {item.state}</span>}
                        </div>
                        {(item as any).address && (
                          <p className="text-[10px] text-zinc-400 truncate max-w-[180px]">{(item as any).address}</p>
                        )}
                      </td>

                      {/* Tax GSTIN */}
                      <td className="py-3 px-4">
                        {hasGstin ? (
                          <div>
                            <span className="font-mono text-[10px] bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                              {(item as any).gstin}
                            </span>
                            {(item as any).pan && (
                              <div className="text-[10px] font-mono text-zinc-400 mt-0.5">PAN: {(item as any).pan}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-zinc-400 italic">Inherits HQ</span>
                        )}
                      </td>

                      {/* Manager / Partner */}
                      <td className="py-3 px-4">
                        {activeTab === "branches" ? (
                          <div>
                            <p className="font-medium text-zinc-900 dark:text-zinc-100">{(item as Branch).managerName || "-"}</p>
                            {(item as any).managerPhone && (
                              <p className="text-[10px] text-zinc-400">{(item as any).managerPhone}</p>
                            )}
                          </div>
                        ) : (
                          <div>
                            <p className="font-medium text-zinc-900 dark:text-zinc-100">{(item as SubBranch).partnerName || "-"}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">{(item as SubBranch).revenueSharePct}% Share</span>
                              <span className="text-[10px] text-zinc-400">({(item as SubBranch).partnerType || "Franchise"})</span>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Banking & Stamp Badges */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`p-1 rounded text-[10px] ${hasBank ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800" : "bg-zinc-100 text-zinc-400"}`} title={hasBank ? `Bank: ${(item as any).bank_name || "Configured"}` : "No Bank Added"}>
                            <Landmark size={13} />
                          </span>
                          <span className={`p-1 rounded text-[10px] ${hasSignature ? "bg-blue-50 text-blue-600 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800" : "bg-zinc-100 text-zinc-400"}`} title={hasSignature ? "Authorized Signature Available" : "No Signature"}>
                            <FileCheck size={13} />
                          </span>
                          <span className={`p-1 rounded text-[10px] ${hasStamp ? "bg-purple-50 text-purple-600 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800" : "bg-zinc-100 text-zinc-400"}`} title={hasStamp ? "Official Stamp Available" : "No Stamp"}>
                            <Stamp size={13} />
                          </span>
                          {(item as any).payment_qr_url && (
                            <span className="p-1 rounded text-[10px] bg-amber-50 text-amber-600 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800" title="UPI Payment QR Ready">
                              <QrCode size={13} />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                          item.status === "Active" 
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800" 
                            : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700"
                        }`}>
                          {item.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
                          <button 
                            onClick={() => { setViewingItem(item); setViewingType(activeTab === "branches" ? "branch" : "sub-branch") }}
                            className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors"
                            title="View Full Profile"
                          >
                            <Eye size={14} />
                          </button>
                          {canEdit && (
                            <button 
                              onClick={() => activeTab === "branches" ? openEditBranch(item as Branch) : openEditSubBranch(item as SubBranch)} 
                              className="p-1.5 text-zinc-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 rounded-lg transition-colors" 
                              title="Edit"
                            >
                              <Edit2 size={14} />
                            </button>
                          )}
                          {canDelete && (
                            <button 
                              onClick={() => setDeleteConfirm({ id: item.id, name: item.name, type: activeTab === "branches" ? "branch" : "sub-branch" })} 
                              className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
            </table>
          </div>
        </div>
    </>
  );
}
