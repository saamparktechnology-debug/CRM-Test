"use client"

import * as React from "react"
import {
  Tag,
  Upload,
  Plus,
  Filter,
  FileSpreadsheet,
  Printer,
  Search,
  ArrowDown,
  Layout,
  Pencil,
  X,
  User,
  MapPin,
  Info,
  Receipt,
  Megaphone,
  Clock,
} from "lucide-react"
import { Project } from "@/features/projects/types"
import { ProjectFiltersDropdown } from "@/features/projects/components/ProjectFiltersDropdown"
import { ProjectCompletionModal } from "@/features/projects/components/ProjectCompletionModal"
import { useAuthStore } from "@/store/useAuthStore"
import { usePermissionStore } from "@/store/usePermissionStore"
import { exportToExcel, printPDFReport } from "@/lib/exportUtils"
import { getUserAvatar } from "@/features/users/services/userService"
import { confirmTwoStepDelete } from "@/lib/confirmDialog"
import { formatDisplayDate } from "@/lib/utils"
import { type ProjectListProps } from "@/features/projects/components/projectlist-sections/ProjectListHelpers"

export function ProjectListSection2({ ctrl }: { ctrl: any }) {
  const { canAddProject, onOpenAddModal, setCategoryFilter, categoryFilter, projects, softwareProjectsCount, marketingProjectsCount, setIsFiltersDropdownOpen, isFiltersDropdownOpen, activeFilter, setActiveFilter, isMarketingAllowed, handleExportExcel, handlePrint, searchQuery, setSearchQuery } = ctrl;
  return (
    <>
      {/* ---------------- TOP HEADER BAR (Image 1) ---------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-100">Projects</h1>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => alert("Manage labels clicked")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors shadow-2xs"
          >
            <Tag size={13} className="text-zinc-500" />
            <span>Manage labels</span>
          </button>

          <button
            type="button"
            onClick={() => alert("Import projects clicked")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors shadow-2xs"
          >
            <Upload size={13} className="text-zinc-500" />
            <span>Import projects</span>
          </button>

          {canAddProject && (
            <button
              type="button"
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors shadow-2xs"
            >
              <Plus size={14} className="text-zinc-500" />
              <span>Add project</span>
            </button>
          )}
        </div>
      </div>

      {/* ---------------- WORKSPACE SEPARATION (Software vs Digital Marketing) ---------------- */}
      <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl border border-zinc-200/80 dark:border-zinc-700/80 text-xs font-bold w-fit">
        <button
          type="button"
          onClick={() => setCategoryFilter("all")}
          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
            categoryFilter === "all"
              ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
              : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          }`}
        >
          All Projects ({projects.length})
        </button>
        <button
          type="button"
          onClick={() => setCategoryFilter("software")}
          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
            categoryFilter === "software"
              ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs"
              : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          }`}
        >
          <span>💻 Software &amp; General</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 font-mono">
            {softwareProjectsCount}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setCategoryFilter("marketing")}
          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
            categoryFilter === "marketing"
              ? "bg-white dark:bg-zinc-900 text-purple-600 dark:text-purple-400 shadow-xs"
              : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          }`}
        >
          <span>📊 Digital Marketing Retainers</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-600 font-mono">
            {marketingProjectsCount}
          </span>
        </button>
      </div>

      {/* ---------------- CONTROL TOOLBAR (Image 1 & 2) ---------------- */}
      <div className="box-3d p-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl">
        
        {/* Left Side Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Sidebar Layout Toggle Icon */}
          <button
            type="button"
            className="p-1.5 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-md bg-zinc-50/50 dark:bg-zinc-800/50"
          >
            <Layout size={15} />
          </button>

          {/* Filters Dropdown Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsFiltersDropdownOpen(!isFiltersDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100/80 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md hover:bg-zinc-200/70 transition-colors"
            >
              <Filter size={13} className="text-zinc-500" />
              <span>Filters</span>
              <span className="text-[10px] ml-0.5">▼</span>
            </button>

            <ProjectFiltersDropdown
              isOpen={isFiltersDropdownOpen}
              onClose={() => setIsFiltersDropdownOpen(false)}
              activeFilter={activeFilter}
              onSelectFilter={setActiveFilter}
            />
          </div>

          {/* Plus Quick Button */}
          {canAddProject && (
            <button
              type="button"
              onClick={onOpenAddModal}
              className="p-1.5 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-md bg-zinc-50/50 dark:bg-zinc-800/50"
            >
              <Plus size={14} />
            </button>
          )}

          {/* Filter Pills matching Image 1 */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs ml-1">
            {(isMarketingAllowed
              ? ["All projects", "Digital Marketing", "Open projects", "Completed", "High Priority", "Upcoming"]
              : ["All projects", "Open projects", "Completed", "High Priority", "Upcoming"]
            ).map((f) => {
              const isActive = activeFilter === f
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setActiveFilter(f)}
                  className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-medium border border-blue-200 dark:border-blue-800"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  {f}
                </button>
              )
            })}
          </div>
        </div>

        {/* Right Side Tools */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportExcel}
            className="px-2.5 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Excel
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-2.5 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Print
          </button>

          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-40 sm:w-52 pl-3 pr-8 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400"
            />
            <Search size={13} className="absolute right-2.5 top-2 text-zinc-400" />
          </div>
        </div>

      </div>
    </>
  );
}
