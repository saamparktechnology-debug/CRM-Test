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

export function OfferLetterDocumentSection2({ ctrl }: { ctrl: any }) {
  const { user, interactive, fullCompanyName, localDesignation, setLocalDesignation, onDesignationChange, localDepartment, setLocalDepartment, onDepartmentChange, localJoiningDate, setLocalJoiningDate, onJoiningDateChange, branchName, subBranchName, branchCity, empId, localCtc, setLocalCtc, onCtcChange, localMonthlySalary, setLocalMonthlySalary, onMonthlySalaryChange, localReportingManager, setLocalReportingManager, onReportingManagerChange, localProbationPeriod, setLocalProbationPeriod, onProbationPeriodChange, localWorkMode, setLocalWorkMode, onWorkModeChange, localWorkingHours, setLocalWorkingHours, onWorkingHoursChange, handleAddResponsibility, localResponsibilities, handleUpdateResponsibility, handleRemoveResponsibility, handleAddTerm, localTerms, handleUpdateTerm, handleRemoveTerm } = ctrl;
  return (
    <>
      <div className="space-y-3 text-[10.5px] sm:text-[11px] text-zinc-800 leading-relaxed">
          <p>
            Dear{" "}
            <strong>
              <EditableOfferText value={user.name} interactive={interactive} />
            </strong>
            ,
          </p>
          <p>
            On behalf of <strong>{fullCompanyName}</strong>, we are delighted to offer you the position of{" "}
            <strong className="text-teal-900 underline font-black">
              <EditableOfferText
                value={localDesignation}
                onChange={(val) => {
                  setLocalDesignation(val)
                  onDesignationChange?.(val)
                }}
                interactive={interactive}
              />
            </strong>{" "}
            in our{" "}
            <strong>
              <EditableOfferText
                value={localDepartment}
                onChange={(val) => {
                  setLocalDepartment(val)
                  onDepartmentChange?.(val)
                }}
                interactive={interactive}
              />
            </strong>{" "}
            department.
          </p>
          <p>
            Your scheduled commencement and formal date of joining is confirmed as{" "}
            <strong className="font-mono bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200 text-teal-950 font-bold">
              <EditableOfferText
                value={localJoiningDate}
                onChange={(val) => {
                  setLocalJoiningDate(val)
                  onJoiningDateChange?.(val)
                }}
                interactive={interactive}
              />
            </strong>
            . You will be operating from our{" "}
            <strong>
              <EditableOfferText
                value={`${branchName}${subBranchName ? ` (${subBranchName} Franchise Unit)` : ""} - ${branchCity}`}
                interactive={interactive}
              />
            </strong>
            .
          </p>

          {/* ═══════════════════════════════════════════════════════════════════
              SECTION 1: APPOINTMENT & OFFER SALARY DETAILS
             ═══════════════════════════════════════════════════════════════════ */}
          <div className="rounded-xl border border-zinc-200 overflow-hidden shadow-2xs my-2">
            <div className="bg-teal-900 text-white px-3 py-1.5 text-[9.5px] font-black uppercase tracking-wider flex items-center justify-between">
              <span>POSITION &amp; OFFER SALARY DETAILS</span>
              <span className="font-mono text-teal-200">{empId}</span>
            </div>
            <table className="w-full text-left text-[10px] border-collapse bg-white">
              <tbody className="divide-y divide-zinc-200">
                <tr className="hover:bg-zinc-50">
                  <td className="py-2 px-3 font-semibold text-zinc-700 w-1/2">Appointed Designation &amp; Role</td>
                  <td className="py-2 px-3 font-bold text-zinc-950 text-right">
                    <EditableOfferText
                      value={localDesignation}
                      onChange={(val) => {
                        setLocalDesignation(val)
                        onDesignationChange?.(val)
                      }}
                      interactive={interactive}
                    />
                  </td>
                </tr>
                <tr className="hover:bg-zinc-50">
                  <td className="py-2 px-3 font-semibold text-zinc-700">Total Annual Cost to Company (CTC)</td>
                  <td className="py-2 px-3 font-bold font-mono text-teal-950 text-right">
                    <EditableOfferText
                      value={localCtc}
                      onChange={(val) => {
                        setLocalCtc(val)
                        onCtcChange?.(val)
                      }}
                      interactive={interactive}
                    />
                  </td>
                </tr>
                <tr className="hover:bg-zinc-50">
                  <td className="py-2 px-3 font-semibold text-zinc-700">Monthly Compensation (Gross)</td>
                  <td className="py-2 px-3 font-medium font-mono text-zinc-900 text-right">
                    <EditableOfferText
                      value={localMonthlySalary}
                      onChange={(val) => {
                        setLocalMonthlySalary(val)
                        onMonthlySalaryChange?.(val)
                      }}
                      interactive={interactive}
                    />
                  </td>
                </tr>
                <tr className="hover:bg-zinc-50">
                  <td className="py-2 px-3 font-semibold text-zinc-700">Reporting Authority &amp; Lead</td>
                  <td className="py-2 px-3 font-medium text-zinc-900 text-right">
                    <EditableOfferText
                      value={localReportingManager}
                      onChange={(val) => {
                        setLocalReportingManager(val)
                        onReportingManagerChange?.(val)
                      }}
                      interactive={interactive}
                    />
                  </td>
                </tr>
                <tr className="hover:bg-zinc-50">
                  <td className="py-2 px-3 font-semibold text-zinc-700">Probationary Period</td>
                  <td className="py-2 px-3 font-medium text-zinc-900 text-right">
                    <EditableOfferText
                      value={localProbationPeriod}
                      onChange={(val) => {
                        setLocalProbationPeriod(val)
                        onProbationPeriodChange?.(val)
                      }}
                      interactive={interactive}
                    />
                  </td>
                </tr>
                <tr className="hover:bg-zinc-50">
                  <td className="py-2 px-3 font-semibold text-zinc-700">Work Mode &amp; Operating Hub</td>
                  <td className="py-2 px-3 font-medium text-zinc-900 text-right">
                    <EditableOfferText
                      value={`${localWorkMode} (${branchName})`}
                      onChange={(val) => {
                        setLocalWorkMode(val)
                        onWorkModeChange?.(val)
                      }}
                      interactive={interactive}
                    />
                  </td>
                </tr>
                <tr className="hover:bg-zinc-50">
                  <td className="py-2 px-3 font-semibold text-zinc-700">Working Hours &amp; Schedule</td>
                  <td className="py-2 px-3 font-medium text-zinc-900 text-right">
                    <EditableOfferText
                      value={localWorkingHours}
                      onChange={(val) => {
                        setLocalWorkingHours(val)
                        onWorkingHoursChange?.(val)
                      }}
                      interactive={interactive}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════
              SECTION 2: KEY ROLES & RESPONSIBILITIES AS PER DESIGNATION
             ═══════════════════════════════════════════════════════════════════ */}
          <div className="space-y-1.5 text-[9.5px] text-zinc-800 bg-teal-50/40 p-3 rounded-xl border border-teal-200/70">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-teal-950 uppercase text-[9.5px] tracking-wider flex items-center gap-1.5">
                <Briefcase size={12} className="text-teal-700" />
                <span>KEY ROLES &amp; RESPONSIBILITIES ({localDesignation.toUpperCase()}):</span>
              </h4>
              {interactive && (
                <button
                  type="button"
                  onClick={handleAddResponsibility}
                  className="print:hidden text-[9px] font-bold text-teal-700 hover:text-teal-900 bg-white px-2 py-0.5 rounded border border-teal-300 flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <Plus size={10} /> Add Duty
                </button>
              )}
            </div>
            <ul className="space-y-1.5 pt-1">
              {localResponsibilities.map((resp, idx) => (
                <li key={idx} className="flex items-start gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-700 shrink-0 mt-1.5" />
                  <div className="flex-1">
                    <EditableOfferText
                      value={resp}
                      onChange={(val) => handleUpdateResponsibility(idx, val)}
                      interactive={interactive}
                      multiline
                    />
                  </div>
                  {interactive && localResponsibilities.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveResponsibility(idx)}
                      className="print:hidden opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-700 p-0.5 rounded transition-opacity"
                      title="Remove item"
                    >
                      <Trash2 size={11} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════
              SECTION 3: CORE TERMS & CONDITIONS
             ═══════════════════════════════════════════════════════════════════ */}
          <div className="space-y-1.5 text-[9.5px] text-zinc-700 bg-zinc-50 p-3 rounded-xl border border-zinc-200">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-zinc-900 uppercase text-[9.5px] tracking-wider flex items-center gap-1.5">
                <ShieldCheck size={12} className="text-zinc-600" />
                <span>KEY TERMS OF ENGAGEMENT &amp; EMPLOYMENT:</span>
              </h4>
              {interactive && (
                <button
                  type="button"
                  onClick={handleAddTerm}
                  className="print:hidden text-[9px] font-bold text-zinc-600 hover:text-zinc-900 bg-white px-2 py-0.5 rounded border border-zinc-300 flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <Plus size={10} /> Add Clause
                </button>
              )}
            </div>
            <ul className="space-y-1.5 pt-1">
              {localTerms.map((clause, idx) => (
                <li key={idx} className="flex items-start gap-2 group leading-snug">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 shrink-0 mt-1.5" />
                  <div className="flex-1">
                    <EditableOfferText
                      value={clause}
                      onChange={(val) => handleUpdateTerm(idx, val)}
                      interactive={interactive}
                      multiline
                    />
                  </div>
                  {interactive && localTerms.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTerm(idx)}
                      className="print:hidden opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-700 p-0.5 rounded transition-opacity"
                      title="Remove clause"
                    >
                      <Trash2 size={11} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <p className="pt-1">
            Please sign and return the duplicate copy of this letter as formal confirmation of your acceptance of this offer.
            We look forward to welcoming you to the Saampark Group family!
          </p>
        </div>
    </>
  );
}
