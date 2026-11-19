import { api } from "@/lib/api"

export const teamMembersService = {
  getAll: async () => api.get("/team-members"),
}
export default teamMembersService
