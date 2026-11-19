import { api } from "@/lib/api"

export const teamPaymentsService = {
  getAll: async () => api.get("/team-payments"),
}
export default teamPaymentsService
