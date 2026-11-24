"use client";

import * as React from "react";
import { ArrowRight, Search, Filter, RefreshCw, FileText, CheckCircle2, Clock, Package, Eye, ExternalLink, ShieldCheck, User, Mail, Phone, MapPin, Building2, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermissionStore } from "@/store/usePermissionStore";
import { EcommerceOrder, EcommerceOrderStatus } from "@/features/ecommerce/types/ecommerce.types";
import { getEcommerceOrders, updateOrderStatus, deleteEcommerceOrder } from "@/features/ecommerce/services/ecommerceOrderService";
import { GenerateInvoiceModal } from "@/features/ecommerce/components/GenerateInvoiceModal";
import { OrderDetailsModal } from "@/features/ecommerce/components/OrderDetailsModal";

export default function EcommerceOrdersPage() {
  const { user, activeCompanyId } = useAuthStore();
  const isAllCompanies = !activeCompanyId || activeCompanyId === "all" || activeCompanyId === "group" || activeCompanyId === "saampark-group";
  const { canPerformAction } = usePermissionStore();

  const [orders, setOrders] = React.useState<EcommerceOrder[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = React.useState<EcommerceOrder | null>(null);
  const [selectedOrderForDetails, setSelectedOrderForDetails] = React.useState<EcommerceOrder | null>(null);

  // Compute active company scope
  const isConsultancy = activeCompanyId === "2" || activeCompanyId === "consultancy" || activeCompanyId?.includes("consult");
  const companyScope = isAllCompanies ? "all" : isConsultancy ? "consultancy" : "tech";

  const loadOrders = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getEcommerceOrders(companyScope);
      setOrders(data);
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setIsLoading(false);
    }
  }, [companyScope]);

  React.useEffect(() => {
    loadOrders();

    const handleSync = () => loadOrders();
    const handleCompSwitch = () => loadOrders();

    window.addEventListener("saampark_ecommerce_orders_updated", handleSync);
    window.addEventListener("saampark_company_switched", handleCompSwitch);
    window.addEventListener("storage", handleSync);

    return () => {
      window.removeEventListener("saampark_ecommerce_orders_updated", handleSync);
      window.removeEventListener("saampark_company_switched", handleCompSwitch);
      window.removeEventListener("storage", handleSync);
    };
  }, [loadOrders]);

  const handleStatusChange = async (orderId: string, newStatus: EcommerceOrderStatus) => {
    await updateOrderStatus(orderId, newStatus);
    await loadOrders();
    if (selectedOrderForDetails && selectedOrderForDetails.id === orderId) {
      setSelectedOrderForDetails((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const filteredOrders = orders.filter((o) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      o.orderNumber.toLowerCase().includes(q) ||
      o.clientName.toLowerCase().includes(q) ||
      (o.businessName && o.businessName.toLowerCase().includes(q)) ||
      o.email.toLowerCase().includes(q) ||
      o.phone.includes(q);

    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate metrics
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "Order Pending").length;
  const invoicedOrders = orders.filter((o) => o.status === "Invoice Created").length;
  const processedOrders = orders.filter((o) => o.status === "Order Processed").length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <div className="max-w-[1600px] mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Manage E-Commerce Orders
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Customer Online Orders & One-Click Invoice Dispatch &bull;
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  companyScope === "tech"
                    ? "bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20"
                    : companyScope === "consultancy"
                    ? "bg-orange-500/10 text-orange-700 dark:text-orange-300 border border-orange-500/20"
                    : "bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20"
                }`}>
                  {companyScope === "tech"
                    ? "SAAMPARK TECHNOLOGY & RESEARCH"
                    : companyScope === "consultancy"
                    ? "SAAMPARK CONSULTANCY SERVICE"
                    : "Cross-Company View (Super Admin)"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="https://saampark.com/track"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-1.5"
          >
            Live Storefront <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={() => loadOrders()}
            className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Refresh Orders"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Orders
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{totalOrders}</span>
            <span className="text-xs text-slate-400">Received</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Order Pending
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-500">{pendingOrders}</span>
            <span className="text-xs text-amber-500/80">Needs Invoice</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Invoice Created
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{invoicedOrders}</span>
            <span className="text-xs text-blue-500/80">Invoiced</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Order Processed
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{processedOrders}</span>
            <span className="text-xs text-emerald-500/80">Completed</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm col-span-2 sm:col-span-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Gross Order Value
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              ₹{totalRevenue.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400">Total</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by order #, client name, business, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
          >
            <option value="all">All Order Statuses</option>
            <option value="Order Pending">1. Order Pending</option>
            <option value="Invoice Created">2. Invoice Created</option>
            <option value="Order Processed">3. Order Processed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center text-slate-400">Loading incoming orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">No orders found</h3>
            <p className="text-xs text-slate-400 mt-1">Orders placed via the storefront checkout will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Order Details</th>
                  <th className="py-3.5 px-4">Customer & Billing</th>
                  <th className="py-3.5 px-4">Ordered Services</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Status & Pipeline</th>
                  <th className="py-3.5 px-4 text-right">Generate Invoice Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {filteredOrders.map((o) => {
                  const isConsult = o.companyId === "consultancy";
                  const isPending = o.status === "Order Pending";

                  return (
                    <tr
                      key={o.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      {/* Order Details */}
                      <td className="py-4 px-4 align-top">
                        <div className="font-mono font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          {o.orderNumber}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">{o.orderDate}</div>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          isConsult ? "bg-orange-500/10 text-orange-600" : "bg-blue-500/10 text-blue-600"
                        }`}>
                          {isConsult ? "CONSULTANCY" : "TECHNOLOGY"}
                        </span>
                      </td>

                      {/* Customer & Billing */}
                      <td className="py-4 px-4 align-top max-w-xs">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {o.clientName}
                        </div>
                        {o.businessName && (
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {o.businessName}
                          </div>
                        )}
                        <div className="text-xs text-slate-400 mt-1 font-mono">{o.email}</div>
                        <div className="text-xs text-slate-400">{o.phone}</div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                          {o.gstNumber && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-mono font-semibold">
                              GSTIN: {o.gstNumber}
                            </span>
                          )}
                          {o.address && o.pincode && (
                            <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-semibold">
                              Invoice Ready
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Ordered Services */}
                      <td className="py-4 px-4 align-top">
                        <div className="space-y-1">
                          {o.items.map((it, idx) => (
                            <div key={idx} className="text-xs font-medium text-slate-800 dark:text-slate-200">
                              &bull; {it.name} <span className="text-slate-400 font-mono">(₹{it.price.toLocaleString()})</span>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="py-4 px-4 align-top">
                        <div className="font-mono font-bold text-base text-slate-900 dark:text-white">
                          ₹{o.totalAmount.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400">+ 18% GST on invoice</div>
                      </td>

                      {/* Status & Pipeline */}
                      <td className="py-4 px-4 align-top">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          o.status === "Invoice Created"
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                            : o.status === "Order Processed"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : o.status === "Cancelled"
                            ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                        }`}>
                          {o.status === "Invoice Created" && <FileText className="w-3.5 h-3.5" />}
                          {o.status === "Order Processed" && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {o.status === "Order Pending" && <Clock className="w-3.5 h-3.5" />}
                          {o.status}
                        </span>

                        {o.invoiceNumber && (
                          <div className="mt-1.5">
                            <a
                              href={o.invoiceUrl || `/feature/sales/invoices?search=${encodeURIComponent(o.invoiceNumber)}`}
                              className="text-xs font-mono text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
                            >
                              {o.invoiceNumber} <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </td>

                      {/* Direct Arrow Action Column */}
                      <td className="py-4 px-4 align-top text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedOrderForDetails(o)}
                            className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            title="View Full Order Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {isPending ? (
                            <button
                              onClick={() => setSelectedOrderForInvoice(o)}
                              className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl shadow-md shadow-blue-500/25 transition-all flex items-center gap-1.5"
                              title="Generate Official CRM Invoice from this Order"
                            >
                              <span>Generate Invoice</span> <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              {o.status === "Invoice Created" && (
                                <button
                                  onClick={() => handleStatusChange(o.id, "Order Processed")}
                                  className="px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 rounded-xl transition-colors flex items-center gap-1"
                                  title="Mark Order as Processed & Completed"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Mark Processed
                                </button>
                              )}
                              <a
                                href={o.invoiceUrl || `/feature/sales/invoices?search=${encodeURIComponent(o.invoiceNumber || "")}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 rounded-xl transition-colors flex items-center gap-1"
                              >
                                <FileText className="w-3.5 h-3.5" /> View Invoice
                              </a>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Generate Invoice Modal */}
      <GenerateInvoiceModal
        isOpen={!!selectedOrderForInvoice}
        onClose={() => setSelectedOrderForInvoice(null)}
        order={selectedOrderForInvoice}
        onInvoiceGenerated={(updated) => {
          loadOrders();
        }}
      />

      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={!!selectedOrderForDetails}
        onClose={() => setSelectedOrderForDetails(null)}
        order={selectedOrderForDetails}
        onStatusChange={handleStatusChange}
        onOpenGenerateInvoice={(order) => {
          setSelectedOrderForInvoice(order);
        }}
      />
    </div>
  );
}
