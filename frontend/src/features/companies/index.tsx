"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Plus,
  Search,
  Edit2,
  Trash2,
  ChevronRight,
  ChevronDown,
  MapPin,
  Phone,
  Mail,
  Globe,
  Users,
  Briefcase,
  DollarSign,
  Building,
  Loader2,
  AlertCircle,
  Shield,
  CreditCard,
  Award,
  CheckCircle2,
  Image,
  X,
  Sparkles,
  Eye,
  Landmark,
  QrCode,
  FileText,
  Check,
  ShieldCheck,
  Columns,
  Maximize2,
  Minimize2,
  Split,
  LayoutTemplate,
  Save,
  Copy,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  CompanyApiService,
  BranchApiService,
  SubBranchApiService,
} from "./services/companyService";
import { Company, Branch, SubBranch } from "./types";
import { useAuthStore, isMatchingCompany } from "@/store/useAuthStore";
import {
  markGlobalItemDeleted,
  unmarkGlobalItemDeleted,
  fetchModuleDataFromDB,
  saveModuleDataToDB,
  syncGlobalDeletedIds,
  isGlobalItemDeleted,
  getLocalDeletedIds,
} from "@/lib/storageSync";
import { ImageUploadField } from "@/components/ui/ImageUploadField";
import {
  OfficialInvoiceDocument,
  CustomTextStamp,
} from "@/features/invoice/components/OfficialInvoiceDocument";
import {
  InvoiceItem,
  InvoiceLineItem,
} from "@/features/invoice/services/invoiceService";
import { CompaniesSection1 } from "@/features/companies/components/companies-sections/CompaniesSection1";
import { CompaniesSection2 } from "@/features/companies/components/companies-sections/CompaniesSection2";
import { CompaniesSection3 } from "@/features/companies/components/companies-sections/CompaniesSection3";
import { CompaniesSection4 } from "@/features/companies/components/companies-sections/CompaniesSection4";
import { createCompaniesHandler1 } from "@/features/companies/hooks/companies-hooks/createCompaniesHandler1.hooks";
import { createCompaniesHandler2 } from "@/features/companies/hooks/companies-hooks/createCompaniesHandler2.hooks";
import { createCompaniesHandler3 } from "@/features/companies/hooks/companies-hooks/createCompaniesHandler3.hooks";
import { createCompaniesHandler4 } from "@/features/companies/hooks/companies-hooks/createCompaniesHandler4.hooks";

import {
  INDUSTRIES,
  CURRENCIES,
  PARTNER_TYPES,
  CANONICAL_COMPANIES,
  CANONICAL_BRANCHES,
  cleanStr,
  cleanUpper,
  isBranchDeleted,
  SafeModalBoundary,
} from "@/features/companies/components/companies-sections/CompaniesHelpers";
export * from "@/features/companies/components/companies-sections/CompaniesHelpers";
import { createCompaniesAction20 } from "@/features/companies/hooks/companies-hooks/createCompaniesAction20.hooks";
import { createCompaniesAction21 } from "@/features/companies/hooks/companies-hooks/createCompaniesAction21.hooks";
import { createCompaniesAction22 } from "@/features/companies/hooks/companies-hooks/createCompaniesAction22.hooks";
import { createCompaniesAction23 } from "@/features/companies/hooks/companies-hooks/createCompaniesAction23.hooks";
import { createCompaniesAction24 } from "@/features/companies/hooks/companies-hooks/createCompaniesAction24.hooks";
import { createCompaniesAction25 } from "@/features/companies/hooks/companies-hooks/createCompaniesAction25.hooks";
import { createCompaniesAction26 } from "@/features/companies/hooks/companies-hooks/createCompaniesAction26.hooks";
import { createCompaniesAction27 } from "@/features/companies/hooks/companies-hooks/createCompaniesAction27.hooks";

export default function CompaniesMain() {
  const __ctrl: any = {
    get user() {
      try {
        return user;
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
    get activeCompanyId() {
      try {
        return activeCompanyId;
      } catch {
        return undefined;
      }
    },
    get isSuperAdmin() {
      try {
        return isSuperAdmin;
      } catch {
        return undefined;
      }
    },
    get userAssignedComps() {
      try {
        return userAssignedComps;
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
    get setCompanies() {
      try {
        return setCompanies;
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
    get setBranches() {
      try {
        return setBranches;
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
    get setSubBranches() {
      try {
        return setSubBranches;
      } catch {
        return undefined;
      }
    },
    get loading() {
      try {
        return loading;
      } catch {
        return undefined;
      }
    },
    get setLoading() {
      try {
        return setLoading;
      } catch {
        return undefined;
      }
    },
    get error() {
      try {
        return error;
      } catch {
        return undefined;
      }
    },
    get setError() {
      try {
        return setError;
      } catch {
        return undefined;
      }
    },
    get searchQuery() {
      try {
        return searchQuery;
      } catch {
        return undefined;
      }
    },
    get setSearchQuery() {
      try {
        return setSearchQuery;
      } catch {
        return undefined;
      }
    },
    get industryFilter() {
      try {
        return industryFilter;
      } catch {
        return undefined;
      }
    },
    get setIndustryFilter() {
      try {
        return setIndustryFilter;
      } catch {
        return undefined;
      }
    },
    get expandedCompanies() {
      try {
        return expandedCompanies;
      } catch {
        return undefined;
      }
    },
    get setExpandedCompanies() {
      try {
        return setExpandedCompanies;
      } catch {
        return undefined;
      }
    },
    get expandedBranches() {
      try {
        return expandedBranches;
      } catch {
        return undefined;
      }
    },
    get setExpandedBranches() {
      try {
        return setExpandedBranches;
      } catch {
        return undefined;
      }
    },
    get showCompanyModal() {
      try {
        return showCompanyModal;
      } catch {
        return undefined;
      }
    },
    get setShowCompanyModal() {
      try {
        return setShowCompanyModal;
      } catch {
        return undefined;
      }
    },
    get companyModalViewMode() {
      try {
        return companyModalViewMode;
      } catch {
        return undefined;
      }
    },
    get setCompanyModalViewMode() {
      try {
        return setCompanyModalViewMode;
      } catch {
        return undefined;
      }
    },
    get branchModalViewMode() {
      try {
        return branchModalViewMode;
      } catch {
        return undefined;
      }
    },
    get setBranchModalViewMode() {
      try {
        return setBranchModalViewMode;
      } catch {
        return undefined;
      }
    },
    get subBranchModalViewMode() {
      try {
        return subBranchModalViewMode;
      } catch {
        return undefined;
      }
    },
    get setSubBranchModalViewMode() {
      try {
        return setSubBranchModalViewMode;
      } catch {
        return undefined;
      }
    },
    get editingCompany() {
      try {
        return editingCompany;
      } catch {
        return undefined;
      }
    },
    get setEditingCompany() {
      try {
        return setEditingCompany;
      } catch {
        return undefined;
      }
    },
    get companyTab() {
      try {
        return companyTab;
      } catch {
        return undefined;
      }
    },
    get setCompanyTab() {
      try {
        return setCompanyTab;
      } catch {
        return undefined;
      }
    },
    get companyBankProfileTab() {
      try {
        return companyBankProfileTab;
      } catch {
        return undefined;
      }
    },
    get setCompanyBankProfileTab() {
      try {
        return setCompanyBankProfileTab;
      } catch {
        return undefined;
      }
    },
    get companyBankSubTab() {
      try {
        return companyBankSubTab;
      } catch {
        return undefined;
      }
    },
    get setCompanyBankSubTab() {
      try {
        return setCompanyBankSubTab;
      } catch {
        return undefined;
      }
    },
    get companyPreviewScale() {
      try {
        return companyPreviewScale;
      } catch {
        return undefined;
      }
    },
    get setCompanyPreviewScale() {
      try {
        return setCompanyPreviewScale;
      } catch {
        return undefined;
      }
    },
    get branchPreviewScale() {
      try {
        return branchPreviewScale;
      } catch {
        return undefined;
      }
    },
    get setBranchPreviewScale() {
      try {
        return setBranchPreviewScale;
      } catch {
        return undefined;
      }
    },
    get subBranchPreviewScale() {
      try {
        return subBranchPreviewScale;
      } catch {
        return undefined;
      }
    },
    get setSubBranchPreviewScale() {
      try {
        return setSubBranchPreviewScale;
      } catch {
        return undefined;
      }
    },
    get previewEntityLevel() {
      try {
        return previewEntityLevel;
      } catch {
        return undefined;
      }
    },
    get setPreviewEntityLevel() {
      try {
        return setPreviewEntityLevel;
      } catch {
        return undefined;
      }
    },
    get previewInvoiceType() {
      try {
        return previewInvoiceType;
      } catch {
        return undefined;
      }
    },
    get setPreviewInvoiceType() {
      try {
        return setPreviewInvoiceType;
      } catch {
        return undefined;
      }
    },
    get selectedPreviewBranchId() {
      try {
        return selectedPreviewBranchId;
      } catch {
        return undefined;
      }
    },
    get setSelectedPreviewBranchId() {
      try {
        return setSelectedPreviewBranchId;
      } catch {
        return undefined;
      }
    },
    get companyLogoPos() {
      try {
        return companyLogoPos;
      } catch {
        return undefined;
      }
    },
    get setCompanyLogoPos() {
      try {
        return setCompanyLogoPos;
      } catch {
        return undefined;
      }
    },
    get companySignaturePos() {
      try {
        return companySignaturePos;
      } catch {
        return undefined;
      }
    },
    get setCompanySignaturePos() {
      try {
        return setCompanySignaturePos;
      } catch {
        return undefined;
      }
    },
    get companyStampPos() {
      try {
        return companyStampPos;
      } catch {
        return undefined;
      }
    },
    get setCompanyStampPos() {
      try {
        return setCompanyStampPos;
      } catch {
        return undefined;
      }
    },
    get companyLogoScale() {
      try {
        return companyLogoScale;
      } catch {
        return undefined;
      }
    },
    get setCompanyLogoScale() {
      try {
        return setCompanyLogoScale;
      } catch {
        return undefined;
      }
    },
    get companyStampScale() {
      try {
        return companyStampScale;
      } catch {
        return undefined;
      }
    },
    get setCompanyStampScale() {
      try {
        return setCompanyStampScale;
      } catch {
        return undefined;
      }
    },
    get companySignatureScale() {
      try {
        return companySignatureScale;
      } catch {
        return undefined;
      }
    },
    get setCompanySignatureScale() {
      try {
        return setCompanySignatureScale;
      } catch {
        return undefined;
      }
    },
    get branchLogoPos() {
      try {
        return branchLogoPos;
      } catch {
        return undefined;
      }
    },
    get setBranchLogoPos() {
      try {
        return setBranchLogoPos;
      } catch {
        return undefined;
      }
    },
    get branchSignaturePos() {
      try {
        return branchSignaturePos;
      } catch {
        return undefined;
      }
    },
    get setBranchSignaturePos() {
      try {
        return setBranchSignaturePos;
      } catch {
        return undefined;
      }
    },
    get branchStampPos() {
      try {
        return branchStampPos;
      } catch {
        return undefined;
      }
    },
    get setBranchStampPos() {
      try {
        return setBranchStampPos;
      } catch {
        return undefined;
      }
    },
    get branchLogoScale() {
      try {
        return branchLogoScale;
      } catch {
        return undefined;
      }
    },
    get setBranchLogoScale() {
      try {
        return setBranchLogoScale;
      } catch {
        return undefined;
      }
    },
    get branchStampScale() {
      try {
        return branchStampScale;
      } catch {
        return undefined;
      }
    },
    get setBranchStampScale() {
      try {
        return setBranchStampScale;
      } catch {
        return undefined;
      }
    },
    get branchSignatureScale() {
      try {
        return branchSignatureScale;
      } catch {
        return undefined;
      }
    },
    get setBranchSignatureScale() {
      try {
        return setBranchSignatureScale;
      } catch {
        return undefined;
      }
    },
    get subBranchLogoPos() {
      try {
        return subBranchLogoPos;
      } catch {
        return undefined;
      }
    },
    get setSubBranchLogoPos() {
      try {
        return setSubBranchLogoPos;
      } catch {
        return undefined;
      }
    },
    get subBranchSignaturePos() {
      try {
        return subBranchSignaturePos;
      } catch {
        return undefined;
      }
    },
    get setSubBranchSignaturePos() {
      try {
        return setSubBranchSignaturePos;
      } catch {
        return undefined;
      }
    },
    get subBranchStampPos() {
      try {
        return subBranchStampPos;
      } catch {
        return undefined;
      }
    },
    get setSubBranchStampPos() {
      try {
        return setSubBranchStampPos;
      } catch {
        return undefined;
      }
    },
    get subBranchLogoScale() {
      try {
        return subBranchLogoScale;
      } catch {
        return undefined;
      }
    },
    get setSubBranchLogoScale() {
      try {
        return setSubBranchLogoScale;
      } catch {
        return undefined;
      }
    },
    get subBranchStampScale() {
      try {
        return subBranchStampScale;
      } catch {
        return undefined;
      }
    },
    get setSubBranchStampScale() {
      try {
        return setSubBranchStampScale;
      } catch {
        return undefined;
      }
    },
    get subBranchSignatureScale() {
      try {
        return subBranchSignatureScale;
      } catch {
        return undefined;
      }
    },
    get setSubBranchSignatureScale() {
      try {
        return setSubBranchSignatureScale;
      } catch {
        return undefined;
      }
    },
    get companyZoom() {
      try {
        return companyZoom;
      } catch {
        return undefined;
      }
    },
    get setCompanyZoom() {
      try {
        return setCompanyZoom;
      } catch {
        return undefined;
      }
    },
    get branchZoom() {
      try {
        return branchZoom;
      } catch {
        return undefined;
      }
    },
    get setBranchZoom() {
      try {
        return setBranchZoom;
      } catch {
        return undefined;
      }
    },
    get subBranchZoom() {
      try {
        return subBranchZoom;
      } catch {
        return undefined;
      }
    },
    get setSubBranchZoom() {
      try {
        return setSubBranchZoom;
      } catch {
        return undefined;
      }
    },
    get companyCustomStamps() {
      try {
        return companyCustomStamps;
      } catch {
        return undefined;
      }
    },
    get setCompanyCustomStamps() {
      try {
        return setCompanyCustomStamps;
      } catch {
        return undefined;
      }
    },
    get branchCustomStamps() {
      try {
        return branchCustomStamps;
      } catch {
        return undefined;
      }
    },
    get setBranchCustomStamps() {
      try {
        return setBranchCustomStamps;
      } catch {
        return undefined;
      }
    },
    get subBranchCustomStamps() {
      try {
        return subBranchCustomStamps;
      } catch {
        return undefined;
      }
    },
    get setSubBranchCustomStamps() {
      try {
        return setSubBranchCustomStamps;
      } catch {
        return undefined;
      }
    },
    get addCustomStampTo() {
      try {
        return addCustomStampTo;
      } catch {
        return undefined;
      }
    },
    get activePreviewDocModal() {
      try {
        return activePreviewDocModal;
      } catch {
        return undefined;
      }
    },
    get setActivePreviewDocModal() {
      try {
        return setActivePreviewDocModal;
      } catch {
        return undefined;
      }
    },
    get companyForm() {
      try {
        return companyForm;
      } catch {
        return undefined;
      }
    },
    get setCompanyForm() {
      try {
        return setCompanyForm;
      } catch {
        return undefined;
      }
    },
    get showBranchModal() {
      try {
        return showBranchModal;
      } catch {
        return undefined;
      }
    },
    get setShowBranchModal() {
      try {
        return setShowBranchModal;
      } catch {
        return undefined;
      }
    },
    get editingBranch() {
      try {
        return editingBranch;
      } catch {
        return undefined;
      }
    },
    get setEditingBranch() {
      try {
        return setEditingBranch;
      } catch {
        return undefined;
      }
    },
    get branchCompanyId() {
      try {
        return branchCompanyId;
      } catch {
        return undefined;
      }
    },
    get setBranchCompanyId() {
      try {
        return setBranchCompanyId;
      } catch {
        return undefined;
      }
    },
    get branchTab() {
      try {
        return branchTab;
      } catch {
        return undefined;
      }
    },
    get setBranchTab() {
      try {
        return setBranchTab;
      } catch {
        return undefined;
      }
    },
    get branchBankProfileTab() {
      try {
        return branchBankProfileTab;
      } catch {
        return undefined;
      }
    },
    get setBranchBankProfileTab() {
      try {
        return setBranchBankProfileTab;
      } catch {
        return undefined;
      }
    },
    get branchCopiedNotice() {
      try {
        return branchCopiedNotice;
      } catch {
        return undefined;
      }
    },
    get setBranchCopiedNotice() {
      try {
        return setBranchCopiedNotice;
      } catch {
        return undefined;
      }
    },
    get branchForm() {
      try {
        return branchForm;
      } catch {
        return undefined;
      }
    },
    get setBranchForm() {
      try {
        return setBranchForm;
      } catch {
        return undefined;
      }
    },
    get showSubBranchModal() {
      try {
        return showSubBranchModal;
      } catch {
        return undefined;
      }
    },
    get setShowSubBranchModal() {
      try {
        return setShowSubBranchModal;
      } catch {
        return undefined;
      }
    },
    get editingSubBranch() {
      try {
        return editingSubBranch;
      } catch {
        return undefined;
      }
    },
    get setEditingSubBranch() {
      try {
        return setEditingSubBranch;
      } catch {
        return undefined;
      }
    },
    get subBranchBranchId() {
      try {
        return subBranchBranchId;
      } catch {
        return undefined;
      }
    },
    get setSubBranchBranchId() {
      try {
        return setSubBranchBranchId;
      } catch {
        return undefined;
      }
    },
    get subBranchCompanyId() {
      try {
        return subBranchCompanyId;
      } catch {
        return undefined;
      }
    },
    get setSubBranchCompanyId() {
      try {
        return setSubBranchCompanyId;
      } catch {
        return undefined;
      }
    },
    get subBranchTab() {
      try {
        return subBranchTab;
      } catch {
        return undefined;
      }
    },
    get setSubBranchTab() {
      try {
        return setSubBranchTab;
      } catch {
        return undefined;
      }
    },
    get subBranchBankProfileTab() {
      try {
        return subBranchBankProfileTab;
      } catch {
        return undefined;
      }
    },
    get setSubBranchBankProfileTab() {
      try {
        return setSubBranchBankProfileTab;
      } catch {
        return undefined;
      }
    },
    get subBranchCopiedNotice() {
      try {
        return subBranchCopiedNotice;
      } catch {
        return undefined;
      }
    },
    get setSubBranchCopiedNotice() {
      try {
        return setSubBranchCopiedNotice;
      } catch {
        return undefined;
      }
    },
    get subBranchForm() {
      try {
        return subBranchForm;
      } catch {
        return undefined;
      }
    },
    get setSubBranchForm() {
      try {
        return setSubBranchForm;
      } catch {
        return undefined;
      }
    },
    get allUsers() {
      try {
        return allUsers;
      } catch {
        return undefined;
      }
    },
    get setAllUsers() {
      try {
        return setAllUsers;
      } catch {
        return undefined;
      }
    },
    get showDeleteConfirm() {
      try {
        return showDeleteConfirm;
      } catch {
        return undefined;
      }
    },
    get setShowDeleteConfirm() {
      try {
        return setShowDeleteConfirm;
      } catch {
        return undefined;
      }
    },
    get deleteTarget() {
      try {
        return deleteTarget;
      } catch {
        return undefined;
      }
    },
    get setDeleteTarget() {
      try {
        return setDeleteTarget;
      } catch {
        return undefined;
      }
    },
    get saving() {
      try {
        return saving;
      } catch {
        return undefined;
      }
    },
    get setSaving() {
      try {
        return setSaving;
      } catch {
        return undefined;
      }
    },
    get generateSlug() {
      try {
        return generateSlug;
      } catch {
        return undefined;
      }
    },
    get loadData() {
      try {
        return loadData;
      } catch {
        return undefined;
      }
    },
    get toggleCompanyExpand() {
      try {
        return toggleCompanyExpand;
      } catch {
        return undefined;
      }
    },
    get toggleBranchExpand() {
      try {
        return toggleBranchExpand;
      } catch {
        return undefined;
      }
    },
    get getBranchesForCompany() {
      try {
        return getBranchesForCompany;
      } catch {
        return undefined;
      }
    },
    get getSubBranchesForBranch() {
      try {
        return getSubBranchesForBranch;
      } catch {
        return undefined;
      }
    },
    get getUserCountForCompany() {
      try {
        return getUserCountForCompany;
      } catch {
        return undefined;
      }
    },
    get filteredCompanies() {
      try {
        return filteredCompanies;
      } catch {
        return undefined;
      }
    },
    get openAddCompany() {
      try {
        return openAddCompany;
      } catch {
        return undefined;
      }
    },
    get openEditCompany() {
      try {
        return openEditCompany;
      } catch {
        return undefined;
      }
    },
    get previewSaveSuccess() {
      try {
        return previewSaveSuccess;
      } catch {
        return undefined;
      }
    },
    get setPreviewSaveSuccess() {
      try {
        return setPreviewSaveSuccess;
      } catch {
        return undefined;
      }
    },
    get saveCompany() {
      try {
        return saveCompany;
      } catch {
        return undefined;
      }
    },
    get openAddBranch() {
      try {
        return openAddBranch;
      } catch {
        return undefined;
      }
    },
    get openEditBranch() {
      try {
        return openEditBranch;
      } catch {
        return undefined;
      }
    },
    get handleCopyBranchGstToNongst() {
      try {
        return handleCopyBranchGstToNongst;
      } catch {
        return undefined;
      }
    },
    get handleCopyCompanyDetailsToBranch() {
      try {
        return handleCopyCompanyDetailsToBranch;
      } catch {
        return undefined;
      }
    },
    get branchPreviewSaveSuccess() {
      try {
        return branchPreviewSaveSuccess;
      } catch {
        return undefined;
      }
    },
    get setBranchPreviewSaveSuccess() {
      try {
        return setBranchPreviewSaveSuccess;
      } catch {
        return undefined;
      }
    },
    get resolveNumericCompId() {
      try {
        return resolveNumericCompId;
      } catch {
        return undefined;
      }
    },
    get saveBranch() {
      try {
        return saveBranch;
      } catch {
        return undefined;
      }
    },
    get openAddSubBranch() {
      try {
        return openAddSubBranch;
      } catch {
        return undefined;
      }
    },
    get openEditSubBranch() {
      try {
        return openEditSubBranch;
      } catch {
        return undefined;
      }
    },
    get handleCopySubBranchGstToNongst() {
      try {
        return handleCopySubBranchGstToNongst;
      } catch {
        return undefined;
      }
    },
    get handleCopyCompanyDetailsToSubBranch() {
      try {
        return handleCopyCompanyDetailsToSubBranch;
      } catch {
        return undefined;
      }
    },
    get subBranchPreviewSaveSuccess() {
      try {
        return subBranchPreviewSaveSuccess;
      } catch {
        return undefined;
      }
    },
    get setSubBranchPreviewSaveSuccess() {
      try {
        return setSubBranchPreviewSaveSuccess;
      } catch {
        return undefined;
      }
    },
    get saveSubBranch() {
      try {
        return saveSubBranch;
      } catch {
        return undefined;
      }
    },
    get confirmDelete() {
      try {
        return confirmDelete;
      } catch {
        return undefined;
      }
    },
    get executeDelete() {
      try {
        return executeDelete;
      } catch {
        return undefined;
      }
    },
  };
  const __ctrlRef = React.useRef<any>(__ctrl);
  __ctrlRef.current = __ctrl;

  const { user, fetchCompanies, activeCompanyId } = useAuthStore();
  const isSuperAdmin =
    user?.role === "Super Admin" ||
    (user as any)?.role_id === 1 ||
    user?.email === "saampark.official@gmail.com";

  const userAssignedComps = React.useMemo(() => {
    if (!user) return [];
    const comps = [
      ...(Array.isArray((user as any)?.companyIds)
        ? (user as any).companyIds
        : []),
      (user as any)?.companyId,
      (user as any)?.company_id,
    ]
      .filter(Boolean)
      .map((id: any) => String(id).toLowerCase().trim());
    return Array.from(new Set(comps));
  }, [user]);

  const [companies, setCompanies] =
    React.useState<Company[]>(CANONICAL_COMPANIES);
  const [branches, setBranches] = React.useState<Branch[]>([]);
  const [subBranches, setSubBranches] = React.useState<SubBranch[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [searchQuery, setSearchQuery] = React.useState("");
  const [industryFilter, setIndustryFilter] = React.useState("");
  const [expandedCompanies, setExpandedCompanies] = React.useState<Set<string>>(
    new Set(["tech", "digital", "saampark-ai-solutions"]),
  );
  const [expandedBranches, setExpandedBranches] = React.useState<Set<string>>(
    new Set(),
  );

  // Modal states & Split-Screen View Modes
  const [showCompanyModal, setShowCompanyModal] = React.useState(false);
  const [companyModalViewMode, setCompanyModalViewMode] = React.useState<
    "split" | "form" | "preview"
  >("split");
  const [branchModalViewMode, setBranchModalViewMode] = React.useState<
    "split" | "form" | "preview"
  >("split");
  const [subBranchModalViewMode, setSubBranchModalViewMode] = React.useState<
    "split" | "form" | "preview"
  >("split");
  const [editingCompany, setEditingCompany] = React.useState<Company | null>(
    null,
  );
  const [companyTab, setCompanyTab] = React.useState<
    "identity" | "tax" | "contact" | "branding" | "signatory" | "bank" | "terms"
  >("identity");
  const [companyBankProfileTab, setCompanyBankProfileTab] = React.useState<
    "gst" | "nongst"
  >("gst");
  const [companyBankSubTab, setCompanyBankSubTab] = React.useState<
    "gst" | "nongst"
  >("gst");
  const [companyPreviewScale, setCompanyPreviewScale] = React.useState<
    "fit" | "normal" | "large"
  >("fit");
  const [branchPreviewScale, setBranchPreviewScale] = React.useState<
    "fit" | "normal" | "large"
  >("fit");
  const [subBranchPreviewScale, setSubBranchPreviewScale] = React.useState<
    "fit" | "normal" | "large"
  >("fit");
  const [previewEntityLevel, setPreviewEntityLevel] = React.useState<
    "company" | "branch" | "subbranch"
  >("company");
  const [previewInvoiceType, setPreviewInvoiceType] = React.useState<
    "gst" | "nongst"
  >("gst");
  const [selectedPreviewBranchId, setSelectedPreviewBranchId] =
    React.useState<string>("");
  const [companyLogoPos, setCompanyLogoPos] = React.useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });
  const [companySignaturePos, setCompanySignaturePos] = React.useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });
  const [companyStampPos, setCompanyStampPos] = React.useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });
  const [companyLogoScale, setCompanyLogoScale] = React.useState<number>(1);
  const [companyStampScale, setCompanyStampScale] = React.useState<number>(1);
  const [companySignatureScale, setCompanySignatureScale] =
    React.useState<number>(1);
  const [branchLogoPos, setBranchLogoPos] = React.useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });
  const [branchSignaturePos, setBranchSignaturePos] = React.useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });
  const [branchStampPos, setBranchStampPos] = React.useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });
  const [branchLogoScale, setBranchLogoScale] = React.useState<number>(1);
  const [branchStampScale, setBranchStampScale] = React.useState<number>(1);
  const [branchSignatureScale, setBranchSignatureScale] =
    React.useState<number>(1);
  const [subBranchLogoPos, setSubBranchLogoPos] = React.useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });
  const [subBranchSignaturePos, setSubBranchSignaturePos] = React.useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });
  const [subBranchStampPos, setSubBranchStampPos] = React.useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });
  const [subBranchLogoScale, setSubBranchLogoScale] = React.useState<number>(1);
  const [subBranchStampScale, setSubBranchStampScale] =
    React.useState<number>(1);
  const [subBranchSignatureScale, setSubBranchSignatureScale] =
    React.useState<number>(1);
  const [companyZoom, setCompanyZoom] = React.useState<number>(100);
  const [branchZoom, setBranchZoom] = React.useState<number>(100);
  const [subBranchZoom, setSubBranchZoom] = React.useState<number>(100);
  const [companyCustomStamps, setCompanyCustomStamps] = React.useState<
    CustomTextStamp[]
  >([]);
  const [branchCustomStamps, setBranchCustomStamps] = React.useState<
    CustomTextStamp[]
  >([]);
  const [subBranchCustomStamps, setSubBranchCustomStamps] = React.useState<
    CustomTextStamp[]
  >([]);

  const addCustomStampTo = (
    setStamps: React.Dispatch<React.SetStateAction<CustomTextStamp[]>>,
    text = "OFFICIAL COPY",
    color = "#0d9488",
    bgStyle: "stamp" | "badge" | "clean" | "watermark" = "stamp",
  ) => {
    const newStamp: CustomTextStamp = {
      id: `stamp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      text,
      color,
      bgStyle,
      fontSize: 12,
      isBold: true,
      isItalic: false,
      rotation: bgStyle === "stamp" ? -12 : 0,
      x: Math.floor(Math.random() * 40) - 20,
      y: Math.floor(Math.random() * 40) - 20,
    };
    setStamps((prev) => [...prev, newStamp]);
  };

  const [activePreviewDocModal, setActivePreviewDocModal] = React.useState<{
    isOpen: boolean;
    entityType: "company" | "branch" | "subbranch";
    companyData?: any;
    branchData?: any;
    subBranchData?: any;
  } | null>(null);

  const [companyForm, setCompanyForm] = React.useState({
    name: "",
    brand_name: "",
    division_name: "",
    subtitle: "",
    slug: "",
    trademark_symbol: "",
    industry: "Technology",
    currency: "INR",
    logo_url: "",
    gstin: "",
    pan: "",
    cin: "",
    msme_reg: "",
    iso_certification: "An ISO 9001:2015 Certified Company",
    signatory_name: "",
    signatory_designation: "",
    signature_image_url: "",
    stamp_image_url: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "India",
    phone: "",
    email: "",
    website: "",
    bank_name: "",
    account_holder: "",
    account_number: "",
    ifsc_code: "",
    bank_branch: "",
    upi_id: "",
    payment_qr_url: "",
    gst_bank_name: "",
    gst_account_holder: "",
    gst_account_number: "",
    gst_ifsc_code: "",
    gst_bank_branch: "",
    gst_upi_id: "",
    gst_payment_qr_url: "",
    nongst_bank_name: "",
    nongst_account_holder: "",
    nongst_account_number: "",
    nongst_ifsc_code: "",
    nongst_bank_branch: "",
    nongst_upi_id: "",
    nongst_payment_qr_url: "",
    terms_conditions: "",
    invoice_notes: "",
    quotation_notes: "",
    bottom_footer_text: "",
    status: "active",
  });

  const [showBranchModal, setShowBranchModal] = React.useState(false);
  const [editingBranch, setEditingBranch] = React.useState<Branch | null>(null);
  const [branchCompanyId, setBranchCompanyId] = React.useState("");
  const [branchTab, setBranchTab] = React.useState<
    "basic" | "tax" | "stamp" | "bank" | "terms" | "preview"
  >("basic");
  const [branchBankProfileTab, setBranchBankProfileTab] = React.useState<
    "gst" | "nongst"
  >("gst");
  const [branchCopiedNotice, setBranchCopiedNotice] = React.useState(false);
  const [branchForm, setBranchForm] = React.useState({
    name: "",
    code: "",
    brand_name: "",
    division_name: "",
    subtitle: "",
    logo_url: "",
    payment_qr_url: "",
    gstin: "",
    pan: "",
    cin: "",
    msme_reg: "",
    iso_certification: "",
    signatory_name: "",
    signatory_designation: "",
    signature_image_url: "",
    stamp_image_url: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "India",
    phone: "",
    email: "",
    managerName: "",
    managerPhone: "",
    bank_name: "",
    account_holder: "",
    account_number: "",
    ifsc_code: "",
    bank_branch: "",
    upi_id: "",
    gst_bank_name: "",
    gst_account_holder: "",
    gst_account_number: "",
    gst_ifsc_code: "",
    gst_bank_branch: "",
    gst_upi_id: "",
    gst_payment_qr_url: "",
    nongst_bank_name: "",
    nongst_account_holder: "",
    nongst_account_number: "",
    nongst_ifsc_code: "",
    nongst_bank_branch: "",
    nongst_upi_id: "",
    nongst_payment_qr_url: "",
    terms_conditions: "",
    invoice_notes: "",
    status: "active",
  });

  const [showSubBranchModal, setShowSubBranchModal] = React.useState(false);
  const [editingSubBranch, setEditingSubBranch] =
    React.useState<SubBranch | null>(null);
  const [subBranchBranchId, setSubBranchBranchId] = React.useState("");
  const [subBranchCompanyId, setSubBranchCompanyId] = React.useState("");
  const [subBranchTab, setSubBranchTab] = React.useState<
    "partner" | "location" | "stamp" | "bank" | "terms" | "preview"
  >("partner");
  const [subBranchBankProfileTab, setSubBranchBankProfileTab] = React.useState<
    "gst" | "nongst"
  >("gst");
  const [subBranchCopiedNotice, setSubBranchCopiedNotice] =
    React.useState(false);
  const [subBranchForm, setSubBranchForm] = React.useState({
    name: "",
    code: "",
    partner_name: "",
    partner_phone: "",
    partner_email: "",
    revenue_share_pct: 0,
    partner_type: "Individual",
    address: "",
    city: "",
    state: "",
    phone: "",
    email: "",
    gstin: "",
    pan: "",
    cin: "",
    msme_reg: "",
    subtitle: "",
    iso_certification: "",
    // Fallback Banking
    bank_name: "",
    account_holder: "",
    account_number: "",
    ifsc_code: "",
    bank_branch: "",
    upi_id: "",
    payment_qr_url: "",
    // GST Banking Profile
    gst_bank_name: "",
    gst_account_holder: "",
    gst_account_number: "",
    gst_ifsc_code: "",
    gst_bank_branch: "",
    gst_upi_id: "",
    gst_payment_qr_url: "",
    // Non-GST Banking Profile
    nongst_bank_name: "",
    nongst_account_holder: "",
    nongst_account_number: "",
    nongst_ifsc_code: "",
    nongst_bank_branch: "",
    nongst_upi_id: "",
    nongst_payment_qr_url: "",
    logo_url: "",
    signature_image_url: "",
    stamp_image_url: "",
    signatory_name: "Partner Signatory",
    signatory_designation: "Franchise Partner",
    terms_conditions: "",
    invoice_notes: "",
    status: "active",
  });

  const [allUsers, setAllUsers] = React.useState<any[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<{
    type: "company" | "branch" | "sub_branch";
    id: string;
  } | null>(null);
  const [saving, setSaving] = React.useState(false);

  const generateSlug = (name: string) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const loadData: any = React.useMemo(
    () => createCompaniesAction20(() => __ctrlRef.current),
    [activeCompanyId, isSuperAdmin, userAssignedComps, user],
  );

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleCompanyExpand = (companyId: string) => {
    setExpandedCompanies((prev) => {
      const next = new Set(prev);
      next.has(companyId) ? next.delete(companyId) : next.add(companyId);
      return next;
    });
  };

  const toggleBranchExpand = (branchId: string) => {
    setExpandedBranches((prev) => {
      const next = new Set(prev);
      next.has(branchId) ? next.delete(branchId) : next.add(branchId);
      return next;
    });
  };

  const getBranchesForCompany = (companyId: string) => {
    const comp = companies.find((c) => isMatchingCompany(c, companyId));
    if (!comp) return [];
    return branches.filter((b) => {
      if (isBranchDeleted(b.id, b.code, b.name)) return false;
      const bComp = b.company_id || (b as any).companyId;
      return isMatchingCompany(comp, bComp);
    });
  };

  const getSubBranchesForBranch = (branchId: string | number) => {
    return subBranches.filter((sb) => {
      const sbBranch =
        sb.branch_id || (sb as any).branchId || (sb as any).parentBranchId;
      return String(sbBranch) === String(branchId);
    });
  };
  const getUserCountForCompany = (compInput: string | Company) => {
    const targetComp =
      typeof compInput === "object" && compInput !== null
        ? compInput
        : companies.find((c) => isMatchingCompany(c, compInput)) || {
            id: compInput,
            slug: compInput,
          };

    return (allUsers || []).filter((u) => {
      const uCompId = u.company_id || u.companyId;
      if (uCompId && isMatchingCompany(targetComp, uCompId)) return true;
      if (Array.isArray(u.companyIds)) {
        return u.companyIds.some((id: any) =>
          isMatchingCompany(targetComp, id),
        );
      }
      return false;
    }).length;
  };

  const filteredCompanies = React.useMemo(() => {
    return companies.filter((c) => {
      // 1. Role Scope Restriction: Non-Super-Admins can ONLY see their assigned company
      if (!isSuperAdmin) {
        if (userAssignedComps.length > 0) {
          const isAssigned = userAssignedComps.some((target) =>
            isMatchingCompany(c, target),
          );
          if (!isAssigned) return false;
        } else {
          const uComp = (user as any)?.companyId || (user as any)?.company_id;
          if (uComp && !isMatchingCompany(c, uComp)) return false;
          if (!uComp) return false;
        }
      }

      // 2. Active Company Filter (from Topbar switcher):
      // When activeCompanyId is set to a specific company (not "all"), ONLY show that company!
      if (activeCompanyId && activeCompanyId !== "all") {
        if (!isMatchingCompany(c, activeCompanyId)) return false;
      }

      // 3. Search & Industry Filters
      const matchesSearch =
        !searchQuery ||
        c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.slug?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesIndustry = !industryFilter || c.industry === industryFilter;
      return matchesSearch && matchesIndustry;
    });
  }, [
    companies,
    searchQuery,
    industryFilter,
    isSuperAdmin,
    userAssignedComps,
    activeCompanyId,
    user,
  ]);

  // ── COMPANY MODAL OPENERS ──────────────────────────────────────────────────
  const openAddCompany = () => {
    setEditingCompany(null);
    setCompanyTab("identity");
    setCompanyBankSubTab("gst");
    setCompanyLogoPos({ x: 0, y: 0 });
    setCompanySignaturePos({ x: 0, y: 0 });
    setCompanyStampPos({ x: 0, y: 0 });
    setCompanyLogoScale(1);
    setCompanyStampScale(1);
    setCompanySignatureScale(1);
    setCompanyCustomStamps([]);
    setCompanyZoom(100);
    setPreviewInvoiceType("gst");
    setCompanyForm({
      name: "",
      brand_name: "SAAMPARK",
      division_name: "",
      subtitle: "",
      slug: "",
      trademark_symbol: "",
      industry: "Technology",
      currency: "INR",
      logo_url: "",
      gstin: "",
      pan: "",
      cin: "",
      msme_reg: "",
      iso_certification: "An ISO 9001:2015 Certified Company",
      signatory_name: "Authorized Signatory",
      signatory_designation: "Managing Director",
      signature_image_url: "",
      stamp_image_url: "",
      address: "",
      city: "Kolkata",
      state: "West Bengal",
      zip: "",
      country: "India",
      phone: "",
      email: "",
      website: "",
      bank_name: "",
      account_holder: "",
      account_number: "",
      ifsc_code: "",
      bank_branch: "",
      upi_id: "",
      payment_qr_url: "",
      gst_bank_name: "",
      gst_account_holder: "",
      gst_account_number: "",
      gst_ifsc_code: "",
      gst_bank_branch: "",
      gst_upi_id: "",
      gst_payment_qr_url: "",
      nongst_bank_name: "",
      nongst_account_holder: "",
      nongst_account_number: "",
      nongst_ifsc_code: "",
      nongst_bank_branch: "",
      nongst_upi_id: "",
      nongst_payment_qr_url: "",
      terms_conditions:
        "1. All disputes subject to local jurisdiction only.\n2. Goods/Services once delivered are non-refundable.\n3. Disputed items must be notified within 7 business days.",
      invoice_notes:
        "Thank you for partnering with us. Please remit payment according to the stated terms.",
      quotation_notes:
        "This quotation is valid for 30 calendar days from the date of issuance.",
      bottom_footer_text: "",
      status: "active",
    });
    setShowCompanyModal(true);
  };

  const openEditCompany: any = React.useMemo(
    () => createCompaniesAction21(() => __ctrlRef.current),
    [],
  );

  const [previewSaveSuccess, setPreviewSaveSuccess] = React.useState(false);

  const saveCompany: any = React.useMemo(
    () => createCompaniesHandler1(() => __ctrlRef.current),
    [],
  );

  // ── BRANCH MODAL OPENERS ───────────────────────────────────────────────────
  const openAddBranch: any = React.useMemo(
    () => createCompaniesAction22(() => __ctrlRef.current),
    [],
  );

  const openEditBranch: any = React.useMemo(
    () => createCompaniesAction23(() => __ctrlRef.current),
    [],
  );

  const handleCopyBranchGstToNongst = () => {
    setBranchForm((prev) => ({
      ...prev,
      nongst_bank_name: prev.gst_bank_name || prev.bank_name,
      nongst_account_holder: prev.gst_account_holder || prev.account_holder,
      nongst_account_number: prev.gst_account_number || prev.account_number,
      nongst_ifsc_code: prev.gst_ifsc_code || prev.ifsc_code,
      nongst_bank_branch: prev.gst_bank_branch || prev.bank_branch,
      nongst_upi_id: prev.gst_upi_id || prev.upi_id,
      nongst_payment_qr_url: prev.gst_payment_qr_url || prev.payment_qr_url,
    }));
  };

  const handleCopyCompanyDetailsToBranch: any = React.useMemo(
    () => createCompaniesAction24(() => __ctrlRef.current),
    [],
  );

  const [branchPreviewSaveSuccess, setBranchPreviewSaveSuccess] =
    React.useState(false);

  const resolveNumericCompId = (c?: any, fallback?: any): number => {
    const s = String(c?.numeric_id || c?.id || c?.slug || fallback || "")
      .toLowerCase()
      .trim();
    if (
      s === "2" ||
      s === "consultancy" ||
      s.includes("consult") ||
      s === "digital" ||
      s === "print"
    )
      return 2;
    return 1;
  };

  const saveBranch: any = React.useMemo(
    () => createCompaniesHandler2(() => __ctrlRef.current),
    [],
  );

  // ── SUB-BRANCH MODAL OPENERS ───────────────────────────────────────────────
  const openAddSubBranch: any = React.useMemo(
    () => createCompaniesAction25(() => __ctrlRef.current),
    [],
  );

  const openEditSubBranch: any = React.useMemo(
    () => createCompaniesAction26(() => __ctrlRef.current),
    [],
  );

  const handleCopySubBranchGstToNongst = () => {
    setSubBranchForm((prev) => ({
      ...prev,
      nongst_bank_name: prev.gst_bank_name || prev.bank_name,
      nongst_account_holder: prev.gst_account_holder || prev.account_holder,
      nongst_account_number: prev.gst_account_number || prev.account_number,
      nongst_ifsc_code: prev.gst_ifsc_code || prev.ifsc_code,
      nongst_bank_branch: prev.gst_bank_branch || prev.bank_branch,
      nongst_upi_id: prev.gst_upi_id || prev.upi_id,
      nongst_payment_qr_url: prev.gst_payment_qr_url || prev.payment_qr_url,
    }));
  };

  const handleCopyCompanyDetailsToSubBranch: any = React.useMemo(
    () => createCompaniesAction27(() => __ctrlRef.current),
    [],
  );

  const [subBranchPreviewSaveSuccess, setSubBranchPreviewSaveSuccess] =
    React.useState(false);

  const saveSubBranch: any = React.useMemo(
    () => createCompaniesHandler3(() => __ctrlRef.current),
    [],
  );

  // ── DELETE HANDLER ─────────────────────────────────────────────────────────
  const confirmDelete = (
    type: "company" | "branch" | "sub_branch",
    id: string,
  ) => {
    if (type === "company") {
      alert(
        "Company deletion is disabled. The CRM operates strictly with SAAMPARK Technology and Saampark Consultancy.",
      );
      return;
    }
    if (type === "branch") {
      alert(
        "Branches cannot be deleted once created. They can only be edited or updated.",
      );
      return;
    }
    if (!isSuperAdmin) {
      alert("Permission denied: Only Super Admin can delete records.");
      return;
    }
    setDeleteTarget({ type, id });
    setShowDeleteConfirm(true);
  };

  const executeDelete: any = React.useMemo(
    () => createCompaniesHandler4(() => __ctrlRef.current),
    [],
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground text-xs">
          Loading company hierarchy...
        </p>
      </div>
    );
  }

  __ctrlRef.current = __ctrl;
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-4 sm:p-6">
      <CompaniesSection4 ctrl={__ctrl} />
      <AnimatePresence>
        <CompaniesSection1 ctrl={__ctrl} />
      </AnimatePresence>

      {/* ── UPGRADED BRANCH MODAL (SPLIT-SCREEN STUDIO) ────────────── */}
      <AnimatePresence>
        <CompaniesSection2 ctrl={__ctrl} />
      </AnimatePresence>

      {/* ── UPGRADED SUB-BRANCH (% SHARE) MODAL (SPLIT-SCREEN STUDIO) ─── */}
      <AnimatePresence>
        <CompaniesSection3 ctrl={__ctrl} />
      </AnimatePresence>

      {/* DELETE CONFIRMATION */}
      <AnimatePresence>
        {showDeleteConfirm && deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface rounded-2xl border border-border shadow-2xl w-full max-w-sm p-6 space-y-4 text-xs"
            >
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-3" />
                <h2 className="text-sm font-bold text-foreground mb-1">
                  Delete{" "}
                  {deleteTarget.type === "company"
                    ? "Company"
                    : deleteTarget.type === "branch"
                      ? "Branch"
                      : "Sub-Branch"}
                </h2>
                <p className="text-muted-foreground">
                  Are you sure you want to permanently delete this{" "}
                  {deleteTarget.type.replace("_", " ")}? All associated records
                  will be cleanly removed.
                </p>
                <div className="flex items-center justify-center gap-2 mt-5">
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    onClick={executeDelete}
                    disabled={saving}
                  >
                    {saving && (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    )}
                    Delete
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
