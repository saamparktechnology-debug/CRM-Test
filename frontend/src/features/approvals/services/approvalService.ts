import {
  approveApprovalRequest,
  deleteApprovalRequest,
  getApprovalRequests,
  rejectApprovalRequest,
  submitForApproval,
  getPendingApprovalsCount,
  ApprovalRequest,
} from "@/services/approvalService"

function normalizeReviewer(
  reviewer: string | { id?: string; name: string; email?: string; role?: string }
): { id?: string; name: string; email: string; role: string } {
  if (typeof reviewer === "object" && reviewer !== null) {
    return {
      id: reviewer.id,
      name: reviewer.name || "Administrator",
      email: reviewer.email || "",
      role: reviewer.role || "Admin",
    }
  }
  return {
    name: String(reviewer || "Administrator"),
    email: "",
    role: "Admin",
  }
}

export const approvalFeatureService = {
  async getAll(companyId: string): Promise<ApprovalRequest[]> {
    const data = await getApprovalRequests(companyId || "all")
    return Array.isArray(data) ? data : []
  },

  async approve(
    id: string,
    reviewer: string | { id?: string; name: string; email?: string; role?: string }
  ) {
    return approveApprovalRequest(id, normalizeReviewer(reviewer))
  },

  async reject(
    id: string,
    reviewer: string | { id?: string; name: string; email?: string; role?: string },
    reason: string
  ) {
    return rejectApprovalRequest(id, normalizeReviewer(reviewer), reason)
  },

  async remove(id: string) {
    return deleteApprovalRequest(id)
  },

  submitForApproval,
  getPendingApprovalsCount,
}
