"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { QrCode, X, Copy, Check, AlertCircle, CheckCircle2 } from "lucide-react"
import { InvoiceItem, submitClientPaymentProof, parseCurrencyNumber, getInvoices } from "../services/invoice.service"
import { isMatchingCompany } from "@/store/useAuthStore"
import { executeWithFeedback } from "@/store/useActionFeedbackStore"

interface ClientPayNowModalProps {
  clientPayNowInvoice: InvoiceItem | null
  setClientPayNowInvoice: (inv: InvoiceItem | null) => void
  companies: any[]
  branches: any[]
  activeCompanyId: string | null
  user: any
  clientUtr: string
  setClientUtr: (v: string) => void
  clientPayMethod: string
  setClientPayMethod: (v: string) => void
  clientPayNotes: string
  setClientPayNotes: (v: string) => void
  clientPayError: string | null
  setClientPayError: (v: string | null) => void
  isCopied: string | null
  setIsCopied: (v: string | null) => void
  isSubmittingProof: boolean
  setIsSubmittingProof: (v: boolean) => void
  setInvoices: (updater: any) => void
  showToast: (msg: string) => void
}

export function ClientPayNowModal({
  clientPayNowInvoice,
  setClientPayNowInvoice,
  companies,
  branches,
  activeCompanyId,
  user,
  clientUtr,
  setClientUtr,
  clientPayMethod,
  setClientPayMethod,
  clientPayNotes,
  setClientPayNotes,
  clientPayError,
  setClientPayError,
  isCopied,
  setIsCopied,
  isSubmittingProof,
  setIsSubmittingProof,
  setInvoices,
  showToast,
}: ClientPayNowModalProps) {
  return (
      <AnimatePresence>
        {clientPayNowInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden text-xs my-4"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
                    <QrCode size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base">
                      Pay Invoice #{clientPayNowInvoice.id}
                    </h3>
                    <p className="text-[11px] text-emerald-100 font-medium">
                      Scan UPI QR &amp; Enter Transaction UTR
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setClientPayNowInvoice(null)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
                {/* Amount Due Card */}
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10.5px] font-bold text-emerald-800 dark:text-emerald-300 block">
                      Total Due Amount
                    </span>
                    <span className="text-zinc-600 dark:text-zinc-400 text-[11px]">
                      {clientPayNowInvoice.project || "Invoice Settlement"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black font-mono text-emerald-700 dark:text-emerald-300">
                      ₹
                      {(
                        parseCurrencyNumber(clientPayNowInvoice.due) ||
                        parseCurrencyNumber(clientPayNowInvoice.totalInvoiced)
                      ).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* QR Code Container */}
                {(() => {
                  const activeCompObj =
                    companies.find(
                      (c) =>
                        c.id === clientPayNowInvoice.companyId ||
                        c.slug === clientPayNowInvoice.companyId,
                    ) || companies[0];
                  const upiId =
                    activeCompObj?.nongst_upi_id ||
                    activeCompObj?.gst_upi_id ||
                    activeCompObj?.upi_id ||
                    "saampark@sbi";
                  const upiHolder =
                    activeCompObj?.brand_name ||
                    activeCompObj?.name ||
                    "SAAMPARK TECHNOLOGY";
                  const dueAmt =
                    parseCurrencyNumber(clientPayNowInvoice.due) ||
                    parseCurrencyNumber(clientPayNowInvoice.totalInvoiced);
                  const upiString = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiHolder)}&am=${dueAmt}&cu=INR&tn=Invoice%20${encodeURIComponent(clientPayNowInvoice.id)}`;
                  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=1&ecc=M&data=${encodeURIComponent(upiString)}`;

                  const handleCopy = (text: string, key: string) => {
                    navigator.clipboard.writeText(text);
                    setIsCopied(key);
                    setTimeout(() => setIsCopied(null), 2000);
                  };

                  return (
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row items-center gap-4 bg-zinc-50 dark:bg-zinc-800/40 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700">
                        <div className="bg-white p-2.5 rounded-xl shadow-xs border border-zinc-200 shrink-0">
                          <img
                            src={qrCodeUrl}
                            alt="Payment UPI QR"
                            className="w-36 h-36 object-contain rounded"
                          />
                        </div>
                        <div className="space-y-2 flex-1 text-left w-full">
                          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                            <span>📲 Instant UPI Scan &amp; Pay</span>
                          </div>
                          <p className="text-[10.5px] text-zinc-500 leading-snug">
                            Scan with Google Pay, PhonePe, Paytm, BHIM, Cred or
                            any banking UPI app.
                          </p>
                          <div className="pt-1">
                            <span className="text-[10px] text-zinc-400 font-bold block">
                              Verified Merchant UPI ID:
                            </span>
                            <div className="flex items-center justify-between gap-1 mt-0.5 bg-white dark:bg-zinc-900 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 font-mono text-[11px] font-bold text-zinc-800 dark:text-zinc-200">
                              <span>{upiId}</span>
                              <button
                                type="button"
                                onClick={() => handleCopy(upiId, "upi")}
                                className="text-blue-600 hover:text-blue-700 p-0.5 cursor-pointer"
                                title="Copy UPI ID"
                              >
                                {isCopied === "upi" ? (
                                  <Check
                                    size={13}
                                    className="text-emerald-600"
                                  />
                                ) : (
                                  <Copy size={13} />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bank Details Strip */}
                      {(activeCompObj?.gst_account_number ||
                        activeCompObj?.nongst_account_number ||
                        activeCompObj?.account_number) && (
                        <div className="bg-zinc-50 dark:bg-zinc-800/30 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-[11px] space-y-1">
                          <div className="flex justify-between text-zinc-500">
                            <span>Bank Account:</span>
                            <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                              {activeCompObj.gst_account_number ||
                                activeCompObj.nongst_account_number ||
                                activeCompObj.account_number}
                            </span>
                          </div>
                          <div className="flex justify-between text-zinc-500">
                            <span>IFSC Code:</span>
                            <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                              {activeCompObj.gst_ifsc_code ||
                                activeCompObj.nongst_ifsc_code ||
                                activeCompObj.ifsc_code}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Form: Mandatory UTR */}
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!clientUtr.trim()) {
                      setClientPayError(
                        "UTR / Transaction Reference Number is mandatory to verify payment.",
                      );
                      return;
                    }
                    setClientPayError(null);
                    setIsSubmittingProof(true);
                    try {
                      const dueAmt =
                        parseCurrencyNumber(clientPayNowInvoice.due) ||
                        parseCurrencyNumber(clientPayNowInvoice.totalInvoiced);
                      await submitClientPaymentProof(
                        clientPayNowInvoice.id,
                        clientUtr.trim(),
                        dueAmt,
                        clientPayMethod,
                        clientPayNotes,
                        user?.name || clientPayNowInvoice.client,
                      );
                      showToast(
                        `Payment proof with UTR ${clientUtr.trim()} submitted! Admin has been notified for verification.`,
                      );
                      
                      setClientPayNowInvoice(null);
                      getInvoices().then((list) => setInvoices(list)).catch(() => {});
                    } catch (err: any) {
                      setClientPayError(
                        err?.message || "Failed to submit payment proof.",
                      );
                    } finally {
                      setIsSubmittingProof(false);
                    }
                  }}
                  className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800"
                >
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Transaction UTR / Reference No. (12 Digits){" "}
                      <span className="text-rose-600 font-black">
                        * Mandatory
                      </span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 430291847192 (from GPay / PhonePe / Bank SMS)"
                      value={clientUtr}
                      onChange={(e) => {
                        setClientUtr(e.target.value);
                        if (clientPayError) setClientPayError(null);
                      }}
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border-2 border-emerald-500/80 rounded-xl font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                    <p className="text-[10px] text-zinc-400 mt-1">
                      📌 Enter the 12-digit UPI Transaction ID or Bank UTR shown
                      in your payment confirmation screen.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10.5px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                        Payment App / Channel
                      </label>
                      <select
                        value={clientPayMethod}
                        onChange={(e) => setClientPayMethod(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-200 font-medium"
                      >
                        <option value="Google Pay">Google Pay (GPay)</option>
                        <option value="PhonePe">PhonePe</option>
                        <option value="Paytm">Paytm UPI</option>
                        <option value="BHIM UPI">BHIM UPI</option>
                        <option value="Bank IMPS/NEFT">
                          Bank IMPS / NEFT / RTGS
                        </option>
                        <option value="Other UPI">Other UPI App</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10.5px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                        Remarks / Notes (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Paid from HDFC account"
                        value={clientPayNotes}
                        onChange={(e) => setClientPayNotes(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg"
                      />
                    </div>
                  </div>

                  {clientPayError && (
                    <div className="p-2.5 bg-rose-50 dark:bg-rose-950/50 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                      <AlertCircle size={15} className="shrink-0" />
                      <span>{clientPayError}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setClientPayNowInvoice(null)}
                      className="px-4 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingProof || !clientUtr.trim()}
                      className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      {isSubmittingProof ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Submitting Proof...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={14} />
                          <span>Submit UTR &amp; Payment Proof</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


  )
}
