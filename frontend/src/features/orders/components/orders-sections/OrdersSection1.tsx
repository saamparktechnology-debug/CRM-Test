"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Plus, 
  Download, 
  Search, 
  Filter, 
  Printer, 
  ShoppingBag, 
  Eye, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle,
  X,
  Check,
  Calendar,
  Building2,
  Receipt,
  BellRing,
  FileText,
  Users,
  Code2,
  Database,
  KeyRound,
  Layers,
  ArrowRight
} from "lucide-react"
import { fetchModuleDataFromDB, saveModuleDataToDB, markGlobalItemDeleted, filterGlobalDeletedItems } from "@/lib/storageSync"
import { useAuthStore, isMatchingCompany } from "@/store/useAuthStore"
import { addInvoice, getInvoices, InvoiceItem } from "@/features/invoice/services/invoiceService"
import { InvoiceModal } from "@/features/invoice/components/InvoiceModal"
import { addPayment } from "@/features/payments/services/paymentService"
import { sendPaymentDueReminderEmailNotification } from "@/services/emailNotificationService"
import { getOrders, addOrder, updateOrder, deleteOrder } from "@/features/orders/services/orderService"
import { getClients } from "@/features/clients/services/clientService"
import { getProjects } from "@/features/projects/services/projectService"
import { Project, ProjectMilestone } from "@/features/projects/types"
import { exportToExcel, printPDFReport, exportToCSV } from "@/lib/exportUtils"
import { formatDisplayDate } from "@/lib/utils"
import { confirmTwoStepDelete } from "@/lib/confirmDialog"
import { getUserAvatar } from "@/features/users/services/userService"
import { executeWithFeedback } from "@/store/useActionFeedbackStore"
import { isRecordAssignedToClient, isRecordAssignedToTeamMember } from "@/lib/clientScopeUtils"
import { usePermissionStore } from "@/store/usePermissionStore"
import { type OrderStatus, type PaymentStatus, type OrderItem, INITIAL_ORDERS } from "@/features/orders/components/orders-sections/OrdersHelpers"

export function OrdersSection1({ ctrl }: { ctrl: any }) {
  const { toastMessage, isClientRole, activeTab, displayedOrders, canAddOrder, setIsAddModalOpen, pendingCount, completedCount, totalValue, setActiveTab, searchQuery, setSearchQuery } = ctrl;
  return (
    <>
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-[99999] bg-zinc-900 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 border border-zinc-700"
          >
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------------- TOP HEADER ---------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
            <ShoppingBag className="text-blue-600 dark:text-blue-400" size={24} />
            <span>{isClientRole ? "My Orders & Deliverables" : "Order List"}</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            {isClientRole
              ? "Track your ongoing project milestones, order scopes, and estimated delivery dates."
              : "Manage real client orders, fulfillment timelines, payment reminders, and invoicing"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              exportToExcel({
                filename: "SAAMPARK_Sales_Orders",
                title: "Sales Orders Report",
                subtitle: activeTab === "all" ? "All Orders" : activeTab,
                headers: ["#", "Order #", "Client", "Project", "Total Amount", "Order Date", "Delivery Date", "Payment Status", "Order Status"],
                rows: displayedOrders.map((o, idx) => [
                  idx + 1,
                  o.orderNumber,
                  o.client,
                  o.project,
                  o.totalAmount,
                  o.orderDate,
                  o.deliveryDate,
                  o.paymentStatus,
                  o.status,
                ]),
              })
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-2xs cursor-pointer"
          >
            <Download size={13} className="text-emerald-600" />
            <span>Excel</span>
          </button>

          <button
            type="button"
            onClick={() => {
              printPDFReport({
                title: "Sales Orders Report",
                subtitle: activeTab === "all" ? "All Orders" : activeTab,
                headers: ["#", "Order #", "Client", "Project", "Total Amount", "Order Date", "Delivery Date", "Payment Status", "Status"],
                rows: displayedOrders.map((o, idx) => [
                  idx + 1,
                  o.orderNumber,
                  o.client,
                  o.project,
                  o.totalAmount,
                  o.orderDate,
                  o.deliveryDate,
                  o.paymentStatus,
                  o.status,
                ]),
              })
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-2xs cursor-pointer"
          >
            <Printer size={13} className="text-zinc-500" />
            <span>Print</span>
          </button>

          {canAddOrder && (
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              <Plus size={14} />
              <span>Add Order</span>
            </button>
          )}
        </div>
      </div>

      {/* ---------------- KPI CARDS ---------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-500 font-medium">{isClientRole ? "My Total Orders" : "Total Orders"}</p>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">{displayedOrders.length}</h3>
          </div>
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 rounded-lg">
            <ShoppingBag size={20} />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-500 font-medium">Processing / Pending</p>
            <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">{pendingCount}</h3>
          </div>
          <div className="p-2.5 bg-amber-50 dark:bg-amber-950/50 text-amber-600 rounded-lg">
            <Clock size={20} />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-500 font-medium">Completed</p>
            <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{completedCount}</h3>
          </div>
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 rounded-lg">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-500 font-medium">Total Value</p>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">₹{totalValue.toLocaleString("en-IN")}</h3>
          </div>
          <div className="p-2.5 bg-purple-50 dark:bg-purple-950/50 text-purple-600 rounded-lg">
            <Receipt size={20} />
          </div>
        </div>
      </div>

      {/* ---------------- FILTER TABS & SEARCH BAR ---------------- */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {(["all", "Pending", "Processing", "Completed", "Cancelled"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === tab
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-950/70 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              {tab === "all" ? "All Orders" : tab}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search orders, clients, projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400"
          />
          <Search size={14} className="absolute left-2.5 top-2 text-zinc-400" />
        </div>
      </div>

      {/* ---------------- ORDERS TABLE ---------------- */}
    </>
  );
}
