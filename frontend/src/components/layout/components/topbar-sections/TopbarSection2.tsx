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

export function TopbarSection2({ ctrl }: { ctrl: any }) {
  const { isGroupLevel, companyBranches, branchMenuRef, setShowBranchMenu, setShowCompanyMenu, setShowSubBranchMenu, setShowNotifications, setShowProfileMenu, activeBranch, showBranchMenu, activeCompanyName, handleSelectBranch } = ctrl;
  return (
    <>
      {/* 2. Branch Tab (Beside Company Tab, always visible when a company is selected) */}
            {!isGroupLevel && (
              <div className="relative shrink-0" ref={branchMenuRef}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowBranchMenu((prev) => !prev);
                    setShowCompanyMenu(false);
                    setShowSubBranchMenu(false);
                    setShowNotifications(false);
                    setShowProfileMenu(false);
                  }}
                  className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl border transition-all group cursor-pointer max-w-[90px] xs:max-w-[120px] sm:max-w-[160px] shrink-0 ${
                    activeBranch
                      ? "border-blue-300 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-300"
                      : "border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 hover:bg-slate-50 dark:hover:bg-zinc-800/80 text-slate-800 dark:text-zinc-200"
                  }`}
                  title={
                    activeBranch
                      ? `Active Branch: ${activeBranch.name}`
                      : "Branch selection"
                  }
                >
                  {activeBranch?.logo_url ? (
                    <img
                      src={activeBranch.logo_url}
                      alt={activeBranch.name}
                      className="w-4 h-4 rounded-md object-contain shrink-0 bg-white dark:bg-zinc-900 p-0.5 border border-slate-200 dark:border-zinc-700"
                    />
                  ) : (
                    <GitBranch
                      size={12}
                      className="text-blue-600 dark:text-blue-400 shrink-0"
                    />
                  )}
                  <span className="truncate font-semibold text-[11px] sm:text-xs leading-tight">
                    {activeBranch ? activeBranch.name : "Branches"}
                  </span>
                  <ChevronDown
                    size={11}
                    className="text-slate-400 shrink-0 ml-0.5 group-hover:text-slate-600 dark:group-hover:text-slate-200"
                  />
                </button>

                {/* Branch Dropdown Menu */}
                <AnimatePresence>
                  {showBranchMenu && (
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
                            Select Branch
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {activeCompanyName}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowBranchMenu(false);
                          }}
                          className="p-1 text-muted-foreground hover:text-foreground rounded-lg cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      <div className="p-2 space-y-1 max-h-[300px] overflow-y-auto">
                        {/* All Branches / Company HQ Option */}
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectBranch(null);
                          }}
                          className={`flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${
                            !activeBranch
                              ? "bg-blue-600/10 border-blue-500/40 text-blue-700 dark:text-blue-300"
                              : "border-transparent hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Building2
                              size={14}
                              className="text-blue-600 shrink-0"
                            />
                            <div>
                              <p className="text-xs font-bold leading-tight">
                                Company HQ (All Branches)
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                Corporate Headquarters view
                              </p>
                            </div>
                          </div>
                          {!activeBranch && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-600 text-white">
                              Active
                            </span>
                          )}
                        </div>

                        {companyBranches.length === 0 && (
                          <div className="px-3 py-2 text-[11px] text-muted-foreground text-center">
                            No branches configured yet for this company.
                          </div>
                        )}
                        {companyBranches.map((b) => {
                          const isBranchActive =
                            activeBranch &&
                            String(activeBranch.id).toLowerCase().trim() ===
                              String(b.id).toLowerCase().trim();
                          return (
                            <div
                              key={b.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectBranch(b);
                              }}
                              className={`flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${
                                isBranchActive
                                  ? "bg-blue-600/10 border-blue-500/40 text-blue-700 dark:text-blue-300"
                                  : "border-transparent hover:bg-muted/50"
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                {b.logo_url ? (
                                  <img
                                    src={b.logo_url}
                                    alt={b.name}
                                    className="w-6 h-6 rounded-lg object-contain shrink-0 bg-white dark:bg-zinc-800 p-0.5 border border-border"
                                  />
                                ) : (
                                  <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-600 flex items-center justify-center shrink-0">
                                    <GitBranch size={13} />
                                  </div>
                                )}
                                <div className="truncate">
                                  <p className="text-xs font-bold leading-tight truncate">
                                    {b.name}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground truncate">
                                    {b.code ? `${b.code} • ` : ""}
                                    {b.city || "Branch"}
                                  </p>
                                </div>
                              </div>
                              {isBranchActive && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-600 text-white shrink-0 ml-2">
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
                            setShowBranchMenu(false);
                          }}
                          className="text-[11px] font-bold text-blue-600 hover:underline"
                        >
                          Manage Branches →
                        </Link>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowBranchMenu(false);
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
