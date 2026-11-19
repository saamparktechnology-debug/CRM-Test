import { api } from "@/lib/api"

export const salesService = {
  getAll: async () => api.get("/sales"),
}
export default salesService
