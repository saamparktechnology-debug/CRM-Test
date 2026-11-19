import { getInvoices } from "@/features/invoice/services/invoiceService"
import { getPayments } from "@/features/payments/services/paymentService"
import { getClients } from "../../clients/services/clientService"
import { getLeads } from "../../leads/services/leadService"
import { getSubscriptions } from "../../subscriptions/services/subscriptionService"
import { getProjects } from "../../projects/services/projectService"
import { taskService } from "../../tasks/services/taskService"

export const reportFeatureService = {
  getInvoices,
  getPayments,
  getClients,
  getLeads,
  getSubscriptions,
  getProjects,
  getTasks: taskService.getTasks,
}
