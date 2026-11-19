"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  X, Check, DollarSign, Calculator, UserCheck, Users, Calendar, Briefcase, FileText, 
  Coins, RefreshCw, Layers, CreditCard, Building2, Mail, Phone, MapPin, 
  Plus, Trash2, Tag, ChevronDown, ChevronUp, Sparkles, Search, Receipt,
  ShieldCheck, AlertCircle, Eye, Landmark, QrCode, Award, Clock, CheckCircle2, ListChecks
} from "lucide-react"
import { useAuthStore, Company, Branch, SubBranch, getCompanyLogoUrl, getCanonicalCompanyId, getSelectableCompanies, getUserEntityScope, isMatchingCompany } from "@/store/useAuthStore"
import { getClients, saveStoredClient } from "@/features/clients/services/clientService"
import { ClientItem } from "@/features/clients/types"
import { 
  InvoiceItem, 
  InvoiceLineItem, 
  AppliedDiscount,
  AssignedMemberAttribution,
  addInvoice, 
  updateInvoice, 
  generateInvoiceNumber, 
  getInvoices 
} from "@/features/invoice/services/invoiceService"
import { UserService } from "@/services/apiServices"
import { QuotationService, EstimateService } from "@/services/salesService"
import { numberToIndianWords } from "@/features/invoice/components/OfficialInvoiceDocument"
import { lookupPincode } from "@/lib/pincodeService"
import { addSubscription, saveInstallmentRecord } from "@/features/subscriptions/services/subscriptionService"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { executeWithFeedback } from "@/store/useActionFeedbackStore"
import { DigitalMarketingPackageBuilder } from "@/components/documents/DigitalMarketingPackageBuilder"
import { DigitalMarketingPackage, createDefaultMarketingPackage } from "@/types/digitalMarketing"
import { DocumentStudioModalSection1 } from "@/components/documents/components/documentstudiomodal-sections/DocumentStudioModalSection1"
import { DocumentStudioModalSection2 } from "@/components/documents/components/documentstudiomodal-sections/DocumentStudioModalSection2"
import { type DocumentStudioModalProps, SERVICE_PRESETS } from "@/components/documents/components/documentstudiomodal-sections/DocumentStudioModalHelpers"
import { createDocumentStudioModalAction20 } from "@/components/documents/hooks/documentstudiomodal-hooks/createDocumentStudioModalAction20.hooks"

export function createDocumentStudioModalFn50(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { setClientPincode, setIsPincodeLoading, setPincodePlaces, setPincodeDistricts, setPincodeStates, setClientState, setClientDistrict, setClientCity, setClientAddress } = getCtrl();
    const __fn: any = async (pin: string) => {
    setClientPincode(pin)
    const cleanPin = pin.trim().replace(/\D/g, "")
    if (cleanPin.length === 6) {
      setIsPincodeLoading(true)
      const res = await lookupPincode(cleanPin)
      setIsPincodeLoading(false)
      if (res && res.status === "Success") {
        setPincodePlaces(res.places || [])
        setPincodeDistricts(res.districts || [])
        setPincodeStates(res.states || [])
        if (res.state) setClientState(res.state)
        if (res.district) setClientDistrict(res.district)
        const primaryPlace = (res.places && res.places.length > 0) ? res.places[0] : ""
        if (primaryPlace) setClientCity(primaryPlace)
        setClientAddress(prev => {
          if (!prev || prev.trim() === "" || prev.includes(" - ")) {
            return `${primaryPlace ? primaryPlace + ", " : ""}${res.district || ""}, ${res.state || ""} - ${cleanPin}`
          }
          return prev
        })
      }
    }
  };
    return __fn(...__args);
  };
}
