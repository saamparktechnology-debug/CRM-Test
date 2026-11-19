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

export function EstimatesSection3({ ctrl }: { ctrl: any }) {
  const { sendingItem, setSendingItem, sendEmail, setSendEmail, sendMessage, setSendMessage, isSending, handleSendEstimate, viewingItem, handleConvertToInvoice, setViewingItem, logoUrl, companyName, activeCompany } = ctrl;
  return (
    <>
      {/* SEND TO CLIENT MODAL */}
      <AnimatePresence>
        {sendingItem && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden text-xs">
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40">
                <div className="flex items-center gap-2.5 font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  <Send size={16} className="text-blue-600" />
                  <span>Send Estimate to Client</span>
                </div>
                <button onClick={() => setSendingItem(null)} className="p-1 text-zinc-400 hover:text-zinc-600 rounded-lg"><X size={16} /></button>
              </div>

              <div className="p-6 space-y-4">
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200">
                  <span className="font-bold">Estimate:</span> {sendingItem.number} | <span className="font-bold">Estimated Cost:</span> ₹{(sendingItem.total || 0).toLocaleString("en-IN")}
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Recipient Email Address *</label>
                  <input 
                    type="email" 
                    required 
                    placeholder="client@company.com"
                    value={sendEmail} 
                    onChange={e => setSendEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-mono font-semibold"
                  />
                  <p className="text-[10px] text-zinc-400 mt-1">You can send to the client's registered email or input any custom email address.</p>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Message to Client</label>
                  <textarea 
                    rows={5}
                    value={sendMessage} 
                    onChange={e => setSendMessage(e.target.value)}
                    className="w-full p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <button type="button" onClick={() => setSendingItem(null)} className="px-4 py-2 text-zinc-600 hover:bg-zinc-100 rounded-lg font-semibold">Cancel</button>
                  <button 
                    type="button" 
                    disabled={isSending || !sendEmail.trim()}
                    onClick={handleSendEstimate}
                    className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    <Send size={13} />
                    <span>{isSending ? "Sending..." : "Dispatch Estimate"}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* OFFICIAL LETTERHEAD VIEW & PRINT MODAL */}
      <AnimatePresence>
        {viewingItem && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto print:p-0 print:bg-white">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden print:border-none print:shadow-none print:max-h-none print:w-full print:rounded-none">
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 shrink-0 print:hidden">
                <span className="font-bold text-sm">Commercial Estimate: {viewingItem.number}</span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleConvertToInvoice(viewingItem)} 
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
                  >
                    <ArrowRight size={14} /><span>Convert to Invoice</span>
                  </button>
                  <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer">
                    <Printer size={14} /><span>Print / PDF</span>
                  </button>
                  <button onClick={() => setViewingItem(null)} className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="p-8 sm:p-12 overflow-y-auto flex-1 bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 print:p-0 print:bg-white print:text-black space-y-6">
                {/* Official Letterhead Header */}
                <div className="border-b-2 border-zinc-900 pb-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {logoUrl ? (
                      <img src={logoUrl} alt={companyName} className="h-14 max-w-[150px] object-contain" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold text-xl print:text-black">🏢</div>
                    )}
                    <div>
                      <h1 className="text-xl font-black uppercase tracking-tight">{companyName}</h1>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400 print:text-zinc-700 max-w-md">{activeCompany?.address || "Corporate Office, West Bengal, India"}</p>
                      {activeCompany?.gstin && <p className="text-[10px] text-zinc-500 font-mono">GSTIN: {activeCompany.gstin} {activeCompany?.pan ? `| PAN: ${activeCompany.pan}` : ""}</p>}
                    </div>
                  </div>

                  <div className="text-right text-xs space-y-1">
                    <h2 className="text-lg font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 print:text-black">PROJECT ESTIMATE</h2>
                    <p className="font-mono font-bold">{viewingItem.number}</p>
                    <p className="text-[11px] text-zinc-500">Date: {formatDisplayDate(viewingItem.date)}</p>
                    {viewingItem.validTill && <p className="text-[10px] text-zinc-400">Valid Till: {formatDisplayDate(viewingItem.validTill)}</p>}
                  </div>
                </div>

                {/* Bill To */}
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Estimate Prepared For:</span>
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{viewingItem.customer}</h3>
                    {viewingItem.customerAddress && <p className="text-xs text-zinc-600 dark:text-zinc-400">{viewingItem.customerAddress}</p>}
                    {viewingItem.customerEmail && <p className="text-xs font-mono text-zinc-500">{viewingItem.customerEmail}</p>}
                    {viewingItem.customerPhone && <p className="text-xs text-zinc-500">{viewingItem.customerPhone}</p>}
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Status:</span>
                    <p className="font-bold text-xs uppercase text-blue-600 dark:text-blue-400">{viewingItem.status}</p>
                  </div>
                </div>

                {/* Line Items Table */}
                <table className="w-full text-left text-xs border border-zinc-200 dark:border-zinc-800">
                  <thead className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Deliverable / Scope Description</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Unit Rate</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {(viewingItem.items || []).map((item, idx) => (
                      <tr key={item.id}>
                        <td className="py-2.5 px-3 font-mono text-zinc-400">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-semibold">{item.name}</td>
                        <td className="py-2.5 px-3 text-center font-mono">{item.quantity}</td>
                        <td className="py-2.5 px-3 text-right font-mono">₹{item.unitPrice.toLocaleString("en-IN")}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold">₹{item.total.toLocaleString("en-IN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Financial Summary */}
                <div className="flex justify-between items-start gap-6 pt-2">
                  <div className="flex-1 space-y-3">
                    {viewingItem.terms && (
                      <div className="text-[11px] text-zinc-500">
                        <span className="font-bold text-zinc-700 dark:text-zinc-300 block mb-0.5">Scope & Validity Terms:</span>
                        <p className="whitespace-pre-line font-mono text-[10px]">{viewingItem.terms}</p>
                      </div>
                    )}
                    {activeCompany?.bank_name && (
                      <div className="text-[10px] text-zinc-500 font-mono p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                        <span className="font-bold text-zinc-700 dark:text-zinc-300 block">Bank Account Details for Remittance:</span>
                        <span>Bank: {activeCompany.bank_name} | A/C: {activeCompany.account_number} | IFSC: {activeCompany.ifsc_code} | UPI: {activeCompany.upi_id || 'N/A'}</span>
                      </div>
                    )}
                  </div>

                  <div className="w-64 space-y-1.5 text-right text-xs">
                    <div className="flex justify-between"><span>Subtotal:</span><span className="font-semibold font-mono">₹{(viewingItem.subtotal || 0).toLocaleString("en-IN")}</span></div>
                    {(!((viewingItem as any).isNonGst || (viewingItem as any).taxType === "nongst")) && (
                      <div className="flex justify-between"><span>GST (18%):</span><span className="font-semibold font-mono">₹{(viewingItem.tax || 0).toLocaleString("en-IN")}</span></div>
                    )}
                    <div className="flex justify-between text-base font-black text-blue-600 dark:text-blue-400 pt-2 border-t-2 border-zinc-900 dark:border-zinc-100">
                      <span>Grand Total:</span><span>₹{(viewingItem.total || 0).toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>

                {/* Signatory */}
                <div className="pt-10 flex justify-end">
                  <div className="text-right space-y-1">
                    {activeCompany?.signature_image_url && (
                      <img src={activeCompany.signature_image_url} alt="Signature" className="h-10 max-w-[120px] object-contain ml-auto" />
                    )}
                    <div className="border-t border-zinc-400 pt-1">
                      <p className="font-bold text-xs">{activeCompany?.signatory_name || "Authorized Signatory"}</p>
                      <p className="text-[10px] text-zinc-500">{activeCompany?.signatory_designation || "Managing Director"}</p>
                      <p className="text-[10px] font-bold text-zinc-700">{companyName}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
