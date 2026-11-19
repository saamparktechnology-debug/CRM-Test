"use client"

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_RESTRICTIONS } from "@/lib/queryOptions";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Mail,
  Briefcase,
  ShoppingCart,
  File,
  Book,
  Users,
  LifeBuoy,
  Folder,
  Clock,
  Settings,
  LayoutDashboard,
  KanbanSquare,
  CheckSquare,
  Sparkles,
  Target,
  FileText,
  Calculator,
  HeadphonesIcon,
  MessageSquare,
  CreditCard,
  Receipt,
  UserCheck,
  ChevronDown,
  ShoppingBag,
  X,
  Building2,
  GitBranch,
  MapPin,
  Shield,
  UserPlus,
  Handshake,
  HelpCircle,
  Phone,
  MessageCircle,
  ClipboardList,
  FileOutput,
  FileInput,
  ArrowDownCircle,
  ArrowUpCircle,
  Banknote,
  Wallet,
  PiggyBank,
  BarChart3,
  Package,
  Tag,
  Award,
  Boxes,
  Warehouse,
  QrCode,
  UserCog,
  GraduationCap,
  BadgeCheck,
  DollarSign,
  FileStack,
  Ticket,
  Bell,
  FileCheck,
  ShieldCheck,
  Zap,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/useUIStore";
import {
  useAuthStore,
  getCompanyLogoUrl,
  getCompanyFullName,
  isMatchingCompany,
} from "@/store/useAuthStore";
import { usePermissionStore } from "@/store/usePermissionStore";
import { SaamparkVortexLogo, type SubNavItem, type NavItem, ALL_NAV_ITEMS } from "@/components/layout/components/sidebar-sections/SidebarHelpers"

export function SidebarSection1({ ctrl }: { ctrl: any }) {
  const { isMobile, isDrawerOpen, isSidebarCollapsed, handleLinkClick, isAllCompanies, activeEntityLogo, activeCompany, activeCompanyName, setSidebarCollapsed, allowedNavItems, pathname, openSubmenus, rawCounts, visitedCounts, toggleSubmenu, getScopedHref, user } = ctrl;
  return (
    <>
      <motion.aside
        initial={false}
        animate={
          isMobile
            ? {
                x: isDrawerOpen ? 0 : -320,
                width: 280,
                opacity: isDrawerOpen ? 1 : 0,
              }
            : {
                x: 0,
                width: isSidebarCollapsed ? 64 : 256,
                opacity: 1,
              }
        }
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className={cn(
          "fixed top-0 left-0 h-screen bg-[#0A1128] text-slate-300 border-r border-slate-800/80 flex flex-col overflow-hidden shadow-2xl z-40",
          isMobile ? "z-50" : "z-40",
        )}
      >
        {/* Header - Selected Active Company Name & Logo */}
        <div className="h-16 flex items-center justify-between px-3.5 border-b border-slate-800/80 shrink-0">
          <Link
            href="/feature/dashboard"
            onClick={handleLinkClick}
            className="flex items-center gap-2.5 group min-w-0 flex-1"
          >
            <div className="w-10 h-10 min-w-[40px] rounded-xl bg-slate-800/80 border border-slate-700/60 p-1 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform shadow-xs">
              {isAllCompanies ? (
                <SaamparkVortexLogo className="w-8 h-8" />
              ) : activeEntityLogo ? (
                <img
                  key={activeEntityLogo || activeCompany?.id}
                  src={activeEntityLogo}
                  alt={activeCompanyName}
                  className="w-full h-full object-contain"
                />
              ) : activeCompany?.logo ? (
                <span className="text-xl">{activeCompany.logo}</span>
              ) : (
                <SaamparkVortexLogo className="w-8 h-8" />
              )}
            </div>

            <AnimatePresence mode="wait">
              {(!isSidebarCollapsed || isMobile) && (
                <motion.div
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 6 }}
                  transition={{ duration: 0.2 }}
                  className="min-w-0 flex-1 overflow-hidden text-left"
                >
                  {isAllCompanies ? (
                    <div>
                      <span
                        className="font-black text-xs sm:text-sm tracking-wide text-white block truncate uppercase"
                        title="SAAMPARK GROUP"
                      >
                        SAAMPARK
                      </span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block truncate -mt-0.5">
                        GROUP
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span
                        className="font-black text-xs sm:text-sm tracking-wider text-white block truncate uppercase"
                        title={activeCompany?.brand_name || "SAAMPARK"}
                      >
                        {activeCompany?.brand_name || "SAAMPARK"}
                      </span>
                      <span
                        className="text-[9.5px] font-bold text-slate-400 uppercase tracking-tight block truncate -mt-0.5"
                        title={activeCompany?.name || activeCompanyName}
                      >
                        {activeCompany?.name || activeCompanyName}
                      </span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </Link>

          {/* Close X button on mobile */}
          {isMobile && (
            <button
              type="button"
              onClick={() => setSidebarCollapsed(true)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors shrink-0"
              title="Close menu"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 space-y-1 scrollbar-hide px-2">
          {allowedNavItems.map((item) => {
            const hasSubItems = Boolean(
              item.subItems && item.subItems.length > 0,
            );
            const isSubActive =
              hasSubItems &&
              item.subItems?.some(
                (sub) =>
                  pathname === sub.href ||
                  pathname.startsWith(sub.href + "/") ||
                  pathname.includes(sub.href),
              );
            const isActive =
              pathname === item.href ||
              (item.href !== "/feature/dashboard" &&
                pathname.startsWith(item.href + "/")) ||
              pathname.includes(item.href) ||
              isSubActive;
            const isDropdownOpen = Boolean(openSubmenus[item.name]);
            const getItemBadge = (name: string) => {
              const raw =
                rawCounts[name] !== undefined
                  ? rawCounts[name]
                  : typeof item.badge === "number"
                    ? item.badge
                    : 0;
              const visited = visitedCounts[name] || 0;
              const unread = raw - visited;
              return unread > 0 ? unread : null;
            };
            const itemBadge = getItemBadge(item.name);

            return (
              <div key={item.name}>
                {hasSubItems && (!isSidebarCollapsed || isMobile) ? (
                  <button
                    type="button"
                    onClick={(e) => toggleSubmenu(item.name, e)}
                    className="w-full block text-left"
                  >
                    <div
                      className={cn(
                        "flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all relative group cursor-pointer text-xs font-semibold",
                        isActive
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black shadow-md shadow-blue-600/30 ring-1 ring-white/20"
                          : "text-slate-100 hover:text-white hover:bg-slate-800/90 font-bold hover:translate-x-0.5",
                      )}
                    >
                      <item.icon
                        size={17}
                        className={cn(
                          "shrink-0 transition-colors",
                          isActive
                            ? "text-white drop-shadow-xs"
                            : "text-slate-200 group-hover:text-white",
                        )}
                        strokeWidth={isActive ? 2.5 : 2}
                      />

                      <div className="flex items-center justify-between w-full overflow-hidden">
                        <span className="whitespace-nowrap overflow-hidden text-[12.5px] tracking-wide">
                          {item.name}
                        </span>
                        <div className="flex items-center gap-1.5 ml-auto">
                          {itemBadge && (
                            <span className="text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full shadow-xs bg-indigo-500 ring-1 ring-white/20">
                              {itemBadge}
                            </span>
                          )}
                          <ChevronDown
                            size={14}
                            className={cn(
                              "text-slate-300 transition-transform duration-200 shrink-0",
                              isDropdownOpen &&
                                "rotate-180 text-white font-bold",
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </button>
                ) : (
                  <Link
                    href={getScopedHref(item.href)}
                    onClick={handleLinkClick}
                    className="block"
                  >
                    <div
                      className={cn(
                        "flex items-center gap-3 py-2.5 rounded-xl transition-all relative group text-xs font-semibold",
                        isSidebarCollapsed && !isMobile
                          ? "justify-center px-0"
                          : "px-3",
                        isActive
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black shadow-md shadow-blue-600/30 ring-1 ring-white/20"
                          : "text-slate-100 hover:text-white hover:bg-slate-800/90 font-bold hover:translate-x-0.5",
                      )}
                      title={
                        isSidebarCollapsed && !isMobile ? item.name : undefined
                      }
                    >
                      <item.icon
                        size={17}
                        className={cn(
                          "shrink-0 transition-colors",
                          isActive
                            ? "text-white drop-shadow-xs"
                            : "text-slate-200 group-hover:text-white",
                        )}
                        strokeWidth={isActive ? 2.5 : 2}
                      />

                      <AnimatePresence>
                        {(!isSidebarCollapsed || isMobile) && (
                          <div className="flex items-center justify-between w-full overflow-hidden">
                            <span className="whitespace-nowrap overflow-hidden text-[12.5px] tracking-wide">
                              {item.name}
                            </span>
                            {itemBadge && (
                              <span
                                className={`ml-auto text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full shadow-xs shrink-0 ring-1 ring-white/20 ${
                                  item.name === "Projects" ||
                                  item.name === "Leads"
                                    ? "bg-rose-600 animate-pulse"
                                    : "bg-blue-600"
                                }`}
                              >
                                {itemBadge}
                              </span>
                            )}
                          </div>
                        )}
                      </AnimatePresence>
                    </div>
                  </Link>
                )}

                {/* Sub-items dropdown */}
                <AnimatePresence>
                  {hasSubItems &&
                    isDropdownOpen &&
                    (!isSidebarCollapsed || isMobile) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.18, ease: "easeInOut" }}
                        className="space-y-1 mt-1 pl-4 pr-1 overflow-hidden"
                      >
                        {item.subItems?.map((sub) => {
                          const isSubActiveItem =
                            pathname === sub.href ||
                            pathname.startsWith(sub.href + "/") ||
                            pathname.includes(sub.href);

                          return (
                            <Link
                              key={sub.name}
                              href={getScopedHref(sub.href)}
                              onClick={handleLinkClick}
                              className="block"
                            >
                              <div
                                className={cn(
                                  "flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                                  isSubActiveItem
                                    ? "text-white bg-blue-600/35 border-l-2 border-blue-400 font-bold shadow-xs pl-2.5"
                                    : "text-slate-200 hover:text-white hover:bg-slate-800/80 hover:translate-x-0.5",
                                )}
                              >
                                <sub.icon
                                  size={13}
                                  className={cn(
                                    "shrink-0 transition-colors",
                                    isSubActiveItem
                                      ? "text-blue-300"
                                      : "text-slate-300 group-hover:text-white",
                                  )}
                                />
                                <span className="truncate">{sub.name}</span>
                              </div>
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* User Profile Section in Sidebar */}
        {user && (
          <div className="p-3 border-t border-slate-800/80 bg-slate-900/50 shrink-0">
            <div className="flex items-center justify-between gap-2">
              <Link
                href="/feature/settings"
                onClick={handleLinkClick}
                className="flex items-center gap-2.5 min-w-0 flex-1 p-1 rounded-xl hover:bg-slate-800/60 transition-colors"
                title="View Profile & Settings"
              >
                <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 border border-slate-700 shadow-xs">
                  <img
                    key={
                      (user as any)?.avatarUrl ||
                      user?.avatar ||
                      user?.name ||
                      "sidebar_avatar"
                    }
                    src={
                      (user as any).avatarUrl ||
                      user.avatar ||
                      `https://api.dicebear.com/7.x/notionists/svg?seed=${user.name}`
                    }
                    alt={user.name}
                    className="w-full h-full object-cover bg-slate-800"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0A1128]" />
                </div>
                {(!isSidebarCollapsed || isMobile) && (
                  <div className="min-w-0 flex-1 text-left">
                    <p className="text-xs font-bold text-white truncate">
                      {user.name}
                    </p>
                    <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                      Online
                    </p>
                  </div>
                )}
              </Link>
              {(!isSidebarCollapsed || isMobile) && (
                <Link
                  href="/feature/settings"
                  onClick={handleLinkClick}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                  title="Settings"
                >
                  <Settings size={15} />
                </Link>
              )}
            </div>
          </div>
        )}
      </motion.aside>
    </>
  );
}
