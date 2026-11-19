"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ShieldCheck, X, Copy, Check, CheckCircle2 } from "lucide-react"
import { InvoiceItem, verifyAndConfirmPayment, parseCurrencyNumber, getInvoices } from "../services/invoice.service"
import { executeWithFeedback } from "@/store/useActionFeedbackStore"

interface AdminVerifyPaymentModalProps {
  verifyingInvoice: InvoiceItem | null
  setVerifyingInvoice: (inv: InvoiceItem | null) => void
  user: any
  adminVerifyNotes: string
  setAdminVerifyNotes: (v: string) => void
  isVerifyingProof: boolean
  setIsVerifyingProof: (v: boolean) => void
  isCopied: string | null
  setIsCopied: (v: string | null) => void
  setInvoices: (updater: any) => void
  showToast: (msg: string) => void
}

export function AdminVerifyPaymentModal({
  verifyingInvoice,
  setVerifyingInvoice,
  user,
  adminVerifyNotes,
  setAdminVerifyNotes,
  isVerifyingProof,
  setIsVerifyingProof,
  isCopied,
  setIsCopied,
  setInvoices,
  showToast,
}: AdminVerifyPaymentModalProps) {
  return (
      <AnimatePresence>
        {verifyingInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden text-xs my-4"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base">
                      Verify Payment UTR
                    </h3>
                    <p className="text-[11px] text-purple-100 font-medium">
                      Invoice #{verifyingInvoice.id} • {verifyingInvoice.client}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setVerifyingInvoice(null)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* UTR Showcase Card */}
                <div className="p-4 bg-purple-50/80 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-bold text-purple-900 dark:text-purple-300">
                      Submitted Transaction UTR Number:
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (verifyingInvoice.paymentProofUtr) {
                          navigator.clipboard.writeText(
                            verifyingInvoice.paymentProofUtr,
                          );
                          showToast("UTR copied to clipboard!");
                          setTimeout(() => showToast(null), 2000);
                        }
                      }}
                      className="px-2 py-0.5 rounded bg-purple-200/80 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer hover:bg-purple-300"
                    >
                      <Copy size={11} /> Copy UTR
                    </button>
                  </div>
                  <div className="font-mono text-base font-black text-purple-950 dark:text-purple-100 bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-purple-200 dark:border-purple-800 tracking-wider">
                    {verifyingInvoice.paymentProofUtr || "No UTR Entered"}
                  </div>
                </div>

                {/* Proof Details Grid */}
                <div className="grid grid-cols-2 gap-3 p-3.5 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-700 text-[11px]">
                  <div>
                    <span className="text-zinc-400 block text-[10px]">
                      Client / Payer
                    </span>
                    <strong className="text-zinc-800 dark:text-zinc-200">
                      {verifyingInvoice.paymentProofSubmittedBy ||
                        verifyingInvoice.client}
                    </strong>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px]">
                      Claimed Amount
                    </span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs">
                      ₹
                      {(
                        verifyingInvoice.paymentProofAmount ||
                        parseCurrencyNumber(verifyingInvoice.due)
                      ).toLocaleString("en-IN")}
                    </strong>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px]">
                      Payment Method
                    </span>
                    <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                      {verifyingInvoice.paymentProofMethod || "UPI"}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px]">
                      Submitted Date &amp; Time
                    </span>
                    <span className="text-zinc-700 dark:text-zinc-300 font-mono text-[10.5px]">
                      {verifyingInvoice.paymentProofDate
                        ? formatDisplayDate(verifyingInvoice.paymentProofDate)
                        : "Recent"}
                    </span>
                  </div>
                  {verifyingInvoice.paymentProofNotes && (
                    <div className="col-span-2 pt-1 border-t border-zinc-200 dark:border-zinc-700">
                      <span className="text-zinc-400 block text-[10px]">
                        Client Remarks
                      </span>
                      <span className="text-zinc-700 dark:text-zinc-300 italic">
                        "{verifyingInvoice.paymentProofNotes}"
                      </span>
                    </div>
                  )}
                </div>

                {/* Admin Verification Decision */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                    Admin Notes / Rejection Reason (if rejecting)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. UTR verified in bank statement / UTR not found"
                    value={adminVerifyNotes}
                    onChange={(e) => setAdminVerifyNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs"
                  />
                </div>

                <div className="flex items-center justify-between gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    type="button"
                    disabled={isVerifyingProof}
                    onClick={async () => {
                      if (
                        !confirm(
                          "Are you sure you want to reject this payment proof? Invoice will return to Not Paid status.",
                        )
                      )
                        return;
                      setIsVerifyingProof(true);
                      try {
                        await verifyAndConfirmPayment(
                          verifyingInvoice.id,
                          false,
                          adminVerifyNotes,
                        );
                        showToast(
                          `Payment proof for #${verifyingInvoice.id} was rejected.`,
                        );
                        
                        setVerifyingInvoice(null);
                        getInvoices().then((list) => setInvoices(list)).catch(() => {});
                      } catch (err: any) {
                        alert(err?.message || "Error rejecting proof.");
                      } finally {
                        setIsVerifyingProof(false);
                      }
                    }}
                    className="px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl cursor-pointer"
                  >
                    ✕ Reject / Invalid UTR
                  </button>

                  <button
                    type="button"
                    disabled={isVerifyingProof}
                    onClick={async () => {
                      setIsVerifyingProof(true);
                      try {
                        await verifyAndConfirmPayment(
                          verifyingInvoice.id,
                          true,
                          adminVerifyNotes,
                        );
                        showToast(
                          `Payment for #${verifyingInvoice.id} verified and confirmed successfully!`,
                        );
                        
                        setVerifyingInvoice(null);
                        getInvoices().then((list) => setInvoices(list)).catch(() => {});
                      } catch (err: any) {
                        alert(err?.message || "Error confirming payment.");
                      } finally {
                        setIsVerifyingProof(false);
                      }
                    }}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    {isVerifyingProof ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Confirming...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={14} />
                        <span>✓ Confirm &amp; Mark Paid</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
  )
}
