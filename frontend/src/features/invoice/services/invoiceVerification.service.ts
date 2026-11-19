import {
  fetchModuleDataFromDB,
  saveModuleDataToDB,
} from "@/lib/storageSync"
import {
  sendPaymentDueReminderEmailNotification,
  sendRetainerExpiryEmailNotification,
} from "@/services/emailNotificationService"
import { recordActivityLog } from "@/services/activityLogService"
import { InvoiceItem } from "../types/invoice.types"
import { parseCurrencyNumber } from "./invoiceUtils.service"
import { getInvoices } from "./invoiceCrud.service"
import { markPaymentCompleted, recordPartialPayment, resolveInvoiceAdmin } from "./invoicePayment.service"

export const submitClientPaymentProof = async (
  invoiceId: string,
  utr: string,
  amount: number,
  paymentMethod: string = "UPI / Net Banking",
  notes: string = "",
  submittedBy: string = "",
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
    status: "Pending Verification",
    paymentProofUtr: utr.trim(),
    paymentProofMethod: paymentMethod,
    paymentProofAmount: amount,
    paymentProofDate: new Date().toISOString(),
    paymentProofNotes: notes.trim(),
    paymentProofSubmittedBy: submittedBy || target.client,
  };
  current[idx] = updated;
  await saveModuleDataToDB("invoices", current);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("saampark_data_synced"));
    window.dispatchEvent(new Event("saampark_invoices_updated"));
    window.dispatchEvent(new Event("storage"));
  }

  // Notify Specific Admin and Super Admin
  try {
    const { createNotification } =
      await import("@/services/notificationService");
    const adminInCharge = await resolveInvoiceAdmin(target);

    // Send direct notification to specific Admin
    await createNotification({
      title: "New Payment Proof Submitted",
      message: `${target.client} submitted payment of ₹${amount.toLocaleString("en-IN")} with UTR: ${utr.trim()} for Invoice #${target.id} (Billed by: ${adminInCharge.name}). Please verify UTR and confirm!`,
      type: "payment",
      linkUrl: "/feature/sales/invoices",
      targetEmail: adminInCharge.email,
      targetRole: "Admin",
      sendEmailNotification: true,
    });

    // Also notify Super Admin if different
    if (adminInCharge.email.toLowerCase() !== "saampark.official@gmail.com") {
      await createNotification({
        title: "New Payment Proof Submitted",
        message: `${target.client} submitted payment of ₹${amount.toLocaleString("en-IN")} with UTR: ${utr.trim()} for Invoice #${target.id} (In-Charge: ${adminInCharge.name}).`,
        type: "payment",
        linkUrl: "/feature/sales/invoices",
        targetEmail: "saampark.official@gmail.com",
        targetRole: "Super Admin",
        sendEmailNotification: false,
      });
    }
  } catch (notifErr) {
    console.warn("Notification error:", notifErr);
  }

  recordActivityLog({
    type: "payment",
    module: "Billing",
    action: "Payment Proof Submitted",
    description: `Payment proof of ₹${amount.toLocaleString("en-IN")} with UTR ${utr.trim()} submitted for Invoice #${target.id} by ${target.client}`,
    companyId: target.companyId,
    branchId: target.branchId,
    details: `UTR: ${utr.trim()} | Method: ${paymentMethod}`,
  }).catch(() => {});

  return updated;
};

/**
 * Admin verifies the submitted UTR and confirms or rejects payment settlement.
 */
export const verifyAndConfirmPayment = async (
  invoiceId: string,
  verified: boolean,
  adminNotes: string = "",
): Promise<InvoiceItem | null> => {
  const current = await getInvoices();
  const strId = String(invoiceId).toLowerCase().trim();
  const idx = current.findIndex(
    (i) => String(i.id).toLowerCase().trim() === strId,
  );
  if (idx === -1) return null;

  const target = current[idx];
  if (!verified) {
    // Reject payment proof
    const updated: InvoiceItem = {
      ...target,
      status: "Not paid",
      rejectionReason: adminNotes || "Payment UTR could not be verified.",
    };
    current[idx] = updated;
    await saveModuleDataToDB("invoices", current);

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("saampark_data_synced"));
      window.dispatchEvent(new Event("saampark_invoices_updated"));
      window.dispatchEvent(new Event("storage"));
    }

    // Notify client of rejection if client email exists
    try {
      const { createNotification } =
        await import("@/services/notificationService");
      if (target.clientEmail) {
        await createNotification({
          title: "Payment Verification Rejected",
          message: `Your payment proof (UTR: ${target.paymentProofUtr || "N/A"}) for Invoice #${target.id} could not be verified: ${adminNotes || "Please check UTR and re-submit."}`,
          type: "payment",
          linkUrl: "/feature/sales/invoices",
          targetEmail: target.clientEmail,
          sendEmailNotification: true,
        });
      }
    } catch {}

    return updated;
  }

  // Verified & Confirmed! Settle invoice using the UTR submitted
  const utr = target.paymentProofUtr || "";
  const method = target.paymentProofMethod || "UPI / Net Banking";
  const proofAmount =
    target.paymentProofAmount ||
    parseInt(target.due.replace(/[^0-9]/g, "")) ||
    0;
  const totalDue = parseInt(target.due.replace(/[^0-9]/g, "")) || 0;

  if (proofAmount < totalDue && proofAmount > 0) {
    return await recordPartialPayment(target.id, proofAmount, method, utr);
  } else {
    return await markPaymentCompleted(target.id, method, utr);
  }
};

export const sendPaymentReminder = async (
  invoiceId: string,
): Promise<{ success: boolean; message: string }> => {
  const current = await getInvoices();
  const strId = String(invoiceId).toLowerCase().trim();
  const idx = current.findIndex(
    (i) => String(i.id).toLowerCase().trim() === strId,
  );
  if (idx === -1) return { success: false, message: "Invoice not found" };

  const target = current[idx];
  const now = new Date().toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  target.lastReminderSent = now;
  current[idx] = target;
  await saveModuleDataToDB("invoices", current);

  if (target.clientEmail) {
    return await sendPaymentDueReminderEmailNotification(target);
  }

  return {
    success: true,
    message: `Payment reminder logged for ${target.client}.`,
  };
};

export const sendRetainerExpiryReminder = async (
  invoiceId: string,
): Promise<{ success: boolean; message: string }> => {
  const current = await getInvoices();
  const strId = String(invoiceId).toLowerCase().trim();
  const idx = current.findIndex(
    (i) => String(i.id).toLowerCase().trim() === strId,
  );
  if (idx === -1) return { success: false, message: "Invoice not found" };

  const target = current[idx];
  const now = new Date().toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  (target as any).lastRetainerExpiryReminderSent = now;
  current[idx] = target;
  await saveModuleDataToDB("invoices", current);

  const clientName =
    target.client || (target as any).customer || "Valued Client";
  const clientEmail = target.clientEmail || (target as any).customerEmail || "";
  const planName =
    target.project ||
    (target as any).marketingPackage?.packageName ||
    "Digital Marketing Monthly Retainer";

  if (clientEmail) {
    const res = await sendRetainerExpiryEmailNotification({
      to: clientEmail,
      clientName,
      invoiceId: target.invoiceNumber || target.id,
      packageName: planName,
      durationText:
        (target as any).marketingPackage?.duration || "1 Month Retainer",
      firstPostDate: (target as any).firstPostDate || "",
      expiryDate: target.dueDate || (target as any).expiryDate || "",
      companyId: (target as any).companyId || (target as any).company_id,
    });
    if (res.success) {
      return {
        success: true,
        message: `Monthly Retainer expiry & renewal notice dispatched to ${clientName} (${clientEmail}).`,
      };
    }
  }

  return {
    success: true,
    message: `Monthly Retainer expiry alert logged for ${clientName} (${planName}).`,
  };
};

