"use client"

import * as React from "react"
import {
  Tag,
  Upload,
  Plus,
  Filter,
  Settings,
  Search,
  ArrowDown,
  Layout,
  Pencil,
  Trash2,
  X,
  Phone,
  MessageSquare,
  User as UserIcon,
  MapPin,
  Lock,
  Unlock,
  Building2,
  RotateCw,
  Send,
  CheckSquare,
  Check,
  Clock,
  Layers,
  Info,
} from "lucide-react"
import { Lead } from "@/features/leads/types"
import { LeadFiltersDropdown } from "@/features/leads/components/LeadFiltersDropdown"
import { formatLeadReminderDate, transferLeadsToBranch, parseLeadDate, isReminderDateOverdue, canUserUnlockLead, isLeadClientPrivate, isLeadAssignedToUser, isTeamMemberRole } from "@/features/leads/services/leadService"
import { LabelItem } from "@/features/leads/components/ManageLabelsModal"
import { LabelSelectorPopover } from "@/features/leads/components/LabelSelectorPopover"
import { WhatsAppTemplateModal } from "@/features/leads/components/WhatsAppTemplateModal"
import { CallOutcomeModal } from "@/features/leads/components/CallOutcomeModal"
import { formatDisplayDate } from "@/lib/utils"
import { useAuthStore } from "@/store/useAuthStore"
import { usePermissionStore } from "@/store/usePermissionStore"
import { getUsers } from "@/features/users/services/userService"
import { exportToExcel, printPDFReport } from "@/lib/exportUtils"
import { confirmTwoStepBulkDelete } from "@/lib/confirmDialog"
import { type LeadListProps, WhatsAppIcon, statusBadgeStyles } from "@/features/leads/components/leadlist-sections/LeadListHelpers"

export function LeadListSection4({ ctrl }: { ctrl: any }) {
  const { isTransferModalOpen, setIsTransferModalOpen, activeBranches, selectedLeadIds, selectedTargetBranchId, setSelectedTargetBranchId, user, isTransferring, handleExecuteTransfer, whatsAppModalLead, setWhatsAppModalLead, callOutcomeModalLead, setCallOutcomeModalLead, onLeadUpdated } = ctrl;
  return (
    <>
      {/* ---------------- BRANCH TRANSFER MODAL ---------------- */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-blue-600" />
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  Assign Leads to Branch
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTransferModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {activeBranches.length === 0 ? (
              <div className="py-6 text-center space-y-2">
                <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  No Branches Available
                </p>
                <p className="text-xs text-zinc-500">
                  There are no branches configured for this active company. Please create a branch in Settings first.
                </p>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <p className="text-zinc-600 dark:text-zinc-400">
                  Select destination branch to transfer{" "}
                  <strong className="text-blue-600 dark:text-blue-400">
                    {selectedLeadIds.length} lead(s)
                  </strong>
                  . Users in that branch will immediately see these assigned leads.
                </p>

                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Destination Branch *
                  </label>
                  <select
                    value={selectedTargetBranchId}
                    onChange={(e) => setSelectedTargetBranchId(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-800 dark:text-zinc-200 font-semibold focus:ring-2 focus:ring-blue-500"
                  >
                    {(activeBranches || []).map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.city || b.code || "Branch"})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 text-[11px] text-blue-700 dark:text-blue-300">
                  <span>ℹ️ Transferred leads will display a <strong>"Sent by {user?.name || 'Admin'}"</strong> badge on that branch.</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setIsTransferModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Cancel
              </button>
              {activeBranches.length > 0 && (
                <button
                  type="button"
                  disabled={isTransferring || !selectedTargetBranchId}
                  onClick={handleExecuteTransfer}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <Check size={14} />
                  <span>{isTransferring ? "Transferring..." : `Confirm Transfer (${selectedLeadIds.length})`}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 1-Click WhatsApp Message Generator Modal */}
      <WhatsAppTemplateModal
        isOpen={Boolean(whatsAppModalLead)}
        onClose={() => setWhatsAppModalLead(null)}
        lead={whatsAppModalLead}
      />

      {/* Telecalling Log Outcome Modal */}
      <CallOutcomeModal
        isOpen={Boolean(callOutcomeModalLead)}
        onClose={() => setCallOutcomeModalLead(null)}
        lead={callOutcomeModalLead}
        onLeadUpdated={(updated) => {
          onLeadUpdated(updated)
        }}
      />
    </>
  );
}
