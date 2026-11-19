"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { 
  Building2, MapPin, Calendar, Mail, Phone, ShieldCheck, 
  Award, FileText, Download, Printer, Send, Sparkles, Check, 
  UserCheck, Briefcase, DollarSign, Clock, Shield, Globe, Plus, Trash2,
  Layers, ChevronRight, User, AlertCircle
} from "lucide-react"
import { UserItem } from "@/features/users/types"
import { Company, Branch, SubBranch } from "@/features/companies/types"
import { printDocument } from "@/lib/printUtils"
import { DEFAULT_ROLE_RESPONSIBILITIES, getPresetResponsibilities, EditableOfferText, type OfferLetterDocumentProps } from "@/features/users/components/offerletterdocument-sections/OfferLetterDocumentHelpers"

export function OfferLetterDocumentSection1({ ctrl }: { ctrl: any }) {
  const { logoUrl, brandName, fullCompanyName, onFieldChange, interactive, isoCert, cin, gstin, pan, companyAddress, companyPhone, companyWebsite, refNumber, issueDateFormatted, user, empId } = ctrl;
  return (
    <>
      {/* TOP CORPORATE HEADER */}
        <div className="border-b-2 border-teal-800 pb-3 flex flex-col sm:flex-row justify-between items-start gap-4">
          {/* Company Brand & Legal Details */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-20 h-20 shrink-0 flex items-center justify-center p-0.5 bg-transparent border-0 shadow-none">
              {logoUrl ? (
                <img src={logoUrl} alt={brandName} className="max-w-full max-h-full object-contain pointer-events-none bg-transparent" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#005f69] to-[#008a99] text-white font-black text-xl flex items-center justify-center rounded-xl">
                  {brandName.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            <div className="space-y-0.5 min-w-0">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-zinc-950 uppercase font-sans leading-tight">
                <EditableOfferText
                  value={fullCompanyName}
                  onChange={(val) => onFieldChange?.("company_name", val)}
                  interactive={interactive}
                />
              </h1>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.2 rounded bg-amber-50 border border-amber-300 text-amber-900 text-[8.5px] font-black uppercase tracking-wider">
                <Award size={10} className="text-amber-600" />
                <EditableOfferText
                  value={isoCert}
                  onChange={(val) => onFieldChange?.("iso_cert", val)}
                  interactive={interactive}
                />
              </div>
              <p className="text-[9px] font-mono text-zinc-500 pt-0.5">
                CIN: <strong>{cin}</strong> | GSTIN: <strong>{gstin}</strong> | PAN: <strong>{pan}</strong>
              </p>
              <p className="text-[8.5px] text-zinc-600 leading-tight">
                <EditableOfferText
                  value={`${companyAddress} • Tel: ${companyPhone} • Web: ${companyWebsite}`}
                  interactive={interactive}
                />
              </p>
            </div>
          </div>

          {/* Reference & Date Card */}
          <div className="text-right shrink-0 bg-teal-50/70 p-2.5 rounded-xl border border-teal-200/80 text-[9px] space-y-0.5">
            <div>
              <span className="text-zinc-500 font-semibold">Ref No:</span>{" "}
              <strong className="font-mono text-teal-950 font-bold">
                <EditableOfferText value={refNumber} interactive={interactive} />
              </strong>
            </div>
            <div>
              <span className="text-zinc-500 font-semibold">Issue Date:</span>{" "}
              <strong className="font-mono text-zinc-900">
                <EditableOfferText value={issueDateFormatted} interactive={interactive} />
              </strong>
            </div>
            <div className="pt-0.5 text-[8px] font-bold text-teal-700 uppercase">
              CONFIDENTIAL / PRIVATE
            </div>
          </div>
        </div>

        {/* CANDIDATE ADDRESS BLOCK & SUBJECT */}
        <div className="space-y-2.5 pt-1">
          <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200 text-[10px] space-y-0.5">
            <span className="text-[8.5px] font-black uppercase tracking-wider text-zinc-500 block">TO:</span>
            <h2 className="text-sm font-black text-zinc-950 uppercase">
              <EditableOfferText
                value={user.name}
                onChange={(val) => onFieldChange?.("name", val)}
                interactive={interactive}
              />
            </h2>
            <p className="text-zinc-600">
              <strong>Employee ID:</strong> <span className="font-mono font-bold text-zinc-800">{empId}</span> | 
              <strong> Email:</strong> {user.email} {user.phone ? `| Tel: ${user.phone}` : ""}
            </p>
            {user.address && (
              <p className="text-zinc-600">
                <strong>Address:</strong>{" "}
                <EditableOfferText
                  value={user.address}
                  onChange={(val) => onFieldChange?.("address", val)}
                  interactive={interactive}
                />
              </p>
            )}
          </div>

          {/* Subject Banner */}
          <div className="bg-gradient-to-r from-[#005f69] to-[#008a99] text-white p-2 rounded-xl text-center shadow-xs">
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider">
              <EditableOfferText
                value="SUBJECT: FORMAL OFFER OF EMPLOYMENT & APPOINTMENT LETTER"
                interactive={interactive}
              />
            </h3>
          </div>
        </div>

        {/* LETTER BODY */}
    </>
  );
}
