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

export function ClientHistoryModalSection2({ ctrl }: { ctrl: any }) {
  const { isLoading, activeTab, clientProjects, client, onAddProjectForClient, onClose, canDeleteProjects, handleDeleteProject, clientInvoices, onSelectInvoice, canDeleteInvoices, handleDeleteInvoice, clientOrders, canDeleteOrders, handleDeleteOrder, clientPayments, canDeletePayments, handleDeletePayment } = ctrl;
  return (
    <>
      <div className="flex-1 overflow-y-auto p-6 text-xs space-y-4">
          
          {isLoading ? (
            <div className="py-16 text-center text-zinc-400 font-medium">Loading full client history...</div>
          ) : activeTab === "projects" ? (
            clientProjects.length === 0 ? (
              <div className="py-12 text-center text-zinc-400 space-y-3">
                <p className="font-medium">No projects found for {client.name}.</p>
                {onAddProjectForClient && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose()
                      onAddProjectForClient(client)
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs cursor-pointer shadow-md shadow-blue-500/20"
                  >
                    + Create First Project
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Project Title</th>
                      <th className="py-3 px-4">Price / Deal</th>
                      <th className="py-3 px-4">Start Date</th>
                      <th className="py-3 px-4">Target Release</th>
                      <th className="py-3 px-4">Progress</th>
                      <th className="py-3 px-4">Payment</th>
                      <th className="py-3 px-4">Status</th>
                      {canDeleteProjects && <th className="py-3 px-4 text-right">Action</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-medium text-zinc-800 dark:text-zinc-200">
                    {clientProjects.map((p) => (
                      <tr key={p.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40">
                        <td className="py-3.5 px-4 font-bold text-blue-600 dark:text-blue-400">
                          {p.title}
                        </td>
                        <td className="py-3.5 px-4 font-semibold">{p.price || (p.totalAmount ? `₹${p.totalAmount.toLocaleString("en-IN")}` : "₹0")}</td>
                        <td className="py-3.5 px-4 text-zinc-500">{p.startDate}</td>
                        <td className="py-3.5 px-4 text-zinc-500">{p.deadline}</td>
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400">{p.progress}%</span>
                            <div className="w-20 bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${p.status === "Completed" || p.status === "Finished" ? "bg-emerald-500" : "bg-blue-600"}`}
                                style={{ width: `${p.progress}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.paymentStatus === "Paid"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300"
                          }`}>
                            {p.paymentStatus || "Pending"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            p.status === "Completed" || p.status === "Finished"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300"
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        {canDeleteProjects && (
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteProject(p.id, p.title)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                              title="Delete Project & Cascaded Invoices/Orders"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : activeTab === "invoices" ? (
            clientInvoices.length === 0 ? (
              <div className="py-12 text-center text-zinc-400">No invoices generated for {client.name} yet.</div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Invoice ID</th>
                      <th className="py-3 px-4">Project</th>
                      <th className="py-3 px-4">Bill Date</th>
                      <th className="py-3 px-4">Due Date</th>
                      <th className="py-3 px-4">Total Amount</th>
                      <th className="py-3 px-4">Paid</th>
                      <th className="py-3 px-4">Due</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-medium text-zinc-800 dark:text-zinc-200">
                    {clientInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40">
                        <td className="py-3.5 px-4 font-bold text-blue-600 dark:text-blue-400">{inv.id}</td>
                        <td className="py-3.5 px-4 truncate max-w-[160px]">{inv.project}</td>
                        <td className="py-3.5 px-4 text-zinc-500 font-mono text-[11px]">{inv.billDate}</td>
                        <td className="py-3.5 px-4 text-zinc-500 font-mono text-[11px]">{inv.dueDate}</td>
                        <td className="py-3.5 px-4 font-bold text-zinc-900 dark:text-zinc-100">{inv.totalInvoiced}</td>
                        <td className="py-3.5 px-4 font-semibold text-emerald-600">{inv.paymentReceived}</td>
                        <td className="py-3.5 px-4 font-semibold text-rose-600">{inv.due}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            inv.status === "Fully paid"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-300"
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                if (onSelectInvoice) onSelectInvoice(inv)
                              }}
                              className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1 text-[11px] border border-blue-200/60 cursor-pointer hover:bg-blue-100"
                              title="View Tax Invoice"
                            >
                              <Eye size={13} />
                              <span>View</span>
                            </button>
                            {canDeleteInvoices && (
                              <button
                                type="button"
                                onClick={() => handleDeleteInvoice(inv.id)}
                                className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                                title="Delete Invoice"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : activeTab === "orders" ? (
            clientOrders.length === 0 ? (
              <div className="py-12 text-center text-zinc-400">No orders registered for {client.name} yet.</div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Order ID</th>
                      <th className="py-3 px-4">Project / Service</th>
                      <th className="py-3 px-4">Order Date</th>
                      <th className="py-3 px-4">Delivery Date</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Payment</th>
                      <th className="py-3 px-4">Status</th>
                      {canDeleteOrders && <th className="py-3 px-4 text-right">Action</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-medium text-zinc-800 dark:text-zinc-200">
                    {clientOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40">
                        <td className="py-3.5 px-4 font-bold text-blue-600 dark:text-blue-400">{ord.orderNumber || ord.id}</td>
                        <td className="py-3.5 px-4 truncate max-w-[180px]">{ord.project}</td>
                        <td className="py-3.5 px-4 text-zinc-500 font-mono text-[11px]">{ord.orderDate}</td>
                        <td className="py-3.5 px-4 text-zinc-500 font-mono text-[11px]">{ord.deliveryDate}</td>
                        <td className="py-3.5 px-4 font-bold">{ord.totalAmount}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            ord.paymentStatus === "Paid"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                          }`}>
                            {ord.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                            {ord.status}
                          </span>
                        </td>
                        {canDeleteOrders && (
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteOrder(ord.id || ord.orderNumber)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                              title="Delete Order"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            clientPayments.length === 0 ? (
              <div className="py-12 text-center text-zinc-400">No payment records found for {client.name}.</div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Receipt ID</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Amount Paid</th>
                      <th className="py-3 px-4">Payment Method</th>
                      <th className="py-3 px-4">Transaction Ref</th>
                      <th className="py-3 px-4">Note / Description</th>
                      <th className="py-3 px-4">Status</th>
                      {canDeletePayments && <th className="py-3 px-4 text-right">Action</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-medium text-zinc-800 dark:text-zinc-200">
                    {clientPayments.map((pay) => (
                      <tr key={pay.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40">
                        <td className="py-3.5 px-4 font-bold text-blue-600 dark:text-blue-400">{pay.id}</td>
                        <td className="py-3.5 px-4 text-zinc-500 font-mono text-[11px]">{pay.paymentDate}</td>
                        <td className="py-3.5 px-4 font-bold text-emerald-600">{pay.amount}</td>
                        <td className="py-3.5 px-4">{pay.paymentMethod}</td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-500">{pay.transactionRef || "-"}</td>
                        <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-400 max-w-[200px] truncate">{pay.note}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            {pay.status}
                          </span>
                        </td>
                        {canDeletePayments && (
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeletePayment(pay.id)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                              title="Delete Payment Record"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

        </div>
    </>
  );
}
