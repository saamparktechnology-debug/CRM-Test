export interface MasterType {
  id: number
  code: string
  name: string
  module_group: string
  description?: string | null
  allow_custom_other: number | boolean
  is_system: number | boolean
  is_active: number | boolean
  sort_order: number
}

export interface MasterOption {
  id: number
  type_code: string
  company_id?: string | null
  label: string
  value: string
  code?: string | null
  metadata?: Record<string, any> | null
  sort_order: number
  is_default: number | boolean
  is_active: number | boolean
}

export interface MasterBundle {
  types: MasterType[]
  options: Record<string, MasterOption[]>
}

export interface CreateMasterOptionPayload {
  type_code: string
  company_id?: string | null
  label: string
  value?: string
  code?: string | null
  metadata?: Record<string, any> | null
  sort_order?: number
  is_default?: boolean
  is_active?: boolean
}

export interface CreateMasterTypePayload {
  code: string
  name: string
  module_group?: string
  description?: string
  allow_custom_other?: boolean
  sort_order?: number
}
