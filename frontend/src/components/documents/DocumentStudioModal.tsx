"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Check,
  DollarSign,
  Calculator,
  UserCheck,
  Users,
  Calendar,
  Briefcase,
  FileText,
  Coins,
  RefreshCw,
  Layers,
  CreditCard,
  Building2,
  Mail,
  Phone,
  MapPin,
  Plus,
  Trash2,
  Tag,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Search,
  Receipt,
  ShieldCheck,
  AlertCircle,
  Eye,
  Landmark,
  QrCode,
  Award,
  Clock,
  CheckCircle2,
  ListChecks,
} from "lucide-react";

import {
  useAuthStore,
  Company,
  Branch,
  SubBranch,
  getCompanyLogoUrl,
  getCanonicalCompanyId,
  getSelectableCompanies,
  getUserEntityScope,
  isMatchingCompany,
} from "@/store/useAuthStore";
import {
  getClients,
  saveStoredClient,
} from "@/features/clients/services/clientService";
import { ClientItem } from "@/features/clients/types";
import {
  InvoiceItem,
  InvoiceLineItem,
  AppliedDiscount,
  AssignedMemberAttribution,
  addInvoice,
  updateInvoice,
  generateInvoiceNumber,
  getInvoices,
} from "@/features/invoice/services/invoiceService";
import { UserService } from "@/services/apiServices";
import { QuotationService, EstimateService } from "@/services/salesService";
import { numberToIndianWords } from "@/features/invoice/components/OfficialInvoiceDocument";
import { lookupPincode } from "@/lib/pincodeService";
import {
  addSubscription,
  saveInstallmentRecord,
} from "@/features/subscriptions/services/subscriptionService";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { executeWithFeedback } from "@/store/useActionFeedbackStore";
import { DigitalMarketingPackageBuilder } from "@/components/documents/DigitalMarketingPackageBuilder";
import {
  DigitalMarketingPackage,
  createDefaultMarketingPackage,
} from "@/types/digitalMarketing";
import { DocumentStudioModalSection1 } from "@/components/documents/components/documentstudiomodal-sections/DocumentStudioModalSection1";
import { DocumentStudioModalSection2 } from "@/components/documents/components/documentstudiomodal-sections/DocumentStudioModalSection2";

import {
  type DocumentStudioModalProps,
  SERVICE_PRESETS,
} from "@/components/documents/components/documentstudiomodal-sections/DocumentStudioModalHelpers";
export * from "@/components/documents/components/documentstudiomodal-sections/DocumentStudioModalHelpers";
import { createDocumentStudioModalAction20 } from "@/components/documents/hooks/documentstudiomodal-hooks/createDocumentStudioModalAction20.hooks";
import { createDocumentStudioModalFn50 } from "@/components/documents/hooks/documentstudiomodal-hooks/createDocumentStudioModalFn50.hooks";
import { runDocumentStudioModalEffect51 } from "@/components/documents/hooks/documentstudiomodal-hooks/runDocumentStudioModalEffect51.hooks";
import { createDocumentStudioModalFn52 } from "@/components/documents/hooks/documentstudiomodal-hooks/createDocumentStudioModalFn52.hooks";

export function DocumentStudioModal({
  isOpen,
  mode = "invoice",
  initialData,
  prefilledClient,
  isMarketingMode = false,
  onClose,
  onSaveSuccess,
}: DocumentStudioModalProps) {
  const __ctrl: any = {
    get isOpen() {
      try {
        return isOpen;
      } catch {
        return undefined;
      }
    },
    get mode() {
      try {
        return mode;
      } catch {
        return undefined;
      }
    },
    get initialData() {
      try {
        return initialData;
      } catch {
        return undefined;
      }
    },
    get prefilledClient() {
      try {
        return prefilledClient;
      } catch {
        return undefined;
      }
    },
    get isMarketingMode() {
      try {
        return isMarketingMode;
      } catch {
        return undefined;
      }
    },
    get onClose() {
      try {
        return onClose;
      } catch {
        return undefined;
      }
    },
    get onSaveSuccess() {
      try {
        return onSaveSuccess;
      } catch {
        return undefined;
      }
    },
    get user() {
      try {
        return user;
      } catch {
        return undefined;
      }
    },
    get companies() {
      try {
        return companies;
      } catch {
        return undefined;
      }
    },
    get branches() {
      try {
        return branches;
      } catch {
        return undefined;
      }
    },
    get subBranches() {
      try {
        return subBranches;
      } catch {
        return undefined;
      }
    },
    get activeCompanyId() {
      try {
        return activeCompanyId;
      } catch {
        return undefined;
      }
    },
    get activeBranchId() {
      try {
        return activeBranchId;
      } catch {
        return undefined;
      }
    },
    get fetchCompanies() {
      try {
        return fetchCompanies;
      } catch {
        return undefined;
      }
    },
    get fetchBranches() {
      try {
        return fetchBranches;
      } catch {
        return undefined;
      }
    },
    get fetchSubBranches() {
      try {
        return fetchSubBranches;
      } catch {
        return undefined;
      }
    },
    get docScheme() {
      try {
        return docScheme;
      } catch {
        return undefined;
      }
    },
    get setDocScheme() {
      try {
        return setDocScheme;
      } catch {
        return undefined;
      }
    },
    get isMarketing() {
      try {
        return isMarketing;
      } catch {
        return undefined;
      }
    },
    get selectableCompanies() {
      try {
        return selectableCompanies;
      } catch {
        return undefined;
      }
    },
    get availableProjects() {
      try {
        return availableProjects;
      } catch {
        return undefined;
      }
    },
    get setAvailableProjects() {
      try {
        return setAvailableProjects;
      } catch {
        return undefined;
      }
    },
    get availableInvoices() {
      try {
        return availableInvoices;
      } catch {
        return undefined;
      }
    },
    get setAvailableInvoices() {
      try {
        return setAvailableInvoices;
      } catch {
        return undefined;
      }
    },
    get selectedLinkedProject() {
      try {
        return selectedLinkedProject;
      } catch {
        return undefined;
      }
    },
    get setSelectedLinkedProject() {
      try {
        return setSelectedLinkedProject;
      } catch {
        return undefined;
      }
    },
    get selectedLinkedInvoice() {
      try {
        return selectedLinkedInvoice;
      } catch {
        return undefined;
      }
    },
    get setSelectedLinkedInvoice() {
      try {
        return setSelectedLinkedInvoice;
      } catch {
        return undefined;
      }
    },
    get projectFilterQuery() {
      try {
        return projectFilterQuery;
      } catch {
        return undefined;
      }
    },
    get setProjectFilterQuery() {
      try {
        return setProjectFilterQuery;
      } catch {
        return undefined;
      }
    },
    get invoiceFilterQuery() {
      try {
        return invoiceFilterQuery;
      } catch {
        return undefined;
      }
    },
    get setInvoiceFilterQuery() {
      try {
        return setInvoiceFilterQuery;
      } catch {
        return undefined;
      }
    },
    get filteredProjects() {
      try {
        return filteredProjects;
      } catch {
        return undefined;
      }
    },
    get filteredInvoices() {
      try {
        return filteredInvoices;
      } catch {
        return undefined;
      }
    },
    get companyId() {
      try {
        return companyId;
      } catch {
        return undefined;
      }
    },
    get setCompanyId() {
      try {
        return setCompanyId;
      } catch {
        return undefined;
      }
    },
    get branchId() {
      try {
        return branchId;
      } catch {
        return undefined;
      }
    },
    get setBranchId() {
      try {
        return setBranchId;
      } catch {
        return undefined;
      }
    },
    get subBranchId() {
      try {
        return subBranchId;
      } catch {
        return undefined;
      }
    },
    get setSubBranchId() {
      try {
        return setSubBranchId;
      } catch {
        return undefined;
      }
    },
    get marketingObjective() {
      try {
        return marketingObjective;
      } catch {
        return undefined;
      }
    },
    get setMarketingObjective() {
      try {
        return setMarketingObjective;
      } catch {
        return undefined;
      }
    },
    get marketingPlatforms() {
      try {
        return marketingPlatforms;
      } catch {
        return undefined;
      }
    },
    get setMarketingPlatforms() {
      try {
        return setMarketingPlatforms;
      } catch {
        return undefined;
      }
    },
    get marketingGeography() {
      try {
        return marketingGeography;
      } catch {
        return undefined;
      }
    },
    get setMarketingGeography() {
      try {
        return setMarketingGeography;
      } catch {
        return undefined;
      }
    },
    get creativeDriveUrl() {
      try {
        return creativeDriveUrl;
      } catch {
        return undefined;
      }
    },
    get setCreativeDriveUrl() {
      try {
        return setCreativeDriveUrl;
      } catch {
        return undefined;
      }
    },
    get currentStep() {
      try {
        return currentStep;
      } catch {
        return undefined;
      }
    },
    get setCurrentStep() {
      try {
        return setCurrentStep;
      } catch {
        return undefined;
      }
    },
    get isSubmitting() {
      try {
        return isSubmitting;
      } catch {
        return undefined;
      }
    },
    get setIsSubmitting() {
      try {
        return setIsSubmitting;
      } catch {
        return undefined;
      }
    },
    get activeCompany() {
      try {
        return activeCompany;
      } catch {
        return undefined;
      }
    },
    get companyBranches() {
      try {
        return companyBranches;
      } catch {
        return undefined;
      }
    },
    get branchSubBranches() {
      try {
        return branchSubBranches;
      } catch {
        return undefined;
      }
    },
    get availableTeamMembers() {
      try {
        return availableTeamMembers;
      } catch {
        return undefined;
      }
    },
    get setAvailableTeamMembers() {
      try {
        return setAvailableTeamMembers;
      } catch {
        return undefined;
      }
    },
    get assignedMembers() {
      try {
        return assignedMembers;
      } catch {
        return undefined;
      }
    },
    get setAssignedMembers() {
      try {
        return setAssignedMembers;
      } catch {
        return undefined;
      }
    },
    get handleAddAssignedMember() {
      try {
        return handleAddAssignedMember;
      } catch {
        return undefined;
      }
    },
    get handleUpdateAssignedMember() {
      try {
        return handleUpdateAssignedMember;
      } catch {
        return undefined;
      }
    },
    get handleRemoveAssignedMember() {
      try {
        return handleRemoveAssignedMember;
      } catch {
        return undefined;
      }
    },
    get allClients() {
      try {
        return allClients;
      } catch {
        return undefined;
      }
    },
    get setAllClients() {
      try {
        return setAllClients;
      } catch {
        return undefined;
      }
    },
    get clientMode() {
      try {
        return clientMode;
      } catch {
        return undefined;
      }
    },
    get setClientMode() {
      try {
        return setClientMode;
      } catch {
        return undefined;
      }
    },
    get selectedClient() {
      try {
        return selectedClient;
      } catch {
        return undefined;
      }
    },
    get setSelectedClient() {
      try {
        return setSelectedClient;
      } catch {
        return undefined;
      }
    },
    get clientSearchQuery() {
      try {
        return clientSearchQuery;
      } catch {
        return undefined;
      }
    },
    get setClientSearchQuery() {
      try {
        return setClientSearchQuery;
      } catch {
        return undefined;
      }
    },
    get isClientSearchOpen() {
      try {
        return isClientSearchOpen;
      } catch {
        return undefined;
      }
    },
    get setIsClientSearchOpen() {
      try {
        return setIsClientSearchOpen;
      } catch {
        return undefined;
      }
    },
    get clientName() {
      try {
        return clientName;
      } catch {
        return undefined;
      }
    },
    get setClientName() {
      try {
        return setClientName;
      } catch {
        return undefined;
      }
    },
    get clientDesignation() {
      try {
        return clientDesignation;
      } catch {
        return undefined;
      }
    },
    get setClientDesignation() {
      try {
        return setClientDesignation;
      } catch {
        return undefined;
      }
    },
    get customDesignation() {
      try {
        return customDesignation;
      } catch {
        return undefined;
      }
    },
    get setCustomDesignation() {
      try {
        return setCustomDesignation;
      } catch {
        return undefined;
      }
    },
    get contactPersonName() {
      try {
        return contactPersonName;
      } catch {
        return undefined;
      }
    },
    get setContactPersonName() {
      try {
        return setContactPersonName;
      } catch {
        return undefined;
      }
    },
    get clientEmail() {
      try {
        return clientEmail;
      } catch {
        return undefined;
      }
    },
    get setClientEmail() {
      try {
        return setClientEmail;
      } catch {
        return undefined;
      }
    },
    get clientPhone() {
      try {
        return clientPhone;
      } catch {
        return undefined;
      }
    },
    get setClientPhone() {
      try {
        return setClientPhone;
      } catch {
        return undefined;
      }
    },
    get clientAddress() {
      try {
        return clientAddress;
      } catch {
        return undefined;
      }
    },
    get setClientAddress() {
      try {
        return setClientAddress;
      } catch {
        return undefined;
      }
    },
    get clientPincode() {
      try {
        return clientPincode;
      } catch {
        return undefined;
      }
    },
    get setClientPincode() {
      try {
        return setClientPincode;
      } catch {
        return undefined;
      }
    },
    get clientDistrict() {
      try {
        return clientDistrict;
      } catch {
        return undefined;
      }
    },
    get setClientDistrict() {
      try {
        return setClientDistrict;
      } catch {
        return undefined;
      }
    },
    get clientCity() {
      try {
        return clientCity;
      } catch {
        return undefined;
      }
    },
    get setClientCity() {
      try {
        return setClientCity;
      } catch {
        return undefined;
      }
    },
    get clientState() {
      try {
        return clientState;
      } catch {
        return undefined;
      }
    },
    get setClientState() {
      try {
        return setClientState;
      } catch {
        return undefined;
      }
    },
    get clientGst() {
      try {
        return clientGst;
      } catch {
        return undefined;
      }
    },
    get setClientGst() {
      try {
        return setClientGst;
      } catch {
        return undefined;
      }
    },
    get pincodePlaces() {
      try {
        return pincodePlaces;
      } catch {
        return undefined;
      }
    },
    get setPincodePlaces() {
      try {
        return setPincodePlaces;
      } catch {
        return undefined;
      }
    },
    get pincodeDistricts() {
      try {
        return pincodeDistricts;
      } catch {
        return undefined;
      }
    },
    get setPincodeDistricts() {
      try {
        return setPincodeDistricts;
      } catch {
        return undefined;
      }
    },
    get pincodeStates() {
      try {
        return pincodeStates;
      } catch {
        return undefined;
      }
    },
    get setPincodeStates() {
      try {
        return setPincodeStates;
      } catch {
        return undefined;
      }
    },
    get isPincodeLoading() {
      try {
        return isPincodeLoading;
      } catch {
        return undefined;
      }
    },
    get setIsPincodeLoading() {
      try {
        return setIsPincodeLoading;
      } catch {
        return undefined;
      }
    },
    get availableCredit() {
      try {
        return availableCredit;
      } catch {
        return undefined;
      }
    },
    get setAvailableCredit() {
      try {
        return setAvailableCredit;
      } catch {
        return undefined;
      }
    },
    get applyCredit() {
      try {
        return applyCredit;
      } catch {
        return undefined;
      }
    },
    get setApplyCredit() {
      try {
        return setApplyCredit;
      } catch {
        return undefined;
      }
    },
    get creditToDeduct() {
      try {
        return creditToDeduct;
      } catch {
        return undefined;
      }
    },
    get setCreditToDeduct() {
      try {
        return setCreditToDeduct;
      } catch {
        return undefined;
      }
    },
    get marketingPackage() {
      try {
        return marketingPackage;
      } catch {
        return undefined;
      }
    },
    get setMarketingPackage() {
      try {
        return setMarketingPackage;
      } catch {
        return undefined;
      }
    },
    get primaryCategory() {
      try {
        return primaryCategory;
      } catch {
        return undefined;
      }
    },
    get setPrimaryCategory() {
      try {
        return setPrimaryCategory;
      } catch {
        return undefined;
      }
    },
    get customPrimaryCategory() {
      try {
        return customPrimaryCategory;
      } catch {
        return undefined;
      }
    },
    get setCustomPrimaryCategory() {
      try {
        return setCustomPrimaryCategory;
      } catch {
        return undefined;
      }
    },
    get paymentPlan() {
      try {
        return paymentPlan;
      } catch {
        return undefined;
      }
    },
    get setPaymentPlan() {
      try {
        return setPaymentPlan;
      } catch {
        return undefined;
      }
    },
    get advanceAmount() {
      try {
        return advanceAmount;
      } catch {
        return undefined;
      }
    },
    get setAdvanceAmount() {
      try {
        return setAdvanceAmount;
      } catch {
        return undefined;
      }
    },
    get emiAdvanceAmount() {
      try {
        return emiAdvanceAmount;
      } catch {
        return undefined;
      }
    },
    get setEmiAdvanceAmount() {
      try {
        return setEmiAdvanceAmount;
      } catch {
        return undefined;
      }
    },
    get emiTenureMonths() {
      try {
        return emiTenureMonths;
      } catch {
        return undefined;
      }
    },
    get setEmiTenureMonths() {
      try {
        return setEmiTenureMonths;
      } catch {
        return undefined;
      }
    },
    get isCustomEmi() {
      try {
        return isCustomEmi;
      } catch {
        return undefined;
      }
    },
    get setIsCustomEmi() {
      try {
        return setIsCustomEmi;
      } catch {
        return undefined;
      }
    },
    get subscriptionCycle() {
      try {
        return subscriptionCycle;
      } catch {
        return undefined;
      }
    },
    get setSubscriptionCycle() {
      try {
        return setSubscriptionCycle;
      } catch {
        return undefined;
      }
    },
    get subscriptionDurationMonths() {
      try {
        return subscriptionDurationMonths;
      } catch {
        return undefined;
      }
    },
    get setSubscriptionDurationMonths() {
      try {
        return setSubscriptionDurationMonths;
      } catch {
        return undefined;
      }
    },
    get subscriptionRate() {
      try {
        return subscriptionRate;
      } catch {
        return undefined;
      }
    },
    get setSubscriptionRate() {
      try {
        return setSubscriptionRate;
      } catch {
        return undefined;
      }
    },
    get subscriptionAdvance() {
      try {
        return subscriptionAdvance;
      } catch {
        return undefined;
      }
    },
    get setSubscriptionAdvance() {
      try {
        return setSubscriptionAdvance;
      } catch {
        return undefined;
      }
    },
    get subscriptionMonths() {
      try {
        return subscriptionMonths;
      } catch {
        return undefined;
      }
    },
    get setSubscriptionMonths() {
      try {
        return setSubscriptionMonths;
      } catch {
        return undefined;
      }
    },
    get docNumber() {
      try {
        return docNumber;
      } catch {
        return undefined;
      }
    },
    get setDocNumber() {
      try {
        return setDocNumber;
      } catch {
        return undefined;
      }
    },
    get issueDate() {
      try {
        return issueDate;
      } catch {
        return undefined;
      }
    },
    get setIssueDate() {
      try {
        return setIssueDate;
      } catch {
        return undefined;
      }
    },
    get dueDate() {
      try {
        return dueDate;
      } catch {
        return undefined;
      }
    },
    get setDueDate() {
      try {
        return setDueDate;
      } catch {
        return undefined;
      }
    },
    get projectTitle() {
      try {
        return projectTitle;
      } catch {
        return undefined;
      }
    },
    get setProjectTitle() {
      try {
        return setProjectTitle;
      } catch {
        return undefined;
      }
    },
    get projectOverview() {
      try {
        return projectOverview;
      } catch {
        return undefined;
      }
    },
    get setProjectOverview() {
      try {
        return setProjectOverview;
      } catch {
        return undefined;
      }
    },
    get projectTimeline() {
      try {
        return projectTimeline;
      } catch {
        return undefined;
      }
    },
    get setProjectTimeline() {
      try {
        return setProjectTimeline;
      } catch {
        return undefined;
      }
    },
    get turnaroundTime() {
      try {
        return turnaroundTime;
      } catch {
        return undefined;
      }
    },
    get setTurnaroundTime() {
      try {
        return setTurnaroundTime;
      } catch {
        return undefined;
      }
    },
    get deliverables() {
      try {
        return deliverables;
      } catch {
        return undefined;
      }
    },
    get setDeliverables() {
      try {
        return setDeliverables;
      } catch {
        return undefined;
      }
    },
    get scopeInclusions() {
      try {
        return scopeInclusions;
      } catch {
        return undefined;
      }
    },
    get setScopeInclusions() {
      try {
        return setScopeInclusions;
      } catch {
        return undefined;
      }
    },
    get scopeExclusions() {
      try {
        return scopeExclusions;
      } catch {
        return undefined;
      }
    },
    get setScopeExclusions() {
      try {
        return setScopeExclusions;
      } catch {
        return undefined;
      }
    },
    get paymentMilestones() {
      try {
        return paymentMilestones;
      } catch {
        return undefined;
      }
    },
    get setPaymentMilestones() {
      try {
        return setPaymentMilestones;
      } catch {
        return undefined;
      }
    },
    get items() {
      try {
        return items;
      } catch {
        return undefined;
      }
    },
    get setItems() {
      try {
        return setItems;
      } catch {
        return undefined;
      }
    },
    get discountType() {
      try {
        return discountType;
      } catch {
        return undefined;
      }
    },
    get setDiscountType() {
      try {
        return setDiscountType;
      } catch {
        return undefined;
      }
    },
    get discountValue() {
      try {
        return discountValue;
      } catch {
        return undefined;
      }
    },
    get setDiscountValue() {
      try {
        return setDiscountValue;
      } catch {
        return undefined;
      }
    },
    get setupCharge() {
      try {
        return setupCharge;
      } catch {
        return undefined;
      }
    },
    get setSetupCharge() {
      try {
        return setSetupCharge;
      } catch {
        return undefined;
      }
    },
    get notes() {
      try {
        return notes;
      } catch {
        return undefined;
      }
    },
    get setNotes() {
      try {
        return setNotes;
      } catch {
        return undefined;
      }
    },
    get terms() {
      try {
        return terms;
      } catch {
        return undefined;
      }
    },
    get setTerms() {
      try {
        return setTerms;
      } catch {
        return undefined;
      }
    },
    get generateDocNumber() {
      try {
        return generateDocNumber;
      } catch {
        return undefined;
      }
    },
    get handlePincodeChange() {
      try {
        return handlePincodeChange;
      } catch {
        return undefined;
      }
    },
    get handleSelectClient() {
      try {
        return handleSelectClient;
      } catch {
        return undefined;
      }
    },
    get handleSchemeChange() {
      try {
        return handleSchemeChange;
      } catch {
        return undefined;
      }
    },
    get handleAddItem() {
      try {
        return handleAddItem;
      } catch {
        return undefined;
      }
    },
    get handleRemoveItem() {
      try {
        return handleRemoveItem;
      } catch {
        return undefined;
      }
    },
    get handleUpdateItem() {
      try {
        return handleUpdateItem;
      } catch {
        return undefined;
      }
    },
    get handleAddDeliverable() {
      try {
        return handleAddDeliverable;
      } catch {
        return undefined;
      }
    },
    get handleUpdateDeliverable() {
      try {
        return handleUpdateDeliverable;
      } catch {
        return undefined;
      }
    },
    get handleRemoveDeliverable() {
      try {
        return handleRemoveDeliverable;
      } catch {
        return undefined;
      }
    },
    get calculatedSubtotal() {
      try {
        return calculatedSubtotal;
      } catch {
        return undefined;
      }
    },
    get handleDiscountTypeChange() {
      try {
        return handleDiscountTypeChange;
      } catch {
        return undefined;
      }
    },
    get calculatedDiscount() {
      try {
        return calculatedDiscount;
      } catch {
        return undefined;
      }
    },
    get numSetupCharge() {
      try {
        return numSetupCharge;
      } catch {
        return undefined;
      }
    },
    get taxableBase() {
      try {
        return taxableBase;
      } catch {
        return undefined;
      }
    },
    get calculatedGst() {
      try {
        return calculatedGst;
      } catch {
        return undefined;
      }
    },
    get grandTotal() {
      try {
        return grandTotal;
      } catch {
        return undefined;
      }
    },
    get effectiveCreditDeduction() {
      try {
        return effectiveCreditDeduction;
      } catch {
        return undefined;
      }
    },
    get netPayable() {
      try {
        return netPayable;
      } catch {
        return undefined;
      }
    },
    get calculateCycleFutureDate() {
      try {
        return calculateCycleFutureDate;
      } catch {
        return undefined;
      }
    },
    get numEmiAdvance() {
      try {
        return numEmiAdvance;
      } catch {
        return undefined;
      }
    },
    get effectiveEmiAdvance() {
      try {
        return effectiveEmiAdvance;
      } catch {
        return undefined;
      }
    },
    get emiRemainingBalance() {
      try {
        return emiRemainingBalance;
      } catch {
        return undefined;
      }
    },
    get emiMonthlyAmount() {
      try {
        return emiMonthlyAmount;
      } catch {
        return undefined;
      }
    },
    get defaultSubRate() {
      try {
        return defaultSubRate;
      } catch {
        return undefined;
      }
    },
    get activeSubRate() {
      try {
        return activeSubRate;
      } catch {
        return undefined;
      }
    },
    get subContractTotal() {
      try {
        return subContractTotal;
      } catch {
        return undefined;
      }
    },
    get numSubAdvance() {
      try {
        return numSubAdvance;
      } catch {
        return undefined;
      }
    },
    get effectiveSubAdvance() {
      try {
        return effectiveSubAdvance;
      } catch {
        return undefined;
      }
    },
    get subPrepaidCycles() {
      try {
        return subPrepaidCycles;
      } catch {
        return undefined;
      }
    },
    get subRemainingCycles() {
      try {
        return subRemainingCycles;
      } catch {
        return undefined;
      }
    },
    get subBalanceDue() {
      try {
        return subBalanceDue;
      } catch {
        return undefined;
      }
    },
    get subNextBillingDate() {
      try {
        return subNextBillingDate;
      } catch {
        return undefined;
      }
    },
    get handleSaveDocument() {
      try {
        return handleSaveDocument;
      } catch {
        return undefined;
      }
    },
    get modalTitle() {
      try {
        return modalTitle;
      } catch {
        return undefined;
      }
    },
    get totalSteps() {
      try {
        return totalSteps;
      } catch {
        return undefined;
      }
    },
  };
  const __ctrlRef = React.useRef<any>(__ctrl);
  __ctrlRef.current = __ctrl;

  const {
    user,
    companies,
    branches,
    subBranches,
    activeCompanyId,
    activeBranchId,
    fetchCompanies,
    fetchBranches,
    fetchSubBranches,
  } = useAuthStore();

  // 1. Core Document Setup
  const [docScheme, setDocScheme] = React.useState<"gst" | "nongst">(() => {
    if (initialData?.taxType === "nongst" || initialData?.isNonGst)
      return "nongst";
    if (initialData?.taxType === "gst") return "gst";
    return "gst";
  });
  // Marketing is selected via Category in the Items Settlement step
  const isMarketing = false;

  const selectableCompanies = React.useMemo(() => {
    return getSelectableCompanies(
      companies,
      activeCompanyId,
      user,
      branches,
      subBranches,
    );
  }, [companies, activeCompanyId, user, branches, subBranches]);

  const [availableProjects, setAvailableProjects] = React.useState<any[]>([]);
  const [availableInvoices, setAvailableInvoices] = React.useState<any[]>([]);
  const [selectedLinkedProject, setSelectedLinkedProject] =
    React.useState<string>(
      initialData?.projectId || initialData?.project || "",
    );
  const [selectedLinkedInvoice, setSelectedLinkedInvoice] =
    React.useState<string>(
      initialData?.invoiceId || initialData?.invoiceNumber || "",
    );
  const [projectFilterQuery, setProjectFilterQuery] = React.useState("");
  const [invoiceFilterQuery, setInvoiceFilterQuery] = React.useState("");

  const filteredProjects = React.useMemo(() => {
    if (!projectFilterQuery.trim()) return availableProjects;
    const q = projectFilterQuery.toLowerCase().trim();
    return availableProjects.filter(
      (p) =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.clientName && p.clientName.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)),
    );
  }, [availableProjects, projectFilterQuery]);

  const filteredInvoices = React.useMemo(() => {
    if (!invoiceFilterQuery.trim()) return availableInvoices;
    const q = invoiceFilterQuery.toLowerCase().trim();
    return availableInvoices.filter(
      (inv) =>
        (inv.invoiceNumber && inv.invoiceNumber.toLowerCase().includes(q)) ||
        (inv.client && inv.client.toLowerCase().includes(q)) ||
        (inv.clientName && inv.clientName.toLowerCase().includes(q)) ||
        (inv.project && inv.project.toLowerCase().includes(q)),
    );
  }, [availableInvoices, invoiceFilterQuery]);

  React.useEffect(() => {
    if (!isOpen) return;
    try {
      import("@/features/projects/services/projectService")
        .then((mod) => {
          if (mod && mod.getProjects) {
            mod
              .getProjects()
              .then((res: any) => setAvailableProjects(res || []))
              .catch(() => {});
          }
        })
        .catch(() => {});
      getInvoices()
        .then((res: any) => setAvailableInvoices(res || []))
        .catch(() => {});
    } catch (_) {}
  }, [isOpen]);

  const [companyId, setCompanyId] = React.useState<string>(() => {
    if (initialData?.companyId) return initialData.companyId;
    if (activeCompanyId && activeCompanyId !== "all") return activeCompanyId;
    return "tech";
  });
  const [branchId, setBranchId] = React.useState<string>(activeBranchId || "");
  const [subBranchId, setSubBranchId] = React.useState<string>("");

  // Marketing-specific state variables
  const [marketingObjective, setMarketingObjective] = React.useState<string>(
    () => {
      return (
        initialData?.marketingObjective ||
        "Brand Awareness & High-Impact Social Reach"
      );
    },
  );
  const [marketingPlatforms, setMarketingPlatforms] = React.useState<string[]>(
    () => {
      if (
        initialData?.marketingPlatforms &&
        Array.isArray(initialData.marketingPlatforms)
      )
        return initialData.marketingPlatforms;
      return ["Instagram", "Facebook", "Google Ads"];
    },
  );
  const [marketingGeography, setMarketingGeography] = React.useState<string>(
    () => {
      return (
        initialData?.marketingGeography ||
        initialData?.marketingPackage?.targetLocations ||
        "Pan India & Regional Focus"
      );
    },
  );
  const [creativeDriveUrl, setCreativeDriveUrl] = React.useState<string>(() => {
    return initialData?.creativeDriveUrl || initialData?.metaUrl || "";
  });

  // Keep companyId in sync with selectableCompanies if locked
  React.useEffect(() => {
    if (
      selectableCompanies.length > 0 &&
      !selectableCompanies.some(
        (c) => c.id === companyId || c.slug === companyId,
      )
    ) {
      setCompanyId(
        selectableCompanies[0].id || selectableCompanies[0].slug || "tech",
      );
    }
  }, [selectableCompanies, companyId]);

  // Tab State depending on mode:
  // Quotation: "q_setup" (1. Project & Client), "q_scope" (2. Scope & Milestones), "q_commercial" (3. Pricing & Payment Terms)
  // Estimate: "e_setup" (1. Estimate & Client), "e_pricing" (2. Services & Notes)
  // Invoice: "inv_entity" (1. Entity & Tax Scheme), "inv_client" (2. Client & Dates), "inv_items" (3. Line Items & Tax)
  const [currentStep, setCurrentStep] = React.useState<number>(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Resolve selected company & issuing branch
  const activeCompany = React.useMemo(() => {
    const canonTarget = getCanonicalCompanyId(
      companyId || activeCompanyId || "tech",
    );
    return (
      companies.find((c) => {
        const canonC = getCanonicalCompanyId(c.id || c.slug);
        return (
          (canonTarget && canonC && canonTarget === canonC) ||
          c.id === companyId ||
          c.slug === companyId
        );
      }) ||
      selectableCompanies[0] ||
      companies[0]
    );
  }, [companies, companyId, activeCompanyId, selectableCompanies]);

  const companyBranches = React.useMemo(() => {
    if (!branches || branches.length === 0) return [];
    const canonTarget = getCanonicalCompanyId(
      companyId || activeCompanyId || "tech",
    );
    const filtered = branches.filter((b) => {
      const bComp = String((b as any).companyId || (b as any).company_id || "")
        .toLowerCase()
        .trim();
      const canonB = getCanonicalCompanyId(bComp);
      if (canonTarget && canonB) return canonTarget === canonB;
      return bComp === canonTarget || (!bComp && canonTarget === "tech");
    });
    return filtered.length > 0 ? filtered : branches;
  }, [branches, companyId, activeCompanyId]);

  const branchSubBranches = React.useMemo(() => {
    return subBranches.filter(
      (sb) =>
        String(
          (sb as any).branch_id ||
            (sb as any).branchId ||
            (sb as any).parentBranchId,
        ) === String(branchId),
    );
  }, [subBranches, branchId]);

  // Team Member Attribution (For Invoices)
  const [availableTeamMembers, setAvailableTeamMembers] = React.useState<any[]>(
    [],
  );
  const [assignedMembers, setAssignedMembers] = React.useState<
    AssignedMemberAttribution[]
  >(() => {
    if (
      initialData?.assignedMembers &&
      Array.isArray(initialData.assignedMembers) &&
      initialData.assignedMembers.length > 0
    ) {
      return initialData.assignedMembers;
    }
    if (initialData?.assignedMemberId) {
      return [
        {
          memberId: initialData.assignedMemberId,
          memberName: initialData.assignedMemberName || "Team Member",
          memberRole: initialData.assignedMemberRole || "Team Member",
          memberAvatar: initialData.assignedMemberAvatar,
          payoutType: initialData.memberPayoutType || "percentage",
          payoutValue:
            initialData.memberPayoutValue !== undefined
              ? initialData.memberPayoutValue
              : initialData.memberSharePct !== undefined
                ? initialData.memberSharePct
                : 50,
        },
      ];
    }
    return [];
  });

  const handleAddAssignedMember = () => {
    const unassigned =
      availableTeamMembers.find(
        (m) =>
          !assignedMembers.some((am) => String(am.memberId) === String(m.id)),
      ) || availableTeamMembers[0];
    if (!unassigned) return;
    setAssignedMembers((prev) => [
      ...prev,
      {
        memberId: String(unassigned.id),
        memberName: unassigned.name,
        memberRole: unassigned.role,
        memberAvatar: unassigned.avatar,
        payoutType: "percentage",
        payoutValue: prev.length === 0 ? 50 : 25,
      },
    ]);
  };

  const handleUpdateAssignedMember = (
    index: number,
    field: keyof AssignedMemberAttribution,
    value: any,
  ) => {
    setAssignedMembers((prev) =>
      prev.map((m, idx) => {
        if (idx !== index) return m;
        if (field === "memberId") {
          const matched = availableTeamMembers.find(
            (tm) => String(tm.id) === String(value),
          );
          return {
            ...m,
            memberId: String(value),
            memberName: matched?.name || m.memberName,
            memberRole: matched?.role || m.memberRole,
            memberAvatar: matched?.avatar || m.memberAvatar,
          };
        }
        return { ...m, [field]: value };
      }),
    );
  };

  const handleRemoveAssignedMember = (index: number) => {
    setAssignedMembers((prev) => prev.filter((_, idx) => idx !== index));
  };

  // 2. Client Setup
  const [allClients, setAllClients] = React.useState<ClientItem[]>([]);
  const [clientMode, setClientMode] = React.useState<"select" | "custom">(
    "select",
  );
  const [selectedClient, setSelectedClient] = React.useState<ClientItem | null>(
    prefilledClient || null,
  );
  const [clientSearchQuery, setClientSearchQuery] = React.useState("");
  const [isClientSearchOpen, setIsClientSearchOpen] = React.useState(false);

  const [clientName, setClientName] = React.useState("");
  const [clientDesignation, setClientDesignation] = React.useState<string>(
    initialData?.clientDesignation || "Proprietor",
  );
  const [customDesignation, setCustomDesignation] = React.useState<string>("");
  const [contactPersonName, setContactPersonName] = React.useState<string>(
    initialData?.contactPersonName ||
      initialData?.primaryContact ||
      initialData?.clientContactPerson ||
      "",
  );
  const [clientEmail, setClientEmail] = React.useState("");
  const [clientPhone, setClientPhone] = React.useState("");
  const [clientAddress, setClientAddress] = React.useState("");
  const [clientPincode, setClientPincode] = React.useState(
    initialData?.clientPincode || initialData?.zip || "",
  );
  const [clientDistrict, setClientDistrict] = React.useState(
    initialData?.clientDistrict || initialData?.district || "",
  );
  const [clientCity, setClientCity] = React.useState("");
  const [clientState, setClientState] = React.useState("");
  const [clientGst, setClientGst] = React.useState("");
  const [pincodePlaces, setPincodePlaces] = React.useState<string[]>([]);
  const [pincodeDistricts, setPincodeDistricts] = React.useState<string[]>([]);
  const [pincodeStates, setPincodeStates] = React.useState<string[]>([]);
  const [isPincodeLoading, setIsPincodeLoading] =
    React.useState<boolean>(false);

  // Customer Credit Notes (for credit deduction on next invoice)
  const [availableCredit, setAvailableCredit] = React.useState<number>(0);
  const [applyCredit, setApplyCredit] = React.useState<boolean>(
    Boolean(initialData?.creditDeduction),
  );
  const [creditToDeduct, setCreditToDeduct] = React.useState<number>(
    Number(initialData?.creditDeduction) || 0,
  );

  // Look up available credit notes when client changes
  React.useEffect(() => {
    const targetName = (clientName || selectedClient?.name || "").trim();
    if (!targetName || mode !== "invoice") {
      if (!initialData?.creditDeduction) {
        setAvailableCredit(0);
        setApplyCredit(false);
        setCreditToDeduct(0);
      }
      return;
    }

    import("@/features/credit-notes/services/creditNoteService").then(
      ({ getAvailableCreditForClient }) => {
        getAvailableCreditForClient(targetName, companyId)
          .then((res) => {
            setAvailableCredit(res.totalAvailableCredit);
            if (res.totalAvailableCredit > 0 && !initialData?.creditDeduction) {
              // prefill default credit to deduct up to available
              setCreditToDeduct(res.totalAvailableCredit);
            }
          })
          .catch(() => {});
      },
    );
  }, [
    clientName,
    selectedClient,
    companyId,
    mode,
    initialData?.creditDeduction,
  ]);

  // Digital Marketing & Form No - 9 State
  const [marketingPackage, setMarketingPackage] =
    React.useState<DigitalMarketingPackage>(() => {
      return (
        initialData?.marketingPackage ||
        createDefaultMarketingPackage("Grow - 2")
      );
    });

  // Primary Category (Website, Software, Android/Ios, Cloud and domain, Custom)
  const [primaryCategory, setPrimaryCategory] = React.useState<string>(() => {
    return (
      initialData?.primaryCategory ||
      initialData?.category ||
      (initialData?.isMarketingRetainer ? "Digital Marketing" : "Website")
    );
  });
  const [customPrimaryCategory, setCustomPrimaryCategory] =
    React.useState<string>("");

  // Payment Plan & Settlement Structure (Order: Full, Part (EMI), Advance, Subscription)
  const [paymentPlan, setPaymentPlan] = React.useState<
    "full" | "part" | "advance" | "subscription"
  >(initialData?.paymentPlan || "full");
  const [advanceAmount, setAdvanceAmount] = React.useState<number | "">(
    initialData?.advanceAmount !== undefined ? initialData.advanceAmount : "",
  );
  // Part (EMI) State (Advance Down Payment Minus Option)
  const [emiAdvanceAmount, setEmiAdvanceAmount] = React.useState<number | "">(
    initialData?.advanceAmount !== undefined ? initialData.advanceAmount : "",
  );
  const [emiTenureMonths, setEmiTenureMonths] = React.useState<number>(
    initialData?.emiMonths || initialData?.subscriptionMonths || 3,
  );
  const [isCustomEmi, setIsCustomEmi] = React.useState<boolean>(() => {
    const m = Number(
      initialData?.emiMonths || initialData?.subscriptionMonths || 3,
    );
    return ![2, 3, 4, 6, 12].includes(m);
  });

  // Subscription State (Duration, Recurring Rate & Advance Payment)
  const [subscriptionCycle, setSubscriptionCycle] = React.useState<
    "Monthly" | "Weekly" | "Quarterly" | "Yearly"
  >(initialData?.subscriptionCycle || "Monthly");
  const [subscriptionDurationMonths, setSubscriptionDurationMonths] =
    React.useState<number>(
      initialData?.subscriptionDurationMonths ||
        initialData?.subscriptionDuration ||
        6,
    );
  const [subscriptionRate, setSubscriptionRate] = React.useState<number | "">(
    initialData?.subscriptionRate !== undefined
      ? initialData.subscriptionRate
      : "",
  );
  const [subscriptionAdvance, setSubscriptionAdvance] = React.useState<
    number | ""
  >(
    initialData?.subscriptionAdvance !== undefined
      ? initialData.subscriptionAdvance
      : initialData?.advanceAmount || "",
  );
  const [subscriptionMonths, setSubscriptionMonths] = React.useState<number>(3);

  // 3. Document Identification
  const [docNumber, setDocNumber] = React.useState("");
  const [issueDate, setIssueDate] = React.useState<string>(() => {
    if (initialData?.invoiceDate) {
      const s = String(initialData.invoiceDate).trim();
      if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
      const dmy = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
      if (dmy)
        return `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
    }
    if (initialData?.billDate) {
      const s = String(initialData.billDate).trim();
      if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
      const dmy = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
      if (dmy)
        return `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
    }
    return new Date().toISOString().split("T")[0];
  });
  const [dueDate, setDueDate] = React.useState(() => {
    if (initialData?.dueDate) {
      const s = String(initialData.dueDate).trim();
      if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
      const dmy = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
      if (dmy)
        return `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
    }
    return ""; // Always default to unset (0000-00-00) until picked!
  });

  // Quotation Specific Fields
  const [projectTitle, setProjectTitle] = React.useState(
    initialData?.project || initialData?.projectTitle || "",
  );
  const [projectOverview, setProjectOverview] = React.useState(
    initialData?.overview || "",
  );
  const [projectTimeline, setProjectTimeline] = React.useState(
    initialData?.timeline || "",
  );
  const [turnaroundTime, setTurnaroundTime] = React.useState(
    initialData?.turnaroundTime || "",
  );

  // Deliverables Breakdown (For Quotation)
  const [deliverables, setDeliverables] = React.useState<
    Array<{ id: string; title: string; description: string; duration: string }>
  >(
    initialData?.deliverables && Array.isArray(initialData.deliverables)
      ? initialData.deliverables
      : [],
  );

  // Scope Inclusions & Exclusions (For Quotation)
  const [scopeInclusions, setScopeInclusions] = React.useState(
    initialData?.scopeInclusions || "",
  );
  const [scopeExclusions, setScopeExclusions] = React.useState(
    initialData?.scopeExclusions || "",
  );

  // Milestone Payment Terms Schedule (For Quotation)
  const [paymentMilestones, setPaymentMilestones] = React.useState<
    Array<{ milestone: string; percentage: number; stage: string }>
  >(
    initialData?.paymentMilestones &&
      Array.isArray(initialData.paymentMilestones)
      ? initialData.paymentMilestones
      : [],
  );

  // 4. Line Items
  const [items, setItems] = React.useState<InvoiceLineItem[]>([
    {
      id: `item_${Date.now()}`,
      serviceName: "",
      sacCode: "",
      qty: 1,
      unit: "Project",
      rate: "" as any,
      gstRate: mode === "invoice" && docScheme === "gst" ? 18 : 0,
      gstAmount: 0,
      charges: [],
      totalAmount: 0,
    },
  ]);

  // 5. Financial adjustments
  const [discountType, setDiscountType] = React.useState<
    "percentage" | "fixed"
  >("percentage");
  const [discountValue, setDiscountValue] = React.useState<number | "">("");
  const [setupCharge, setSetupCharge] = React.useState<number | "">("");

  // Notes & Terms
  const [notes, setNotes] = React.useState(
    mode === "invoice"
      ? activeCompany?.invoice_notes ||
          "Thank you for partnering with Saampark. Please make payment to our verified bank account."
      : activeCompany?.quotation_notes ||
          "Quotation valid for 30 calendar days from issue. 50% mobilization advance required upon kickoff.",
  );
  const [terms, setTerms] = React.useState(
    activeCompany?.terms_conditions ||
      "1. Payment is due within statutory terms.\n2. Goods & Services once delivered are subject to project sign-off.\n3. Disputed items must be notified within 7 days.",
  );

  // Generate document number helper
  const generateDocNumber = (scheme: "gst" | "nongst", targetDate?: string) => {
    const rawD = targetDate || issueDate;
    const d = rawD ? new Date(rawD) : new Date();
    const validD = isNaN(d.getTime()) ? new Date() : d;
    const datePart = `${String(validD.getDate()).padStart(2, "0")}${String(validD.getMonth() + 1).padStart(2, "0")}${validD.getFullYear()}`;
    const randPart = Math.floor(1000 + Math.random() * 9000);

    let prefix = "INV";
    if (mode === "quotation") prefix = scheme === "nongst" ? "NGQT" : "QT";
    else if (mode === "estimate")
      prefix = scheme === "nongst" ? "NGEST" : "EST";
    else if (scheme === "nongst") prefix = "NGINV";

    const gen = `${prefix}-${datePart}-${randPart}`;
    setDocNumber(gen);
    return gen;
  };

  const handlePincodeChange: any = createDocumentStudioModalFn50(
    () => __ctrlRef.current,
  );

  const handleSelectClient = (c: ClientItem) => {
    setSelectedClient(c);
    setClientName(c.name || "");
    setClientDesignation((c as any).designation || "Proprietor");
    setContactPersonName(c.primaryContact || "");
    setClientEmail(c.email || "");
    setClientPhone(c.phone || "");
    setClientAddress(c.address || "");
    setClientCity(c.city || "");
    setClientDistrict((c as any).district || "");
    setClientState(c.state || "");
    setClientPincode(c.zip || "");
    setClientGst(c.gstNumber || c.vatNumber || "");
    setIsClientSearchOpen(false);
    if (c.zip) {
      handlePincodeChange(c.zip);
    }
  };

  // Load clients, branches, team members & sync document state with initialData or blank state
  React.useEffect(
    () => runDocumentStudioModalEffect51(() => __ctrlRef.current),
    [isOpen, initialData, prefilledClient],
  );

  const handleSchemeChange = (scheme: "gst" | "nongst") => {
    setDocScheme(scheme);
    if (!initialData?.id) {
      generateDocNumber(scheme);
    }
    setItems((prev) =>
      prev.map((it) => {
        const rate = typeof it.rate === "number" ? it.rate : 0;
        const qty = it.qty > 0 ? it.qty : 1;
        const base = rate * qty;
        const gst = scheme === "gst" ? it.gstRate || 18 : 0;
        return {
          ...it,
          gstRate: gst,
          gstAmount: Math.round(base * (gst / 100)),
          totalAmount: base + Math.round(base * (gst / 100)),
        };
      }),
    );
  };

  // Add line item
  const handleAddItem = (preset?: (typeof SERVICE_PRESETS)[0]) => {
    const isGstActive = docScheme === "gst";
    const newItem: InvoiceLineItem = {
      id: `item_${Date.now()}_${Math.random()}`,
      serviceName: preset?.name || "",
      sacCode: preset?.sac || (isGstActive ? "998313" : ""),
      qty: 1,
      unit: preset?.unit || "Project",
      rate: preset?.rate || 10000,
      gstRate: isGstActive ? (preset?.gst !== undefined ? preset.gst : 18) : 0,
      gstAmount: 0,
      charges: [],
      totalAmount: 0,
    };
    const base = newItem.rate * newItem.qty;
    const tax = Math.round(base * (newItem.gstRate / 100));
    newItem.gstAmount = tax;
    newItem.totalAmount = base + tax;
    setItems((prev) => [...prev, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleUpdateItem = (
    id: string,
    field: keyof InvoiceLineItem,
    val: any,
  ) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        const updated = { ...it, [field]: val };
        const rate =
          typeof updated.rate === "number"
            ? updated.rate
            : updated.rate === ""
              ? 0
              : Number(updated.rate) || 0;
        const qty =
          typeof updated.qty === "number"
            ? updated.qty
            : updated.qty === ""
              ? 1
              : Number(updated.qty) || 1;
        const base = rate * qty;
        const isGstActive = docScheme === "gst";
        const gst = isGstActive
          ? typeof updated.gstRate === "number"
            ? updated.gstRate
            : 18
          : 0;
        updated.totalAmount = base + Math.round(base * (gst / 100));
        return updated;
      }),
    );
  };

  // Deliverables Handlers (Quotation)
  const handleAddDeliverable = () => {
    setDeliverables((prev) => [
      ...prev,
      {
        id: `del_${Date.now()}`,
        title: "",
        description: "",
        duration: "1-2 Weeks",
      },
    ]);
  };

  const handleUpdateDeliverable = (id: string, field: string, val: string) => {
    setDeliverables((prev) =>
      prev.map((d) => (d.id === id ? { ...d, [field]: val } : d)),
    );
  };

  const handleRemoveDeliverable = (id: string) => {
    if (deliverables.length <= 1) return;
    setDeliverables((prev) => prev.filter((d) => d.id !== id));
  };

  // Financial Calculations
  const calculatedSubtotal = React.useMemo(() => {
    return items.reduce((sum, it) => sum + (it.rate || 0) * (it.qty || 1), 0);
  }, [items]);

  const handleDiscountTypeChange = (newType: "percentage" | "fixed") => {
    if (newType === discountType) return;
    const curVal = Number(discountValue) || 0;
    if (curVal <= 0 || calculatedSubtotal <= 0) {
      setDiscountType(newType);
      return;
    }
    if (newType === "percentage") {
      const pct = Math.min(
        100,
        Math.round((curVal / calculatedSubtotal) * 100),
      );
      setDiscountValue(pct);
    } else {
      const amt = Math.min(
        calculatedSubtotal,
        Math.round(calculatedSubtotal * (Math.min(100, curVal) / 100)),
      );
      setDiscountValue(amt);
    }
    setDiscountType(newType);
  };

  const calculatedDiscount = React.useMemo(() => {
    const rawVal = Number(discountValue);
    if (!rawVal || isNaN(rawVal) || rawVal <= 0) return 0;
    if (discountType === "percentage") {
      const clampedPct = Math.min(100, Math.max(0, rawVal));
      return Math.round(calculatedSubtotal * (clampedPct / 100));
    }
    return Math.min(calculatedSubtotal, Math.max(0, rawVal));
  }, [calculatedSubtotal, discountType, discountValue]);

  const numSetupCharge = Number(setupCharge) || 0;
  const taxableBase = Math.max(
    0,
    calculatedSubtotal - calculatedDiscount + numSetupCharge,
  );

  // Load Subscription Discount Master rules once for active company
  const [subDiscountRules, setSubDiscountRules] = React.useState<any[]>([]);
  React.useEffect(() => {
    import("@/features/subscriptions/services/subscriptionDiscountMaster.service")
      .then(({ getSubscriptionDiscountRules }) =>
        getSubscriptionDiscountRules(companyId),
      )
      .then((rules) => setSubDiscountRules(rules))
      .catch(() => {});
  }, [companyId]);

  // GST computed on post-discount taxableBase (proportional across items)
  const calculatedGst = React.useMemo(() => {
    if (docScheme === "nongst") return 0;
    if (calculatedSubtotal <= 0) {
      return numSetupCharge > 0 ? Math.round(numSetupCharge * 0.18) : 0;
    }
    const discountRatio = Math.max(
      0,
      (calculatedSubtotal - calculatedDiscount) / calculatedSubtotal,
    );
    const itemsGst = items.reduce((sum, it) => {
      const lineBase =
        (Number(it.rate) || 0) * (Number(it.qty) || 1) * discountRatio;
      const gstRate = it.gstRate !== undefined ? Number(it.gstRate) : 18;
      return sum + Math.round(lineBase * (gstRate / 100));
    }, 0);
    const setupGst = numSetupCharge > 0 ? Math.round(numSetupCharge * 0.18) : 0;
    return itemsGst + setupGst;
  }, [
    items,
    docScheme,
    calculatedSubtotal,
    calculatedDiscount,
    numSetupCharge,
  ]);

  const grandTotal = taxableBase + calculatedGst;
  const effectiveCreditDeduction =
    applyCredit && creditToDeduct > 0
      ? Math.min(creditToDeduct, grandTotal)
      : 0;
  const netPayable = Math.max(0, grandTotal - effectiveCreditDeduction);

  // Helper to project future dates based on billing cycles
  const calculateCycleFutureDate: any = createDocumentStudioModalFn52(
    () => __ctrlRef.current,
  );

  // 1. Part Payment (EMI) Calculations
  const numEmiAdvance =
    typeof emiAdvanceAmount === "number" ? Math.max(0, emiAdvanceAmount) : 0;
  const effectiveEmiAdvance = Math.min(netPayable, numEmiAdvance);
  const emiRemainingBalance = Math.max(0, netPayable - effectiveEmiAdvance);
  const emiMonthlyAmount =
    emiTenureMonths > 0
      ? Math.round(emiRemainingBalance / emiTenureMonths)
      : emiRemainingBalance;

  // 2. Subscription Calculations (Strictly x * n with Master Discount — NEVER x * n * n)
  const durationMonths = Math.max(1, Number(subscriptionDurationMonths) || 1);
  const totalSubCycles =
    subscriptionCycle === "Quarterly"
      ? Math.max(1, Math.ceil(durationMonths / 3))
      : subscriptionCycle === "Yearly"
        ? Math.max(1, Math.ceil(durationMonths / 12))
        : subscriptionCycle === "Weekly"
          ? Math.max(1, Math.round(durationMonths * 4))
          : durationMonths;

  // Always use the per-cycle (monthly) base rate, NOT the already-multiplied packagePrice
  const defaultSubRate = isMarketing
    ? Number(marketingPackage?.baseMonthlyPrice || items[0]?.rate || 0)
    : Number(items[0]?.rate || 0);

  const activeSubRate =
    typeof subscriptionRate === "number" && subscriptionRate > 0
      ? subscriptionRate
      : defaultSubRate;

  const matchedMasterRule = subDiscountRules.find(
    (r) => r.isActive !== false && Number(r.months) === durationMonths,
  );
  const subDiscountPct = matchedMasterRule
    ? Number(matchedMasterRule.discountPct) || 0
    : 0;
  const subGrossTotal = activeSubRate * totalSubCycles;
  const subDiscountAmount = Math.round(subGrossTotal * (subDiscountPct / 100));
  const subTaxableTotal = Math.max(
    0,
    subGrossTotal - subDiscountAmount + numSetupCharge,
  );
  const subGstAmount =
    docScheme === "gst" ? Math.round(subTaxableTotal * 0.18) : 0;
  const subContractTotal = subTaxableTotal + subGstAmount;

  const numSubAdvance =
    typeof subscriptionAdvance === "number"
      ? Math.max(0, subscriptionAdvance)
      : 0;
  const effectiveSubAdvance = Math.min(subContractTotal, numSubAdvance);
  const subPrepaidCycles =
    activeSubRate > 0
      ? Math.min(
          totalSubCycles,
          Math.floor(effectiveSubAdvance / activeSubRate),
        )
      : 0;
  const subRemainingCycles = Math.max(0, totalSubCycles - subPrepaidCycles);
  const subBalanceDue = Math.max(0, subContractTotal - effectiveSubAdvance);
  const subNextBillingDate = calculateCycleFutureDate(
    issueDate,
    subscriptionCycle,
    subPrepaidCycles > 0 ? subPrepaidCycles : 1,
  );

  // Save Document handler
  const handleSaveDocument: any = createDocumentStudioModalAction20(
    () => __ctrlRef.current,
  );

  if (!isOpen) return null;

  const modalTitle = isMarketing
    ? mode === "invoice"
      ? "Create Digital Marketing Retainer Invoice"
      : mode === "quotation"
        ? "Create Digital Marketing Retainer Proposal"
        : "Create Digital Marketing Retainer Estimate"
    : mode === "invoice"
      ? docScheme === "gst"
        ? "Create Official GST Tax Invoice"
        : "Create Commercial Non-GST Invoice"
      : mode === "quotation"
        ? "Create Commercial Project Quotation & Tender"
        : "Create Project Cost Estimate";

  const totalSteps = isMarketing ? 3 : mode === "estimate" ? 2 : 3;

  __ctrlRef.current = __ctrl;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-1.5 sm:p-5 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[96vh] sm:max-h-[92vh] flex flex-col overflow-hidden text-xs"
      >
        <DocumentStudioModalSection2 ctrl={__ctrl} />

        {/* ── MODAL BODY ── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Centralized Inheritance Notice Bar across all modes */}
          <div className="p-3.5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-xl flex items-center justify-between text-xs text-blue-800 dark:text-blue-300">
            <div className="flex items-center gap-2">
              <Landmark size={15} className="text-blue-600 shrink-0" />
              <span>
                Issuing under{" "}
                <strong>
                  {activeCompany?.brand_name || activeCompany?.name}
                </strong>
                . Banking, UPI QR, Signatory &amp; Seal are automatically
                inherited.
              </span>
            </div>
            <span className="font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400">
              Signatory:{" "}
              {activeCompany?.signatory_name || "Authorized Signatory"}
            </span>
          </div>

          {/* ════════════════════════════════════════════════════════════════
              DIGITAL MARKETING STUDIO (DEDICATED 3-STEP SEPARATED INTERFACE)
             ════════════════════════════════════════════════════════════════ */}
          <DocumentStudioModalSection1 ctrl={__ctrl} />
        </div>

        {/* ── FOOTER (Responsive on Mobile) ── */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between px-3.5 py-3 sm:px-6 sm:py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-800/40 shrink-0 gap-2.5">
          <div className="text-zinc-400 text-xs font-medium text-center sm:text-left">
            Step {currentStep} of {totalSteps}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl cursor-pointer"
            >
              Cancel
            </button>

            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="px-3.5 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 rounded-xl cursor-pointer"
              >
                Previous Step
              </button>
            )}

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="px-4 sm:px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all cursor-pointer"
              >
                Next Step →
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSaveDocument}
                className="px-4 sm:px-6 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check size={15} />
                <span>
                  {isSubmitting
                    ? "Saving..."
                    : initialData?.id
                      ? "Update Document"
                      : "Save & Generate Document"}
                </span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
