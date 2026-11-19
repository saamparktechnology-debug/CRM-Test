export type Role = 'Super Admin' | 'Admin' | 'Clients' | 'Teams'
export type CompanyId = string

export interface Branch {
  id: string
  companyId: string
  company_id?: string | number
  name: string
  branch_name?: string
  code?: string
  brand_name?: string
  division_name?: string
  subtitle?: string
  logo_url?: string
  signatory_name?: string
  signatory_designation?: string
  signature_image_url?: string
  stamp_image_url?: string
  gstin?: string
  pan?: string
  cin?: string
  msme_reg?: string
  iso_certification?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  country?: string
  phone?: string
  email?: string
  website?: string
  managerName?: string
  managerPhone?: string
  managerEmail?: string
  upi_id?: string
  account_holder?: string
  bank_name?: string
  account_number?: string
  ifsc_code?: string
  bank_branch?: string
  payment_qr_url?: string
  bankDetails?: {
    accountHolder?: string
    bankName?: string
    accountNumber?: string
    ifscCode?: string
    upiId?: string
  }
  gst_bank_name?: string
  gst_account_holder?: string
  gst_account_number?: string
  gst_ifsc_code?: string
  gst_bank_branch?: string
  gst_upi_id?: string
  gst_payment_qr_url?: string
  nongst_bank_name?: string
  nongst_account_holder?: string
  nongst_account_number?: string
  nongst_ifsc_code?: string
  nongst_bank_branch?: string
  nongst_upi_id?: string
  nongst_payment_qr_url?: string
  terms_conditions?: string
  invoice_notes?: string
  quotation_notes?: string
  signature_position?: { x: number; y: number }
  stamp_position?: { x: number; y: number }
  logo_position?: { x: number; y: number }
  logo_scale?: number
  stamp_scale?: number
  signature_scale?: number
  custom_stamps?: any[]
  zoom?: number
  preview_scale?: string
  preview_invoice_type?: string
  invoice_customization?: any
  status: 'Active' | 'Inactive'
  createdAt?: string
}

export interface SubBranch {
  id: string
  numeric_id?: number | string
  parentBranchId: string
  companyId: string
  name: string
  code?: string
  partnerName?: string
  partnerPhone?: string
  partnerEmail?: string
  revenueSharePct: number
  partnerType?: 'Franchise Partner' | 'Agency Partner' | 'Satellite Office' | 'Regional Associate'
  brand_name?: string
  division_name?: string
  subtitle?: string
  logo_url?: string
  signatory_name?: string
  signatory_designation?: string
  signature_image_url?: string
  stamp_image_url?: string
  gstin?: string
  pan?: string
  cin?: string
  msme_reg?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  country?: string
  phone?: string
  email?: string
  website?: string
  upi_id?: string
  account_holder?: string
  bank_name?: string
  account_number?: string
  ifsc_code?: string
  bank_branch?: string
  payment_qr_url?: string
  bankDetails?: {
    accountHolder?: string
    bankName?: string
    accountNumber?: string
    ifscCode?: string
    upiId?: string
  }
  gst_bank_name?: string
  gst_account_holder?: string
  gst_account_number?: string
  gst_ifsc_code?: string
  gst_bank_branch?: string
  gst_upi_id?: string
  gst_payment_qr_url?: string
  nongst_bank_name?: string
  nongst_account_holder?: string
  nongst_account_number?: string
  nongst_ifsc_code?: string
  nongst_bank_branch?: string
  nongst_upi_id?: string
  nongst_payment_qr_url?: string
  terms_conditions?: string
  invoice_notes?: string
  quotation_notes?: string
  iso_certification?: string
  signature_position?: { x: number; y: number }
  stamp_position?: { x: number; y: number }
  logo_position?: { x: number; y: number }
  logo_scale?: number
  stamp_scale?: number
  signature_scale?: number
  custom_stamps?: any[]
  zoom?: number
  preview_scale?: string
  preview_invoice_type?: string
  invoice_customization?: any
  status: 'Active' | 'Inactive'
  createdAt?: string
}

export interface Company {
  id: string
  numeric_id?: number
  name: string
  brand_name?: string
  division_name?: string
  subtitle?: string
  trademark_symbol?: string
  slug?: string
  logo?: string
  logo_url?: string
  currency?: string
  currency_symbol?: string
  cin?: string
  gstin?: string
  pan?: string
  msme_reg?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  country?: string
  phone?: string
  email?: string
  website?: string
  upi_id?: string
  account_holder?: string
  bank_name?: string
  account_number?: string
  ifsc_code?: string
  bank_branch?: string
  swift_code?: string
  payment_qr_url?: string
  gst_bank_name?: string
  gst_account_holder?: string
  gst_account_number?: string
  gst_ifsc_code?: string
  gst_bank_branch?: string
  gst_upi_id?: string
  gst_payment_qr_url?: string
  nongst_bank_name?: string
  nongst_account_holder?: string
  nongst_account_number?: string
  nongst_ifsc_code?: string
  nongst_bank_branch?: string
  nongst_upi_id?: string
  nongst_payment_qr_url?: string
  terms_conditions?: string
  invoice_notes?: string
  quotation_notes?: string
  iso_certification?: string
  signatory_name?: string
  signatory_designation?: string
  signature_image_url?: string
  stamp_image_url?: string
  signature_position?: { x: number; y: number }
  stamp_position?: { x: number; y: number }
  logo_position?: { x: number; y: number }
  logo_scale?: number
  stamp_scale?: number
  signature_scale?: number
  custom_stamps?: any[]
  zoom?: number
  preview_scale?: string
  preview_invoice_type?: string
  invoice_customization?: any
  smtp_host?: string
  smtp_port?: string | number
  smtp_user?: string
  smtp_pass?: string
  smtp_from_name?: string
  smtp_from_email?: string
  smtp_secure?: boolean
}

export interface User {
  id: string | number
  name: string
  email: string
  username?: string
  role: Role
  companyId: string
  companyIds?: string[]
  branchId?: string
  branchIds?: string[]
  branchName?: string
  subBranchId?: string
  subBranchIds?: string[]
  subBranchName?: string
  sub_branch_id?: string
  sub_branch_name?: string
  avatar: string
  avatarUrl?: string
  phone?: string
  department?: string
  allowedModules?: string[]
  permissions?: any
  kycStatus?: 'Pending' | 'Processing' | 'Verified' | 'Rejected'
  kyc_status?: 'Pending' | 'Processing' | 'Verified' | 'Rejected'
  kycData?: any
  status?: 'Active' | 'Inactive' | 'Pending'
}

export interface UserEntityScope {
  isSuperAdmin: boolean
  scopeLevel: 'global' | 'company' | 'branch' | 'subbranch'
  allowedCompanyIds: string[]
  allowedBranchIds: string[]
  allowedSubBranchIds: string[]
  canAccessCompanyHq: boolean
  canAccessBranchHq: boolean
}
