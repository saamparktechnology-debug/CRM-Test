"use client"

import * as React from "react"
import { ChevronDown, Search, Check, X } from "lucide-react"

// All Major Countries (India default)
export * from "@/features/leads/constants/indiaStatesDistricts.constants"
export * from "@/features/leads/constants/indiaCities.constants"


interface SearchableSelectProps {
  label?: string
  value: string
  onChange: (val: string) => void
  options: string[]
  placeholder?: string
  searchPlaceholder?: string
  disabled?: boolean
  className?: string
}

export function SearchableSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  disabled = false,
  className = "",
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  const searchInputRef = React.useRef<HTMLInputElement>(null)

  // Close on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      setTimeout(() => searchInputRef.current?.focus(), 50)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  // Normalize options and ensure current value is present if set
  const allAvailableOptions = React.useMemo(() => {
    const list = Array.isArray(options) ? [...options] : []
    if (value && value.trim() && !list.some(o => o.toLowerCase().trim() === value.toLowerCase().trim())) {
      list.unshift(value.trim())
    }
    return Array.from(new Set(list))
  }, [options, value])

  const filteredOptions = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return allAvailableOptions
    return allAvailableOptions.filter((opt) => opt.toLowerCase().includes(q))
  }, [allAvailableOptions, search])

  const isExactMatch = allAvailableOptions.some(
    (opt) => opt.toLowerCase().trim() === search.toLowerCase().trim()
  )

  const handleSelect = (val: string) => {
    onChange(val)
    setIsOpen(false)
    setSearch("")
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen((prev) => !prev)
            setSearch("")
          }
        }}
        className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors ${
          disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-750"
        }`}
      >
        <span className={`truncate font-medium ${value ? "text-zinc-800 dark:text-zinc-200" : "text-zinc-400"}`}>
          {value || placeholder}
        </span>
        <ChevronDown size={14} className={`text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1 w-full min-w-[220px] max-h-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-2xl z-[99999] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100">
          {/* Search Box */}
          <div className="p-2 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-800/70 sticky top-0">
            <div className="relative flex items-center">
              <Search size={13} className="absolute left-2.5 text-zinc-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-7 pr-7 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="overflow-y-auto max-h-52 divide-y divide-zinc-50 dark:divide-zinc-800/50">
            {/* Custom value option if user typed something not strictly in the list */}
            {search.trim() && !isExactMatch && (
              <button
                type="button"
                onClick={() => handleSelect(search.trim())}
                className="w-full px-3 py-2 text-left text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 font-semibold flex items-center justify-between"
              >
                <span>+ Use &quot;{search.trim()}&quot;</span>
                <span className="text-[10px] text-blue-500 bg-blue-100 dark:bg-blue-900/60 px-1.5 py-0.5 rounded">Custom</span>
              </button>
            )}

            {filteredOptions.length === 0 && !search.trim() && (
              <div className="p-3 text-center text-xs text-zinc-400">No options found. Type custom name above.</div>
            )}

            {filteredOptions.map((opt) => {
              const isSelected = opt.toLowerCase().trim() === (value || "").toLowerCase().trim()
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleSelect(opt)}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition-colors ${
                    isSelected
                      ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold"
                      : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  <span className="truncate">{opt}</span>
                  {isSelected && <Check size={13} className="text-blue-600 dark:text-blue-400 shrink-0 ml-1" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
