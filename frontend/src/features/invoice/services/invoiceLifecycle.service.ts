import {
  fetchModuleDataFromDB,
  saveModuleDataToDB,
  markGlobalItemDeleted,
} from "@/lib/storageSync"
import { getClients, saveStoredClient } from "@/features/clients/services/clientService"
import { recordActivityLog } from "@/services/activityLogService"
import { InvoiceItem } from "../types/invoice.types"
import { parseCurrencyNumber } from "./invoiceUtils.service"
import { getInvoices, updateInvoice } from "./invoiceCrud.service"

export const deleteInvoice = async (
  id: string,
  companyId?: string,
): Promise<boolean> => {
  const strId = String(id).trim();
  const lowerId = strId.toLowerCase();
  const upperId = strId.toUpperCase();

  // 1. Mark as globally deleted across all case variations
  await markGlobalItemDeleted(strId, "invoices");
  await markGlobalItemDeleted(lowerId, "invoices");
  await markGlobalItemDeleted(upperId, "invoices");

  // 2. Remove from all company DB keys and "all" key
  const knownCompanies = [
    "all",
    "tech",
    "infotech",
    "fashion",
    "digital",
    "consultancy",
    "jewellers",
  ];
  if (companyId && !knownCompanies.includes(companyId))
    knownCompanies.push(companyId);

  let target: InvoiceItem | undefined;

  await Promise.all(
    knownCompanies.map(async (c) => {
      try {
        const list = await fetchModuleDataFromDB<InvoiceItem[]>(
          "invoices",
          [],
          c,
        );
        if (Array.isArray(list)) {
          if (!target) {
            target = list.find(
              (i) => String(i.id).toLowerCase().trim() === lowerId,
            );
          }
          const filtered = list.filter(
            (i) => String(i.id).toLowerCase().trim() !== lowerId,
          );
          if (filtered.length !== list.length) {
            await saveModuleDataToDB("invoices", filtered, c);
          }
        }
      } catch {}
    }),
  );

  if (target) {
    const targetTotal = parseCurrencyNumber(target.totalInvoiced);
    const targetReceived = parseCurrencyNumber(target.paymentReceived);
    const targetDue = parseCurrencyNumber(target.due);
    const targetProjectNorm = (target.project || "").toLowerCase().trim();
    const targetClientNorm = (target.client || "").toLowerCase().trim();

    // 2. Cascade delete from Sales Orders
    try {
      const orders = await fetchModuleDataFromDB<any[]>(
        "orders",
        [],
        companyId,
      );
      const matchingOrders = orders.filter(
        (o) =>
          (o.invoiceId && String(o.invoiceId).toLowerCase().trim() === strId) ||
          (targetProjectNorm &&
            o.project &&
            o.project.toLowerCase().trim() === targetProjectNorm &&
            targetClientNorm &&
            o.client &&
            o.client.toLowerCase().trim() === targetClientNorm),
      );
      for (const mo of matchingOrders) {
        if (mo.id) await markGlobalItemDeleted(mo.id, "orders");
      }
      const remainingOrders = orders.filter(
        (o) => !matchingOrders.some((mo) => mo.id === o.id),
      );
      await saveModuleDataToDB("orders", remainingOrders, companyId);
    } catch (err) {
      console.warn("Cascade delete orders failed:", err);
    }

    // 3. Cascade delete from Payments
    try {
      const payments = await fetchModuleDataFromDB<any[]>(
        "payments",
        [],
        companyId,
      );
      const matchingPayments = payments.filter(
        (p) =>
          (p.invoiceId && String(p.invoiceId).toLowerCase().trim() === strId) ||
          (targetProjectNorm &&
            p.project &&
            p.project.toLowerCase().trim() === targetProjectNorm &&
            targetClientNorm &&
            p.client &&
            p.client.toLowerCase().trim() === targetClientNorm),
      );
      for (const mp of matchingPayments) {
        if (mp.id) await markGlobalItemDeleted(mp.id, "payments");
      }
      const remainingPayments = payments.filter(
        (p) => !matchingPayments.some((mp) => mp.id === p.id),
      );
      await saveModuleDataToDB("payments", remainingPayments, companyId);
    } catch (err) {
      console.warn("Cascade delete payments failed:", err);
    }

    // 4. Cascade delete from Subscriptions & Installments
    try {
      const subs = await fetchModuleDataFromDB<any[]>(
        "subscriptions",
        [],
        companyId,
      );
      const targetSubId = (target as any)?.subscriptionId;
      const targetInvId = target?.id;
      const matchingSubs = subs.filter(
        (s) =>
          (targetProjectNorm &&
            s.planName &&
            s.planName.toLowerCase().includes(targetProjectNorm) &&
            targetClientNorm &&
            s.clientName &&
            s.clientName.toLowerCase().trim() === targetClientNorm) ||
          (s.id &&
            ((targetSubId && s.id === targetSubId) ||
              (targetInvId && s.id === targetInvId))),
      );
      for (const ms of matchingSubs) {
        if (ms.id) await markGlobalItemDeleted(ms.id, "subscriptions");
      }
      const remainingSubs = subs.filter(
        (s) => !matchingSubs.some((ms) => ms.id === s.id),
      );
      await saveModuleDataToDB("subscriptions", remainingSubs, companyId);
    } catch (err) {
      console.warn("Cascade delete subscriptions failed:", err);
    }

    // 5. Cascade delete from Installments / EMI Contracts
    try {
      const insts = await fetchModuleDataFromDB<any[]>(
        "installments",
        [],
        companyId,
      );
      const targetEmiId = (target as any)?.emiContractId;
      const targetOrderId = (target as any)?.orderId;
      const targetInvId = target?.id;
      const matchingInsts = insts.filter(
        (i) =>
          (targetProjectNorm &&
            i.projectTitle &&
            i.projectTitle.toLowerCase().includes(targetProjectNorm) &&
            targetClientNorm &&
            i.clientName &&
            i.clientName.toLowerCase().trim() === targetClientNorm) ||
          (i.id &&
            ((targetEmiId && i.id === targetEmiId) ||
              (targetOrderId && i.id === targetOrderId) ||
              (targetInvId && i.id === targetInvId))),
      );
      for (const mi of matchingInsts) {
        if (mi.id) await markGlobalItemDeleted(mi.id, "installments");
      }
      const remainingInsts = insts.filter(
        (i) => !matchingInsts.some((mi) => mi.id === i.id),
      );
      await saveModuleDataToDB("installments", remainingInsts, companyId);
      if (companyId !== "all") {
        await saveModuleDataToDB("installments", remainingInsts, "all");
      }
    } catch (err) {
      console.warn("Cascade delete installments failed:", err);
    }

    // 6. Deduct from Client Total Invoiced, Paid & Due Everywhere
    try {
      const clients = await getClients(companyId);
      const clientIdx = clients.findIndex(
        (c) =>
          (c.name && c.name.toLowerCase().trim() === targetClientNorm) ||
          (target?.clientEmail &&
            c.email &&
            c.email.toLowerCase().trim() ===
              target.clientEmail.toLowerCase().trim()),
      );
      if (clientIdx !== -1) {
        const c = clients[clientIdx];
        const currInvoiced =
          parseInt((c.totalInvoiced || "0").replace(/[^0-9]/g, "")) || 0;
        const currReceived =
          parseInt((c.paymentReceived || "0").replace(/[^0-9]/g, "")) || 0;
        const currDue = parseInt((c.due || "0").replace(/[^0-9]/g, "")) || 0;

        const newInvoiced = Math.max(0, currInvoiced - targetTotal);
        const newReceived = Math.max(0, currReceived - targetReceived);
        const newDue = Math.max(0, currDue - targetDue);

        await saveStoredClient(
          {
            ...c,
            totalInvoiced: `₹${newInvoiced.toLocaleString("en-IN")}`,
            paymentReceived: `₹${newReceived.toLocaleString("en-IN")}`,
            due: `₹${newDue.toLocaleString("en-IN")}`,
          },
          companyId,
        );
      }
    } catch (err) {
      console.warn("Cascade deduct client balance failed:", err);
    }

    // 7. Broadcast sync events so all active views update simultaneously
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("saampark_data_synced"));
      window.dispatchEvent(new Event("saampark_invoices_updated"));
      window.dispatchEvent(new Event("saampark_orders_updated"));
      window.dispatchEvent(new Event("saampark_payments_updated"));
      window.dispatchEvent(new Event("saampark_clients_updated"));
      window.dispatchEvent(new Event("saampark_subscriptions_updated"));
      window.dispatchEvent(new Event("saampark_installments_updated"));
      window.dispatchEvent(new Event("storage"));
    }

    recordActivityLog({
      type: "invoice",
      module: "Invoices",
      action: "Invoice Deleted",
      description: `Invoice #${strId} ${target?.client ? `for "${target.client}"` : ""} deleted from the system`,
      companyId: target?.companyId || companyId,
      branchId: target?.branchId,
      branchName: target?.branchName,
    }).catch(() => {});
  }

  return true;
};

export const clientAcceptInvoice = async (
  invoiceId: string,
  clientName?: string,
  notes?: string,
  companyId?: string,
): Promise<InvoiceItem> => {
  const allInvoices = await getInvoices("all");
  const strId = String(invoiceId).toUpperCase().trim();
  const target = allInvoices.find(
    (i) => String(i.id).toUpperCase().trim() === strId,
  );
  if (!target) throw new Error("Invoice not found");

  const updated: InvoiceItem = {
    ...target,
    clientAccepted: true,
    acceptedAt: Date.now(),
    acceptedBy: clientName || target.client || "Client",
    clientAcceptNotes: notes || target.clientAcceptNotes,
  };

  const result = await updateInvoice(updated, companyId || target.companyId);

  recordActivityLog({
    type: "invoice",
    module: "Invoices",
    action: "Invoice Accepted by Client",
    description: `Invoice #${target.id} was accepted online by client "${updated.acceptedBy}"`,
    companyId: target.companyId || companyId,
    branchId: target.branchId,
    branchName: target.branchName,
  }).catch(() => {});

  return result;
};
