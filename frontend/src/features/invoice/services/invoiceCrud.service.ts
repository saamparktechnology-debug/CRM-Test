import {
  fetchModuleDataFromDB,
  saveModuleDataToDB,
  filterGlobalDeletedItems,
  getLocalDeletedIds,
} from "@/lib/storageSync";
import {
  getClients,
  saveStoredClient,
} from "@/features/clients/services/clientService";
import { recordActivityLog } from "@/services/activityLogService";
import { InvoiceItem } from "../types/invoice.types";
import {
  parseInvoiceDate,
  generateInvoiceNumber,
  parseCurrencyNumber,
} from "./invoiceUtils.service";
import { api } from "@/lib/api";

export const getInvoices = async (
  companyId?: string,
): Promise<InvoiceItem[]> => {
  let targetComp = companyId;
  if (!targetComp && typeof window !== "undefined") {
    try {
      const { useAuthStore } = require("@/store/useAuthStore");
      targetComp = useAuthStore.getState().activeCompanyId || undefined;
    } catch {}
  }

  const defaultCompanies = [
    "all",
    "tech",
    "infotech",
    "fashion",
    "digital",
    "consultancy",
    "jewellers",
    "saampark-ai-solutions",
    "print",
    "print-space",
    "saampark-print-space",
  ];
  let dynamicCompanies: string[] = [];
  if (typeof window !== "undefined") {
    try {
      const { useAuthStore } = require("@/store/useAuthStore");
      const storeComps = useAuthStore.getState().companies || [];
      dynamicCompanies = storeComps
        .flatMap((c: any) => [c.id, c.slug])
        .filter(Boolean);
    } catch {}
  }
  const allKnown = Array.from(
    new Set([...defaultCompanies, ...dynamicCompanies]),
  );

  if (!targetComp || targetComp === "all") {
    const list = await fetchModuleDataFromDB<InvoiceItem[]>(
      "invoices",
      [],
      "all",
    ).catch(() => []);
    const map = new Map<string, InvoiceItem>();
    for (const inv of Array.isArray(list) ? list : []) {
      if (inv && inv.id) map.set(String(inv.id).toUpperCase().trim(), inv);
    }
    return filterGlobalDeletedItems(Array.from(map.values()));
  }

  const { isMatchingCompany } = await import("@/store/useAuthStore");
  // Fetch scoped company and 'all' in parallel - fast and avoids network saturation
  const [scopedList, allList] = await Promise.all([
    fetchModuleDataFromDB<InvoiceItem[]>("invoices", [], targetComp).catch(
      () => [],
    ),
    fetchModuleDataFromDB<InvoiceItem[]>("invoices", [], "all").catch(() => []),
  ]);

  const map = new Map<string, InvoiceItem>();
  for (const inv of [
    ...(Array.isArray(allList) ? allList : []),
    ...(Array.isArray(scopedList) ? scopedList : []),
  ]) {
    if (inv && inv.id) {
      const invComp = inv.companyId || (inv as any).company || "tech";
      const isMktInv =
        inv.primaryCategory === "Digital Marketing" ||
        Boolean(
          (inv as any)?.marketingPackage?.enabled ||
          (inv as any)?.marketingPackage?.planName,
        );
      if (
        isMatchingCompany({ id: invComp, slug: invComp } as any, targetComp) ||
        targetComp === "all" ||
        invComp === "all" ||
        isMktInv
      ) {
        map.set(String(inv.id).toUpperCase().trim(), inv);
      }
    }
  }

  return filterGlobalDeletedItems(Array.from(map.values()));
};

export const addInvoice = async (
  invoice: Omit<InvoiceItem, "id"> & { id?: string },
  companyId?: string,
): Promise<InvoiceItem> => {
  let targetComp = companyId || (invoice as any)?.companyId;
  if (!targetComp && typeof window !== "undefined") {
    try {
      const { useAuthStore } = require("@/store/useAuthStore");
      targetComp = useAuthStore.getState().activeCompanyId || undefined;
    } catch {}
  }
  const effectiveComp =
    !targetComp || targetComp === "all" ? "tech" : targetComp;

  // Fetch scoped and all in parallel for instant execution
  const currentAll = await fetchModuleDataFromDB<InvoiceItem[]>(
    "invoices",
    [],
    "all",
  ).catch(() => []);

  const deletedIds = getLocalDeletedIds();
  let nextId = (invoice.id || "").trim();

  // If no ID provided or if requested ID already exists or is in deleted list, calculate next unique ID
  if (
    !nextId ||
    currentAll.some(
      (i) => String(i.id).toUpperCase().trim() === nextId.toUpperCase(),
    ) ||
    deletedIds.includes(nextId.toLowerCase().trim())
  ) {
    const hasItemGst =
      Array.isArray(invoice.items) && invoice.items.length > 0
        ? invoice.items.some(
            (it) =>
              (Number(it.gstRate) || 0) > 0 || (Number(it.gstAmount) || 0) > 0,
          )
        : false;
    const isGst = Boolean(
      hasItemGst ||
      (typeof invoice.gstRate === "number" && invoice.gstRate > 0) ||
      (typeof invoice.gstAmount === "number" && invoice.gstAmount > 0),
    );
    const billDateObj = parseInvoiceDate(
      invoice.billDate || invoice.invoiceDate,
    );
    nextId = generateInvoiceNumber(currentAll, billDateObj, !isGst);
  }

  let activeBranch: string | undefined = undefined;
  if (typeof window !== "undefined") {
    try {
      const { useAuthStore } = require("@/store/useAuthStore");
      activeBranch =
        useAuthStore.getState().activeBranchId ||
        useAuthStore.getState().user?.branchId ||
        undefined;
    } catch {}
  }

  let currentUser: any = null;
  if (typeof window !== "undefined") {
    try {
      const { useAuthStore } = require("@/store/useAuthStore");
      currentUser = useAuthStore.getState().user;
    } catch {}
  }
  const isTeamMember =
    currentUser &&
    String(currentUser.role || "")
      .toLowerCase()
      .trim()
      .includes("team");
  const approvalStatus: "pending" | "approved" | "rejected" =
    invoice.approvalStatus || (isTeamMember ? "pending" : "approved");
  const invoiceStatus =
    isTeamMember && approvalStatus === "pending"
      ? "Pending Approval"
      : invoice.status || "Not paid";

  const newInvoice: InvoiceItem = {
    ...invoice,
    id: nextId,
    billTime:
      invoice.billTime ||
      new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    createdAt: invoice.createdAt || new Date().toISOString(),
    companyId: (invoice as any)?.companyId || effectiveComp,
    branchId: invoice.branchId || activeBranch || undefined,
    status: invoiceStatus,
    approvalStatus,
  };

  if (isTeamMember && approvalStatus === "pending") {
    try {
      const { submitForApproval } = require("@/services/approvalService");
      const rawAmt =
        invoice.baseAmount ||
        parseInt(String(invoice.totalInvoiced || "0").replace(/[^0-9]/g, "")) ||
        0;
      submitForApproval({
        type: "invoice",
        title: `Bill #${nextId} for ${newInvoice.client}`,
        documentNumber: nextId,
        documentId: nextId,
        clientName: newInvoice.client,
        clientEmail: newInvoice.clientEmail,
        amount: rawAmt,
        submittedBy: {
          id: String(currentUser.id || ""),
          name: currentUser.name || "Team Member",
          email: currentUser.email || "",
          role: currentUser.role || "Teams",
        },
        companyId: effectiveComp,
        branchId: newInvoice.branchId,
        branchName: newInvoice.branchName,
        dataSnapshot: newInvoice,
      }).catch(() => {});
    } catch {}
  }

  // Send ONLY the newly created invoice — backend merges it into company & root keys
  await saveModuleDataToDB("invoices", [newInvoice], effectiveComp);

  await saveModuleDataToDB("invoices", [newInvoice], effectiveComp);

  // Automatically ensure client user account exists and sync client directory
  if (newInvoice.clientEmail) {
    try {
      const { recordUserAccountAsync } =
        await import("@/features/users/services/userService");
      recordUserAccountAsync(
        {
          name: newInvoice.client,
          email: newInvoice.clientEmail,
          role: "Clients",
          companyId: effectiveComp,
          companyIds: [effectiveComp],
          branchId: newInvoice.branchId,
          branchName: newInvoice.branchName,
          status: "Active",
        },
        false,
      ).catch(() => {});
    } catch {}

    try {
      const allClients = await getClients();
      const existingClient = allClients.find(
        (c) =>
          (c.email &&
            c.email.toLowerCase().trim() ===
              newInvoice.clientEmail?.toLowerCase().trim()) ||
          (c.name &&
            c.name.toLowerCase().trim() ===
              newInvoice.client.toLowerCase().trim()),
      );
      if (existingClient) {
        const invAmt = parseCurrencyNumber(newInvoice.totalInvoiced);
        const recAmt = parseCurrencyNumber(newInvoice.paymentReceived);
        const dueAmt = parseCurrencyNumber(newInvoice.due);

        const curInv = parseCurrencyNumber(existingClient.totalInvoiced);
        const curRec = parseCurrencyNumber(existingClient.paymentReceived);
        const curDue = parseCurrencyNumber(existingClient.due);

        saveStoredClient(
          {
            ...existingClient,
            email: newInvoice.clientEmail,
            companyId: existingClient.companyId || effectiveComp,
            branchId: existingClient.branchId || newInvoice.branchId,
            branchName: existingClient.branchName || newInvoice.branchName,
            totalInvoiced: `₹${(curInv + invAmt).toLocaleString("en-IN")}`,
            paymentReceived: `₹${(curRec + recAmt).toLocaleString("en-IN")}`,
            due: `₹${(curDue + dueAmt).toLocaleString("en-IN")}`,
          },
          effectiveComp,
        ).catch(() => {});
      }
    } catch {}
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new CustomEvent("saampark_data_synced"));
    window.dispatchEvent(new CustomEvent("saampark_invoices_updated"));
    window.dispatchEvent(new CustomEvent("saampark_clients_updated"));
  }

  recordActivityLog({
    type: "invoice",
    module: "Invoices",
    action: "Tax Invoice Generated",
    description: `Tax Invoice #${newInvoice.id} issued for ${newInvoice.client} (${newInvoice.totalInvoiced})`,
    companyId: newInvoice.companyId,
    branchId: newInvoice.branchId,
    branchName: newInvoice.branchName,
    details: `Project: ${newInvoice.project || "General"} | Due Date: ${newInvoice.dueDate} | Total: ${newInvoice.totalInvoiced}`,
  }).catch(() => {});

  return newInvoice;
};

export const updateInvoice = async (
  updatedInvoice: InvoiceItem,
  companyId?: string,
): Promise<InvoiceItem> => {
  const strId = String(updatedInvoice.id).toUpperCase().trim();
  const allInvoices = await getInvoices("all");
  const existingInv = allInvoices.find(
    (i) => String(i.id).toUpperCase().trim() === strId,
  );

  const oldCompanyId = (existingInv?.companyId || companyId || "tech")
    .toLowerCase()
    .trim();
  const newCompanyId = (updatedInvoice.companyId || companyId || oldCompanyId)
    .toLowerCase()
    .trim();

  const finalInvoice: InvoiceItem = {
    ...existingInv,
    ...updatedInvoice,
    companyId: newCompanyId,
  };

  // Cross-Company Transfer: remove from old company only when company changed
  if (newCompanyId !== oldCompanyId && oldCompanyId !== "all") {
    const oldList = await fetchModuleDataFromDB<InvoiceItem[]>(
      "invoices",
      [],
      oldCompanyId,
    ).catch(() => []);
    const filteredOld = oldList.filter(
      (i) => String(i.id).toUpperCase().trim() !== strId,
    );
    await api.post("/store/invoices", {
      data: filteredOld,
      company_id: oldCompanyId,
      mode: "replace",
    });
  }

  // Send ONLY the updated invoice — backend merges into company & root keys
  const targetComp = companyId || newCompanyId;
  await saveModuleDataToDB("invoices", [finalInvoice], targetComp);

  // Build updated list in memory only for recalculating client totals
  const updatedAll = [
    finalInvoice,
    ...allInvoices.filter((i) => String(i.id).toUpperCase().trim() !== strId),
  ];

  // Update client billing stats
  try {
    const clients = await getClients(newCompanyId);
    const clientIdx = clients.findIndex(
      (c) =>
        (c.name &&
          c.name.toLowerCase().trim() ===
            (updatedInvoice.client || "").toLowerCase().trim()) ||
        (updatedInvoice.clientEmail &&
          c.email &&
          c.email.toLowerCase().trim() ===
            updatedInvoice.clientEmail.toLowerCase().trim()),
    );
    if (clientIdx !== -1) {
      const c = clients[clientIdx];
      const clientInvoices = updatedAll.filter(
        (inv: InvoiceItem) =>
          (inv.client &&
            inv.client.toLowerCase().trim() === c.name.toLowerCase().trim()) ||
          (inv.clientEmail &&
            c.email &&
            inv.clientEmail.toLowerCase().trim() ===
              c.email.toLowerCase().trim()),
      );
      const sumInvoiced = clientInvoices.reduce(
        (sum: number, i: InvoiceItem) =>
          sum + parseCurrencyNumber(i.totalInvoiced),
        0,
      );
      const sumReceived = clientInvoices.reduce(
        (sum: number, i: InvoiceItem) =>
          sum + parseCurrencyNumber(i.paymentReceived),
        0,
      );
      const sumDue = clientInvoices.reduce(
        (sum: number, i: InvoiceItem) => sum + parseCurrencyNumber(i.due),
        0,
      );

      await saveStoredClient(
        {
          ...c,
          totalInvoiced: `₹${sumInvoiced.toLocaleString("en-IN")}`,
          paymentReceived: `₹${sumReceived.toLocaleString("en-IN")}`,
          due: `₹${sumDue.toLocaleString("en-IN")}`,
        },
        newCompanyId,
      );
    }
  } catch (err) {
    console.warn("Error updating client balance after invoice update:", err);
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("saampark_data_synced"));
    window.dispatchEvent(new Event("saampark_invoices_updated"));
    window.dispatchEvent(new Event("storage"));
  }

  return finalInvoice;
};
