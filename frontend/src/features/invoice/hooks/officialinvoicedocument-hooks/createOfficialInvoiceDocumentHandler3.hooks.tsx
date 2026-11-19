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

export function createOfficialInvoiceDocumentHandler3(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { theme, interactive, invoice, isValidField, clientDetails, isGstInvoice, isSubBranchIssued, activeSubBranch, isBranchIssued, activeBranch, publicInvoiceViewUrl, invoiceVerificationQrUrl, invoiceNumOrId } = getCtrl();
    const __fn: any = () => (
    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
      {/* Box 1: BILL TO (6 cols) */}
      <div className={`sm:col-span-6 p-3 rounded-lg ${theme.lightBg} border ${theme.lightBorder} space-y-1 shadow-2xs`}>
        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-zinc-700">
          <span className={`w-4 h-4 rounded-full ${theme.primaryBg} text-white flex items-center justify-center shrink-0`}>
            <UserCheck size={9} />
          </span>
          <EditableText
            value="BILL TO"
            interactive={interactive}
            className="font-black text-[10px] uppercase tracking-wider text-zinc-700"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <EditableText
            value={invoice.client || "Client Name"}
            interactive={interactive}
            className="font-black text-xs sm:text-sm text-zinc-900 leading-tight block"
          />
          {invoice.clientAccepted && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wide bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
              ✓ Accepted by Client
            </span>
          )}
        </div>
        {isValidField(invoice.contactPersonName || (invoice as any).primaryContact || (invoice as any).clientContactPerson || clientDetails?.primaryContact) && (
          <p className="text-[10px] text-zinc-900 font-bold flex items-center gap-1 pt-0.5">
            <span className="text-[8.5px] text-zinc-500 font-extrabold uppercase tracking-wider">
              {isValidField(invoice.clientDesignation || clientDetails?.designation) ? `${invoice.clientDesignation || clientDetails?.designation}:` : "Attn:"}
            </span>
            <EditableText
              value={invoice.contactPersonName || (invoice as any).primaryContact || (invoice as any).clientContactPerson || clientDetails?.primaryContact}
              interactive={interactive}
              className="text-zinc-900 font-extrabold text-[10.5px]"
            />
          </p>
        )}
        {(invoice.clientPhone || clientDetails?.phone) && (
          <p className="text-[9.5px] text-zinc-800 font-bold flex items-center gap-1">
            <Phone size={9} className="text-blue-600 shrink-0" />
            <EditableText value="Phone:" interactive={interactive} className="font-bold mr-0.5 text-zinc-600" />
            <EditableText value={invoice.clientPhone || clientDetails?.phone} interactive={interactive} className="font-mono text-zinc-900 font-bold" />
          </p>
        )}
        {(invoice.clientEmail || clientDetails?.email) && (
          <p className="text-[9.5px] text-zinc-500 font-mono flex items-center gap-1">
            <Mail size={9} className="text-zinc-400 shrink-0" />
            <EditableText value={invoice.clientEmail || clientDetails?.email} interactive={interactive} />
          </p>
        )}
        {isValidField(invoice.clientAddress || clientDetails?.address) && (
          <p className="text-[9.5px] text-zinc-600 leading-tight">
            <EditableText value="Address:" interactive={interactive} className="font-bold mr-1" />
            <EditableText
              value={invoice.clientAddress || clientDetails?.address}
              interactive={interactive}
            />
          </p>
        )}
        {isValidField([invoice.clientCity, (invoice as any).clientDistrict || (clientDetails as any)?.district, invoice.clientState].filter(Boolean).join(", ") || [clientDetails?.city, (clientDetails as any)?.district, clientDetails?.state].filter(Boolean).join(", ")) && (
          <p className="text-[9.5px] text-zinc-600 flex items-center gap-1">
            <MapPin size={9} className="text-zinc-500 shrink-0" />
            <EditableText value="Location:" interactive={interactive} className="font-bold mr-1" />
            <EditableText
              value={[invoice.clientCity, (invoice as any).clientDistrict || (clientDetails as any)?.district, invoice.clientState].filter(Boolean).join(", ") || [clientDetails?.city, (clientDetails as any)?.district, clientDetails?.state].filter(Boolean).join(", ")}
              interactive={interactive}
            />
          </p>
        )}
        {isGstInvoice && isValidField(invoice.clientGstin || clientDetails?.gstNumber || clientDetails?.vatNumber) && (
          <p className="text-[9px] font-mono font-bold text-zinc-800">
            <EditableText value="Client GSTIN:" interactive={interactive} className="font-bold mr-1 font-sans" />
            <EditableText value={invoice.clientGstin || clientDetails?.gstNumber || clientDetails?.vatNumber} interactive={interactive} />
          </p>
        )}
        {isValidField((clientDetails as any)?.panNumber || (invoice as any)?.clientPan) && (
          <p className="text-[9px] font-mono font-bold text-zinc-800">
            <EditableText value="Client PAN:" interactive={interactive} className="font-bold mr-1 font-sans" />
            <EditableText value={(invoice as any)?.clientPan || (clientDetails as any)?.panNumber} interactive={interactive} />
          </p>
        )}
      </div>

      {/* Box 2: SERVICE / ENGAGEMENT DETAILS (6 cols) with embedded Official Verification QR beside it */}
      <div className={`sm:col-span-6 p-3 rounded-lg ${theme.lightBg} border ${theme.lightBorder} shadow-2xs flex items-center justify-between gap-3`}>
        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-zinc-700">
            <span className={`w-4 h-4 rounded-full ${theme.primaryBg} text-white flex items-center justify-center shrink-0`}>
              <Briefcase size={9} />
            </span>
            <EditableText
              value="PRIMARY CATEGORY &amp; DOMAIN"
              interactive={interactive}
              className="font-black text-[10px] uppercase tracking-wider text-zinc-700"
            />
          </div>
          <EditableText
            value={invoice.primaryCategory || invoice.category || invoice.project || "Website"}
            interactive={interactive}
            className="font-bold text-xs sm:text-sm text-zinc-900 truncate block"
          />
          <p className="text-[9.5px] text-zinc-600 font-mono">
            <EditableText value="Scheme:" interactive={interactive} className="font-bold font-sans mr-1" />
            <EditableText value={isGstInvoice ? 'GST Tax Invoice' : 'Non-GST Direct Invoice'} interactive={interactive} />
          </p>
          <p className="text-[9.5px] text-zinc-600 truncate">
            <EditableText value="Primary Category:" interactive={interactive} className="font-bold mr-1" />
            <EditableText value={invoice.primaryCategory || invoice.category || "Website"} interactive={interactive} />
          </p>
          {isSubBranchIssued ? (
            <p className="text-[9px] text-emerald-800 dark:text-emerald-300 truncate font-semibold">
              <EditableText value="Unit:" interactive={interactive} className="font-bold mr-1" />
              <EditableText value={`${activeSubBranch?.name} ${activeSubBranch?.code ? `[${activeSubBranch.code}]` : ""}`} interactive={interactive} />
            </p>
          ) : isBranchIssued && activeBranch ? (
            <p className="text-[9px] text-blue-900 dark:text-blue-300 truncate font-semibold">
              <EditableText value="Branch:" interactive={interactive} className="font-bold mr-1" />
              <EditableText value={`${activeBranch.name} ${activeBranch.code ? `[${activeBranch.code}]` : ""}`} interactive={interactive} />
            </p>
          ) : null}
        </div>

        {/* Official Scan & Verify QR Code beside Project Scope (Crisp Square) */}
        <div className="shrink-0 text-center flex flex-col items-center bg-white p-1.5 border border-zinc-300 shadow-2xs rounded-none aspect-square">
          <a 
            href={publicInvoiceViewUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="group block"
            title="Scan or click to view public invoice online"
          >
            <img 
              src={invoiceVerificationQrUrl} 
              alt={`QR ${invoiceNumOrId}`} 
              className="w-14 h-14 aspect-square bg-white object-contain group-hover:scale-105 transition-transform" 
              style={{ imageRendering: 'pixelated' }}
            />
          </a>
          <EditableText
            value="Scan & Verify"
            interactive={interactive}
            className="text-[7px] font-mono font-bold text-zinc-700 mt-0.5 block uppercase tracking-tight"
          />
        </div>
      </div>
    </div>
  );
    return __fn(...__args);
  };
}
