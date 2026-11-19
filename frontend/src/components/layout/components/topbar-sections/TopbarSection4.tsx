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

export function TopbarSection4({ ctrl }: { ctrl: any }) {
  const { openModal, notifRef, setShowNotifications, setShowProfileMenu, setShowCompanyMenu, setShowBranchMenu, setShowSubBranchMenu, notifications, showNotifications, user, setNotifications, profileMenuRef, showProfileMenu, setTheme, theme, allowedCompanies, activeCompanyId, activeCompany, switchCompany, logout } = ctrl;
  return (
    <>
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Search icon button - no box */}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              openModal("isGlobalSearchOpen");
            }}
            className="text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer h-8 w-8 sm:h-9 sm:w-9 p-0"
            title="Search (Ctrl + K)"
          >
            <Search size={18} />
          </Button>

          {/* Notifications */}
          <div className="relative shrink-0" ref={notifRef}>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setShowNotifications((v) => !v);
                setShowProfileMenu(false);
                setShowCompanyMenu(false);
                setShowBranchMenu(false);
                setShowSubBranchMenu(false);
              }}
              className="text-muted-foreground hover:text-foreground relative cursor-pointer h-8 w-8 sm:h-9 sm:w-9 p-0"
              title="Notifications"
            >
              <Bell size={18} />
              {notifications.some((n) => !n.read) && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger animate-pulse" />
              )}
            </Button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.13 }}
                  onClick={(e) => e.stopPropagation()}
                  className="fixed top-16 left-2 right-2 sm:absolute sm:top-full sm:left-auto sm:right-0 mt-1 sm:mt-2 w-auto sm:w-96 max-w-[calc(100vw-1rem)] bg-surface border border-slate-200 dark:border-zinc-800 shadow-2xl rounded-3xl overflow-hidden z-[9999] max-h-[85vh] flex flex-col"
                >
                  <div className="p-4 border-b border-border/50 flex items-center justify-between bg-surface-hover/30">
                    <div className="flex items-center gap-2">
                      <Bell size={16} className="text-primary" />
                      <span className="font-bold text-sm text-foreground">
                        Notifications
                      </span>
                    </div>
                    <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full border border-primary/20">
                      {notifications.filter((n) => !n.read).length} New
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto divide-y divide-border/40 max-h-80">
                    {notifications.length === 0 ? (
                      <div className="py-10 text-center text-xs text-muted-foreground space-y-1">
                        <p className="text-2xl">🔔</p>
                        <p className="font-medium">No new notifications</p>
                        <p className="text-[11px] opacity-75">
                          You're all caught up!
                        </p>
                      </div>
                    ) : (
                      notifications.map((n, idx) => (
                        <div
                          key={n.id || idx}
                          onClick={async (e) => {
                            e.stopPropagation();
                            const { markNotificationAsRead } =
                              await import("@/services/notificationService");
                            if (n.id)
                              await markNotificationAsRead(n.id, user?.email);
                            if (n.linkUrl) {
                              setShowNotifications(false);
                              window.location.href = n.linkUrl;
                            }
                          }}
                          className={`px-4 py-3 flex items-start gap-3 hover:bg-surface-hover cursor-pointer transition-colors ${
                            !n.read ? "bg-primary/5" : "opacity-80"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.read ? "bg-primary" : "bg-transparent"}`}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-foreground leading-snug">
                              {n.title || n.text}
                            </p>
                            {n.message && (
                              <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                                {n.message}
                              </p>
                            )}
                            <p className="text-[10px] text-muted-foreground mt-1 font-mono">
                              {n.timestampFormatted ||
                                n.timestamp ||
                                n.time ||
                                "Just now"}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {notifications.length > 0 && (
                    <div className="p-2.5 text-center border-t border-border/50 bg-surface flex items-center justify-center">
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          const { markAllNotificationsAsRead } =
                            await import("@/services/notificationService");
                          await markAllNotificationsAsRead(user?.email);
                          setNotifications((prev) =>
                            prev.map((n) => ({ ...n, read: true })),
                          );
                        }}
                        className="text-xs text-primary hover:underline font-bold cursor-pointer"
                      >
                        Mark all as read
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="h-5 sm:h-6 w-[1px] bg-border mx-0.5 sm:mx-1" />

          {/* Profile chip matching screenshot */}
          <div className="relative shrink-0" ref={profileMenuRef}>
            <div
              onClick={(e) => {
                e.stopPropagation();
                setShowProfileMenu((v) => !v);
                setShowNotifications(false);
                setShowCompanyMenu(false);
                setShowBranchMenu(false);
                setShowSubBranchMenu(false);
              }}
              className="flex items-center gap-2 cursor-pointer p-0.5 sm:p-1 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors select-none"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden shrink-0 border border-slate-200 dark:border-zinc-700 shadow-xs">
                <img
                  key={
                    (user as any)?.avatarUrl ||
                    user?.avatar ||
                    user?.name ||
                    "topbar_avatar"
                  }
                  src={
                    (user as any).avatarUrl ||
                    user.avatar ||
                    `https://api.dicebear.com/7.x/notionists/svg?seed=${user.name}`
                  }
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="hidden lg:block text-left leading-tight pr-1">
                <span className="text-xs text-slate-900 dark:text-white font-bold block truncate max-w-[140px]">
                  {user.name}
                </span>
                <span className="text-[10px] text-slate-400 font-medium block truncate max-w-[140px]">
                  {user.role === "Super Admin"
                    ? "Super Administrator"
                    : user.role}
                </span>
              </div>
            </div>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.13 }}
                  onClick={(e) => e.stopPropagation()}
                  className="fixed top-16 left-2 right-2 sm:absolute sm:top-full sm:left-auto sm:right-0 mt-1 sm:mt-2 w-auto sm:w-64 max-w-[calc(100vw-1rem)] bg-surface border border-slate-200 dark:border-zinc-800 shadow-2xl rounded-2xl overflow-hidden z-[9999] flex flex-col max-h-[85vh]"
                >
                  <div className="px-4 py-3 border-b border-border/50 shrink-0 bg-surface-pressed/30">
                    <p className="text-sm font-semibold truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                    <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-primary/10 text-primary border border-primary/20">
                      {user.role}
                    </div>
                  </div>

                  <div className="py-1 shrink-0">
                    <Link href="/feature/settings">
                      <button
                        onClick={() => setShowProfileMenu(false)}
                        className="w-full text-left px-4 py-2.5 text-xs text-muted-foreground hover:bg-surface-hover hover:text-foreground flex items-center gap-2.5 transition-colors cursor-pointer font-medium"
                      >
                        <User size={14} className="text-primary" /> My Complete
                        Profile & Avatar
                      </button>
                    </Link>
                    <button
                      onClick={() => {
                        setTheme(theme === "dark" ? "light" : "dark");
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-muted-foreground hover:bg-surface-hover hover:text-foreground flex items-center gap-2.5 transition-colors cursor-pointer font-medium"
                    >
                      {theme === "dark" ? (
                        <Sun size={14} />
                      ) : (
                        <Moon size={14} />
                      )}
                      {theme === "dark" ? "Light Mode" : "Dark Mode"}
                    </button>
                    {["Super Admin", "Admin"].includes(user.role) && (
                      <Link href="/feature/settings">
                        <button
                          onClick={() => setShowProfileMenu(false)}
                          className="w-full text-left px-4 py-2 text-xs text-muted-foreground hover:bg-surface-hover hover:text-foreground flex items-center gap-2.5 transition-colors cursor-pointer font-medium"
                        >
                          <Settings size={14} /> Settings & Integrations
                        </button>
                      </Link>
                    )}
                  </div>

                  {/* Company Switcher for Multi-Company Users */}
                  {allowedCompanies.length > 1 && (
                    <div className="border-t border-border/50 py-2 shrink-0">
                      <p className="px-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">
                        Switch Company
                      </p>
                      <div className="max-h-40 overflow-y-auto hide-scrollbar space-y-0.5 px-2">
                        {allowedCompanies.map((comp) => {
                          const isCurrentActive = isMatchingCompany(
                            comp,
                            activeCompanyId ||
                              activeCompany?.id ||
                              activeCompany?.slug,
                          );
                          const compFullName = getCompanyFullName(comp);
                          const compLogoUrl = getCompanyLogoUrl(comp);

                          return (
                            <button
                              key={comp.id}
                              onClick={() => {
                                switchCompany(comp.id);
                                setShowProfileMenu(false);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors text-left cursor-pointer ${
                                isCurrentActive
                                  ? "bg-primary/10 text-primary font-bold"
                                  : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 truncate">
                                {compLogoUrl ? (
                                  <img
                                    src={compLogoUrl}
                                    alt={compFullName}
                                    className="w-4 h-4 rounded-full object-contain shrink-0"
                                  />
                                ) : (
                                  <span className="text-sm">
                                    {comp.logo || "🏢"}
                                  </span>
                                )}
                                <span className="truncate">{compFullName}</span>
                              </div>
                              {isCurrentActive && <Check size={12} />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="border-t border-border/50 py-1 shrink-0 mt-auto bg-surface-pressed/20">
                    <button
                      onClick={() => {
                        logout();
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs text-danger hover:bg-danger/10 flex items-center gap-2.5 transition-colors font-semibold cursor-pointer"
                    >
                      <LogOut size={14} /> Sign out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
    </>
  );
}
