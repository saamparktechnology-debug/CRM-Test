import { api } from "@/lib/api"

export const teamLeaveService = {
  getAll: async () => api.get("/team-leave"),
}
export default teamLeaveService
