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

export function AddClientProjectModalSection7({ ctrl }: { ctrl: any }) {
  const { setPaymentModel, paymentModel, totalAmount, setPaymentStatus, paymentStatus, subscriptionMonths, setSubscriptionMonths, setInstallmentsCount, setPartPayTiming, partPayTiming, setPartInitialPayment, deadline, setDeadline, calculated3MonthDate, partInitialPayment, effectiveAdvance, remainingDue, setAdvanceAmount, advanceAmount, billingCycle, setBillingCycle } = ctrl;
  return (
    <>
      <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-zinc-800 dark:text-zinc-200 font-bold text-xs">
              <div className="flex items-center gap-1.5">
                <Calculator size={14} className="text-blue-600" />
                <span>Payment Plan & Settlement Structure</span>
              </div>

              <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-700">
                <button
                  type="button"
                  onClick={() => setPaymentModel("full")}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    paymentModel === "full"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
                  }`}
                >
                  💳 Full (100%)
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentModel("part")}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    paymentModel === "part"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
                  }`}
                >
                  🔄 Part (EMI)
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentModel("advance")}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    paymentModel === "advance"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
                  }`}
                >
                  🪙 Advance
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentModel("subscription")}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    paymentModel === "subscription"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
                  }`}
                >
                  📅 Subscription
                </button>
              </div>
            </div>

            {/* 1. Full Payment Option */}
            {paymentModel === "full" && (
              <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-xs text-zinc-900 dark:text-zinc-100">Full 100% Invoice Settlement</div>
                  <div className="text-[10.5px] text-zinc-500">Collect complete payment amount: <strong>₹{totalAmount.toLocaleString("en-IN")}</strong></div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentStatus("Paid")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      paymentStatus === "Paid"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                    }`}
                  >
                    ✓ Paid in Full
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentStatus("Payment Pending")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      paymentStatus === "Payment Pending"
                        ? "bg-amber-600 text-white shadow-xs"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                    }`}
                  >
                    ⏳ Payment Pending
                  </button>
                </div>
              </div>
            )}

            {/* 2. Part Payment (EMI) Option */}
            {paymentModel === "part" && (
              <div className="p-3.5 bg-white dark:bg-zinc-900 rounded-xl border border-blue-300 dark:border-blue-800 space-y-3 shadow-2xs">
                {/* 1. EMI Duration & Price Breakdown */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1">
                      <span>🗓️ Part Payment / EMI Duration</span>
                    </label>
                    <span className="text-[10px] font-mono font-bold text-blue-700 dark:text-blue-300">
                      Total: ₹{totalAmount.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { months: 3, label: "3 Months", subtitle: "Quarterly EMI", badge: "Recommended" },
                      { months: 6, label: "6 Months", subtitle: "Half-Yearly EMI", badge: "Standard" },
                      { months: 12, label: "12 Months", subtitle: "Annual EMI", badge: "Extended" }
                    ].map((plan) => {
                      const isSelected = subscriptionMonths === plan.months
                      const monthlyRate = Math.round(totalAmount / plan.months)
                      return (
                        <button
                          key={plan.months}
                          type="button"
                          onClick={() => {
                            setSubscriptionMonths(plan.months)
                            setInstallmentsCount(plan.months)
                          }}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? "border-blue-600 bg-blue-50/80 dark:bg-blue-950/60 ring-2 ring-blue-500/30"
                              : "border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100">{plan.label}</span>
                            {isSelected && <span className="w-2 h-2 rounded-full bg-blue-600" />}
                          </div>
                          <p className="text-[11px] font-mono font-black text-blue-700 dark:text-blue-300 mt-1">
                            ₹{monthlyRate.toLocaleString("en-IN")}<span className="text-[9px] font-normal text-zinc-500">/mo</span>
                          </p>
                          <span className="text-[9px] text-zinc-400 block mt-0.5">{plan.subtitle}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* 2. Timing Choice */}
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                  <label className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 block">
                    ⚡ Payment Settlement Schedule
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPartPayTiming("pay_now")}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        partPayTiming === "pay_now"
                          ? "border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/60 ring-2 ring-emerald-500/30"
                          : "border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 hover:bg-zinc-100"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-900 dark:text-emerald-200">
                        <span>💵 Pay Now / Advance Pay</span>
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Collect advance deposit or Month 1 today, remaining scheduled.</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPartPayTiming("pay_after_3_months")
                        setPartInitialPayment(0)
                        if (!deadline) {
                          setDeadline(calculated3MonthDate)
                        }
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        partPayTiming === "pay_after_3_months"
                          ? "border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/60 ring-2 ring-indigo-500/30"
                          : "border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 hover:bg-zinc-100"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs text-indigo-900 dark:text-indigo-200">
                        <span>🗓️ Pay After {subscriptionMonths} Months (Due Date)</span>
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-0.5">₹0 advance today. Full invoice payable after {subscriptionMonths} months.</p>
                    </button>
                  </div>
                </div>

                {/* 3. Inputs / Calculations */}
                {partPayTiming === "pay_now" ? (
                  <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10.5px] font-bold text-zinc-700 dark:text-zinc-300">
                        Advance Paid Today (₹)
                      </label>
                      <button
                        type="button"
                        onClick={() => setPartInitialPayment(Math.round(totalAmount / subscriptionMonths))}
                        className="text-[9.5px] text-blue-600 font-bold hover:underline cursor-pointer"
                      >
                        Set 1 Month (₹{Math.round(totalAmount / subscriptionMonths).toLocaleString("en-IN")})
                      </button>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={partInitialPayment === 0 ? "" : (partInitialPayment ?? "")}
                      onChange={(e) => {
                        const val = e.target.value
                        setPartInitialPayment(val === "" ? "" : Math.max(0, Number(val)))
                      }}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 font-mono font-bold text-zinc-900 dark:text-zinc-100"
                      placeholder="Enter advance amount"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-500 pt-0.5">
                      <span>Paid Today: <strong className="text-emerald-600 font-mono">₹{effectiveAdvance.toLocaleString("en-IN")}</strong></span>
                      <span>Balance Due: <strong className="text-rose-600 font-mono">₹{remainingDue.toLocaleString("en-IN")}</strong> split over {subscriptionMonths} months</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-lg bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-indigo-900 dark:text-indigo-200">Scheduled Invoice Due Date:</span>
                      <strong className="font-mono text-indigo-700 dark:text-indigo-300 text-sm">{calculated3MonthDate}</strong>
                    </div>
                    <p className="text-[10px] text-indigo-700 dark:text-indigo-300/90 leading-tight">
                      📌 Payment Status will be set to <strong>Payment Due</strong>. Full invoice total of <strong>₹{totalAmount.toLocaleString("en-IN")}</strong> is scheduled for collection on <strong>{calculated3MonthDate}</strong> ({subscriptionMonths}-month settlement period).
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 3. Advance Down Payment Option */}
            {paymentModel === "advance" && (
              <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-emerald-300 dark:border-emerald-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                    <Coins size={13} /> Advance Down Payment (₹)
                  </label>
                  <div className="flex items-center gap-1">
                    {[0.25, 0.40, 0.50].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setAdvanceAmount(Math.round(totalAmount * pct))}
                        className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[9px] font-bold cursor-pointer"
                      >
                        {pct * 100}%
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="number"
                  min="0"
                  placeholder="Enter initial advance (e.g. 20000)"
                  value={advanceAmount === 0 ? "" : (advanceAmount ?? "")}
                  onChange={(e) => {
                    const val = e.target.value
                    setAdvanceAmount(val === "" ? "" : Math.max(0, Number(val)))
                  }}
                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-emerald-200 dark:border-emerald-800 font-mono font-bold text-zinc-900 dark:text-zinc-100"
                />
                <div className="flex justify-between text-[10.5px] pt-1">
                  <span className="text-zinc-500">Initial Paid: <strong className="text-emerald-600 font-mono">₹{effectiveAdvance.toLocaleString("en-IN")}</strong></span>
                  <span className="text-zinc-500">Balance Due on Delivery: <strong className="text-rose-600 font-mono">₹{remainingDue.toLocaleString("en-IN")}</strong></span>
                </div>
              </div>
            )}

            {/* 4. Recurring Subscription Option */}
            {paymentModel === "subscription" && (
              <div className="p-3.5 bg-white dark:bg-zinc-900 rounded-xl border border-purple-300 dark:border-purple-800 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-purple-900 dark:text-purple-200">
                    <RefreshCw size={14} className="text-purple-600" />
                    <span>Recurring Client Subscription</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-bold text-[10px]">
                    Auto-Records to Subscriptions
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10.5px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Billing Cycle
                    </label>
                    <select
                      value={billingCycle}
                      onChange={(e) => setBillingCycle(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-bold text-xs"
                    >
                      <option value="Monthly">Monthly Recurring</option>
                      <option value="Quarterly">Quarterly (Every 3 Months)</option>
                      <option value="Yearly">Yearly (Annual Plan)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Initial Billing Status
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentStatus("Paid")}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                          paymentStatus === "Paid"
                            ? "bg-purple-600 text-white shadow-xs"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                        }`}
                      >
                        Paid (Cycle 1)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentStatus("Payment Pending")}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                          paymentStatus === "Payment Pending"
                            ? "bg-amber-600 text-white shadow-xs"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                        }`}
                      >
                        Pending Due
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 text-xs">
                  <div className="flex justify-between font-bold text-purple-900 dark:text-purple-200">
                    <span>Subscription Fee:</span>
                    <strong className="font-mono text-purple-700 dark:text-purple-300">₹{totalAmount.toLocaleString("en-IN")} / {billingCycle}</strong>
                  </div>
                  <p className="text-[10px] text-purple-700 dark:text-purple-300/80 mt-1">
                    ℹ️ Saving this setup creates an active Subscription record automatically in the CRM Subscriptions management module.
                  </p>
                </div>
              </div>
            )}
          </div>
    </>
  );
}
