import { api } from "@/lib/api"

export const debitNotesService = {
  getAll: async () => api.get("/debit-notes"),
}
export default debitNotesService
