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
  Database,
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

export function SaamparkVortexLogo({
  className = "w-8 h-8",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle
        cx="50"
        cy="50"
        r="46"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="2"
      />
      <g transform="translate(50,50)">
        {[
          { angle: 0, color: "#2563EB" },
          { angle: 45, color: "#06B6D4" },
          { angle: 90, color: "#10B981" },
          { angle: 135, color: "#84CC16" },
          { angle: 180, color: "#EAB308" },
          { angle: 225, color: "#F97316" },
          { angle: 270, color: "#EF4444" },
          { angle: 315, color: "#8B5CF6" },
        ].map((petal, i) => (
          <path
            key={i}
            d="M 0 -10 C 12 -28, 24 -34, 32 -20 C 38 -8, 28 0, 0 0 Z"
            fill={petal.color}
            transform={`rotate(${petal.angle})`}
            opacity="0.95"
          />
        ))}
        <circle
          cx="0"
          cy="0"
          r="8"
          fill="#0B132B"
          stroke="#ffffff"
          strokeWidth="2"
        />
      </g>
    </svg>
  );
}

export interface SubNavItem {
  name: string;
  href: string;
  icon: any;
}

export interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge?: number;
  subItems?: SubNavItem[];
}

export const ALL_NAV_ITEMS: NavItem[] = [
  { name: "Dashboard", href: "/feature/dashboard", icon: LayoutDashboard },
  { name: "Users", href: "/feature/users", icon: Users },
  {
    name: "CRM",
    href: "/feature/leads",
    icon: Target,
    subItems: [
      { name: "Leads", href: "/feature/leads", icon: Target },
      { name: "Clients", href: "/feature/clients", icon: Briefcase },
    ],
  },
  {
    name: "Projects",
    href: "/feature/projects",
    icon: KanbanSquare,
  },
  { name: "Tasks", href: "/feature/tasks", icon: CheckSquare },
  {
    name: "Digital Marketing",
    href: "/feature/marketing",
    icon: BarChart3,
    subItems: [
      { name: "Client Marketing Report", href: "/feature/marketing", icon: BarChart3 },
      { name: "Marketing Plans & Retainers", href: "/feature/marketing/plans", icon: Sparkles },
      { name: "Posts & Deliverables", href: "/feature/marketing/posts", icon: FileText },
      { name: "Marketing Leads & Ads", href: "/feature/marketing/leads", icon: Target },
    ],
  },
  {
    name: "Sales",
    href: "/feature/sales/invoices",
    icon: ShoppingCart,
    subItems: [
      { name: "Quotations", href: "/feature/quotations", icon: FileOutput },
      { name: "Estimates", href: "/feature/estimates", icon: Calculator },
      { name: "Invoices", href: "/feature/sales/invoices", icon: FileText },
      { name: "Payments", href: "/feature/sales/payments", icon: CreditCard },
    ],
  },
  {
    name: "Manage Ecommerce",
    href: "/feature/ecommerce/products",
    icon: ShoppingBag,
    subItems: [
      { name: "Manage Products", href: "/feature/ecommerce/products", icon: Package },
      { name: "Manage Orders", href: "/feature/ecommerce/orders", icon: Boxes },
      { name: "Manage Storefront", href: "/feature/ecommerce/storefront", icon: Warehouse },
    ],
  },
  { name: "Approvals", href: "/feature/approvals", icon: ShieldCheck },
  {
    name: "Subscriptions",
    href: "/feature/subscriptions",
    icon: CreditCard,
    subItems: [
      {
        name: "Packages & Retainers",
        href: "/feature/subscriptions",
        icon: CreditCard,
      },
      { name: "EMI Milestone Plans", href: "/feature/emi", icon: Receipt },
    ],
  },
  {
    name: "HR & Employees",
    href: "/feature/team/members",
    icon: UserCheck,
    subItems: [
      { name: "Team Members", href: "/feature/team/members", icon: UserCheck },
      {
        name: "Payments & Payroll",
        href: "/feature/team/payments",
        icon: DollarSign,
      },
      { name: "Leave Management", href: "/feature/team/leave", icon: Calendar },
      {
        name: "Attendance & Timecards",
        href: "/feature/team/timecards",
        icon: Clock,
      },
    ],
  },
  {
    name: "Support",
    href: "/feature/tickets",
    icon: HeadphonesIcon,
    subItems: [
      { name: "Tickets", href: "/feature/tickets", icon: HeadphonesIcon },
      {
        name: "Knowledge Base",
        href: "/feature/knowledge-base",
        icon: LifeBuoy,
      },
    ],
  },
  { name: "Events", href: "/feature/events", icon: Calendar },
  { name: "Notes", href: "/feature/notes", icon: Book },
  { name: "Messages", href: "/feature/messages", icon: MessageSquare },
  { name: "Files", href: "/feature/files", icon: Folder },
  { name: "Expenses", href: "/feature/expenses", icon: Calculator },
  { name: "Reports", href: "/feature/reports", icon: BarChart3 },
  {
    name: "Settings",
    href: "/feature/settings",
    icon: Settings,
    subItems: [
      { name: "General Settings", href: "/feature/settings", icon: Settings },
      { name: "Master Data", href: "/feature/masters", icon: Database },
      { name: "Companies", href: "/feature/companies", icon: Building2 },
      { name: "Branches", href: "/feature/branches", icon: GitBranch },
      { name: "Departments", href: "/feature/departments", icon: Briefcase },
      { name: "Teams", href: "/feature/teams", icon: UserCheck },
      { name: "Permissions", href: "/feature/permissions", icon: Shield },
    ],
  },
  {
    name: "Activity Logs",
    href: "/feature/activity-logs",
    icon: ClipboardList,
  },
];
