import { AttendanceService } from "@/services/hrService"

export const attendanceFeatureService = {
  async getAll(params: Record<string, string> = {}) {
    const data = await AttendanceService.getAll(params)
    return Array.isArray(data) ? data : []
  },
  clockIn: AttendanceService.clockIn,
  clockOut: AttendanceService.clockOut,
  getStatus: AttendanceService.getStatus,
  getByEmployee: AttendanceService.getByEmployee,
  getByCompany: AttendanceService.getByCompany,
}
