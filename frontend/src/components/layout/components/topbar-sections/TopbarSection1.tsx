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

export function TopbarSection1({ ctrl }: { ctrl: any }) {
  const { companyMenuRef, setShowCompanyMenu, setShowBranchMenu, setShowSubBranchMenu, setShowNotifications, setShowProfileMenu, activeCompanyName, isAllCompanies, activeCompanyLogo, activeSubBranch, activeBranch, companyBranches, showCompanyMenu, isSuperAdmin, handleSelectCompany, allowedCompanies, activeCompany, activeCompanyId } = ctrl;
  return (
    <>
      {/* 1. Company Tab */}
            <div className="relative shrink-0" ref={companyMenuRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCompanyMenu((prev) => !prev);
                  setShowBranchMenu(false);
                  setShowSubBranchMenu(false);
                  setShowNotifications(false);
                  setShowProfileMenu(false);
                }}
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 hover:bg-slate-50 dark:hover:bg-zinc-800 shadow-xs text-slate-900 dark:text-white transition-all group cursor-pointer max-w-[130px] xs:max-w-[170px] sm:max-w-[220px] md:max-w-[270px] shrink-0"
                title={`Active Company: ${activeCompanyName}`}
              >
                {isAllCompanies ? (
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-blue-600/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
                    <Building2 size={12} className="sm:hidden" />
                    <Building2 size={13} className="hidden sm:block" />
                  </div>
                ) : activeCompanyLogo ? (
                  <img
                    src={activeCompanyLogo}
                    alt={activeCompanyName}
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-md object-contain shrink-0 bg-white dark:bg-zinc-900 p-0.5 border border-slate-200 dark:border-zinc-700"
                  />
                ) : (
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-blue-600/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
                    <Building2 size={12} className="sm:hidden" />
                    <Building2 size={13} className="hidden sm:block" />
                  </div>
                )}

                <div className="text-left truncate min-w-0 flex-1">
                  <span className="truncate font-bold text-[11px] sm:text-xs text-slate-900 dark:text-white leading-tight block whitespace-pre">
                    {isAllCompanies
                      ? "SAAMPARK GROUP (ALL)"
                      : activeCompanyName}
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 block truncate leading-tight font-medium">
                    {isAllCompanies
                      ? "All Companies"
                      : activeSubBranch
                        ? `${activeBranch?.name || "Branch"} • ${activeSubBranch.name}`
                        : activeBranch
                          ? activeBranch.name
                          : companyBranches.length > 0
                            ? "HQ (All Branches)"
                            : "Corporate Headquarters"}
                  </span>
                </div>
                <ChevronDown
                  size={12}
                  className="text-slate-400 shrink-0 ml-0.5 group-hover:text-slate-600 dark:group-hover:text-slate-200"
                />
              </button>

              {/* Company Dropdown Menu (Fixed across mobile screen, absolute below button on desktop) */}
              <AnimatePresence>
                {showCompanyMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    onClick={(e) => e.stopPropagation()}
                    className="fixed top-16 left-2 right-2 sm:absolute sm:top-full sm:left-0 sm:right-auto mt-1 sm:mt-2 w-auto sm:w-96 max-w-[calc(100vw-1rem)] rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl z-[9999] overflow-hidden flex flex-col max-h-[80vh]"
                  >
                    <div className="p-3 bg-muted/30 border-b border-border flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-foreground">
                          Select Company
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Switch between registered company entities
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowCompanyMenu(false);
                        }}
                        className="p-1 text-muted-foreground hover:text-foreground rounded-lg cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <div className="p-2 space-y-1.5 max-h-[340px] overflow-y-auto">
                      {/* Super Admin: All Companies Option */}
                      {isSuperAdmin && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectCompany("all");
                          }}
                          className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                            isAllCompanies
                              ? "bg-blue-600/10 border-blue-500/40 text-blue-700 dark:text-blue-300"
                              : "border-transparent hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-600 flex items-center justify-center shrink-0">
                              <Building2 size={14} />
                            </div>
                            <div>
                              <p className="text-xs font-bold leading-tight">
                                SAAMPARK GROUP (ALL)
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                Consolidated Enterprise View
                              </p>
                            </div>
                          </div>
                          {isAllCompanies && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-600 text-white">
                              Active
                            </span>
                          )}
                        </div>
                      )}

                      {allowedCompanies.map((c) => {
                        const isActive =
                          !isAllCompanies &&
                          isMatchingCompany(
                            c,
                            activeCompany?.id || activeCompanyId,
                          );
                        const cName = getCompanyFullName(c);
                        const cLogo = getCompanyLogoUrl(c);
                        return (
                          <div
                            key={c.id || c.slug}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectCompany(c);
                            }}
                            className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                              isActive
                                ? "bg-blue-600/10 border-blue-500/40 text-blue-700 dark:text-blue-300"
                                : "border-transparent hover:bg-muted/50"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              {cLogo ? (
                                <img
                                  src={cLogo}
                                  alt={cName}
                                  className="w-7 h-7 rounded-lg object-contain shrink-0 bg-white dark:bg-zinc-800 p-0.5 border border-border"
                                />
                              ) : (
                                <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-600 flex items-center justify-center shrink-0">
                                  <Building2 size={14} />
                                </div>
                              )}
                              <div className="truncate">
                                <p className="text-xs font-bold leading-tight truncate">
                                  {cName}
                                </p>
                                <p className="text-[10px] text-muted-foreground truncate">
                                  {c.city ? `${c.city}, ` : ""}
                                  {c.state || "India"}
                                </p>
                              </div>
                            </div>
                            {isActive && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-600 text-white shrink-0 ml-2">
                                Active
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="p-2.5 border-t border-border bg-muted/20 flex items-center justify-between">
                      <Link
                        href="/feature/companies"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowCompanyMenu(false);
                        }}
                        className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <span>Manage Companies →</span>
                      </Link>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowCompanyMenu(false);
                        }}
                        className="px-2.5 py-1 text-[11px] font-semibold bg-surface-hover hover:bg-muted rounded-lg text-foreground cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
    </>
  );
}
