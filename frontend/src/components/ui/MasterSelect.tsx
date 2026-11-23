'use client'

import React from 'react'
import { useMasterOptions } from '@/features/masters/hooks/useMasters'
import type { MasterOption } from '@/features/masters/types/masters.types'

export interface MasterSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value'> {
  typeCode: string
  companyId?: string | null
  value: string
  onChange: (value: string, option?: MasterOption) => void
  placeholder?: string
  showEmptyOption?: boolean
  customValue?: string
  onCustomChange?: (customVal: string) => void
  customPlaceholder?: string
  customInputClassName?: string
  /** Optional filter predicate on master options */
  filterOption?: (opt: MasterOption) => boolean
}

export function MasterSelect({
  typeCode,
  companyId,
  value,
  onChange,
  placeholder = '-- Select --',
  showEmptyOption = true,
  customValue = '',
  onCustomChange,
  customPlaceholder = 'Enter custom category / value...',
  customInputClassName = '',
  filterOption,
  className = '',
  ...rest
}: MasterSelectProps) {
  const { options, typeMeta, isLoading } = useMasterOptions(typeCode, companyId)

  const filteredOptions = React.useMemo(() => {
    return filterOption ? options.filter(filterOption) : options
  }, [options, filterOption])

  const selectedOption = React.useMemo(
    () => filteredOptions.find((o) => o.value === value || o.label === value),
    [filteredOptions, value]
  )

  const isOtherSelected = Boolean(
    selectedOption?.metadata?.isOther ||
      value === 'Other' ||
      value === 'custom' ||
      (Boolean(typeMeta?.allow_custom_other) && value.toLowerCase() === 'other')
  )

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    const opt = filteredOptions.find((o) => o.value === val)
    onChange(val, opt)
  }

  return (
    <div className="space-y-2 w-full">
      <select
        value={value}
        onChange={handleSelectChange}
        className={
          className ||
          'w-full px-3 py-2 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30'
        }
        {...rest}
      >
        {showEmptyOption && (
          <option value="">{isLoading && filteredOptions.length === 0 ? 'Loading...' : placeholder}</option>
        )}
        {filteredOptions.map((opt) => (
          <option key={opt.id} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {isOtherSelected && onCustomChange && (
        <input
          type="text"
          value={customValue}
          onChange={(e) => onCustomChange(e.target.value)}
          placeholder={customPlaceholder}
          className={
            customInputClassName ||
            'w-full px-3 py-2 text-xs font-medium rounded-lg border border-indigo-300 dark:border-indigo-700 bg-indigo-50/40 dark:bg-indigo-950/20 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40'
          }
        />
      )}
    </div>
  )
}
