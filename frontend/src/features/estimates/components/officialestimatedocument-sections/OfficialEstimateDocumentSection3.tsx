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

export function OfficialEstimateDocumentSection3({ ctrl }: { ctrl: any }) {
  const { estimate, handlePrint, onConvertToClient, onAccept, isClientRole, onDecline, onConvert, setIsForm9Open, onClose } = ctrl;
  return (
    <>
      {/* ── TOP ACTION BAR (Hidden in Print) ── */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-3.5 py-3 sm:px-6 sm:py-3.5 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 text-white border-b border-zinc-700 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-400/30">
            <Calculator size={18} />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
              <span>Official Commercial Estimate</span>
              <span className="font-mono text-amber-300">#{estimate.estimateNumber}</span>
            </h3>
            <p className="text-[10px] text-zinc-400">Formal corporate estimate with itemized SAC/tax breakdown and banking certification</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-900 bg-white hover:bg-zinc-100 rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Printer size={13} />
            <span>Print / PDF</span>
          </button>

          {onConvertToClient && (
            <button
              type="button"
              onClick={onConvertToClient}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all cursor-pointer"
              title="Save customer as an official CRM Client"
            >
              <Building2 size={13} />
              <span>Move to Client</span>
            </button>
          )}

          {estimate.status !== "Accepted" && onAccept && (
            <button
              type="button"
              onClick={onAccept}
              className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all cursor-pointer"
              title="Accept Estimate"
            >
              <Check size={13} />
              <span>{isClientRole ? "Accept Estimate" : "Mark Accepted"}</span>
            </button>
          )}

          {(estimate.status === "Accepted" || (estimate as any).clientAccepted) && (
            <div className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-800 rounded-lg shadow-2xs">
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span>Accepted</span>
            </div>
          )}

          {estimate.status !== "Declined" && estimate.status !== "Accepted" && onDecline && (
            <button
              type="button"
              onClick={onDecline}
              className="px-3 py-1.5 text-xs font-semibold text-rose-300 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800 rounded-lg transition-colors cursor-pointer"
            >
              Decline
            </button>
          )}

          {estimate.status === "Accepted" && onConvert && (
            <button
              type="button"
              onClick={onConvert}
              className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <ArrowRight size={13} />
              <span>Convert to Project &amp; Invoice</span>
            </button>
          )}

          {estimate.marketingPackage?.enabled && (
            <button
              type="button"
              onClick={() => setIsForm9Open(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-purple-900 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-md transition-all cursor-pointer"
            >
              <Megaphone size={13} />
              <span>Marketing Retainer Scope</span>
            </button>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors ml-auto sm:ml-2 cursor-pointer"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* ── PRINTABLE DOCUMENT BODY (Standard A4 Corporate Format) ── */}
    </>
  );
}
