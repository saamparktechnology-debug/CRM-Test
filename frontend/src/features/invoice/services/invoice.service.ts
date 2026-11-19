export * from "../types/invoice.types"
export * from "../constants/invoice.constants"
export * from "./invoiceUtils.service"
export * from "./invoiceCrud.service"
export * from "./invoicePayment.service"
export * from "./invoiceVerification.service"
export * from "./invoiceLifecycle.service"

import {
  getInvoices,
  addInvoice,
  updateInvoice,
} from "./invoiceCrud.service"
import {
  checkAndSendOverdueReminders,
  updateInvoiceStatus,
  recordPartialPayment,
  markPaymentCompleted,
} from "./invoicePayment.service"
import {
  submitClientPaymentProof,
  verifyAndConfirmPayment,
  sendPaymentReminder,
  sendRetainerExpiryReminder,
} from "./invoiceVerification.service"
import {
  deleteInvoice,
  clientAcceptInvoice,
} from "./invoiceLifecycle.service"

export const invoiceService = {
  getInvoices,
  addInvoice,
  updateInvoice,
  deleteInvoice,
  updateInvoiceStatus,
  recordPartialPayment,
  markPaymentCompleted,
  checkAndSendOverdueReminders,
  submitClientPaymentProof,
  verifyAndConfirmPayment,
  sendPaymentReminder,
  sendRetainerExpiryReminder,
  clientAcceptInvoice,
}

export default invoiceService
