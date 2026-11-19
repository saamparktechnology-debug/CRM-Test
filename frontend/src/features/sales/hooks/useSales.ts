import { useQuery } from "@tanstack/react-query"
import { QUERY_RESTRICTIONS } from "@/lib/queryOptions"
import { getInvoices } from "@/features/invoice/services/invoiceService"
import { getOrders } from "@/features/orders/services/orderService"
import { getPayments } from "@/features/payments/services/paymentService"

export function useSalesInvoicesQuery(companyId: string, enabled = true) {
  return useQuery({
    queryKey: ["sales", "invoices", companyId],
    queryFn: () => getInvoices(companyId),
    enabled,
    ...QUERY_RESTRICTIONS,
  })
}

export function useSalesOrdersQuery(companyId: string, enabled = true) {
  return useQuery({
    queryKey: ["sales", "orders", companyId],
    queryFn: () => getOrders(companyId),
    enabled,
    ...QUERY_RESTRICTIONS,
  })
}

export function useSalesPaymentsQuery(companyId: string, enabled = true) {
  return useQuery({
    queryKey: ["sales", "payments", companyId],
    queryFn: () => getPayments(companyId),
    enabled,
    ...QUERY_RESTRICTIONS,
  })
}
