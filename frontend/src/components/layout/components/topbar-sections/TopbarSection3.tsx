"use client"

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_RESTRICTIONS } from "@/lib/queryOptions";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  CheckSquare,
  LayoutGrid,
  Briefcase,
  Monitor,
  Calendar,
  Command,
  CheckCircle,
  Check,
  Search,
  Plus,
  Clock,
  Bell,
  Mail,
  Settings,
  LogOut,
  User,
  Sun,
  Moon,
  X,
  Building2,
  GitBranch,
  CreditCard,
  MapPin,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useUIStore } from "@/store/useUIStore";
import {
  useAuthStore,
  COMPANIES,
  getCompanyLogoUrl,
  getCompanyFullName,
  isMatchingCompany,
  getUserEntityScope,
} from "@/store/useAuthStore";
import { usePermissionStore } from "@/store/usePermissionStore";

export function TopbarSection3({ ctrl }: { ctrl: any }) {
  const { availableSubBranches, subBranchMenuRef, setShowSubBranchMenu, setShowCompanyMenu, setShowBranchMenu, setShowNotifications, setShowProfileMenu, activeSubBranch, showSubBranchMenu, activeBranch, activeCompanyName, switchSubBranch } = ctrl;
  return (
    <>
      {/* 3. Sub-Branch Tab (Beside Branch Tab, visible if sub-branches exist) */}
            {availableSubBranches.length > 0 && (
              <div className="relative shrink-0" ref={subBranchMenuRef}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSubBranchMenu((prev) => !prev);
                    setShowCompanyMenu(false);
                    setShowBranchMenu(false);
                    setShowNotifications(false);
                    setShowProfileMenu(false);
                  }}
                  className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl border transition-all group cursor-pointer max-w-[90px] xs:max-w-[120px] sm:max-w-[160px] shrink-0 ${
                    activeSubBranch
                      ? "border-purple-300 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20 text-purple-900 dark:text-purple-300"
                      : "border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 hover:bg-slate-50 dark:hover:bg-zinc-800/80 text-slate-800 dark:text-zinc-200"
                  }`}
                  title={
                    activeSubBranch
                      ? `Active Sub-Branch: ${activeSubBranch.name}`
                      : "Sub-Branch selection"
                  }
                >
                  {activeSubBranch?.logo_url ? (
                    <img
                      src={activeSubBranch.logo_url}
                      alt={activeSubBranch.name}
                      className="w-4 h-4 rounded-md object-contain shrink-0 bg-white dark:bg-zinc-900 p-0.5 border border-slate-200 dark:border-zinc-700"
                    />
                  ) : (
                    <span className="text-xs shrink-0">🤝</span>
                  )}
                  <span className="truncate font-semibold text-[11px] sm:text-xs leading-tight">
                    {activeSubBranch ? activeSubBranch.name : "Sub-Branches"}
                  </span>
                  <ChevronDown
                    size={11}
                    className="text-slate-400 shrink-0 ml-0.5 group-hover:text-slate-600 dark:group-hover:text-slate-200"
                  />
                </button>

                {/* Sub-Branch Dropdown Menu */}
                <AnimatePresence>
                  {showSubBranchMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      onClick={(e) => e.stopPropagation()}
                      className="fixed top-16 left-2 right-2 sm:absolute sm:top-full sm:left-0 sm:right-auto mt-1 sm:mt-2 w-auto sm:w-80 max-w-[calc(100vw-1rem)] rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl z-[9999] overflow-hidden flex flex-col max-h-[80vh]"
                    >
                      <div className="p-3 bg-muted/30 border-b border-border flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-foreground">
                            Select Sub-Branch
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {activeBranch?.name || activeCompanyName}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowSubBranchMenu(false);
                          }}
                          className="p-1 text-muted-foreground hover:text-foreground rounded-lg cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      <div className="p-2 space-y-1 max-h-[300px] overflow-y-auto">
                        {/* All Sub-Branches / Branch HQ Option */}
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            switchSubBranch(null);
                            setShowSubBranchMenu(false);
                          }}
                          className={`flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${
                            !activeSubBranch
                              ? "bg-purple-600/10 border-purple-500/40 text-purple-700 dark:text-purple-300"
                              : "border-transparent hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Building2
                              size={14}
                              className="text-purple-600 shrink-0"
                            />
                            <div>
                              <p className="text-xs font-bold leading-tight">
                                Branch HQ (All Sub-Branches)
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                Main branch operation
                              </p>
                            </div>
                          </div>
                          {!activeSubBranch && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-600 text-white">
                              Active
                            </span>
                          )}
                        </div>

                        {availableSubBranches.map((sb) => {
                          const isSubActive = activeSubBranch?.id === sb.id;
                          return (
                            <div
                              key={sb.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                switchSubBranch(sb.id);
                                setShowSubBranchMenu(false);
                              }}
                              className={`flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${
                                isSubActive
                                  ? "bg-purple-600/10 border-purple-500/40 text-purple-700 dark:text-purple-300"
                                  : "border-transparent hover:bg-muted/50"
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                {sb.logo_url ? (
                                  <img
                                    src={sb.logo_url}
                                    alt={sb.name}
                                    className="w-6 h-6 rounded-lg object-contain shrink-0 bg-white dark:bg-zinc-800 p-0.5 border border-border"
                                  />
                                ) : (
                                  <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-600 flex items-center justify-center shrink-0 text-xs font-bold">
                                    🤝
                                  </div>
                                )}
                                <div className="truncate">
                                  <p className="text-xs font-bold leading-tight truncate">
                                    {sb.name}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground truncate">
                                    {sb.partnerType || "Franchise Partner"}
                                    {sb.city ? ` • ${sb.city}` : ""}
                                  </p>
                                </div>
                              </div>
                              {isSubActive && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-600 text-white shrink-0 ml-2">
                                  Active
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="p-2 border-t border-border bg-muted/20 flex items-center justify-between">
                        <Link
                          href="/feature/companies"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowSubBranchMenu(false);
                          }}
                          className="text-[11px] font-bold text-purple-600 hover:underline"
                        >
                          Manage Sub-Branches →
                        </Link>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowSubBranchMenu(false);
                          }}
                          className="px-2 py-0.5 text-[11px] font-semibold bg-surface-hover hover:bg-muted rounded-md text-foreground cursor-pointer"
                        >
                          Close
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
    </>
  );
}
