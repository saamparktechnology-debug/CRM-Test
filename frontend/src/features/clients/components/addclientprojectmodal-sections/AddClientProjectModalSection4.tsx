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

export function AddClientProjectModalSection4({ ctrl }: { ctrl: any }) {
  const { creationMode, assignedAllocations, teamDropdownRef, setIsTeamDropdownOpen, isTeamDropdownOpen, teamSearchQuery, setTeamSearchQuery, filteredTeamsList, handleSelectAllMembers, handleClearMembers, teamsList, handleToggleMember, memberPayouts, handleUpdateMemberAllocation, handleRemoveMember, totalAmount, totalTeamPayout, totalTeamPercentage, companyMargin, companyMarginPercentage } = ctrl;
  return (
    <>
      {creationMode === "project_and_invoice" && (
            <div className="p-4 rounded-2xl bg-zinc-50/90 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/80 space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="block font-bold text-zinc-900 dark:text-zinc-100 text-xs flex items-center gap-1.5">
                    <Users size={15} className="text-blue-600 shrink-0" />
                    Assign Team Members & Compensation
                  </label>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Assign unlimited team members with custom Invoice % or Fixed Price (₹) payout.
                  </p>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 w-fit">
                  {assignedAllocations.length} Member{assignedAllocations.length !== 1 ? "s" : ""} Assigned
                </span>
              </div>

              {/* Searchable Dropdown Selector for Adding / Toggling Team Members */}
              <div className="relative" ref={teamDropdownRef}>
                <div
                  onClick={() => setIsTeamDropdownOpen(!isTeamDropdownOpen)}
                  className="w-full min-h-[42px] px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-blue-400 dark:hover:border-blue-500 transition-colors flex items-center justify-between gap-2 cursor-pointer shadow-sm"
                >
                  <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0">
                    {assignedAllocations.length === 0 ? (
                      <span className="text-zinc-400 text-xs font-normal">
                        Click here to search & assign team members from company roster...
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {assignedAllocations.map((m) => (
                          <span
                            key={m.id || m.name}
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-medium border border-blue-200 dark:border-blue-800"
                          >
                            <img
                              src={m.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${m.name}`}
                              alt={m.name}
                              className="w-4 h-4 rounded-full object-cover shrink-0"
                            />
                            <span className="truncate max-w-[120px] font-semibold">{m.name}</span>
                          </span>
                        ))}
                        <span className="text-[11px] text-zinc-400 ml-1">
                          + Click to select / remove members
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 text-zinc-400">
                    {isTeamDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {/* Popover Dropdown with Live Search */}
                {isTeamDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-2xl overflow-hidden p-3 space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* Search Input Box */}
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="text"
                        autoFocus
                        placeholder="Search team member by name, role or email..."
                        value={teamSearchQuery}
                        onChange={(e) => setTeamSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-7 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      {teamSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setTeamSearchQuery("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-0.5 cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>

                    {/* Header Actions */}
                    <div className="flex items-center justify-between px-1 text-[11px] text-zinc-500">
                      <span>
                        {filteredTeamsList.length} member{filteredTeamsList.length !== 1 ? "s" : ""} available
                      </span>
                      <div className="flex items-center gap-3 font-semibold">
                        <button
                          type="button"
                          onClick={handleSelectAllMembers}
                          className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                        >
                          Select All
                        </button>
                        <span>•</span>
                        <button
                          type="button"
                          onClick={handleClearMembers}
                          className="text-red-500 hover:underline cursor-pointer"
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    {/* Scrollable Members List */}
                    <div className="max-h-52 overflow-y-auto space-y-1 pr-0.5">
                      {filteredTeamsList.length === 0 ? (
                        <div className="py-6 text-center text-zinc-400 text-xs">
                          {teamsList.length === 0
                            ? "No team members found in system."
                            : `No team member matching "${teamSearchQuery}"`}
                        </div>
                      ) : (
                        filteredTeamsList.map((tm) => {
                          const isSelected = assignedAllocations.some(
                            (a) => a.id === String(tm.id) || a.name.toLowerCase().trim() === tm.name.toLowerCase().trim()
                          )
                          return (
                            <div
                              key={tm.id}
                              onClick={() => handleToggleMember(tm)}
                              className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                                isSelected
                                  ? "bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80"
                                  : "hover:bg-zinc-50 dark:hover:bg-zinc-800/60 border border-transparent"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <img
                                  src={tm.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${tm.name}`}
                                  alt={tm.name}
                                  className="w-7 h-7 rounded-full object-cover shrink-0 bg-zinc-200"
                                />
                                <div className="min-w-0">
                                  <p className="font-semibold text-xs text-zinc-800 dark:text-zinc-200 truncate">
                                    {tm.name}
                                  </p>
                                  <p className="text-[10.5px] text-zinc-400 truncate">
                                    {tm.role || "Developer"} {tm.email ? `• ${tm.email}` : ""}
                                  </p>
                                </div>
                              </div>

                              <div
                                className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                                  isSelected
                                    ? "bg-blue-600 border-blue-600 text-white"
                                    : "border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800"
                                }`}
                              >
                                {isSelected && <Check size={12} className="stroke-[3]" />}
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Individual Team Member Allocation Cards */}
              {assignedAllocations.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 px-1">
                    Configured Team Members & Payout Rates ({assignedAllocations.length})
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {memberPayouts.map((m, idx) => {
                      return (
                        <div
                          key={m.id || m.name}
                          className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3"
                        >
                          {/* Left: Member Identity */}
                          <div className="flex items-center gap-2.5 min-w-[170px]">
                            <span className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-zinc-500 flex items-center justify-center shrink-0">
                              #{idx + 1}
                            </span>
                            <img
                              src={m.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${m.name}`}
                              alt={m.name}
                              className="w-8 h-8 rounded-full object-cover shrink-0 border border-zinc-200 dark:border-zinc-700"
                            />
                            <div className="min-w-0">
                              <p className="font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                                {m.name}
                              </p>
                              <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.2 rounded">
                                {m.role || "Developer"}
                              </span>
                            </div>
                          </div>

                          {/* Middle: Payout Type Toggle & Value Input */}
                          <div className="flex items-center gap-2 flex-wrap flex-1 justify-start md:justify-center">
                            {/* Payout Type Selector (Pills) */}
                            <div className="inline-flex rounded-lg p-0.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                              <button
                                type="button"
                                onClick={() => handleUpdateMemberAllocation(m.id || m.name, "payoutType", "percentage")}
                                className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                                  m.payoutType === "percentage"
                                    ? "bg-blue-600 text-white shadow-sm"
                                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                                }`}
                              >
                                % Invoice Share
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateMemberAllocation(m.id || m.name, "payoutType", "fixed")}
                                className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                                  m.payoutType === "fixed"
                                    ? "bg-indigo-600 text-white shadow-sm"
                                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                                }`}
                              >
                                ₹ Fixed Price
                              </button>
                            </div>

                            {/* Value Input */}
                            <div className="relative flex items-center">
                              {m.payoutType === "fixed" && (
                                <span className="absolute left-2.5 text-xs font-bold text-zinc-500">₹</span>
                              )}
                              <input
                                type="number"
                                min="0"
                                step={m.payoutType === "percentage" ? "0.5" : "1"}
                                placeholder={m.payoutType === "percentage" ? "e.g. 15%" : "e.g. 5000"}
                                value={m.payoutValue === 0 ? "" : (m.payoutValue ?? "")}
                                onChange={(e) => {
                                  const v = e.target.value === "" ? "" : Math.max(0, Number(e.target.value))
                                  handleUpdateMemberAllocation(m.id || m.name, "payoutValue", v)
                                }}
                                className={`w-28 py-1 text-xs font-bold bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                  m.payoutType === "fixed" ? "pl-6 pr-2" : "pl-2.5 pr-6"
                                }`}
                              />
                              {m.payoutType === "percentage" && (
                                <span className="absolute right-2 text-xs font-bold text-zinc-500">%</span>
                              )}
                            </div>

                            {/* Live Converted Payout Badge */}
                            <div className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 shrink-0">
                              {m.payoutType === "percentage" ? (
                                <span>≈ ₹{m.calculatedAmount.toLocaleString("en-IN")} payout</span>
                              ) : (
                                <span>≈ {m.calculatedPercentage}% of invoice</span>
                              )}
                            </div>
                          </div>

                          {/* Right: Delete Button */}
                          <div className="flex items-center justify-end">
                            <button
                              type="button"
                              onClick={() => handleRemoveMember(m.id || m.name)}
                              className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                              title="Remove member"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Summary & Margin Breakdown Bar */}
                  <div className="mt-2 p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-sm space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/80">
                        <p className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400">Total Invoice</p>
                        <p className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
                          ₹{totalAmount.toLocaleString("en-IN")}
                        </p>
                      </div>
                      <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40">
                        <p className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">Total Team Payout</p>
                        <p className="text-sm font-extrabold text-blue-700 dark:text-blue-300">
                          ₹{totalTeamPayout.toLocaleString("en-IN")}{" "}
                          <span className="text-[11px] font-medium">({totalTeamPercentage}%)</span>
                        </p>
                      </div>
                      <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40">
                        <p className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Company Net Margin</p>
                        <p className="text-sm font-extrabold text-emerald-700 dark:text-emerald-300">
                          ₹{companyMargin.toLocaleString("en-IN")}{" "}
                          <span className="text-[11px] font-medium">({companyMarginPercentage}%)</span>
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar of Allocation */}
                    <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden flex">
                      <div
                        className={`transition-all duration-300 ${
                          totalTeamPercentage > 100 ? "bg-red-500" : "bg-blue-600"
                        }`}
                        style={{ width: `${Math.min(100, totalTeamPercentage)}%` }}
                        title={`Team Share: ${totalTeamPercentage}%`}
                      />
                      <div
                        className="bg-emerald-500 transition-all duration-300"
                        style={{ width: `${Math.max(0, 100 - totalTeamPercentage)}%` }}
                        title={`Company Margin: ${companyMarginPercentage}%`}
                      />
                    </div>

                    {totalTeamPercentage > 100 && (
                      <p className="text-[11px] font-bold text-red-600 dark:text-red-400 text-center">
                        ⚠️ Note: Total team member payouts ({totalTeamPercentage}%) exceed the total invoice amount.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
    </>
  );
}
