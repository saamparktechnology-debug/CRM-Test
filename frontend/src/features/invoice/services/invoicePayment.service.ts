import {
  fetchModuleDataFromDB,
  saveModuleDataToDB,
} from "@/lib/storageSync"
import { getClients, saveStoredClient } from "@/features/clients/services/clientService"
import {
  sendPaymentReceiptEmailNotification,
  sendPaymentDueReminderEmailNotification,
} from "@/services/emailNotificationService"
import { recordActivityLog } from "@/services/activityLogService"
import { InvoiceItem, InvoiceStatus } from "../types/invoice.types"
import {
  parseCurrencyNumber,
  isInvoiceOverdue,
  getInvoiceDaysOverdue,
} from "./invoiceUtils.service"
import { getInvoices, updateInvoice } from "./invoiceCrud.service"
import { sendPaymentReminder } from "./invoiceVerification.service"

export const checkAndSendOverdueReminders = async (
  companyId?: string,
): Promise<{
  dispatchedCount: number;
  overdueCount: number;
  overdueInvoices: InvoiceItem[];
}> => {
  const invoices = await getInvoices(companyId);
  const overdueList = invoices.filter(isInvoiceOverdue);
  let dispatched = 0;

  for (const inv of overdueList) {
    const lastSent = (inv as any).lastOverdueReminderSent
      ? new Date((inv as any).lastOverdueReminderSent).getTime()
      : 0;
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    if (lastSent < oneDayAgo && inv.clientEmail) {
      try {
        await sendPaymentReminder(inv.id);
        await updateInvoice(
          {
            ...inv,
            lastOverdueReminderSent: new Date().toISOString(),
          } as any,
          companyId,
        );
        dispatched++;
      } catch (err) {
        console.warn(`Could not dispatch overdue reminder for ${inv.id}:`, err);
      }
    }
  }

  return {
    dispatchedCount: dispatched,
    overdueCount: overdueList.length,
    overdueInvoices: overdueList,
  };
};

export const updateInvoiceStatus = async (
  id: string,
  status: InvoiceStatus,
  paymentReceived?: string,
  due?: string,
  companyId?: string,
): Promise<InvoiceItem | null> => {
  const current = await getInvoices(companyId);
  const strId = String(id).toUpperCase().trim();
  const idx = current.findIndex(
    (i) => String(i.id).toUpperCase().trim() === strId,
  );
  if (idx === -1) return null;
  const target = current[idx];
  current[idx] = {
    ...target,
    status,
    paymentReceived:
      paymentReceived !== undefined
        ? paymentReceived
        : status === "Fully paid"
          ? target.totalInvoiced
          : target.paymentReceived,
    due: due !== undefined ? due : status === "Fully paid" ? "₹0" : target.due,
  };
  const targetComp = companyId || target.companyId || "all";
  await saveModuleDataToDB("invoices", current, targetComp);
  if (targetComp !== "all") {
    await saveModuleDataToDB("invoices", current, "all");
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("saampark_data_synced"));
    window.dispatchEvent(new Event("storage"));
  }

  recordActivityLog({
    type: "invoice",
    module: "Invoices",
    action: `Invoice ${status}`,
    description: `Invoice #${current[idx].id} status changed to ${status} for ${current[idx].client}`,
    companyId: targetComp,
    branchId: current[idx].branchId,
    branchName: current[idx].branchName,
    details: `Total: ${current[idx].totalInvoiced} | Paid: ${current[idx].paymentReceived} | Due: ${current[idx].due}`,
  }).catch(() => {});

  return current[idx];
};

export const recordPartialPayment = async (
  invoiceId: string,
  paidAmountNum: number,
  paymentMethod: string = "UPI / Net Banking",
  transactionRef: string = "",
  companyId?: string,
): Promise<InvoiceItem | null> => {
  const current = await getInvoices(companyId);
  const strId = String(invoiceId).toUpperCase().trim();
  const idx = current.findIndex(
    (i) => String(i.id).toUpperCase().trim() === strId,
  );
  if (idx === -1) return null;

  const target = current[idx];
  const prevReceivedNum =
    parseInt((target.paymentReceived || "0").replace(/[^0-9]/g, "")) || 0;
  const totalInvoicedNum =
    parseInt((target.totalInvoiced || "0").replace(/[^0-9]/g, "")) || 0;
  const prevDueNum = Math.max(0, totalInvoicedNum - prevReceivedNum);

  // Check for overpayment
  let excessOverpayment = 0;
  let effectiveReceivedNum = prevReceivedNum + paidAmountNum;
  let newDueNum = Math.max(0, totalInvoicedNum - effectiveReceivedNum);

  if (paidAmountNum > prevDueNum) {
    excessOverpayment = paidAmountNum - prevDueNum;
    effectiveReceivedNum = totalInvoicedNum;
    newDueNum = 0;
  }

  const isFullySettled = newDueNum <= 0;

  const updated: InvoiceItem = {
    ...target,
    status: isFullySettled ? "Fully paid" : "Partially paid",
    paymentReceived: `₹${effectiveReceivedNum.toLocaleString("en-IN")}`,
    due: `₹${newDueNum.toLocaleString("en-IN")}`,
  };

  current[idx] = updated;
  const targetComp = companyId || target.companyId || "all";
  await saveModuleDataToDB("invoices", current, targetComp);
  if (targetComp !== "all") {
    await saveModuleDataToDB("invoices", current, "all");
  }

  // If overpayment occurred, automatically issue a Credit Note
  if (excessOverpayment > 0) {
    try {
      const { createCreditNoteFromOverpayment } =
        await import("@/features/credit-notes/services/creditNoteService");
      await createCreditNoteFromOverpayment(
        {
          id: target.id,
          client: target.client,
          clientEmail: target.clientEmail,
          companyId: targetComp,
          branchId: target.branchId,
        },
        excessOverpayment,
      );
    } catch (cnErr) {
      console.warn(
        "Could not auto-generate credit note for overpayment:",
        cnErr,
      );
    }
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("saampark_data_synced"));
    window.dispatchEvent(new Event("saampark_team_payouts_updated"));
    window.dispatchEvent(new Event("saampark_invoices_updated"));
    window.dispatchEvent(new Event("saampark_credit_notes_updated"));
    window.dispatchEvent(new Event("storage"));
  }

  // Record or update payment entry
  try {
    const { getPayments, settleOrUpdatePaymentToCompleted } =
      await import("@/features/payments/services/paymentService");
    if (isFullySettled) {
      await settleOrUpdatePaymentToCompleted({
        invoiceId: target.id,
        client: target.client,
        clientEmail: target.clientEmail,
        project: target.project,
        paymentMethod,
        transactionRef,
        totalAmount: target.totalInvoiced,
        totalAmountNum: totalInvoicedNum,
      });
    } else {
      // Update existing payment in place or add new
      const payments = await getPayments();
      const pIdx = payments.findIndex(
        (p) =>
          (p.invoiceId &&
            p.invoiceId.toLowerCase().trim() ===
              target.id.toLowerCase().trim()) ||
          (p.client.toLowerCase().trim() ===
            target.client.toLowerCase().trim() &&
            p.project.toLowerCase().trim() ===
              target.project.toLowerCase().trim()),
      );
      if (pIdx !== -1) {
        payments[pIdx] = {
          ...payments[pIdx],
          amount: `₹${effectiveReceivedNum.toLocaleString("en-IN")}`,
          amountNum: effectiveReceivedNum,
          note: `Installment payment updated: ₹${effectiveReceivedNum.toLocaleString("en-IN")} received for ${target.project}`,
          paymentDate: new Date().toLocaleDateString("en-GB"),
        };
        await saveModuleDataToDB("payments", payments);
      } else {
        const { addPayment } =
          await import("@/features/payments/services/paymentService");
        await addPayment({
          invoiceId: target.id,
          client: target.client,
          clientEmail: target.clientEmail,
          project: target.project,
          paymentDate: new Date().toLocaleDateString("en-GB"),
          paymentMethod,
          transactionRef: transactionRef || `PART_TXN${Date.now()}`,
          note: `Partial payment of ₹${paidAmountNum.toLocaleString("en-IN")} for ${target.id}`,
          amount: `₹${paidAmountNum.toLocaleString("en-IN")}`,
          amountNum: paidAmountNum,
          status: "Completed",
        });
      }
    }

    // Dispatch real email payment receipt
    sendPaymentReceiptEmailNotification({
      invoice: updated,
      paidAmount: `₹${paidAmountNum.toLocaleString("en-IN")}`,
      remainingDue: `₹${newDueNum.toLocaleString("en-IN")}`,
      paymentMethod,
      txnRef: transactionRef,
    }).catch(() => null);

    // Notify Specific Admin who billed this invoice
    try {
      const { createNotification } =
        await import("@/services/notificationService");
      const adminInCharge = await resolveInvoiceAdmin(target);

      await createNotification({
        title: isFullySettled ? "Invoice Fully Paid" : "Payment Received",
        message: `Payment of ₹${paidAmountNum.toLocaleString("en-IN")} received for Invoice #${target.id} (${target.client}). Current status: ${isFullySettled ? "Fully paid" : "Partially paid"}.`,
        type: "payment",
        linkUrl: "/feature/sales/invoices",
        targetEmail: adminInCharge.email,
        targetRole: "Admin",
        sendEmailNotification: true,
      });

      if (adminInCharge.email.toLowerCase() !== "saampark.official@gmail.com") {
        await createNotification({
          title: isFullySettled ? "Invoice Fully Paid" : "Payment Received",
          message: `Payment of ₹${paidAmountNum.toLocaleString("en-IN")} (Invoice #${target.id} - ${target.client}) received for Admin ${adminInCharge.name}.`,
          type: "payment",
          linkUrl: "/feature/sales/invoices",
          targetEmail: "saampark.official@gmail.com",
          targetRole: "Super Admin",
          sendEmailNotification: false,
        });
      }
    } catch (notifErr) {
      console.warn("Error notifying specific admin of payment:", notifErr);
    }
  } catch (err) {
    console.warn("Error updating payment entry in recordPartialPayment:", err);
  }

  recordActivityLog({
    type: "payment",
    module: "Billing",
    action: isFullySettled ? "Invoice Fully Paid" : "Partial Payment Received",
    description: `Payment of ₹${paidAmountNum.toLocaleString("en-IN")} received for Invoice #${target.id} (${target.client})`,
    companyId: target.companyId,
    branchId: target.branchId,
    branchName: target.branchName,
    details: `Method: ${paymentMethod} | Remaining Due: ₹${newDueNum.toLocaleString("en-IN")}`,
  }).catch(() => {});

  return updated;
};

export const markPaymentCompleted = async (
  invoiceId: string,
  paymentMethod: string = "UPI / Net Banking",
  transactionRef: string = "",
): Promise<InvoiceItem | null> => {
  const current = await getInvoices();
  const strId = String(invoiceId).toLowerCase().trim();
  const idx = current.findIndex(
    (i) => String(i.id).toLowerCase().trim() === strId,
  );
  if (idx === -1) return null;

  const target = current[idx];
  const updated: InvoiceItem = {
    ...target,
    status: "Fully paid",
    paymentReceived: target.totalInvoiced,
    due: "₹0",
  };
  current[idx] = updated;
  await saveModuleDataToDB("invoices", current);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("saampark_data_synced"));
    window.dispatchEvent(new Event("saampark_team_payouts_updated"));
    window.dispatchEvent(new Event("saampark_invoices_updated"));
    window.dispatchEvent(new Event("storage"));
  }

  // Settle or update existing payment record in-place
  try {
    const { settleOrUpdatePaymentToCompleted } =
      await import("@/features/payments/services/paymentService");
    const totalAmountNum =
      parseInt(target.totalInvoiced.replace(/[^0-9]/g, "")) || 0;
    await settleOrUpdatePaymentToCompleted({
      invoiceId: target.id,
      client: target.client,
      clientEmail: target.clientEmail,
      project: target.project,
      paymentMethod,
      transactionRef,
      totalAmount: target.totalInvoiced,
      totalAmountNum,
    });

    // Dispatch full settlement email
    sendPaymentReceiptEmailNotification({
      invoice: updated,
      paidAmount: target.totalInvoiced,
      remainingDue: "₹0",
      paymentMethod,
      txnRef: transactionRef,
    }).catch(() => null);

    // Notify Specific Admin who billed this invoice
    try {
      const { createNotification } =
        await import("@/services/notificationService");
      const adminInCharge = await resolveInvoiceAdmin(target);

      await createNotification({
        title: "Invoice Fully Paid",
        message: `Invoice #${target.id} (${target.client}) for ₹${target.totalInvoiced} has been verified and settled in full!`,
        type: "payment",
        linkUrl: "/feature/sales/invoices",
        targetEmail: adminInCharge.email,
        targetRole: "Admin",
        sendEmailNotification: true,
      });

      if (adminInCharge.email.toLowerCase() !== "saampark.official@gmail.com") {
        await createNotification({
          title: "Invoice Fully Paid",
          message: `Invoice #${target.id} (${target.client}) for ₹${target.totalInvoiced} (Admin: ${adminInCharge.name}) is settled in full.`,
          type: "payment",
          linkUrl: "/feature/sales/invoices",
          targetEmail: "saampark.official@gmail.com",
          targetRole: "Super Admin",
          sendEmailNotification: false,
        });
      }
    } catch (notifErr) {
      console.warn(
        "Error notifying specific admin in markPaymentCompleted:",
        notifErr,
      );
    }
  } catch (err) {
    console.warn("Error settling payment entry in markPaymentCompleted:", err);
  }

  recordActivityLog({
    type: "payment",
    module: "Billing",
    action: "Invoice Settled",
    description: `Invoice #${target.id} marked as fully paid (${target.totalInvoiced}) for ${target.client}`,
    companyId: target.companyId,
    branchId: target.branchId,
    branchName: target.branchName,
    details: `Method: ${paymentMethod} | Txn: ${transactionRef || "N/A"}`,
  }).catch(() => {});

  return updated;
};

/**
 * Resolves the specific Admin (name, email) in charge of an invoice based on billedBy or createdByName.
 */
export const resolveInvoiceAdmin = async (
  invoice: InvoiceItem,
): Promise<{ name: string; email: string }> => {
  try {
    const { getUsers } =
      await import("@/features/users/services/userService");
    const allUsers = await getUsers();

    const billedBy = (invoice.billedBy || "").toLowerCase().trim();
    const createdBy = (invoice.createdByName || "").toLowerCase().trim();

    // 1. Try to find user matching billedBy
    if (billedBy) {
      const match = allUsers.find(
        (u) =>
          (u.name && u.name.toLowerCase().trim() === billedBy) ||
          (u.email && u.email.toLowerCase().trim() === billedBy),
      );
      if (match?.email) {
        return { name: match.name, email: match.email };
      }
    }

    // 2. Try to find user matching createdByName
    if (createdBy) {
      const match = allUsers.find(
        (u) =>
          (u.name && u.name.toLowerCase().trim() === createdBy) ||
          (u.email && u.email.toLowerCase().trim() === createdBy),
      );
      if (match?.email) {
        return { name: match.name, email: match.email };
      }
    }

    // 3. Fallback: Find active Admin or Super Admin
    const adminUser = allUsers.find(
      (u) =>
        u.status !== "Inactive" &&
        (u.role === "Admin" ||
          u.role === "Super Admin" ||
          (u.role && u.role.toLowerCase().includes("admin"))),
    );
    if (adminUser?.email) {
      return { name: adminUser.name, email: adminUser.email };
    }
  } catch (err) {
    console.warn("Could not resolve invoice admin:", err);
  }

  return { name: "Admin", email: "saampark.official@gmail.com" };
};

/**
 * Client submits payment proof with mandatory UTR number.
 * Status becomes "Pending Verification" and sends instant notification to specific Admin/Super Admin.
 */
