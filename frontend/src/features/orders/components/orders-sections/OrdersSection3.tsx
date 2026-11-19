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

export function OrdersSection3({ ctrl }: { ctrl: any }) {
  const { isDetailModalOpen, selectedOrder, projectsList, invoicesList, setIsDetailModalOpen, handleGenerateInvoice } = ctrl;
  return (
    <>
      <AnimatePresence>
        {isDetailModalOpen && selectedOrder && (() => {
          const linkedProject = projectsList.find(
            (p) =>
              p.title.toLowerCase().trim() === selectedOrder.project.toLowerCase().trim() ||
              (selectedOrder.client && p.client.toLowerCase().trim() === selectedOrder.client.toLowerCase().trim())
          )
          const linkedInvoice = invoicesList.find(
            (i) =>
              (selectedOrder.invoiceId && i.id === selectedOrder.invoiceId) ||
              i.project.toLowerCase().trim() === selectedOrder.project.toLowerCase().trim() ||
              (selectedOrder.client && i.client.toLowerCase().trim() === selectedOrder.client.toLowerCase().trim())
          )

          const progressVal = linkedProject?.progress ?? (selectedOrder.status === "Completed" ? 100 : 35)
          const milestones = linkedProject?.milestones || [
            {
              id: "ms_fe_demo",
              title: "Frontend Development & UI",
              stage: "Frontend" as const,
              status: progressVal >= 50 ? ("Completed" as const) : ("In Progress" as const),
              notes: "Next.js UI components, responsive layout & client dashboard",
              updatedBy: linkedProject?.members?.[0]?.name || "Assigned Developer",
              updatedAt: new Date().toISOString(),
            },
            {
              id: "ms_be_demo",
              title: "Backend API & Database Integration",
              stage: "Backend" as const,
              status: progressVal === 100 ? ("Completed" as const) : ("In Progress" as const),
              notes: "REST API endpoints, MySQL database sync & authentication",
              updatedBy: linkedProject?.members?.[0]?.name || "Assigned Developer",
              updatedAt: new Date().toISOString(),
            }
          ]

          const advancePaid = linkedInvoice?.paymentReceived || (selectedOrder.paymentStatus === "Paid" ? selectedOrder.totalAmount : "₹0")
          const balanceDue = linkedInvoice?.due || (selectedOrder.paymentStatus === "Paid" ? "₹0" : selectedOrder.totalAmount)

          return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                      <ShoppingBag size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                          {selectedOrder.orderNumber}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100/80 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                          {selectedOrder.project}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Client: <strong className="text-zinc-700 dark:text-zinc-300">{selectedOrder.client}</strong> ({selectedOrder.clientEmail || "No email"})
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsDetailModalOpen(false)}
                    className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 rounded-lg transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
                  
                  {/* Financial & Delivery Stats Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                    <div>
                      <span className="text-zinc-400 text-[11px] block">Gross Total</span>
                      <p className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 mt-0.5">{selectedOrder.totalAmount}</p>
                    </div>
                    <div>
                      <span className="text-zinc-400 text-[11px] block">Advance Received</span>
                      <p className="font-bold text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">{advancePaid}</p>
                    </div>
                    <div>
                      <span className="text-zinc-400 text-[11px] block">Balance Due</span>
                      <p className="font-bold text-xs text-amber-600 dark:text-amber-400 mt-0.5">{balanceDue}</p>
                    </div>
                    <div>
                      <span className="text-zinc-400 text-[11px] block">Delivery Due Date</span>
                      <p className="font-medium text-xs text-zinc-700 dark:text-zinc-300 mt-0.5">{formatDisplayDate(selectedOrder.deliveryDate)}</p>
                    </div>
                  </div>

                  {/* Live Project Progress & Administration Box */}
                  <div className="p-4 rounded-2xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Layers size={16} className="text-blue-600 shrink-0" />
                        <div>
                          <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                            Linked Project: {linkedProject?.title || selectedOrder.project}
                          </h4>
                          <p className="text-[10px] text-zinc-500">
                            Billed By: <strong className="text-zinc-700 dark:text-zinc-300">{linkedProject?.billedBy || "Admin In-Charge"}</strong>
                            {linkedProject?.deadline && (
                              <span> • Deadline: <strong className="text-red-600 dark:text-red-400 font-bold font-mono">{formatDisplayDate(linkedProject.deadline)}</strong></span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          selectedOrder.paymentStatus === "Paid"
                            ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                            : selectedOrder.paymentStatus === "Partially paid"
                            ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                            : "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300"
                        }`}>
                          Payment: {selectedOrder.paymentStatus}
                        </span>

                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                          Status: {linkedProject?.status || selectedOrder.status}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[11px] font-semibold text-zinc-600 dark:text-zinc-300">
                        <span>Development Completion</span>
                        <span>{progressVal}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${progressVal}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Assigned Team Members Section */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <Users size={14} className="text-blue-600" />
                      <span>Assigned Development Team</span>
                    </h4>

                    {(!linkedProject?.members || linkedProject.members.length === 0) ? (
                      <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-dashed border-zinc-200 dark:border-zinc-700 text-zinc-400 text-center text-xs">
                        No team member assigned yet. (Admin can assign developer in Projects section)
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {linkedProject.members.map((m) => (
                          <div
                            key={m.id}
                            className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800"
                          >
                            <img
                              src={(m as any).avatarUrl || m.avatar || getUserAvatar(m.name, undefined, m.name)}
                              alt={m.name}
                              className="w-8 h-8 rounded-full object-cover bg-surface border border-border shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-xs text-zinc-800 dark:text-zinc-200 truncate">{m.name}</p>
                              <p className="text-[10px] text-blue-600 dark:text-blue-400 truncate">{m.role || "Developer"}</p>
                            </div>
                            {m.email && (
                              <span className="text-[9px] text-zinc-400 font-mono truncate max-w-[100px]">{m.email}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Developer Progress Updates & Custom Milestones */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                      <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                        <Code2 size={14} className="text-emerald-600" />
                        <span>Live Developer Milestone Checkpoints</span>
                      </h4>
                      <span className="text-[10px] text-zinc-400">
                        Updated directly by assigned developers
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {milestones.map((ms) => {
                        const isDone = ms.status === "Completed"
                        return (
                          <div
                            key={ms.id}
                            className="p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-700/80 bg-zinc-50/40 dark:bg-zinc-800/20 space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className={`p-1 rounded-md ${
                                  isDone
                                    ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-600"
                                    : "bg-blue-100 dark:bg-blue-950 text-blue-600"
                                }`}>
                                  {ms.stage === "Frontend" ? <Code2 size={12} /> : ms.stage === "Backend" ? <Database size={12} /> : ms.stage === "Credentials" ? <KeyRound size={12} /> : <CheckCircle2 size={12} />}
                                </span>
                                <span className="font-bold text-xs text-zinc-800 dark:text-zinc-200">{ms.title}</span>
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 font-semibold">
                                  {ms.stage}
                                </span>
                              </div>

                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isDone
                                  ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                                  : "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                              }`}>
                                {ms.status}
                              </span>
                            </div>

                            {ms.notes && (
                              <p className="text-[11px] text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-800 p-2 rounded-lg border border-zinc-100 dark:border-zinc-700 leading-relaxed">
                                💬 <strong>Dev Note:</strong> {ms.notes}
                              </p>
                            )}

                            {ms.credentials && (
                              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-[11px] text-amber-900 dark:text-amber-200 font-mono">
                                🔑 <strong>Access / Staging:</strong> {ms.credentials}
                              </div>
                            )}

                            {ms.updatedBy && (
                              <p className="text-[9px] text-zinc-400 text-right">
                                Recorded by <strong>{ms.updatedBy}</strong>
                              </p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Order Notes */}
                  {selectedOrder.notes && (
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-100 dark:border-zinc-800 space-y-1">
                      <span className="text-zinc-400 text-[11px] font-medium">Order Notes & Scope</span>
                      <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">{selectedOrder.notes}</p>
                    </div>
                  )}

                </div>

                {/* Modal Footer Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleGenerateInvoice(selectedOrder)
                        setIsDetailModalOpen(false)
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-xl hover:bg-blue-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileText size={13} />
                      <span>View / Print Invoice</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsDetailModalOpen(false)}
                    className="px-5 py-2 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-2xs cursor-pointer"
                  >
                    Close Overview
                  </button>
                </div>
              </motion.div>
            </div>
          )
        })()}
      </AnimatePresence>
    </>
  );
}
