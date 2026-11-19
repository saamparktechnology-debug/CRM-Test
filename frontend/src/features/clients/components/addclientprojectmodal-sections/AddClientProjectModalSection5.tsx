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

export function AddClientProjectModalSection5({ ctrl }: { ctrl: any }) {
  const { serviceItems, handleAddService, itemCalculations, handleRemoveService, handleUpdateService, handleAddCharge, handleUpdateCharge, handleRemoveCharge } = ctrl;
  return (
    <>
      {/* ---------------- MULTI-SERVICE ITEM BUILDER ---------------- */}
          <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-200/80 dark:border-blue-800/60 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-blue-600" />
                <span className="font-extrabold text-blue-900 dark:text-blue-200 text-xs uppercase tracking-wider">
                  Itemized Services & Pricing ({serviceItems.length} {serviceItems.length === 1 ? 'Service' : 'Services'})
                </span>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-zinc-500 font-semibold">Quick Add:</span>
                {SERVICE_PRESETS.slice(0, 4).map(preset => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleAddService(preset)}
                    className="px-2 py-0.5 rounded bg-white dark:bg-zinc-800 border border-blue-200 dark:border-blue-700 hover:bg-blue-50 text-[10px] font-bold text-blue-700 dark:text-blue-300 transition-colors cursor-pointer"
                  >
                    + {preset.name.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* List of Dynamic Service Cards */}
            <div className="space-y-3">
              {serviceItems.map((item, index) => {
                const itemCalc = itemCalculations[index]
                return (
                  <div 
                    key={item.id} 
                    className="p-3.5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-2xs space-y-3 relative group"
                  >
                    {/* Header of Item Row */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 font-extrabold text-[10px]">
                        SERVICE #{index + 1}
                      </span>
                      
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-zinc-900 dark:text-zinc-100">
                          Line Total: ₹{itemCalc?.itemTotal.toLocaleString("en-IN") || 0}
                        </span>
                        {serviceItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveService(item.id)}
                            className="p-1 text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Remove this service"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Service Row Fields: Name, Rate, Qty & Unit, GST */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                      <div className="sm:col-span-5">
                        <label className="block text-[10.5px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                          Custom Service Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Custom React Application"
                          value={item.serviceName}
                          onChange={(e) => handleUpdateService(item.id, "serviceName", e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-semibold text-zinc-900 dark:text-zinc-100"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[10.5px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                          Base Rate (₹) *
                        </label>
                        <input
                          type="number"
                          min="0"
                          required
                          placeholder="e.g. 35000"
                          value={item.rate === 0 ? "" : (item.rate ?? "")}
                          onChange={(e) => {
                            const val = e.target.value
                            handleUpdateService(item.id, "rate", val === "" ? "" : Math.max(0, Number(val)))
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono font-bold text-zinc-900 dark:text-zinc-100"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[10.5px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                          Qty & Unit
                        </label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="1"
                            value={item.qty === 0 ? "" : (item.qty ?? "")}
                            onChange={(e) => handleUpdateService(item.id, "qty", e.target.value === "" ? "" : Math.max(1, Number(e.target.value)))}
                            className="w-12 px-1.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-center font-bold"
                          />
                          <select
                            value={["Qty", "Unit", "Weekly", "Monthly", "Yearly", "Project"].includes(item.unit) ? item.unit : "custom"}
                            onChange={(e) => {
                              if (e.target.value === "custom") {
                                const customVal = prompt("Enter custom unit name:") || "Unit"
                                handleUpdateService(item.id, "unit", customVal)
                              } else {
                                handleUpdateService(item.id, "unit", e.target.value)
                              }
                            }}
                            className="w-full px-2 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[11px] font-semibold text-zinc-900 dark:text-zinc-100"
                          >
                            <option value="Qty">Qty</option>
                            <option value="Unit">Unit</option>
                            <option value="Weekly">Weekly</option>
                            <option value="Monthly">Monthly</option>
                            <option value="Yearly">Yearly</option>
                            <option value="Project">Project</option>
                            <option value="custom">Other...</option>
                          </select>
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[10.5px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                          GST Rate
                        </label>
                        <select
                          value={item.gstRate}
                          onChange={(e) => handleUpdateService(item.id, "gstRate", Number(e.target.value))}
                          className="w-full px-2 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-semibold text-zinc-900 dark:text-zinc-100"
                        >
                          <option value={18}>18% (GST)</option>
                          <option value={12}>12% (Print)</option>
                          <option value={5}>5%</option>
                          <option value={0}>0% (Non-GST)</option>
                        </select>
                      </div>
                    </div>

                    {/* Inline Item-Specific Extra Charges */}
                    <div className="pt-1 space-y-2 border-t border-zinc-100 dark:border-zinc-800">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">
                          Item-Level Extra Charges / Add-ons ({item.charges.length})
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAddCharge(item.id)}
                          className="text-[10px] font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 flex items-center gap-1 cursor-pointer"
                        >
                          <Plus size={11} />
                          <span>Add Specific Charge</span>
                        </button>
                      </div>

                      {item.charges.length > 0 && (
                        <div className="space-y-1.5 pl-2 border-l-2 border-blue-300 dark:border-blue-700">
                          {item.charges.map((chg) => (
                            <div key={chg.id} className="flex items-center gap-2">
                              <input
                                type="text"
                                placeholder="Charge name (e.g. Dedicated Server Setup)"
                                value={chg.name}
                                onChange={(e) => handleUpdateCharge(item.id, chg.id, "name", e.target.value)}
                                className="flex-1 px-2 py-1 rounded bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[11px]"
                              />
                              <div className="flex items-center gap-1">
                                <span className="text-zinc-400 text-[11px]">₹</span>
                                <input
                                  type="number"
                                  min="0"
                                  placeholder="Price"
                                  value={chg.amount === 0 ? "" : (chg.amount ?? "")}
                                  onChange={(e) => {
                                    const val = e.target.value
                                    handleUpdateCharge(item.id, chg.id, "amount", val === "" ? "" : Math.max(0, Number(val)))
                                  }}
                                  className="w-24 px-2 py-1 rounded bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono font-bold text-[11px]"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveCharge(item.id, chg.id)}
                                className="p-1 text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Add Another Service Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => handleAddService()}
                className="w-full py-2 rounded-xl bg-white dark:bg-zinc-900 border border-dashed border-blue-400 dark:border-blue-700 text-blue-600 dark:text-blue-300 hover:bg-blue-50/80 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
              >
                <Plus size={14} />
                <span>Add Another Service / Product</span>
              </button>
            </div>
          </div>
    </>
  );
}
