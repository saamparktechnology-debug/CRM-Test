import { api } from "@/lib/api"

export const itemsService = {
  getAll: async () => api.get("/items"),
}
export default itemsService
