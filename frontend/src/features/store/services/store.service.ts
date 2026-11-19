import { api } from "@/lib/api"

export const storeService = {
  getAll: async () => api.get("/store"),
}
export default storeService
