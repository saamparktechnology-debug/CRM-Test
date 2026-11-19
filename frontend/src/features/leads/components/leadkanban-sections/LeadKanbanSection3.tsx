"use client";

import * as React from "react";
import {
  Tag,
  Upload,
  Plus,
  Filter,
  Search,
  RotateCw,
  User as UserIcon,
  Phone,
  Wrench,
  Clock,
  MessageSquare,
  Heart,
  MapPin,
  Lock,
  Unlock,
  Building2,
  Pencil,
  CheckCircle2,
  X,
  Check,
  Layers,
  Trash2,
  Info,
} from "lucide-react";
import { Lead, LeadStatus } from "@/features/leads/types";
import { LeadFiltersDropdown } from "@/features/leads/components/LeadFiltersDropdown";
import {
  updateLead,
  parseLeadDate,
  formatLeadReminderDate,
  isReminderDateOverdue,
  canUserUnlockLead,
  isLeadClientPrivate,
  isLeadAssignedToUser,
  isTeamMemberRole,
} from "@/features/leads/services/leadService";
import { LabelItem } from "@/features/leads/components/ManageLabelsModal";
import { WhatsAppTemplateModal } from "@/features/leads/components/WhatsAppTemplateModal";
import { CallOutcomeModal } from "@/features/leads/components/CallOutcomeModal";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermissionStore } from "@/store/usePermissionStore";
import { getUsers } from "@/features/users/services/userService";
import {
  type LeadKanbanProps,
  WhatsAppIcon,
  parseReminderTimestamp,
  getCallerAvatar,
  type KanbanColumnConfig,
  KANBAN_COLUMNS,
} from "@/features/leads/components/leadkanban-sections/LeadKanbanHelpers";

export function LeadKanbanSection3({ ctrl }: { ctrl: any }) {
  const {
    filteredLeads,
    handleDragOver,
    draggedLeadId,
    handleDrop,
    handleHeaderMouseDown,
    canEditLead,
    setDraggedLeadId,
    onSelectLeadDetail,
    allUsers,
    user,
    setActiveContactTarget,
    activeContactTarget,
    setCallOutcomeModalLead,
    setWhatsAppModalLead,
    onOpenEditModal,
    canDeleteLead,
    onDeleteLead,
    onLeadUpdated,
  } = ctrl;
  return (
    <>
      {KANBAN_COLUMNS.map((col) => {
        const rawColumnLeads = filteredLeads.filter((l: any) => {
          if (col.id === "Our Office Visit") {
            return (
              l.status === "Our Office Visit" ||
              l.status === "They come to our office"
            );
          }
          return l.status === col.id;
        });

        // Follow-up columns sorted chronologically by reminder date (earliest / tomorrow on top)
        // "New" column remains unorganized as added
        const columnLeads =
          col.id === "New"
            ? rawColumnLeads
            : [...rawColumnLeads].sort((a, b) => {
                const timeA = parseReminderTimestamp(
                  a.reminderDate,
                  a.reminderTime,
                );
                const timeB = parseReminderTimestamp(
                  b.reminderDate,
                  b.reminderTime,
                );
                return timeA - timeB;
              });

        return (
          <div
            key={col.id}
            onDragOver={handleDragOver}
            onDragEnter={(e) => e.preventDefault()}
            onDrop={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              const leadId =
                e.dataTransfer.getData("text/plain") || draggedLeadId;
              if (leadId) {
                await handleDrop(col.id, leadId);
              }
            }}
            className={`w-72 min-w-[288px] max-w-[288px] shrink-0 bg-zinc-50/70 dark:bg-zinc-900/60 border ${col.columnBorder} rounded-xl flex flex-col min-h-[620px] overflow-hidden shadow-2xs`}
          >
            {/* Column Header - Drag here to scroll board horizontally */}
            <div
              onMouseDown={handleHeaderMouseDown}
              className={`p-3 ${col.headerBg} border-t-2 ${col.borderTop} border-b ${col.columnBorder} flex items-center justify-between cursor-grab active:cursor-grabbing select-none transition-colors`}
              title="Press & drag column header left/right to scroll"
            >
              <span
                className={`text-xs font-bold ${col.titleColor} truncate pr-2 pointer-events-none tracking-tight`}
              >
                {col.title}
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${col.badgeBg} ${col.badgeText} shrink-0 pointer-events-none shadow-2xs`}
              >
                {columnLeads.length}
              </span>
            </div>

            {/* Cards Container */}
            <div
              onDragOver={handleDragOver}
              onDragEnter={(e) => e.preventDefault()}
              onDrop={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!canEditLead) return;
                const leadId =
                  e.dataTransfer.getData("text/plain") || draggedLeadId;
                if (leadId) {
                  await handleDrop(col.id, leadId);
                }
              }}
              className="p-2 space-y-2.5 flex-1 overflow-y-auto max-h-[75vh]"
            >
              {columnLeads.map((l: any) => {
                const isWonOrLost =
                  (l.status || "").toLowerCase().trim() === "won" ||
                  (l.status || "").toLowerCase().trim() === "lost";
                const isOverdue = isReminderDateOverdue(
                  l.reminderDate,
                  l.reminderTime,
                );
                const isExplicitlyUnlocked = Boolean(
                  (l as any)?.isExplicitlyUnlocked === true ||
                  l.lockedReason?.includes("Unlocked") ||
                  (l as any)?.unlockedByAdmin === true ||
                  (l as any)?.unlockedByClient === true,
                );
                const isLocked = Boolean(
                  !isWonOrLost &&
                  !isExplicitlyUnlocked &&
                  (l.isLocked || isOverdue),
                );

                return (
                  <div
                    key={l.id}
                    data-lead-card="true"
                    draggable={!isLocked && canEditLead}
                    onDragStart={(e) => {
                      if (isLocked || !canEditLead) {
                        e.preventDefault();
                        return;
                      }
                      e.dataTransfer.setData("text/plain", l.id);
                      e.dataTransfer.effectAllowed = "move";
                      setDraggedLeadId(l.id);
                    }}
                    onDragEnd={() => setDraggedLeadId(null)}
                    onDragOver={handleDragOver}
                    onDrop={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!canEditLead) return;
                      const leadId =
                        e.dataTransfer.getData("text/plain") || draggedLeadId;
                      if (leadId) {
                        await handleDrop(col.id, leadId);
                      }
                    }}
                    className={`border rounded-xl p-3 shadow-2xs transition-all space-y-2 relative group hover:z-20 ${
                      isLocked
                        ? "bg-rose-50/50 dark:bg-rose-950/40 border-rose-400 dark:border-rose-800"
                        : "bg-white dark:bg-zinc-800 border-zinc-200/90 dark:border-zinc-700/80 hover:shadow-md cursor-grab active:cursor-grabbing"
                    }`}
                  >
                    {/* Blurred Card Content when Locked */}
                    <div
                      className={`space-y-2 transition-all ${isLocked ? "blur-[1.5px] opacity-40 select-none pointer-events-none" : ""}`}
                    >
                      {/* Line 1: Business Lead Title, Tiny Creator Info Tooltip & Date */}
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                          <Building2
                            size={13}
                            className="text-blue-500 shrink-0 mt-0.5"
                          />
                          <span
                            onClick={() => onSelectLeadDetail(l)}
                            className={`font-bold text-xs truncate cursor-pointer ${
                              isLocked
                                ? "text-rose-700 dark:text-rose-300 line-through"
                                : "text-blue-600 dark:text-blue-400 hover:underline"
                            }`}
                            title={l.name}
                          >
                            {l.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Glass-effect Creator Info Circle Icon with Tooltip */}
                          {(l.createdByName ||
                            l.createdBy ||
                            l.branchName ||
                            l.transferredBy) && (
                            <div className="relative group/creator">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectLeadDetail(l);
                                }}
                                className="w-5 h-5 rounded-full backdrop-blur-md bg-white/80 dark:bg-zinc-800/80 hover:bg-indigo-50/90 dark:hover:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-500/30 flex items-center justify-center cursor-pointer transition-all duration-200 shadow-xs hover:shadow-md hover:shadow-indigo-500/20 hover:scale-110 active:scale-95"
                                title="Creator & Branch Details"
                              >
                                <Info size={11} className="stroke-[2.2]" />
                              </button>

                              {/* Glass Tooltip Card */}
                              <div className="absolute left-1/2 -translate-x-[75%] top-full mt-1.5 hidden group-hover/creator:block z-50 w-56 sm:w-60 p-3 bg-zinc-900/98 dark:bg-zinc-950/98 text-white rounded-2xl shadow-2xl border border-white/15 text-[11px] pointer-events-none space-y-1.5 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
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
                                      !String(
                                        l.createdByName || l.createdBy,
                                      ).includes(l.createdByRole)
                                        ? ` (${l.createdByRole})`
                                        : ""}
                                    </span>
                                  </div>
                                )}
                                {(l.branchName ||
                                  l.assignedBranchName ||
                                  l.branchId) && (
                                  <div className="flex items-center gap-1.5 text-zinc-300">
                                    <MapPin
                                      size={12}
                                      className="text-amber-400 shrink-0"
                                    />
                                    <span>
                                      Branch:{" "}
                                      <strong className="text-white font-medium">
                                        {l.branchName ||
                                          l.assignedBranchName ||
                                          `Branch (${l.branchId})`}
                                      </strong>
                                    </span>
                                  </div>
                                )}
                                {l.transferredBy && (
                                  <div className="flex items-center gap-1.5 text-emerald-300 font-semibold pt-1 border-t border-white/10">
                                    <span>🚀 Sent by: {l.transferredBy}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          <span className="text-[10.5px] text-zinc-400 font-medium shrink-0">
                            {l.createdAt || "Recent"}
                          </span>
                        </div>
                      </div>

                      {/* Repeat Client & Future Timeline Badges */}
                      {(Boolean(l.isExistingClient || l.clientId) ||
                        Boolean(l.expectedTimeline)) && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-0.5 pb-0.5">
                          {Boolean(l.isExistingClient || l.clientId) && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-2xs">
                              <UserIcon
                                size={9}
                                className="text-emerald-600 dark:text-emerald-400"
                              />
                              <span>Repeat Client</span>
                            </span>
                          )}
                          {Boolean(l.expectedTimeline) && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shadow-2xs">
                              <Clock
                                size={9}
                                className="text-purple-600 dark:text-purple-400"
                              />
                              <span>Target: {l.expectedTimeline}</span>
                            </span>
                          )}
                        </div>
                      )}

                      {/* Line 2: Customer / Primary Contact Name */}
                      {l.primaryContact && (
                        <div className="flex items-center gap-1.5 text-[11px] text-zinc-700 dark:text-zinc-200">
                          <UserIcon
                            size={12}
                            className="text-emerald-500 shrink-0"
                          />
                          <span className="truncate font-semibold text-zinc-900 dark:text-zinc-100">
                            {l.primaryContact}
                          </span>
                        </div>
                      )}

                      {/* Line 3: Phone & Secondary Manager */}
                      <div className="space-y-1 text-[11px]">
                        <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-300">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Phone
                              size={12}
                              className="text-blue-500 shrink-0"
                            />
                            <span className="truncate font-mono font-medium text-zinc-800 dark:text-zinc-200">
                              {l.phone}
                            </span>
                          </div>
                          {l.secondaryPhone && (
                            <span className="text-[9px] font-sans font-bold px-1.5 py-0.2 rounded bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shrink-0">
                              2 Contacts
                            </span>
                          )}
                        </div>
                        {l.secondaryPhone && (
                          <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 text-[10px] pl-0.5">
                            <span className="text-purple-600 dark:text-purple-400 font-bold text-[9.5px]">
                              Mgr:
                            </span>
                            <span className="truncate font-medium text-zinc-700 dark:text-zinc-300">
                              {l.secondaryContact
                                ? `${l.secondaryContact} • `
                                : ""}
                              <span className="font-mono">
                                {l.secondaryPhone}
                              </span>
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Line 3: Service & Source */}
                      <div className="flex items-center justify-between text-[11px] text-zinc-600 dark:text-zinc-300 gap-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Wrench
                            size={12}
                            className="text-zinc-400 shrink-0"
                          />
                          <span className="truncate">
                            Service:{" "}
                            <strong className="font-semibold text-zinc-700 dark:text-zinc-200">
                              {l.service || "-"}
                            </strong>
                          </span>
                        </div>
                        <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-700/60 text-zinc-600 dark:text-zinc-300 text-[10px] font-medium shrink-0 border border-zinc-200 dark:border-zinc-700">
                          {l.source || "Google"}
                        </span>
                      </div>

                      {/* Line 4: Reminder (Date + Time in Amber/Orange) */}
                      <div className="flex items-center gap-1.5 text-[11px] text-zinc-600 dark:text-zinc-300">
                        <Clock size={12} className="text-amber-500 shrink-0" />
                        <span className="truncate">
                          Reminder:{" "}
                          <strong className="font-semibold text-amber-600 dark:text-amber-400">
                            {formatLeadReminderDate(l.reminderDate)}
                            {l.reminderTime &&
                            l.reminderTime !== "None" &&
                            formatLeadReminderDate(l.reminderDate) !==
                              "No Reminder"
                              ? ` ${l.reminderTime}`
                              : ""}
                          </strong>
                        </span>
                      </div>

                      {/* Line 4b: City / Location below reminder */}
                      <div className="flex items-center gap-1.5 text-[11px] text-zinc-600 dark:text-zinc-300">
                        <MapPin size={12} className="text-rose-500 shrink-0" />
                        <span className="truncate font-semibold text-zinc-700 dark:text-zinc-200">
                          {l.city?.trim() ||
                            l.address?.trim() ||
                            l.state?.trim() ||
                            "-"}
                        </span>
                      </div>

                      {/* Line 5: Caller & Avatar (Prominently displayed above buttons) */}
                      <div className="flex items-center justify-between text-[11px] text-zinc-600 dark:text-zinc-300">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <UserIcon
                            size={12}
                            className="text-zinc-400 shrink-0"
                          />
                          <span className="truncate">
                            Caller:{" "}
                            <strong className="font-semibold text-zinc-800 dark:text-zinc-200">
                              {l.assignedTo &&
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
                                    : "Unassigned"}
                            </strong>
                          </span>
                        </div>

                        {/* Caller Avatar (Real Profile Picture if available, otherwise initials or unassigned icon) */}
                        {(() => {
                          const avatarInfo = getCallerAvatar(l, allUsers, user);
                          if (avatarInfo.type === "image") {
                            return (
                              <img
                                src={avatarInfo.src}
                                alt={avatarInfo.name}
                                className="w-5 h-5 rounded-full border border-zinc-200 dark:border-zinc-700 object-cover shrink-0 shadow-2xs"
                                title={avatarInfo.name}
                              />
                            );
                          }
                          if (
                            avatarInfo.type === "initials" &&
                            avatarInfo.initials
                          ) {
                            return (
                              <div
                                className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800 text-[9px] font-bold flex items-center justify-center shrink-0 shadow-2xs"
                                title={avatarInfo.name}
                              >
                                {avatarInfo.initials}
                              </div>
                            );
                          }
                          return (
                            <div
                              className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0"
                              title="Unassigned"
                            >
                              <UserIcon size={10} />
                            </div>
                          );
                        })()}
                      </div>

                      {/* Line 6: Bottom Action Bar - Centered */}
                      <div className="flex flex-col items-center justify-center pt-2 border-t border-zinc-100 dark:border-zinc-700/60 text-[11px] gap-1.5">
                        {/* Contact Switcher for Call/WhatsApp if secondary phone exists */}
                        {l.secondaryPhone && (
                          <div className="flex items-center bg-zinc-100 dark:bg-zinc-700/70 p-0.5 rounded-md text-[9px] font-bold">
                            <button
                              type="button"
                              onMouseDown={(e) => e.stopPropagation()}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveContactTarget((prev: any) => ({
                                  ...prev,
                                  [l.id]: "primary",
                                }));
                              }}
                              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                                (activeContactTarget[l.id] || "primary") ===
                                "primary"
                                  ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-2xs font-extrabold"
                                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                              }`}
                              title={`Target Primary: ${l.primaryContact} (${l.phone})`}
                            >
                              Primary
                            </button>
                            <button
                              type="button"
                              onMouseDown={(e) => e.stopPropagation()}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveContactTarget((prev: any) => ({
                                  ...prev,
                                  [l.id]: "secondary",
                                }));
                              }}
                              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                                activeContactTarget[l.id] === "secondary"
                                  ? "bg-white dark:bg-zinc-800 text-purple-600 dark:text-purple-400 shadow-2xs font-extrabold"
                                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                              }`}
                              title={`Target Manager: ${l.secondaryContact || "Manager"} (${l.secondaryPhone})`}
                            >
                              Mgr
                            </button>
                          </div>
                        )}

                        {/* Action Buttons Centered */}
                        <div className="flex items-center justify-center gap-2 w-full">
                          {/* Call Button */}
                          {(() => {
                            const isSec =
                              activeContactTarget[l.id] === "secondary" &&
                              !!l.secondaryPhone;
                            const targetNum = isSec
                              ? l.secondaryPhone!
                              : l.phone;
                            const targetLabel = isSec
                              ? `Manager (${l.secondaryContact || "Manager"})`
                              : `Primary (${l.primaryContact})`;
                            return (
                              <button
                                type="button"
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(
                                    `tel:${targetNum.replace(/[^0-9+]/g, "")}`,
                                  );
                                  setCallOutcomeModalLead(l);
                                }}
                                className={`w-7 h-7 min-w-[28px] min-h-[28px] rounded-lg flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-2xs ${
                                  isSec
                                    ? "bg-purple-100 hover:bg-purple-200 text-purple-700 dark:bg-purple-950 dark:hover:bg-purple-900 dark:text-purple-300"
                                    : "bg-blue-100/80 hover:bg-blue-200 text-blue-700 dark:bg-blue-950 dark:hover:bg-blue-900 dark:text-blue-300"
                                }`}
                                title={`Call & Log Outcome: ${targetLabel} (${targetNum})`}
                              >
                                <Phone
                                  size={13}
                                  className="pointer-events-none"
                                />
                              </button>
                            );
                          })()}

                          {/* WhatsApp Button */}
                          {(() => {
                            const isSec =
                              activeContactTarget[l.id] === "secondary" &&
                              !!l.secondaryPhone;
                            const targetNum = isSec
                              ? l.secondaryPhone!
                              : l.phone;
                            const targetLabel = isSec
                              ? `Manager (${l.secondaryContact || "Manager"})`
                              : `Primary (${l.primaryContact})`;
                            return (
                              <button
                                type="button"
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setWhatsAppModalLead(l);
                                }}
                                className="w-7 h-7 min-w-[28px] min-h-[28px] rounded-lg bg-emerald-100/80 hover:bg-emerald-200 text-emerald-700 dark:bg-emerald-950 dark:hover:bg-emerald-900 dark:text-emerald-300 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-2xs"
                                title={`1-Click WhatsApp ${targetLabel}: ${targetNum}`}
                              >
                                <WhatsAppIcon
                                  size={14}
                                  className="pointer-events-none"
                                />
                              </button>
                            );
                          })()}

                          {/* Edit Lead Button (Only via Pencil Icon when edit permission is granted) */}
                          {!isLocked && canEditLead && (
                            <button
                              type="button"
                              onMouseDown={(e) => e.stopPropagation()}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onOpenEditModal) {
                                  onOpenEditModal(l);
                                } else {
                                  onSelectLeadDetail(l);
                                }
                              }}
                              className="w-7 h-7 min-w-[28px] min-h-[28px] rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-2xs"
                              title="Edit lead"
                            >
                              <Pencil
                                size={13}
                                className="pointer-events-none"
                              />
                            </button>
                          )}

                          {/* Delete Lead Button (Shown when delete permission is granted) */}
                          {canDeleteLead && onDeleteLead && (
                            <button
                              type="button"
                              onMouseDown={(e) => e.stopPropagation()}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (
                                  window.confirm(
                                    `Are you sure you want to delete lead "${l.name}"?`,
                                  )
                                ) {
                                  onDeleteLead(l.id);
                                }
                              }}
                              className="w-7 h-7 min-w-[28px] min-h-[28px] rounded-lg bg-zinc-100 hover:bg-rose-100 text-zinc-500 hover:text-rose-600 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-rose-950 dark:hover:text-rose-400 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-2xs"
                              title="Delete lead"
                            >
                              <Trash2
                                size={13}
                                className="pointer-events-none"
                              />
                            </button>
                          )}

                          {canUserUnlockLead(user, l) && !isLocked && (
                            <button
                              type="button"
                              onMouseDown={(e) => e.stopPropagation()}
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  const { lockLead } =
                                    await import("@/features/leads/services/leadService");
                                  const locked = await lockLead(
                                    l.id,
                                    undefined,
                                    user,
                                    l.companyId,
                                  );
                                  onLeadUpdated(locked);
                                } catch (err: any) {
                                  alert(err?.message || "Failed to lock lead.");
                                }
                              }}
                              className="w-7 h-7 min-w-[28px] min-h-[28px] rounded-lg bg-zinc-100 hover:bg-rose-100 text-zinc-600 hover:text-rose-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-rose-950 dark:hover:text-rose-300 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-2xs group/kblock"
                              title={
                                user?.role === "Clients"
                                  ? "Lock Lead"
                                  : "Admin Manual Lock Lead"
                              }
                            >
                              <Lock
                                size={13}
                                className="group-hover/kblock:scale-110 transition-transform duration-300 pointer-events-none"
                              />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Prominent Overlay Badge for Locked Cards */}
                    {isLocked && (
                      <div className="absolute inset-0 z-20 bg-rose-950/25 backdrop-blur-[2px] rounded-xl flex flex-col items-center justify-center p-2 text-center border-2 border-rose-500/80 shadow-md">
                        <div className="bg-rose-600 text-white font-extrabold text-xs px-3 py-1 rounded-lg shadow-sm flex items-center gap-1.5 mb-1">
                          <Lock size={12} className="animate-pulse" />
                          <span>LEAD IS LOCKED</span>
                        </div>
                        <p className="text-[10px] text-rose-900 dark:text-rose-100 font-semibold px-2">
                          {l.lockedReason ||
                            "SLA Missed - Untouchable by telecaller"}
                        </p>

                        {/* Unlock Button or Informational Badge */}
                        {canUserUnlockLead(user, l) ? (
                          <button
                            type="button"
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                const { unlockLead } =
                                  await import("@/features/leads/services/leadService");
                                const unlocked = await unlockLead(
                                  l.id,
                                  user,
                                  l.companyId,
                                );
                                onLeadUpdated(unlocked);
                              } catch (err: any) {
                                alert(err?.message || "Failed to unlock lead.");
                              }
                            }}
                            className="group/kunlock mt-2 bg-white text-rose-700 hover:bg-rose-50 font-bold text-xs px-3 py-1.5 rounded-lg transition-all shadow-md flex items-center gap-1.5 cursor-pointer hover:scale-105"
                          >
                            <Unlock
                              size={12}
                              className="group-hover/kunlock:rotate-[-18deg] transition-transform duration-300"
                            />
                            <span>
                              {user?.role === "Clients"
                                ? "Unlock My Lead"
                                : "Admin Unlock Lead"}
                            </span>
                          </button>
                        ) : (
                          <p className="mt-2 text-[10px] font-bold text-rose-200 bg-rose-900/60 px-2 py-1 rounded-md">
                            {isLeadClientPrivate(l)
                              ? "Only creator client can unlock"
                              : "Only Admin can unlock"}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {columnLeads.length === 0 && (
                <div className="py-6 px-3 text-center border-2 border-dashed border-zinc-200/80 dark:border-zinc-800/80 rounded-xl bg-zinc-50/40 dark:bg-zinc-850/40 flex flex-col items-center justify-center gap-1.5 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center text-xs">
                    📭
                  </div>
                  <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                    No leads in {col.title}
                  </p>
                  <p className="text-[9.5px] text-zinc-400">
                    Drag a lead card here
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}
