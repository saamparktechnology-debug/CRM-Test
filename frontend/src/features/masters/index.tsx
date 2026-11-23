'use client'

import React, { useMemo, useState } from 'react'
import { Database, Edit2, FolderTree, Layers, Plus, Search, ShieldAlert, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { useMasterBundle, useMasterMutations } from './hooks/useMasters'
import { MasterOptionModal } from './components/MasterOptionModal'
import { MasterTypeModal } from './components/MasterTypeModal'
import type { MasterOption, MasterType } from './types/masters.types'

export default function MastersFeaturePage() {
  const { user } = useAuthStore()
  const isSuperAdmin = Number(user?.role_id) === 1 || String(user?.role || '').toLowerCase().includes('super')

  const { data: bundle, isLoading } = useMasterBundle('all', true, true)
  const { createType, createOption, updateOption, deleteOption } = useMasterMutations()

  const [activeTab, setActiveTab] = useState<'category_items' | 'all_masters'>('category_items')
  const [selectedPrimaryCatValue, setSelectedPrimaryCatValue] = useState<string>('Website Development')
  const [selectedTypeCode, setSelectedTypeCode] = useState<string>('primary_category')
  const [typeSearch, setTypeSearch] = useState('')
  const [optionSearch, setOptionSearch] = useState('')

  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false)
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false)
  const [editingOption, setEditingOption] = useState<MasterOption | null>(null)
  const [modalTargetTypeCode, setModalTargetTypeCode] = useState<string>('primary_category')
  const [modalDefaultPrimaryCat, setModalDefaultPrimaryCat] = useState<string>('')

  const types = bundle?.types || []
  const optionsMap = bundle?.options || {}

  const primaryCategoryType = useMemo(
    () => types.find((t) => t.code === 'primary_category') || null,
    [types]
  )
  const servicePresetType = useMemo(
    () => types.find((t) => t.code === 'service_preset') || null,
    [types]
  )

  const primaryCategories = useMemo(
    () => (optionsMap['primary_category'] || []).filter((c) => !c.metadata?.isOther && c.value !== 'Other'),
    [optionsMap]
  )

  const allServiceItems = useMemo(() => optionsMap['service_preset'] || [], [optionsMap])

  const selectedPrimaryCategoryObj = useMemo(
    () => primaryCategories.find((c) => c.value === selectedPrimaryCatValue) || primaryCategories[0] || null,
    [primaryCategories, selectedPrimaryCatValue]
  )

  const itemsForSelectedCategory = useMemo(() => {
    if (!selectedPrimaryCategoryObj) return []
    const catVal = selectedPrimaryCategoryObj.value.toLowerCase()
    return allServiceItems.filter((item) => {
      const linked = String(item.metadata?.primary_category || '').toLowerCase()
      return linked === catVal || (!linked && item.value.toLowerCase() === catVal)
    })
  }, [allServiceItems, selectedPrimaryCategoryObj])

  const groupedTypes = useMemo(() => {
    const q = typeSearch.trim().toLowerCase()
    const filtered = q
      ? types.filter((t) => t.name.toLowerCase().includes(q) || t.code.toLowerCase().includes(q) || t.module_group.toLowerCase().includes(q))
      : types
    const groups: Record<string, MasterType[]> = {}
    for (const t of filtered) {
      if (!groups[t.module_group]) groups[t.module_group] = []
      groups[t.module_group].push(t)
    }
    return groups
  }, [types, typeSearch])

  const selectedType = useMemo(
    () => types.find((t) => t.code === selectedTypeCode) || types[0] || null,
    [types, selectedTypeCode]
  )

  const modalTypeObj = useMemo(
    () => types.find((t) => t.code === modalTargetTypeCode) || selectedType,
    [types, modalTargetTypeCode, selectedType]
  )

  const currentOptions = useMemo(() => {
    const list = selectedType ? optionsMap[selectedType.code] || [] : []
    const q = optionSearch.trim().toLowerCase()
    return q
      ? list.filter((o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q) || (o.code || '').toLowerCase().includes(q))
      : list
  }, [optionsMap, selectedType, optionSearch])

  if (!isSuperAdmin) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-3">
        <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Super Admin Access Required</h2>
        <p className="text-xs text-zinc-500">Only Super Admins can create or modify global master dropdown options.</p>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-600" />
            Master Data Management
          </h1>
          <p className="text-xs text-zinc-500">
            Create Primary Categories, add Items under each Primary Category, and manage all dynamic dropdown masters.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('category_items')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
              activeTab === 'category_items'
                ? 'bg-white dark:bg-zinc-900 text-indigo-600 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            <FolderTree className="w-3.5 h-3.5" />
            Primary Categories &amp; Items
          </button>
          <button
            onClick={() => setActiveTab('all_masters')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
              activeTab === 'all_masters'
                ? 'bg-white dark:bg-zinc-900 text-indigo-600 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            All Master Dropdowns ({types.length})
          </button>
        </div>
      </div>

      {activeTab === 'category_items' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Primary Categories */}
          <div className="lg:col-span-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden flex flex-col">
            <div className="p-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2">
              <div>
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-zinc-700 dark:text-zinc-200">
                  Primary Categories
                </h2>
                <p className="text-[11px] text-zinc-500">Select a category to manage its items</p>
              </div>
              <button
                onClick={() => {
                  setModalTargetTypeCode('primary_category')
                  setModalDefaultPrimaryCat('')
                  setEditingOption(null)
                  setIsOptionModalOpen(true)
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Category
              </button>
            </div>

            <div className="p-2 space-y-1 max-h-[68vh] overflow-y-auto">
              {primaryCategories.map((cat) => {
                const count = allServiceItems.filter((item) => {
                  const linked = String(item.metadata?.primary_category || '').toLowerCase()
                  const cv = cat.value.toLowerCase()
                  return linked === cv || (!linked && item.value.toLowerCase() === cv)
                }).length
                const active = selectedPrimaryCategoryObj?.id === cat.id
                return (
                  <div
                    key={cat.id}
                    onClick={() => setSelectedPrimaryCatValue(cat.value)}
                    className={`group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition ${
                      active
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold'
                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs truncate">{cat.label}</div>
                      {!cat.is_active && <span className="text-[10px] text-rose-500">Inactive</span>}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                        {count} {count === 1 ? 'item' : 'items'}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setModalTargetTypeCode('primary_category')
                          setEditingOption(cat)
                          setIsOptionModalOpen(true)
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white dark:hover:bg-zinc-700 text-zinc-500"
                        title="Edit Primary Category"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right: Items under Selected Primary Category */}
          <div className="lg:col-span-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Items under &quot;{selectedPrimaryCategoryObj?.label || 'Primary Category'}&quot;
                </h2>
                <p className="text-xs text-zinc-500">
                  These items appear in billing &amp; project line-item preset dropdowns when this Primary Category is selected.
                </p>
              </div>
              {selectedPrimaryCategoryObj && servicePresetType && (
                <button
                  onClick={() => {
                    setModalTargetTypeCode('service_preset')
                    setModalDefaultPrimaryCat(selectedPrimaryCategoryObj.value)
                    setEditingOption(null)
                    setIsOptionModalOpen(true)
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-teal-600 hover:bg-teal-700 text-white cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Item
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-bold uppercase text-zinc-500 bg-zinc-50/70 dark:bg-zinc-950/40">
                    <th className="py-2.5 px-4">Item Name</th>
                    <th className="py-2.5 px-4">SAC / HSN</th>
                    <th className="py-2.5 px-4">GST %</th>
                    <th className="py-2.5 px-4">Unit</th>
                    <th className="py-2.5 px-4">Default Rate</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
                  {itemsForSelectedCategory.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-zinc-500">
                        No items added under &quot;{selectedPrimaryCategoryObj?.label}&quot; yet. Click &quot;Add Item&quot; to create one.
                      </td>
                    </tr>
                  ) : (
                    itemsForSelectedCategory.map((item) => (
                      <tr key={item.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/30">
                        <td className="py-2.5 px-4 font-semibold text-zinc-900 dark:text-zinc-100">{item.label}</td>
                        <td className="py-2.5 px-4 font-mono text-zinc-600 dark:text-zinc-400">{item.metadata?.sac || item.code || '—'}</td>
                        <td className="py-2.5 px-4">{item.metadata?.gst ?? 18}%</td>
                        <td className="py-2.5 px-4">{item.metadata?.unit || 'Project'}</td>
                        <td className="py-2.5 px-4 font-mono font-bold text-emerald-600">
                          ₹{Number(item.metadata?.rate ?? 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-4">
                          <button
                            onClick={() => updateOption.mutate({ id: item.id, data: { is_active: !item.is_active } })}
                            className={`inline-flex items-center gap-1 text-xs font-medium ${item.is_active ? 'text-emerald-600' : 'text-zinc-400'}`}
                          >
                            {item.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                            {item.is_active ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="py-2.5 px-4 text-right space-x-1">
                          <button
                            onClick={() => {
                              setModalTargetTypeCode('service_preset')
                              setModalDefaultPrimaryCat(selectedPrimaryCategoryObj?.value || '')
                              setEditingOption(item)
                              setIsOptionModalOpen(true)
                            }}
                            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                            title="Edit Item"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete "${item.label}"?`)) deleteOption.mutate(item.id)
                            }}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500"
                            title="Delete Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsTypeModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              <Plus className="w-3.5 h-3.5" />
              New Master Type
            </button>
            {selectedType && (
              <button
                onClick={() => {
                  setModalTargetTypeCode(selectedType.code)
                  setModalDefaultPrimaryCat('')
                  setEditingOption(null)
                  setIsOptionModalOpen(true)
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Option
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Master Types */}
            <div className="lg:col-span-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden flex flex-col max-h-[75vh]">
              <div className="p-3 border-b border-zinc-200 dark:border-zinc-800">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={typeSearch}
                    onChange={(e) => setTypeSearch(e.target.value)}
                    placeholder="Search master types..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950"
                  />
                </div>
              </div>

              <div className="overflow-y-auto p-2 space-y-4">
                {isLoading && types.length === 0 ? (
                  <div className="p-4 text-xs text-zinc-500">Loading master types...</div>
                ) : (
                  Object.entries(groupedTypes).map(([group, items]) => (
                    <div key={group} className="space-y-1">
                      <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        {group}
                      </div>
                      {items.map((t) => {
                        const count = (optionsMap[t.code] || []).length
                        const active = selectedType?.code === t.code
                        return (
                          <button
                            key={t.code}
                            onClick={() => setSelectedTypeCode(t.code)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition ${
                              active
                                ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold'
                                : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300'
                            }`}
                          >
                            <span className="truncate">{t.name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                              {count}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right: Options Table */}
            <div className="lg:col-span-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden flex flex-col">
              {selectedType ? (
                <>
                  <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{selectedType.name}</h2>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                          {selectedType.code}
                        </span>
                        {Boolean(selectedType.allow_custom_other) && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold">
                            Supports &quot;Other&quot; Input
                          </span>
                        )}
                      </div>
                      {selectedType.description && (
                        <p className="text-xs text-zinc-500 mt-0.5">{selectedType.description}</p>
                      )}
                    </div>
                    <div className="relative w-full sm:w-56">
                      <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={optionSearch}
                        onChange={(e) => setOptionSearch(e.target.value)}
                        placeholder="Filter options..."
                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-bold uppercase text-zinc-500 bg-zinc-50/70 dark:bg-zinc-950/40">
                          <th className="py-2.5 px-4">#</th>
                          <th className="py-2.5 px-4">Label</th>
                          <th className="py-2.5 px-4">Value / Code</th>
                          <th className="py-2.5 px-4">Metadata</th>
                          <th className="py-2.5 px-4">Status</th>
                          <th className="py-2.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
                        {currentOptions.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-zinc-500">
                              No options configured yet. Click &quot;Add Option&quot; to create one.
                            </td>
                          </tr>
                        ) : (
                          currentOptions.map((opt, idx) => (
                            <tr key={opt.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/30">
                              <td className="py-2.5 px-4 text-zinc-400">{opt.sort_order || idx + 1}</td>
                              <td className="py-2.5 px-4 font-semibold text-zinc-900 dark:text-zinc-100">
                                {opt.label}
                                {Boolean(opt.is_default) && (
                                  <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                                    Default
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-4 text-zinc-600 dark:text-zinc-400">
                                <div>{opt.value}</div>
                                {opt.code && <div className="text-[10px] font-mono text-zinc-400">{opt.code}</div>}
                              </td>
                              <td className="py-2.5 px-4 text-[11px] text-zinc-500 max-w-xs truncate">
                                {opt.metadata ? JSON.stringify(opt.metadata) : '—'}
                              </td>
                              <td className="py-2.5 px-4">
                                <button
                                  onClick={() =>
                                    updateOption.mutate({
                                      id: opt.id,
                                      data: { is_active: !opt.is_active },
                                    })
                                  }
                                  className={`inline-flex items-center gap-1 text-xs font-medium ${
                                    opt.is_active ? 'text-emerald-600' : 'text-zinc-400'
                                  }`}
                                >
                                  {opt.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                                  {opt.is_active ? 'Active' : 'Inactive'}
                                </button>
                              </td>
                              <td className="py-2.5 px-4 text-right space-x-1">
                                <button
                                  onClick={() => {
                                    setModalTargetTypeCode(selectedType.code)
                                    setEditingOption(opt)
                                    setIsOptionModalOpen(true)
                                  }}
                                  className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                                  title="Edit"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`Delete "${opt.label}"?`)) {
                                      deleteOption.mutate(opt.id)
                                    }
                                  }}
                                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center text-xs text-zinc-500">Select a master type to manage its options.</div>
              )}
            </div>
          </div>
        </div>
      )}

      <MasterOptionModal
        isOpen={isOptionModalOpen}
        onClose={() => setIsOptionModalOpen(false)}
        masterType={modalTypeObj || primaryCategoryType}
        editingOption={editingOption}
        primaryCategoryOptions={primaryCategories}
        defaultPrimaryCategory={modalDefaultPrimaryCat}
        onSubmit={async (payload) => {
          if (editingOption) {
            await updateOption.mutateAsync({ id: editingOption.id, data: payload })
          } else {
            await createOption.mutateAsync(payload)
          }
        }}
      />

      <MasterTypeModal
        isOpen={isTypeModalOpen}
        onClose={() => setIsTypeModalOpen(false)}
        onSubmit={async (payload) => {
          const created = await createType.mutateAsync(payload)
          if (created?.code) setSelectedTypeCode(created.code)
        }}
      />
    </div>
  )
}
