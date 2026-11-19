import * as React from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { QUERY_RESTRICTIONS } from "@/lib/queryOptions"
import {
  getInvoices,
  InvoiceItem,
  InvoiceFilterTab,
  ModuleCategoryFilter,
  parseCurrencyNumber,
  isInvoiceOverdue,
  checkAndSendOverdueReminders,
  sendPaymentReminder,
  sendRetainerExpiryReminder,
  deleteInvoice,
} from "../services/invoice.service"
import { isMatchingCompany, useAuthStore } from "@/store/useAuthStore"
import {
  isRecordAssignedToClient,
  isRecordAssignedToTeamMember,
} from "@/lib/clientScopeUtils"
import { executeWithFeedback } from "@/store/useActionFeedbackStore"
import { confirmTwoStepDelete } from "@/lib/confirmDialog"

export const invoiceQueryKey = (scope: string) => ["sales", "invoices", scope] as const

export function useInvoicesQuery(companyScope: string, enabled = true) {
  return useQuery({
    queryKey: invoiceQueryKey(companyScope || "all"),
    queryFn: () => getInvoices(companyScope || "all"),
    enabled,
    ...QUERY_RESTRICTIONS,
  })
}

export function useFilteredInvoices(params: {
  invoices: InvoiceItem[]
  moduleCategoryFilter: ModuleCategoryFilter
  activeTab: InvoiceFilterTab
  searchQuery: string
  urlBranchSlug: string | null
}) {
  const { invoices, moduleCategoryFilter, activeTab, searchQuery, urlBranchSlug } = params
  const { user, activeCompanyId, activeBranchId, activeSubBranchId, branches, subBranches } = useAuthStore()
  const isClientRole = user?.role === "Clients" || user?.role?.toLowerCase().includes("client")
  const clientEmailNorm = (user?.email || "").toLowerCase().trim()
  const clientNameNorm = (user?.name || "").toLowerCase().trim()

  const displayedInvoices = React.useMemo(() => {
    const userComp = (activeCompanyId || user?.companyId || "")
      .toLowerCase()
      .trim();
    const targetBranch =
      activeBranchId ||
      urlBranchSlug ||
      (user?.role !== "Super Admin" && user?.role !== "Admin"
        ? user?.branchId
        : null);
    const targetSubBranch =
      activeSubBranchId ||
      (user?.role !== "Super Admin" && user?.role !== "Admin"
        ? (user as any)?.subBranchId
        : null);

    const isAllBranch =
      !targetBranch ||
      targetBranch === "all" ||
      targetBranch === "hq" ||
      targetBranch === "main";

    const targetBranchObj = (branches as any[]).find((b: any) => {
      if (!b || isAllBranch) return false;
      const target = String(targetBranch).toLowerCase().trim();
      const bId = String(b.id || "")
        .toLowerCase()
        .trim();
      const bCode = String(b.code || "")
        .toLowerCase()
        .trim();
      const bName = String(b.name || "")
        .toLowerCase()
        .trim();
      const bSlug = bName.replace(/\s+/g, "-");
      return (
        bId === target ||
        bCode === target ||
        bName === target ||
        bSlug === target
      );
    });
    const targetBranchId = String(targetBranchObj?.id || targetBranch || "")
      .toLowerCase()
      .trim();
    const targetBranchName = targetBranchObj?.name?.toLowerCase().trim() || "";
    const targetBranchCode = String(targetBranchObj?.code || "")
      .toLowerCase()
      .trim();

    const checkBranch = (i: any) => {
      if (isAllBranch) return true;
      const iBranch = String(i.branchId || i.branch_id || "")
        .toLowerCase()
        .trim();
      const iBranchName = String(i.branchName || i.branch_name || "")
        .toLowerCase()
        .trim();
      const iBranchCode = String(i.branchCode || i.branch_code || "")
        .toLowerCase()
        .trim();

      // Strict branch isolation: unassigned invoices do NOT leak into a specific branch
      if (!iBranch && !iBranchName && !iBranchCode) return false;

      return Boolean(
        (iBranch &&
          (iBranch === targetBranchId ||
            (targetBranchCode && iBranch === targetBranchCode) ||
            (targetBranchName && iBranch === targetBranchName))) ||
        (iBranchName &&
          (iBranchName === targetBranchName ||
            iBranchName === targetBranchId ||
            (targetBranchCode && iBranchName === targetBranchCode))) ||
        (iBranchCode &&
          ((targetBranchCode && iBranchCode === targetBranchCode) ||
            iBranchCode === targetBranchId ||
            (targetBranchName && iBranchCode === targetBranchName))),
      );
    };

    const isAllSubBranch =
      !targetSubBranch ||
      targetSubBranch === "all" ||
      targetSubBranch === "main" ||
      targetSubBranch === "hq" ||
      targetSubBranch === "all_subbranches";
    const targetSbObj = (subBranches as any[]).find((sb: any) => {
      if (!sb || isAllSubBranch) return false;
      const target = String(targetSubBranch).toLowerCase().trim();
      const sbId = String(sb.id || "")
        .toLowerCase()
        .trim();
      const sbCode = String(sb.code || "")
        .toLowerCase()
        .trim();
      const sbName = String(sb.name || "")
        .toLowerCase()
        .trim();
      const sbSlug = sbName.replace(/\s+/g, "-");
      return (
        sbId === target ||
        sbCode === target ||
        sbName === target ||
        sbSlug === target
      );
    });
    const targetSbId = String(targetSbObj?.id || targetSubBranch || "")
      .toLowerCase()
      .trim();
    const targetSbName = targetSbObj?.name?.toLowerCase().trim() || "";
    const targetSbCode = String(targetSbObj?.code || "")
      .toLowerCase()
      .trim();

    const checkSubBranch = (i: any) => {
      if (isAllSubBranch) return true;
      const iSubBranch = String(
        i.subBranchId || (i as any)?.sub_branch_id || "",
      )
        .toLowerCase()
        .trim();
      const iSubBranchName = String(
        i.subBranchName || (i as any)?.sub_branch_name || "",
      )
        .toLowerCase()
        .trim();
      const iSubBranchCode = String(
        (i as any)?.subBranchCode || (i as any)?.sub_branch_code || "",
      )
        .toLowerCase()
        .trim();
      if (!iSubBranch && !iSubBranchName && !iSubBranchCode) return false;

      return Boolean(
        (iSubBranch &&
          (iSubBranch === targetSbId ||
            (targetSbCode && iSubBranch === targetSbCode) ||
            (targetSbName && iSubBranch === targetSbName))) ||
        (iSubBranchName &&
          (iSubBranchName === targetSbName ||
            iSubBranchName === targetSbId ||
            (targetSbCode && iSubBranchName === targetSbCode))) ||
        (iSubBranchCode &&
          ((targetSbCode && iSubBranchCode === targetSbCode) ||
            iSubBranchCode === targetSbId ||
            (targetSbName && iSubBranchCode === targetSbName))),
      );
    };

    // Separate Digital Marketing invoices from standard Software/Project invoices
    const isMkt = (i: InvoiceItem) => {
      if (i.primaryCategory === "Digital Marketing") return true;
      if (
        Boolean(
          (i as any)?.marketingPackage?.enabled ||
          (i as any)?.marketingPackage?.planName,
        )
      )
        return true;
      const p = (i.project || "").toLowerCase();
      if (
        p.includes("marketing") ||
        p.includes("retainer") ||
        p.includes("social media") ||
        p.includes("poster") ||
        p.includes("reel")
      )
        return true;
      return (i.items || []).some((it) => {
        const name = (it.serviceName || "").toLowerCase();
        return (
          name.includes("marketing") ||
          name.includes("poster") ||
          name.includes("video") ||
          name.includes("reel") ||
          name.includes("social")
        );
      });
    };

    let filtered = invoices;
    if (isClientRole) {
      filtered = filtered.filter((i) => isRecordAssignedToClient(i, user));
    } else {
      if (user?.role === "Teams" || (user?.role as string) === "Team") {
        filtered = filtered.filter((i) =>
          isRecordAssignedToTeamMember(i, user),
        );
      }
      if (userComp && userComp !== "all") {
        filtered = filtered.filter((i) => {
          const iComp = (i.companyId || (i as any).company || "tech")
            .toLowerCase()
            .trim();
          return isMatchingCompany({ id: iComp, slug: iComp } as any, userComp);
        });
      }
      if (!isAllBranch) {
        filtered = filtered.filter((i) => checkBranch(i));
      }
      if (!isAllSubBranch) {
        filtered = filtered.filter((i) => checkSubBranch(i));
      }
    }

    if (activeTab === "overdue") {
      filtered = filtered.filter(isInvoiceOverdue);
    } else if (activeTab !== "all") {
      filtered = filtered.filter((i) => i.status === activeTab);
    }

    if (moduleCategoryFilter === "software") {
      filtered = filtered.filter((i) => !isMkt(i));
    } else if (moduleCategoryFilter === "marketing") {
      filtered = filtered.filter((i) => isMkt(i));
    }

    // Newly created / latest invoices strictly on top
    filtered.sort((a, b) => {
      const timeA = new Date(
        a.createdAt || a.date || a.billDate || a.invoiceDate || 0,
      ).getTime();
      const timeB = new Date(
        b.createdAt || b.date || b.billDate || b.invoiceDate || 0,
      ).getTime();
      if (timeA !== timeB && !isNaN(timeA) && !isNaN(timeB)) {
        return timeB - timeA;
      }
      return String(b.id || "").localeCompare(String(a.id || ""), undefined, {
        numeric: true,
      });
    });

    return filtered;
  }, [
    invoices,
    isClientRole,
    clientEmailNorm,
    clientNameNorm,
    activeCompanyId,
    activeBranchId,
    activeSubBranchId,
    urlBranchSlug,
    branches,
    subBranches,
    user?.companyId,
    user?.branchId,
    activeTab,
    moduleCategoryFilter,
  ]);

  // Summary Metrics based on displayed invoices
  const totalInvoicedNum = displayedInvoices.reduce(
    (sum, i) => sum + parseCurrencyNumber(i.totalInvoiced),
    0,
  );
  const totalReceivedNum = displayedInvoices.reduce((sum, i) => {
    const inv = parseCurrencyNumber(i.totalInvoiced);
    const rec = parseCurrencyNumber(i.paymentReceived);
    return sum + Math.min(rec, inv);
  }, 0);
  const totalDueNum = displayedInvoices.reduce(
    (sum, i) => sum + parseCurrencyNumber(i.due),
    0,
  );
  const pendingCount = displayedInvoices.filter(
    (i) =>
      i.status === "Not paid" ||
      i.status === "Payment Pending" ||
      i.status === "Partially paid",
  ).length;
  const overdueCount = React.useMemo(() => {
    return invoices.filter(isInvoiceOverdue).length;
  }, [invoices]);


  return {
    displayedInvoices,
    totalInvoicedNum,
    totalReceivedNum,
    totalDueNum,
    pendingCount,
    overdueCount,
  }
}

export function useInvoiceOperations(params: {
  invoices: InvoiceItem[]
  setInvoices: React.Dispatch<React.SetStateAction<InvoiceItem[]>>
  loadInvoices: () => Promise<void>
  showToast: (msg: string) => void
  activeCompanyId: string | null
}) {
  const { invoices, setInvoices, loadInvoices, showToast, activeCompanyId } = params
  const [isSendingOverdueBatch, setIsSendingOverdueBatch] = React.useState(false)

  const handleBatchOverdueReminders = async () => {
    setIsSendingOverdueBatch(true)
    try {
      await executeWithFeedback(
        async () => {
          const res = await checkAndSendOverdueReminders(activeCompanyId || "all")
          await loadInvoices()
          return res
        },
        {
          actionType: "email",
          loadingTitle: "Scanning Overdue Invoices",
          loadingMsg: "Dispatching overdue payment reminders to clients & admins...",
          successTitle: "Overdue Reminders Sent",
          successMsg: "All overdue invoice notifications have been dispatched.",
        }
      )
    } finally {
      setIsSendingOverdueBatch(false)
    }
  }

  const handleSendReminder = async (invoice: InvoiceItem) => {
    await executeWithFeedback(
      async () => {
        const res = await sendPaymentReminder(invoice.id)
        await loadInvoices()
        return res
      },
      {
        actionType: "email",
        loadingTitle: "Sending Payment Reminder...",
        loadingMsg: `Notifying ${invoice.client} for Invoice #${invoice.id}...`,
        successTitle: "Payment Reminder Sent",
        successMsg: `Payment reminder email dispatched to ${invoice.clientEmail || invoice.client}.`,
      }
    )
  }

  const handleSendRetainerExpiry = async (invoice: InvoiceItem) => {
    await executeWithFeedback(
      async () => {
        const res = await sendRetainerExpiryReminder(invoice.id)
        await loadInvoices()
        return res
      },
      {
        actionType: "email",
        loadingTitle: "Sending Retainer Renewal Alert...",
        loadingMsg: `Sending Form No-9 renewal notice to ${invoice.client}...`,
        successTitle: "Retainer Expiry Alert Dispatched",
        successMsg: `Retainer renewal reminder sent to ${invoice.client}.`,
      }
    )
  }

  const handleDeleteInvoice = async (id: string) => {
    const inv = invoices.find((i) => String(i.id).toUpperCase().trim() === String(id).toUpperCase().trim())
    const label = inv ? `${inv.id} (${inv.client || "Invoice"})` : id
    const confirmed = await confirmTwoStepDelete(label, "invoice")
    if (!confirmed) return

    await executeWithFeedback(
      async () => {
        const updated = await deleteInvoice(id)
        setInvoices(updated)
      },
      {
        actionType: "delete",
        loadingTitle: "Deleting Invoice...",
        loadingMsg: `Removing invoice ${id}...`,
        successTitle: "Invoice Deleted",
        successMsg: `Invoice ${id} has been permanently deleted.`,
      }
    )
    showToast(`Invoice ${id} deleted.`)
  }

  return {
    isSendingOverdueBatch,
    handleBatchOverdueReminders,
    handleSendReminder,
    handleSendRetainerExpiry,
    handleDeleteInvoice,
  }
}
