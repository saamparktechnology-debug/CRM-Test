"use client"

import * as React from "react"
import { 
  Printer, Download, Check, X, ArrowRight, Building2, MapPin, 
  Phone, Mail, Globe, Shield, Calendar, Calculator, CheckCircle2,
  Clock, AlertCircle, FileText, QrCode, Landmark, Stamp, FileCheck, Sparkles, Megaphone
} from "lucide-react"
import { EstimateItem } from "@/features/estimates/services/estimateService"
import { useAuthStore, Company, Branch, DEFAULT_COMPANIES, getCompanyLogoUrl } from "@/store/useAuthStore"
import { getQrCodeDataUri } from "@/lib/qrCode"
import { OfficialFormNo9Document } from "@/components/documents/OfficialFormNo9Document"
import { printDocument } from "@/lib/printUtils"
import { type OfficialEstimateDocumentProps, formatEstimateDate, numberToIndianWords } from "@/features/estimates/components/officialestimatedocument-sections/OfficialEstimateDocumentHelpers"

export function OfficialEstimateDocumentSection2({ ctrl }: { ctrl: any }) {
  const { estimate, theme, gstRate, subtotal, cgst, sgst, grandTotal, resolvedBankName, resolvedAccountHolder, resolvedAccountNumber, resolvedIfscCode, resolvedBankBranch, resolvedUpiId, resolvedPaymentQrUrl, isNonGst } = ctrl;
  return (
    <>
      {/* 2. Customer / Bill-To Section */}
        <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/70">
          <div className="text-[10px] font-bold uppercase tracking-wider text-teal-900 mb-1.5 flex items-center justify-between">
            <span>ESTIMATE PREPARED EXCLUSIVELY FOR (CLIENT):</span>
            <span className="text-zinc-500 font-normal">Currency: INR (₹) • Tax: GST (18%)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-black text-zinc-950 uppercase">{estimate.client}</h3>
              {estimate.clientEmail && (
                <p className="text-zinc-600 font-mono text-[11px] mt-0.5">{estimate.clientEmail}</p>
              )}
              {(estimate as any).clientPhone && (
                <p className="text-zinc-600 text-[11px]">{(estimate as any).clientPhone}</p>
              )}
              {(estimate as any).clientContactPerson && (
                <p className="text-zinc-600 text-[11px]">Attn: <strong>{(estimate as any).clientContactPerson}</strong></p>
              )}
            </div>
            <div className="text-[11px] text-zinc-600 space-y-0.5 sm:text-right">
              {(estimate as any).clientAddress && (
                <p className="leading-snug">{(estimate as any).clientAddress}</p>
              )}
              {(estimate as any).clientGstin && (
                <p><span className="text-zinc-500">Client GSTIN:</span> <strong className="font-mono font-bold text-zinc-900">{(estimate as any).clientGstin}</strong></p>
              )}
              <p>Place of Supply: <strong className="text-zinc-800 font-semibold">{(estimate as any).placeOfSupply || "West Bengal (Code 19)"}</strong></p>
              <p className="text-teal-800 font-semibold text-[10px]">Scope Title: {estimate.title}</p>
            </div>
          </div>
        </div>

        {/* 3. Itemized Scope of Work Table */}
        <div className="border border-zinc-200 rounded-xl overflow-hidden shadow-2xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead className={`${theme.tableHeaderBg} uppercase text-[10px] tracking-wider`}>
              <tr>
                <th className="py-2.5 px-3 w-10 text-center font-bold">#</th>
                <th className="py-2.5 px-4 font-bold">Service / Scope of Deliverables</th>
                <th className="py-2.5 px-3 text-center font-bold">SAC</th>
                <th className="py-2.5 px-3 text-center font-bold">Qty</th>
                <th className="py-2.5 px-3 text-right font-bold">Unit Rate (₹)</th>
                <th className="py-2.5 px-3 text-right font-bold">Taxable Amt (₹)</th>
                <th className="py-2.5 px-3 text-right font-bold">CGST (9%)</th>
                <th className="py-2.5 px-3 text-right font-bold">SGST (9%)</th>
                <th className="py-2.5 px-4 text-right font-bold">Total (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-zinc-800">
              {estimate.services && estimate.services.length > 0 ? (
                estimate.services.map((s, idx) => {
                  const itemBase = s.total || (s.unitPrice * s.quantity)
                  const itemTax = Math.round(itemBase * (gstRate / 100))
                  const itemCgst = Math.round(itemTax / 2)
                  const itemSgst = itemTax - itemCgst
                  const itemGross = itemBase + itemTax

                  return (
                    <tr key={s.id || idx} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="py-3 px-3 text-center font-mono text-zinc-500">{idx + 1}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-zinc-950">{s.name}</div>
                        {s.description && (
                          <p className="text-[11px] text-zinc-500 mt-0.5 leading-normal">{s.description}</p>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-[11px] text-zinc-500">
                        {(s as any).sac || "998311"}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-semibold">{s.quantity}</td>
                      <td className="py-3 px-3 text-right font-mono">₹{s.unitPrice.toLocaleString("en-IN")}</td>
                      <td className="py-3 px-3 text-right font-mono font-semibold">₹{itemBase.toLocaleString("en-IN")}</td>
                      <td className="py-3 px-3 text-right font-mono text-zinc-600">₹{itemCgst.toLocaleString("en-IN")}</td>
                      <td className="py-3 px-3 text-right font-mono text-zinc-600">₹{itemSgst.toLocaleString("en-IN")}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-zinc-950">
                        ₹{itemGross.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-6 text-center text-zinc-400">No line items configured.</td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-zinc-50 border-t border-zinc-200 font-semibold text-zinc-700">
              <tr>
                <td colSpan={3} className="py-2.5 px-4 font-bold uppercase text-[10px] text-zinc-600">Subtotal Scope Value</td>
                <td className="py-2.5 px-3 text-center font-mono">{estimate.services?.reduce((acc, s) => acc + s.quantity, 0) || 1}</td>
                <td></td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-zinc-900">₹{subtotal.toLocaleString("en-IN")}</td>
                <td className="py-2.5 px-3 text-right font-mono">₹{cgst.toLocaleString("en-IN")}</td>
                <td className="py-2.5 px-3 text-right font-mono">₹{sgst.toLocaleString("en-IN")}</td>
                <td className="py-2.5 px-4 text-right font-mono font-black text-teal-800">₹{grandTotal.toLocaleString("en-IN")}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* 4. Computation, Words, Banking & Remittance Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 pt-1">
          {/* Left Column: Words & Payment Details */}
          <div className="sm:col-span-7 space-y-3.5">
            <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-900 block mb-0.5">
                Total Commercial Estimate in Words:
              </span>
              <p className="font-sans font-bold text-teal-950 text-sm">
                {numberToIndianWords(grandTotal)}
              </p>
            </div>

            {/* Digital Marketing & Social Media Campaign Package Card */}
            {estimate.marketingPackage?.enabled && (
              <div className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/60 text-xs space-y-2">
                <div className="flex items-center justify-between border-b border-purple-200 pb-1.5">
                  <span className="font-bold text-purple-900 flex items-center gap-1.5">
                    <Megaphone size={14} className="text-purple-700" />
                    <span>DIGITAL MARKETING PACKAGE ({estimate.marketingPackage.planName || "Grow - 2"})</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-200 text-purple-800">
                    FORM NO - 9
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-700">
                  <div>Duration: <strong>{estimate.marketingPackage.packageDuration || "1 month"}</strong> ({estimate.marketingPackage.startDate} - {estimate.marketingPackage.expireDate})</div>
                  <div>Creatives: <strong>{estimate.marketingPackage.postersCount || 12} Posters</strong> • <strong>{estimate.marketingPackage.videosCount || 2} AI Reels</strong></div>
                  {estimate.marketingPackage.hasRealModelShoot && (
                    <div className="col-span-2 text-purple-800 font-semibold">📸 Real Model Shoot: {estimate.marketingPackage.modelShootDate} ({estimate.marketingPackage.modelShootNotes || "Included"})</div>
                  )}
                  {estimate.marketingPackage.targetLocations && (
                    <div className="col-span-2 text-zinc-600 text-[10px]">🎯 Audience Target: {estimate.marketingPackage.targetLocations}</div>
                  )}
                </div>
              </div>
            )}

            {/* Bank Remittance Details Box */}
            <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/70 space-y-2 text-[11px]">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-1.5">
                <span className="font-bold text-zinc-900 flex items-center gap-1.5">
                  <Landmark size={13} className="text-teal-700" />
                  <span>Beneficiary Remittance &amp; Banking Details</span>
                </span>
                <span className="text-[10px] font-mono text-zinc-500">NEFT / RTGS / IMPS / UPI</span>
              </div>

              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <div className="flex justify-between"><span className="text-zinc-500">Bank Name:</span> <span className="font-semibold text-zinc-900">{resolvedBankName}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Account Name:</span> <span className="font-semibold text-zinc-900">{resolvedAccountHolder}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Account Number:</span> <span className="font-mono font-bold text-zinc-900">{resolvedAccountNumber}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">IFSC Code:</span> <span className="font-mono font-bold text-teal-700">{resolvedIfscCode}</span></div>
                  {resolvedBankBranch && (
                    <div className="flex justify-between"><span className="text-zinc-500">Branch:</span> <span className="font-semibold text-zinc-800">{resolvedBankBranch}</span></div>
                  )}
                  {resolvedUpiId && (
                    <div className="flex justify-between"><span className="text-zinc-500">UPI VPA:</span> <span className="font-mono font-bold text-emerald-700">{resolvedUpiId}</span></div>
                  )}
                </div>

                {resolvedPaymentQrUrl && (
                  <div className="text-center shrink-0">
                    <img 
                      src={resolvedPaymentQrUrl} 
                      alt="UPI QR" 
                      className="w-20 h-20 border border-zinc-200 rounded-lg p-1 bg-white mx-auto shadow-2xs" 
                    />
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-tight block mt-1">Scan to Remit</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Tax Breakdown Calculations */}
          <div className="sm:col-span-5 space-y-2 text-xs">
            <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50 space-y-2">
              <div className="flex justify-between text-zinc-600">
                <span>{isNonGst ? "Commercial Scope Subtotal:" : "Taxable Value (Subtotal):"}</span>
                <span className="font-mono font-semibold text-zinc-900">₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              {!isNonGst && (
                <>
                  <div className="flex justify-between text-zinc-600">
                    <span>Central GST (CGST {gstRate / 2}%):</span>
                    <span className="font-mono font-semibold text-zinc-900">₹{cgst.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-zinc-600">
                    <span>State GST (SGST {gstRate / 2}%):</span>
                    <span className="font-mono font-semibold text-zinc-900">₹{sgst.toLocaleString("en-IN")}</span>
                  </div>
                </>
              )}
              <div className="border-t-2 border-teal-700 pt-2 flex justify-between items-center text-sm font-black text-zinc-950">
                <span className="uppercase text-xs tracking-wide">Total Estimated Value:</span>
                <span className="text-base text-teal-800 font-mono font-black">₹{grandTotal.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 leading-snug">
              <span className="font-bold block mb-0.5">Commercial Billing Notice:</span>
              <span>{isNonGst ? "Non-GST Commercial Estimate (0% Tax). 50% mobilization advance upon sign-off." : "50% mobilization advance upon quote sign-off. Balance 50% upon milestone deliverables completion and UAT signoff."}</span>
            </div>
          </div>
        </div>
    </>
  );
}
