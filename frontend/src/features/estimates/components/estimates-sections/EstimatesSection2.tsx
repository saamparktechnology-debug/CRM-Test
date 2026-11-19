"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  FileText, Plus, Search, Edit, Trash2, X, Send, 
  Printer, UserCheck, Mail, Building2, Phone, Sparkles, ArrowRight,
  Calculator, Clock, CheckCircle2
} from "lucide-react"
import { useAuthStore, getCompanyFullName, getCompanyLogoUrl } from "@/store/useAuthStore"
import { usePermissionStore } from "@/store/usePermissionStore"
import { EstimateService } from "@/services/salesService"
import { getClients } from "@/features/clients/services/clientService"
import { createNotification } from "@/services/notificationService"
import { executeWithFeedback } from "@/store/useActionFeedbackStore"
import { DocumentStudioModal } from "@/components/documents/DocumentStudioModal"
import { addInvoice } from "@/features/invoice/services/invoiceService"
import { sendEstimateDetailsEmailNotification } from "@/services/emailNotificationService"
import { formatDisplayDate } from "@/lib/utils"
import { type LineItem, type Estimate } from "@/features/estimates/components/estimates-sections/EstimatesHelpers"

export function EstimatesSection2({ ctrl }: { ctrl: any }) {
  const { isModalOpen, editingItem, setIsModalOpen, handleSubmit, form, setForm, setRecipientMode, recipientMode, selectedClientId, handleClientSelect, clients, addItem, items, handleItemChange, removeItem, setTaxScheme, taxScheme, subtotal, tax, grandTotal } = ctrl;
  return (
    <>
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
                <h3 className="font-bold text-sm">{editingItem ? "Edit" : "Create"} Project Estimate</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1 text-zinc-400 hover:text-zinc-600 rounded-lg"><X size={16} /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto text-xs flex-1">
                {/* Number & Date */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Estimate No. *</label>
                    <input type="text" value={form.number} onChange={(e) => setForm({...form, number: e.target.value})} className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Estimate Date *</label>
                    <input type="date" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Valid Until</label>
                    <input type="date" value={form.validTill} onChange={(e) => setForm({...form, validTill: e.target.value})} className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg" />
                  </div>
                </div>

                {/* Recipient Mode Toggle */}
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">Customer & Recipient Selection</span>
                    <div className="flex bg-zinc-200 dark:bg-zinc-700 rounded-lg p-0.5 text-[11px] font-bold">
                      <button
                        type="button"
                        onClick={() => setRecipientMode("client")}
                        className={`px-3 py-1 rounded-md transition-colors ${recipientMode === "client" ? "bg-white dark:bg-zinc-900 text-blue-600 shadow-xs" : "text-zinc-600 dark:text-zinc-400"}`}
                      >
                        CRM Registered Client
                      </button>
                      <button
                        type="button"
                        onClick={() => setRecipientMode("custom")}
                        className={`px-3 py-1 rounded-md transition-colors ${recipientMode === "custom" ? "bg-white dark:bg-zinc-900 text-blue-600 shadow-xs" : "text-zinc-600 dark:text-zinc-400"}`}
                      >
                        Custom Recipient / Email
                      </button>
                    </div>
                  </div>

                  {recipientMode === "client" ? (
                    <div>
                      <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Select Client *</label>
                      <select
                        value={selectedClientId}
                        onChange={(e) => handleClientSelect(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg font-semibold focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">-- Choose Client from CRM Directory --</option>
                        {clients.map(c => (
                          <option key={c.id} value={String(c.id)}>
                            🏢 {c.company_name || c.primaryContact} ({c.email || 'No email'})
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : null}

                  {/* Recipient Details Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Customer / Company Name *</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. Acme Tech Corp"
                        value={form.customer} 
                        onChange={(e) => setForm({...form, customer: e.target.value})} 
                        className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-1 focus:ring-blue-500 font-semibold" 
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Recipient Email Address</label>
                      <input 
                        type="email" 
                        placeholder="client@company.com"
                        value={form.customerEmail} 
                        onChange={(e) => setForm({...form, customerEmail: e.target.value})} 
                        className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg font-mono" 
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Recipient Phone</label>
                      <input 
                        type="text" 
                        placeholder="+91 98765 43210"
                        value={form.customerPhone} 
                        onChange={(e) => setForm({...form, customerPhone: e.target.value})} 
                        className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg" 
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Billing Address</label>
                      <input 
                        type="text" 
                        placeholder="City, State, Country"
                        value={form.customerAddress} 
                        onChange={(e) => setForm({...form, customerAddress: e.target.value})} 
                        className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg" 
                      />
                    </div>
                  </div>
                </div>

                {/* Line Items */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-zinc-700 dark:text-zinc-300 font-bold uppercase tracking-wider text-[11px]">Deliverable / Project Items</label>
                    <button type="button" onClick={addItem} className="text-blue-600 text-xs font-semibold hover:underline flex items-center gap-1">
                      <Plus size={12} />Add Item
                    </button>
                  </div>
                  <div className="space-y-2">
                    {items.map(item => (
                      <div key={item.id} className="grid grid-cols-12 gap-2 p-2 bg-zinc-50 dark:bg-zinc-800/60 rounded-lg items-center">
                        <div className="col-span-5"><input type="text" placeholder="Deliverable / scope description" value={item.name} onChange={(e) => handleItemChange(item.id, "name", e.target.value)} className="w-full px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-xs" /></div>
                        <div className="col-span-2"><input type="number" min="1" placeholder="Qty" value={item.quantity} onChange={(e) => handleItemChange(item.id, "quantity", Number(e.target.value))} className="w-full px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-xs text-center" /></div>
                        <div className="col-span-2"><input type="number" placeholder="Unit Price" value={item.unitPrice} onChange={(e) => handleItemChange(item.id, "unitPrice", Number(e.target.value))} className="w-full px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-xs text-right" /></div>
                        <div className="col-span-2 text-right font-mono font-bold">₹{item.total.toLocaleString("en-IN")}</div>
                        <div className="col-span-1 text-center"><button type="button" onClick={() => removeItem(item.id)} className="text-zinc-400 hover:text-rose-600"><Trash2 size={13} /></button></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Subtotal, Tax, Total */}
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400">Scheme:</span>
                    <button
                      type="button"
                      onClick={() => setTaxScheme("gst")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        taxScheme === "gst" 
                          ? "bg-blue-600 text-white shadow-xs" 
                          : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      GST (18%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTaxScheme("nongst")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        taxScheme === "nongst" 
                          ? "bg-blue-600 text-white shadow-xs" 
                          : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      Non-GST (0%)
                    </button>
                  </div>
                  <div className="w-64 space-y-1 text-right text-xs">
                    <div className="flex justify-between"><span>Subtotal:</span><span className="font-semibold font-mono">₹{subtotal.toLocaleString("en-IN")}</span></div>
                    {taxScheme === "gst" && (
                      <div className="flex justify-between"><span>Estimated GST (18%):</span><span className="font-semibold font-mono">₹{tax.toLocaleString("en-IN")}</span></div>
                    )}
                    <div className="flex justify-between text-sm font-bold text-blue-600 pt-1 border-t border-zinc-200 dark:border-zinc-700"><span>Grand Total:</span><span>₹{grandTotal.toLocaleString("en-IN")}</span></div>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Estimate Scope Notes</label>
                    <textarea rows={2} value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs" />
                  </div>
                  <div>
                    <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Terms & Validity</label>
                    <textarea rows={2} value={form.terms} onChange={(e) => setForm({...form, terms: e.target.value})} className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-mono text-[11px]" />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 shrink-0">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs text-zinc-600 hover:bg-zinc-100 rounded-lg font-semibold">Cancel</button>
                  <button type="submit" className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm">{editingItem ? "Update Estimate" : "Create Estimate"}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
