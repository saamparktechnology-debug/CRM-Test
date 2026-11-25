"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { 
  MapPin, Phone, Mail, Globe, Building2, Landmark, ShieldCheck, 
  Award, Sparkles, UserCheck, Briefcase, FileText, QrCode, CreditCard, 
  CheckCircle2, Layers, Check, Megaphone
} from "lucide-react"
import { InvoiceItem, InvoiceLineItem, parseCurrencyNumber } from "@/features/invoice/services/invoiceService"
import { CompanyPaymentSettings } from "@/features/settings/services/companyPaymentService"
import { ClientItem } from "@/features/clients/types"
import { useAuthStore, Company, Branch, SubBranch, DEFAULT_COMPANIES, getCompanyLogoUrl, isMatchingCompany } from "@/store/useAuthStore"
import { getQrCodeDataUri } from "@/lib/qrCode"
import { type CustomTextStamp, TextEditContext, type OfficialInvoiceDocumentProps, EditableText, formatInvoiceDate, numberToIndianWords, safeFormatCurrency } from "@/features/invoice/components/officialinvoicedocument-sections/OfficialInvoiceDocumentHelpers"

export function OfficialInvoiceDocumentSection2({ ctrl }: { ctrl: any }) {
  const { theme, interactive, totalVal, hasAnyPaymentInfo, hasAnyBankInfo, hasUpiDetails, hasQr, customPaymentQrUrl, hasBankName, resolvedBankName, onFieldChange, hasAccountNum, resolvedAccountNumber, hasIfsc, resolvedIfscCode, hasAccountHolder, resolvedAccountHolder, hasUpiId, resolvedUpiId, grossServicesValue, setupCharge, invoice, discount, isGstInvoice, taxableBase, gstRate, cgstAmt, sgstAmt, parsedReceived, parsedDue, hasDue } = ctrl;
  return (
    <>
      {/* 2-COLUMN BALANCED MATRIX: LEFT = TOTAL IN WORDS + BANK & UPI PAYMENT DETAILS; RIGHT = FINANCIAL SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-stretch">
        {/* Left 6 Columns: Amount in Words + Bank & UPI Payment Details */}
        <div className="sm:col-span-6 flex flex-col justify-between gap-2">
          {/* Card 1: TOTAL AMOUNT IN WORDS */}
          <div className={`p-2.5 sm:p-3 rounded-lg ${theme.lightBg} border ${theme.lightBorder} space-y-1 shadow-2xs`}>
            <div className="font-black text-[9px] uppercase tracking-wider text-zinc-600 flex items-center gap-1">
              <FileText size={11} className={theme.primaryText} />
              <EditableText value="TOTAL AMOUNT IN WORDS" interactive={interactive} />
            </div>
            <EditableText
              value={numberToIndianWords(totalVal)}
              interactive={interactive}
              className="font-bold text-zinc-900 italic text-[10px] sm:text-[10.5px] leading-tight block"
            />
          </div>

          {/* Card 2: BANK & UPI PAYMENT DETAILS (Renders ONLY if bank or UPI details are entered. If gap/blank, completely blank!) */}
          {hasAnyPaymentInfo && (
            <div className={`p-2.5 sm:p-3 rounded-lg ${theme.lightBg} border ${theme.lightBorder} space-y-2 shadow-2xs flex-1 flex flex-col justify-between`}>
              <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-700/60 pb-1">
                <span className="font-black text-[9.5px] uppercase tracking-wider text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                  <Landmark size={12} className={theme.primaryText} />
                  <EditableText 
                    value={hasAnyBankInfo && hasUpiDetails ? "BANK & UPI PAYMENT DETAILS" : hasAnyBankInfo ? "BANK PAYMENT DETAILS" : "UPI PAYMENT DETAILS"} 
                    interactive={interactive} 
                  />
                </span>
                <EditableText
                  value="Instant Settlement"
                  interactive={interactive}
                  className="text-[7.5px] font-black px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700"
                />
              </div>

              <div className={`grid ${hasQr && (hasAnyBankInfo || hasUpiDetails) ? "grid-cols-12" : "grid-cols-1"} gap-2.5 items-center`}>
                {/* Left side of card: UPI QR Code & Instant Scan (only if QR exists) */}
                {hasQr && (
                  <div className={`${(hasAnyBankInfo || hasUpiDetails) ? "col-span-4" : "w-full"} flex flex-col items-center justify-center text-center space-y-1`}>
                    <div className="bg-white p-1 rounded-none border border-zinc-300 shadow-2xs shrink-0 aspect-square">
                      <img 
                        src={customPaymentQrUrl || undefined} 
                        alt="UPI Payment QR Code" 
                        className="w-16 h-16 aspect-square object-contain" 
                        style={{ imageRendering: 'pixelated' }}
                      />
                    </div>
                    <EditableText
                      value="SCAN TO PAY"
                      interactive={interactive}
                      className="text-[7.5px] font-black text-zinc-600 dark:text-zinc-400 uppercase tracking-tight block"
                    />
                  </div>
                )}

                {/* Right side of card: Direct Bank Account & UPI Details (Renders ONLY if bank or UPI info is present) */}
                {(hasAnyBankInfo || hasUpiDetails) && (
                  <div className={`${hasQr ? "col-span-8" : "w-full"} space-y-1 text-[9px] text-zinc-700 dark:text-zinc-300`}>
                    {hasBankName && (
                      <div className="flex justify-between items-center gap-1">
                        <span className="text-zinc-500 font-medium shrink-0">Bank:</span>
                        <EditableText
                          value={resolvedBankName}
                          onChange={(val) => onFieldChange?.("bank_name", val)}
                          interactive={interactive}
                          fieldKey="bank_name"
                          placeholder="Bank name..."
                          className="text-zinc-900 dark:text-zinc-100 font-bold truncate text-right flex-1"
                        />
                      </div>
                    )}
                  {hasAccountNum && (
                    <div className="flex justify-between items-center gap-1 font-mono">
                      <span className="text-zinc-500 font-medium font-sans shrink-0">A/C No:</span>
                      <EditableText
                        value={resolvedAccountNumber}
                        onChange={(val) => onFieldChange?.("account_number", val)}
                        interactive={interactive}
                        fieldKey="account_number"
                        placeholder="Account number..."
                        className="text-zinc-900 dark:text-zinc-100 font-extrabold text-right flex-1"
                      />
                    </div>
                  )}
                  {hasIfsc && (
                    <div className="flex justify-between items-center gap-1 font-mono">
                      <span className="text-zinc-500 font-medium font-sans shrink-0">IFSC:</span>
                      <EditableText
                        value={resolvedIfscCode}
                        onChange={(val) => onFieldChange?.("ifsc_code", val)}
                        interactive={interactive}
                        fieldKey="ifsc_code"
                        placeholder="IFSC code..."
                        className="text-zinc-900 dark:text-zinc-100 font-extrabold uppercase text-right flex-1"
                      />
                    </div>
                  )}
                  {hasAccountHolder && (
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-zinc-500 font-medium shrink-0">A/C Name:</span>
                      <EditableText
                        value={resolvedAccountHolder}
                        onChange={(val) => onFieldChange?.("account_holder", val)}
                        interactive={interactive}
                        fieldKey="account_holder"
                        placeholder="A/C holder..."
                        className="text-zinc-900 dark:text-zinc-100 font-bold text-right flex-1 whitespace-normal break-words leading-snug"
                      />
                    </div>
                  )}
                  {hasUpiId && (
                    <div className="flex justify-between items-center gap-1 pt-0.5 border-t border-zinc-200/60 dark:border-zinc-700/50 font-mono">
                      <span className="text-zinc-500 font-medium font-sans shrink-0">UPI ID:</span>
                      <EditableText
                        value={resolvedUpiId}
                        onChange={(val) => onFieldChange?.("upi_id", val)}
                        interactive={interactive}
                        fieldKey="upi_id"
                        placeholder="UPI ID..."
                        className="text-indigo-700 dark:text-indigo-300 font-black truncate bg-indigo-50 dark:bg-indigo-950/60 px-1 py-0.2 rounded border border-indigo-200 dark:border-indigo-800 text-right flex-1"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

              {/* Payment App Badges */}
              {(hasUpiDetails || hasAnyBankInfo) && (
                <div className="flex items-center justify-between gap-1 pt-0.5 border-t border-zinc-200/70 dark:border-zinc-700/60 text-[7px] font-bold text-zinc-500">
                  <EditableText value="Accepted:" interactive={interactive} className="uppercase text-[7px] font-extrabold text-zinc-400" />
                  <div className="flex items-center gap-1">
                    {hasUpiDetails && (
                      <>
                        <EditableText value="GPay" interactive={interactive} className="px-1.5 py-0.2 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300" />
                        <EditableText value="PhonePe" interactive={interactive} className="px-1.5 py-0.2 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300" />
                        <EditableText value="Paytm" interactive={interactive} className="px-1.5 py-0.2 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300" />
                      </>
                    )}
                    {hasAnyBankInfo && (
                      <EditableText value="NEFT/IMPS" interactive={interactive} className="px-1.5 py-0.2 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300" />
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right 6 Columns: Financial Computation Matrix */}
        <div className="sm:col-span-6 flex flex-col justify-between text-[9.5px]">
          <div className="p-3 sm:p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-1 text-zinc-700 dark:text-zinc-300 shadow-2xs h-full flex flex-col justify-between">
            <div className="space-y-0.5">
              <div className="flex justify-between py-0.5">
                <EditableText value="Total Services Value" interactive={interactive} />
                <span className="font-mono font-semibold">₹{safeFormatCurrency(grossServicesValue)}</span>
              </div>
              {setupCharge > 0 && (
                <div className="flex justify-between py-0.5">
                  <EditableText value="Platform / Setup Charge" interactive={interactive} />
                  <span className="font-mono">₹{safeFormatCurrency(setupCharge)}</span>
                </div>
              )}

              {invoice.discountsList && invoice.discountsList.length > 0 ? (
                invoice.discountsList.map((d: any) => (
                  <div key={d.id} className="flex justify-between py-0.5 text-zinc-500">
                    <span>Less: {d.name}</span>
                    <span className="font-mono">(-) ₹{safeFormatCurrency(d.amount)}</span>
                  </div>
                ))
              ) : discount > 0 ? (
                <div className="flex justify-between py-0.5 text-zinc-500">
                  <EditableText value="Less: Promotional Discount" interactive={interactive} />
                  <span className="font-mono">(-) ₹{safeFormatCurrency(discount)}</span>
                </div>
              ) : null}

              <div className="flex justify-between py-1 border-t border-zinc-200 dark:border-zinc-700 font-bold text-zinc-900 dark:text-zinc-100">
                <EditableText value={isGstInvoice ? "Taxable Base Amount" : "Base Amount"} interactive={interactive} />
                <span className="font-mono">₹{safeFormatCurrency(taxableBase)}</span>
              </div>

              {isGstInvoice && (
                <>
                  <div className="flex justify-between py-0.5 text-zinc-600 dark:text-zinc-400">
                    <EditableText value={`CGST (${(gstRate / 2).toFixed(1)}%)`} interactive={interactive} />
                    <span className="font-mono">₹{safeFormatCurrency(cgstAmt)}</span>
                  </div>
                  <div className="flex justify-between py-0.5 text-zinc-600 dark:text-zinc-400">
                    <EditableText value={`SGST (${(gstRate / 2).toFixed(1)}%)`} interactive={interactive} />
                    <span className="font-mono">₹{safeFormatCurrency(sgstAmt)}</span>
                  </div>
                </>
              )}

              {(Number(invoice.creditDeduction) > 0 || Number((invoice as any).appliedCreditNotes) > 0) && (
                <div className="flex justify-between py-0.5 text-indigo-700 dark:text-indigo-400 font-bold bg-indigo-50/80 dark:bg-indigo-950/40 px-1 rounded">
                  <EditableText value="Less: Credit Note Applied" interactive={interactive} />
                  <span className="font-mono">(-) ₹{safeFormatCurrency(Number(invoice.creditDeduction) || Number((invoice as any).appliedCreditNotes) || 0)}</span>
                </div>
              )}
            </div>

            <div className={`flex justify-between p-2 sm:p-2.5 rounded-lg ${theme.grandTotalBg} font-black text-[10.5px] sm:text-[11px] tracking-wide my-1.5 shadow-xs`}>
              <EditableText value="GRAND TOTAL (NET PAYABLE)" interactive={interactive} className="text-white" />
              <span className="font-mono text-sm sm:text-base">₹{safeFormatCurrency(totalVal)}</span>
            </div>

            <div className="space-y-0.5">
              <div className="flex justify-between py-0.5 text-emerald-700 dark:text-emerald-400 font-bold">
                <EditableText value="Received Amount" interactive={interactive} />
                <span className="font-mono">₹{safeFormatCurrency(parsedReceived)}</span>
              </div>

              {Array.isArray((invoice as any).splitPayments) && (invoice as any).splitPayments.length > 0 && (
                <div className="pl-2 py-1 space-y-0.5 border-l-2 border-emerald-200 dark:border-emerald-800 text-[9px] text-zinc-600 dark:text-zinc-400">
                  {(invoice as any).splitPayments.map((sp: any, idx: number) => (
                    <div key={sp.id || idx} className="flex justify-between">
                      <span>
                        • {sp.method || "Payment"}{sp.reference ? ` (${sp.reference})` : ""}
                      </span>
                      <span className="font-mono font-semibold">₹{safeFormatCurrency(Number(sp.amount) || 0)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between py-0.5 border-t border-zinc-200 dark:border-zinc-700 font-black text-[9.5px] text-rose-600 dark:text-rose-400">
                <EditableText value="Current Balance (Total Due)" interactive={interactive} />
                <span className="font-mono">₹{safeFormatCurrency(parsedDue)}</span>
              </div>

              <div className="flex justify-between pt-0.5 text-[9px] text-zinc-500">
                <EditableText value="Next Due Date" interactive={interactive} />
                <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">{hasDue ? formatInvoiceDate(invoice.dueDate) : "-"}</span>
              </div>

              {invoice.paymentStructure && invoice.paymentStructure !== "Full Payment" && (
                <div className="pt-1 mt-0.5 border-t border-zinc-200 dark:border-zinc-700/80 text-[8.5px] text-zinc-600 dark:text-zinc-400">
                  <EditableText value="Plan:" interactive={interactive} className="font-bold mr-1 text-zinc-500" />
                  <EditableText value={invoice.paymentStructure} interactive={interactive} className="font-semibold text-zinc-800 dark:text-zinc-200" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
