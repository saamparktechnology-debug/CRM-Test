import { LeaveService } from "@/services/hrService"
import { getUsers } from "../../users/services/userService"
import { LeaveRequest, LeaveType } from "../types"

export const DEFAULT_LEAVE_TYPES: LeaveType[] = []

export const leaveFeatureService = {
  async getRequests(_todayStr?: string): Promise<LeaveRequest[]> {
    const reqData = await LeaveService.getRequests({})
    return Array.isArray(reqData) ? reqData : []
  },

  async getTypes(): Promise<LeaveType[]> {
    const typeData = await LeaveService.getTypes()
    return Array.isArray(typeData) ? typeData : []
  },

  async getTeamMembers() {
    return getUsers().catch(() => [])
  },

  createRequest: LeaveService.createRequest,
  createType: LeaveService.createType,
  approve: LeaveService.approve,
  reject: LeaveService.reject,
  updateStatus: LeaveService.updateStatus,
}
