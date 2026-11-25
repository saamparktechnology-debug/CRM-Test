"use client";

import * as React from "react";
import { X, CheckCircle2, Clock, FileText, ExternalLink, ShieldCheck, User, Mail, Phone, MapPin, Building2, Package, ArrowRight } from "lucide-react";
import { EcommerceOrder, EcommerceOrderStatus } from "../types/ecommerce.types";

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: EcommerceOrder | null;
  onStatusChange: (orderId: string, newStatus: EcommerceOrderStatus) => Promise<void>;
  onOpenGenerateInvoice: (order: EcommerceOrder) => void;
}

export function OrderDetailsModal({
  isOpen,
  onClose,
  order,
  onStatusChange,
  onOpenGenerateInvoice,
}: OrderDetailsModalProps) {
  if (!isOpen || !order) return null;

  const isConsult = order.companyId === "consultancy";
  const companyTitle = isConsult ? "SAAMPARK CONSULTANCY SERVICE" : "SAAMPARK TECHNOLOGY & RESEARCH";

  const getStepStatus = (stepIndex: number) => {
    // Step 0: Order Pending, Step 1: Invoice Created, Step 2: Order Processed
    if (order.status === "Cancelled") return "cancelled";
    if (order.status === "Order Processed") return "completed";
    if (order.status === "Invoice Created") {
      if (stepIndex <= 1) return "completed";
      return "upcoming";
    }
    // Order Pending
    if (stepIndex === 0) return "active";
    return "upcoming";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isConsult ? "bg-orange-500/10 text-orange-600 dark:text-orange-400" : "bg-blue-500/10 text-blue-600 dark:text-blue-400"}`}>
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Order #{order.orderNumber}
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  order.status === "Invoice Created"
                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                    : order.status === "Order Processed"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    : order.status === "Cancelled"
                    ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                }`}>
                  {order.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {companyTitle} &bull; Placed on {order.orderDate}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* 3-Step Live Order Pipeline Tracker */}
          <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
              Order Fulfillment Lifecycle
            </h4>

            <div className="grid grid-cols-3 gap-2 relative">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm mb-2 shadow-sm ${
                  getStepStatus(0) === "completed" || getStepStatus(0) === "active"
                    ? "bg-emerald-600 text-white ring-4 ring-emerald-500/20"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-500"
                }`}>
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">1. Order Pending</span>
                <span className="text-[11px] text-slate-400">Checkout Received</span>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm mb-2 shadow-sm ${
                  getStepStatus(1) === "completed"
                    ? "bg-blue-600 text-white ring-4 ring-blue-500/20"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-500"
                }`}>
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">2. Invoice Created</span>
                {order.invoiceNumber ? (
                  <a
                    href={order.invoiceUrl || `/feature/sales/invoices?search=${encodeURIComponent(order.invoiceNumber)}`}
                    className="text-[11px] font-mono text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
                  >
                    {order.invoiceNumber} <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                ) : (
                  <span className="text-[11px] text-slate-400">Awaiting Invoice</span>
                )}
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm mb-2 shadow-sm ${
                  getStepStatus(2) === "completed"
                    ? "bg-emerald-600 text-white ring-4 ring-emerald-500/20"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-500"
                }`}>
                  <Package className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">3. Order Processed</span>
                <span className="text-[11px] text-slate-400">Production / Live</span>
              </div>
            </div>
          </div>

          {/* Quick Invoice Action Bar if still Pending */}
          {order.status === "Order Pending" && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                  Tax Invoice Pending Generation
                </h4>
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Click below to create the official invoice and client portal login in one click.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenGenerateInvoice(order);
                }}
                className="w-full sm:w-auto px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                Generate Invoice <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Customer CRM Portal Box */}
          <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Client CRM Access Credentials
              </span>
              <a
                href="https://crm2.saampark.com/login"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
              >
                crm2.saampark.com/login <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div>
                <span className="text-xs text-slate-400 block">Username / Email</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 text-xs">
                  {order.email}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Default Password</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs bg-emerald-500/10 px-2 py-0.5 rounded inline-block">
                  {order.clientPassword || "Client@123"}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Assigned Role</span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Clients (Role 4)
                </span>
              </div>
            </div>
          </div>

          {/* Customer & Billing Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Customer Profile
              </h4>
              <div className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" /> {order.clientName}
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-400" /> {order.businessName || "Individual Client"}
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" /> {order.email}
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" /> {order.phone}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Billing & Tax Information
              </h4>
              <div className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <span>
                  {order.address}, {order.city || "Kolkata"}, {order.state || "West Bengal"} - {order.pincode}
                </span>
              </div>
              {order.gstNumber && (
                <div className="text-xs font-mono text-slate-600 dark:text-slate-300 pt-1">
                  <strong>GSTIN:</strong> {order.gstNumber}
                </div>
              )}
              {order.notes && (
                <div className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg mt-2">
                  <strong>Client Note:</strong> {order.notes}
                </div>
              )}
            </div>
          </div>

          {/* Ordered Line Items */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Purchased Package & Deliverables
            </h4>
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
              {order.items.map((it, idx) => (
                <div key={idx} className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-900 text-sm">
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">{it.name}</div>
                    <div className="text-xs text-slate-400">Qty: {it.qty || 1} &bull; Delivery: {it.deliveryDays || "3-5 Days"}</div>
                  </div>
                  <div className="font-mono font-bold text-slate-900 dark:text-white">
                    ₹{((it.price || 0) * (it.qty || 1)).toLocaleString()}
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/50 font-bold text-sm">
                <span>Total Amount Paid / Payable</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 text-base">
                  ₹{order.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Status Override Dropdown */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Update Order Status:
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onStatusChange(order.id, "Order Processed")}
                className="px-3 py-1.5 text-xs font-semibold bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 rounded-lg transition-colors"
              >
                Mark as Order Processed
              </button>
              <button
                type="button"
                onClick={() => onStatusChange(order.id, "Order Pending")}
                className="px-3 py-1.5 text-xs font-semibold bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 rounded-lg transition-colors"
              >
                Reset to Order Pending
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
