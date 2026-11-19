import { Role } from "@/store/useAuthStore"

export const ALL_APP_MODULES = [
  // CRM & Sales
  'Leads',
  'Clients',
  'Quotations',
  'Estimates',
  'Invoices',
  'Payments',

  // Digital Marketing
  'Digital Marketing',

  // Projects & Operations
  'Projects',
  'Tasks',

  // Subscriptions & Retainers
  'Subscriptions',
  'EMI',

  // HR & Workforce
  'Teams',
  'Attendance',
  'Leave',
  'Payroll',

  // Support & Communication
  'Tickets',
  'Knowledge base',
  'Messages',
  'Events',
  'Notes',
  'Files',

  // Organisation & Administration
  'Dashboard',
  'Companies',
  'Branches',
  'Departments',
  'Approvals',
  'Users',
  'Permissions',
  'Expenses',
  'Reports',
  'Settings',
  'Activity Logs',
] as const

export type AppModuleName = typeof ALL_APP_MODULES[number]
export type ModuleName = AppModuleName | string

// Configurable modules (Dashboard is global view)
export const CONFIGURABLE_MODULES = ALL_APP_MODULES.filter(m => m !== 'Dashboard')
export const ALL_MODULE_NAMES = CONFIGURABLE_MODULES
export const ALL_NAV_MODULES = ALL_APP_MODULES

// Core CRUD actions
export const ALL_ACTIONS = ['view', 'add', 'edit', 'delete'] as const
export type ActionType = typeof ALL_ACTIONS[number]

export interface ModuleActionFlags {
  view: boolean
  add: boolean
  edit: boolean
  delete: boolean
  lockUnlock?: boolean // Sub-permission for locking and unlocking leads
  [key: string]: boolean | undefined
}

export const MODULE_ACTION_CONFIG: Record<string, { view: boolean; add: boolean; edit: boolean; delete: boolean; hasAdd: boolean; hasEdit: boolean; hasDelete: boolean; description: string }> = ALL_APP_MODULES.reduce((acc, mod) => {
  acc[mod] = {
    view: true,
    add: true,
    edit: true,
    delete: true,
    hasAdd: true,
    hasEdit: true,
    hasDelete: true,
    description: `Manage ${mod} records with view, add, edit, delete capabilities`
  }
  return acc
}, {} as any)

// Clean module categories for intuitive UI display
export const CLEAN_MODULE_CATEGORIES: Record<string, { label: string; icon: string; modules: { key: string; name: string; description: string }[] }> = {
  crm: {
    label: "CRM & Sales Pipeline",
    icon: "Target",
    modules: [
      { key: "Leads", name: "Leads", description: "Telecalling pipeline, cold leads & status progression" },
      { key: "Clients", name: "Clients", description: "Client accounts, contact directories & profiles" },
      { key: "Quotations", name: "Quotations", description: "Itemized formal customer price quotes" },
      { key: "Estimates", name: "Estimates", description: "Dynamic cost estimations with tax calculations" },
      { key: "Invoices", name: "Invoices", description: "Tax invoices, billing releases & payment tracking" },
      { key: "Payments", name: "Payments", description: "Payment collections, bank receipts & ledger" },
    ]
  },
  marketing: {
    label: "Digital Marketing & Campaigns",
    icon: "Megaphone",
    modules: [
      { key: "Digital Marketing", name: "Digital Marketing", description: "Monthly retainers, social media ads, deliverables & campaign analytics" },
    ]
  },
  projects: {
    label: "Projects & Tasks",
    icon: "KanbanSquare",
    modules: [
      { key: "Projects", name: "Projects", description: "Client deliverables, execution phases & progress" },
      { key: "Tasks", name: "Tasks", description: "Kanban task boards, milestones & priorities" },
    ]
  },
  subscriptions: {
    label: "Subscriptions & EMI",
    icon: "CreditCard",
    modules: [
      { key: "Subscriptions", name: "Subscriptions", description: "Recurring retainers and recurring billing cycles" },
      { key: "EMI", name: "EMI Milestone Plans", description: "Installment payment contracts and milestones" },
    ]
  },
  hr: {
    label: "HR & Workforce Management",
    icon: "UserCheck",
    modules: [
      { key: "Teams", name: "Teams & Members", description: "Staff directory, profiles & bank details" },
      { key: "Attendance", name: "Attendance & Timecards", description: "Real-time shift punch clock and timesheets" },
      { key: "Leave", name: "Leave Management", description: "Leave requests, balances & annual holidays" },
      { key: "Payroll", name: "Payroll & Payouts", description: "Monthly salary calculations, payslips & payouts" },
    ]
  },
  support: {
    label: "Support & Communication",
    icon: "HeadphonesIcon",
    modules: [
      { key: "Tickets", name: "Tickets", description: "Customer support tickets, SLAs & resolutions" },
      { key: "Knowledge base", name: "Knowledge Base", description: "Help center articles, FAQs & tutorials" },
      { key: "Messages", name: "Messages", description: "Real-time internal and team live messaging" },
      { key: "Events", name: "Events", description: "Shared corporate calendar and milestone reminders" },
      { key: "Notes", name: "Notes", description: "Global announcements and scratchpads" },
      { key: "Files", name: "Files", description: "Cloud documents, attachments & vault" },
    ]
  },
  company: {
    label: "Company & Organisation Governance",
    icon: "Building2",
    modules: [
      { key: "Companies", name: "Companies", description: "Multi-tenant company profiles, branding & live preview studio" },
      { key: "Branches", name: "Branches", description: "Branch offices, locations & regional franchise centers" },
      { key: "Departments", name: "Departments", description: "Corporate business units & divisions" },
      { key: "Approvals", name: "Approvals", description: "Hierarchical document approvals (Company HQ, Branch, Sub-branch)" },
    ]
  },
  admin: {
    label: "System & Administration",
    icon: "Shield",
    modules: [
      { key: "Users", name: "Users", description: "User account credentials and login management" },
      { key: "Permissions", name: "Permissions", description: "Role-based access control and matrices" },
      { key: "Expenses", name: "Expenses", description: "Operating overheads, approvals & claims" },
      { key: "Reports", name: "Reports", description: "Financial audits, P&L exports & analytics" },
      { key: "Settings", name: "Settings", description: "Workspace preferences and system configuration" },
      { key: "Activity Logs", name: "Activity Logs", description: "Tamper-evident system activity and login logs" },
    ]
  }
}

export const DEFAULT_FULL_ACTIONS: ModuleActionFlags = {
  view: true,
  add: true,
  edit: true,
  delete: true,
  lockUnlock: true,
}

export const DEFAULT_VIEW_ONLY_ACTIONS: ModuleActionFlags = {
  view: true,
  add: false,
  edit: false,
  delete: false,
  lockUnlock: false,
}

export const DEFAULT_NO_ACTIONS: ModuleActionFlags = {
  view: false,
  add: false,
  edit: false,
  delete: false,
  lockUnlock: false,
}

// Role normalization helper
export function normalizeRole(role: string): Role {
  if (!role) return 'Teams'
  const lower = role.toLowerCase().trim()
  if (lower.includes('super')) return 'Super Admin'
  if (lower.includes('admin')) return 'Admin'
  if (lower.includes('client')) return 'Clients'
  if (lower.includes('team') || lower.includes('user') || lower.includes('employee') || lower.includes('manager')) return 'Teams'
  return 'Teams'
}

export const DEFAULT_ROLE_PERMISSIONS: Record<Role, ModuleName[]> = {
  'Super Admin': [...ALL_APP_MODULES],
  'Admin': [...ALL_APP_MODULES],
  'Teams': [
    'Dashboard', 'Leads', 'Clients', 'Quotations', 'Estimates',
    'Invoices', 'Payments', 'Digital Marketing', 'Projects',
    'Tasks', 'Teams', 'Attendance', 'Leave', 'Tickets', 'Knowledge base',
    'Messages', 'Events', 'Notes', 'Files', 'Expenses', 'Reports', 'Settings'
  ],
  'Clients': [
    'Dashboard', 'Projects', 'Tasks', 'Subscriptions', 'EMI', 'Invoices',
    'Quotations', 'Digital Marketing',
    'Payments', 'Tickets', 'Knowledge base', 'Messages', 'Files', 'Settings',
    'Leads', 'Estimates'
  ]
}

export const DEFAULT_ROLE_ACTION_PERMISSIONS: Record<Role, Record<string, ModuleActionFlags>> = {
  'Super Admin': (() => {
    const init: Record<string, ModuleActionFlags> = {}
    CONFIGURABLE_MODULES.forEach((m) => { init[m] = { ...DEFAULT_FULL_ACTIONS } })
    init['Leads'] = { view: true, add: true, edit: true, delete: true, lockUnlock: true }
    return init
  })(),
  'Admin': (() => {
    const init: Record<string, ModuleActionFlags> = {}
    CONFIGURABLE_MODULES.forEach((m) => {
      init[m] = { view: true, add: true, edit: true, delete: true, lockUnlock: false }
    })
    init['Leads'] = { view: true, add: true, edit: true, delete: true, lockUnlock: true }
    return init
  })(),
  'Teams': (() => {
    const init: Record<string, ModuleActionFlags> = {}
    CONFIGURABLE_MODULES.forEach((m) => {
      const isRestricted = ['Companies', 'Branches', 'Permissions', 'Payroll', 'Settings'].includes(m)
      init[m] = {
        view: !isRestricted,
        add: !isRestricted,
        edit: !isRestricted,
        delete: false,
        lockUnlock: false,
      }
    })
    init['Leads'] = { view: true, add: true, edit: true, delete: false, lockUnlock: false }
    return init
  })(),
  'Clients': (() => {
    const init: Record<string, ModuleActionFlags> = {}
    const clientAllowed = [
      'Dashboard', 'Projects', 'Tasks', 'Subscriptions', 'EMI', 'Invoices',
      'Quotations', 'Digital Marketing',
      'Tickets', 'Knowledge base', 'Messages', 'Files', 'Leads', 'Estimates', 'Payments'
    ]
    CONFIGURABLE_MODULES.forEach((m) => {
      const allowed = clientAllowed.includes(m)
      init[m] = {
        view: allowed,
        add: ['Tickets', 'Messages', 'Leads'].includes(m),
        edit: ['Tickets', 'Leads'].includes(m),
        delete: false,
        lockUnlock: false,
      }
    })
    init['Leads'] = { view: true, add: true, edit: true, delete: false, lockUnlock: false }
    return init
  })(),
}

