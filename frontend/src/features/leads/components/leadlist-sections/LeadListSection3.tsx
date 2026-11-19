"use client";

import * as React from "react";
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
} from "lucide-react";
import { Lead } from "@/features/leads/types";
import { LeadFiltersDropdown } from "@/features/leads/components/LeadFiltersDropdown";
import {
  formatLeadReminderDate,
  transferLeadsToBranch,
  parseLeadDate,
  isReminderDateOverdue,
  canUserUnlockLead,
  isLeadClientPrivate,
  isLeadAssignedToUser,
  isTeamMemberRole,
} from "@/features/leads/services/leadService";
import { LabelItem } from "@/features/leads/components/ManageLabelsModal";
import { LabelSelectorPopover } from "@/features/leads/components/LabelSelectorPopover";
import { WhatsAppTemplateModal } from "@/features/leads/components/WhatsAppTemplateModal";
import { CallOutcomeModal } from "@/features/leads/components/CallOutcomeModal";
import { formatDisplayDate } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermissionStore } from "@/store/usePermissionStore";
import { getUsers } from "@/features/users/services/userService";
import { exportToExcel, printPDFReport } from "@/lib/exportUtils";
import { confirmTwoStepBulkDelete } from "@/lib/confirmDialog";
import {
  type LeadListProps,
  WhatsAppIcon,
  statusBadgeStyles,
} from "@/features/leads/components/leadlist-sections/LeadListHelpers";

export function LeadListSection3({ ctrl }: { ctrl: any }) {
  const {
    paginatedLeads,
    canDeleteLead,
    selectedLeadIds,
    handleToggleSelectLead,
    onSelectLeadDetail,
    setCallOutcomeModalLead,
    setWhatsAppModalLead,
    usersMap,
    user,
    availableLabels,
    setActivePopoverLeadId,
    activePopoverLeadId,
    onToggleLeadLabel,
    onOpenManageLabelsModal,
    isSuperAdminOrAdmin,
    activeBranches,
    setSelectedLeadIds,
    setSelectedTargetBranchId,
    setIsTransferModalOpen,
    onLeadUpdated,
    canEditLead,
    onOpenEditModal,
    onDeleteLead,
  } = ctrl;
  return (
    <>
      {paginatedLeads.map((l: any) => {
        const isWonOrLost =
          (l.status || "").toLowerCase().trim() === "won" ||
          (l.status || "").toLowerCase().trim() === "lost";
        const isOverdue = isReminderDateOverdue(l.reminderDate, l.reminderTime);
        const isExplicitlyUnlocked = Boolean(
          (l as any)?.isExplicitlyUnlocked === true ||
          l.lockedReason?.includes("Unlocked") ||
          (l as any)?.unlockedByAdmin === true ||
          (l as any)?.unlockedByClient === true,
        );
        const isLocked = Boolean(
          !isWonOrLost && !isExplicitlyUnlocked && (l.isLocked || isOverdue),
        );

        return (
          <tr
            key={l.id}
            className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50 transition-colors"
          >
            {canDeleteLead && (
              <td
                className="py-3.5 px-3 text-center"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="checkbox"
                  checked={selectedLeadIds.includes(l.id)}
                  onChange={() => handleToggleSelectLead(l.id)}
                  className="w-3.5 h-3.5 rounded border-zinc-300 text-blue-600 cursor-pointer"
                />
              </td>
            )}
            {/* Name (Business with Building Icon) */}
            <td className="py-3.5 px-4 font-medium text-zinc-900 dark:text-zinc-100">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900 flex items-center justify-center shrink-0">
                      <Building2 size={13} />
                    </div>
                    <span
                      className={`font-semibold ${
                        isLocked
                          ? "text-rose-600 dark:text-rose-400 line-through"
                          : "text-zinc-900 dark:text-zinc-100"
                      }`}
                    >
                      {l.name}
                    </span>
                  </div>

                  {/* Glass-effect Creator Info Circle Icon with Tooltip */}
                  {(l.createdByName ||
                    l.createdBy ||
                    l.branchName ||
                    l.branchId ||
                    (l as any).transferredBy) && (
                    <div className="relative group/leadcreator inline-flex items-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectLeadDetail(l);
                        }}
                        className="w-5 h-5 rounded-full backdrop-blur-md bg-white/80 dark:bg-zinc-800/80 hover:bg-indigo-50/90 dark:hover:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-500/30 flex items-center justify-center cursor-pointer transition-all duration-200 shadow-xs hover:shadow-md hover:shadow-indigo-500/20 hover:scale-110 active:scale-95"
                        title="Added By & Branch Details"
                      >
                        <Info size={11} className="stroke-[2.2]" />
                      </button>

                      {/* Glass Tooltip Card */}
                      <div className="absolute left-0 top-full mt-2 hidden group-hover/leadcreator:block z-50 w-56 p-3 bg-zinc-900/95 dark:bg-zinc-900/95 text-white rounded-2xl shadow-2xl border border-white/10 text-[11px] pointer-events-none space-y-1.5 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                        <div className="text-[9.5px] font-bold uppercase tracking-wider text-indigo-400 border-b border-white/10 pb-1 flex items-center justify-between">
                          <span>Lead Details</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                        </div>
                        {(l.createdByName || l.createdBy) && (
                          <div className="flex items-center gap-1.5 text-zinc-100 font-semibold">
                            <UserIcon
                              size={12}
                              className="text-indigo-400 shrink-0"
                            />
                            <span>
                              Added by:{" "}
                              <strong className="text-indigo-300 font-bold">
                                {l.createdByName || l.createdBy}
                              </strong>
                              {l.createdByRole &&
                              !String(l.createdByName || l.createdBy).includes(
                                l.createdByRole,
                              )
                                ? ` (${l.createdByRole})`
                                : ""}
                            </span>
                          </div>
                        )}
                        {(l.branchName || l.branchId) && (
                          <div className="flex items-center gap-1.5 text-zinc-300">
                            <MapPin
                              size={12}
                              className="text-amber-400 shrink-0"
                            />
                            <span>
                              Branch:{" "}
                              <strong className="text-white font-medium">
                                {l.branchName || `Branch (${l.branchId})`}
                              </strong>
                            </span>
                          </div>
                        )}
                        {(l as any).transferredBy && (
                          <div className="flex items-center gap-1.5 text-emerald-300 font-semibold pt-1 border-t border-white/10">
                            <span>🚀 Sent by: {(l as any).transferredBy}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Repeat Client & Future Timeline Badges */}
                {(Boolean(l.isExistingClient || l.clientId) ||
                  Boolean(l.expectedTimeline)) && (
                  <div className="flex items-center gap-1.5 flex-wrap pl-8 mt-0.5">
                    {Boolean(l.isExistingClient || l.clientId) && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9.5px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-2xs">
                        <UserIcon
                          size={10}
                          className="text-emerald-600 dark:text-emerald-400"
                        />
                        <span>Existing Client (Repeat Project)</span>
                      </span>
                    )}
                    {Boolean(l.expectedTimeline) && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9.5px] font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shadow-2xs">
                        <Clock
                          size={10}
                          className="text-purple-600 dark:text-purple-400"
                        />
                        <span>Target: {l.expectedTimeline}</span>
                      </span>
                    )}
                  </div>
                )}

                {/* Related To / Services Answer directly below lead/business name */}
                {(l.relatedTo || l.service) && (
                  <div className="flex items-center gap-1.5 pl-8 mt-0.5 text-[11px] font-medium">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-200/60 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-[10.5px] font-semibold">
                      {l.relatedTo || l.service}
                    </span>
                  </div>
                )}
              </div>
            </td>

            {/* Primary contact & Secondary manager */}
            <td
              className={`py-3.5 px-4 ${isLocked ? "blur-[1px] opacity-60" : ""}`}
            >
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-500 flex items-center justify-center text-[10px] shrink-0">
                    <UserIcon size={12} />
                  </div>
                  <span className="text-blue-600 dark:text-blue-400 font-medium">
                    {l.primaryContact}
                  </span>
                </div>
                {l.secondaryContact && (
                  <span className="text-[10px] text-purple-600 dark:text-purple-400 pl-8 font-normal">
                    Mgr: {l.secondaryContact}
                  </span>
                )}
              </div>
            </td>

            {/* Phone & Secondary Phone with Instant Call & WhatsApp */}
            <td
              className={`py-3.5 px-4 font-mono text-[11px] whitespace-pre-line leading-relaxed ${isLocked ? "blur-[1px] opacity-60" : ""}`}
            >
              <div className="flex flex-col gap-1.5">
                {/* Primary Phone */}
                <div className="flex items-center gap-1.5">
                  <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                    {l.phone}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`tel:${l.phone.replace(/[^0-9+]/g, "")}`);
                      setCallOutcomeModalLead(l);
                    }}
                    className="w-6 h-6 min-w-[24px] min-h-[24px] rounded-md bg-blue-100/80 hover:bg-blue-200 dark:bg-blue-950 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-2xs"
                    title={`Call Primary & Log Outcome: ${l.primaryContact} (${l.phone})`}
                  >
                    <Phone size={12} className="pointer-events-none" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setWhatsAppModalLead(l);
                    }}
                    className="w-6 h-6 min-w-[24px] min-h-[24px] rounded-md bg-emerald-100/80 hover:bg-emerald-200 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-2xs"
                    title={`1-Click WhatsApp: ${l.primaryContact} (${l.phone})`}
                  >
                    <WhatsAppIcon size={13} className="pointer-events-none" />
                  </button>
                </div>

                {/* Secondary Phone */}
                {l.secondaryPhone && (
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span className="text-purple-600 dark:text-purple-400 font-medium">
                      Mgr: {l.secondaryPhone}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(
                          `tel:${l.secondaryPhone!.replace(/[^0-9+]/g, "")}`,
                        );
                        setCallOutcomeModalLead(l);
                      }}
                      className="w-5 h-5 rounded bg-purple-100 hover:bg-purple-200 dark:bg-purple-950 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-300 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
                      title={`Call Manager & Log Outcome: ${l.secondaryContact || "Manager"} (${l.secondaryPhone})`}
                    >
                      <Phone size={10} className="pointer-events-none" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setWhatsAppModalLead(l);
                      }}
                      className="w-5 h-5 rounded bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
                      title={`1-Click WhatsApp Manager: ${l.secondaryContact || "Manager"} (${l.secondaryPhone})`}
                    >
                      <WhatsAppIcon size={11} className="pointer-events-none" />
                    </button>
                  </div>
                )}
              </div>
            </td>

            {/* Service */}
            <td
              className={`py-3.5 px-4 ${isLocked ? "blur-[1px] opacity-60" : ""}`}
            >
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                {l.service || "-"}
              </span>
            </td>

            {/* Source */}
            <td
              className={`py-3.5 px-4 ${isLocked ? "blur-[1px] opacity-60" : ""}`}
            >
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                {l.source || "Social Media"}
              </span>
            </td>

            {/* City */}
            <td
              className={`py-3.5 px-4 ${isLocked ? "blur-[1px] opacity-60" : ""}`}
            >
              <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 font-medium">
                <MapPin size={12} className="text-rose-500 shrink-0" />
                <span>
                  {l.city?.trim() ||
                    l.address?.trim() ||
                    l.state?.trim() ||
                    "-"}
                </span>
              </div>
            </td>

            {/* Assigned to (with profile pic and department) */}
            <td
              className={`py-3.5 px-4 ${isLocked ? "blur-[1px] opacity-60" : ""}`}
            >
              {(() => {
                const rawAssigned =
                  l.assignedTo &&
                  l.assignedTo !== "None" &&
                  l.assignedTo !== "Unassigned"
                    ? l.assignedTo
                    : l.caller &&
                        l.caller !== "None" &&
                        l.caller !== "Unassigned"
                      ? l.caller
                      : l.owner &&
                          l.owner !== "None" &&
                          l.owner !== "Unassigned"
                        ? l.owner
                        : "Unassigned";
                const isUnassigned =
                  !rawAssigned ||
                  rawAssigned === "Unassigned" ||
                  rawAssigned === "None";
                const assignedPerson = isUnassigned
                  ? "Unassigned"
                  : rawAssigned;

                const userMeta = !isUnassigned
                  ? usersMap[assignedPerson.toLowerCase().trim()] ||
                    (user &&
                    (assignedPerson === user.name ||
                      assignedPerson === user.email)
                      ? { role: user.role, avatarUrl: user.avatar }
                      : null)
                  : null;

                const deptOrRole =
                  userMeta?.department ||
                  userMeta?.role ||
                  (assignedPerson.toLowerCase().includes("admin")
                    ? "Administration"
                    : "Telecaller / Sales");

                const realOwnerImg =
                  l.ownerAvatar && !l.ownerAvatar.includes("dicebear")
                    ? l.ownerAvatar
                    : null;
                const realUserImg =
                  userMeta?.avatarUrl ||
                  (userMeta as any)?.avatar ||
                  (user &&
                  (assignedPerson.toLowerCase().trim() ===
                    user.name.toLowerCase().trim() ||
                    assignedPerson.toLowerCase().trim() ===
                      user.email.toLowerCase().trim())
                    ? (user as any).avatarUrl || user.avatar
                    : null);

                const avatarSrc = !isUnassigned
                  ? realOwnerImg ||
                    realUserImg ||
                    `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(assignedPerson)}`
                  : null;

                return (
                  <div className="flex items-center gap-2">
                    {avatarSrc ? (
                      <img
                        src={avatarSrc}
                        alt={assignedPerson}
                        className="w-6 h-6 rounded-full border border-zinc-200 dark:border-zinc-700 object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 border border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-[10px] shrink-0">
                        <UserIcon size={12} />
                      </div>
                    )}
                    <div className="flex flex-col min-w-0">
                      <span
                        className={`font-semibold text-xs ${isUnassigned ? "text-zinc-400 dark:text-zinc-500 italic" : "text-zinc-800 dark:text-zinc-200"}`}
                      >
                        {assignedPerson}
                      </span>
                      {!isUnassigned && (
                        <span className="text-[10px] text-zinc-400 font-medium truncate">
                          {deptOrRole}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}
            </td>

            {/* Labels */}
            <td
              className={`py-3.5 px-4 relative ${isLocked ? "blur-[1px] opacity-60" : ""}`}
            >
              <div className="flex items-center gap-1.5 flex-wrap">
                {(l.labels || []).map((lbl: any) => {
                  const found = availableLabels.find(
                    (a: any) => a.name.toLowerCase() === lbl.toLowerCase(),
                  );
                  const colorHex = found ? found.color : "#64748b";

                  return (
                    <button
                      key={lbl}
                      type="button"
                      onClick={() =>
                        !isLocked &&
                        setActivePopoverLeadId(
                          activePopoverLeadId === l.id ? null : l.id,
                        )
                      }
                      className="px-3 py-1 rounded-md text-[11px] font-semibold text-white shadow-2xs hover:scale-105 transition-transform"
                      style={{ backgroundColor: colorHex }}
                    >
                      {lbl}
                    </button>
                  );
                })}

                {(!l.labels || l.labels.length === 0) && (
                  <button
                    type="button"
                    onClick={() =>
                      !isLocked &&
                      setActivePopoverLeadId(
                        activePopoverLeadId === l.id ? null : l.id,
                      )
                    }
                    className="px-2 py-0.5 rounded border border-dashed border-zinc-300 text-[11px] text-zinc-400 hover:text-zinc-700"
                  >
                    + Label
                  </button>
                )}
              </div>

              <LabelSelectorPopover
                isOpen={activePopoverLeadId === l.id && !isLocked}
                onClose={() => setActivePopoverLeadId(null)}
                availableLabels={availableLabels}
                currentLabels={l.labels || []}
                onToggleLabel={(labelName) =>
                  onToggleLeadLabel(l.id, labelName)
                }
                onOpenManageModal={onOpenManageLabelsModal}
              />
            </td>

            {/* Created at */}
            <td
              className={`py-3.5 px-4 text-zinc-500 font-mono text-[11px] ${isLocked ? "blur-[1px] opacity-60" : ""}`}
            >
              {formatDisplayDate(l.createdAt)}
            </td>

            {/* Reminder Date */}
            <td
              className={`py-3.5 px-4 font-mono text-[11px] ${isLocked ? "blur-[1px] opacity-60" : ""}`}
            >
              {l.reminderDate && l.reminderDate !== "None" ? (
                <div className="flex flex-col gap-0.5">
                  <span
                    className={`font-semibold inline-flex items-center gap-1.5 ${
                      isOverdue
                        ? "text-rose-600 dark:text-rose-400 font-bold"
                        : "text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    <span>📅</span>
                    <span>{formatLeadReminderDate(l.reminderDate)}</span>
                    {isOverdue && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-extrabold uppercase">
                        Expired
                      </span>
                    )}
                  </span>
                  {l.reminderTime && l.reminderTime !== "None" && (
                    <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                      <span>⏰</span>
                      <span>{l.reminderTime}</span>
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-zinc-400 italic text-[11px]">
                  No Reminder
                </span>
              )}
            </td>

            {/* Status */}
            <td className="py-3.5 px-4">
              {isLocked ? (
                <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-rose-600 text-white shadow-2xs animate-pulse">
                  🔒 LOCKED
                </span>
              ) : (
                <span
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold ${
                    statusBadgeStyles[l.status] || "bg-zinc-100 text-zinc-700"
                  }`}
                >
                  {l.status}
                </span>
              )}
            </td>

            {/* Actions */}
            <td className="py-3.5 px-4 text-right">
              <div className="flex items-center justify-end gap-1.5">
                {/* Send to Branch Single Action */}
                {isSuperAdminOrAdmin && activeBranches.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLeadIds([l.id]);
                      setSelectedTargetBranchId(activeBranches[0].id);
                      setIsTransferModalOpen(true);
                    }}
                    className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors cursor-pointer"
                    title="Send / Assign to Branch"
                  >
                    <MapPin size={13} />
                  </button>
                )}

                {/* Lock / Unlock Toggle Button */}
                {canUserUnlockLead(user, l) && (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        if (isLocked) {
                          const { unlockLead } =
                            await import("@/features/leads/services/leadService");
                          const unlocked = await unlockLead(
                            l.id,
                            user,
                            l.companyId,
                          );
                          onLeadUpdated(unlocked);
                        } else {
                          const { lockLead } =
                            await import("@/features/leads/services/leadService");
                          const locked = await lockLead(
                            l.id,
                            undefined,
                            user,
                            l.companyId,
                          );
                          onLeadUpdated(locked);
                        }
                      } catch (err: any) {
                        console.error("Lock/unlock toggle failed:", err);
                        alert(
                          err?.message || "Failed to update lead lock status.",
                        );
                      }
                    }}
                    className={`group/lock px-2 py-0.5 rounded text-[11px] font-semibold transition-all duration-200 shadow-2xs flex items-center gap-1 cursor-pointer ${
                      isLocked
                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                        : "bg-zinc-100 text-zinc-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700"
                    }`}
                    title={
                      isLocked
                        ? "Lead is Locked. Click to Unlock"
                        : "Lead is Unlocked. Click to Lock"
                    }
                  >
                    {isLocked ? (
                      <>
                        <Unlock
                          size={12}
                          className="text-emerald-600 dark:text-emerald-400 group-hover/lock:scale-110 group-hover/lock:rotate-[-18deg] transition-transform duration-300"
                        />
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                          Unlock
                        </span>
                      </>
                    ) : (
                      <>
                        <Lock
                          size={12}
                          className="text-zinc-500 group-hover/lock:text-rose-600 group-hover/lock:scale-110 transition-transform duration-300"
                        />
                        <span>Lock</span>
                      </>
                    )}
                  </button>
                )}

                {!isLocked && (
                  <>
                    {canEditLead && (
                      <button
                        type="button"
                        onClick={() => onOpenEditModal(l)}
                        className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors cursor-pointer"
                        title="Edit lead"
                      >
                        <Pencil size={14} />
                      </button>
                    )}

                    {canDeleteLead && (
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            confirm(
                              `Are you sure you want to delete lead "${l.name}"?`,
                            )
                          ) {
                            onDeleteLead(l.id);
                          }
                        }}
                        className="p-1 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded transition-colors cursor-pointer"
                        title="Delete lead"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </>
                )}
              </div>
            </td>
          </tr>
        );
      })}
    </>
  );
}
