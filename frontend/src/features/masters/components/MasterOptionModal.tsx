'use client'

import React, { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import type { MasterOption, MasterType } from '../types/masters.types'

interface MasterOptionModalProps {
  isOpen: boolean
  onClose: () => void
  masterType: MasterType | null
  editingOption?: MasterOption | null
  primaryCategoryOptions?: MasterOption[]
  defaultPrimaryCategory?: string
  onSubmit: (payload: {
    type_code: string
    label: string
    value: string
    code?: string | null
    sort_order: number
    is_default: boolean
    is_active: boolean
    metadata?: Record<string, any> | null
  }) => Promise<void>
}

export function MasterOptionModal({
  isOpen,
  onClose,
  masterType,
  editingOption,
  primaryCategoryOptions = [],
  defaultPrimaryCategory = '',
  onSubmit,
}: MasterOptionModalProps) {
  const [label, setLabel] = useState('')
  const [value, setValue] = useState('')
  const [code, setCode] = useState('')
  const [sortOrder, setSortOrder] = useState(0)
  const [isDefault, setIsDefault] = useState(false)
  const [isActive, setIsActive] = useState(true)
  const [isOther, setIsOther] = useState(false)

  // Structured metadata fields for service_preset, marketing_package, duration_offer, tax_slab
  const [primaryCategory, setPrimaryCategory] = useState('')
  const [sac, setSac] = useState('')
  const [gst, setGst] = useState('18')
  const [unit, setUnit] = useState('Project')
  const [rate, setRate] = useState('')
  const [price, setPrice] = useState('')
  const [postersCount, setPostersCount] = useState('')
  const [reelsCount, setReelsCount] = useState('')
  const [storiesCount, setStoriesCount] = useState('')
  const [months, setMonths] = useState('')
  const [discountPct, setDiscountPct] = useState('')
  const [color, setColor] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    if (editingOption) {
      setLabel(editingOption.label || '')
      setValue(editingOption.value || '')
      setCode(editingOption.code || '')
      setSortOrder(editingOption.sort_order ?? 0)
      setIsDefault(Boolean(editingOption.is_default))
      setIsActive(Boolean(editingOption.is_active))
      const m = editingOption.metadata || {}
      setIsOther(Boolean(m.isOther))
      setPrimaryCategory(m.primary_category || defaultPrimaryCategory || '')
      setSac(m.sac || '')
      setGst(m.gst !== undefined ? String(m.gst) : m.rate !== undefined ? String(m.rate) : '18')
      setUnit(m.unit || 'Project')
      setRate(m.rate !== undefined ? String(m.rate) : '')
      setPrice(m.price !== undefined ? String(m.price) : '')
      setPostersCount(m.postersCount !== undefined ? String(m.postersCount) : '')
      setReelsCount(m.reelsCount !== undefined ? String(m.reelsCount) : '')
      setStoriesCount(m.storiesCount !== undefined ? String(m.storiesCount) : '')
      setMonths(m.months !== undefined ? String(m.months) : '')
      setDiscountPct(m.discountPct !== undefined ? String(m.discountPct) : '')
      setColor(m.color || '')
    } else {
      setLabel('')
      setValue('')
      setCode('')
      setSortOrder(0)
      setIsDefault(false)
      setIsActive(true)
      setIsOther(false)
      setPrimaryCategory(defaultPrimaryCategory || '')
      setSac('')
      setGst('18')
      setUnit('Project')
      setRate('')
      setPrice('')
      setPostersCount('')
      setReelsCount('')
      setStoriesCount('')
      setMonths('')
      setDiscountPct('')
      setColor('')
    }
  }, [isOpen, editingOption, defaultPrimaryCategory])

  if (!isOpen || !masterType) return null

  const typeCode = masterType.code

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!label.trim()) return
    setSaving(true)
    try {
      const metadata: Record<string, any> = {}
      if (isOther) metadata.isOther = true
      if (typeCode === 'service_preset') {
        if (primaryCategory) metadata.primary_category = primaryCategory
        if (sac) metadata.sac = sac
        metadata.gst = Number(gst) || 0
        metadata.unit = unit || 'Project'
        if (rate !== '') metadata.rate = Number(rate) || 0
      } else if (typeCode === 'marketing_package' || typeCode === 'subscription_package_tier') {
        if (price !== '') metadata.price = Number(price) || 0
        if (postersCount !== '') metadata.postersCount = Number(postersCount) || 0
        if (reelsCount !== '') metadata.reelsCount = Number(reelsCount) || 0
        if (storiesCount !== '') metadata.storiesCount = Number(storiesCount) || 0
      } else if (typeCode === 'duration_offer') {
        metadata.months = Number(months) || 1
        metadata.discountPct = Number(discountPct) || 0
      } else if (typeCode === 'tax_slab') {
        metadata.rate = Number(rate || value) || 0
      }
      if (color) metadata.color = color

      await onSubmit({
        type_code: typeCode,
        label: label.trim(),
        value: (value || label).trim(),
        code: code.trim() || null,
        sort_order: Number(sortOrder) || 0,
        is_default: isDefault,
        is_active: isActive,
        metadata: Object.keys(metadata).length > 0 ? metadata : null,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {editingOption ? 'Edit Master Option' : 'Add Master Option'}
            </h3>
            <p className="text-xs text-zinc-500">{masterType.name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {typeCode === 'service_preset' && primaryCategoryOptions.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Primary Category *
              </label>
              <select
                required
                value={primaryCategory}
                onChange={(e) => setPrimaryCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950"
              >
                <option value="">-- Select Primary Category --</option>
                {primaryCategoryOptions
                  .filter((c) => !c.metadata?.isOther && c.value !== 'Other')
                  .map((cat) => (
                    <option key={cat.id} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Display Label *</label>
              <input
                type="text"
                required
                value={label}
                onChange={(e) => {
                  setLabel(e.target.value)
                  if (!editingOption && !value) setValue(e.target.value)
                }}
                placeholder={typeCode === 'service_preset' ? 'e.g. E-Commerce Website' : 'e.g. Website Development'}
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Stored Value *</label>
              <input
                type="text"
                required
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="e.g. Website Development"
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Short Code (Optional)</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. WEB_DEV / 998313"
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Sort Order</label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950"
              />
            </div>
          </div>

          {typeCode === 'service_preset' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">SAC/HSN</label>
                <input type="text" value={sac} onChange={(e) => setSac(e.target.value)} className="w-full px-2.5 py-1.5 text-xs rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">GST %</label>
                <input type="number" value={gst} onChange={(e) => setGst(e.target.value)} className="w-full px-2.5 py-1.5 text-xs rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Unit</label>
                <input type="text" value={unit} onChange={(e) => setUnit(e.target.value)} className="w-full px-2.5 py-1.5 text-xs rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Default Rate</label>
                <input type="number" value={rate} onChange={(e) => setRate(e.target.value)} className="w-full px-2.5 py-1.5 text-xs rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950" />
              </div>
            </div>
          )}

          {(typeCode === 'marketing_package' || typeCode === 'subscription_package_tier') && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Price (₹)</label>
                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full px-2.5 py-1.5 text-xs rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Posters</label>
                <input type="number" value={postersCount} onChange={(e) => setPostersCount(e.target.value)} className="w-full px-2.5 py-1.5 text-xs rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Reels</label>
                <input type="number" value={reelsCount} onChange={(e) => setReelsCount(e.target.value)} className="w-full px-2.5 py-1.5 text-xs rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Stories</label>
                <input type="number" value={storiesCount} onChange={(e) => setStoriesCount(e.target.value)} className="w-full px-2.5 py-1.5 text-xs rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950" />
              </div>
            </div>
          )}

          {typeCode === 'duration_offer' && (
            <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Months</label>
                <input type="number" value={months} onChange={(e) => setMonths(e.target.value)} className="w-full px-2.5 py-1.5 text-xs rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Discount %</label>
                <input type="number" value={discountPct} onChange={(e) => setDiscountPct(e.target.value)} className="w-full px-2.5 py-1.5 text-xs rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950" />
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4 pt-1">
            <label className="inline-flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded" />
              Active
            </label>
            <label className="inline-flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
              <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} className="rounded" />
              Default Selection
            </label>
            {Boolean(masterType.allow_custom_other) && (
              <label className="inline-flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 cursor-pointer">
                <input type="checkbox" checked={isOther} onChange={(e) => setIsOther(e.target.checked)} className="rounded" />
                Triggers Custom Input (&quot;Other&quot;)
              </label>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
            >
              {saving ? 'Saving...' : editingOption ? 'Update Option' : 'Create Option'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
