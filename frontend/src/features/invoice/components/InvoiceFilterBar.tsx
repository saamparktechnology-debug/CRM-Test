"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Sparkles } from "lucide-react"
import { DataTable } from "@/components/ui/DataTable"
import { ThreeDotLoader } from "@/components/ui/ThreeDotLoader"
import { InvoiceItem, InvoiceFilterTab, ModuleCategoryFilter } from "../types/invoice.types"

interface InvoiceFilterBarProps {
  isLoading: boolean
  displayedInvoices: InvoiceItem[]
  columns: ColumnDef<InvoiceItem>[]
  moduleCategoryFilter: ModuleCategoryFilter
  setModuleCategoryFilter: (v: ModuleCategoryFilter) => void
  activeTab: InvoiceFilterTab
  setActiveTab: (v: InvoiceFilterTab) => void
  overdueCount: number
  searchQuery: string
  setSearchQuery: (v: string) => void
}

export function InvoiceFilterBar({
  isLoading,
  displayedInvoices,
  columns,
  moduleCategoryFilter,
  setModuleCategoryFilter,
  activeTab,
  setActiveTab,
  overdueCount,
  searchQuery,
  setSearchQuery,
}: InvoiceFilterBarProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl shadow-2xs overflow-hidden">
      <div className="px-4 pt-3.5 pb-2 border-b border-zinc-100 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 bg-zinc-50/50 dark:bg-zinc-900/50">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mr-1">
            Billing Category:
          </span>
          {(
            [
              { id: "all", label: "All Invoices" },
              { id: "software", label: "Software & IT Projects" },
              { id: "marketing", label: "Digital Marketing (Form-9)", isMarketing: true },
            ] as const
          ).map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setModuleCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                moduleCategoryFilter === cat.id
                  ? "isMarketing" in cat && cat.isMarketing
                    ? "bg-purple-600 text-white shadow-xs"
                    : "bg-blue-600 text-white shadow-xs"
                  : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100"
              }`}
            >
              {"isMarketing" in cat && cat.isMarketing && <Sparkles className="w-3 h-3" />}
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "All Bills" },
            { id: "Fully paid", label: "Fully Paid" },
            { id: "Partially paid", label: "Partially Paid" },
            { id: "Not paid", label: "Unpaid / Due" },
            { id: "Pending Verification", label: "Verify UTR" },
            { id: "overdue", label: `Overdue (${overdueCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as InvoiceFilterTab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? tab.id === "overdue"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Search invoice #, client, project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="p-0">
        {isLoading ? (
          <div className="py-16 flex justify-center">
            <ThreeDotLoader />
          </div>
        ) : (
          <DataTable columns={columns} data={displayedInvoices} />
        )}
      </div>
    </div>
  )
}
