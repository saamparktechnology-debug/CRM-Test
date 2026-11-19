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

export function AddClientProjectModalSection3({ ctrl }: { ctrl: any }) {
  const { effectiveCategory, projectTitle, setProjectTitle, isCustomCategory, setIsCustomCategory, setCategory, customCategory, handleCustomCategoryChange, category, handleCategorySelect, STANDARD_CATEGORIES, billedByAdmin, setBilledByAdmin, adminsList, creationMode, startDate, setStartDate, deadline, setDeadline } = ctrl;
  return (
    <>
      {/* Project Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300">
                  Project / Order Title *
                </label>
                {effectiveCategory && projectTitle !== effectiveCategory && (
                  <button
                    type="button"
                    onClick={() => setProjectTitle(effectiveCategory)}
                    className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
                    title="Copy category to project title"
                  >
                    ✨ Use "{effectiveCategory}"
                  </button>
                )}
              </div>
              <input
                type="text"
                required
                placeholder="e.g. Complete Digital Transformation Suite"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-xs sm:text-sm"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300">
                  Primary Category
                </label>
                {isCustomCategory && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomCategory(false)
                      setCategory("Website Development")
                      if (!projectTitle || projectTitle === customCategory) {
                        setProjectTitle("Website Development")
                      }
                    }}
                    className="text-[10px] font-bold text-violet-600 dark:text-violet-400 hover:underline cursor-pointer"
                  >
                    ← Standard Presets
                  </button>
                )}
              </div>

              {isCustomCategory ? (
                <div className="relative">
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="Type custom category name (e.g. AI Automation)"
                    value={customCategory}
                    onChange={(e) => handleCustomCategoryChange(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-violet-50/50 dark:bg-violet-950/20 border border-violet-300 dark:border-violet-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500 font-bold text-xs sm:text-sm"
                  />
                  <span className="absolute right-3 top-2.5 text-[10px] uppercase font-black text-violet-600 dark:text-violet-400">
                    Custom
                  </span>
                </div>
              ) : (
                <select
                  value={category}
                  onChange={(e) => handleCategorySelect(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-xs sm:text-sm cursor-pointer"
                >
                  {STANDARD_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="custom">✨ + Custom Category...</option>
                </select>
              )}
            </div>
          </div>

          {/* Dates & Billed By */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Billed By (Admin)
              </label>
              <select
                value={billedByAdmin}
                onChange={(e) => setBilledByAdmin(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                {adminsList.map(a => (
                  <option key={a.id} value={a.name}>{a.name}</option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                  <Calendar size={13} className="text-blue-600" />
                  <span>{creationMode === "invoice_only" ? "Invoice Date *" : "Invoice Date / Start Date *"}</span>
                </label>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">Default: Today</span>
              </div>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                title="Invoice Date (Default: Today. Select any past or future date)"
                className="w-full px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setStartDate(new Date().toISOString().split("T")[0])}
                  className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 hover:bg-blue-100 cursor-pointer"
                >
                  📅 Today
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const y = new Date()
                    y.setDate(y.getDate() - 1)
                    setStartDate(y.toISOString().split("T")[0])
                  }}
                  className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 hover:bg-zinc-200 cursor-pointer"
                >
                  ⏮️ Yesterday
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date()
                    d.setDate(1)
                    setStartDate(d.toISOString().split("T")[0])
                  }}
                  className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 hover:bg-zinc-200 cursor-pointer"
                >
                  ⏪ 1st of Month
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                  <Calendar size={13} className="text-blue-600" />
                  <span>Due / Delivery Date</span>
                </label>
                <span className="text-[10px] text-zinc-400 font-medium">+30 Days Default</span>
              </div>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date(startDate ? new Date(startDate) : new Date())
                    d.setDate(d.getDate() + 15)
                    setDeadline(d.toISOString().split("T")[0])
                  }}
                  className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 hover:bg-zinc-200 cursor-pointer"
                >
                  Due +15d
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date(startDate ? new Date(startDate) : new Date())
                    d.setDate(d.getDate() + 30)
                    setDeadline(d.toISOString().split("T")[0])
                  }}
                  className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 hover:bg-zinc-200 cursor-pointer"
                >
                  Due +30d
                </button>
              </div>
            </div>
          </div>
    </>
  );
}
