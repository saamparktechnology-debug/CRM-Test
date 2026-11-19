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
} from "@/features/companies/services/companyService";
import { Company, Branch, SubBranch } from "@/features/companies/types";
import { useActionFeedbackStore } from "@/store/useActionFeedbackStore";
import { getErrorMessage } from "@/lib/responseHandler";
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

export function createCompaniesHandler2(getCtrl: () => any) {
  return (...__args: any[]) => {
    const {
      branchForm,
      setSaving,
      companies,
      branchCompanyId,
      resolveNumericCompId,
      branchSignaturePos,
      branchStampPos,
      branchLogoScale,
      branchStampScale,
      branchSignatureScale,
      branchCustomStamps,
      branchZoom,
      previewInvoiceType,
      editingBranch,
      setEditingBranch,
      setBranches,
      setBranchPreviewSaveSuccess,
      setShowBranchModal,
      setExpandedCompanies,
    } = getCtrl();
    const __fn: any = async (keepModalOpen = false) => {
      const cleanBranchName = cleanStr(branchForm.name);
      if (!cleanBranchName) return;
      setSaving(true);
      try {
        const curComp = companies.find((c: any) =>
          isMatchingCompany(c, branchCompanyId),
        );
        const resolvedCompNumeric = resolveNumericCompId(
          curComp,
          branchCompanyId,
        );
        const resolvedCompSlug =
          curComp?.slug || (resolvedCompNumeric === 2 ? "consultancy" : "tech");

        const payload: any = {
          ...branchForm,
          name: cleanBranchName,
          code:
            cleanUpper(branchForm.code) ||
            `BR-${Math.floor(100 + Math.random() * 900)}`,
          companyId: resolvedCompSlug,
          company_id: resolvedCompNumeric,
          signature_position: branchSignaturePos,
          stamp_position: branchStampPos,
          logo_scale: branchLogoScale,
          stamp_scale: branchStampScale,
          signature_scale: branchSignatureScale,
          custom_stamps: branchCustomStamps,
          zoom: branchZoom,
          preview_invoice_type: previewInvoiceType,
          // Base fallback banking
          bank_name: cleanStr(
            branchForm.gst_bank_name ||
              branchForm.bank_name ||
              branchForm.nongst_bank_name,
          ),
          account_holder: cleanStr(
            branchForm.gst_account_holder ||
              branchForm.account_holder ||
              branchForm.nongst_account_holder,
          ),
          account_number: cleanStr(
            branchForm.gst_account_number ||
              branchForm.account_number ||
              branchForm.nongst_account_number,
          ),
          ifsc_code: cleanUpper(
            branchForm.gst_ifsc_code ||
              branchForm.ifsc_code ||
              branchForm.nongst_ifsc_code,
          ),
          bank_branch: cleanStr(
            branchForm.gst_bank_branch ||
              branchForm.bank_branch ||
              branchForm.nongst_bank_branch,
          ),
          upi_id: cleanStr(
            branchForm.gst_upi_id ||
              branchForm.upi_id ||
              branchForm.nongst_upi_id,
          ),
          payment_qr_url:
            branchForm.gst_payment_qr_url ||
            branchForm.payment_qr_url ||
            branchForm.nongst_payment_qr_url ||
            "",
          bankDetails: {
            bankName: cleanStr(
              branchForm.gst_bank_name ||
                branchForm.bank_name ||
                branchForm.nongst_bank_name,
            ),
            accountHolder: cleanStr(
              branchForm.gst_account_holder ||
                branchForm.account_holder ||
                branchForm.nongst_account_holder,
            ),
            accountNumber: cleanStr(
              branchForm.gst_account_number ||
                branchForm.account_number ||
                branchForm.nongst_account_number,
            ),
            ifscCode: cleanUpper(
              branchForm.gst_ifsc_code ||
                branchForm.ifsc_code ||
                branchForm.nongst_ifsc_code,
            ),
            upiId: cleanStr(
              branchForm.gst_upi_id ||
                branchForm.upi_id ||
                branchForm.nongst_upi_id,
            ),
          },
        };

        // Branch saved via PUT/POST without triggering delete endpoint

        const isMatchBranch = (b: any, target: any) => {
          if (!b || !target) return false;
          return String(b.id) === String(target.id);
        };

        // Strictly persist to backend API first — never fabricate local IDs or display frontend-entered data on failure
        let savedBranch: any = null;
        if (editingBranch) {
          const apiRes = await BranchApiService.update(
            String(editingBranch.id),
            payload,
          );
          savedBranch = {
            ...apiRes,
            id: String(apiRes?.id || editingBranch.id),
            company_id: apiRes?.company_id ?? resolvedCompNumeric,
            companyId: resolvedCompSlug,
          };
          setEditingBranch(savedBranch);
          setBranches((prev: any) =>
            prev.map((b: any) =>
              isMatchBranch(b, editingBranch) ? savedBranch : b,
            ),
          );
        } else {
          const apiRes = await BranchApiService.create(
            String(resolvedCompNumeric),
            payload,
          );
          if (!apiRes?.id) {
            throw new Error("Backend did not return a valid branch ID.");
          }
          savedBranch = {
            ...apiRes,
            id: String(apiRes.id),
            company_id: apiRes.company_id ?? resolvedCompNumeric,
            companyId: resolvedCompSlug,
          };
          setBranches((prev: any) => [
            ...prev.filter((b: any) => !isMatchBranch(b, savedBranch)),
            savedBranch,
          ]);
        }

        await useAuthStore.getState().fetchBranches(true);

        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("storage"));
          window.dispatchEvent(new CustomEvent("saampark_data_synced"));
        }

        if (keepModalOpen) {
          setBranchPreviewSaveSuccess(true);
          setTimeout(() => setBranchPreviewSaveSuccess(false), 3000);
        } else {
          setShowBranchModal(false);
          setEditingBranch(null);
        }
        setExpandedCompanies(
          (prev: any) => new Set([...prev, branchCompanyId]),
        );
      } catch (err) {
        console.warn("Error saving branch:", err);
        useActionFeedbackStore.getState().showError({
          title: "Failed to Save Branch",
          message: getErrorMessage(
            err,
            "Failed to save branch. Please check your session and try again.",
          ),
          actionType: "update",
        });
      } finally {
        setSaving(false);
      }
    };
    return __fn(...__args);
  };
}
