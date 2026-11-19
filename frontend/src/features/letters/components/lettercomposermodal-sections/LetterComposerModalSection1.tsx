"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  X, Check, Users, Mail, ArrowRight, ArrowLeft, Send, Sparkles, 
  Building2, Calendar, FileText, CheckSquare, Search, AlertCircle, Shield
} from "lucide-react"
import { useAuthStore, getCompanyFullName, getCompanyLogoUrl } from "@/store/useAuthStore"
import { getUsers } from "@/features/users/services/userService"
import { getClients } from "@/features/clients/services/clientService"
import { createAndSendLetter } from "@/features/letters/services/letterService"
import { LetterRecord, LetterType, LetterRecipient, LetterCustomFields } from "@/features/letters/types"
import { type LetterComposerModalProps, TEMPLATES } from "@/features/letters/components/lettercomposermodal-sections/LetterComposerModalHelpers"

export function LetterComposerModalSection1({ ctrl }: { ctrl: any }) {
  const { step, setTemplateType, templateType, fields, setFields, title, setTitle, subject, setSubject, body, setBody, signatoryName, setSignatoryName, signatoryDesignation, setSignatoryDesignation } = ctrl;
  return (
    <>
      {/* ──────── STEP 1: FORMAT & CONTENT ──────── */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-2">Choose Letter Template *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {TEMPLATES.map(t => (
                    <button
                      key={t.type}
                      type="button"
                      onClick={() => setTemplateType(t.type)}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${templateType === t.type ? "border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 ring-1 ring-blue-600 shadow-xs" : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{t.icon}</span>
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">{t.label}</span>
                      </div>
                      <p className="text-[11px] text-zinc-500 line-clamp-2">{t.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Variables depending on Template */}
              {templateType === "office_close" && (
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Occasion / Holiday *</label>
                    <input 
                      type="text" 
                      value={fields.occasion} 
                      onChange={e => setFields({ ...fields, occasion: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Closed From *</label>
                    <input 
                      type="date" 
                      value={fields.closedFromDate} 
                      onChange={e => setFields({ ...fields, closedFromDate: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Closed To *</label>
                    <input 
                      type="date" 
                      value={fields.closedToDate} 
                      onChange={e => setFields({ ...fields, closedToDate: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Resumption Date *</label>
                    <input 
                      type="date" 
                      value={fields.resumptionDate} 
                      onChange={e => setFields({ ...fields, resumptionDate: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Emergency Contact Phone</label>
                    <input 
                      type="text" 
                      value={fields.emergencyContact} 
                      onChange={e => setFields({ ...fields, emergencyContact: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-5">
                    <input 
                      type="checkbox" 
                      id="wfhAllowed"
                      checked={fields.isWorkFromHomeAllowed} 
                      onChange={e => setFields({ ...fields, isWorkFromHomeAllowed: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                    />
                    <label htmlFor="wfhAllowed" className="font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer">Allow Remote / On-Call Support</label>
                  </div>
                </div>
              )}

              {templateType === "offer_letter" && (
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Candidate Full Name *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Ramesh Babu"
                      value={fields.candidateName} 
                      onChange={e => setFields({ ...fields, candidateName: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Job Designation *</label>
                    <input 
                      type="text" 
                      value={fields.jobTitle} 
                      onChange={e => setFields({ ...fields, jobTitle: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Annual CTC *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 6,50,000 INR"
                      value={fields.ctcAmount} 
                      onChange={e => setFields({ ...fields, ctcAmount: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Joining Date *</label>
                    <input 
                      type="date" 
                      value={fields.joiningDate} 
                      onChange={e => setFields({ ...fields, joiningDate: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Probation (Months)</label>
                    <input 
                      type="number" 
                      value={fields.probationMonths} 
                      onChange={e => setFields({ ...fields, probationMonths: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Work Location</label>
                    <input 
                      type="text" 
                      value={fields.workLocation} 
                      onChange={e => setFields({ ...fields, workLocation: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                    />
                  </div>
                </div>
              )}

              {/* Title & Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Letter Heading / Title *</label>
                  <input 
                    type="text" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Email Subject Line *</label>
                  <input 
                    type="text" 
                    value={subject} 
                    onChange={e => setSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Body Text */}
              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Letter Body Content (Formatted) *</label>
                <textarea 
                  rows={9}
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-mono text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Signatory Details */}
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-blue-600" />
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">Authorized Signatory:</span>
                </div>
                <div className="flex items-center gap-3">
                  <input 
                    type="text"
                    placeholder="Signatory Name"
                    value={signatoryName}
                    onChange={e => setSignatoryName(e.target.value)}
                    className="px-3 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-semibold text-xs"
                  />
                  <input 
                    type="text"
                    placeholder="Designation"
                    value={signatoryDesignation}
                    onChange={e => setSignatoryDesignation(e.target.value)}
                    className="px-3 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs"
                  />
                </div>
              </div>
            </div>
          )}
    </>
  );
}
