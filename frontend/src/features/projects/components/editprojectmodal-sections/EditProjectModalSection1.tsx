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

export function EditProjectModalSection1({ ctrl }: { ctrl: any }) {
  const { attachedInvoice, project, clientPaidAmount, numericProjectTotal, clientDueAmount, title, setTitle, projectType, setProjectType, client, setClient, projectCategory, techStack, setTechStack, newTechInput, setNewTechInput, gitUrl, setGitUrl, liveUrl, setLiveUrl, hostingEnvironment, setHostingEnvironment } = ctrl;
  return (
    <>
      {/* Attached Invoice Direct Sync Card */}
          <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-blue-600 text-white shrink-0">
                <Receipt size={16} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    Attached Invoice: {attachedInvoice?.invoiceNumber || project.invoiceNumber || project.invoiceId || "Live Synced"}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    clientPaidAmount >= numericProjectTotal && numericProjectTotal > 0
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : clientPaidAmount > 0
                      ? "bg-blue-100 text-blue-800 border border-blue-200"
                      : "bg-amber-100 text-amber-800 border border-amber-200"
                  }`}>
                    {clientPaidAmount >= numericProjectTotal && numericProjectTotal > 0 ? "Fully Paid" : clientPaidAmount > 0 ? "Advance Received" : "Payment Pending"}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500">
                  Project price is attached to invoice. Modifying price synchronizes the official invoice.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 text-[11px]">
              <div className="text-right">
                <span className="text-zinc-400 block text-[10px]">Client Paid</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">₹{clientPaidAmount.toLocaleString("en-IN")}</span>
              </div>
              <div className="text-right">
                <span className="text-zinc-400 block text-[10px]">Balance Due</span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">₹{clientDueAmount.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-zinc-500 font-medium">Title</label>
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-800 dark:text-zinc-200 font-semibold"
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

          {/* Client (only if Client Project) */}
          {projectType === "Client Project" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-zinc-500 font-medium">Client</label>
              <input
                type="text"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                className="col-span-3 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-800 dark:text-zinc-200 font-semibold"
              />
            </div>
          )}

          {/* DEDICATED SPECIFICATIONS CARD: NORMAL TECH PROJECT */}
          {projectCategory === "Technical Project" && (
            <div className="p-4 rounded-xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider pb-1 border-b border-blue-100 dark:border-blue-900/40">
                <Code size={14} />
                <span>Technical Project Architecture & Environment</span>
              </div>

              {/* Tech Stack Pills */}
              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">
                  Technology Stack
                </label>
                <div className="flex flex-wrap items-center gap-1.5 p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg min-h-[38px]">
                  {techStack.map((tech) => (
                    <span
                      key={tech}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                    >
                      <button
                        type="button"
                        onClick={() => setTechStack(techStack.filter((t) => t !== tech))}
                        className="hover:text-rose-600 cursor-pointer"
                      >
                        ×
                      </button>
                      {tech}
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder="Add tech (e.g. Next.js, Flutter) & hit Enter..."
                    value={newTechInput}
                    onChange={(e) => setNewTechInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        if (newTechInput.trim() && !techStack.includes(newTechInput.trim())) {
                          setTechStack([...techStack, newTechInput.trim()])
                          setNewTechInput("")
                        }
                      }
                    }}
                    className="flex-1 bg-transparent border-none focus:outline-none text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 text-xs min-w-[120px]"
                  />
                </div>
                {/* Quick Add Suggestions */}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {["Next.js", "React", "Node.js", "Flutter", "PostgreSQL", "Docker", "Tailwind"].map((sug) => (
                    !techStack.includes(sug) && (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => setTechStack([...techStack, sug])}
                        className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-blue-100 hover:text-blue-700 cursor-pointer transition-colors"
                      >
                        + {sug}
                      </button>
                    )
                  ))}
                </div>
              </div>

              {/* Git URL & Live URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1 flex items-center gap-1">
                    <GitBranch size={12} className="text-zinc-400" />
                    <span>Git Repository URL</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://github.com/saampark/..."
                    value={gitUrl}
                    onChange={(e) => setGitUrl(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1 flex items-center gap-1">
                    <Globe size={12} className="text-zinc-400" />
                    <span>Live / Staging Domain</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://gramgo.in"
                    value={liveUrl}
                    onChange={(e) => setLiveUrl(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Hosting Environment */}
              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1 flex items-center gap-1">
                  <Server size={12} className="text-zinc-400" />
                  <span>Hosting Infrastructure & Server</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dedicated Linux VPS (Hostinger / DigitalOcean), AWS EC2, Vercel"
                  value={hostingEnvironment}
                  onChange={(e) => setHostingEnvironment(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                />
              </div>
            </div>
          )}
    </>
  );
}
