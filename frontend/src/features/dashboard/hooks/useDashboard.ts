import { useQuery } from "@tanstack/react-query"
import { QUERY_RESTRICTIONS } from "@/lib/queryOptions"
import { getProjects } from "../../projects/services/projectService"
import { getInvoices } from "@/features/invoice/services/invoiceService"
import { getOrders } from "@/features/orders/services/orderService"
import { taskService } from "../../tasks/services/taskService"

export function useDashboardProjectsQuery(companyId: string, enabled = true) {
  return useQuery({
    queryKey: ["dashboard", "projects", companyId],
    queryFn: () => getProjects(companyId),
    enabled,
    ...QUERY_RESTRICTIONS,
  })
}

export function useDashboardTasksQuery(companyId: string, enabled = true) {
  return useQuery({
    queryKey: ["dashboard", "tasks", companyId],
    queryFn: () => taskService.getTasks(companyId),
    enabled,
    ...QUERY_RESTRICTIONS,
  })
}

export function useDashboardInvoicesQuery(companyId: string, enabled = true) {
  return useQuery({
    queryKey: ["dashboard", "invoices", companyId],
    queryFn: () => getInvoices(companyId),
    enabled,
    ...QUERY_RESTRICTIONS,
  })
}

export function useDashboardOrdersQuery(companyId: string, enabled = true) {
  return useQuery({
    queryKey: ["dashboard", "orders", companyId],
    queryFn: () => getOrders(companyId),
    enabled,
    ...QUERY_RESTRICTIONS,
  })
}
