import { api } from "@/lib/api"

export const teamTimecardsService = {
  getAll: async () => api.get("/team-timecards"),
}
export default teamTimecardsService
