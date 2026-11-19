import axiosInstance, { toFormData } from "@/lib/axios"
import { ApiError, extractApiData } from "@/lib/responseHandler"
import {
  fetchModuleDataFromDB,
  filterGlobalDeletedItems,
  markGlobalItemDeleted,
  saveModuleDataToDB,
} from "@/lib/storageSync"
import { CloudFileItem } from "../types"

export const fileFeatureService = {
  async getAll(companyId: string): Promise<CloudFileItem[]> {
    const data = await fetchModuleDataFromDB<CloudFileItem[]>("cloud_files", [], companyId)
    return Array.isArray(data) ? filterGlobalDeletedItems(data) : []
  },

  async uploadMultipart(
    file: File,
    metadata: Record<string, any> = {},
    onUploadProgress?: (e: { loaded: number; total?: number; progress?: number }) => void
  ): Promise<{ url: string; fileSize: string; fileExtension: string }> {
    const formData = toFormData({
      file,
      ...metadata,
    })
    const res = await axiosInstance.postForm("/files/upload", formData, { onUploadProgress })
    const data = extractApiData<any>(res.data, res.status)
    const uploadedUrl = data?.url || data?.file_url || data?.path
    if (!uploadedUrl || typeof uploadedUrl !== "string") {
      throw new ApiError("Server did not return a valid file URL.", res.status || 500)
    }
    const sizeMb =
      file.size < 1024 * 1024
        ? `${(file.size / 1024).toFixed(1)} KB`
        : `${(file.size / (1024 * 1024)).toFixed(2)} MB`
    const ext = file.name.includes(".") ? file.name.split(".").pop()?.toUpperCase() || "FILE" : "FILE"
    return {
      url: uploadedUrl,
      fileSize: sizeMb,
      fileExtension: ext,
    }
  },

  async saveAll(files: CloudFileItem[], companyId: string): Promise<void> {
    await saveModuleDataToDB("cloud_files", files, companyId)
  },

  async markDeleted(id: string): Promise<void> {
    await markGlobalItemDeleted(id, "cloud_files")
  },
}
