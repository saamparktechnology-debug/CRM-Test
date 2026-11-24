"use client";

import * as React from "react";
import { X, ArrowRight, CheckCircle2, ShieldCheck, FileText, User, Mail, Phone, MapPin, Building2, Key, ExternalLink } from "lucide-react";
import { EcommerceOrder } from "../types/ecommerce.types";
import { ensureClientUserAccount } from "@/app/feature/users/service/userService";
import { addInvoice, generateInvoiceNumber } from "@/app/feature/sales/invoices/service/invoiceService";
import { updateOrderStatus } from "../services/ecommerceOrderService";

interface GenerateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: EcommerceOrder | null;
  onInvoiceGenerated: (updatedOrder: EcommerceOrder) => void;
}

export function GenerateInvoiceModal({
  isOpen,
  onClose,
  order,
  onInvoiceGenerated,
}: GenerateInvoiceModalProps) {
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [successResult, setSuccessResult] = React.useState<{
    invoiceNumber: string;
    clientEmail: string;
    clientPassword: string;
    invoiceId: string;
  } | null>(null);

  // Reset state when opening a new order
  React.useEffect(() => {
    if (isOpen) {
      setSuccessResult(null);
      setIsProcessing(false);
    }
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

  const isConsult = order.companyId === "consultancy";
  const companyTitle = isConsult ? "SAAMPARK CONSULTANCY SERVICE" : "SAAMPARK TECHNOLOGY & RESEARCH";

  const handleGenerateInvoice = async () => {
    setIsProcessing(true);
    try {
      // 1. Ensure client user account (Role 4: Clients) is created
      const generatedPassword = order.clientPassword || "Client@123";
      const clientUser = await ensureClientUserAccount({
        email: order.email,
        name: order.clientName,
        phone: order.phone,
        companyId: order.companyId || "tech",
      });

      // 2. Generate a professional CRM Invoice number
      const newInvNumber = generateInvoiceNumber([], new Date(), false);

      // 3. Map order items to invoice line items (with standard 18% GST)
      const lineItems = order.items.map((it, idx) => {
        const rate = it.price || 0;
        const qty = it.qty || 1;
        const subtotal = rate * qty;
        const gstRate = 18;
        const gstAmount = Math.round((subtotal * gstRate) / 100);
        return {
          id: `line-${idx + 1}-${Date.now().toString(36)}`,
          serviceName: it.name,
          description: `Ordered from SAAMPARK E-Commerce Store (Order #${order.orderNumber})`,
          deliverableTime: String(it.deliveryDays || "5-7 Days"),
          qty,
          unit: "Package",
          rate,
          gstRate,
          gstAmount,
          totalAmount: subtotal + gstAmount,
        };
      });

      const totalInvoiceAmount = lineItems.reduce((sum, item) => sum + item.totalAmount, 0);

      // 4. Create the official Invoice in the CRM Sales module
      const createdInvoice = await addInvoice(
        {
          invoiceNumber: newInvNumber,
          client: order.businessName || order.clientName,
          clientContactPerson: order.clientName,
          clientEmail: order.email,
          clientPhone: order.phone,
          clientAddress: `${order.address}${order.pincode ? ` - ${order.pincode}` : ""}`,
          clientDistrict: order.city || "Kolkata",
          clientCity: order.city || "Kolkata",
          clientState: order.state || "West Bengal",
          clientGstin: order.gstNumber || "",
          companyId: order.companyId,
          companyName: companyTitle,
          project: lineItems[0]?.serviceName || "E-Commerce Services",
          billDate: new Date().toISOString().split("T")[0],
          dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
          totalInvoiced: String(totalInvoiceAmount),
          paymentReceived: "0",
          due: String(totalInvoiceAmount),
          status: "Payment Pending",
          notes: `Auto-generated from E-Commerce Order #${order.orderNumber}. Client portal account created for ${order.email}.`,
        } as any,
        order.companyId
      );

      const invoiceId = createdInvoice?.id || `inv-${Date.now().toString(36)}`;

      // 5. Update the E-Commerce Order status to 'Invoice Created'
      const updated = await updateOrderStatus(order.id, "Invoice Created", {
        invoiceId,
        invoiceNumber: newInvNumber,
        invoiceUrl: `/feature/sales/invoices?search=${encodeURIComponent(newInvNumber)}`,
        clientUserId: clientUser?.id || undefined,
      });

      setSuccessResult({
        invoiceNumber: newInvNumber,
        clientEmail: order.email,
        clientPassword: generatedPassword,
        invoiceId,
      });

      if (updated) {
        onInvoiceGenerated(updated);
      }
    } catch (err) {
      console.error("Failed to generate invoice from order:", err);
      alert("Error generating invoice. Please check the browser console.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {successResult ? "Invoice Generated Successfully!" : "Generate CRM Tax Invoice"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Order #{order.orderNumber} &bull; {companyTitle}
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

        {/* Content */}
        <div className="p-6 space-y-6">
          {successResult ? (
            /* Success State */
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-300">
                    Invoice Created & Linked to Order!
                  </h3>
                  <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1">
                    Invoice <span className="font-mono font-bold">{successResult.invoiceNumber}</span> is now active in the CRM Sales module. The order status has been updated to <strong className="font-semibold">Invoice Created</strong>.
                  </p>
                </div>
              </div>

              {/* Client Portal Credentials Card */}
              <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-500" />
                    Customer CRM Portal Credentials
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium">
                    Role: Clients
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-xs text-slate-400 block">Portal Login URL</span>
                    <a
                      href="https://crm2.saampark.com/login"
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 text-xs mt-0.5"
                    >
                      https://crm2.saampark.com/login
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Customer Email</span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 text-xs">
                      {successResult.clientEmail}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Default Password</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs bg-emerald-500/10 px-2 py-0.5 rounded inline-block mt-0.5">
                      {successResult.clientPassword}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Order Status</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold text-xs inline-block mt-0.5">
                      Invoice Created
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Close Window
                </button>
                <a
                  href={`/feature/sales/invoices?search=${encodeURIComponent(successResult.invoiceNumber)}`}
                  className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  View Invoice in Sales
                </a>
              </div>
            </div>
          ) : (
            /* Confirmation Pre-Flight State */
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Customer Billing & Invoice Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <div>
                      <span className="text-xs text-slate-400 block">Customer Name</span>
                      <strong className="text-slate-900 dark:text-white font-medium">
                        {order.clientName}
                      </strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <div>
                      <span className="text-xs text-slate-400 block">Business / Company</span>
                      <strong className="text-slate-900 dark:text-white font-medium">
                        {order.businessName || "Individual Client"}
                      </strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <div>
                      <span className="text-xs text-slate-400 block">Email Address</span>
                      <span className="text-slate-800 dark:text-slate-200 text-xs font-mono">
                        {order.email}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <div>
                      <span className="text-xs text-slate-400 block">Phone</span>
                      <span className="text-slate-800 dark:text-slate-200 text-xs">
                        {order.phone}
                      </span>
                    </div>
                  </div>

                  <div className="sm:col-span-2 flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs text-slate-400 block">Billing Address</span>
                      <span className="text-slate-800 dark:text-slate-200 text-xs">
                        {order.address}, {order.city || "Kolkata"}, {order.state || "West Bengal"} - {order.pincode}
                        {order.gstNumber ? ` | GSTIN: ${order.gstNumber}` : ""}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items to Invoice */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Line Items to Invoice
                </h4>
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 text-sm bg-white dark:bg-slate-900">
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{it.name}</div>
                        <div className="text-xs text-slate-400">Qty: {it.qty || 1} &bull; Delivery: {it.deliveryDays || "3-5 Days"}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-slate-900 dark:text-white">
                          ₹{((it.price || 0) * (it.qty || 1)).toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400">+ 18% GST</div>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 font-bold text-sm">
                    <span>Estimated Total (Incl. 18% GST)</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 text-base">
                      ₹{Math.round(order.totalAmount * 1.18).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Information Notice */}
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  Automated Multi-Tenant Actions upon generation:
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-blue-600/90 dark:text-blue-300/80">
                  <li>Creates or links the official CRM client user account with role <strong>Clients (Role 4)</strong>.</li>
                  <li>Generates an official Tax Invoice in <strong>{companyTitle}</strong>.</li>
                  <li>Updates order status from <em>Order Pending</em> to <em>Invoice Created</em> with live invoice link.</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleGenerateInvoice}
                  disabled={isProcessing}
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-50 rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2"
                >
                  {isProcessing ? (
                    "Generating Invoice & Credentials..."
                  ) : (
                    <>
                      Confirm & Generate Invoice <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
