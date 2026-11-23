"use client"

import * as React from "react"
import { useMasterBundle } from "@/features/masters/hooks/useMasters"
import { X, Check, Users, Shield, UserCheck, Search, Percent, Sparkles, Building2 } from "lucide-react"
import { Project, ProjectType, ProjectMember, ProjectMilestone } from "@/features/projects/types"
import { addProject } from "@/features/projects/services/projectService"
import { getUsers } from "@/features/users/services/userService"
import { getClients } from "@/features/clients/services/clientService"
import { UserService } from "@/services/apiServices"
import { useAuthStore, getSelectableCompanies } from "@/store/useAuthStore"
import { executeWithFeedback } from "@/store/useActionFeedbackStore"
import { type AddProjectModalProps } from "@/features/projects/components/addprojectmodal-sections/AddProjectModalHelpers"

export function AddProjectModalSection3({ ctrl }: { ctrl: any }) {
  const { data: masterBundle } = useMasterBundle()
  const { description, setDescription, startDate, setStartDate, deadline, setDeadline, baseAmount, setBaseAmount, setupCharge, setSetupCharge, discount, setDiscount, gstRate, setGstRate, numericComputedPrice, price, setPrice, labels, setLabels } = ctrl;
  return (
    <>
      {/* Description */}
          <div className="grid grid-cols-4 items-start gap-4">
            <label className="text-zinc-500 font-medium pt-2">Description</label>
            <textarea
              rows={3}
              placeholder="Project description, scope, and objectives..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3 p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-800 dark:text-zinc-200 text-xs resize-none"
            />
          </div>

          {/* Start date */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-zinc-500 font-medium">Start date</label>
            <input
              type="text"
              placeholder="YYYY-MM-DD or DD/MM/YYYY"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="col-span-3 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-800 dark:text-zinc-200"
            />
          </div>

          {/* Deadline */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-zinc-500 font-medium">Deadline</label>
            <input
              type="text"
              placeholder="YYYY-MM-DD or DD/MM/YYYY"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="col-span-3 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-800 dark:text-zinc-200"
            />
          </div>

          {/* Price & Billing Calculation */}
          <div className="grid grid-cols-4 items-start gap-4">
            <label className="text-zinc-500 font-medium pt-2">Price & Tax Breakdown</label>
            <div className="col-span-3 space-y-2 p-3 bg-zinc-50 dark:bg-zinc-850/50 rounded-xl border border-zinc-200 dark:border-zinc-700">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-zinc-500 font-medium block text-[10.5px] mb-1">Base Price (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 50000"
                    value={baseAmount}
                    onChange={(e) => {
                      const val = e.target.value
                      setBaseAmount(val === "" ? "" : Math.max(0, Number(val)))
                    }}
                    className="w-full px-3 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-800 dark:text-zinc-200 font-semibold"
                  />
                </div>

                <div>
                  <label className="text-zinc-500 font-medium block text-[10.5px] mb-1">Platform / Setup Charge (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 2500"
                    value={setupCharge}
                    onChange={(e) => {
                      const val = e.target.value
                      setSetupCharge(val === "" ? "" : Math.max(0, Number(val)))
                    }}
                    className="w-full px-3 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-800 dark:text-zinc-200 font-semibold"
                  />
                </div>

                <div>
                  <label className="text-zinc-500 font-medium block text-[10.5px] mb-1">Less: Discount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 1000"
                    value={discount}
                    onChange={(e) => {
                      const val = e.target.value
                      setDiscount(val === "" ? "" : Math.max(0, Number(val)))
                    }}
                    className="w-full px-3 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-800 dark:text-zinc-200 font-semibold"
                  />
                </div>

                <div>
                  <label className="text-zinc-500 font-medium block text-[10.5px] mb-1">GST Rate (%)</label>
                  <select
                    value={gstRate}
                    onChange={(e) => setGstRate(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-800 dark:text-zinc-200 font-semibold"
                  >
                    {(masterBundle?.options?.["tax_slab"] || []).map((opt) => (
                  <option key={opt.id} value={opt.value}>{opt.label}</option>
                ))}
                  </select>
                </div>
              </div>

              {/* Price Preview */}
              <div className="grid grid-cols-4 items-center gap-2 pt-1 border-t border-zinc-200 dark:border-zinc-700">
                <label className="text-zinc-500 font-medium text-[11px]">Final Price</label>
                <div className="col-span-3 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Auto-calculated or custom"
                    value={
                      typeof baseAmount === "number" && baseAmount > 0
                        ? `₹${numericComputedPrice.toLocaleString("en-IN")}`
                        : price
                    }
                    onChange={(e) => setPrice(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-800 dark:text-zinc-200 font-bold font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Labels */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-zinc-500 font-medium">Labels</label>
            <input
              type="text"
              placeholder="Labels (comma separated, e.g. Urgent, On track)"
              value={labels}
              onChange={(e) => setLabels(e.target.value)}
              className="col-span-3 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400"
            />
          </div>
    </>
  );
}
