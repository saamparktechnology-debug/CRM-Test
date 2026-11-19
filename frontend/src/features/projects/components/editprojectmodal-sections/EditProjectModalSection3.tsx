"use client"

import * as React from "react"
import { 
  X, Check, Bold, Italic, Underline, List, ListOrdered, Table, Link2, Code, Sparkles, 
  Minus, Maximize2, Users, UserCheck, Search, Percent, ExternalLink, Globe, GitBranch, 
  Server, Layers, Megaphone, Video, Image as ImageIcon, Calendar, MapPin, Receipt, 
  RefreshCw, FileText, CheckCircle2, DollarSign, Clock
} from "lucide-react"
import { Project, ProjectMember, ProjectStatus, ProjectType, isMarketingProject } from "@/features/projects/types"
import { updateProject } from "@/features/projects/services/projectService"
import { getInvoices, updateInvoice } from "@/features/invoice/services/invoiceService"
import { getUsers } from "@/features/users/services/userService"
import { UserService } from "@/services/apiServices"
import { ProjectCompletionModal } from "@/features/projects/components/ProjectCompletionModal"
import { type EditProjectModalProps, toDateInputValue } from "@/features/projects/components/editprojectmodal-sections/EditProjectModalHelpers"

export function EditProjectModalSection3({ ctrl }: { ctrl: any }) {
  const { selectedMemberIds, totalAssignedSharePct, numericProjectTotal, teamMembers, memberShares, memberPayoutTypes, memberAmounts, clientPaidRatio, handlePayoutTypeChange, handleAmountChange, handleShareChange, handleToggleMember, clientPaidAmount, clientDueAmount, isSubscriptionProject, memberSearchQuery, setMemberSearchQuery } = ctrl;
  return (
    <>
      <div className="grid grid-cols-4 items-start gap-4">
            <div className="pt-2">
              <label className="text-zinc-700 dark:text-zinc-300 font-bold block">Assign Team</label>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                {selectedMemberIds.length} member{selectedMemberIds.length !== 1 ? 's' : ''} selected
              </span>
            </div>

            <div className="col-span-3 space-y-3 p-3.5 bg-zinc-50/80 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200 dark:border-zinc-700">
              {/* Selected Members with Revenue Share % */}
              {selectedMemberIds.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[10.5px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Configured Project Shares</span>
                    <span className="text-purple-600 dark:text-purple-400 font-extrabold text-[11px]">
                      Total: {totalAssignedSharePct}% (₹{Math.round((numericProjectTotal * totalAssignedSharePct) / 100).toLocaleString("en-IN")})
                    </span>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {selectedMemberIds.map((mId) => {
                      const m = teamMembers.find(
                        (t) => String(t.id).toLowerCase() === mId.toLowerCase()
                      ) || {
                        id: mId,
                        name: "Team Member",
                        role: "Developer",
                        avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${mId}`,
                        email: "",
                      }
                      const shareVal = memberShares[mId] !== undefined ? memberShares[mId] : 15
                      const memberTotalPayout = memberPayoutTypes[mId] === "fixed"
                        ? (memberAmounts[mId] || 0)
                        : Math.round((numericProjectTotal * shareVal) / 100)
                      const memberEarnedPayout = Math.round(clientPaidRatio * memberTotalPayout)
                      const memberPendingPayout = Math.max(0, memberTotalPayout - memberEarnedPayout)

                      return (
                        <div
                          key={mId}
                          className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-purple-200/80 dark:border-purple-800/60 shadow-2xs space-y-2.5"
                        >
                          <div className="flex items-center justify-between gap-2.5">
                            {/* Member Info */}
                            <div className="flex items-center gap-2 min-w-0">
                              <img
                                src={m.avatar}
                                alt={m.name}
                                className="w-7 h-7 rounded-full object-cover border border-purple-200 shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="font-bold text-zinc-900 dark:text-zinc-100 truncate text-xs">
                                  {m.name}
                                </div>
                                <div className="text-[10px] text-zinc-400 truncate">
                                  {m.role}
                                </div>
                              </div>
                            </div>

                            {/* Payout Controls: % Share vs ₹ Manual Amount */}
                            <div className="flex items-center gap-2 shrink-0">
                              {/* Mode Toggle Pills: % vs ₹ */}
                              <div className="inline-flex rounded-lg p-0.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                                <button
                                  type="button"
                                  onClick={() => handlePayoutTypeChange(mId, "percentage")}
                                  className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                                    (memberPayoutTypes[mId] || "percentage") === "percentage"
                                      ? "bg-purple-600 text-white shadow-xs"
                                      : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                                  }`}
                                  title="Set percentage of project"
                                >
                                  %
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handlePayoutTypeChange(mId, "fixed")}
                                  className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                                    memberPayoutTypes[mId] === "fixed"
                                      ? "bg-purple-600 text-white shadow-xs"
                                      : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                                  }`}
                                  title="Type manual fixed amount in ₹"
                                >
                                  ₹
                                </button>
                              </div>

                              {/* Value Input */}
                              {memberPayoutTypes[mId] === "fixed" ? (
                                <div className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-800 px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
                                  <span className="text-zinc-400 font-bold text-[11px]">₹</span>
                                  <input
                                    type="number"
                                    min="0"
                                    placeholder="5000"
                                    value={memberAmounts[mId] !== undefined ? memberAmounts[mId] : ""}
                                    onChange={(e) => handleAmountChange(mId, Number(e.target.value))}
                                    className="w-16 bg-transparent text-purple-600 dark:text-purple-400 font-bold text-left focus:outline-none text-xs"
                                  />
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-800 px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={shareVal}
                                    onChange={(e) => handleShareChange(mId, Number(e.target.value))}
                                    className="w-10 bg-transparent text-purple-600 dark:text-purple-400 font-black text-center focus:outline-none text-xs"
                                  />
                                  <span className="text-zinc-400 font-bold text-[10px]">%</span>
                                </div>
                              )}

                              {/* Payout Preview Badge */}
                              <div className="px-2 py-1 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-200 font-black text-[11px] border border-purple-200 dark:border-purple-800 whitespace-nowrap">
                                {memberPayoutTypes[mId] === "fixed" ? (
                                  <span>≈ {numericProjectTotal > 0 ? ((memberAmounts[mId] || 0) / numericProjectTotal * 100).toFixed(1) : 0}%</span>
                                ) : (
                                  <span>₹{memberTotalPayout.toLocaleString("en-IN")}</span>
                                )}
                              </div>

                              {/* Remove button */}
                              <button
                                type="button"
                                onClick={() => handleToggleMember(m)}
                                className="p-1 rounded-md text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                                title="Remove member"
                              >
                                <X size={13} />
                              </button>
                            </div>
                          </div>

                          {/* Pro-Rata Commission Attribution Breakdown */}
                          <div className="pt-2 border-t border-purple-100 dark:border-purple-900/40 grid grid-cols-3 gap-2 text-[10.5px]">
                            <div className="bg-purple-50/60 dark:bg-purple-950/40 p-2 rounded-lg border border-purple-100 dark:border-purple-900/40">
                              <div className="text-zinc-500 text-[10px]">Total Potential</div>
                              <div className="font-bold font-mono text-purple-700 dark:text-purple-300">
                                ₹{memberTotalPayout.toLocaleString("en-IN")}
                              </div>
                            </div>
                            <div className="bg-emerald-50/70 dark:bg-emerald-950/40 p-2 rounded-lg border border-emerald-200/60 dark:border-emerald-800/40">
                              <div className="text-emerald-700 dark:text-emerald-300 font-semibold text-[10px] flex items-center justify-between">
                                <span>Earned (Pro-Rata)</span>
                                <span className="text-[9px] font-bold">{(clientPaidRatio * 100).toFixed(0)}%</span>
                              </div>
                              <div className="font-black font-mono text-emerald-700 dark:text-emerald-300">
                                ₹{memberEarnedPayout.toLocaleString("en-IN")}
                              </div>
                              <div className="text-[9px] text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">
                                {clientPaidAmount > 0 ? `Against ₹${clientPaidAmount.toLocaleString("en-IN")} paid` : "Pending client payment"}
                              </div>
                            </div>
                            <div className="bg-amber-50/70 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200/60 dark:border-amber-800/40">
                              <div className="text-amber-700 dark:text-amber-300 font-semibold text-[10px]">Pending Due</div>
                              <div className="font-bold font-mono text-amber-700 dark:text-amber-300">
                                ₹{memberPendingPayout.toLocaleString("en-IN")}
                              </div>
                              <div className="text-[9px] text-amber-600 dark:text-amber-400 mt-0.5 truncate">
                                {clientDueAmount > 0 ? `On client balance ₹${clientDueAmount.toLocaleString("en-IN")}` : "Fully settled"}
                              </div>
                            </div>
                          </div>

                          {isSubscriptionProject && (
                            <div className="px-2 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-[10.5px] text-indigo-700 dark:text-indigo-300 font-semibold flex items-center justify-between">
                              <span>🔄 Retainer Recurring Payout:</span>
                              <span className="font-mono font-bold">
                                ₹{memberTotalPayout.toLocaleString("en-IN")} / monthly cycle paid
                              </span>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Member Search Bar */}
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search team members by name, role, email..."
                  value={memberSearchQuery}
                  onChange={(e) => setMemberSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Team Members Checkbox List */}
              <div className="max-h-36 overflow-y-auto space-y-1 divide-y divide-zinc-100 dark:divide-zinc-800/60 bg-white dark:bg-zinc-900/60 rounded-xl p-1.5 border border-zinc-200/80 dark:border-zinc-700/60">
                {teamMembers.length === 0 ? (
                  <div className="py-4 text-center text-[11px] text-zinc-400">
                    Loading team members...
                  </div>
                ) : (
                  teamMembers
                    .filter((m) => {
                      if (!memberSearchQuery.trim()) return true
                      const q = memberSearchQuery.toLowerCase().trim()
                      return (
                        m.name.toLowerCase().includes(q) ||
                        m.role.toLowerCase().includes(q) ||
                        m.email.toLowerCase().includes(q)
                      )
                    })
                    .map((m) => {
                      const isSelected = selectedMemberIds.includes(String(m.id))
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => handleToggleMember(m)}
                          className={`w-full flex items-center justify-between p-1.5 rounded-lg text-left transition-colors cursor-pointer text-xs ${
                            isSelected
                              ? "bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 font-semibold"
                              : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={m.avatar}
                              alt={m.name}
                              className="w-6 h-6 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="font-medium leading-none truncate">{m.name}</div>
                              <div className="text-[10px] text-zinc-400 mt-0.5 truncate">
                                {m.role} {m.email ? `• ${m.email}` : ''}
                              </div>
                            </div>
                          </div>

                          <div
                            className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] shrink-0 ml-2 ${
                              isSelected
                                ? "bg-purple-600 border-purple-600 text-white"
                                : "border-zinc-300 dark:border-zinc-600"
                            }`}
                          >
                            {isSelected && "✓"}
                          </div>
                        </button>
                      )
                    })
                )}
              </div>
            </div>
          </div>
    </>
  );
}
