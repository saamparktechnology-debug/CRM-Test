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

export function createOfficialInvoiceDocumentHandler4(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { isGstInvoice, theme, interactive, gstRate } = getCtrl();
    const __fn: any = (itemsToRender: any[], startIndex: number, showSubtotal: boolean) => {
    const pageSubtotalQty = itemsToRender.reduce((sum, it) => sum + it.itemQty, 0)
    const pageSubtotalBase = itemsToRender.reduce((sum, it) => sum + (it.itemRate * it.itemQty) + it.itemCharges, 0)
    const pageSubtotalGst = isGstInvoice ? itemsToRender.reduce((sum, it) => sum + it.rowTax, 0) : 0
    const pageSubtotalGross = isGstInvoice ? itemsToRender.reduce((sum, it) => sum + it.rowTotal, 0) : pageSubtotalBase

    return (
      <div className="rounded-xl border border-zinc-200 overflow-hidden shadow-2xs mt-1.5">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className={`${theme.tableHeaderBg} text-[10px] uppercase font-black tracking-wider`}>
              <th className="py-2.5 px-3 w-10 text-center">
                <EditableText value="#" interactive={interactive} className="text-white" />
              </th>
              <th className="py-2.5 px-3">
                <EditableText value="Service / Product Description" interactive={interactive} className="text-white" />
              </th>
              <th className="py-2.5 px-2 w-12 text-center">
                <EditableText value="Qty" interactive={interactive} className="text-white" />
              </th>
              <th className="py-2.5 px-2 w-14 text-center">
                <EditableText value="Unit" interactive={interactive} className="text-white" />
              </th>
              <th className="py-2.5 px-2.5 w-24 text-right">
                <EditableText value="Unit Rate" interactive={interactive} className="text-white" />
              </th>
              <th className="py-2.5 px-2.5 w-28 text-right">
                <EditableText value={isGstInvoice ? "GST Rate / Amt" : "Taxes"} interactive={interactive} className="text-white" />
              </th>
              <th className="py-2.5 px-3 w-28 text-right">
                <EditableText value="Amount (INR)" interactive={interactive} className="text-white" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 text-[11px] text-zinc-800 bg-white">
            {itemsToRender.map((item, idx) => (
              <tr key={item.id || idx} className="hover:bg-zinc-50/80 transition-colors">
                <td className="py-2.5 px-3 text-center font-mono font-bold text-zinc-500">
                  {startIndex + idx + 1}
                </td>
                <td className="py-2.5 px-3 font-semibold text-zinc-900">
                  <EditableText
                    value={item.serviceName}
                    interactive={interactive}
                    className="text-[11.5px] font-bold text-zinc-900 block"
                  />
                  {item.itemCharges > 0 && (
                    <div className="text-[9px] text-zinc-500 font-normal mt-0.5">
                      + Platform Setup: ₹{safeFormatCurrency(item.itemCharges)}
                    </div>
                  )}
                </td>
                <td className="py-2.5 px-2 text-center font-mono">{item.itemQty}</td>
                <td className="py-2.5 px-2 text-center text-zinc-500">{item.unit || "Unit"}</td>
                <td className="py-2.5 px-2.5 text-right font-mono font-semibold">
                  ₹{safeFormatCurrency(item.itemRate)}
                </td>
                <td className="py-2.5 px-2.5 text-right font-mono text-zinc-600">
                  {isGstInvoice ? (
                    <div>
                      <span className="font-bold">{item.gstRate || gstRate}%</span>
                      <span className="text-[8.5px] text-zinc-500 block">
                        (₹{safeFormatCurrency(item.rowTax)})
                      </span>
                    </div>
                  ) : (
                    <span className="font-mono text-zinc-400">₹0.00</span>
                  )}
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-black text-zinc-900 text-[11.5px]">
                  ₹{safeFormatCurrency(item.rowTotal)}
                </td>
              </tr>
            ))}
          </tbody>
          {showSubtotal && (
            <tfoot>
              <tr className={`${theme.tableSubtotalBg} font-bold text-[10px] border-t border-zinc-200`}>
                <td colSpan={2} className="py-2.5 px-3 uppercase tracking-wider">
                  <EditableText
                    value="SUBTOTAL SERVICES & BASE AMOUNT"
                    interactive={interactive}
                  />
                </td>
                <td className="py-2.5 px-2 text-center font-mono">{pageSubtotalQty}</td>
                <td className="py-2.5 px-2 text-center">Items</td>
                <td className="py-2.5 px-2.5 text-right font-mono">
                  ₹{safeFormatCurrency(pageSubtotalBase)}
                </td>
                <td className="py-2.5 px-2.5 text-right font-mono">
                  ₹{safeFormatCurrency(pageSubtotalGst)}
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-black text-[11px]">
                  ₹{safeFormatCurrency(pageSubtotalGross)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    )
  };
    return __fn(...__args);
  };
}
