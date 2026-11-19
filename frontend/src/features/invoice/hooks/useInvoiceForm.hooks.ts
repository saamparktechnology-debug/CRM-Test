import * as React from "react"
import { useSearchParams, usePathname } from "next/navigation"
import {
  InvoiceItem,
  InvoiceFilterTab,
  ModuleCategoryFilter,
  markPaymentCompleted,
  recordPartialPayment,
} from "../services/invoice.service"
import { executeWithFeedback } from "@/store/useActionFeedbackStore"

export function useInvoiceForm(params: {
  invoices: InvoiceItem[]
  setInvoices: (updater: InvoiceItem[] | ((prev: InvoiceItem[]) => InvoiceItem[])) => void
  loadInvoices: () => Promise<void>
}) {
  const { invoices, setInvoices, loadInvoices } = params
  const [moduleCategoryFilter, setModuleCategoryFilter] = React.useState<ModuleCategoryFilter>("all")
  const [activeTab, setActiveTab] = React.useState<InvoiceFilterTab>("all")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedInvoice, setSelectedInvoice] = React.useState<InvoiceItem | null>(null)
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = React.useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
  const [addModalInitialData, setAddModalInitialData] = React.useState<any>(null)
  const [isMarketingInvoiceMode, setIsMarketingInvoiceMode] = React.useState(false)
  const [isAddClientProjectModalOpen, setIsAddClientProjectModalOpen] = React.useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false)
  const [editingInvoice, setEditingInvoice] = React.useState<InvoiceItem | null>(null)
  const [toastMessage, setToastMessage] = React.useState<string | null>(null)

  // Payment Recording Modal state
  const [paymentModalInvoice, setPaymentModalInvoice] = React.useState<InvoiceItem | null>(null)
  const [paymentMethod, setPaymentMethod] = React.useState("UPI / Net Banking")
  const [paymentRef, setPaymentRef] = React.useState("")
  const [paymentTypeOption, setPaymentTypeOption] = React.useState<"full" | "part">("full")
  const [customPartPaymentAmount, setCustomPartPaymentAmount] = React.useState<number>(0)

  // Client Pay Now Modal state
  const [clientPayNowInvoice, setClientPayNowInvoice] = React.useState<InvoiceItem | null>(null)
  const [clientUtr, setClientUtr] = React.useState("")
  const [clientPayMethod, setClientPayMethod] = React.useState("UPI / PhonePe / GPay")
  const [clientPayNotes, setClientPayNotes] = React.useState("")
  const [clientPayError, setClientPayError] = React.useState<string | null>(null)
  const [isCopied, setIsCopied] = React.useState<string | null>(null)
  const [isSubmittingProof, setIsSubmittingProof] = React.useState(false)

  // Admin Verify UTR Modal state
  const [verifyingInvoice, setVerifyingInvoice] = React.useState<InvoiceItem | null>(null)
  const [adminVerifyNotes, setAdminVerifyNotes] = React.useState("")
  const [isVerifyingProof, setIsVerifyingProof] = React.useState(false)

  const searchParams = useSearchParams()
  const pathname = usePathname()

  const urlBranchSlug = React.useMemo(() => {
    if (!pathname) return null
    const segments = pathname.split("/").filter(Boolean)
    const featureIdx = segments.indexOf("feature")
    if (featureIdx >= 2) {
      const slug = segments[1]?.toLowerCase().trim()
      if (slug && slug !== "main" && slug !== "hq" && slug !== "all") {
        return slug
      }
    }
    return null
  }, [pathname])

  const showToast = React.useCallback((msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 5000)
  }, [])

  React.useEffect(() => {
    if (!searchParams) return
    const action = searchParams.get("action")
    const isNew = searchParams.get("new") === "true" || action === "new"
    if (isNew) {
      setIsAddModalOpen(true)
    }
    const viewId = searchParams.get("view")
    if (viewId && invoices.length > 0) {
      const found = invoices.find(
        (i) => String(i.id).toUpperCase().trim() === String(viewId).toUpperCase().trim()
      )
      if (found) {
        setSelectedInvoice(found)
        setIsInvoiceModalOpen(true)
      }
    }
  }, [searchParams, invoices])

  React.useEffect(() => {
    const handleReload = () => {
      loadInvoices()
    }
    window.addEventListener("storage", handleReload)
    window.addEventListener("saampark_data_synced", handleReload)
    window.addEventListener("saampark_invoices_updated", handleReload)
    window.addEventListener("saampark_company_switched", handleReload)
    window.addEventListener("saampark_branch_switched", handleReload)
    return () => {
      window.removeEventListener("storage", handleReload)
      window.removeEventListener("saampark_data_synced", handleReload)
      window.removeEventListener("saampark_invoices_updated", handleReload)
      window.removeEventListener("saampark_company_switched", handleReload)
      window.removeEventListener("saampark_branch_switched", handleReload)
    }
  }, [loadInvoices])

  const handleOpenEditInvoice = React.useCallback((inv: InvoiceItem) => {
    setEditingInvoice(inv)
    setIsInvoiceModalOpen(false)
    setIsEditModalOpen(true)
  }, [])

  const handleConfirmPayment = React.useCallback(async () => {
    if (!paymentModalInvoice) return
    const isPart = paymentTypeOption === "part" && customPartPaymentAmount > 0
    const invId = paymentModalInvoice.id
    const dueNum = parseInt(paymentModalInvoice.due.replace(/[^0-9]/g, "")) || 0
    const isOverpaid = isPart && customPartPaymentAmount > dueNum

    await executeWithFeedback(
      async () => {
        if (isPart) {
          const updated = await recordPartialPayment(
            invId,
            customPartPaymentAmount,
            paymentMethod,
            paymentRef
          )
          setInvoices(updated)
        } else {
          const updated = await markPaymentCompleted(
            invId,
            paymentMethod,
            paymentRef
          )
          setInvoices(updated)
        }
        setPaymentModalInvoice(null)
        setPaymentRef("")
        setPaymentTypeOption("full")
        setCustomPartPaymentAmount(0)
      },
      {
        actionType: "payment",
        loadingTitle: "Recording Payment...",
        loadingMsg: `Updating payment ledger for Invoice ${invId}...`,
        successTitle: isOverpaid ? "Payment & Credit Note Recorded" : "Payment Recorded",
        successMsg: `Payment for Invoice ${invId} has been recorded and synced.`,
      }
    )
  }, [paymentModalInvoice, paymentTypeOption, customPartPaymentAmount, paymentMethod, paymentRef, setInvoices])

  return {
    moduleCategoryFilter,
    setModuleCategoryFilter,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    selectedInvoice,
    setSelectedInvoice,
    isInvoiceModalOpen,
    setIsInvoiceModalOpen,
    isAddModalOpen,
    setIsAddModalOpen,
    addModalInitialData,
    setAddModalInitialData,
    isMarketingInvoiceMode,
    setIsMarketingInvoiceMode,
    isAddClientProjectModalOpen,
    setIsAddClientProjectModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    editingInvoice,
    setEditingInvoice,
    toastMessage,
    showToast,
    urlBranchSlug,
    handleOpenEditInvoice,
    paymentModalInvoice,
    setPaymentModalInvoice,
    paymentMethod,
    setPaymentMethod,
    paymentRef,
    setPaymentRef,
    paymentTypeOption,
    setPaymentTypeOption,
    customPartPaymentAmount,
    setCustomPartPaymentAmount,
    handleConfirmPayment,
    clientPayNowInvoice,
    setClientPayNowInvoice,
    clientUtr,
    setClientUtr,
    clientPayMethod,
    setClientPayMethod,
    clientPayNotes,
    setClientPayNotes,
    clientPayError,
    setClientPayError,
    isCopied,
    setIsCopied,
    isSubmittingProof,
    setIsSubmittingProof,
    verifyingInvoice,
    setVerifyingInvoice,
    adminVerifyNotes,
    setAdminVerifyNotes,
    isVerifyingProof,
    setIsVerifyingProof,
  }
}
