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

export function AddClientProjectModalSection6({ ctrl }: { ctrl: any }) {
  const { discountsList, handleAddDiscount, handleUpdateDiscount, handleRemoveDiscount, serviceItems, totalServicesBase, totalPlatformCharges, totalDiscounts, taxableBase, totalGstAmount, totalAmount } = ctrl;
  return (
    <>
      {/* ---------------- NAMED MULTI-DISCOUNTS SECTION ---------------- */}
          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-zinc-800 dark:text-zinc-200 text-xs flex items-center gap-1.5">
                <Tag size={13} className="text-amber-600" />
                <span>Promotional Discounts & Rebates ({discountsList.length})</span>
              </span>
              <button
                type="button"
                onClick={handleAddDiscount}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 flex items-center gap-1 cursor-pointer"
              >
                <Plus size={12} />
                <span>Add Discount</span>
              </button>
            </div>

            {discountsList.length === 0 ? (
              <p className="text-[11px] text-zinc-400 italic">No discounts applied. Click &quot;Add Discount&quot; to apply custom promotional rebates.</p>
            ) : (
              <div className="space-y-1.5">
                {discountsList.map((disc) => (
                  <div key={disc.id} className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-2 rounded-lg border border-zinc-200 dark:border-zinc-700">
                    <input
                      type="text"
                      placeholder="Discount Title (e.g. Festival Offer / Referral 10%)"
                      value={disc.name}
                      onChange={(e) => handleUpdateDiscount(disc.id, "name", e.target.value)}
                      className="flex-1 px-2.5 py-1 rounded bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-medium"
                    />
                    <div className="flex items-center gap-1">
                      <span className="text-rose-500 font-bold text-xs">(-) ₹</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="Amount"
                        value={disc.amount === 0 ? "" : (disc.amount ?? "")}
                        onChange={(e) => {
                          const val = e.target.value
                          handleUpdateDiscount(disc.id, "amount", val === "" ? "" : Math.max(0, Number(val)))
                        }}
                        className="w-28 px-2 py-1 rounded bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono font-bold text-xs text-rose-600"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDiscount(disc.id)}
                      className="p-1 text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ---------------- LIVE FINANCIAL SUMMARY LEDGER ---------------- */}
          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-zinc-800/60 border border-slate-200/90 dark:border-zinc-700/80 space-y-3 text-xs shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-700 pb-2">
              <span className="font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 text-[11px] flex items-center gap-1.5">
                <Receipt size={13} className="text-blue-600 dark:text-blue-400" />
                <span>Consolidated Financial Summary</span>
              </span>
              <span className="font-semibold text-[10.5px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                {serviceItems.length} Services Itemized
              </span>
            </div>

            <div className="space-y-1.5 text-slate-600 dark:text-slate-300 text-[11px]">
              <div className="flex justify-between">
                <span>Total Services Base Value:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">₹{totalServicesBase.toLocaleString("en-IN")}</span>
              </div>

              {totalPlatformCharges > 0 && (
                <div className="flex justify-between text-indigo-600 dark:text-indigo-400">
                  <span>Total Additional / Setup Charges:</span>
                  <span className="font-mono font-bold">₹{totalPlatformCharges.toLocaleString("en-IN")}</span>
                </div>
              )}

              {totalDiscounts > 0 && (
                <div className="flex justify-between text-rose-600 dark:text-rose-400">
                  <span>Total Discounts Applied:</span>
                  <span className="font-mono font-bold">(-) ₹{totalDiscounts.toLocaleString("en-IN")}</span>
                </div>
              )}

              <div className="flex justify-between py-1 border-t border-slate-200 dark:border-zinc-700 font-bold text-slate-900 dark:text-slate-100">
                <span>Taxable Base Value:</span>
                <span className="font-mono">₹{taxableBase.toLocaleString("en-IN")}</span>
              </div>

              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Total GST Taxes:</span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">₹{totalGstAmount.toLocaleString("en-IN")}</span>
              </div>

              <div className="mt-2.5 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border border-blue-200/80 dark:border-blue-800/80 flex items-center justify-between shadow-2xs">
                <span className="font-extrabold text-blue-900 dark:text-blue-100 text-xs">Grand Total (Net Payable):</span>
                <span className="font-mono font-black text-base text-blue-600 dark:text-blue-400">₹{totalAmount.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          {/* ---------------- PAYMENT TERMS & DOWNPAYMENT ---------------- */}
    </>
  );
}
