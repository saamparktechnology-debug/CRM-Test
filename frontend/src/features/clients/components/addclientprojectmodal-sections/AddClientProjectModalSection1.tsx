"use client"

import * as React from "react"
import { 
  X, Check, DollarSign, Calculator, UserCheck, Users, Calendar, Briefcase, FileText, 
  Coins, RefreshCw, Layers, CreditCard, Building2, Mail, Phone, MapPin, 
  Plus, Trash2, Tag, ChevronDown, ChevronUp, Sparkles, Search, Receipt
} from "lucide-react"
import { useRouter } from "next/navigation"
import { ClientItem } from "@/features/clients/types"
import { getUsers } from "@/features/users/services/userService"
import { addProject } from "@/features/projects/services/projectService"
import { addInvoice, getInvoices, generateInvoiceNumber, InvoiceLineItem, AppliedDiscount } from "@/features/invoice/services/invoiceService"
import { addOrder } from "@/features/orders/services/orderService"
import { addPayment } from "@/features/payments/services/paymentService"
import { addSubscription, saveInstallmentRecord } from "@/features/subscriptions/services/subscriptionService"
import { taskService } from "@/features/tasks/services/taskService"
import { saveStoredClient, getClients, formatDisplayEmail } from "@/features/clients/services/clientService"
import { useAuthStore, getSelectableCompanies } from "@/store/useAuthStore"
import { sendInvoiceDetailsEmailNotification, sendPaymentReceiptEmailNotification } from "@/services/emailNotificationService"
import { lookupPincode } from "@/lib/pincodeService"
import { type AddClientProjectModalProps, type ServiceFormItem, type FormDiscountItem, type AssignedMemberAllocation, SERVICE_PRESETS } from "@/features/clients/components/addclientprojectmodal-sections/AddClientProjectModalHelpers"

export function AddClientProjectModalSection1({ ctrl }: { ctrl: any }) {
  const { creationMode, handleModeChange, selectableCompanies, selectedCompanyId, handleCompanyChange, isBranchLocked, branches, user, selectedBranchId, setSelectedBranchId, availableBranches, availableSubBranches, selectedSubBranchId, setSelectedSubBranchId } = ctrl;
  return (
    <>
      {/* Creation Mode Toggle */}
          <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <Layers size={18} className="text-blue-600 shrink-0" />
              <div>
                <span className="font-bold text-zinc-900 dark:text-zinc-100 block text-xs">Creation Scope</span>
                <span className="text-[11px] text-zinc-500">
                  {creationMode === "project_and_invoice"
                    ? "🚀 Creates full Project Workspace with milestone tasks & invoice (Takes you directly to Project)"
                    : "📄 Generates Tax Invoice only for Client (without creating a Project)"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700 shrink-0">
              <button
                type="button"
                onClick={() => handleModeChange("project_and_invoice")}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                  creationMode === "project_and_invoice"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                <span>🚀 With Project</span>
              </button>
              <button
                type="button"
                onClick={() => handleModeChange("invoice_only")}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                  creationMode === "invoice_only"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                <span>📄 Only Invoice</span>
              </button>
            </div>
          </div>

          {/* ── Issuing Company Entity & Billing Branch / Location ── */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 space-y-3">
            <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-700/80 pb-2">
              <Building2 size={15} className="text-blue-600 shrink-0" />
              <span className="font-extrabold text-zinc-900 dark:text-zinc-100 text-xs uppercase tracking-wider">
                Issuing Entity & Location
              </span>
              <span className="ml-auto text-[10px] text-zinc-500 font-medium">Company & Branch Scope</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10.5px] font-bold text-zinc-600 dark:text-zinc-400 mb-1 flex items-center justify-between">
                  <span>Issuing Company Entity:</span>
                  {selectableCompanies.length <= 1 && (
                    <span className="text-[9px] text-blue-600 font-bold bg-blue-50 dark:bg-blue-950/40 px-1 py-0.2 rounded border border-blue-200 dark:border-blue-800">
                      🔒 Active Company
                    </span>
                  )}
                </label>
                <select
                  value={selectedCompanyId}
                  onChange={(e) => handleCompanyChange(e.target.value)}
                  disabled={selectableCompanies.length <= 1}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-800 dark:text-zinc-200 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-85 disabled:cursor-not-allowed"
                >
                  {(selectableCompanies as any[]).map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.logo || "🏢"} {c.brand_name || c.name} {c.division_name ? `(${c.division_name})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Billing Branch / Location */}
              <div>
                <label className="block text-[10.5px] font-bold text-zinc-600 dark:text-zinc-400 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} className="text-amber-500" />
                    <span>Billing Branch / Location:</span>
                  </span>
                  {isBranchLocked && (
                    <span className="text-[9px] text-amber-600 font-bold bg-amber-50 dark:bg-amber-950/40 px-1 py-0.2 rounded border border-amber-200 dark:border-amber-800">
                      🔒 Locked
                    </span>
                  )}
                </label>
                {isBranchLocked ? (
                  <div className="w-full px-3 py-2 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl text-zinc-800 dark:text-zinc-200 text-xs font-bold flex items-center justify-between">
                    <span>📍 {branches.find(b => b.id === user?.branchId)?.name || user?.branchId || "Your Assigned Branch"}</span>
                    <span className="text-[10px] text-amber-600 font-normal">Fixed</span>
                  </div>
                ) : (
                  <select
                    value={selectedBranchId}
                    onChange={(e) => setSelectedBranchId(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-800 dark:text-zinc-200 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">🏢 Company HQ / Central Office</option>
                    {availableBranches.map((b) => (
                      <option key={b.id} value={b.id}>
                        📍 {b.name} {b.city ? `(${b.city})` : ""} {b.code ? `• [${b.code}]` : ""}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Sub-Branch Attribution (% Share Partner) */}
            {availableSubBranches.length > 0 && (
              <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-xl border border-emerald-200/60 dark:border-emerald-800/40 space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <span>🌿 Sub-Branch Partner Attribution (% Share)</span>
                  </label>
                  <span className="text-[10px] text-zinc-500">Optional Franchise Split</span>
                </div>
                <select
                  value={selectedSubBranchId}
                  onChange={(e) => setSelectedSubBranchId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-emerald-300 dark:border-emerald-700 rounded-lg text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">🏢 Company HQ / Direct Operating Branch (100% Company)</option>
                  {availableSubBranches.map((sb) => (
                    <option key={sb.id} value={sb.id}>
                      🌿 {sb.name} — {sb.revenueSharePct}% Partner Share / {100 - (sb.revenueSharePct ?? 30)}% Company
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* ── Client Details Card (pre-filled & editable & searchable) ── */}
    </>
  );
}
