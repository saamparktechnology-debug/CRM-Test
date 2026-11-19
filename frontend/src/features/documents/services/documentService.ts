import { DocumentService } from "@/services/supportService"
import axiosInstance, { toFormData } from "@/lib/axios"
import { DocumentFormValues, DocumentItem } from "../types"

export const documentFeatureService = {
  async getAll(): Promise<DocumentItem[]> {
    const data = await DocumentService.getAll({})
    return Array.isArray(data) ? data : []
  },

  async getExpiring(days = 30): Promise<DocumentItem[]> {
    const data = await DocumentService.getExpiring(days)
    return Array.isArray(data) ? data : []
  },

  async create(payload: DocumentFormValues | FormData): Promise<DocumentItem> {
    const formData = toFormData(payload)
    const res = await axiosInstance.postForm("/support/documents", formData)
    return res.data?.data ?? res.data
  },

  async remove(id: string): Promise<void> {
    return DocumentService.delete(id)
  },
}
