"use client"

import * as React from "react"
import { 
  Printer, Send, X, Building2, MapPin, Phone, Mail, Globe, 
  Shield, Calendar, Calculator, CheckCircle2, Clock, Landmark, 
  Stamp, FileCheck, ArrowRight, QrCode, FileText, UserCheck, Sparkles,
  Check, ChevronRight, Layers, Award, ShieldCheck, BadgeCheck, FileCode, CheckSquare, Megaphone,
  ListChecks, AlertCircle, Edit
} from "lucide-react"
import { useAuthStore, Company, Branch, DEFAULT_COMPANIES, getCompanyLogoUrl } from "@/store/useAuthStore"
import { OfficialFormNo9Document } from "@/components/documents/OfficialFormNo9Document"
import { printDocument } from "@/lib/printUtils"
import { type QuotationLineItem, type QuotationData, type OfficialQuotationDocumentProps, formatQuotationDate, numberToIndianWords } from "@/features/quotations/components/officialquotationdocument-sections/OfficialQuotationDocumentHelpers"

export function OfficialQuotationDocumentSection4({ ctrl }: { ctrl: any }) {
  const { quotation, setIsForm9Open, handlePrint, isClientRole, onAccept, onRequestModify, onDecline, onConvertToClient, onSendEstimate, onSendEmail, onConvertToInvoice, onClose } = ctrl;
  return (
    <>
      {/* ── TOP ACTION BAR (Hidden during printing) ── */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-3.5 py-3 sm:px-6 sm:py-3.5 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 text-white border-b border-zinc-700 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-400/30">
            <FileText size={18} />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
              <span>Commercial Quotation / Scope Tender</span>
              <span className="font-mono text-amber-300">#{quotation.number}</span>
            </h3>
            <p className="text-[10px] text-zinc-400">Technical deliverable breakdown, scope specifications &amp; commercial quotation</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(quotation.marketingPackage || (quotation as any).isMarketingRetainer || quotation.primaryCategory === "Digital Marketing") && (
            <button
              type="button"
              onClick={() => setIsForm9Open(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition-all cursor-pointer"
              title="View Digital Marketing Retainer execution sheet"
            >
              <Megaphone size={13} />
              <span>Marketing Retainer Scope</span>
            </button>
          )}

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-zinc-900 bg-white hover:bg-zinc-100 rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Printer size={13} className="text-teal-700" />
            <span>Print / Save PDF</span>
          </button>

          {/* CLIENT-ONLY ACTIONS: Accept, Request Modification, Decline */}
          {isClientRole && quotation.status !== "Accepted" && quotation.status !== "Declined" && (
            <>
              {onAccept && (
                <button
                  type="button"
                  onClick={onAccept}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all cursor-pointer"
                  title="Accept and approve this commercial quotation"
                >
                  <CheckCircle2 size={13} />
                  <span>Accept Quotation</span>
                </button>
              )}
              {onRequestModify && (
                <button
                  type="button"
                  onClick={onRequestModify}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-all cursor-pointer"
                  title="Request changes or modifications to this quotation"
                >
                  <Edit size={13} />
                  <span>Request Modification</span>
                </button>
              )}
              {onDecline && (
                <button
                  type="button"
                  onClick={onDecline}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-all cursor-pointer"
                  title="Decline this quotation"
                >
                  <X size={13} />
                  <span>Decline</span>
                </button>
              )}
            </>
          )}

          {(quotation.status === "Accepted" || quotation.clientAccepted) && (
            <div className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-800 rounded-lg shadow-2xs">
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span>✓ Digitally Accepted</span>
            </div>
          )}

          {quotation.status === "Declined" && (
            <div className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-rose-300 bg-rose-950/60 border border-rose-800 rounded-lg shadow-2xs">
              <X size={13} className="text-rose-400" />
              <span>Declined by Client</span>
            </div>
          )}

          {/* ADMIN & TEAM ONLY ACTIONS (Never shown to Clients) */}
          {!isClientRole && onConvertToClient && (
            <button
              type="button"
              onClick={onConvertToClient}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all cursor-pointer"
              title="Save this prospect as an official CRM Client"
            >
              <UserCheck size={13} />
              <span>Move to Client</span>
            </button>
          )}

          {!isClientRole && onSendEstimate && (
            <button
              type="button"
              onClick={onSendEstimate}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all cursor-pointer"
              title="Generate a commercial Estimate from this Quotation"
            >
              <Sparkles size={13} />
              <span>Create Estimate</span>
            </button>
          )}

          {!isClientRole && onSendEmail && (
            <button
              type="button"
              onClick={onSendEmail}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-zinc-100 bg-zinc-700 hover:bg-zinc-600 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <Send size={13} />
              <span>Send to Client</span>
            </button>
          )}

          {!isClientRole && onConvertToInvoice && (
            <button
              type="button"
              onClick={onConvertToInvoice}
              className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <ArrowRight size={13} />
              <span>Convert to Invoice</span>
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

      {/* ── PRINTABLE DOCUMENT BODY (Standard A4 Corporate Format with Multi-Page Flow) ── */}
    </>
  );
}
