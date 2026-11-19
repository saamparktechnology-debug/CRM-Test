"use client"

import * as React from "react"
import { X, Check, Users, Shield, UserCheck, Search, Percent, Sparkles, Building2 } from "lucide-react"
import { Project, ProjectType, ProjectMember, ProjectMilestone } from "@/features/projects/types"
import { addProject } from "@/features/projects/services/projectService"
import { getUsers } from "@/features/users/services/userService"
import { getClients } from "@/features/clients/services/clientService"
import { UserService } from "@/services/apiServices"
import { useAuthStore, getSelectableCompanies } from "@/store/useAuthStore"
import { executeWithFeedback } from "@/store/useActionFeedbackStore"
import { type AddProjectModalProps } from "@/features/projects/components/addprojectmodal-sections/AddProjectModalHelpers"

export function AddProjectModalSection1({ ctrl }: { ctrl: any }) {
  const { availableSubBranchesForBranch, selectableCompanies, selectedCompanyId, setSelectedCompanyId, isBranchLocked, setSelectedBranchId, setSelectedSubBranchId, branches, user, selectedBranchId, availableBranches, selectedSubBranchId, title, setTitle, projectType, setProjectType, availableClients, client, setClient } = ctrl;
  return (
    <>
      {/* Company, Branch & Sub-Branch Selector Card */}
          <div className={`p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 grid grid-cols-1 ${availableSubBranchesForBranch.length > 0 ? "sm:grid-cols-3" : "sm:grid-cols-2"} gap-3`}>
            <div>
              <label className="block text-[10.5px] font-bold text-zinc-600 dark:text-zinc-400 mb-1 flex items-center justify-between">
                <span>Company Entity</span>
                {selectableCompanies.length <= 1 && (
                  <span className="text-[9px] text-blue-600 font-bold bg-blue-50 dark:bg-blue-950/40 px-1 py-0.2 rounded border border-blue-200 dark:border-blue-800">
                    🔒 Active Company
                  </span>
                )}
              </label>
              <select
                value={selectedCompanyId}
                onChange={(e) => {
                  setSelectedCompanyId(e.target.value)
                  if (!isBranchLocked) {
                    setSelectedBranchId("")
                    setSelectedSubBranchId("")
                  }
                }}
                disabled={selectableCompanies.length <= 1}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-200 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-85 disabled:cursor-not-allowed"
              >
                {(selectableCompanies as any[]).map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.logo || "🏢"} {c.brand_name || c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10.5px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                Branch Location
              </label>
              {isBranchLocked ? (
                <div className="w-full px-2.5 py-1.5 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg text-zinc-800 dark:text-zinc-200 text-xs font-bold flex items-center justify-between">
                  <span className="truncate">📍 {branches.find(b => b.id === user?.branchId)?.name || user?.branchId || "Assigned Branch"}</span>
                  <span className="text-[9px] text-amber-600 font-bold">🔒 Locked</span>
                </div>
              ) : (
                <select
                  value={selectedBranchId}
                  onChange={(e) => {
                    setSelectedBranchId(e.target.value)
                    setSelectedSubBranchId("")
                  }}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-200 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">🏢 Company HQ / Central Office</option>
                  {availableBranches.map((b) => (
                    <option key={b.id} value={b.id}>
                      📍 {b.name} {b.code ? `[${b.code}]` : ""}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Dynamic Sub-Branch Selector */}
            {availableSubBranchesForBranch.length > 0 && (
              <div>
                <label className="block text-[10.5px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                  Sub-Branch Partner
                </label>
                <select
                  value={selectedSubBranchId}
                  onChange={(e) => setSelectedSubBranchId(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-purple-200 dark:border-purple-800 rounded-lg text-zinc-800 dark:text-zinc-200 font-bold focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="">-- Direct Branch Project --</option>
                  {availableSubBranchesForBranch.map((sb) => (
                    <option key={sb.id} value={sb.id}>
                      🤝 {sb.name || (sb as any).sub_branch_name || sb.code}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Title */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-zinc-500 font-medium">Title *</label>
            <input
              type="text"
              placeholder="Project Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-800 dark:text-zinc-200"
            />
          </div>

          {/* Project type */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-zinc-500 font-medium">Project type</label>
            <select
              value={projectType}
              onChange={(e) => setProjectType(e.target.value as ProjectType)}
              className="col-span-3 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-800 dark:text-zinc-200"
            >
              <option value="Client Project">Client Project</option>
              <option value="Internal Project">Internal Project</option>
            </select>
          </div>

          {/* Client Selection (only if Client Project) */}
          {projectType === "Client Project" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-zinc-500 font-medium">Client *</label>
              <div className="col-span-3">
                {availableClients.length > 0 ? (
                  <select
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-800 dark:text-zinc-200 font-semibold"
                  >
                    {availableClients.map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="Client Name"
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-800 dark:text-zinc-200 font-semibold"
                  />
                )}
              </div>
            </div>
          )}

          {/* Assigned Team Members & Revenue Share % Section */}
    </>
  );
}
