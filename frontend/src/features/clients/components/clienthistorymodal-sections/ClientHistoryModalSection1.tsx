"use client"

import * as React from "react"
import { 
  X, Briefcase, FileText, CheckCircle2, Clock, Calendar, AlertCircle, 
  Eye, FolderPlus, Building2, Mail, Phone, MapPin, CreditCard, ShoppingBag,
  User, Receipt, Shield, Tag, DollarSign, Trash2
} from "lucide-react"
import { ClientItem } from "@/features/clients/types"
import { formatDisplayEmail } from "@/features/clients/services/clientService"
import { getProjects, deleteProject } from "@/features/projects/services/projectService"
import { Project } from "@/features/projects/types"
import { getInvoices, deleteInvoice, InvoiceItem } from "@/features/invoice/services/invoiceService"
import { getPayments, deletePayment, PaymentItem } from "@/features/payments/services/paymentService"
import { fetchModuleDataFromDB, saveModuleDataToDB, markGlobalItemDeleted, filterGlobalDeletedItems } from "@/lib/storageSync"
import { useAuthStore } from "@/store/useAuthStore"
import { usePermissionStore } from "@/store/usePermissionStore"
import { confirmTwoStepDelete } from "@/lib/confirmDialog"
import { type ClientHistoryModalProps } from "@/features/clients/components/clienthistorymodal-sections/ClientHistoryModalHelpers"

export function ClientHistoryModalSection1({ ctrl }: { ctrl: any }) {
  const { client, onAddProjectForClient, onClose, clientProjects, displayInvoiced, displayPaid, displayDue, setActiveTab, activeTab, clientInvoices, clientOrders, clientPayments } = ctrl;
  return (
    <>
      {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-900/90 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              {client.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-100 tracking-tight">{client.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {client.group || "Standard"}
                </span>
                {client.label && (
                  <span 
                    style={{ backgroundColor: client.labelColor || "#3b82f6" }}
                    className="px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-2xs"
                  >
                    {client.label}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 font-medium mt-0.5">
                Primary Contact: <span className="text-zinc-800 dark:text-zinc-200 font-semibold">{client.primaryContact || client.name}</span>
                {client.companyName && <span> • {client.companyName}</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onAddProjectForClient && (
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onAddProjectForClient(client)
                }}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer"
              >
                <FolderPlus size={14} />
                <span>+ Add Project & Invoice</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Client Profile Details Card */}
        <div className="px-6 py-3.5 bg-zinc-50/50 dark:bg-zinc-800/40 border-b border-zinc-100 dark:border-zinc-800 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
              <Mail size={14} className="text-blue-500 shrink-0" />
              <div className="truncate">
                <span className="text-[10px] text-zinc-400 block">Email</span>
                <span className="font-semibold">{formatDisplayEmail(client.email) || "-"}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
              <Phone size={14} className="text-emerald-500 shrink-0" />
              <div>
                <span className="text-[10px] text-zinc-400 block">Phone</span>
                <span className="font-semibold">{client.phone || "No Phone Provided"}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
              <MapPin size={14} className="text-rose-500 shrink-0" />
              <div className="truncate">
                <span className="text-[10px] text-zinc-400 block">Address & City</span>
                <span className="font-semibold">
                  {[client.address, client.city, client.state].filter(Boolean).join(", ") || "No Address Provided"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
              <Receipt size={14} className="text-purple-500 shrink-0" />
              <div>
                <span className="text-[10px] text-zinc-400 block">GSTIN / Tax ID</span>
                <span className="font-semibold">{client.gstNumber || client.vatNumber || "Unregistered"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Financial KPI Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-zinc-200 dark:divide-zinc-800 bg-zinc-100/50 dark:bg-zinc-800/30 border-b border-zinc-200 dark:border-zinc-800 text-xs py-3 px-6">
          <div className="text-center">
            <span className="text-zinc-400 block text-[10px] font-semibold uppercase tracking-wider">Total Projects</span>
            <strong className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">{clientProjects.length}</strong>
          </div>
          <div className="text-center">
            <span className="text-zinc-400 block text-[10px] font-semibold uppercase tracking-wider">Total Invoiced</span>
            <strong className="text-sm font-extrabold text-blue-600 dark:text-blue-400">{displayInvoiced}</strong>
          </div>
          <div className="text-center">
            <span className="text-zinc-400 block text-[10px] font-semibold uppercase tracking-wider">Payment Received</span>
            <strong className="text-sm font-extrabold text-emerald-600">{displayPaid}</strong>
          </div>
          <div className="text-center">
            <span className="text-zinc-400 block text-[10px] font-semibold uppercase tracking-wider">Balance Due</span>
            <strong className={`text-sm font-extrabold ${displayDue !== "₹0" ? "text-rose-600" : "text-zinc-500"}`}>{displayDue}</strong>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-zinc-100 dark:border-zinc-800 shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("projects")}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === "projects"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            <Briefcase size={14} />
            <span>Projects ({clientProjects.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("invoices")}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === "invoices"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            <FileText size={14} />
            <span>Invoices & Billing ({clientInvoices.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === "orders"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            <ShoppingBag size={14} />
            <span>Orders ({clientOrders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("payments")}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === "payments"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            <CreditCard size={14} />
            <span>Payment Receipts ({clientPayments.length})</span>
          </button>
        </div>

        {/* Content Body */}
    </>
  );
}
