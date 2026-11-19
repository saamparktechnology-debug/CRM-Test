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

export function OrdersSection2({ ctrl }: { ctrl: any }) {
  const { filteredOrders, setSelectedOrder, setIsDetailModalOpen, canEditOrder, handleSendReminder, handleMarkPaymentCompleted, handleGenerateInvoice, canDeleteOrder, handleDeleteOrder } = ctrl;
  return (
    <>
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-600 dark:text-zinc-300">
            <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Project / Service</th>
                <th className="py-3 px-4">Order Date</th>
                <th className="py-3 px-4">Delivery Date</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-medium">
              {filteredOrders.map((ord) => {
                let statusBadge = "bg-zinc-100 text-zinc-700 border-zinc-200"
                if (ord.status === "Completed") statusBadge = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                if (ord.status === "Processing") statusBadge = "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800"
                if (ord.status === "Pending") statusBadge = "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
                if (ord.status === "Cancelled") statusBadge = "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800"

                let paymentBadge = "bg-zinc-100 text-zinc-700"
                if (ord.paymentStatus === "Paid") paymentBadge = "bg-emerald-50 text-emerald-600 font-semibold"
                if (ord.paymentStatus === "Partially paid") paymentBadge = "bg-blue-50 text-blue-600 font-semibold"
                if (ord.paymentStatus === "Unpaid") paymentBadge = "bg-rose-50 text-rose-600 font-semibold"

                const isUnpaid = ord.paymentStatus !== "Paid"

                return (
                  <tr 
                    key={ord.id}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedOrder(ord)
                          setIsDetailModalOpen(true)
                        }}
                        className="hover:underline cursor-pointer"
                      >
                        {ord.orderNumber}
                      </button>
                    </td>
                    <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-100">
                      <div>{ord.client}</div>
                      <div className="text-[11px] text-zinc-400 font-normal">{ord.clientEmail}</div>
                    </td>
                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400 max-w-[200px] truncate">
                      {ord.project}
                    </td>
                    <td className="py-3 px-4 text-zinc-500 font-mono text-[11px]">
                      {formatDisplayDate(ord.orderDate)}
                    </td>
                    <td className="py-3 px-4 text-zinc-500 font-mono text-[11px]">
                      {formatDisplayDate(ord.deliveryDate)}
                    </td>
                    <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100">
                      {ord.totalAmount}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] ${paymentBadge}`}>
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded text-[11px] font-semibold border ${statusBadge}`}>
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        {canEditOrder && isUnpaid && (
                          <button
                            type="button"
                            onClick={() => handleSendReminder(ord)}
                            className="px-2 py-1 rounded bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 hover:bg-amber-100 text-[10px] font-semibold flex items-center gap-1 border border-amber-200"
                            title="Send payment reminder to client"
                          >
                            <BellRing size={11} className="text-amber-600" />
                            <span>Remind</span>
                          </button>
                        )}

                        {canEditOrder && isUnpaid && (
                          <button
                            type="button"
                            onClick={() => handleMarkPaymentCompleted(ord)}
                            className="px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-[10px] font-semibold flex items-center gap-1 border border-emerald-200"
                            title="Mark payment as completed"
                          >
                            <CheckCircle2 size={11} className="text-emerald-600" />
                            <span>Paid</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleGenerateInvoice(ord)}
                          className="p-1 hover:text-blue-600 transition-colors cursor-pointer"
                          title="Generate / View Tax Invoice"
                        >
                          <FileText size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOrder(ord)
                            setIsDetailModalOpen(true)
                          }}
                          className="p-1 hover:text-blue-600 transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>

                        {canDeleteOrder && (
                          <button
                            type="button"
                            onClick={() => handleDeleteOrder(ord.id)}
                            className="p-1 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Delete Order"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-zinc-400">
                    No orders found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------------- ORDER & PROJECT LIVE OVERVIEW MODAL ---------------- */}
    </>
  );
}
