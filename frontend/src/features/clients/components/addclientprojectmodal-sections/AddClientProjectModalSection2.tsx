"use client"

import * as React from "react"
import { useMasterBundle } from "@/features/masters/hooks/useMasters"
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

export function AddClientProjectModalSection2({ ctrl }: { ctrl: any }) {
  const { data: masterBundle } = useMasterBundle()
  const { setIsClientSearchDropdownOpen, isClientSearchDropdownOpen, effectiveClient, clientSearchText, setClientSearchText, filteredSearchClients, handleSelectClient, clientDesignation, setClientDesignation, clientCustomDesignation, setClientCustomDesignation, clientContactPersonName, setClientContactPersonName, clientPhone, setClientPhone, clientEmail, setClientEmail, clientAddress, setClientAddress, isPincodeLoading, clientZip, handlePincodeChange, pincodeDistricts, clientDistrict, setClientDistrict, pincodePlaces, clientCity, setClientCity, clientState, setClientState, clientGst, setClientGst } = ctrl;
  return (
    <>
      <div className="p-4 rounded-2xl bg-violet-50/60 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-800/60 space-y-3">
            <div className="flex items-center gap-2 border-b border-violet-200/80 dark:border-violet-800/60 pb-2">
              <UserCheck size={15} className="text-violet-600 shrink-0" />
              <span className="font-extrabold text-violet-900 dark:text-violet-200 text-xs uppercase tracking-wider">
                Client Details
              </span>
              <span className="ml-auto text-[10px] text-violet-500 font-medium">Search · select · editable</span>
            </div>

            {/* Row 1: Searchable Client Selector + Designation + Contact Person Name + Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              <div className="relative">
                <label className="block text-[10.5px] font-bold text-zinc-600 dark:text-zinc-400 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1"><UserCheck size={12} /> Select Client *</span>
                  <button
                    type="button"
                    onClick={() => setIsClientSearchDropdownOpen(!isClientSearchDropdownOpen)}
                    className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
                  >
                    {isClientSearchDropdownOpen ? "Close" : "🔍 Search/Switch"}
                  </button>
                </label>
                <div 
                  onClick={() => setIsClientSearchDropdownOpen(!isClientSearchDropdownOpen)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-bold text-xs flex items-center justify-between cursor-pointer hover:border-blue-500"
                >
                  <span className="truncate">{effectiveClient?.name || "Click to Select Client..."}</span>
                  <ChevronDown size={14} className="text-zinc-400 shrink-0" />
                </div>

                {/* Client Search Dropdown */}
                {isClientSearchDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-2xl z-50 overflow-hidden p-2 space-y-2">
                    <div className="relative">
                      <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="Search client by name, email, phone..."
                        value={clientSearchText}
                        onChange={(e) => setClientSearchText(e.target.value)}
                        className="w-full pl-7 pr-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        autoFocus
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
                      {filteredSearchClients.length === 0 ? (
                        <div className="py-3 text-center text-zinc-400 text-xs">No clients found matching search</div>
                      ) : (
                        filteredSearchClients.map((c) => (
                          <div
                            key={c.id}
                            onClick={() => handleSelectClient(c)}
                            className="p-2 hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer rounded-lg transition-colors flex items-center justify-between"
                          >
                            <div>
                              <div className="font-bold text-zinc-900 dark:text-zinc-100">{c.name}</div>
                              <div className="text-[10.5px] text-zinc-400">{c.email || c.phone || "No contact info"}</div>
                            </div>
                            <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/40 rounded">
                              Select
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10.5px] font-bold text-zinc-600 dark:text-zinc-400 mb-1 flex items-center gap-1">
                  <UserCheck size={12} /> Contact Designation
                </label>
                <div className="flex gap-1.5">
                  <select
                    value={clientDesignation}
                    onChange={(e) => setClientDesignation(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    {(masterBundle?.options?.["client_designation"] || []).map((opt) => (
                  <option key={opt.id} value={opt.value}>{opt.label}</option>
                ))}
                  </select>
                  {clientDesignation === "Other" && (
                    <input
                      type="text"
                      placeholder="Title..."
                      value={clientCustomDesignation}
                      onChange={(e) => setClientCustomDesignation(e.target.value)}
                      className="w-24 px-2 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-medium"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[10.5px] font-bold text-zinc-600 dark:text-zinc-400 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <UserCheck size={12} /> {clientDesignation === "Other" && clientCustomDesignation ? `${clientCustomDesignation} Name` : `${clientDesignation} Name`}
                  </span>
                  <span className="text-[9px] text-violet-600 font-bold">Contact Person</span>
                </label>
                <input
                  type="text"
                  placeholder={`Name of ${clientDesignation === "Other" && clientCustomDesignation ? clientCustomDesignation.toLowerCase() : clientDesignation.toLowerCase()}...`}
                  value={clientContactPersonName}
                  onChange={(e) => setClientContactPersonName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-bold text-zinc-600 dark:text-zinc-400 mb-1 flex items-center gap-1">
                  <Phone size={12} /> Phone
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>

            {/* Row 2: Email + Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10.5px] font-bold text-zinc-600 dark:text-zinc-400 mb-1 flex items-center gap-1">
                  <Mail size={12} /> Email
                </label>
                <input
                  type="email"
                  placeholder="client@example.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-[10.5px] font-bold text-zinc-600 dark:text-zinc-400 mb-1 flex items-center gap-1">
                  <MapPin size={12} /> Street / Building Address
                </label>
                <input
                  type="text"
                  placeholder="Street / Building"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>

            {/* Row 3: PIN Code (Postal Lookup) + District + City + State */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="block text-[10.5px] font-bold text-zinc-600 dark:text-zinc-400 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1"><MapPin size={12} /> PIN Code</span>
                  {isPincodeLoading && <span className="text-[9px] text-violet-500 animate-pulse font-normal">Lookup...</span>}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 700001"
                  value={clientZip}
                  onChange={(e) => handlePincodeChange(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-mono font-bold text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-[10.5px] font-bold text-zinc-600 dark:text-zinc-400 mb-1 flex items-center gap-1">
                  District
                </label>
                {pincodeDistricts.length > 0 ? (
                  <select
                    value={clientDistrict}
                    onChange={(e) => setClientDistrict(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-medium"
                  >
                    {pincodeDistricts.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="District"
                    value={clientDistrict}
                    onChange={(e) => setClientDistrict(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                )}
              </div>
              <div>
                <label className="block text-[10.5px] font-bold text-zinc-600 dark:text-zinc-400 mb-1 flex items-center gap-1">
                  City
                </label>
                {pincodePlaces.length > 0 ? (
                  <select
                    value={clientCity}
                    onChange={(e) => setClientCity(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-medium"
                  >
                    {pincodePlaces.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="City"
                    value={clientCity}
                    onChange={(e) => setClientCity(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                )}
              </div>
              <div>
                <label className="block text-[10.5px] font-bold text-zinc-600 dark:text-zinc-400 mb-1 flex items-center gap-1">
                  State
                </label>
                <input
                  type="text"
                  placeholder="State"
                  value={clientState}
                  onChange={(e) => setClientState(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>

            {/* Row 4: GST + Note */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10.5px] font-bold text-zinc-600 dark:text-zinc-400 mb-1 flex items-center gap-1">
                  <Building2 size={12} /> GSTIN / Tax ID
                </label>
                <input
                  type="text"
                  placeholder="22AAAAA0000A1Z5"
                  value={clientGst}
                  onChange={(e) => setClientGst(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-mono font-bold text-xs focus:outline-none focus:ring-2 focus:ring-violet-500 uppercase"
                />
              </div>
              <div className="flex items-end">
                <p className="text-[10px] text-violet-600 dark:text-violet-400 font-medium leading-relaxed">
                  ℹ️ Designation, contact phone, and address are automatically printed on the official invoice & saved to client profile.
                </p>
              </div>
            </div>
          </div>
    </>
  );
}
