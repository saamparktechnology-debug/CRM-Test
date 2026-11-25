"use client";
import {
  useMasterBundle,
  useMasterOptions,
  useMasterMutations,
} from "@/features/masters/hooks/useMasters";

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
import {
  type DocumentStudioModalProps,
  SERVICE_PRESETS,
} from "@/components/documents/components/documentstudiomodal-sections/DocumentStudioModalHelpers";

export function DocumentStudioModalSection1({ ctrl }: { ctrl: any }) {
  const { data: masterBundle } = useMasterBundle();
  const { options: primaryCategoryOpts } = useMasterOptions("primary_category");
  const { options: servicePresetOpts } = useMasterOptions("service_preset");
  const { createOption: createMasterOption } = useMasterMutations();
  const [savingCustomCat, setSavingCustomCat] = React.useState(false);

  const {
    isMarketing,
    currentStep,
    companyId,
    setCompanyId,
    selectableCompanies,
    branchId,
    setBranchId,
    companyBranches,
    handleSchemeChange,
    docScheme,
    setClientMode,
    clientMode,
    setSelectedClient,
    setIsClientSearchOpen,
    isClientSearchOpen,
    selectedClient,
    clientSearchQuery,
    setClientSearchQuery,
    allClients,
    handleSelectClient,
    clientName,
    setClientName,
    contactPersonName,
    setContactPersonName,
    clientDesignation,
    setClientDesignation,
    clientPhone,
    setClientPhone,
    clientEmail,
    setClientEmail,
    clientGst,
    setClientGst,
    clientAddress,
    setClientAddress,
    clientPincode,
    handlePincodeChange,
    docNumber,
    setDocNumber,
    issueDate,
    setIssueDate,
    dueDate,
    setDueDate,
    setMarketingObjective,
    marketingObjective,
    marketingPlatforms,
    setMarketingPlatforms,
    marketingGeography,
    setMarketingGeography,
    creativeDriveUrl,
    setCreativeDriveUrl,
    marketingPackage,
    setMarketingPackage,
    handleUpdateItem,
    items,
    subscriptionDurationMonths,
    setSubscriptionDurationMonths,
    setupCharge,
    setSetupCharge,
    discountType,
    handleDiscountTypeChange,
    discountValue,
    setDiscountValue,
    calculatedSubtotal,
    calculatedDiscount,
    numSetupCharge,
    calculatedGst,
    netPayable,
    setPaymentPlan,
    paymentPlan,
    grandTotal,
    setEmiAdvanceAmount,
    emiAdvanceAmount,
    setIsCustomEmi,
    setEmiTenureMonths,
    isCustomEmi,
    emiTenureMonths,
    effectiveEmiAdvance,
    emiRemainingBalance,
    emiMonthlyAmount,
    setAdvanceAmount,
    advanceAmount,
    subscriptionCycle,
    setSubscriptionCycle,
    activeSubRate,
    subContractTotal,
    subNextBillingDate,
    terms,
    setTerms,
    mode,
    selectedLinkedProject,
    projectFilterQuery,
    setProjectFilterQuery,
    setSelectedLinkedProject,
    availableProjects,
    setProjectTitle,
    setPrimaryCategory,
    setProjectOverview,
    setProjectTimeline,
    setTurnaroundTime,
    setClientCity,
    setClientState,
    setClientDistrict,
    setClientPincode,
    setDeliverables,
    setItems,
    filteredProjects,
    selectedLinkedInvoice,
    invoiceFilterQuery,
    setInvoiceFilterQuery,
    setSelectedLinkedInvoice,
    availableInvoices,
    filteredInvoices,
    setSubBranchId,
    subBranchId,
    branchSubBranches,
    primaryCategory,
    projectTitle,
    projectOverview,
    projectTimeline,
    customDesignation,
    setCustomDesignation,
    clientCity,
    clientDob,
    setClientDob,
    clientPoliceStation,
    setClientPoliceStation,
    pincodeBlocks,
    referByCategory,
    setReferByCategory,
    referredByName,
    setReferredByName,
    isSplitPayment,
    setIsSplitPayment,
    splitPayments,
    setSplitPayments,
    emiCustomSchedule,
    setEmiCustomSchedule,
    handleAddDeliverable,
    deliverables,
    handleRemoveDeliverable,
    handleUpdateDeliverable,
    scopeInclusions,
    setScopeInclusions,
    scopeExclusions,
    setScopeExclusions,
    handleAddItem,
    handleRemoveItem,
    paymentMilestones,
    turnaroundTime,
    notes,
    setNotes,
    handleAddAssignedMember,
    assignedMembers,
    handleUpdateAssignedMember,
    availableTeamMembers,
    availableReferers,
    handleRemoveAssignedMember,
    isPincodeLoading,
    pincodePlaces,
    pincodeDistricts,
    clientDistrict,
    pincodeStates,
    clientState,
    availableCredit,
    initialData,
    applyCredit,
    setApplyCredit,
    creditToDeduct,
    setCreditToDeduct,
    effectiveCreditDeduction,
    calculateCycleFutureDate,
    subscriptionRate,
    setSubscriptionRate,
    defaultSubRate,
    setSubscriptionAdvance,
    subscriptionAdvance,
    effectiveSubAdvance,
    subPrepaidCycles,
    selectedTargetModule,
    setSelectedTargetModule,
  } = ctrl;

  const syncLocationIntoAddress = (overrides: {
    city?: string;
    policeStation?: string;
    district?: string;
    state?: string;
    pincode?: string;
  }) => {
    const nextCity = (overrides.city !== undefined ? overrides.city : clientCity || "").trim();
    const nextPs = (overrides.policeStation !== undefined ? overrides.policeStation : clientPoliceStation || "").trim();
    const nextDist = (overrides.district !== undefined ? overrides.district : clientDistrict || "").trim();
    const nextState = (overrides.state !== undefined ? overrides.state : clientState || "").trim();
    const nextPin = (overrides.pincode !== undefined ? overrides.pincode : clientPincode || "").trim();
    const parts = [
      nextCity,
      nextPs ? `PS: ${nextPs}` : "",
      nextDist,
      nextState,
    ].filter(Boolean);
    if (parts.length === 0 && !nextPin) return;
    const formatted = `${parts.join(", ")}${nextPin ? ` - ${nextPin}` : ""}`;
    setClientAddress?.(formatted);
  };

  const dynamicServicePresets = React.useMemo(() => {
    const all = servicePresetOpts.map((o: any) => ({
      name: o.label,
      primaryCategory: o.metadata?.primary_category || "",
      sac: o.metadata?.sac || o.code || "998313",
      gst: Number(o.metadata?.gst ?? 18),
      unit: o.metadata?.unit || "Project",
      rate: Number(o.metadata?.rate ?? 0),
    }));
    const cat = String(primaryCategory || "")
      .trim()
      .toLowerCase();
    if (!cat || cat === "other" || cat === "custom") return all;
    return all.filter(
      (p: any) => p.primaryCategory.trim().toLowerCase() === cat,
    );
  }, [servicePresetOpts, primaryCategory]);
  const [customPrimaryCategory, setCustomPrimaryCategory] = React.useState("");

  React.useEffect(() => {
    if (!primaryCategoryOpts || primaryCategoryOpts.length === 0) return;
    const exists = primaryCategoryOpts.some(
      (o: any) => o.value === primaryCategory || o.label === primaryCategory,
    );
    if (
      !exists &&
      primaryCategory !== "Other" &&
      primaryCategory !== "Custom"
    ) {
      const def =
        primaryCategoryOpts.find((o: any) => Boolean(o.is_default)) ||
        primaryCategoryOpts[0];
      if (def?.value && setPrimaryCategory) setPrimaryCategory(def.value);
    }
  }, [primaryCategoryOpts, primaryCategory, setPrimaryCategory]);

  React.useEffect(() => {
    if (mode !== "invoice" || isMarketing || ctrl.initialData) return;
    if (!dynamicServicePresets || dynamicServicePresets.length === 0) return;
    if (
      Array.isArray(items) &&
      items.length === 1 &&
      !items[0]?.serviceName &&
      (!items[0]?.rate || Number(items[0]?.rate) === 0)
    ) {
      const firstPreset = dynamicServicePresets[0];
      const baseRate = Number(firstPreset.rate || 0);
      const gstRate = docScheme === "gst" ? Number(firstPreset.gst ?? 18) : 0;
      const gstAmt = Math.round(baseRate * (gstRate / 100));
      setItems?.([
        {
          ...items[0],
          serviceName: firstPreset.name,
          sacCode: docScheme === "gst" ? firstPreset.sac || "998313" : "",
          unit: firstPreset.unit || "Project",
          rate: baseRate,
          gstRate,
          gstAmount: gstAmt,
          totalAmount: baseRate + gstAmt,
        },
      ]);
    }
  }, [mode, isMarketing, dynamicServicePresets, docScheme]);

  const isOtherPrimary =
    primaryCategory === "Other" ||
    primaryCategory === "Custom" ||
    primaryCategoryOpts.some(
      (o: any) => o.value === primaryCategory && o.metadata?.isOther,
    );
  return (
    <>
      {isMarketing ? (
        <>
          {/* Marketing Step 1: 🎯 Client & Campaign Focus */}
          {currentStep === 1 && (
            <div className="space-y-5">
              {/* Issuing Entity & Scheme */}
              <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-3">
                <span className="font-extrabold text-zinc-800 dark:text-zinc-200 block border-b border-zinc-200 dark:border-zinc-700/60 pb-2 text-xs">
                  Issuing Corporate Entity &amp; Taxation Mode
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                      Issuing Company *
                    </label>
                    <select
                      value={companyId}
                      onChange={(e) => setCompanyId(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold text-xs"
                    >
                      {selectableCompanies.map((c) => (
                        <option key={c.id || c.slug} value={c.id || c.slug}>
                          {c.brand_name || c.name} (
                          {c.slug === "consultancy" || c.id === "2"
                            ? "Digital Marketing Entity"
                            : "IT / Tech Entity"}
                          )
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                      Operating Branch
                    </label>
                    <select
                      value={branchId}
                      onChange={(e) => setBranchId(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold text-xs"
                    >
                      <option value="">
                        Default Head Office / Main Branch
                      </option>
                      {companyBranches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tax Scheme */}
                <div className="pt-2">
                  <label className="block text-[10px] font-bold text-zinc-600 dark:text-zinc-400 mb-1.5">
                    Tax Scheme *
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleSchemeChange("gst")}
                      className={`p-2.5 rounded-xl border-2 text-left cursor-pointer transition-all flex items-center gap-2.5 ${
                        docScheme === "gst"
                          ? "border-purple-600 bg-purple-50/50 dark:bg-purple-950/30 font-bold text-purple-950 dark:text-purple-200"
                          : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400"
                      }`}
                    >
                      <Building2
                        size={15}
                        className={
                          docScheme === "gst"
                            ? "text-purple-600"
                            : "text-zinc-400"
                        }
                      />
                      <div>
                        <div className="text-xs">
                          GST Tax Mode (18% Statutory)
                        </div>
                        <div className="text-[9.5px] opacity-75 font-normal">
                          HSN/SAC 998311 • CGST/SGST Breakdown
                        </div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSchemeChange("nongst")}
                      className={`p-2.5 rounded-xl border-2 text-left cursor-pointer transition-all flex items-center gap-2.5 ${
                        docScheme === "nongst"
                          ? "border-purple-600 bg-purple-50/50 dark:bg-purple-950/30 font-bold text-purple-950 dark:text-purple-200"
                          : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400"
                      }`}
                    >
                      <Calculator
                        size={15}
                        className={
                          docScheme === "nongst"
                            ? "text-purple-600"
                            : "text-zinc-400"
                        }
                      />
                      <div>
                        <div className="text-xs">
                          Commercial Non-GST Mode (0% Tax)
                        </div>
                        <div className="text-[9.5px] opacity-75 font-normal">
                          Direct Net Retainer Billing
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Client & Brand Selection */}
              <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-700/60 pb-2">
                  <span className="font-extrabold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <UserCheck size={15} className="text-purple-600" />
                    <span>Client / Brand Organization</span>
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setClientMode("select")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                        clientMode === "select"
                          ? "bg-purple-600 text-white"
                          : "bg-white dark:bg-zinc-800 text-zinc-600 border border-zinc-200 dark:border-zinc-700"
                      }`}
                    >
                      Select Existing Client
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setClientMode("custom");
                        setSelectedClient(null);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                        clientMode === "custom"
                          ? "bg-purple-600 text-white"
                          : "bg-white dark:bg-zinc-800 text-zinc-600 border border-zinc-200 dark:border-zinc-700"
                      }`}
                    >
                      + Custom Brand
                    </button>
                  </div>
                </div>

                {clientMode === "select" && (
                  <div className="relative">
                    <div
                      onClick={() => setIsClientSearchOpen(!isClientSearchOpen)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between cursor-pointer hover:border-purple-500"
                    >
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 truncate">
                        {selectedClient
                          ? `${selectedClient.name} (${selectedClient.email || selectedClient.phone || "No contact"})`
                          : "Click to select a client..."}
                      </span>
                      <ChevronDown
                        size={16}
                        className="text-zinc-400 shrink-0"
                      />
                    </div>

                    {isClientSearchOpen && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-2xl z-50 overflow-hidden p-2 space-y-2">
                        <input
                          type="text"
                          placeholder="Search client..."
                          value={clientSearchQuery}
                          onChange={(e) => setClientSearchQuery(e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs"
                          autoFocus
                        />
                        <div className="max-h-52 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
                          {allClients
                            .filter(
                              (c) =>
                                !clientSearchQuery ||
                                String(c.name || "")
                                  .toLowerCase()
                                  .includes(clientSearchQuery.toLowerCase()),
                            )
                            .map((c) => (
                              <div
                                key={c.id}
                                onClick={() => handleSelectClient(c)}
                                className="p-2.5 hover:bg-purple-50 dark:hover:bg-purple-950/30 cursor-pointer rounded-lg flex items-center justify-between"
                              >
                                <div>
                                  <div className="font-bold text-zinc-900 dark:text-zinc-100">
                                    {c.name}
                                  </div>
                                  <div className="text-[10.5px] text-zinc-400">
                                    {c.email || c.phone || "No contact"}
                                  </div>
                                </div>
                                <span className="text-[10.5px] text-purple-600 font-bold">
                                  Select
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-600 dark:text-zinc-400 mb-0.5">
                      Brand / Company Name *
                    </label>
                    <Input
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="e.g. Apex Health Clinic"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-600 dark:text-zinc-400 mb-0.5">
                      Contact Person *
                    </label>
                    <Input
                      value={contactPersonName}
                      onChange={(e) => setContactPersonName(e.target.value)}
                      placeholder="e.g. Rahul Sen"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-600 dark:text-zinc-400 mb-0.5">
                      Designation
                    </label>
                    <select
                      value={clientDesignation}
                      onChange={(e) => setClientDesignation(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold text-xs"
                    >
                      {(
                        masterBundle?.options?.["client_designation"] || []
                      ).map((opt: any) => (
                        <option key={opt.id} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-600 dark:text-zinc-400 mb-0.5">
                      WhatsApp / Phone *
                    </label>
                    <Input
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-600 dark:text-zinc-400 mb-0.5">
                      Official Email
                    </label>
                    <Input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="marketing@apexhealth.in"
                    />
                  </div>
                  {docScheme !== "nongst" && (
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-600 dark:text-zinc-400 mb-0.5">
                        Client GSTIN (Optional)
                      </label>
                      <Input
                        value={clientGst}
                        onChange={(e) =>
                          setClientGst(e.target.value.toUpperCase())
                        }
                        placeholder="19AAAAA0000A1Z5"
                        className="font-mono uppercase"
                      />
                    </div>
                  )}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-zinc-600 dark:text-zinc-400 mb-0.5">
                      Office / Brand Address
                    </label>
                    <Input
                      value={clientAddress}
                      onChange={(e) => setClientAddress(e.target.value)}
                      placeholder="Suite 401, Park Street, Kolkata"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-600 dark:text-zinc-400 mb-0.5">
                      Pincode (Auto-lookup)
                    </label>
                    <Input
                      value={clientPincode}
                      onChange={(e) => handlePincodeChange(e.target.value)}
                      placeholder="700016"
                      maxLength={6}
                      className="font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Reference & Campaign Objectives */}
              <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-3">
                <span className="font-extrabold text-zinc-800 dark:text-zinc-200 block border-b border-zinc-200 dark:border-zinc-700/60 pb-2 text-xs">
                  Campaign Focus, Active Channels &amp; Geography
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-600 dark:text-zinc-400 mb-0.5">
                      Document Number *
                    </label>
                    <Input
                      value={docNumber}
                      onChange={(e) => setDocNumber(e.target.value)}
                      className="font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-600 dark:text-zinc-400 mb-0.5">
                      Billing / Start Date *
                    </label>
                    <Input
                      type="date"
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-600 dark:text-zinc-400 mb-0.5">
                      Due / Renewal Date
                    </label>
                    <Input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                  </div>

                  {/* Primary Campaign Objective */}
                  <div className="sm:col-span-3">
                    <label className="block text-[10.5px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      🎯 Primary Campaign Objective *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        {
                          id: "Brand Awareness & Viral Social Reach",
                          label: "🚀 Brand Awareness",
                          desc: "Maximize reach & viral engagement",
                        },
                        {
                          id: "High-Intent Lead Generation & Enquiries",
                          label: "🎯 Lead Generation",
                          desc: "Forms, WhatsApp calls & direct inbound",
                        },
                        {
                          id: "E-Commerce ROAS & Conversion Sales",
                          label: "🛒 E-Commerce & ROAS",
                          desc: "Catalog sales, pixel tracking & orders",
                        },
                        {
                          id: "Local Store Footfall & Regional Growth",
                          label: "📍 Local Footfall",
                          desc: "Google My Business & hyper-local radius",
                        },
                      ].map((obj) => (
                        <button
                          key={obj.id}
                          type="button"
                          onClick={() => setMarketingObjective(obj.id)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            marketingObjective === obj.id
                              ? "border-purple-600 bg-purple-50 dark:bg-purple-950/60 text-purple-900 dark:text-purple-200 ring-1 ring-purple-500 shadow-2xs"
                              : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                          }`}
                        >
                          <div className="font-bold text-xs">{obj.label}</div>
                          <div className="text-[10px] text-zinc-500 mt-0.5">
                            {obj.desc}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Active Channels */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10.5px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      📢 Active Marketing Channels *
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        "Instagram",
                        "Facebook",
                        "Meta Ads Manager",
                        "Google Ads & Search",
                        "YouTube Shorts & Videos",
                        "LinkedIn B2B",
                      ].map((platform) => {
                        const active = marketingPlatforms.includes(platform);
                        return (
                          <button
                            key={platform}
                            type="button"
                            onClick={() => {
                              if (active) {
                                if (marketingPlatforms.length > 1) {
                                  setMarketingPlatforms(
                                    marketingPlatforms.filter(
                                      (p) => p !== platform,
                                    ),
                                  );
                                }
                              } else {
                                setMarketingPlatforms([
                                  ...marketingPlatforms,
                                  platform,
                                ]);
                              }
                            }}
                            className={`px-2.5 py-1.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                              active
                                ? "border-purple-600 bg-purple-100/70 dark:bg-purple-900/50 text-purple-900 dark:text-purple-100"
                                : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                            }`}
                          >
                            {active ? "✓ " : "+ "}
                            {platform}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Target Geography */}
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                      Target Geography / Radius
                    </label>
                    <Input
                      value={marketingGeography}
                      onChange={(e) => setMarketingGeography(e.target.value)}
                      placeholder="e.g. Kolkata, West Bengal & Eastern India"
                      className="font-semibold text-xs"
                    />
                  </div>

                  {/* Live Drive / Meta Link */}
                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-bold text-zinc-600 dark:text-zinc-400 mb-1 flex items-center justify-between">
                      <span>🔗 Live Creative Assets Drive / Meta URL</span>
                      <span className="text-[9.5px] text-purple-600 font-bold">
                        Google Drive, Meta Business Suite, or Figma link for
                        client live view
                      </span>
                    </label>
                    <Input
                      value={creativeDriveUrl}
                      onChange={(e) => setCreativeDriveUrl(e.target.value)}
                      placeholder="https://drive.google.com/drive/folders/... or https://business.facebook.com/..."
                      className="font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Marketing Step 2: 📱 Retainer Deliverables Quota */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <DigitalMarketingPackageBuilder
                value={marketingPackage}
                onChange={(pkg) => {
                  setMarketingPackage(pkg);
                  if (pkg.packagePrice) {
                    handleUpdateItem(
                      items[0]?.id || "item_1",
                      "rate",
                      pkg.packagePrice,
                    );
                  }
                }}
                clientName={clientName}
                clientPhone={clientPhone}
                clientAddress={clientAddress}
              />
            </div>
          )}

          {/* Marketing Step 3: 💳 Pricing, Commercial SLAs & Settlement */}
          {currentStep === 3 && (
            <div className="space-y-5">
              {/* Retainer Commercials */}
              <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-3">
                <span className="font-extrabold text-zinc-800 dark:text-zinc-200 block border-b border-zinc-200 dark:border-zinc-700/60 pb-2 text-xs">
                  Retainer Monthly Fee &amp; Duration Calculation Zone
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-600 dark:text-zinc-400 mb-0.5">
                      Monthly Retainer Fee (₹) *
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={
                        items[0]?.rate ?? marketingPackage.packagePrice ?? 12000
                      }
                      onChange={(e) => {
                        const val =
                          e.target.value === "" ? 0 : Number(e.target.value);
                        handleUpdateItem(items[0]?.id || "item_1", "rate", val);
                        setMarketingPackage((prev) => ({
                          ...prev,
                          packagePrice: val,
                        }));
                      }}
                      className="font-bold font-mono text-purple-600 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-600 dark:text-zinc-400 mb-0.5">
                      Campaign Duration
                    </label>
                    <select
                      value={subscriptionDurationMonths}
                      onChange={(e) =>
                        setSubscriptionDurationMonths(Number(e.target.value))
                      }
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold text-xs"
                    >
                      {(masterBundle?.options?.["duration_offer"] || []).map(
                        (opt: any) => (
                          <option key={opt.id} value={opt.value}>
                            {opt.label}
                          </option>
                        ),
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-600 dark:text-zinc-400 mb-0.5">
                      Setup / Onboarding Fee (₹)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={setupCharge === 0 ? "" : setupCharge}
                      onChange={(e) =>
                        setSetupCharge(
                          e.target.value === ""
                            ? ""
                            : Math.max(0, Number(e.target.value)),
                        )
                      }
                      placeholder="e.g. 2000"
                      className="font-mono font-bold"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400">
                        Commercial Discount{" "}
                        {discountType === "percentage" ? "(%)" : "(₹)"}
                      </label>
                      <div className="flex items-center p-0.5 rounded-lg bg-zinc-200/70 dark:bg-zinc-800 text-[10px] font-bold">
                        <button
                          type="button"
                          onClick={() => handleDiscountTypeChange("fixed")}
                          className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                            discountType === "fixed"
                              ? "bg-white dark:bg-zinc-900 text-purple-600 dark:text-purple-400 shadow-xs"
                              : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                          }`}
                        >
                          ₹ Amount
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDiscountTypeChange("percentage")}
                          className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                            discountType === "percentage"
                              ? "bg-white dark:bg-zinc-900 text-purple-600 dark:text-purple-400 shadow-xs"
                              : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                          }`}
                        >
                          % Percent
                        </button>
                      </div>
                    </div>
                    <Input
                      type="number"
                      min="0"
                      max={discountType === "percentage" ? 100 : undefined}
                      value={discountValue === 0 ? "" : discountValue}
                      onChange={(e) => {
                        const val =
                          e.target.value === ""
                            ? ""
                            : Math.max(0, Number(e.target.value));
                        if (
                          typeof val === "number" &&
                          discountType === "percentage" &&
                          val > 100
                        ) {
                          setDiscountValue(100);
                        } else {
                          setDiscountValue(val);
                        }
                      }}
                      placeholder={
                        discountType === "percentage"
                          ? "e.g. 10 (%)"
                          : "e.g. 1000 (₹)"
                      }
                      className="font-mono font-bold text-rose-600"
                    />
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 space-y-2 mt-2">
                  <div className="flex items-center justify-between text-zinc-600 text-xs">
                    <span>Monthly Retainer Base:</span>
                    <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      ₹{calculatedSubtotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                  {calculatedDiscount > 0 && (
                    <div className="flex items-center justify-between text-rose-600 text-xs">
                      <span>Less Discount:</span>
                      <span className="font-mono font-bold">
                        -₹{calculatedDiscount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}
                  {numSetupCharge > 0 && (
                    <div className="flex items-center justify-between text-zinc-600 text-xs">
                      <span>Add Onboarding / Setup:</span>
                      <span className="font-mono font-bold">
                        +₹{numSetupCharge.toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}
                  {docScheme === "gst" && (
                    <div className="flex items-center justify-between text-purple-600 text-xs font-semibold">
                      <span>Statutory GST (18% SAC 998311):</span>
                      <span className="font-mono font-bold">
                        +₹{calculatedGst.toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-zinc-200 dark:border-zinc-700 pt-2 flex items-center justify-between text-sm">
                    <span className="font-black text-zinc-900 dark:text-zinc-100">
                      Monthly Net Payable:
                    </span>
                    <span className="font-black font-mono text-purple-600 dark:text-purple-400 text-base">
                      ₹{netPayable.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-400 font-medium italic">
                    Amount in words: {numberToIndianWords(netPayable)}
                  </div>
                </div>
              </div>

              {/* Payment Settlement Structure */}
              <div className="p-4 rounded-2xl border border-purple-200 dark:border-purple-800/80 bg-purple-50/20 dark:bg-purple-950/20 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-200/60 dark:border-purple-800/60 pb-2">
                  <span className="font-extrabold text-zinc-800 dark:text-zinc-200 text-xs flex items-center gap-1.5">
                    <Calculator size={15} className="text-purple-600" />
                    <span>
                      Payment Settlement &amp; Billing Structure (Interactive
                      Marketing Payment Plan)
                    </span>
                  </span>

                  {/* 1. Full, 2. Part (EMI), 3. Advance, 4. Subscription */}
                  <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setPaymentPlan("full")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        paymentPlan === "full"
                          ? "bg-purple-600 text-white shadow-xs"
                          : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
                      }`}
                    >
                      1. 💳 Full
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentPlan("part")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        paymentPlan === "part"
                          ? "bg-purple-600 text-white shadow-xs"
                          : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
                      }`}
                    >
                      2. 🔄 Part (EMI)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentPlan("advance")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        paymentPlan === "advance"
                          ? "bg-purple-600 text-white shadow-xs"
                          : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
                      }`}
                    >
                      3. 🪙 Advance
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentPlan("subscription")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        paymentPlan === "subscription"
                          ? "bg-purple-600 text-white shadow-xs"
                          : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
                      }`}
                    >
                      4. 🗓️ Subscription
                    </button>
                  </div>
                </div>

                {paymentPlan === "full" && (
                  <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-purple-200 dark:border-purple-800 text-xs flex items-center justify-between">
                    <span className="text-zinc-600 dark:text-zinc-400">
                      100% Upfront Package Settlement. Full invoice balance
                      settled upon kickoff.
                    </span>
                    <span className="font-mono font-bold text-purple-600">
                      Total: ₹{grandTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}

                {paymentPlan === "part" && (
                  <div className="p-3.5 bg-purple-50/60 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-800/80 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-950 dark:text-purple-200 flex items-center gap-1.5 text-xs">
                        <span>
                          🔄 Part Payment / Monthly EMI Installment Structure
                        </span>
                      </span>
                      <span className="text-[10.5px] text-purple-700 dark:text-purple-300 bg-purple-100/70 dark:bg-purple-900/50 px-2 py-0.5 rounded-full font-bold">
                        Advance Minus Option
                      </span>
                    </div>

                    {/* Advance Down Payment Input */}
                    <div className="space-y-1.5 bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-purple-100 dark:border-purple-900/50">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                          Advance Kickoff Down Payment (Paid Upfront)
                        </label>
                        <div className="flex gap-1">
                          {[0, 0.2, 0.3, 0.5].map((pct) => (
                            <button
                              key={pct}
                              type="button"
                              onClick={() =>
                                setEmiAdvanceAmount(
                                  pct === 0 ? 0 : Math.round(netPayable * pct),
                                )
                              }
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                                (pct === 0 &&
                                  (emiAdvanceAmount === 0 ||
                                    emiAdvanceAmount === "")) ||
                                (pct > 0 &&
                                  emiAdvanceAmount ===
                                    Math.round(netPayable * pct))
                                  ? "bg-purple-600 text-white"
                                  : "bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 hover:bg-purple-100"
                              }`}
                            >
                              {pct === 0 ? "0% (No Adv)" : `${pct * 100}%`}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">
                          ₹
                        </span>
                        <Input
                          type="number"
                          min="0"
                          max={netPayable}
                          value={emiAdvanceAmount === 0 ? "" : emiAdvanceAmount}
                          onChange={(e) =>
                            setEmiAdvanceAmount(
                              e.target.value === ""
                                ? ""
                                : Math.max(0, Number(e.target.value)),
                            )
                          }
                          placeholder="Enter upfront advance amount..."
                          className="font-mono font-bold pl-7 h-8 text-xs"
                        />
                      </div>
                    </div>

                    {/* EMI Tenure Months */}
                    <div className="space-y-1.5 bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-purple-100 dark:border-purple-900/50">
                      <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 block">
                        Retainer Tenure / Installments Count
                      </label>
                      <div className="flex gap-1.5 flex-wrap">
                        {[2, 3, 4, 6, 9, 12].map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => {
                              setIsCustomEmi(false);
                              setEmiTenureMonths(m);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              !isCustomEmi && emiTenureMonths === m
                                ? "bg-purple-600 text-white shadow-2xs"
                                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200"
                            }`}
                          >
                            {m} Months
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => setIsCustomEmi(true)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            isCustomEmi
                              ? "bg-purple-600 text-white shadow-2xs"
                              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200"
                          }`}
                        >
                          Custom
                        </button>
                      </div>
                      {isCustomEmi && (
                        <div className="pt-1.5 flex items-center gap-2">
                          <span className="text-zinc-500 text-[11px]">
                            Duration:
                          </span>
                          <input
                            type="number"
                            min="1"
                            max="60"
                            value={emiTenureMonths}
                            onChange={(e) =>
                              setEmiTenureMonths(
                                Math.max(1, Number(e.target.value) || 1),
                              )
                            }
                            className="w-20 px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-xs font-bold font-mono"
                          />
                          <span className="text-zinc-500 text-[11px]">
                            Months
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Calculated Breakdown Card */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2.5 bg-purple-100/60 dark:bg-purple-900/40 rounded-lg text-[11px]">
                      <div>
                        <span className="text-purple-900 dark:text-purple-300 font-semibold block">
                          Kickoff Advance:
                        </span>
                        <span className="font-mono font-bold text-purple-700 dark:text-purple-200 text-xs">
                          ₹{effectiveEmiAdvance.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div>
                        <span className="text-purple-900 dark:text-purple-300 font-semibold block">
                          Balance to Split:
                        </span>
                        <span className="font-mono font-bold text-purple-700 dark:text-purple-200 text-xs">
                          ₹{emiRemainingBalance.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div>
                        <span className="text-purple-900 dark:text-purple-300 font-semibold block">
                          Monthly EMI:
                        </span>
                        <span className="font-mono font-black text-purple-700 dark:text-purple-200 text-xs">
                          ₹{emiMonthlyAmount.toLocaleString("en-IN")} / mo
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {paymentPlan === "advance" && (
                  <div className="p-3.5 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800/80 space-y-3 text-xs">
                    <span className="font-bold text-amber-950 dark:text-amber-200 block text-xs">
                      🪙 Advance Payment Structure (Kickoff Advance + Balance
                      Due on Delivery)
                    </span>

                    <div className="space-y-1.5 bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-amber-100 dark:border-amber-900/50">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                          Advance Down Payment Amount
                        </label>
                        <div className="flex gap-1">
                          {[0.25, 0.3, 0.5, 0.75].map((pct) => (
                            <button
                              key={pct}
                              type="button"
                              onClick={() =>
                                setAdvanceAmount(Math.round(netPayable * pct))
                              }
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                                advanceAmount === Math.round(netPayable * pct)
                                  ? "bg-amber-600 text-white"
                                  : "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 hover:bg-amber-100"
                              }`}
                            >
                              {pct * 100}%
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">
                          ₹
                        </span>
                        <Input
                          type="number"
                          min="0"
                          max={netPayable}
                          value={advanceAmount === 0 ? "" : advanceAmount}
                          onChange={(e) =>
                            setAdvanceAmount(
                              e.target.value === ""
                                ? ""
                                : Math.max(0, Number(e.target.value)),
                            )
                          }
                          placeholder="Enter advance amount..."
                          className="font-mono font-bold pl-7 h-8 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-2.5 bg-amber-100/60 dark:bg-amber-900/40 rounded-lg text-[11px]">
                      <div>
                        <span className="text-amber-900 dark:text-amber-300 font-semibold block">
                          Kickoff Advance:
                        </span>
                        <span className="font-mono font-bold text-amber-700 dark:text-amber-200 text-xs">
                          ₹
                          {(Number(advanceAmount) || 0).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div>
                        <span className="text-amber-900 dark:text-amber-300 font-semibold block">
                          Remaining Balance:
                        </span>
                        <span className="font-mono font-bold text-amber-700 dark:text-amber-200 text-xs">
                          ₹
                          {Math.max(
                            0,
                            netPayable - (Number(advanceAmount) || 0),
                          ).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {paymentPlan === "subscription" && (
                  <div className="p-3.5 bg-purple-50/60 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-800/80 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-950 dark:text-purple-200 flex items-center gap-1.5 text-xs">
                        <span>
                          🗓️ Recurring Subscription / Retainer Contract
                        </span>
                      </span>
                      <span className="text-[10.5px] text-purple-700 dark:text-purple-300 bg-purple-100/70 dark:bg-purple-900/50 px-2 py-0.5 rounded-full font-bold">
                        Auto Billing Schedule
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-purple-100 dark:border-purple-900/50">
                      <div>
                        <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                          Billing Cadence Cycle
                        </label>
                        <select
                          value={subscriptionCycle}
                          onChange={(e) =>
                            setSubscriptionCycle(e.target.value as any)
                          }
                          className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-xs font-semibold"
                        >
                          {(masterBundle?.options?.["billing_unit"] || []).map(
                            (opt: any) => (
                              <option key={opt.id} value={opt.value}>
                                {opt.label}
                              </option>
                            ),
                          )}
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                          Contract Duration (Months)
                        </label>
                        <select
                          value={subscriptionDurationMonths}
                          onChange={(e) =>
                            setSubscriptionDurationMonths(
                              Number(e.target.value),
                            )
                          }
                          className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-xs font-semibold"
                        >
                          {(
                            masterBundle?.options?.["duration_offer"] || []
                          ).map((opt: any) => (
                            <option key={opt.id} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2.5 bg-purple-100/60 dark:bg-purple-900/40 rounded-lg text-[11px]">
                      <div>
                        <span className="text-purple-900 dark:text-purple-300 font-semibold block">
                          Cycle Rate:
                        </span>
                        <span className="font-mono font-bold text-purple-700 dark:text-purple-200 text-xs">
                          ₹
                          {(activeSubRate || grandTotal).toLocaleString(
                            "en-IN",
                          )}{" "}
                          / {subscriptionCycle.toLowerCase()}
                        </span>
                      </div>
                      <div>
                        <span className="text-purple-900 dark:text-purple-300 font-semibold block">
                          Total Contract:
                        </span>
                        <span className="font-mono font-bold text-purple-700 dark:text-purple-200 text-xs">
                          ₹{subContractTotal.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div>
                        <span className="text-purple-900 dark:text-purple-300 font-semibold block">
                          Next Bill Date:
                        </span>
                        <span className="font-mono font-bold text-purple-700 dark:text-purple-200 text-xs">
                          {subNextBillingDate}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SLAs & Retainer Terms */}
              <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-3">
                <span className="font-extrabold text-zinc-800 dark:text-zinc-200 block border-b border-zinc-200 dark:border-zinc-700/60 pb-2 text-xs">
                  Digital Marketing SLAs &amp; Service Deliverable Commitments
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700">
                    <div className="font-bold text-purple-600">
                      ⏱️ Review Turnaround SLA
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-1">
                      Client approval window: 24-48 hours. Edits processed
                      within 1 business day.
                    </p>
                  </div>
                  <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700">
                    <div className="font-bold text-purple-600">
                      📊 Weekly Cadence &amp; Insights
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-1">
                      Weekly WhatsApp reach report &amp; comprehensive monthly
                      performance audit.
                    </p>
                  </div>
                  <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700">
                    <div className="font-bold text-purple-600">
                      🎯 Meta / Google Ad Spends
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-1">
                      Ad budget paid directly into Meta/Google ad account or
                      reimbursed at cost.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-[10px] font-bold text-zinc-600 dark:text-zinc-400 mb-0.5">
                    Retainer Terms &amp; Scope Notes
                  </label>
                  <textarea
                    rows={3}
                    value={terms}
                    onChange={(e) => setTerms(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs resize-none"
                  />
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* ════════════════════════════════════════════════════════════════
              MODE: QUOTATION (COMMERCIAL PROJECT PROPOSAL)
             ════════════════════════════════════════════════════════════════ */}
          {mode === "quotation" && (
            <>
              {/* Step 1: Project & Client Overview */}
              {currentStep === 1 && (
                <div className="space-y-5">
                  {/* Link Against Existing Project or Invoice */}
                  <div className="p-3.5 rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-indigo-950 dark:text-indigo-200 block">
                        Proposal Association (Search &amp; Auto-Fill from
                        Project or Invoice)
                      </span>
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                        Selecting auto-populates client, services, and technical
                        deliverables
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[10px] font-bold text-zinc-600 dark:text-zinc-400">
                            Search &amp; Link Existing Project
                          </label>
                          {selectedLinkedProject && (
                            <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                              ✓ Auto-filled
                            </span>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <input
                            type="text"
                            placeholder="🔍 Search projects by title or client..."
                            value={projectFilterQuery}
                            onChange={(e) =>
                              setProjectFilterQuery(e.target.value)
                            }
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs"
                          />
                          <select
                            value={selectedLinkedProject}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSelectedLinkedProject(val);
                              if (!val) return;
                              const p = availableProjects.find(
                                (pr) =>
                                  String(pr.id) === val || pr.name === val,
                              );
                              if (p) {
                                if (p.name) setProjectTitle(p.name);
                                if (p.category) setPrimaryCategory(p.category);
                                if (p.overview || p.description)
                                  setProjectOverview(
                                    p.overview || p.description,
                                  );
                                if (p.timeline) setProjectTimeline(p.timeline);
                                if (p.turnaroundTime)
                                  setTurnaroundTime(p.turnaroundTime);

                                const matchedClient = (allClients || []).find(
                                  (c: any) =>
                                    (p.clientId &&
                                      String(c.id) === String(p.clientId)) ||
                                    (p.clientName &&
                                      String(c.name || "")
                                        .toLowerCase()
                                        .trim() ===
                                        String(p.clientName)
                                          .toLowerCase()
                                          .trim()),
                                );
                                if (matchedClient) {
                                  setSelectedClient(matchedClient);
                                  setClientName(matchedClient.name || "");
                                  setClientEmail(matchedClient.email || "");
                                  setClientPhone(matchedClient.phone || "");
                                  setClientAddress(matchedClient.address || "");
                                  setClientCity(matchedClient.city || "");
                                  setClientState(matchedClient.state || "");
                                  setClientDistrict(
                                    matchedClient.district || "",
                                  );
                                  setClientPincode(matchedClient.zip || "");
                                  setClientGst(matchedClient.gstNumber || "");
                                  setContactPersonName(
                                    matchedClient.primaryContact ||
                                      matchedClient.contactPerson ||
                                      "",
                                  );
                                  setClientDesignation(
                                    matchedClient.designation || "Proprietor",
                                  );
                                } else if (p.clientName) {
                                  setClientName(p.clientName);
                                  if (p.clientEmail)
                                    setClientEmail(p.clientEmail);
                                  if (p.clientPhone)
                                    setClientPhone(p.clientPhone);
                                  if (p.clientAddress)
                                    setClientAddress(p.clientAddress);
                                  if (p.clientCity) setClientCity(p.clientCity);
                                  if (p.clientState)
                                    setClientState(p.clientState);
                                  if (p.clientGst) setClientGst(p.clientGst);
                                }

                                if (
                                  Array.isArray(p.deliverables) &&
                                  p.deliverables.length > 0
                                ) {
                                  setDeliverables(p.deliverables);
                                }
                                if (
                                  Array.isArray(p.services) &&
                                  p.services.length > 0
                                ) {
                                  setItems(
                                    p.services.map((s: any, idx: number) => ({
                                      id: s.id || `item_${idx + 1}`,
                                      serviceName:
                                        s.name ||
                                        s.serviceName ||
                                        `Service ${idx + 1}`,
                                      description: s.description || "",
                                      sacCode: s.sac || s.sacCode || "998311",
                                      qty: Number(s.quantity || s.qty || 1),
                                      rate: Number(s.unitPrice || s.rate || 0),
                                      gstRate: docScheme === "gst" ? 18 : 0,
                                      totalAmount: Number(
                                        s.total ||
                                          (s.unitPrice || s.rate || 0) *
                                            (s.quantity || s.qty || 1),
                                      ),
                                    })),
                                  );
                                } else if (
                                  Array.isArray(p.items) &&
                                  p.items.length > 0
                                ) {
                                  setItems(
                                    p.items.map((it: any, idx: number) => ({
                                      id: it.id || `item_${idx + 1}`,
                                      serviceName:
                                        it.serviceName ||
                                        it.name ||
                                        `Service ${idx + 1}`,
                                      description: it.description || "",
                                      sacCode: it.sacCode || it.sac || "998311",
                                      qty: Number(it.qty || it.quantity || 1),
                                      rate: Number(
                                        it.rate || it.unitPrice || 0,
                                      ),
                                      gstRate: docScheme === "gst" ? 18 : 0,
                                      totalAmount: Number(
                                        it.totalAmount ||
                                          it.total ||
                                          (it.rate || it.unitPrice || 0) *
                                            (it.qty || it.quantity || 1),
                                      ),
                                    })),
                                  );
                                }
                              }
                            }}
                            className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold"
                          >
                            <option value="">
                              -- No Project (New Commercial Opportunity) --
                            </option>
                            {filteredProjects.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}{" "}
                                {p.clientName ? `(${p.clientName})` : ""}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[10px] font-bold text-zinc-600 dark:text-zinc-400">
                            Search &amp; Link Existing Invoice
                          </label>
                          {selectedLinkedInvoice && (
                            <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                              ✓ Auto-filled
                            </span>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <input
                            type="text"
                            placeholder="🔍 Search invoices by number or client..."
                            value={invoiceFilterQuery}
                            onChange={(e) =>
                              setInvoiceFilterQuery(e.target.value)
                            }
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs"
                          />
                          <select
                            value={selectedLinkedInvoice}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSelectedLinkedInvoice(val);
                              if (!val) return;
                              const inv = availableInvoices.find(
                                (i) =>
                                  String(i.id) === val ||
                                  i.invoiceNumber === val,
                              );
                              if (inv) {
                                if (inv.project) setProjectTitle(inv.project);
                                else if (inv.projectName)
                                  setProjectTitle(inv.projectName);
                                if (inv.category)
                                  setPrimaryCategory(inv.category);
                                if (inv.isNonGst || inv.taxType === "nongst")
                                  handleSchemeChange("nongst");
                                else if (inv.taxType === "gst")
                                  handleSchemeChange("gst");

                                const matchedClient = (allClients || []).find(
                                  (c: any) =>
                                    (inv.clientId &&
                                      String(c.id) === String(inv.clientId)) ||
                                    (inv.client &&
                                      String(c.name || "")
                                        .toLowerCase()
                                        .trim() ===
                                        String(inv.client)
                                          .toLowerCase()
                                          .trim()) ||
                                    (inv.clientName &&
                                      String(c.name || "")
                                        .toLowerCase()
                                        .trim() ===
                                        String(inv.clientName)
                                          .toLowerCase()
                                          .trim()),
                                );
                                if (matchedClient) {
                                  setSelectedClient(matchedClient);
                                  setClientName(matchedClient.name || "");
                                  setClientEmail(matchedClient.email || "");
                                  setClientPhone(matchedClient.phone || "");
                                  setClientAddress(matchedClient.address || "");
                                  setClientCity(matchedClient.city || "");
                                  setClientState(matchedClient.state || "");
                                  setClientDistrict(
                                    matchedClient.district || "",
                                  );
                                  setClientPincode(matchedClient.zip || "");
                                  setClientGst(matchedClient.gstNumber || "");
                                  setContactPersonName(
                                    matchedClient.primaryContact ||
                                      matchedClient.contactPerson ||
                                      "",
                                  );
                                  setClientDesignation(
                                    matchedClient.designation || "Proprietor",
                                  );
                                } else {
                                  if (inv.client || inv.clientName)
                                    setClientName(inv.client || inv.clientName);
                                  if (inv.clientEmail || inv.customerEmail)
                                    setClientEmail(
                                      inv.clientEmail || inv.customerEmail,
                                    );
                                  if (inv.clientPhone || inv.customerPhone)
                                    setClientPhone(
                                      inv.clientPhone || inv.customerPhone,
                                    );
                                  if (inv.clientAddress || inv.customerAddress)
                                    setClientAddress(
                                      inv.clientAddress || inv.customerAddress,
                                    );
                                  if (inv.clientCity)
                                    setClientCity(inv.clientCity);
                                  if (inv.clientState)
                                    setClientState(inv.clientState);
                                  if (inv.clientGst || inv.clientGstin)
                                    setClientGst(
                                      inv.clientGst || inv.clientGstin,
                                    );
                                  if (
                                    inv.contactPersonName ||
                                    inv.primaryContact
                                  )
                                    setContactPersonName(
                                      inv.contactPersonName ||
                                        inv.primaryContact,
                                    );
                                }

                                if (
                                  Array.isArray(inv.items) &&
                                  inv.items.length > 0
                                ) {
                                  setItems(
                                    inv.items.map((it: any, idx: number) => ({
                                      id: it.id || `item_${idx + 1}`,
                                      serviceName:
                                        it.serviceName ||
                                        it.name ||
                                        it.item_name ||
                                        `Service ${idx + 1}`,
                                      description: it.description || "",
                                      sacCode:
                                        it.sacCode ||
                                        it.sac ||
                                        it.hsnCode ||
                                        "998311",
                                      qty: Number(it.qty || it.quantity || 1),
                                      rate: Number(
                                        it.rate || it.unitPrice || 0,
                                      ),
                                      gstRate:
                                        it.gstRate ??
                                        (docScheme === "gst" ? 18 : 0),
                                      totalAmount: Number(
                                        it.totalAmount ||
                                          it.total ||
                                          (it.rate || it.unitPrice || 0) *
                                            (it.qty || it.quantity || 1),
                                      ),
                                    })),
                                  );
                                } else if (
                                  Array.isArray(inv.services) &&
                                  inv.services.length > 0
                                ) {
                                  setItems(
                                    inv.services.map((s: any, idx: number) => ({
                                      id: s.id || `item_${idx + 1}`,
                                      serviceName:
                                        s.serviceName ||
                                        s.name ||
                                        `Service ${idx + 1}`,
                                      description: s.description || "",
                                      sacCode: s.sacCode || s.sac || "998311",
                                      qty: Number(s.qty || s.quantity || 1),
                                      rate: Number(s.rate || s.unitPrice || 0),
                                      gstRate:
                                        s.gstRate ??
                                        (docScheme === "gst" ? 18 : 0),
                                      totalAmount: Number(
                                        s.totalAmount ||
                                          s.total ||
                                          (s.rate || s.unitPrice || 0) *
                                            (s.qty || s.quantity || 1),
                                      ),
                                    })),
                                  );
                                }
                              }
                            }}
                            className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold"
                          >
                            <option value="">-- No Linked Invoice --</option>
                            {filteredInvoices.map((inv) => (
                              <option
                                key={inv.id || inv.invoiceNumber}
                                value={inv.id || inv.invoiceNumber}
                              >
                                {inv.invoiceNumber || inv.id} —{" "}
                                {inv.client || "Client"} (₹
                                {Number(inv.total || 0).toLocaleString("en-IN")}
                                )
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-3">
                    <span className="font-extrabold text-zinc-800 dark:text-zinc-200 block border-b border-zinc-200 dark:border-zinc-700/60 pb-2 text-xs">
                      Project Proposal Overview &amp; Timeline
                    </span>

                    {/* Proposal Taxation Scheme (GST 18% vs Non-GST 0%) */}
                    <div>
                      <label className="block text-[10.5px] font-bold text-zinc-600 dark:text-zinc-400 mb-1.5">
                        Taxation Scheme *
                      </label>
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => handleSchemeChange("gst")}
                          className={`p-2.5 rounded-xl border-2 text-left cursor-pointer transition-all flex items-center gap-2.5 ${
                            docScheme === "gst"
                              ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 font-bold text-indigo-950 dark:text-indigo-200"
                              : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400"
                          }`}
                        >
                          <Building2
                            size={15}
                            className={
                              docScheme === "gst"
                                ? "text-indigo-600"
                                : "text-zinc-400"
                            }
                          />
                          <div>
                            <div className="text-xs">GST Proposal (18%)</div>
                            <div className="text-[9.5px] opacity-75 font-normal">
                              Adds standard GST &amp; HSN codes
                            </div>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSchemeChange("nongst")}
                          className={`p-2.5 rounded-xl border-2 text-left cursor-pointer transition-all flex items-center gap-2.5 ${
                            docScheme === "nongst"
                              ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 font-bold text-indigo-950 dark:text-indigo-200"
                              : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400"
                          }`}
                        >
                          <FileText
                            size={15}
                            className={
                              docScheme === "nongst"
                                ? "text-indigo-600"
                                : "text-zinc-400"
                            }
                          />
                          <div>
                            <div className="text-xs">
                              Non-GST Commercial (0%)
                            </div>
                            <div className="text-[9.5px] opacity-75 font-normal">
                              Commercial bill / No tax added
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[10.5px] font-bold text-zinc-600 dark:text-zinc-400 mb-1 flex items-center justify-between">
                          <span>Issuing Company Entity *</span>
                          {selectableCompanies.length <= 1 && (
                            <span className="text-[9px] text-blue-600 font-bold bg-blue-50 dark:bg-blue-950/40 px-1 py-0.2 rounded border border-blue-200 dark:border-blue-800">
                              🔒 Active Scope
                            </span>
                          )}
                        </label>
                        <select
                          value={companyId}
                          onChange={(e) => {
                            setCompanyId(e.target.value);
                            setBranchId("");
                            setSubBranchId("");
                          }}
                          disabled={selectableCompanies.length <= 1}
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold disabled:opacity-85 disabled:cursor-not-allowed"
                        >
                          {selectableCompanies.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.brand_name || c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10.5px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                          Issuing Branch
                        </label>
                        <select
                          value={branchId}
                          onChange={(e) => {
                            setBranchId(e.target.value);
                            setSubBranchId("");
                          }}
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-medium"
                        >
                          <option value="">
                            🏢 Company HQ / Central Office
                          </option>
                          {companyBranches.map((b) => (
                            <option key={b.id} value={b.id}>
                              📍 {b.name} ({b.code})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10.5px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                          Sub-Branch Partner
                        </label>
                        <select
                          value={subBranchId}
                          disabled={!branchId || branchSubBranches.length === 0}
                          onChange={(e) => setSubBranchId(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-medium disabled:opacity-50"
                        >
                          <option value="">None (Direct Branch Quote)</option>
                          {branchSubBranches.map((sb) => (
                            <option key={sb.id} value={sb.id}>
                              🤝 {sb.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10.5px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                          Primary Service Category *
                        </label>
                        <select
                          value={primaryCategory}
                          onChange={(e) => {
                            const cat = e.target.value;
                            setPrimaryCategory(cat);
                            if (cat === "Digital Marketing") {
                              const defaultPkg =
                                createDefaultMarketingPackage(
                                  "Package 02 - Grow",
                                );
                              setMarketingPackage(defaultPkg);
                              if (
                                !projectTitle ||
                                projectTitle ===
                                  "Commercial Project Proposal" ||
                                projectTitle ===
                                  "Enterprise Cloud ERP Implementation"
                              ) {
                                setProjectTitle(
                                  `${defaultPkg.planName} - Digital Marketing Retainer`,
                                );
                              }
                              if (!projectOverview) {
                                setProjectOverview(
                                  "Comprehensive 360° Digital Marketing Retainer including Social Media Management, Creative Designing, Performance Ads Campaign Management, and Monthly Brand Growth.",
                                );
                              }
                              setProjectTimeline(
                                "1 Month (Renewable Retainer)",
                              );
                              setTurnaroundTime("Ongoing Weekly Deliverables");
                              setDeliverables([
                                {
                                  id: "del-1",
                                  title: "Social Media Posts & Creatives",
                                  description: `${defaultPkg.postersCount || 12} High-Impact Brand Creatives designed & scheduled across Meta & Google`,
                                  duration: "1 Month",
                                },
                                {
                                  id: "del-2",
                                  title: "Video Reels & Motion Creatives",
                                  description: `${defaultPkg.videosCount || 2} Dynamic AI / Motion Video Reels with trending audio & hooks`,
                                  duration: "1 Month",
                                },
                                {
                                  id: "del-3",
                                  title: "Ad Campaign & Lead Generation Setup",
                                  description:
                                    "Meta Ads & Google Ads budget planning, target audience research, A/B testing & optimization",
                                  duration: "Ongoing",
                                },
                                {
                                  id: "del-4",
                                  title: "Monthly Performance & ROI Reporting",
                                  description:
                                    "Monthly analytics report covering reach, impressions, leads, conversion metrics & next steps",
                                  duration: "End of Month",
                                },
                              ]);
                              setItems([
                                {
                                  id: "mktg-pkg-1",
                                  serviceName: defaultPkg.planName,
                                  sacCode: "998311",
                                  qty: 1,
                                  rate: defaultPkg.packagePrice,
                                  unit: "Month",
                                  gstRate: docScheme === "gst" ? 18 : 0,
                                  gstAmount:
                                    docScheme === "gst"
                                      ? Math.round(
                                          defaultPkg.packagePrice * 0.18,
                                        )
                                      : 0,
                                  charges: [],
                                  totalAmount:
                                    docScheme === "gst"
                                      ? Math.round(
                                          defaultPkg.packagePrice * 1.18,
                                        )
                                      : defaultPkg.packagePrice,
                                },
                              ]);
                            } else if (
                              items.length === 1 &&
                              (items[0].id === "mktg-pkg-1" ||
                                (items[0].serviceName &&
                                  items[0].serviceName.includes("Package ")))
                            ) {
                              setItems([
                                {
                                  id: "item-1",
                                  serviceName:
                                    cat === "Website"
                                      ? "Website Development"
                                      : cat === "Custom Software"
                                        ? "Custom Software Application"
                                        : cat,
                                  sacCode: "998313",
                                  qty: 1,
                                  rate: 25000,
                                  unit: "Project",
                                  gstRate: docScheme === "gst" ? 18 : 0,
                                  gstAmount: docScheme === "gst" ? 4500 : 0,
                                  charges: [],
                                  totalAmount:
                                    docScheme === "gst" ? 29500 : 25000,
                                },
                              ]);
                            }
                          }}
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-900 dark:text-zinc-100 shadow-2xs cursor-pointer focus:ring-2 focus:ring-indigo-500"
                        >
                          {primaryCategoryOpts.map((opt: any) => (
                            <option key={opt.id} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        {isOtherPrimary && (
                          <input
                            type="text"
                            value={customPrimaryCategory}
                            onChange={(e) => {
                              setCustomPrimaryCategory(e.target.value);
                              setPrimaryCategory(e.target.value || "Other");
                            }}
                            placeholder="Enter custom category name..."
                            className="mt-2 w-full px-3 py-2 text-xs font-semibold rounded-xl border border-indigo-300 dark:border-indigo-700 bg-indigo-50/40 dark:bg-indigo-950/20"
                          />
                        )}
                      </div>

                      <div>
                        <label className="block text-[10.5px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                          Project Proposal Title *
                        </label>
                        <Input
                          value={projectTitle}
                          onChange={(e) => setProjectTitle(e.target.value)}
                          placeholder="e.g. Enterprise Cloud ERP Implementation"
                          className="font-bold text-indigo-950 dark:text-indigo-200"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[10.5px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                          Project Summary / Executive Statement
                        </label>
                        <textarea
                          rows={2}
                          value={projectOverview}
                          onChange={(e) => setProjectOverview(e.target.value)}
                          placeholder="Summary of project goals, technical strategy, and business outcomes..."
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10.5px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                          Quotation Number *
                        </label>
                        <Input
                          value={docNumber}
                          onChange={(e) => setDocNumber(e.target.value)}
                          className="font-mono font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-[10.5px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                          Estimated Project Timeline / Turnaround
                        </label>
                        <Input
                          value={projectTimeline}
                          onChange={(e) => setProjectTimeline(e.target.value)}
                          placeholder="e.g. 6 to 8 Weeks / 3 Sprints"
                          className="font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[10.5px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                          Proposal Issue Date *
                        </label>
                        <Input
                          type="date"
                          value={issueDate}
                          onChange={(e) => setIssueDate(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-[10.5px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                          Quotation Valid Till
                        </label>
                        <Input
                          type="date"
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Client Information */}
                  <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-3">
                    <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-700/60 pb-2">
                      <span className="font-extrabold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                        <UserCheck size={15} className="text-indigo-600" />
                        <span>Client / Prospect Organization</span>
                      </span>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => setClientMode("select")}
                          className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                            clientMode === "select"
                              ? "bg-indigo-600 text-white"
                              : "bg-white dark:bg-zinc-800 text-zinc-600 border border-zinc-200 dark:border-zinc-700"
                          }`}
                        >
                          Select Existing Client
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setClientMode("custom");
                            setSelectedClient(null);
                          }}
                          className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                            clientMode === "custom"
                              ? "bg-indigo-600 text-white"
                              : "bg-white dark:bg-zinc-800 text-zinc-600 border border-zinc-200 dark:border-zinc-700"
                          }`}
                        >
                          + Custom Prospect
                        </button>
                      </div>
                    </div>

                    {clientMode === "select" && (
                      <div className="relative">
                        <div
                          onClick={() =>
                            setIsClientSearchOpen(!isClientSearchOpen)
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between cursor-pointer hover:border-indigo-500"
                        >
                          <span className="font-bold text-zinc-900 dark:text-zinc-100 truncate">
                            {selectedClient
                              ? `${selectedClient.name} (${selectedClient.email || selectedClient.phone || "No contact"})`
                              : "Click to select a client..."}
                          </span>
                          <ChevronDown
                            size={16}
                            className="text-zinc-400 shrink-0"
                          />
                        </div>

                        {isClientSearchOpen && (
                          <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-2xl z-50 overflow-hidden p-2 space-y-2">
                            <input
                              type="text"
                              placeholder="Search client..."
                              value={clientSearchQuery}
                              onChange={(e) =>
                                setClientSearchQuery(e.target.value)
                              }
                              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs"
                              autoFocus
                            />
                            <div className="max-h-52 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
                              {allClients
                                .filter(
                                  (c) =>
                                    !clientSearchQuery ||
                                    String(c.name || "")
                                      .toLowerCase()
                                      .includes(
                                        clientSearchQuery.toLowerCase(),
                                      ),
                                )
                                .map((c) => (
                                  <div
                                    key={c.id}
                                    onClick={() => handleSelectClient(c)}
                                    className="p-2.5 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 cursor-pointer rounded-lg flex items-center justify-between"
                                  >
                                    <div>
                                      <div className="font-bold text-zinc-900 dark:text-zinc-100">
                                        {c.name}
                                      </div>
                                      <div className="text-[10.5px] text-zinc-400">
                                        {c.email || c.phone || "No contact"}
                                      </div>
                                    </div>
                                    <span className="text-[10.5px] text-indigo-600 font-bold">
                                      Select
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-600 dark:text-zinc-400 mb-0.5">
                          Organization / Client Name *
                        </label>
                        <Input
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          placeholder="e.g. Acme Innovations Ltd"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-600 dark:text-zinc-400 mb-0.5">
                          Contact Designation *
                        </label>
                        <select
                          value={clientDesignation}
                          onChange={(e) => setClientDesignation(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold text-xs"
                        >
                          {(
                            masterBundle?.options?.["client_designation"] || []
                          ).map((opt: any) => (
                            <option key={opt.id} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        {clientDesignation === "Other" && (
                          <Input
                            value={customDesignation}
                            onChange={(e) =>
                              setCustomDesignation(e.target.value)
                            }
                            placeholder="Type designation..."
                            className="mt-1.5 text-xs font-bold"
                          />
                        )}
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-600 dark:text-zinc-400 mb-0.5 flex items-center justify-between">
                          <span>
                            {clientDesignation === "Other" && customDesignation
                              ? `${customDesignation} Name`
                              : `${clientDesignation} Name`}
                          </span>
                          <span className="text-[9px] text-indigo-600 font-bold">
                            Contact Person
                          </span>
                        </label>
                        <Input
                          value={contactPersonName}
                          onChange={(e) => setContactPersonName(e.target.value)}
                          placeholder={`Full name of ${clientDesignation === "Other" && customDesignation ? customDesignation.toLowerCase() : clientDesignation.toLowerCase()}...`}
                          className="font-bold text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-600 dark:text-zinc-400 mb-0.5">
                          Contact Email
                        </label>
                        <Input
                          value={clientEmail}
                          onChange={(e) => setClientEmail(e.target.value)}
                          placeholder="contact@acme.com"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-600 dark:text-zinc-400 mb-0.5">
                          Contact Phone
                        </label>
                        <Input
                          value={clientPhone}
                          onChange={(e) => setClientPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-600 dark:text-zinc-400 mb-0.5">
                          City &amp; State
                        </label>
                        <Input
                          value={clientCity}
                          onChange={(e) => setClientCity(e.target.value)}
                          placeholder="City, State"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="block text-[10px] font-bold text-zinc-600 dark:text-zinc-400 mb-0.5">
                          Address
                        </label>
                        <Input
                          value={clientAddress}
                          onChange={(e) => setClientAddress(e.target.value)}
                          placeholder="Full street address"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Scope of Work & Deliverables */}
              {currentStep === 2 && (
                <div className="space-y-5">
                  {primaryCategory === "Digital Marketing" && (
                    <div className="p-4 rounded-2xl border border-purple-200 dark:border-purple-800 bg-purple-50/40 dark:bg-purple-950/20 space-y-3">
                      <div className="flex items-center justify-between border-b border-purple-200 dark:border-purple-800 pb-2">
                        <span className="font-extrabold text-purple-950 dark:text-purple-200 text-xs flex items-center gap-1.5">
                          <Sparkles size={15} className="text-purple-600" />
                          <span>
                            Digital Marketing Retainer Package Configuration
                          </span>
                        </span>
                        <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/60 px-2.5 py-0.5 rounded-full">
                          Retainer Deliverables SLA
                        </span>
                      </div>
                      <DigitalMarketingPackageBuilder
                        value={marketingPackage}
                        clientName={clientName}
                        clientPhone={clientPhone}
                        clientAddress={clientAddress}
                        onChange={(newPkg) => {
                          setMarketingPackage(newPkg);
                          setDeliverables([
                            {
                              id: "del-1",
                              title: "Social Media Posts & Creatives",
                              description: `${newPkg.postersCount || 12} High-Impact Brand Creatives designed & scheduled across Meta & Google`,
                              duration: `${newPkg.packageDuration || "1 month"}`,
                            },
                            {
                              id: "del-2",
                              title: "Video Reels & Motion Creatives",
                              description: `${newPkg.videosCount || 2} Dynamic AI / Motion Video Reels with trending audio & hooks`,
                              duration: `${newPkg.packageDuration || "1 month"}`,
                            },
                            {
                              id: "del-3",
                              title: "Ad Campaign & Lead Generation Setup",
                              description:
                                "Meta Ads & Google Ads budget planning, target audience research, A/B testing & optimization",
                              duration: "Ongoing",
                            },
                            {
                              id: "del-4",
                              title: "Monthly Performance & ROI Reporting",
                              description:
                                "Monthly analytics report covering reach, impressions, leads, conversion metrics & next steps",
                              duration: "End of Month",
                            },
                          ]);
                          setItems([
                            {
                              id: "mktg-pkg-1",
                              serviceName: newPkg.planName,
                              sacCode: "998311",
                              qty: 1,
                              rate: newPkg.packagePrice,
                              unit: "Month",
                              gstRate: docScheme === "gst" ? 18 : 0,
                              gstAmount:
                                docScheme === "gst"
                                  ? Math.round(newPkg.packagePrice * 0.18)
                                  : 0,
                              charges: [],
                              totalAmount:
                                docScheme === "gst"
                                  ? Math.round(newPkg.packagePrice * 1.18)
                                  : newPkg.packagePrice,
                            },
                          ]);
                        }}
                      />
                    </div>
                  )}
                  {/* Modules / Deliverables */}
                  <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-3">
                    <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-700/60 pb-2">
                      <span className="font-extrabold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                        <ListChecks size={15} className="text-indigo-600" />
                        <span>
                          Deliverables &amp; Functional Scope Breakdown
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={handleAddDeliverable}
                        className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={13} /> + Add Deliverable
                      </button>
                    </div>

                    <div className="space-y-3">
                      {deliverables.map((del, idx) => (
                        <div
                          key={del.id}
                          className="p-3.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-zinc-700 dark:text-zinc-300 text-xs">
                              Module #{idx + 1}
                            </span>
                            {deliverables.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveDeliverable(del.id)}
                                className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 p-1 rounded cursor-pointer"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            <div className="sm:col-span-2">
                              <label className="block text-[10px] font-bold text-zinc-500 mb-0.5">
                                Module / Deliverable Title
                              </label>
                              <Input
                                value={del.title}
                                onChange={(e) =>
                                  handleUpdateDeliverable(
                                    del.id,
                                    "title",
                                    e.target.value,
                                  )
                                }
                                placeholder="Module title..."
                                className="font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-zinc-500 mb-0.5">
                                Estimated Duration / Sprint
                              </label>
                              <Input
                                value={del.duration}
                                onChange={(e) =>
                                  handleUpdateDeliverable(
                                    del.id,
                                    "duration",
                                    e.target.value,
                                  )
                                }
                                placeholder="e.g. 2 Weeks"
                              />
                            </div>
                            <div className="sm:col-span-3">
                              <label className="block text-[10px] font-bold text-zinc-500 mb-0.5">
                                Scope Description &amp; Technical Criteria
                              </label>
                              <Input
                                value={del.description}
                                onChange={(e) =>
                                  handleUpdateDeliverable(
                                    del.id,
                                    "description",
                                    e.target.value,
                                  )
                                }
                                placeholder="Key functionality, APIs, and deliverables included in this module..."
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Inclusions & Exclusions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/10 space-y-2">
                      <span className="font-bold text-emerald-900 dark:text-emerald-300 text-xs flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="text-emerald-600" />
                        Scope Inclusions (What&apos;s Covered)
                      </span>
                      <textarea
                        rows={4}
                        value={scopeInclusions}
                        onChange={(e) => setScopeInclusions(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs resize-none"
                      />
                    </div>

                    <div className="p-4 rounded-2xl border border-rose-200 dark:border-rose-800 bg-rose-50/20 dark:bg-rose-950/10 space-y-2">
                      <span className="font-bold text-rose-900 dark:text-rose-300 text-xs flex items-center gap-1.5">
                        <AlertCircle size={14} className="text-rose-600" />
                        Scope Exclusions (Out of Scope)
                      </span>
                      <textarea
                        rows={4}
                        value={scopeExclusions}
                        onChange={(e) => setScopeExclusions(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-rose-200 dark:border-rose-800 rounded-xl text-xs resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Commercial Pricing & Payment Terms */}
              {currentStep === 3 && (
                <div className="space-y-5">
                  {/* Primary Service Category Selector & Marketing Package Configurator */}
                  <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-700/60 pb-2.5">
                      <div>
                        <span className="font-extrabold text-xs text-zinc-800 dark:text-zinc-200 block">
                          Primary Service Category *
                        </span>
                        <span className="text-[11px] text-zinc-500">
                          Select category to configure quotation line items or
                          digital marketing retainer packages
                        </span>
                      </div>
                      <select
                        value={primaryCategory}
                        onChange={(e) => {
                          const cat = e.target.value;
                          setPrimaryCategory(cat);
                          if (cat !== "Digital Marketing") {
                            const catLow = String(cat || "")
                              .trim()
                              .toLowerCase();
                            const firstForCat = servicePresetOpts
                              .map((o: any) => ({
                                name: o.label,
                                primaryCategory: String(
                                  o.metadata?.primary_category || "",
                                )
                                  .trim()
                                  .toLowerCase(),
                                sac: o.metadata?.sac || o.code || "998313",
                                gst: Number(o.metadata?.gst ?? 18),
                                unit: o.metadata?.unit || "Project",
                                rate: Number(o.metadata?.rate ?? 0),
                              }))
                              .find((p: any) => p.primaryCategory === catLow);
                            if (items.length === 1) {
                              const baseRate = firstForCat
                                ? firstForCat.rate
                                : 0;
                              const gstRate =
                                docScheme === "gst"
                                  ? firstForCat
                                    ? firstForCat.gst
                                    : 18
                                  : 0;
                              const gstAmt = Math.round(
                                baseRate * (gstRate / 100),
                              );
                              setItems([
                                {
                                  ...items[0],
                                  serviceName: firstForCat
                                    ? firstForCat.name
                                    : "",
                                  sacCode: firstForCat ? firstForCat.sac : "",
                                  unit: firstForCat
                                    ? firstForCat.unit
                                    : "Project",
                                  rate: baseRate,
                                  gstRate,
                                  gstAmount: gstAmt,
                                  totalAmount: baseRate + gstAmt,
                                },
                              ]);
                            }
                          }
                          if (cat === "Digital Marketing") {
                            setSelectedTargetModule?.("digital_marketing");
                            const defaultPkg =
                              createDefaultMarketingPackage(
                                "Package 02 - Grow",
                              );
                            setMarketingPackage(defaultPkg);
                            setItems([
                              {
                                id: "mktg-pkg-1",
                                serviceName: `Digital Marketing Retainer - ${defaultPkg.planName}`,
                                sacCode: "998311",
                                qty: 1,
                                rate: defaultPkg.packagePrice,
                                unit: defaultPkg.packageDuration || "1 Month",
                                gstRate: docScheme === "gst" ? 18 : 0,
                                gstAmount:
                                  docScheme === "gst"
                                    ? Math.round(defaultPkg.packagePrice * 0.18)
                                    : 0,
                                charges: [],
                                totalAmount:
                                  docScheme === "gst"
                                    ? Math.round(defaultPkg.packagePrice * 1.18)
                                    : defaultPkg.packagePrice,
                              },
                            ]);
                            setProjectTitle(
                              `${defaultPkg.planName} - Digital Marketing Retainer`,
                            );
                            setProjectOverview(
                              "Comprehensive 360° Digital Marketing Retainer including Social Media Management, Creative Designing, Performance Ads Campaign Management, and Monthly Brand Growth.",
                            );
                            setDeliverables([
                              {
                                id: "del-1",
                                title: "Social Media Posts & Creatives",
                                description: `${defaultPkg.postersCount || 12} High-Impact Brand Creatives designed & scheduled across Meta & Google`,
                                duration: `${defaultPkg.packageDuration || "1 month"}`,
                              },
                              {
                                id: "del-2",
                                title: "Video Reels & Motion Creatives",
                                description: `${defaultPkg.videosCount || 2} Dynamic AI / Motion Video Reels with trending audio & hooks`,
                                duration: `${defaultPkg.packageDuration || "1 month"}`,
                              },
                              {
                                id: "del-3",
                                title: "Ad Campaign & Lead Generation Setup",
                                description:
                                  "Meta Ads & Google Ads budget planning, target audience research, A/B testing & optimization",
                                duration: "Ongoing",
                              },
                              {
                                id: "del-4",
                                title: "Monthly Performance & ROI Reporting",
                                description:
                                  "Monthly analytics report covering reach, impressions, leads, conversion metrics & next steps",
                                duration: "End of Month",
                              },
                            ]);
                          } else if (
                            items.length === 1 &&
                            (items[0].id === "mktg-pkg-1" ||
                              (items[0].serviceName &&
                                items[0].serviceName.includes("Package ")))
                          ) {
                            setItems([
                              {
                                id: "item-1",
                                serviceName:
                                  cat === "Website"
                                    ? "Website Development"
                                    : cat === "Custom Software"
                                      ? "Custom Software Application"
                                      : cat,
                                sacCode: "998313",
                                qty: 1,
                                rate: 25000,
                                unit: "Project",
                                gstRate: docScheme === "gst" ? 18 : 0,
                                gstAmount: docScheme === "gst" ? 4500 : 0,
                                charges: [],
                                totalAmount:
                                  docScheme === "gst" ? 29500 : 25000,
                              },
                            ]);
                          }
                        }}
                        className="px-3.5 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-900 dark:text-zinc-100 shadow-2xs cursor-pointer focus:ring-2 focus:ring-indigo-500"
                      >
                        {primaryCategoryOpts.map((opt: any) => (
                          <option key={opt.id} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {primaryCategory === "Digital Marketing" && (
                      <DigitalMarketingPackageBuilder
                        value={marketingPackage}
                        clientName={clientName}
                        clientPhone={clientPhone}
                        clientAddress={clientAddress}
                        onChange={(newPkg) => {
                          setMarketingPackage(newPkg);
                          setItems([
                            {
                              id: "mktg-pkg-1",
                              serviceName: `Digital Marketing Retainer - ${newPkg.planName}`,
                              sacCode: "998311",
                              qty: 1,
                              rate: newPkg.packagePrice,
                              unit: newPkg.packageDuration || "1 Month",
                              gstRate: docScheme === "gst" ? 18 : 0,
                              gstAmount:
                                docScheme === "gst"
                                  ? Math.round(newPkg.packagePrice * 0.18)
                                  : 0,
                              charges: [],
                              totalAmount:
                                docScheme === "gst"
                                  ? Math.round(newPkg.packagePrice * 1.18)
                                  : newPkg.packagePrice,
                            },
                          ]);
                          setDeliverables([
                            {
                              id: "del-1",
                              title: "Social Media Posts & Creatives",
                              description: `${newPkg.postersCount || 12} High-Impact Brand Creatives designed & scheduled across Meta & Google`,
                              duration: `${newPkg.packageDuration || "1 month"}`,
                            },
                            {
                              id: "del-2",
                              title: "Video Reels & Motion Creatives",
                              description: `${newPkg.videosCount || 2} Dynamic AI / Motion Video Reels with trending audio & hooks`,
                              duration: `${newPkg.packageDuration || "1 month"}`,
                            },
                            {
                              id: "del-3",
                              title: "Ad Campaign & Lead Generation Setup",
                              description:
                                "Meta Ads & Google Ads budget planning, target audience research, A/B testing & optimization",
                              duration: "Ongoing",
                            },
                            {
                              id: "del-4",
                              title: "Monthly Performance & ROI Reporting",
                              description:
                                "Monthly analytics report covering reach, impressions, leads, conversion metrics & next steps",
                              duration: "End of Month",
                            },
                          ]);
                          if (
                            !projectTitle ||
                            projectTitle.includes("Digital Marketing")
                          ) {
                            setProjectTitle(
                              `${newPkg.planName} - Digital Marketing Retainer`,
                            );
                          }
                        }}
                      />
                    )}
                  </div>

                  {/* Commercial Line Items */}
                  <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-3">
                    <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-700/60 pb-2">
                      <span className="font-extrabold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                        <Coins size={15} className="text-indigo-600" />
                        <span>Commercial Quotation Breakdown</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAddItem()}
                        className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={13} /> + Add Item
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {items.map((item, index) => (
                        <div
                          key={item.id}
                          className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
                        >
                          <div className="sm:col-span-6">
                            <div className="flex items-center justify-between mb-0.5">
                              <label className="block text-[10px] font-bold text-zinc-500">
                                Service / Component Description *
                              </label>
                              {primaryCategory !== "Digital Marketing" && (
                                <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400">
                                  Preset / Custom
                                </span>
                              )}
                            </div>
                            {primaryCategory !== "Digital Marketing" ? (
                              <div className="space-y-1">
                                <select
                                  value={
                                    dynamicServicePresets.some(
                                      (p) =>
                                        p.name.toLowerCase() ===
                                        (item.serviceName || "").toLowerCase(),
                                    )
                                      ? dynamicServicePresets.find(
                                          (p) =>
                                            p.name.toLowerCase() ===
                                            (
                                              item.serviceName || ""
                                            ).toLowerCase(),
                                        )?.name
                                      : item.serviceName
                                        ? "custom"
                                        : ""
                                  }
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === "custom") {
                                      if (
                                        dynamicServicePresets.some(
                                          (p) => p.name === item.serviceName,
                                        )
                                      ) {
                                        handleUpdateItem(
                                          item.id,
                                          "serviceName",
                                          "",
                                        );
                                      }
                                    } else if (val) {
                                      const preset = dynamicServicePresets.find(
                                        (p) => p.name === val,
                                      );
                                      if (preset) {
                                        handleUpdateItem(
                                          item.id,
                                          "serviceName",
                                          preset.name,
                                        );
                                        if (preset.unit)
                                          handleUpdateItem(
                                            item.id,
                                            "unit",
                                            preset.unit,
                                          );
                                        if (
                                          preset.rate &&
                                          (!item.rate || item.rate === 0)
                                        )
                                          handleUpdateItem(
                                            item.id,
                                            "rate",
                                            preset.rate,
                                          );
                                      }
                                    }
                                  }}
                                  className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-indigo-500 cursor-pointer mb-1"
                                >
                                  <option value="" disabled>
                                    Select Preset or Custom...
                                  </option>
                                  {dynamicServicePresets.map((preset) => (
                                    <option
                                      key={preset.name}
                                      value={preset.name}
                                    >
                                      {preset.name}
                                    </option>
                                  ))}
                                  <option value="custom">
                                    ✏️ Custom Service / Item
                                  </option>
                                </select>
                                <Input
                                  value={item.serviceName}
                                  onChange={(e) =>
                                    handleUpdateItem(
                                      item.id,
                                      "serviceName",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="e.g. Platform Architecture & Backend API"
                                  className="font-bold text-xs"
                                />
                              </div>
                            ) : (
                              <Input
                                value={item.serviceName}
                                onChange={(e) =>
                                  handleUpdateItem(
                                    item.id,
                                    "serviceName",
                                    e.target.value,
                                  )
                                }
                                placeholder="e.g. Digital Marketing Retainer"
                                className="font-bold text-xs"
                              />
                            )}
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-bold text-zinc-500 mb-0.5">
                              Unit
                            </label>
                            <Input
                              value={
                                item.unit ||
                                (primaryCategory === "Digital Marketing"
                                  ? "Month"
                                  : "Project")
                              }
                              onChange={(e) =>
                                handleUpdateItem(
                                  item.id,
                                  "unit",
                                  e.target.value,
                                )
                              }
                              placeholder="Project / Month"
                            />
                          </div>
                          <div className="sm:col-span-3">
                            <label className="block text-[10px] font-bold text-zinc-500 mb-0.5">
                              Commercial Value (₹) *
                            </label>
                            <Input
                              type="number"
                              min="0"
                              value={item.rate === 0 ? "" : (item.rate ?? "")}
                              onChange={(e) =>
                                handleUpdateItem(
                                  item.id,
                                  "rate",
                                  e.target.value === ""
                                    ? ""
                                    : Math.max(0, Number(e.target.value)),
                                )
                              }
                              placeholder="30000"
                              className="font-bold text-emerald-600 font-mono"
                            />
                          </div>
                          <div className="sm:col-span-1 flex justify-end">
                            {items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(item.id)}
                                className="text-rose-500 hover:bg-rose-50 p-1.5 rounded cursor-pointer"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Total Summary */}
                    <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
                      <span className="font-extrabold text-zinc-800 dark:text-zinc-200">
                        Total Commercial Project Value:
                      </span>
                      <span className="text-base font-black text-indigo-600 dark:text-indigo-400 font-mono">
                        ₹{grandTotal.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* Milestone Payment Terms */}
                  <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-3">
                    <span className="font-extrabold text-zinc-800 dark:text-zinc-200 block border-b border-zinc-200 dark:border-zinc-700/60 pb-2 text-xs">
                      Milestone Payment Terms Schedule
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {paymentMilestones.map((pm, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl space-y-1.5"
                        >
                          <div className="flex items-center justify-between font-bold text-zinc-800 dark:text-zinc-200">
                            <span>{pm.milestone}</span>
                            <span className="text-indigo-600 font-mono">
                              {pm.percentage}%
                            </span>
                          </div>
                          <p className="text-[10.5px] text-zinc-400">
                            {pm.stage}
                          </p>
                          <div className="pt-1 border-t border-zinc-100 dark:border-zinc-800 font-mono font-bold text-emerald-600 text-xs">
                            ₹
                            {Math.round(
                              grandTotal * (pm.percentage / 100),
                            ).toLocaleString("en-IN")}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Terms & Conditions automatically inherited from issuing company/branch profile */}
                </div>
              )}
            </>
          )}

          {/* ════════════════════════════════════════════════════════════════
              MODE: ESTIMATE (FAST PROJECT COST ESTIMATE)
             ════════════════════════════════════════════════════════════════ */}
          {mode === "estimate" && (
            <>
              {currentStep === 1 && (
                <div className="space-y-5">
                  <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-3">
                    <span className="font-extrabold text-zinc-800 dark:text-zinc-200 block border-b border-zinc-200 dark:border-zinc-700/60 pb-2 text-xs">
                      Estimate Identity &amp; Client Overview
                    </span>

                    {/* Estimate Taxation Scheme (GST 18% vs Non-GST 0%) */}
                    <div>
                      <label className="block text-[10.5px] font-bold text-zinc-600 dark:text-zinc-400 mb-1.5">
                        Taxation Scheme *
                      </label>
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => handleSchemeChange("gst")}
                          className={`p-2.5 rounded-xl border-2 text-left cursor-pointer transition-all flex items-center gap-2.5 ${
                            docScheme === "gst"
                              ? "border-amber-600 bg-amber-50/50 dark:bg-amber-950/30 font-bold text-amber-950 dark:text-amber-200"
                              : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400"
                          }`}
                        >
                          <Building2
                            size={15}
                            className={
                              docScheme === "gst"
                                ? "text-amber-600"
                                : "text-zinc-400"
                            }
                          />
                          <div>
                            <div className="text-xs">GST Estimate (18%)</div>
                            <div className="text-[9.5px] opacity-75 font-normal">
                              Includes GST calculations
                            </div>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSchemeChange("nongst")}
                          className={`p-2.5 rounded-xl border-2 text-left cursor-pointer transition-all flex items-center gap-2.5 ${
                            docScheme === "nongst"
                              ? "border-amber-600 bg-amber-50/50 dark:bg-amber-950/30 font-bold text-amber-950 dark:text-amber-200"
                              : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400"
                          }`}
                        >
                          <Calculator
                            size={15}
                            className={
                              docScheme === "nongst"
                                ? "text-amber-600"
                                : "text-zinc-400"
                            }
                          />
                          <div>
                            <div className="text-xs">Non-GST Estimate (0%)</div>
                            <div className="text-[9.5px] opacity-75 font-normal">
                              Commercial estimate / 0% tax
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[10.5px] font-bold text-zinc-600 dark:text-zinc-400 mb-1 flex items-center justify-between">
                          <span>Company Entity *</span>
                          {selectableCompanies.length <= 1 && (
                            <span className="text-[9px] text-blue-600 font-bold bg-blue-50 dark:bg-blue-950/40 px-1 py-0.2 rounded border border-blue-200 dark:border-blue-800">
                              🔒 Active Scope
                            </span>
                          )}
                        </label>
                        <select
                          value={companyId}
                          onChange={(e) => {
                            setCompanyId(e.target.value);
                            setBranchId("");
                            setSubBranchId("");
                          }}
                          disabled={selectableCompanies.length <= 1}
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold disabled:opacity-85 disabled:cursor-not-allowed"
                        >
                          {selectableCompanies.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.brand_name || c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10.5px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                          Issuing Branch
                        </label>
                        <select
                          value={branchId}
                          onChange={(e) => {
                            setBranchId(e.target.value);
                            setSubBranchId("");
                          }}
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-medium"
                        >
                          <option value="">
                            🏢 Company HQ / Central Office
                          </option>
                          {companyBranches.map((b) => (
                            <option key={b.id} value={b.id}>
                              📍 {b.name} ({b.code})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10.5px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                          Sub-Branch Partner
                        </label>
                        <select
                          value={subBranchId}
                          disabled={!branchId || branchSubBranches.length === 0}
                          onChange={(e) => setSubBranchId(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-medium disabled:opacity-50"
                        >
                          <option value="">
                            None (Direct Branch Estimate)
                          </option>
                          {branchSubBranches.map((sb) => (
                            <option key={sb.id} value={sb.id}>
                              🤝 {sb.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10.5px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                          Estimate Number *
                        </label>
                        <Input
                          value={docNumber}
                          onChange={(e) => setDocNumber(e.target.value)}
                          className="font-mono font-bold"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[10.5px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                          Estimate Subject / Project Reference *
                        </label>
                        <Input
                          value={projectTitle}
                          onChange={(e) => setProjectTitle(e.target.value)}
                          placeholder="e.g. Website Overhaul & Performance Tuning"
                          className="font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-[10.5px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                          Estimate Date
                        </label>
                        <Input
                          type="date"
                          value={issueDate}
                          onChange={(e) => setIssueDate(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-[10.5px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                          Estimated Turnaround Time
                        </label>
                        <Input
                          value={turnaroundTime}
                          onChange={(e) => setTurnaroundTime(e.target.value)}
                          placeholder="e.g. 5 Business Days"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Client Select */}
                  <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-3">
                    <span className="font-extrabold text-zinc-800 dark:text-zinc-200 block border-b border-zinc-200 dark:border-zinc-700/60 pb-2 text-xs">
                      Client Contact
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-600 dark:text-zinc-400 mb-0.5">
                          Client Name *
                        </label>
                        <Input
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          placeholder="Client Name"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-600 dark:text-zinc-400 mb-0.5">
                          Client Email
                        </label>
                        <Input
                          value={clientEmail}
                          onChange={(e) => setClientEmail(e.target.value)}
                          placeholder="email@client.com"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-600 dark:text-zinc-400 mb-0.5">
                          Client Phone
                        </label>
                        <Input
                          value={clientPhone}
                          onChange={(e) => setClientPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-5">
                  {/* Estimated Services */}
                  <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-3">
                    <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-700/60 pb-2">
                      <span className="font-extrabold text-zinc-800 dark:text-zinc-200">
                        Estimated Services &amp; Rates
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAddItem()}
                        className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={13} /> + Add Service
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
                        >
                          <div className="sm:col-span-5">
                            <label className="block text-[10px] font-bold text-zinc-500 mb-0.5">
                              Service Name *
                            </label>
                            <Input
                              value={item.serviceName}
                              onChange={(e) =>
                                handleUpdateItem(
                                  item.id,
                                  "serviceName",
                                  e.target.value,
                                )
                              }
                              placeholder="Service description..."
                              className="font-bold"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-bold text-zinc-500 mb-0.5">
                              Hours / Qty
                            </label>
                            <Input
                              type="number"
                              min="1"
                              value={item.qty === 0 ? "" : (item.qty ?? "")}
                              onChange={(e) =>
                                handleUpdateItem(
                                  item.id,
                                  "qty",
                                  e.target.value === ""
                                    ? ""
                                    : Math.max(1, Number(e.target.value)),
                                )
                              }
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-bold text-zinc-500 mb-0.5">
                              Rate (₹)
                            </label>
                            <Input
                              type="number"
                              min="0"
                              value={item.rate === 0 ? "" : (item.rate ?? "")}
                              onChange={(e) =>
                                handleUpdateItem(
                                  item.id,
                                  "rate",
                                  e.target.value === ""
                                    ? ""
                                    : Math.max(0, Number(e.target.value)),
                                )
                              }
                              className="font-bold font-mono"
                            />
                          </div>
                          <div className="sm:col-span-2 font-mono font-bold text-emerald-600 text-xs">
                            ₹{(item.rate * item.qty).toLocaleString("en-IN")}
                          </div>
                          <div className="sm:col-span-1 flex justify-end">
                            {items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(item.id)}
                                className="text-rose-500 p-1 rounded cursor-pointer"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">
                        Total Estimated Cost:
                      </span>
                      <span className="text-base font-black text-amber-600 dark:text-amber-400 font-mono">
                        ₹{grandTotal.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-2">
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 block text-xs">
                      Scope Notes &amp; Assumptions
                    </span>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs resize-none"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {/* ════════════════════════════════════════════════════════════════
              MODE: INVOICE (GST OR NON-GST BILLING)
             ════════════════════════════════════════════════════════════════ */}
          {mode === "invoice" && (
            <>
              {/* Step 1: Entity, Scheme & Attribution */}
              {currentStep === 1 && (
                <div className="space-y-5">
                  {/* Compact Invoicing Scheme & Tax Mode */}
                  <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="font-extrabold text-zinc-800 dark:text-zinc-200 text-xs">
                      Tax Mode:
                    </span>
                    <div className="grid grid-cols-2 gap-2 flex-1 sm:max-w-md">
                      <button
                        type="button"
                        onClick={() => handleSchemeChange("gst")}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                          docScheme === "gst"
                            ? "border-teal-600 bg-teal-600 text-white shadow-xs"
                            : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
                        }`}
                      >
                        <Building2 size={13} />
                        <span>GST (18%)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSchemeChange("nongst")}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                          docScheme === "nongst"
                            ? "border-sky-600 bg-sky-600 text-white shadow-xs"
                            : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
                        }`}
                      >
                        <Receipt size={13} />
                        <span>Non-GST (0%)</span>
                      </button>
                    </div>
                  </div>

                  {/* Company & Branch */}
                  <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-3">
                    <span className="font-extrabold text-zinc-800 dark:text-zinc-200 block border-b border-zinc-200 dark:border-zinc-700/60 pb-2 text-xs">
                      Issuing Company Entity &amp; Branch Location
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10.5px] font-bold text-zinc-600 dark:text-zinc-400 mb-1 flex items-center justify-between">
                          <span>Company Entity *</span>
                          {selectableCompanies.length <= 1 && (
                            <span className="text-[9px] text-blue-600 font-bold bg-blue-50 dark:bg-blue-950/40 px-1 py-0.2 rounded border border-blue-200 dark:border-blue-800">
                              🔒 Active Scope
                            </span>
                          )}
                        </label>
                        <select
                          value={companyId}
                          onChange={(e) => {
                            setCompanyId(e.target.value);
                            setBranchId("");
                            setSubBranchId("");
                          }}
                          disabled={selectableCompanies.length <= 1}
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold disabled:opacity-85 disabled:cursor-not-allowed"
                        >
                          {selectableCompanies.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.brand_name || c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10.5px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                          Issuing Branch
                        </label>
                        <select
                          value={branchId}
                          onChange={(e) => {
                            setBranchId(e.target.value);
                            setSubBranchId("");
                          }}
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-medium"
                        >
                          <option value="">
                            🏢 Company HQ / Central Office
                          </option>
                          {companyBranches.map((b) => (
                            <option key={b.id} value={b.id}>
                              📍 {b.name} ({b.code})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10.5px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                          Sub-Branch Partner
                        </label>
                        <select
                          value={subBranchId}
                          disabled={!branchId || branchSubBranches.length === 0}
                          onChange={(e) => setSubBranchId(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-medium disabled:opacity-50"
                        >
                          <option value="">None (Direct Branch Billing)</option>
                          {branchSubBranches.map((sb) => (
                            <option key={sb.id} value={sb.id}>
                              🤝 {sb.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Team Member Attribution */}
                  <div className="p-4 rounded-2xl border border-indigo-500/20 bg-indigo-50/20 dark:bg-indigo-950/10 space-y-3">
                    <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2">
                      <span className="font-extrabold text-indigo-900 dark:text-indigo-200 text-xs flex items-center gap-1.5">
                        <Users size={15} className="text-indigo-600" />
                        <span>
                          Sales Rep &amp; Team Member Revenue Attribution
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={handleAddAssignedMember}
                        className="text-[11px] font-bold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={13} /> + Add Member
                      </button>
                    </div>

                    {assignedMembers.length === 0 ? (
                      <div className="py-3 text-center text-zinc-400 text-xs">
                        No team members assigned yet. Click &quot;+ Add
                        Member&quot; to attribute revenue share.
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {assignedMembers.map((m, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-white dark:bg-zinc-900 border border-indigo-100 dark:border-indigo-900/60 rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                          >
                            <div className="sm:col-span-5">
                              <label className="block text-[10px] font-bold text-zinc-500 mb-0.5">
                                Team Member
                              </label>
                              <select
                                value={m.memberId}
                                onChange={(e) =>
                                  handleUpdateAssignedMember(
                                    idx,
                                    "memberId",
                                    e.target.value,
                                  )
                                }
                                className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-bold"
                              >
                                {availableTeamMembers.map((tm) => (
                                  <option key={tm.id} value={tm.id}>
                                    {tm.name} ({tm.role})
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="sm:col-span-3">
                              <label className="block text-[10px] font-bold text-zinc-500 mb-0.5">
                                Payout Mode
                              </label>
                              <div className="flex rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateAssignedMember(
                                      idx,
                                      "payoutType",
                                      "percentage",
                                    )
                                  }
                                  className={`flex-1 py-1 text-center font-bold ${m.payoutType === "percentage" ? "bg-indigo-600 text-white" : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600"}`}
                                >
                                  % Share
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateAssignedMember(
                                      idx,
                                      "payoutType",
                                      "fixed",
                                    )
                                  }
                                  className={`flex-1 py-1 text-center font-bold ${m.payoutType === "fixed" ? "bg-indigo-600 text-white" : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600"}`}
                                >
                                  ₹ Fixed
                                </button>
                              </div>
                            </div>

                            <div className="sm:col-span-3">
                              <label className="block text-[10px] font-bold text-zinc-500 mb-0.5">
                                {m.payoutType === "percentage"
                                  ? "Share (%)"
                                  : "Amount (₹)"}
                              </label>
                              <Input
                                type="number"
                                value={
                                  m.payoutValue === 0
                                    ? ""
                                    : (m.payoutValue ?? "")
                                }
                                onChange={(e) =>
                                  handleUpdateAssignedMember(
                                    idx,
                                    "payoutValue",
                                    e.target.value === ""
                                      ? ""
                                      : Number(e.target.value),
                                  )
                                }
                                placeholder={
                                  m.payoutType === "percentage" ? "30" : "5000"
                                }
                                className="font-bold"
                              />
                            </div>

                            <div className="sm:col-span-1 flex justify-end">
                              <button
                                type="button"
                                onClick={() => handleRemoveAssignedMember(idx)}
                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Referred By (Optional) */}
                  <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-3">
                    <span className="font-extrabold text-zinc-800 dark:text-zinc-200 text-xs flex items-center gap-1.5 border-b border-zinc-200 dark:border-zinc-700/60 pb-2">
                      <UserCheck size={15} className="text-teal-600" />
                      <span>Referred By (Optional)</span>
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-600 dark:text-zinc-400 mb-0.5">
                          Refer By Category
                        </label>
                        <select
                          value={referByCategory || ""}
                          onChange={(e) => setReferByCategory?.(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold text-xs"
                        >
                          <option value="">
                            -- Select Refer By Category --
                          </option>
                          {(
                            masterBundle?.options?.["refer_by_category"] || []
                          ).map((opt: any) => (
                            <option key={opt.id} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-600 dark:text-zinc-400 mb-0.5">
                          Referer / Referred By
                        </label>
                        <select
                          value={referredByName || ""}
                          onChange={(e) => setReferredByName?.(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold text-xs"
                        >
                          <option value="">-- Select Referer --</option>
                          {(availableReferers && availableReferers.length > 0
                            ? availableReferers
                            : availableTeamMembers || []
                          ).map((m: any) => (
                            <option key={m.id} value={m.name}>
                              {m.name} ({m.role || "User"})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-3">
                    <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-700/60 pb-2">
                      <span className="font-extrabold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                        <UserCheck size={15} className="text-teal-600" />
                        <span>Client Billing Details</span>
                      </span>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => setClientMode("select")}
                          className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                            clientMode === "select"
                              ? "bg-teal-600 text-white"
                              : "bg-white dark:bg-zinc-800 text-zinc-600 border border-zinc-200 dark:border-zinc-700"
                          }`}
                        >
                          Select Client
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setClientMode("custom");
                            setSelectedClient(null);
                          }}
                          className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                            clientMode === "custom"
                              ? "bg-teal-600 text-white"
                              : "bg-white dark:bg-zinc-800 text-zinc-600 border border-zinc-200 dark:border-zinc-700"
                          }`}
                        >
                          + Custom Client
                        </button>
                      </div>
                    </div>

                    {clientMode === "select" && (
                      <div className="relative">
                        <div
                          onClick={() =>
                            setIsClientSearchOpen(!isClientSearchOpen)
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between cursor-pointer hover:border-teal-500"
                        >
                          <span className="font-bold text-zinc-900 dark:text-zinc-100 truncate">
                            {selectedClient
                              ? `${selectedClient.name} (${selectedClient.email || selectedClient.phone || "No contact"})`
                              : "Click to select a client..."}
                          </span>
                          <ChevronDown
                            size={16}
                            className="text-zinc-400 shrink-0"
                          />
                        </div>

                        {isClientSearchOpen && (
                          <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-2xl z-50 overflow-hidden p-2 space-y-2">
                            <input
                              type="text"
                              placeholder="Search client..."
                              value={clientSearchQuery}
                              onChange={(e) =>
                                setClientSearchQuery(e.target.value)
                              }
                              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs"
                              autoFocus
                            />
                            <div className="max-h-52 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
                              {allClients
                                .filter(
                                  (c) =>
                                    !clientSearchQuery ||
                                    String(c.name || "")
                                      .toLowerCase()
                                      .includes(
                                        clientSearchQuery.toLowerCase(),
                                      ),
                                )
                                .map((c) => (
                                  <div
                                    key={c.id}
                                    onClick={() => handleSelectClient(c)}
                                    className="p-2.5 hover:bg-teal-50 dark:hover:bg-teal-950/30 cursor-pointer rounded-lg flex items-center justify-between"
                                  >
                                    <div>
                                      <div className="font-bold text-zinc-900 dark:text-zinc-100">
                                        {c.name}
                                      </div>
                                      <div className="text-[10.5px] text-zinc-400">
                                        {c.email || c.phone || "No contact"}
                                      </div>
                                    </div>
                                    <span className="text-[10.5px] text-teal-600 font-bold">
                                      Select
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-600 dark:text-zinc-400 mb-0.5">
                          Client / Organization Name *
                        </label>
                        <Input
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          placeholder="Client / Company Name"
                        />
                      </div>

                      {/* Designation Dropdown */}
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-600 dark:text-zinc-400 mb-0.5">
                          Contact Designation *
                        </label>
                        <select
                          value={clientDesignation}
                          onChange={(e) => setClientDesignation(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold text-xs"
                        >
                          {(
                            masterBundle?.options?.["client_designation"] || []
                          ).map((opt: any) => (
                            <option key={opt.id} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        {clientDesignation === "Other" && (
                          <Input
                            value={customDesignation}
                            onChange={(e) =>
                              setCustomDesignation(e.target.value)
                            }
                            placeholder="Type designation..."
                            className="mt-1.5 text-xs font-bold"
                          />
                        )}
                      </div>

                      {/* Contact Person Name (Founder, CEO, Proprietor Name, etc.) */}
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-600 dark:text-zinc-400 mb-0.5 flex items-center justify-between">
                          <span>
                            {clientDesignation === "Other" && customDesignation
                              ? `${customDesignation} Name`
                              : `${clientDesignation} Name`}
                          </span>
                          <span className="text-[9px] text-teal-600 font-bold">
                            Contact Person
                          </span>
                        </label>
                        <Input
                          value={contactPersonName}
                          onChange={(e) => setContactPersonName(e.target.value)}
                          placeholder={`Full name of ${clientDesignation === "Other" && customDesignation ? customDesignation.toLowerCase() : clientDesignation.toLowerCase()}...`}
                          className="font-bold text-xs"
                        />
                      </div>

                      {/* Client Phone (Printed in invoice) */}
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-600 dark:text-zinc-400 mb-0.5 flex items-center justify-between">
                          <span>Phone Number *</span>
                          <span className="text-[9px] text-teal-600 font-bold">
                            Printed on Invoice
                          </span>
                        </label>
                        <Input
                          value={clientPhone}
                          onChange={(e) => setClientPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="font-bold font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-zinc-600 dark:text-zinc-400 mb-0.5">
                          Client Email
                        </label>
                        <Input
                          value={clientEmail}
                          onChange={(e) => setClientEmail(e.target.value)}
                          placeholder="client@company.com"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-zinc-600 dark:text-zinc-400 mb-0.5">
                          Client Date of Birth (DOB)
                        </label>
                        <Input
                          type="date"
                          value={clientDob || ""}
                          onChange={(e) => setClientDob?.(e.target.value)}
                          className="text-xs font-mono font-bold"
                        />
                      </div>

                      {docScheme !== "nongst" && (
                        <div>
                          <label className="block text-[10px] font-bold text-zinc-600 dark:text-zinc-400 mb-0.5">
                            Client GSTIN (if applicable)
                          </label>
                          <Input
                            value={clientGst}
                            onChange={(e) =>
                              setClientGst(e.target.value.toUpperCase())
                            }
                            className="font-mono uppercase"
                            placeholder="19AAAAA0000A1Z5"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-[10px] font-bold text-zinc-600 dark:text-zinc-400 mb-0.5 flex items-center justify-between">
                          <span>Postal PIN Code</span>
                          {isPincodeLoading ? (
                            <span className="text-[9px] text-blue-600 font-bold animate-pulse">
                              Fetching API...
                            </span>
                          ) : (
                            <span className="text-[9px] text-zinc-400">
                              6-digit PIN
                            </span>
                          )}
                        </label>
                        <Input
                          value={clientPincode}
                          onChange={(e) => handlePincodeChange(e.target.value)}
                          placeholder="e.g. 700001"
                          maxLength={6}
                          className="font-mono font-bold"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[10px] font-bold text-zinc-600 dark:text-zinc-400 mb-0.5">
                          Street Address
                        </label>
                        <Input
                          value={clientAddress}
                          onChange={(e) => setClientAddress(e.target.value)}
                          placeholder="Plot, Suite, Building, Street..."
                        />
                      </div>

                      {/* City Dropdown / Input */}
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-600 dark:text-zinc-400 mb-0.5">
                          City / Post Office
                        </label>
                        {pincodePlaces.length > 0 ? (
                          <select
                            value={clientCity}
                            onChange={(e) => {
                              const val = e.target.value;
                              setClientCity(val);
                              syncLocationIntoAddress({ city: val });
                            }}
                            className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold text-xs"
                          >
                            {pincodePlaces.map((p) => (
                              <option key={p} value={p}>
                                {p}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <Input
                            value={clientCity}
                            onChange={(e) => setClientCity(e.target.value)}
                            placeholder="City"
                          />
                        )}
                      </div>

                      {/* Police Station / Block Dropdown from Pincode API */}
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-600 dark:text-zinc-400 mb-0.5">
                          Police Station / Block
                        </label>
                        {pincodeBlocks && pincodeBlocks.length > 0 ? (
                          <select
                            value={clientPoliceStation || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setClientPoliceStation?.(val);
                              syncLocationIntoAddress({ policeStation: val });
                            }}
                            className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold text-xs"
                          >
                            <option value="">
                              -- Select Police Station / Block --
                            </option>
                            {Array.from(new Set(pincodeBlocks || [])).map(
                              (b: any) => (
                                <option key={b} value={b}>
                                  {b}
                                </option>
                              ),
                            )}
                          </select>
                        ) : (
                          <Input
                            value={clientPoliceStation || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setClientPoliceStation?.(val);
                              syncLocationIntoAddress({ policeStation: val });
                            }}
                            placeholder="Police Station / Block"
                          />
                        )}
                      </div>

                      {/* District Dropdown / Input */}
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-600 dark:text-zinc-400 mb-0.5">
                          District
                        </label>
                        {pincodeDistricts.length > 0 ? (
                          <select
                            value={clientDistrict}
                            onChange={(e) => {
                              const val = e.target.value;
                              setClientDistrict(val);
                              syncLocationIntoAddress({ district: val });
                            }}
                            className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold text-xs"
                          >
                            {pincodeDistricts.map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <Input
                            value={clientDistrict}
                            onChange={(e) => setClientDistrict(e.target.value)}
                            placeholder="District"
                          />
                        )}
                      </div>

                      {/* State Dropdown / Input */}
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-600 dark:text-zinc-400 mb-0.5">
                          State
                        </label>
                        {pincodeStates.length > 0 ? (
                          <select
                            value={clientState}
                            onChange={(e) => {
                              const val = e.target.value;
                              setClientState(val);
                              syncLocationIntoAddress({ state: val });
                            }}
                            className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold text-xs"
                          >
                            {pincodeStates.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <Input
                            value={clientState}
                            onChange={(e) => setClientState(e.target.value)}
                            placeholder="State"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Invoice Identification & Primary Category */}
                  <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-3">
                    <span className="font-extrabold text-zinc-800 dark:text-zinc-200 block border-b border-zinc-200 dark:border-zinc-700/60 pb-2 text-xs">
                      Invoice Reference, Dates &amp; Primary Category
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-600 dark:text-zinc-400 mb-0.5">
                          Invoice Number *
                        </label>
                        <Input
                          value={docNumber}
                          onChange={(e) => setDocNumber(e.target.value)}
                          className="font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-600 dark:text-zinc-400 mb-0.5">
                          Bill Date *
                        </label>
                        <Input
                          type="date"
                          value={issueDate}
                          onChange={(e) => setIssueDate(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Line Items & Calculation */}
              {currentStep === 2 && (
                <div className="space-y-5">
                  {/* Primary Service Category Selector & Marketing Package Configurator */}
                  <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-700/60 pb-2.5">
                      <div>
                        <span className="font-extrabold text-xs text-zinc-800 dark:text-zinc-200 block">
                          Primary Service Category *
                        </span>
                        <span className="text-[11px] text-zinc-500">
                          Select category to configure line items or marketing
                          retainer packages
                        </span>
                      </div>
                      <select
                        value={primaryCategory}
                        onChange={(e) => {
                          const cat = e.target.value;
                          setPrimaryCategory(cat);
                          if (cat !== "Digital Marketing") {
                            const catLow = String(cat || "")
                              .trim()
                              .toLowerCase();
                            const firstForCat = servicePresetOpts
                              .map((o: any) => ({
                                name: o.label,
                                primaryCategory: String(
                                  o.metadata?.primary_category || "",
                                )
                                  .trim()
                                  .toLowerCase(),
                                sac: o.metadata?.sac || o.code || "998313",
                                gst: Number(o.metadata?.gst ?? 18),
                                unit: o.metadata?.unit || "Project",
                                rate: Number(o.metadata?.rate ?? 0),
                              }))
                              .find((p: any) => p.primaryCategory === catLow);
                            if (firstForCat) {
                              const baseRate = Number(firstForCat.rate || 0);
                              const gstRate =
                                docScheme === "gst"
                                  ? Number(firstForCat.gst ?? 18)
                                  : 0;
                              const gstAmt = Math.round(
                                baseRate * (gstRate / 100),
                              );
                              setItems([
                                {
                                  id: items[0]?.id || `item_${Date.now()}`,
                                  serviceName: firstForCat.name,
                                  sacCode:
                                    docScheme === "gst" ? firstForCat.sac : "",
                                  qty: 1,
                                  unit: firstForCat.unit || "Project",
                                  rate: baseRate,
                                  gstRate,
                                  gstAmount: gstAmt,
                                  charges: [],
                                  totalAmount: baseRate + gstAmt,
                                },
                              ]);
                            } else {
                              setItems([
                                {
                                  id: `item_${Date.now()}`,
                                  serviceName: "",
                                  sacCode: "",
                                  qty: 1,
                                  unit: "Project",
                                  rate: "" as any,
                                  gstRate: docScheme === "gst" ? 18 : 0,
                                  gstAmount: 0,
                                  charges: [],
                                  totalAmount: 0,
                                },
                              ]);
                            }
                          }
                          if (cat === "Digital Marketing") {
                            const defaultPkg =
                              createDefaultMarketingPackage(
                                "Package 02 - Grow",
                              );
                            setMarketingPackage(defaultPkg);
                            setItems([
                              {
                                id: "mktg-pkg-1",
                                serviceName: defaultPkg.planName,
                                sacCode: "998311",
                                qty: 1,
                                rate: defaultPkg.packagePrice,
                                unit: "Month",
                                gstRate: docScheme === "gst" ? 18 : 0,
                                gstAmount:
                                  docScheme === "gst"
                                    ? Math.round(defaultPkg.packagePrice * 0.18)
                                    : 0,
                                charges: [],
                                totalAmount:
                                  docScheme === "gst"
                                    ? Math.round(defaultPkg.packagePrice * 1.18)
                                    : defaultPkg.packagePrice,
                              },
                            ]);
                          } else if (
                            items.length === 1 &&
                            (items[0].id === "mktg-pkg-1" ||
                              (items[0].serviceName &&
                                items[0].serviceName.includes("Package ")))
                          ) {
                            setItems([
                              {
                                id: "item-1",
                                serviceName:
                                  cat === "Website"
                                    ? "Website Development"
                                    : cat === "Custom Software"
                                      ? "Custom Software Application"
                                      : cat,
                                sacCode: "998313",
                                qty: 1,
                                rate: 25000,
                                unit: "Project",
                                gstRate: docScheme === "gst" ? 18 : 0,
                                gstAmount: docScheme === "gst" ? 4500 : 0,
                                charges: [],
                                totalAmount:
                                  docScheme === "gst" ? 29500 : 25000,
                              },
                            ]);
                          }
                        }}
                        className="px-3.5 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-900 dark:text-zinc-100 shadow-2xs cursor-pointer focus:ring-2 focus:ring-teal-500"
                      >
                        {primaryCategoryOpts.map((opt: any) => (
                          <option key={opt.id} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {primaryCategory === "Digital Marketing" ? (
                      <DigitalMarketingPackageBuilder
                        value={marketingPackage}
                        clientName={clientName}
                        clientPhone={clientPhone}
                        clientAddress={clientAddress}
                        onChange={(newPkg) => {
                          setMarketingPackage(newPkg);
                          setItems([
                            {
                              id: "mktg-pkg-1",
                              serviceName: newPkg.planName,
                              sacCode: "998311",
                              qty: 1,
                              rate: newPkg.packagePrice,
                              unit: "Month",
                              gstRate: docScheme === "gst" ? 18 : 0,
                              gstAmount:
                                docScheme === "gst"
                                  ? Math.round(newPkg.packagePrice * 0.18)
                                  : 0,
                              charges: [],
                              totalAmount:
                                docScheme === "gst"
                                  ? Math.round(newPkg.packagePrice * 1.18)
                                  : newPkg.packagePrice,
                            },
                          ]);
                        }}
                      />
                    ) : null}
                  </div>

                  {/* Line Items List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                        Line Items &amp; Services ({items.length})
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAddItem()}
                        className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Plus size={14} /> Add Line Item
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {items.map((item, index) => {
                        const rowBase = (item.rate || 0) * (item.qty || 1);
                        const rowTax =
                          docScheme === "gst"
                            ? Math.round(
                                rowBase *
                                  ((item.gstRate !== undefined
                                    ? item.gstRate
                                    : 18) /
                                    100),
                              )
                            : 0;
                        const rowTotal = rowBase + rowTax;

                        return (
                          <div
                            key={item.id}
                            className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-black text-zinc-800 dark:text-zinc-200 text-xs">
                                #{index + 1} Item
                              </span>
                              <div className="flex items-center gap-3">
                                <span className="font-mono font-bold text-teal-600 dark:text-teal-400 text-xs">
                                  Total: ₹{rowTotal.toLocaleString("en-IN")}{" "}
                                  {docScheme === "gst"
                                    ? `(incl. ₹${rowTax} tax)`
                                    : ""}
                                </span>
                                {items.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveItem(item.id)}
                                    className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                              <div className="sm:col-span-4">
                                <div className="flex items-center justify-between mb-1">
                                  <label className="block text-[10px] font-bold text-zinc-500">
                                    {(mode as any) === "quotation"
                                      ? "Module / Feature Name *"
                                      : "Service / Project Item *"}
                                  </label>
                                  <span className="text-[9px] font-bold text-teal-600 dark:text-teal-400">
                                    Preset / Custom
                                  </span>
                                </div>
                                <div className="space-y-1.5">
                                  <select
                                    value={
                                      dynamicServicePresets.some(
                                        (p) =>
                                          p.name.toLowerCase() ===
                                          (
                                            item.serviceName || ""
                                          ).toLowerCase(),
                                      )
                                        ? dynamicServicePresets.find(
                                            (p) =>
                                              p.name.toLowerCase() ===
                                              (
                                                item.serviceName || ""
                                              ).toLowerCase(),
                                          )?.name
                                        : item.serviceName
                                          ? "custom"
                                          : ""
                                    }
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      if (val === "custom") {
                                        if (
                                          dynamicServicePresets.some(
                                            (p) => p.name === item.serviceName,
                                          )
                                        ) {
                                          handleUpdateItem(
                                            item.id,
                                            "serviceName",
                                            "",
                                          );
                                        }
                                      } else if (val) {
                                        const preset =
                                          dynamicServicePresets.find(
                                            (p) => p.name === val,
                                          );
                                        if (preset) {
                                          handleUpdateItem(
                                            item.id,
                                            "serviceName",
                                            preset.name,
                                          );
                                          if (preset.sac)
                                            handleUpdateItem(
                                              item.id,
                                              "sacCode",
                                              preset.sac,
                                            );
                                          if (
                                            preset.rate &&
                                            (!item.rate || item.rate === 0)
                                          )
                                            handleUpdateItem(
                                              item.id,
                                              "rate",
                                              preset.rate,
                                            );
                                          if (preset.unit)
                                            handleUpdateItem(
                                              item.id,
                                              "unit",
                                              preset.unit,
                                            );
                                        }
                                      }
                                    }}
                                    className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none focus:border-teal-500 cursor-pointer"
                                  >
                                    <option value="" disabled>
                                      Select Preset or Custom...
                                    </option>
                                    {dynamicServicePresets.map((preset) => (
                                      <option
                                        key={preset.name}
                                        value={preset.name}
                                      >
                                        {preset.name}
                                      </option>
                                    ))}
                                    <option value="custom">
                                      ✏️ Custom Service / Item
                                    </option>
                                  </select>
                                  <Input
                                    value={item.serviceName}
                                    onChange={(e) =>
                                      handleUpdateItem(
                                        item.id,
                                        "serviceName",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Service name (or type custom item)..."
                                    className="font-bold text-xs"
                                  />
                                </div>
                              </div>
                              {docScheme === "gst" && (
                                <div className="sm:col-span-2">
                                  <label className="block text-[10px] font-bold text-zinc-500 mb-0.5">
                                    SAC/HSN
                                  </label>
                                  <Input
                                    value={item.sacCode}
                                    onChange={(e) =>
                                      handleUpdateItem(
                                        item.id,
                                        "sacCode",
                                        e.target.value,
                                      )
                                    }
                                    className="font-mono"
                                  />
                                </div>
                              )}
                              <div className="sm:col-span-2">
                                <label className="block text-[10px] font-bold text-zinc-500 mb-0.5">
                                  Qty
                                </label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={item.qty === 0 ? "" : (item.qty ?? "")}
                                  onChange={(e) =>
                                    handleUpdateItem(
                                      item.id,
                                      "qty",
                                      e.target.value === ""
                                        ? ""
                                        : Math.max(1, Number(e.target.value)),
                                    )
                                  }
                                />
                              </div>
                              {/* Quantity & Unit Dropdown */}
                              <div className="sm:col-span-2">
                                <label className="block text-[10px] font-bold text-zinc-500 mb-0.5">
                                  Unit
                                </label>
                                <select
                                  value={item.unit || "Qty"}
                                  onChange={(e) =>
                                    handleUpdateItem(
                                      item.id,
                                      "unit",
                                      e.target.value,
                                    )
                                  }
                                  className="w-full px-2 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold"
                                >
                                  {!(
                                    masterBundle?.options?.["billing_unit"] ||
                                    []
                                  ).some((o: any) => o.value === "Project") && (
                                    <option value="Project">Project</option>
                                  )}
                                  {(
                                    masterBundle?.options?.["billing_unit"] ||
                                    []
                                  ).map((opt: any) => (
                                    <option key={opt.id} value={opt.value}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div
                                className={
                                  docScheme === "gst"
                                    ? "sm:col-span-2"
                                    : "sm:col-span-4"
                                }
                              >
                                <label className="block text-[10px] font-bold text-zinc-500 mb-0.5">
                                  Rate (₹) *
                                </label>
                                <Input
                                  type="number"
                                  min="0"
                                  value={
                                    item.rate === 0 ? "" : (item.rate ?? "")
                                  }
                                  onChange={(e) =>
                                    handleUpdateItem(
                                      item.id,
                                      "rate",
                                      e.target.value === ""
                                        ? ""
                                        : Math.max(0, Number(e.target.value)),
                                    )
                                  }
                                  className="font-bold text-emerald-600"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Customer Credit Note Balance & Deduction Section */}
                  {(availableCredit > 0 ||
                    Boolean(initialData?.creditDeduction)) && (
                    <div className="p-4 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Receipt className="w-5 h-5 text-indigo-600" />
                          <div>
                            <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-100">
                              Customer Available Credit Note
                            </h4>
                            <p className="text-[11px] text-indigo-600/90">
                              Available credit balance:{" "}
                              <span className="font-black font-mono">
                                ₹{availableCredit.toLocaleString("en-IN")}
                              </span>
                              {initialData?.creditDeduction
                                ? ` (Currently deducted: ₹${Number(initialData.creditDeduction).toLocaleString("en-IN")})`
                                : ""}
                            </p>
                          </div>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 shadow-xs">
                          <input
                            type="checkbox"
                            checked={applyCredit}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setApplyCredit(checked);
                              if (
                                checked &&
                                (!creditToDeduct || creditToDeduct === 0)
                              ) {
                                setCreditToDeduct(
                                  Math.min(
                                    availableCredit ||
                                      Number(initialData?.creditDeduction) ||
                                      0,
                                    grandTotal,
                                  ),
                                );
                              }
                            }}
                            className="w-4 h-4 text-indigo-600 rounded border-zinc-300 focus:ring-indigo-500"
                          />
                          <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                            Deduct Credit Note Balance
                          </span>
                        </label>
                      </div>

                      {applyCredit && (
                        <div className="pt-2 border-t border-indigo-100 dark:border-indigo-900/60 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                          <div>
                            <label className="block text-[10.5px] font-bold text-indigo-950 dark:text-indigo-200 mb-1">
                              Amount to Deduct (₹) (Max ₹
                              {Math.min(
                                availableCredit || creditToDeduct,
                                grandTotal,
                              ).toLocaleString("en-IN")}
                              )
                            </label>
                            <Input
                              type="number"
                              min="0"
                              max={availableCredit || creditToDeduct}
                              value={creditToDeduct === 0 ? "" : creditToDeduct}
                              onChange={(e) => {
                                const val =
                                  e.target.value === ""
                                    ? 0
                                    : Number(e.target.value);
                                setCreditToDeduct(Math.min(val, grandTotal));
                              }}
                              className="font-bold font-mono text-indigo-600 bg-white dark:bg-zinc-900"
                            />
                          </div>
                          <div className="text-xs text-zinc-600 dark:text-zinc-400">
                            Applying credit reduces the customer payable invoice
                            total from{" "}
                            <strong className="font-mono text-zinc-800 dark:text-zinc-200">
                              ₹{grandTotal.toLocaleString("en-IN")}
                            </strong>{" "}
                            to{" "}
                            <strong className="font-mono text-emerald-600">
                              ₹{netPayable.toLocaleString("en-IN")}
                            </strong>
                            .
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Calculations Summary */}
                  <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400">
                            Discount{" "}
                            {discountType === "percentage" ? "(%)" : "(₹)"}
                          </label>
                          <div className="flex items-center p-0.5 rounded-lg bg-zinc-200/70 dark:bg-zinc-800 text-[10px] font-bold">
                            <button
                              type="button"
                              onClick={() =>
                                handleDiscountTypeChange("percentage")
                              }
                              className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                                discountType === "percentage"
                                  ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                              }`}
                            >
                              % Percent
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDiscountTypeChange("fixed")}
                              className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                                discountType === "fixed"
                                  ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                              }`}
                            >
                              ₹ Amount
                            </button>
                          </div>
                        </div>
                        <Input
                          type="number"
                          min="0"
                          max={discountType === "percentage" ? 100 : undefined}
                          value={discountValue === 0 ? "" : discountValue}
                          onChange={(e) => {
                            const val =
                              e.target.value === ""
                                ? ""
                                : Math.max(0, Number(e.target.value));
                            if (
                              typeof val === "number" &&
                              discountType === "percentage" &&
                              val > 100
                            ) {
                              setDiscountValue(100);
                            } else {
                              setDiscountValue(val);
                            }
                          }}
                          placeholder={
                            discountType === "percentage"
                              ? "e.g. 10 (%)"
                              : "e.g. 1000 (₹)"
                          }
                        />
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 space-y-2 mt-2">
                      <div className="flex items-center justify-between text-zinc-600 text-xs">
                        <span>Subtotal:</span>
                        <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                          ₹{calculatedSubtotal.toLocaleString("en-IN")}
                        </span>
                      </div>
                      {calculatedDiscount > 0 && (
                        <div className="flex items-center justify-between text-rose-600 text-xs">
                          <span>Discount:</span>
                          <span className="font-mono font-bold">
                            -₹{calculatedDiscount.toLocaleString("en-IN")}
                          </span>
                        </div>
                      )}
                      {numSetupCharge > 0 && (
                        <div className="flex items-center justify-between text-zinc-600 text-xs">
                          <span>Platform / Setup:</span>
                          <span className="font-mono font-bold">
                            +₹{numSetupCharge.toLocaleString("en-IN")}
                          </span>
                        </div>
                      )}
                      {docScheme === "gst" && (
                        <div className="flex items-center justify-between text-teal-600 text-xs">
                          <span>Statutory GST (18%):</span>
                          <span className="font-mono font-bold">
                            +₹{calculatedGst.toLocaleString("en-IN")}
                          </span>
                        </div>
                      )}
                      {effectiveCreditDeduction > 0 && (
                        <div className="flex items-center justify-between text-indigo-700 dark:text-indigo-300 font-bold text-xs bg-indigo-50/80 dark:bg-indigo-950/40 px-2 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800">
                          <span>Less: Credit Note Applied:</span>
                          <span className="font-mono">
                            -₹{effectiveCreditDeduction.toLocaleString("en-IN")}
                          </span>
                        </div>
                      )}
                      <div className="border-t border-zinc-200 dark:border-zinc-700 pt-2 flex items-center justify-between text-sm">
                        <span className="font-black text-zinc-900 dark:text-zinc-100">
                          Net Payable Total:
                        </span>
                        <span className="font-black font-mono text-emerald-600 dark:text-emerald-400 text-base">
                          ₹{netPayable.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-400 font-medium italic">
                        Amount in words: {numberToIndianWords(netPayable)}
                      </div>
                    </div>
                  </div>

                  {/* Payment Plan & Settlement Structure (Order: Full, Part (EMI), Advance, Subscription) */}
                  <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200 dark:border-zinc-700/60 pb-2">
                      <span className="font-extrabold text-zinc-800 dark:text-zinc-200 text-xs flex items-center gap-1.5">
                        <Calculator size={15} className="text-teal-600" />
                        <span>Payment Plan &amp; Settlement Structure</span>
                      </span>

                      {/* 1. Full, 2. Advance, 3. Part (EMI) */}
                      <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setPaymentPlan("full")}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            paymentPlan === "full"
                              ? "bg-teal-600 text-white shadow-xs"
                              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
                          }`}
                        >
                          1. Full
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentPlan("advance")}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            paymentPlan === "advance"
                              ? "bg-teal-600 text-white shadow-xs"
                              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
                          }`}
                        >
                          2. Advance
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentPlan("part")}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            paymentPlan === "part"
                              ? "bg-teal-600 text-white shadow-xs"
                              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
                          }`}
                        >
                          3. Part (EMI)
                        </button>
                      </div>
                    </div>

                    {paymentPlan === "full" && (
                      <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-teal-200 dark:border-teal-800 text-xs flex items-center justify-between">
                        <span className="text-zinc-600 dark:text-zinc-400">
                          100% Full Payment Settlement. Full invoice balance
                          marked as settled upon receipt.
                        </span>
                        <span className="font-mono font-bold text-teal-600">
                          Total: ₹{grandTotal.toLocaleString("en-IN")}
                        </span>
                      </div>
                    )}

                    {(paymentPlan === "full" || paymentPlan === "advance") && (
                      <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-2.5 text-xs">
                        <div className="flex items-center justify-between">
                          <label className="inline-flex items-center gap-2 font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(isSplitPayment)}
                              onChange={(e) =>
                                setIsSplitPayment?.(e.target.checked)
                              }
                              className="rounded"
                            />
                            <span>
                              Split Bill Payment (Online / UPI / Bank / Cash)
                            </span>
                          </label>
                          {isSplitPayment && (
                            <button
                              type="button"
                              onClick={() =>
                                setSplitPayments?.([
                                  ...(splitPayments || []),
                                  {
                                    id: `sp-${Date.now()}`,
                                    method: "Cash Deposit",
                                    amount: "",
                                    reference: "",
                                  },
                                ])
                              }
                              className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-bold text-[11px] hover:bg-teal-100 cursor-pointer"
                            >
                              + Add Split
                            </button>
                          )}
                        </div>
                        {isSplitPayment && (
                          <div className="space-y-2 pt-1">
                            {(splitPayments || []).map(
                              (sp: any, sIdx: number) => (
                                <div
                                  key={sp.id}
                                  className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                                >
                                  <div className="sm:col-span-4">
                                    <select
                                      value={sp.method}
                                      onChange={(e) => {
                                        const next = [...splitPayments];
                                        next[sIdx] = {
                                          ...sp,
                                          method: e.target.value,
                                        };
                                        setSplitPayments?.(next);
                                      }}
                                      className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-semibold"
                                    >
                                      {(
                                        masterBundle?.options?.[
                                          "payment_method"
                                        ] || []
                                      ).map((opt: any) => (
                                        <option key={opt.id} value={opt.value}>
                                          {opt.label}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="sm:col-span-3">
                                    <Input
                                      type="number"
                                      min="0"
                                      placeholder="Amount (₹)"
                                      value={sp.amount}
                                      onChange={(e) => {
                                        const next = [...splitPayments];
                                        next[sIdx] = {
                                          ...sp,
                                          amount:
                                            e.target.value === ""
                                              ? ""
                                              : Math.max(
                                                  0,
                                                  Number(e.target.value),
                                                ),
                                        };
                                        setSplitPayments?.(next);
                                      }}
                                      className="h-8 text-xs font-mono font-bold"
                                    />
                                  </div>
                                  <div className="sm:col-span-4">
                                    <Input
                                      placeholder="Txn ID / Note (optional)"
                                      value={sp.reference}
                                      onChange={(e) => {
                                        const next = [...splitPayments];
                                        next[sIdx] = {
                                          ...sp,
                                          reference: e.target.value,
                                        };
                                        setSplitPayments?.(next);
                                      }}
                                      className="h-8 text-xs"
                                    />
                                  </div>
                                  <div className="sm:col-span-1 text-right">
                                    {splitPayments.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setSplitPayments?.(
                                            splitPayments.filter(
                                              (_: any, i: number) => i !== sIdx,
                                            ),
                                          )
                                        }
                                        className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ),
                            )}
                            <div className="text-[11px] font-mono text-zinc-600 dark:text-zinc-400 flex justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800">
                              <span>Split Total:</span>
                              <span className="font-bold text-teal-600">
                                ₹
                                {(splitPayments || [])
                                  .reduce(
                                    (acc: number, s: any) =>
                                      acc + (Number(s.amount) || 0),
                                    0,
                                  )
                                  .toLocaleString("en-IN")}{" "}
                                / ₹{grandTotal.toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {paymentPlan === "part" && (
                      <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800/80 space-y-3 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-blue-950 dark:text-blue-200 flex items-center gap-1.5 text-xs">
                            <span>
                              🔄 Part Payment / EMI Milestone Structure
                            </span>
                          </span>
                          <span className="text-[10.5px] text-blue-700 dark:text-blue-300 bg-blue-100/70 dark:bg-blue-900/50 px-2 py-0.5 rounded-full font-bold">
                            Advance Minus Option
                          </span>
                        </div>

                        {/* Advance Down Payment Input */}
                        <div className="space-y-1.5 bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-blue-100 dark:border-blue-900/50">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                              Advance Down Payment (Paid Upfront)
                            </label>
                            <div className="flex gap-1">
                              {[0, 0.2, 0.3, 0.5].map((pct) => (
                                <button
                                  key={pct}
                                  type="button"
                                  onClick={() =>
                                    setEmiAdvanceAmount(
                                      pct === 0
                                        ? 0
                                        : Math.round(netPayable * pct),
                                    )
                                  }
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                                    (pct === 0 &&
                                      (emiAdvanceAmount === 0 ||
                                        emiAdvanceAmount === "")) ||
                                    (pct > 0 &&
                                      emiAdvanceAmount ===
                                        Math.round(netPayable * pct))
                                      ? "bg-blue-600 text-white"
                                      : "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-100"
                                  }`}
                                >
                                  {pct === 0 ? "0% (No Adv)" : `${pct * 100}%`}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">
                              ₹
                            </span>
                            <Input
                              type="number"
                              min="0"
                              max={netPayable}
                              value={
                                emiAdvanceAmount === 0 ? "" : emiAdvanceAmount
                              }
                              onChange={(e) =>
                                setEmiAdvanceAmount(
                                  e.target.value === ""
                                    ? ""
                                    : Math.max(0, Number(e.target.value)),
                                )
                              }
                              placeholder="Enter upfront advance amount..."
                              className="font-mono font-bold pl-7 h-8 text-xs"
                            />
                          </div>
                        </div>

                        {/* Custom EMI Dates & Payment Amounts */}
                        <div className="space-y-2 bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-blue-100 dark:border-blue-900/50">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-blue-900 dark:text-blue-200">
                              Custom EMI Dates &amp; Installment Amounts
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const nextIdx =
                                  (emiCustomSchedule?.length || 0) + 1;
                                const d = new Date();
                                d.setMonth(d.getMonth() + nextIdx);
                                setEmiCustomSchedule?.([
                                  ...(emiCustomSchedule || []),
                                  {
                                    id: `emi-${Date.now()}`,
                                    dueDate: d.toISOString().split("T")[0],
                                    amount: emiMonthlyAmount || 0,
                                  },
                                ]);
                              }}
                              className="px-2 py-0.5 rounded bg-blue-600 text-white text-[10px] font-bold hover:bg-blue-700 cursor-pointer"
                            >
                              + Add EMI Date
                            </button>
                          </div>
                          {(emiCustomSchedule || []).length === 0 ? (
                            <p className="text-[10.5px] text-zinc-500">
                              Click &quot;+ Add EMI Date&quot; to choose exact
                              installment dates and custom amounts (Total
                              remaining: ₹
                              {emiRemainingBalance.toLocaleString("en-IN")}).
                            </p>
                          ) : (
                            <div className="space-y-1.5">
                              {emiCustomSchedule.map(
                                (row: any, eIdx: number) => (
                                  <div
                                    key={row.id}
                                    className="grid grid-cols-12 gap-2 items-center"
                                  >
                                    <span className="col-span-2 text-[10.5px] font-bold text-zinc-500">
                                      EMI #{eIdx + 1}
                                    </span>
                                    <div className="col-span-5">
                                      <Input
                                        type="date"
                                        value={row.dueDate}
                                        onChange={(e) => {
                                          const next = [...emiCustomSchedule];
                                          next[eIdx] = {
                                            ...row,
                                            dueDate: e.target.value,
                                          };
                                          setEmiCustomSchedule?.(next);
                                        }}
                                        className="h-7 text-xs font-mono"
                                      />
                                    </div>
                                    <div className="col-span-4">
                                      <Input
                                        type="number"
                                        min="0"
                                        value={row.amount}
                                        onChange={(e) => {
                                          const next = [...emiCustomSchedule];
                                          next[eIdx] = {
                                            ...row,
                                            amount:
                                              e.target.value === ""
                                                ? ""
                                                : Math.max(
                                                    0,
                                                    Number(e.target.value),
                                                  ),
                                          };
                                          setEmiCustomSchedule?.(next);
                                        }}
                                        placeholder="Amount (₹)"
                                        className="h-7 text-xs font-mono font-bold"
                                      />
                                    </div>
                                    <div className="col-span-1 text-right">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setEmiCustomSchedule?.(
                                            emiCustomSchedule.filter(
                                              (_: any, i: number) => i !== eIdx,
                                            ),
                                          )
                                        }
                                        className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  </div>
                                ),
                              )}
                              <div className="flex justify-between text-[10.5px] font-mono pt-1 border-t border-zinc-100 dark:border-zinc-800">
                                <span>Scheduled EMI Total:</span>
                                <span className="font-bold text-blue-600">
                                  ₹
                                  {emiCustomSchedule
                                    .reduce(
                                      (s: number, r: any) =>
                                        s + (Number(r.amount) || 0),
                                      0,
                                    )
                                    .toLocaleString("en-IN")}{" "}
                                  / ₹
                                  {emiRemainingBalance.toLocaleString("en-IN")}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Tenure Selection with Dropdown: 2 Mo, 3 Mo, 4 Mo, 6 Mo, 12 M and custom */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                              Installment Period (Tenure):
                            </label>
                            <select
                              value={
                                isCustomEmi ? "custom" : String(emiTenureMonths)
                              }
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === "custom") {
                                  setIsCustomEmi(true);
                                } else {
                                  setIsCustomEmi(false);
                                  setEmiTenureMonths(Number(val));
                                }
                              }}
                              className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 font-bold text-xs shadow-xs focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            >
                              {(
                                masterBundle?.options?.["duration_offer"] || []
                              ).map((opt: any) => (
                                <option key={opt.id} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          {isCustomEmi && (
                            <div className="p-2.5 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900 flex items-center justify-between gap-3">
                              <label className="text-[10.5px] font-bold text-blue-950 dark:text-blue-300 shrink-0">
                                Enter Custom Months (Tenure):
                              </label>
                              <Input
                                type="number"
                                min="1"
                                max="60"
                                value={
                                  emiTenureMonths === 0
                                    ? ""
                                    : emiTenureMonths || ""
                                }
                                onChange={(e) =>
                                  setEmiTenureMonths(
                                    e.target.value === ""
                                      ? ("" as any)
                                      : Math.max(1, Number(e.target.value)),
                                  )
                                }
                                placeholder="e.g. 5, 8, 9, 18, 24"
                                className="font-mono font-bold text-xs h-8 text-right bg-white dark:bg-zinc-900 max-w-[120px]"
                              />
                            </div>
                          )}
                        </div>

                        {/* Visual Equation Matrix */}
                        <div className="p-2.5 bg-blue-100/50 dark:bg-blue-950/60 rounded-lg border border-blue-200 dark:border-blue-800 text-[11px] space-y-1.5 font-mono">
                          <div className="flex justify-between text-zinc-700 dark:text-zinc-300 font-sans">
                            <span>Total Contract Amount:</span>
                            <strong className="font-mono">
                              ₹{netPayable.toLocaleString("en-IN")}
                            </strong>
                          </div>
                          <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-sans">
                            <span>Less: Advance Down Payment:</span>
                            <strong className="font-mono">
                              (-) ₹{effectiveEmiAdvance.toLocaleString("en-IN")}
                            </strong>
                          </div>
                          <div className="flex justify-between text-blue-900 dark:text-blue-200 font-bold border-t border-blue-200 dark:border-blue-800 pt-1 font-sans">
                            <span>Remaining Balance for EMI:</span>
                            <strong className="font-mono text-blue-700 dark:text-blue-300">
                              ₹{emiRemainingBalance.toLocaleString("en-IN")}
                            </strong>
                          </div>
                          <div className="flex justify-between text-indigo-700 dark:text-indigo-300 font-extrabold bg-white dark:bg-zinc-900 p-1.5 rounded border border-blue-200 dark:border-blue-800 font-sans">
                            <span>
                              Monthly EMI ({emiTenureMonths} Installments):
                            </span>
                            <strong className="font-mono text-sm text-indigo-600 dark:text-indigo-400">
                              ₹{emiMonthlyAmount.toLocaleString("en-IN")}
                              <span className="text-[10px] font-normal text-zinc-500">
                                /mo
                              </span>
                            </strong>
                          </div>
                        </div>

                        {/* Quick schedule breakdown hint */}
                        <div className="flex items-center justify-between text-[10.5px] text-zinc-500 pt-0.5">
                          <span>
                            🛡️ Auto-syncs to{" "}
                            <strong>EMI Milestone Plans (/feature/emi)</strong>
                          </span>
                          <span>
                            1st EMI Due:{" "}
                            <strong>
                              {calculateCycleFutureDate(
                                issueDate,
                                "Monthly",
                                1,
                              )}
                            </strong>
                          </span>
                        </div>
                      </div>
                    )}

                    {paymentPlan === "advance" && (
                      <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <label className="font-bold text-emerald-800 dark:text-emerald-300">
                            Advance Down Payment Amount (₹)
                          </label>
                          <div className="flex gap-1">
                            {[0.25, 0.5].map((pct) => (
                              <button
                                key={pct}
                                type="button"
                                onClick={() =>
                                  setAdvanceAmount(Math.round(grandTotal * pct))
                                }
                                className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold cursor-pointer"
                              >
                                {pct * 100}%
                              </button>
                            ))}
                          </div>
                        </div>
                        <Input
                          type="number"
                          min="0"
                          value={advanceAmount === 0 ? "" : advanceAmount}
                          onChange={(e) =>
                            setAdvanceAmount(
                              e.target.value === ""
                                ? ""
                                : Math.max(0, Number(e.target.value)),
                            )
                          }
                          placeholder="e.g. 10000"
                          className="font-mono font-bold"
                        />
                        <div className="flex justify-between text-[11px] text-zinc-500 pt-0.5">
                          <span>
                            Advance Paid:{" "}
                            <strong className="text-emerald-600 font-mono">
                              ₹
                              {(typeof advanceAmount === "number"
                                ? advanceAmount
                                : 0
                              ).toLocaleString("en-IN")}
                            </strong>
                          </span>
                          <span>
                            Balance Due:{" "}
                            <strong className="text-rose-600 font-mono">
                              ₹
                              {Math.max(
                                0,
                                grandTotal -
                                  (typeof advanceAmount === "number"
                                    ? advanceAmount
                                    : 0),
                              ).toLocaleString("en-IN")}
                            </strong>
                          </span>
                        </div>
                      </div>
                    )}

                    {paymentPlan === "subscription" && (
                      <div className="p-3.5 bg-purple-50/60 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-800/80 space-y-3 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-purple-950 dark:text-purple-200 flex items-center gap-1.5 text-xs">
                            <span>
                              🗓️ Subscription & Retainer Configuration
                            </span>
                          </span>
                          <span className="text-[10.5px] text-purple-700 dark:text-purple-300 bg-purple-100/70 dark:bg-purple-900/50 px-2 py-0.5 rounded-full font-bold">
                            Multi-Month + Advance
                          </span>
                        </div>

                        {/* Cycle & Duration */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                              Billing Frequency
                            </label>
                            <div className="grid grid-cols-4 gap-1">
                              {(
                                [
                                  "Weekly",
                                  "Monthly",
                                  "Quarterly",
                                  "Yearly",
                                ] as const
                              ).map((cycle) => (
                                <button
                                  key={cycle}
                                  type="button"
                                  onClick={() => setSubscriptionCycle(cycle)}
                                  className={`py-1 text-center rounded text-[11px] font-bold cursor-pointer transition-all ${
                                    subscriptionCycle === cycle
                                      ? "bg-purple-600 text-white shadow-xs"
                                      : "bg-white dark:bg-zinc-800 text-zinc-600 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100"
                                  }`}
                                >
                                  {cycle.slice(0, 3)}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                              Subscription Duration
                            </label>
                            <div className="flex gap-1">
                              {[1, 3, 6, 12, 24].map((m) => (
                                <button
                                  key={m}
                                  type="button"
                                  onClick={() =>
                                    setSubscriptionDurationMonths(m)
                                  }
                                  className={`flex-1 py-1 text-center rounded text-[11px] font-bold cursor-pointer transition-all ${
                                    subscriptionDurationMonths === m
                                      ? "bg-purple-600 text-white shadow-xs"
                                      : "bg-white dark:bg-zinc-800 text-zinc-600 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100"
                                  }`}
                                >
                                  {m}M
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Recurring Rate & Advance Payment */}
                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="space-y-1 bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-purple-100 dark:border-purple-900/50">
                            <label className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 block">
                              Rate per {subscriptionCycle} (₹)
                            </label>
                            <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">
                                ₹
                              </span>
                              <Input
                                type="number"
                                min="0"
                                value={subscriptionRate}
                                onChange={(e) =>
                                  setSubscriptionRate(
                                    e.target.value === ""
                                      ? ""
                                      : Math.max(0, Number(e.target.value)),
                                  )
                                }
                                placeholder={`e.g. ${defaultSubRate}`}
                                className="font-mono font-bold pl-7 h-8 text-xs"
                              />
                            </div>
                          </div>

                          <div className="space-y-1 bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-purple-100 dark:border-purple-900/50">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400">
                                Advance Amount Paid (₹)
                              </label>
                              <div className="flex gap-1">
                                {[1, 3].map((c) => {
                                  const val = activeSubRate * c;
                                  if (c > subscriptionDurationMonths)
                                    return null;
                                  return (
                                    <button
                                      key={c}
                                      type="button"
                                      onClick={() =>
                                        setSubscriptionAdvance(val)
                                      }
                                      className="px-1 py-0.2 rounded bg-purple-50 text-purple-700 text-[9px] font-bold cursor-pointer"
                                    >
                                      {c}M
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                            <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">
                                ₹
                              </span>
                              <Input
                                type="number"
                                min="0"
                                max={subContractTotal}
                                value={
                                  subscriptionAdvance === 0
                                    ? ""
                                    : subscriptionAdvance
                                }
                                onChange={(e) =>
                                  setSubscriptionAdvance(
                                    e.target.value === ""
                                      ? ""
                                      : Math.max(0, Number(e.target.value)),
                                  )
                                }
                                placeholder="e.g. 300"
                                className="font-mono font-bold pl-7 h-8 text-xs"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Live Subscription Breakdown Matrix */}
                        <div className="p-2.5 bg-purple-100/50 dark:bg-purple-950/60 rounded-lg border border-purple-200 dark:border-purple-800 text-[11px] space-y-1 font-mono">
                          <div className="flex justify-between text-purple-900 dark:text-purple-200 font-sans">
                            <span>
                              Subscription Plan ({subscriptionDurationMonths} Mo
                              · {subscriptionCycle} @ ₹
                              {activeSubRate.toLocaleString("en-IN")}):
                            </span>
                            <strong className="font-mono">
                              ₹{subContractTotal.toLocaleString("en-IN")}
                            </strong>
                          </div>
                          {numSetupCharge > 0 && (
                            <div className="flex justify-between text-zinc-700 dark:text-zinc-300 font-sans">
                              <span>Setup / Onboarding Fee (included):</span>
                              <strong className="font-mono">
                                ₹{numSetupCharge.toLocaleString("en-IN")}
                              </strong>
                            </div>
                          )}
                          <div className="flex justify-between text-zinc-900 dark:text-zinc-100 font-bold border-t border-purple-200 dark:border-purple-800 pt-1 font-sans">
                            <span>
                              Invoice Grand Total (
                              {docScheme === "gst" ? "Incl. GST" : "Non-GST"}):
                            </span>
                            <strong className="font-mono text-purple-700 dark:text-purple-300">
                              ₹{subContractTotal.toLocaleString("en-IN")}
                            </strong>
                          </div>
                          <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-sans">
                            <span>Advance Paid Upfront:</span>
                            <strong className="font-mono">
                              (-) ₹{effectiveSubAdvance.toLocaleString("en-IN")}
                              {subPrepaidCycles > 0 && (
                                <span className="text-[10px] font-normal text-emerald-600 ml-1">
                                  ({subPrepaidCycles}{" "}
                                  {subscriptionCycle === "Monthly"
                                    ? "Mo"
                                    : "cycles"}{" "}
                                  prepaid)
                                </span>
                              )}
                            </strong>
                          </div>
                          <div className="flex justify-between text-rose-700 dark:text-rose-400 font-bold border-t border-purple-200 dark:border-purple-800 pt-1 font-sans">
                            <span>Net Balance Due:</span>
                            <strong className="font-mono">
                              ₹
                              {Math.max(
                                0,
                                subContractTotal - effectiveSubAdvance,
                              ).toLocaleString("en-IN")}
                            </strong>
                          </div>
                          <div className="flex justify-between text-indigo-700 dark:text-indigo-300 font-sans pt-0.5">
                            <span>Next Recurring Billing Date:</span>
                            <strong className="font-mono text-indigo-700 dark:text-indigo-400">
                              {subNextBillingDate}
                            </strong>
                          </div>
                        </div>

                        <p className="text-[10px] text-zinc-500 pt-0.5">
                          📌 Syncs to <strong>Subscriptions section</strong>{" "}
                          with first recurring billing cycle scheduled on{" "}
                          <strong>{subNextBillingDate}</strong>.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Settlement Due Date (Optional) */}
                  {paymentPlan !== "full" && (
                    <div className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <label className="block text-[11px] font-extrabold text-zinc-800 dark:text-zinc-200">
                          Invoice Due Date (Optional)
                        </label>
                        <p className="text-[10px] text-zinc-500">
                          Defaults to unset (0000-00-00). Select an explicit
                          date if this payment requires a firm statutory
                          deadline.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="date"
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                          className="text-xs font-mono font-bold bg-zinc-50 dark:bg-zinc-800 w-auto"
                        />
                        {dueDate && (
                          <button
                            type="button"
                            onClick={() => setDueDate("")}
                            className="px-2 py-1 text-[10px] font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                          >
                            Clear (Unset)
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Post-Billing Destination Module Selector (Project / Subscription / Digital Marketing) */}
                  <div className="p-4 rounded-2xl border border-indigo-200/80 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="font-extrabold text-zinc-800 dark:text-zinc-100 text-xs flex items-center gap-1.5">
                        <Layers size={15} className="text-indigo-600 dark:text-indigo-400" />
                        <span>Open Module After Billing</span>
                      </span>
                      <span className="text-[10.5px] text-zinc-500 dark:text-zinc-400">
                        Select which module to create &amp; open automatically on save
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setSelectedTargetModule?.("project")}
                        className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                          (selectedTargetModule || "project") === "project"
                            ? "border-blue-600 bg-blue-50/90 dark:bg-blue-950/50 text-blue-900 dark:text-blue-100 shadow-sm ring-1 ring-blue-500/30"
                            : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-blue-300 dark:hover:border-blue-700"
                        }`}
                      >
                        <div className={`p-2 rounded-lg shrink-0 ${(selectedTargetModule || "project") === "project" ? "bg-blue-600 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"}`}>
                          <Briefcase size={15} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-xs">Project</span>
                            {(selectedTargetModule || "project") === "project" && (
                              <CheckCircle2 size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />
                            )}
                          </div>
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">
                            Opens at Unassigned in Project module
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedTargetModule?.("subscription")}
                        className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                          selectedTargetModule === "subscription"
                            ? "border-purple-600 bg-purple-50/90 dark:bg-purple-950/50 text-purple-900 dark:text-purple-100 shadow-sm ring-1 ring-purple-500/30"
                            : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-purple-300 dark:hover:border-purple-700"
                        }`}
                      >
                        <div className={`p-2 rounded-lg shrink-0 ${selectedTargetModule === "subscription" ? "bg-purple-600 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"}`}>
                          <RefreshCw size={15} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-xs">Subscription</span>
                            {selectedTargetModule === "subscription" && (
                              <CheckCircle2 size={14} className="text-purple-600 dark:text-purple-400 shrink-0" />
                            )}
                          </div>
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">
                            Opens in Subscription module
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedTargetModule?.("digital_marketing")}
                        className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                          selectedTargetModule === "digital_marketing"
                            ? "border-emerald-600 bg-emerald-50/90 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-100 shadow-sm ring-1 ring-emerald-500/30"
                            : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-emerald-300 dark:hover:border-emerald-700"
                        }`}
                      >
                        <div className={`p-2 rounded-lg shrink-0 ${selectedTargetModule === "digital_marketing" ? "bg-emerald-600 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"}`}>
                          <Sparkles size={15} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-xs">Digital Marketing</span>
                            {selectedTargetModule === "digital_marketing" && (
                              <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                            )}
                          </div>
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">
                            Opens in Digital Marketing module
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </>
  );
}
