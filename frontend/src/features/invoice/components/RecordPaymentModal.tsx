"use client"

import * as React from "react"
import { useMasterBundle } from "@/features/masters/hooks/useMasters"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, X, Sparkles, Check } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { InvoiceItem } from "../types/invoice.types"

interface RecordPaymentModalProps {
  paymentModalInvoice: InvoiceItem | null
  setPaymentModalInvoice: (inv: InvoiceItem | null) => void
  paymentTypeOption: "full" | "part"
  setPaymentTypeOption: (v: "full" | "part") => void
  customPartPaymentAmount: number
  setCustomPartPaymentAmount: (v: number) => void
  paymentMethod: string
  setPaymentMethod: (v: string) => void
  paymentRef: string
  setPaymentRef: (v: string) => void
  handleConfirmPayment: () => void
}

export function RecordPaymentModal({
  paymentModalInvoice,
  setPaymentModalInvoice,
  paymentTypeOption,
  setPaymentTypeOption,
  customPartPaymentAmount,
  setCustomPartPaymentAmount,
  paymentMethod,
  setPaymentMethod,
  paymentRef,
  setPaymentRef,
  handleConfirmPayment,
}: RecordPaymentModalProps) {
  const { data: masterBundle } = useMasterBundle()
  return (
      <AnimatePresence>
        {paymentModalInvoice && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="text-emerald-600" size={18} />
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    Record Payment: {paymentModalInvoice.id}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setPaymentModalInvoice(null)}
                  className="text-zinc-400 hover:text-zinc-600"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Client:</span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">
                      {paymentModalInvoice.client}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Total Invoiced:</span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">
                      {paymentModalInvoice.totalInvoiced}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Outstanding Due:</span>
                    <span className="font-bold text-rose-600">
                      {paymentModalInvoice.due}
                    </span>
                  </div>
                </div>

                {/* Payment Option: Full vs Part Payment */}
                <div>
                  <label className="block text-zinc-500 font-medium mb-1">
                    Settlement Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentTypeOption("full")}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                        paymentTypeOption === "full"
                          ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                          : "bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      Exact Due ({paymentModalInvoice.due})
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentTypeOption("part");
                        const dueNum =
                          parseInt(
                            paymentModalInvoice.due.replace(/[^0-9]/g, ""),
                          ) || 0;
                        if (customPartPaymentAmount === 0)
                          setCustomPartPaymentAmount(dueNum);
                      }}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                        paymentTypeOption === "part"
                          ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                          : "bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      Custom / Overpayment Amount
                    </button>
                  </div>
                </div>

                {paymentTypeOption === "part" && (
                  <div className="space-y-1.5">
                    <label className="block text-zinc-500 font-medium">
                      Amount Paid Now (₹) *
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={customPartPaymentAmount || ""}
                      onChange={(e) =>
                        setCustomPartPaymentAmount(Number(e.target.value))
                      }
                      placeholder="e.g. 15000"
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-200 font-bold"
                    />

                    {/* Overpayment banner */}
                    {customPartPaymentAmount >
                      (parseInt(
                        paymentModalInvoice.due.replace(/[^0-9]/g, ""),
                      ) || 0) && (
                      <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-300 dark:border-teal-800 text-[11px] text-teal-900 dark:text-teal-200 flex items-start gap-2">
                        <span className="text-teal-600 font-bold text-base leading-none">
                          💰
                        </span>
                        <div>
                          <span className="font-bold">
                            Overpayment of ₹
                            {(
                              customPartPaymentAmount -
                              (parseInt(
                                paymentModalInvoice.due.replace(/[^0-9]/g, ""),
                              ) || 0)
                            ).toLocaleString("en-IN")}{" "}
                            detected!
                          </span>
                          <p className="text-[10px] text-teal-700 dark:text-teal-400 mt-0.5">
                            This invoice will be marked Fully Paid, and the
                            excess ₹
                            {(
                              customPartPaymentAmount -
                              (parseInt(
                                paymentModalInvoice.due.replace(/[^0-9]/g, ""),
                              ) || 0)
                            ).toLocaleString("en-IN")}{" "}
                            will be automatically added as a Credit Note for{" "}
                            {paymentModalInvoice.client}.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-1.5 pt-1">
                      {[0.25, 0.5, 0.75, 1.0].map((pct) => {
                        const dueNum =
                          parseInt(
                            paymentModalInvoice.due.replace(/[^0-9]/g, ""),
                          ) || 0;
                        const amt = Math.round(dueNum * pct);
                        return (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => setCustomPartPaymentAmount(amt)}
                            className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-[10px] font-semibold text-zinc-700 dark:text-zinc-300"
                          >
                            {pct * 100}% (₹{amt.toLocaleString("en-IN")})
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-zinc-500 font-medium mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-200"
                  >
                    {(masterBundle?.options?.["payment_method"] || []).map((opt) => (
                  <option key={opt.id} value={opt.value}>{opt.label}</option>
                ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-500 font-medium mb-1">
                    Transaction Ref / UTR / Cheque No.
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. UPI882390192"
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-200"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 px-6 py-3.5 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setPaymentModalInvoice(null)}
                  className="px-4 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                >
                  {paymentTypeOption === "part" &&
                  customPartPaymentAmount >
                    (parseInt(paymentModalInvoice.due.replace(/[^0-9]/g, "")) ||
                      0)
                    ? "Confirm Settlement & Issue Credit Note"
                    : paymentTypeOption === "part"
                      ? "Record Partial Payment"
                      : "Confirm Full Settlement"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


  )
}
