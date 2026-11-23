'use client'

import React, { useState } from 'react'
import { X } from 'lucide-react'

interface MasterTypeModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (payload: {
    code: string
    name: string
    module_group: string
    description: string
    allow_custom_other: boolean
  }) => Promise<void>
}

export function MasterTypeModal({ isOpen, onClose, onSubmit }: MasterTypeModalProps) {
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [moduleGroup, setModuleGroup] = useState('Sales & Services')
  const [description, setDescription] = useState('')
  const [allowCustomOther, setAllowCustomOther] = useState(false)
  const [saving, setSaving] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !code.trim()) return
    setSaving(true)
    try {
      await onSubmit({
        code: code.trim().toLowerCase().replace(/[^a-z0-9_]+/g, '_'),
        name: name.trim(),
        module_group: moduleGroup,
        description: description.trim(),
        allow_custom_other: allowCustomOther,
      })
      setName('')
      setCode('')
      setDescription('')
      setAllowCustomOther(false)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Create New Master Type</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Master Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (!code) {
                  setCode(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''))
                }
              }}
              placeholder="e.g. Vendor Categories"
              className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Unique Code *</label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. vendor_category"
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Module Group</label>
            <input
              type="text"
              value={moduleGroup}
              onChange={(e) => setModuleGroup(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950"
            />
          </div>
          <label className="inline-flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
            <input
              type="checkbox"
              checked={allowCustomOther}
              onChange={(e) => setAllowCustomOther(e.target.checked)}
              className="rounded"
            />
            Allow &quot;Other&quot; custom input field in dropdowns
          </label>
          <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-zinc-700">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white">
              {saving ? 'Creating...' : 'Create Master'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
