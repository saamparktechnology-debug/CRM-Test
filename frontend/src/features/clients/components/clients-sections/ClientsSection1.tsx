"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Tag, Upload, Plus, FolderPlus, Receipt } from "lucide-react"
import { ClientTabMode, ClientItem, ContactItem, ClientLabelItem } from "@/features/clients/types"
import { OverviewView } from "@/features/clients/components/OverviewView"
import { ClientsTableView } from "@/features/clients/components/ClientsTableView"
import { ContactsTableView } from "@/features/clients/components/ContactsTableView"
import { AddClientModal } from "@/features/clients/components/AddClientModal"
import { ManageClientLabelsModal } from "@/features/clients/components/ManageClientLabelsModal"
import { AddClientProjectModal } from "@/features/clients/components/AddClientProjectModal"
import { ClientHistoryModal } from "@/features/clients/components/ClientHistoryModal"
import { InvoiceModal } from "@/features/invoice/components/InvoiceModal"
import { DocumentStudioModal } from "@/components/documents/DocumentStudioModal"
import {
  getClients,
  saveStoredClient,
  deleteStoredClient,
  getStoredContacts,
  saveStoredContact,
  deleteStoredContact,
  getStoredClientLabels,
  saveStoredClientLabel,
  deleteStoredClientLabel,
  getClientTimestamp,
} from "@/features/clients/services/clientService"
import { executeWithFeedback, useActionFeedbackStore } from "@/store/useActionFeedbackStore"
import { getProjects } from "@/features/projects/services/projectService"
import { getInvoices } from "@/features/invoice/services/invoiceService"
import { getPayments } from "@/features/payments/services/paymentService"
import { getUsers } from "@/features/users/services/userService"
import { normalizeCompanyId } from "@/features/leads/services/leadService"
import { useAuthStore } from "@/store/useAuthStore"
import { usePermissionStore } from "@/store/usePermissionStore"
import { ThreeDotLoader } from "@/components/ui/ThreeDotLoader"
import { isRecordAssignedToClient, isRecordAssignedToTeamMember } from "@/lib/clientScopeUtils"

export function ClientsSection1({ ctrl }: { ctrl: any }) {
  const { isClientRole, setActiveTab, activeTab, setIsManageLabelsModalOpen, setStudioClient, setIsStudioOpen, setSelectedClientForProject, setInitialCreationMode, setIsAddProjectModalOpen, canAddClient, setSelectedClientForEdit, setIsAddClientModalOpen, isLoading, clients, contacts, handleDeleteClient, setSelectedClientForHistory, setIsHistoryModalOpen, handleDeleteContact } = ctrl;
  return (
    <>
      {/* Pending Client Details Notice Banner */}
      {isClientRole && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3 text-amber-900 dark:text-amber-200 shadow-sm">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center text-lg shrink-0 mt-0.5">
            ⏳
          </div>
          <div>
            <h3 className="font-bold text-sm">Client Account Registered — Details Pending Admin Review</h3>
            <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-0.5">
              Welcome to your SAAMPARK Client Section! Your account is registered. An Administrator will review and fill out your organization profile, assigned contacts, and contract terms shortly.
            </p>
          </div>
        </div>
      )}

      {/* Header & Tabs Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-2">
        {/* Top View Tabs: Overview, Clients, Contacts */}
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`text-sm font-semibold pb-2 relative transition-colors ${
              activeTab === "overview"
                ? "text-slate-800 dark:text-slate-100"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Overview
            {activeTab === "overview" && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"
              />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("clients")}
            className={`text-sm font-semibold pb-2 relative transition-colors ${
              activeTab === "clients"
                ? "text-slate-800 dark:text-slate-100"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Clients
            {activeTab === "clients" && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"
              />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("contacts")}
            className={`text-sm font-semibold pb-2 relative transition-colors ${
              activeTab === "contacts"
                ? "text-slate-800 dark:text-slate-100"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Contacts
            {activeTab === "contacts" && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"
              />
            )}
          </button>
        </div>

        {/* Top Right Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsManageLabelsModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Tag size={14} className="text-slate-500" />
            <span>Manage labels</span>
          </button>

          <button
            type="button"
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Upload size={14} className="text-slate-500" />
            <span>{activeTab === "contacts" ? "Import contacts" : "Import clients"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setStudioClient(null)
              setIsStudioOpen(true)
            }}
            className="px-3.5 py-1.5 rounded-lg border border-teal-200 dark:border-teal-800 bg-teal-50/80 dark:bg-teal-950/40 text-xs font-semibold text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/60 flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            title="Open Interactive Split-Screen Invoice Studio"
          >
            <Receipt size={14} className="text-teal-600 dark:text-teal-400" />
            <span>🎨 Live Studio Invoice</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedClientForProject(null)
              setInitialCreationMode("project_and_invoice")
              setIsAddProjectModalOpen(true)
            }}
            className="px-3.5 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/80 dark:bg-blue-950/40 text-xs font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <FolderPlus size={14} className="text-blue-600 dark:text-blue-400" />
            <span>+ Invoice / Project</span>
          </button>

          {canAddClient && (
            <button
              type="button"
              onClick={() => {
                setSelectedClientForEdit(null)
                setIsAddClientModalOpen(true)
              }}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <Plus size={14} className="text-slate-600" />
              <span>Add client</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab Views Content */}
      {isLoading ? (
        <ThreeDotLoader text="Loading client accounts & contacts..." fullScreen={false} />
      ) : (
        <>
          {activeTab === "overview" && (
            <OverviewView totalClients={clients.length} totalContacts={contacts.length} />
          )}

          {activeTab === "clients" && (
            <ClientsTableView
              clients={clients}
              onDeleteClient={handleDeleteClient}
              onEditClient={(client) => {
                setSelectedClientForEdit(client)
                setIsAddClientModalOpen(true)
              }}
              onAddProjectClient={(client, mode) => {
                setSelectedClientForProject(client)
                setInitialCreationMode(mode || "project_and_invoice")
                setIsAddProjectModalOpen(true)
              }}
              onOpenStudioInvoice={(client) => {
                setStudioClient(client)
                setIsStudioOpen(true)
              }}
              onViewClientHistory={(client) => {
                setSelectedClientForHistory(client)
                setIsHistoryModalOpen(true)
              }}
            />
          )}
          {activeTab === "contacts" && (
            <ContactsTableView
              contacts={contacts}
              onDeleteContact={handleDeleteContact}
            />
          )}
        </>
      )}
    </>
  );
}
