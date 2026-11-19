"use client"

import * as React from "react"
import { 
  X, Check, Bold, Italic, Underline, List, ListOrdered, Table, Link2, Code, Sparkles, 
  Minus, Maximize2, Users, UserCheck, Search, Percent, ExternalLink, Globe, GitBranch, 
  Server, Layers, Megaphone, Video, Image as ImageIcon, Calendar, MapPin, Receipt, 
  RefreshCw, FileText, CheckCircle2, DollarSign, Clock
} from "lucide-react"
import { Project, ProjectMember, ProjectStatus, ProjectType, isMarketingProject } from "@/features/projects/types"
import { updateProject } from "@/features/projects/services/projectService"
import { getInvoices, updateInvoice } from "@/features/invoice/services/invoiceService"
import { getUsers } from "@/features/users/services/userService"
import { UserService } from "@/services/apiServices"
import { ProjectCompletionModal } from "@/features/projects/components/ProjectCompletionModal"
import { type EditProjectModalProps, toDateInputValue } from "@/features/projects/components/editprojectmodal-sections/EditProjectModalHelpers"

export function EditProjectModalSection4({ ctrl }: { ctrl: any }) {
  const { description, setDescription, startDate, setStartDate, deadline, setDeadline, project, price, setPrice, labelsList, handleRemoveLabel, newLabelInput, setNewLabelInput, handleAddLabel, status, setStatus } = ctrl;
  return (
    <>
      {/* Description */}
          <div className="grid grid-cols-4 items-start gap-4">
            <label className="text-zinc-500 font-medium pt-2">Description</label>
            <div className="col-span-3 border border-zinc-200 dark:border-zinc-700 rounded-md overflow-hidden bg-zinc-50 dark:bg-zinc-800">
              <div className="flex items-center gap-1 p-1.5 border-b border-zinc-200 dark:border-zinc-700 text-zinc-500 overflow-x-auto">
                <button type="button" className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded"><Sparkles size={12} /></button>
                <span className="w-px h-3 bg-zinc-300 dark:bg-zinc-600 mx-1" />
                <button type="button" className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded"><Bold size={12} /></button>
                <button type="button" className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded"><Italic size={12} /></button>
                <button type="button" className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded"><Underline size={12} /></button>
                <span className="w-px h-3 bg-zinc-300 dark:bg-zinc-600 mx-1" />
                <button type="button" className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded"><List size={12} /></button>
                <button type="button" className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded"><ListOrdered size={12} /></button>
                <button type="button" className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded"><Table size={12} /></button>
                <span className="w-px h-3 bg-zinc-300 dark:bg-zinc-600 mx-1" />
                <button type="button" className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded"><Link2 size={12} /></button>
                <button type="button" className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded"><Minus size={12} /></button>
                <button type="button" className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded"><Maximize2 size={12} /></button>
                <button type="button" className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded"><Code size={12} /></button>
              </div>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 bg-transparent focus:outline-none text-zinc-800 dark:text-zinc-200 text-xs resize-none"
              />
            </div>
          </div>

          {/* Start date */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-zinc-500 font-medium flex items-center gap-1.5">
              <Calendar size={13} className="text-zinc-400" />
              <span>Start date</span>
            </label>
            <input
              type="date"
              value={toDateInputValue(startDate)}
              onChange={(e) => setStartDate(e.target.value)}
              className="col-span-3 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-800 dark:text-zinc-200 font-mono text-xs cursor-pointer"
            />
          </div>

          {/* Deadline */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-zinc-500 font-medium flex items-center gap-1.5">
              <Calendar size={13} className="text-zinc-400" />
              <span>Deadline</span>
            </label>
            <input
              type="date"
              value={toDateInputValue(deadline)}
              onChange={(e) => setDeadline(e.target.value)}
              className="col-span-3 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-red-600 dark:text-red-400 font-mono text-xs font-bold cursor-pointer"
            />
          </div>

          {/* Price & Tax Details */}
          <div className="grid grid-cols-4 items-start gap-4">
            <label className="text-zinc-500 font-medium pt-2">Price & Taxes</label>
            <div className="col-span-3 space-y-2.5">
              {/* Detailed Breakdown */}
              {(project.baseAmount !== undefined || project.gstAmount !== undefined || project.clientId || (project.items && project.items.length > 0)) ? (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-700 pb-1.5">
                    <span className="font-bold text-[11px] text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span>🧾</span>
                      <span>Client Billing Breakdown</span>
                    </span>
                    {project.items && project.items.length > 0 && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                        {project.items.length} Itemized Service(s)
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 text-slate-600 dark:text-slate-300 text-[11.5px]">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500 dark:text-zinc-400">Actual Base Price:</span>
                      <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                        ₹{(project.baseAmount ?? (project.totalAmount && project.gstAmount ? project.totalAmount - project.gstAmount : (parseFloat(String(price).replace(/[^0-9.]/g, "")) || 0))).toLocaleString("en-IN")}
                      </span>
                    </div>

                    {(project.setupCharge || 0) > 0 && (
                      <div className="flex justify-between items-center text-indigo-600 dark:text-indigo-400">
                        <span>Additional / Setup Charges:</span>
                        <span className="font-mono font-bold">
                          + ₹{project.setupCharge?.toLocaleString("en-IN")}
                        </span>
                      </div>
                    )}

                    {(project.discount || 0) > 0 && (
                      <div className="flex justify-between items-center text-rose-600 dark:text-rose-400">
                        <span>Discount Applied:</span>
                        <span className="font-mono font-bold">
                          - ₹{project.discount?.toLocaleString("en-IN")}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-blue-600 dark:text-blue-400">
                      <span>GST Tax ({project.gstRate || 18}%):</span>
                      <span className="font-mono font-bold">
                        + ₹{(project.gstAmount ?? (project.baseAmount ? Math.round(project.baseAmount * ((project.gstRate || 18) / 100)) : 0)).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="pt-1.5 border-t border-slate-200 dark:border-zinc-700 flex justify-between items-center font-extrabold text-slate-900 dark:text-slate-100">
                      <span>Total Price (With Tax):</span>
                      <span className="font-mono text-sm text-blue-600 dark:text-blue-400 font-black">
                        ₹{(project.totalAmount ?? (project.baseAmount ? (project.baseAmount + (project.gstAmount || Math.round(project.baseAmount * ((project.gstRate || 18) / 100)))) : (parseFloat(String(price).replace(/[^0-9.]/g, "")) || 0))).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Editable Input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Price (e.g. ₹35,000)"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 font-mono font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Labels with removable pills */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-zinc-500 font-medium">Labels</label>
            <div className="col-span-3 flex flex-wrap items-center gap-2 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md min-h-[38px]">
              {labelsList.map((lbl) => (
                <span
                  key={lbl}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                >
                  <button
                    type="button"
                    onClick={() => handleRemoveLabel(lbl)}
                    className="hover:text-purple-900 dark:hover:text-purple-100 cursor-pointer"
                  >
                    ×
                  </button>
                  {lbl}
                </span>
              ))}
              <input
                type="text"
                placeholder={labelsList.length === 0 ? "Add label..." : ""}
                value={newLabelInput}
                onChange={(e) => setNewLabelInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddLabel()
                  }
                }}
                className="flex-1 bg-transparent border-none focus:outline-none text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 text-xs min-w-[80px]"
              />
            </div>
          </div>

          {/* Status */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-zinc-500 font-medium">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              className="col-span-3 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-800 dark:text-zinc-200 font-semibold"
            >
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Under Review">Under Review</option>
              <option value="Hold">Hold</option>
              <option value="Completed">Completed</option>
              <option value="Finished">Finished</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
    </>
  );
}
