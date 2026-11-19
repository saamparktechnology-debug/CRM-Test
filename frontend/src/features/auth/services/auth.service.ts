import { api } from '@/lib/api'
import axiosInstance, { toFormData } from '@/lib/axios'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  password: string
  name?: string
  full_name?: string
  role?: string
}

export const AuthService = {
  login: async (payload: LoginPayload) => api.post('/auth/login', payload),
  register: async (payload: RegisterPayload) => api.post('/auth/register', payload),
  verifyEmail: async (payload: { email: string; otp: string }) => api.post('/auth/verify-email', payload),
  sendForgotPasswordOTP: async (payload: { email: string }) => api.post('/auth/forgot-password', payload),
  verifyResetOTP: async (payload: { email: string; otp: string }) => api.post('/auth/verify-reset-otp', payload),
  resetPassword: async (payload: { email: string; newPassword: string; resetToken: string }) =>
    api.post('/auth/reset-password', payload),
  loginWithPin: async (payload: { email?: string; identifier?: string; pin: string }) =>
    api.post('/auth/pin-login', payload),
  sendPinOTP: async (payload: { email: string }) => api.post('/auth/send-pin-otp', payload),
  setupPin: async (payload: { email: string; pin: string; otp?: string }) => api.post('/auth/setup-pin', payload),
  resetPin: async (payload: { email: string; otp: string; newPin: string }) => api.post('/auth/reset-pin', payload),
  getMe: async () => api.get('/auth/me'),
  checkUsernameAvailability: async (username: string, excludeIdOrEmail = '') =>
    api.get(
      `/auth/check-username/${encodeURIComponent(username)}?excludeEmail=${encodeURIComponent(excludeIdOrEmail)}&excludeId=${encodeURIComponent(excludeIdOrEmail)}`
    ),
  updateProfileMultipart: async (payload: FormData | Record<string, any>) => {
    const formData = toFormData(payload)
    const res = await axiosInstance.putForm('/auth/profile', formData)
    return res.data
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('saampark_token')
    }
  },
}

export const authService = AuthService
export default AuthService
