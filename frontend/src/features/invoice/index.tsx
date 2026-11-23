"use client"

import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { useAuthStore } from "@/store/useAuthStore"
import { usePermissionStore } from "@/store/usePermissionStore"
import { ThreeDotLoader } from "@/components/ui/ThreeDotLoader"
import { DocumentStudioModal } from "@/components/documents/DocumentStudioModal"
import { AddClientProjectModal } from "@/features/clients/components/AddClientProjectModal"
import { InvoiceItem } from "./types/invoice.types"
import {
  useInvoicesQuery,
  useFilteredInvoices,
  useInvoiceOperations,
  invoiceQueryKey,
} from "./hooks/invoice.hooks"
import { useInvoiceForm } from "./hooks/useInvoiceForm.hooks"
import { InvoiceHeader } from "./components/InvoiceHeader"
import { InvoiceKpiCards } from "./components/InvoiceKpiCards"
import { InvoiceFilterBar } from "./components/InvoiceFilterBar"
import { getInvoiceColumns } from "./components/InvoiceTableColumns"
import { InvoiceModal } from "./components/InvoiceModal"
import { RecordPaymentModal } from "./components/RecordPaymentModal"
import { ClientPayNowModal } from "./components/ClientPayNowModal"
import { AdminVerifyPaymentModal } from "./components/AdminVerifyPaymentModal"

function InvoicesContent() {
  const { user, activeCompanyId, branches, companies } = useAuthStore()
  const { canPerformAction } = usePermissionStore()
  const queryClient = useQueryClient()

  const isClientRole = user?.role === "Clients" || user?.role?.toLowerCase().includes("client")
  const canAddInvoice = !isClientRole && canPerformAction(user, "Invoices", "add")
  const canEditInvoice = !isClientRole && canPerformAction(user, "Invoices", "edit")
  const canDeleteInvoice = !isClientRole && canPerformAction(user, "Invoices", "delete")

  const [tempCategoryFilter, setTempCategoryFilter] = React.useState<"all" | "software" | "marketing">("all")
  const invoiceScopeComp =
    isClientRole ||
    user?.role === "Teams" ||
    (user?.role as string) === "Team" ||
    tempCategoryFilter === "marketing"
      ? "all"
      : activeCompanyId || user?.companyId || "tech"

  const { data: invoices = [], isLoading, refetch } = useInvoicesQuery(invoiceScopeComp)

  const setInvoices = React.useCallback(
    (updater: InvoiceItem[] | ((prev: InvoiceItem[]) => InvoiceItem[])) => {
      queryClient.setQueryData<InvoiceItem[]>(invoiceQueryKey(invoiceScopeComp), (prev = []) =>
        typeof updater === "function" ? updater(prev) : updater
      )
    },
    [queryClient, invoiceScopeComp]
  )

  const loadInvoices = React.useCallback(async () => {
    await refetch()
  }, [refetch])

  const form = useInvoiceForm({ invoices, setInvoices, loadInvoices })

  React.useEffect(() => {
    setTempCategoryFilter(form.moduleCategoryFilter)
  }, [form.moduleCategoryFilter])

  const {
    displayedInvoices,
    totalInvoicedNum,
    totalReceivedNum,
    totalDueNum,
    pendingCount,
    overdueCount,
  } = useFilteredInvoices({
    invoices,
    moduleCategoryFilter: form.moduleCategoryFilter,
    activeTab: form.activeTab,
    searchQuery: form.searchQuery,
    urlBranchSlug: form.urlBranchSlug,
  })

  const ops = useInvoiceOperations({
    invoices,
    setInvoices,
    loadInvoices,
    showToast: form.showToast,
    activeCompanyId,
  })

  const columns = React.useMemo(
    () =>
      getInvoiceColumns({
        user,
        isClientRole: Boolean(isClientRole),
        canEditInvoice,
        canDeleteInvoice,
        setSelectedInvoice: form.setSelectedInvoice,
        setIsInvoiceModalOpen: form.setIsInvoiceModalOpen,
        setClientPayNowInvoice: form.setClientPayNowInvoice,
        setClientUtr: form.setClientUtr,
        setClientPayNotes: form.setClientPayNotes,
        setClientPayError: form.setClientPayError,
        setVerifyingInvoice: form.setVerifyingInvoice,
        setAdminVerifyNotes: form.setAdminVerifyNotes,
        handleSendReminder: ops.handleSendReminder,
        handleSendRetainerExpiry: ops.handleSendRetainerExpiry,
        setPaymentModalInvoice: form.setPaymentModalInvoice,
        handleOpenEditInvoice: form.handleOpenEditInvoice,
        handleDeleteInvoice: ops.handleDeleteInvoice,
      }),
    [user, isClientRole, canEditInvoice, canDeleteInvoice, form, ops]
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6 max-w-[1600px] mx-auto p-4 sm:p-6 pb-20"
    >
      <AnimatePresence>
        {form.toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-[99999] bg-zinc-900 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 border border-zinc-700"
          >
            <span>{form.toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <InvoiceHeader
        user={user}
        canAddInvoice={canAddInvoice}
        overdueCount={overdueCount}
        isSendingOverdueBatch={ops.isSendingOverdueBatch}
        displayedInvoices={displayedInvoices}
        onBatchOverdueReminders={ops.handleBatchOverdueReminders}
        onOpenClientProjectModal={() => form.setIsAddClientProjectModalOpen(true)}
        onOpenNewInvoice={(isMkt) => {
          form.setIsMarketingInvoiceMode(isMkt)
          form.setAddModalInitialData(null)
          form.setIsAddModalOpen(true)
        }}
      />

      <InvoiceKpiCards
        displayedCount={displayedInvoices.length}
        totalInvoicedNum={totalInvoicedNum}
        totalReceivedNum={totalReceivedNum}
        totalDueNum={totalDueNum}
        pendingCount={pendingCount}
        overdueCount={overdueCount}
      />

      <InvoiceFilterBar
        isLoading={isLoading}
        displayedInvoices={displayedInvoices}
        columns={columns}
        moduleCategoryFilter={form.moduleCategoryFilter}
        setModuleCategoryFilter={form.setModuleCategoryFilter}
        activeTab={form.activeTab}
        setActiveTab={form.setActiveTab}
        overdueCount={overdueCount}
        searchQuery={form.searchQuery}
        setSearchQuery={form.setSearchQuery}
      />

      <InvoiceModal
        isOpen={form.isInvoiceModalOpen}
        invoice={form.selectedInvoice}
        onClose={() => {
          form.setIsInvoiceModalOpen(false)
          loadInvoices()
        }}
        onEdit={canEditInvoice ? form.handleOpenEditInvoice : undefined}
      />

      <RecordPaymentModal
        paymentModalInvoice={form.paymentModalInvoice}
        setPaymentModalInvoice={form.setPaymentModalInvoice}
        paymentTypeOption={form.paymentTypeOption}
        setPaymentTypeOption={form.setPaymentTypeOption}
        customPartPaymentAmount={form.customPartPaymentAmount}
        setCustomPartPaymentAmount={form.setCustomPartPaymentAmount}
        paymentMethod={form.paymentMethod}
        setPaymentMethod={form.setPaymentMethod}
        paymentRef={form.paymentRef}
        setPaymentRef={form.setPaymentRef}
        handleConfirmPayment={form.handleConfirmPayment}
      />

      <AddClientProjectModal
        isOpen={form.isAddClientProjectModalOpen}
        defaultMode="project_invoice"
        onClose={() => form.setIsAddClientProjectModalOpen(false)}
        onCreated={async (res) => {
          form.setIsAddClientProjectModalOpen(false)
          await loadInvoices()
          if (res?.invoice) {
            form.setSelectedInvoice(res.invoice)
            form.setIsInvoiceModalOpen(true)
          }
        }}
      />

      <DocumentStudioModal
        isOpen={form.isAddModalOpen}
        mode="invoice"
        initialData={form.addModalInitialData}
        isMarketingDefault={form.isMarketingInvoiceMode}
        onClose={() => {
          form.setIsAddModalOpen(false)
          form.setAddModalInitialData(null)
        }}
        onSuccess={async (createdDoc) => {
          form.setIsAddModalOpen(false)
          form.setAddModalInitialData(null)
          await loadInvoices()
          if (createdDoc) {
            form.setSelectedInvoice(createdDoc)
            form.setIsInvoiceModalOpen(true)
          }
        }}
      />

      <DocumentStudioModal
        isOpen={form.isEditModalOpen}
        mode="invoice"
        initialData={form.editingInvoice}
        editDocument={form.editingInvoice}
        onClose={() => {
          form.setIsEditModalOpen(false)
          form.setEditingInvoice(null)
        }}
        onSuccess={async (updatedDoc) => {
          form.setIsEditModalOpen(false)
          form.setEditingInvoice(null)
          await loadInvoices()
          if (updatedDoc) {
            form.setSelectedInvoice(updatedDoc)
            form.setIsInvoiceModalOpen(true)
          }
        }}
      />

      <ClientPayNowModal
        clientPayNowInvoice={form.clientPayNowInvoice}
        setClientPayNowInvoice={form.setClientPayNowInvoice}
        companies={companies}
        branches={branches}
        activeCompanyId={activeCompanyId}
        user={user}
        clientUtr={form.clientUtr}
        setClientUtr={form.setClientUtr}
        clientPayMethod={form.clientPayMethod}
        setClientPayMethod={form.setClientPayMethod}
        clientPayNotes={form.clientPayNotes}
        setClientPayNotes={form.setClientPayNotes}
        clientPayError={form.clientPayError}
        setClientPayError={form.setClientPayError}
        isCopied={form.isCopied}
        setIsCopied={form.setIsCopied}
        isSubmittingProof={form.isSubmittingProof}
        setIsSubmittingProof={form.setIsSubmittingProof}
        setInvoices={setInvoices}
        showToast={form.showToast}
      />

      <AdminVerifyPaymentModal
        verifyingInvoice={form.verifyingInvoice}
        setVerifyingInvoice={form.setVerifyingInvoice}
        user={user}
        adminVerifyNotes={form.adminVerifyNotes}
        setAdminVerifyNotes={form.setAdminVerifyNotes}
        isVerifyingProof={form.isVerifyingProof}
        setIsVerifyingProof={form.setIsVerifyingProof}
        isCopied={form.isCopied}
        setIsCopied={form.setIsCopied}
        setInvoices={setInvoices}
        showToast={form.showToast}
      />
    </motion.div>
  )
}

export default function InvoiceFeature() {
  return (
    <React.Suspense
      fallback={
        <div className="p-12 flex justify-center">
          <ThreeDotLoader />
        </div>
      }
    >
      <InvoicesContent />
    </React.Suspense>
  )
}
