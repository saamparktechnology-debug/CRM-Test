import { getLocalDeletedIds } from "@/lib/storageSync"
import { InvoiceItem } from "../types/invoice.types"

export const parseInvoiceDate = (val: any): Date => {
  if (!val) return new Date();
  if (val instanceof Date && !isNaN(val.getTime())) return val;
  if (typeof val === "number") return new Date(val);
  if (typeof val === "string") {
    const s = val.trim();
    // YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
      const parts = s.split("-");
      const d = new Date(
        Number(parts[0]),
        Number(parts[1]) - 1,
        Number(parts[2].slice(0, 2)),
      );
      if (!isNaN(d.getTime())) return d;
    }
    // DD/MM/YYYY or DD-MM-YYYY
    if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}/.test(s)) {
      const parts = s.split(/[\/\-]/);
      const d = new Date(
        Number(parts[2]),
        Number(parts[1]) - 1,
        Number(parts[0]),
      );
      if (!isNaN(d.getTime())) return d;
    }
    const d = new Date(s);
    if (!isNaN(d.getTime())) return d;
  }
  return new Date();
};

export const generateInvoiceNumber = (
  existingInvoices: InvoiceItem[] = [],
  dateObj: Date | string = new Date(),
  isNonGst: boolean = false,
): string => {
  const parsedDate =
    typeof dateObj === "string"
      ? parseInvoiceDate(dateObj)
      : isNaN(dateObj.getTime())
        ? new Date()
        : dateObj;
  const d = String(parsedDate.getDate()).padStart(2, "0");
  const m = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const y = String(parsedDate.getFullYear());
  const dateStr = `${d}${m}${y}`;

  // Indian Financial Year (April 1 - March 31), e.g., 2026-27
  const fyStartYear =
    parsedDate.getMonth() >= 3
      ? parsedDate.getFullYear()
      : parsedDate.getFullYear() - 1;
  const finYear = `${fyStartYear}-${String(fyStartYear + 1).slice(-2)}`;

  // Standard serial format: INV-FINYEAR-0001 for Tax Invoice (GST), NG-(date)001 for Non-GST
  const prefix = isNonGst ? `NG-${dateStr}` : `INV-${finYear}-`;
  const unhyphenatedPrefix = isNonGst ? `NG${dateStr}` : `INV-${finYear}`;
  const legacyPrefix = isNonGst ? `NGINV-${dateStr}-` : `INV-${finYear}-`;
  const legacyHyphen = isNonGst ? `NG-${dateStr}-` : `INV-${finYear}-`;

  const deletedIds = getLocalDeletedIds();

  let maxSeq = 0;
  const allExisting = [...existingInvoices];

  const checkCandidate = (rawId: any) => {
    if (!rawId) return;
    const cleanId = String(rawId).trim().toUpperCase();
    if (cleanId.startsWith(prefix)) {
      const suffix = cleanId.substring(prefix.length).replace(/^-/, "");
      const num = parseInt(suffix, 10);
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num;
      }
    } else if (cleanId.startsWith(unhyphenatedPrefix)) {
      const suffix = cleanId
        .substring(unhyphenatedPrefix.length)
        .replace(/^-/, "");
      const num = parseInt(suffix, 10);
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num;
      }
    } else if (cleanId.startsWith(legacyPrefix)) {
      const suffix = cleanId.substring(legacyPrefix.length);
      const num = parseInt(suffix, 10);
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num;
      }
    } else if (cleanId.startsWith(legacyHyphen)) {
      const suffix = cleanId.substring(legacyHyphen.length);
      const num = parseInt(suffix, 10);
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num;
      }
    }
  };

  for (const inv of allExisting) {
    if (inv && inv.id) checkCandidate(inv.id);
    if (inv && (inv as any).invoice_number)
      checkCandidate((inv as any).invoice_number);
  }

  // Also check deleted IDs so invoice sequence never collides with a previously deleted ID
  for (const delId of deletedIds) {
    checkCandidate(delId);
  }

  const nextSeq = maxSeq + 1;
  const seqStr = String(nextSeq).padStart(isNonGst ? 3 : 4, "0");
  return `${prefix}${seqStr}`;
};

export function parseCurrencyNumber(val: any): number {
  if (typeof val === "number") return isNaN(val) ? 0 : val;
  if (!val) return 0;
  const cleaned = String(val).replace(/[^0-9.-]/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : Math.round(parsed);
}

export function parseInvoiceDateTimestamp(dateStr?: string): number | null {
  if (!dateStr || dateStr === "-" || dateStr === "") return null;
  const dmy = String(dateStr)
    .trim()
    .match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (dmy) {
    return new Date(
      Number(dmy[3]),
      Number(dmy[2]) - 1,
      Number(dmy[1]),
    ).getTime();
  }
  const ymd = String(dateStr)
    .trim()
    .match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (ymd) {
    return new Date(
      Number(ymd[1]),
      Number(ymd[2]) - 1,
      Number(ymd[3]),
    ).getTime();
  }
  const parsed = Date.parse(dateStr);
  return isNaN(parsed) ? null : parsed;
}

export function isInvoiceOverdue(invoice: InvoiceItem): boolean {
  if (
    !invoice.dueDate ||
    invoice.status === "Fully paid" ||
    invoice.status === "Credited"
  ) {
    return false;
  }
  const dueAmt = parseCurrencyNumber(invoice.due || invoice.totalInvoiced);
  if (dueAmt <= 0) return false;

  const dueTime = parseInvoiceDateTimestamp(invoice.dueDate);
  if (!dueTime) return false;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  return dueTime < todayStart.getTime();
}

export function getInvoiceDaysOverdue(dueDateStr?: string): number {
  if (!dueDateStr) return 0;
  const dueTime = parseInvoiceDateTimestamp(dueDateStr);
  if (!dueTime) return 0;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const diffMs = todayStart.getTime() - dueTime;
  if (diffMs <= 0) return 0;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

