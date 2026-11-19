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

export function createCompaniesAction20(getCtrl: () => any) {
  return (...__args: any[]) => {
    const {
      setLoading,
      setError,
      setAllUsers,
      isSuperAdmin,
      userAssignedComps,
      user,
      getUserCountForCompany,
      setCompanies,
      setBranches,
      setSubBranches,
      setExpandedCompanies,
    } = getCtrl();
    const __fn: any = async () => {
      setLoading(true);
      setError(null);
      try {
        const deletedIds = await syncGlobalDeletedIds().catch(() =>
          getLocalDeletedIds(),
        );

        const isCompanyDeleted = (id?: string | number, slug?: string) => {
          if (id && isGlobalItemDeleted(id, deletedIds, "companies"))
            return true;
          if (slug && isGlobalItemDeleted(slug, deletedIds, "companies"))
            return true;
          return false;
        };

        const isSubBranchDeleted = (_id?: string | number, _code?: string) =>
          false;

        const [
          compRes,
          branchRes,
          subBranchRes,
          dbComps,
          dbBranches,
          dbSubBranches,
          dbUsersList,
        ] = await Promise.all([
          CompanyApiService.getAll().catch(() => []),
          BranchApiService.getAll("all").catch(() => []),
          SubBranchApiService.getAll(undefined, "all").catch(() => []),
          fetchModuleDataFromDB<Company[]>("companies", [], "all").catch(
            () => [],
          ),
          fetchModuleDataFromDB<Branch[]>("branches", [], "all").catch(
            () => [],
          ),
          fetchModuleDataFromDB<SubBranch[]>("sub_branches", [], "all").catch(
            () => [],
          ),
          fetchModuleDataFromDB<any[]>("users", [], "all").catch(() => []),
        ]);

        const cleanUsers = (dbUsersList || []).filter(
          (u: any) =>
            !isGlobalItemDeleted(u.id, undefined, "users") &&
            !isGlobalItemDeleted(u.email, undefined, "users"),
        );
        setAllUsers(cleanUsers);

        // 1. Merge Companies: Support all companies dynamically with full retention
        const compMap = new Map<string, Company>();

        // First add baseline canonical companies (Super Admin gets all, Company Admin gets only assigned)
        CANONICAL_COMPANIES.forEach((c) => {
          if (!isSuperAdmin) {
            const isAssigned =
              userAssignedComps.length > 0
                ? userAssignedComps.some((target: any) =>
                    isMatchingCompany(c, target),
                  )
                : isMatchingCompany(
                    c,
                    (user as any)?.companyId || (user as any)?.company_id,
                  );
            if (!isAssigned) return;
          }
          const key = c.slug || c.id;
          compMap.set(key, { ...c });
        });

        // Helper: check if a company is accessible to current user
        const isCompanyAllowed = (c: any): boolean => {
          if (isSuperAdmin) return true;
          if (userAssignedComps.length > 0) {
            return userAssignedComps.some((target: any) =>
              isMatchingCompany(c, target),
            );
          }
          const uComp = (user as any)?.companyId || (user as any)?.company_id;
          return uComp ? isMatchingCompany(c, uComp) : false;
        };

        // Safe merge helper: preserves user-edited values and allows intentional field updates
        const mergeSafe = (target: any, source: any) => {
          if (!source || typeof source !== "object")
            return { ...(target || {}) };
          const res = { ...(target || {}) };
          for (const [k, v] of Object.entries(source)) {
            if (v !== undefined) {
              res[k] = v;
            }
          }
          return res;
        };

        // 2. Overlay persistent storage companies (from app_data)
        if (Array.isArray(dbComps) && dbComps.length > 0) {
          dbComps.forEach((c) => {
            if (!isCompanyDeleted(c.id, c.slug) && isCompanyAllowed(c)) {
              const key = c.slug || String(c.id);
              const prev =
                compMap.get(key) ||
                (c.slug ? compMap.get(c.slug) : undefined) ||
                compMap.get(String(c.id));
              compMap.set(key, mergeSafe(prev, c));
            }
          });
        }

        // 3. Overlay current auth store companies
        const storeComps = useAuthStore.getState().companies;
        if (Array.isArray(storeComps) && storeComps.length > 0) {
          storeComps.forEach((c) => {
            if (!isCompanyDeleted(c.id, c.slug) && isCompanyAllowed(c)) {
              const key = c.slug || String(c.id);
              const prev =
                compMap.get(key) ||
                (c.slug ? compMap.get(c.slug) : undefined) ||
                compMap.get(String(c.id));
              compMap.set(key, mergeSafe(prev, c));
            }
          });
        }

        // 4. HIGHEST PRECEDENCE: Live MySQL Backend API — real database is authoritative for updated fields
        if (Array.isArray(compRes) && compRes.length > 0) {
          compRes.forEach((c) => {
            if (!isCompanyDeleted(c.id, c.slug) && isCompanyAllowed(c)) {
              const key = c.slug || String(c.id);
              const prev =
                compMap.get(key) ||
                (c.slug ? compMap.get(c.slug) : undefined) ||
                compMap.get(String(c.id)) ||
                {};
              const merged: any = { ...prev };
              for (const [k, v] of Object.entries(c)) {
                if (v !== null && v !== undefined) {
                  merged[k] = v;
                }
              }
              if (c.name && String(c.name).trim() !== "") {
                merged.name = c.name;
              }
              compMap.set(key, merged);
            }
          });
        }

        const finalCompanies: Company[] = Array.from(compMap.values()).map(
          (c) => {
            const uCount = getUserCountForCompany(c.id || c.slug || "");
            return {
              ...c,
              member_count: uCount,
              signature_position: c.signature_position || { x: 0, y: 0 },
              stamp_position: c.stamp_position || { x: 0, y: 0 },
              logo_position: c.logo_position || { x: 0, y: 0 },
              logo_scale: c.logo_scale ?? 1,
              stamp_scale: c.stamp_scale ?? 1,
              signature_scale: c.signature_scale ?? 1,
              custom_stamps: Array.isArray(c.custom_stamps)
                ? c.custom_stamps
                : [],
              invoice_customization: c.invoice_customization || {
                hidden_fields: [],
              },
            };
          },
        );
        setCompanies(finalCompanies);

        // 2. Strictly use live MySQL branches from /api/v1/branches (no dummy CANONICAL_BRANCHES or app_data overlay)
        const finalBranches: Branch[] = (
          Array.isArray(branchRes) ? branchRes : []
        )
          .filter((b: any) => b && b.id !== undefined && b.id !== null)
          .filter((b: any) => {
            const bComp = b.company_id || b.companyId;
            return (
              finalCompanies.length === 0 ||
              finalCompanies.some((c) => isMatchingCompany(c, bComp))
            );
          })
          .map((b: any) => ({
            ...b,
            id: String(b.id),
            numeric_id: Number(b.id) || undefined,
            company_id: b.company_id,
            companyId: b.companyId || String(b.company_id || ""),
            name: String(b.name || "").trim(),
            code: b.code ? String(b.code).toUpperCase() : b.code,
          }));
        const uniqueBranches = Array.from(
          new Map<string, Branch>(
            finalBranches.map((b) => [String(b.id), b]),
          ).values(),
        );
        setBranches(uniqueBranches);

        const validBranchIds = new Set(
          uniqueBranches.map((b) => String(b.id).toLowerCase().trim()),
        );

        // 3. Merge SubBranches (excluding deleted ones and sub-branches of deleted branches)
        const storeSubBranches = useAuthStore.getState().subBranches || [];
        const combinedSubList = [
          ...(Array.isArray(dbSubBranches) ? dbSubBranches : []),
          ...(Array.isArray(subBranchRes) ? subBranchRes : []),
          ...(Array.isArray(storeSubBranches) ? storeSubBranches : []),
        ];
        const subMap = new Map<string, any>();
        combinedSubList.forEach((sb) => {
          if (sb && sb.id) {
            const strKey = String(sb.id);
            const prev = subMap.get(strKey);
            subMap.set(strKey, mergeSafe(prev, sb));
          }
        });
        const subList = Array.from(subMap.values()).filter((sb) => {
          const sbBranch = String(sb.branch_id || (sb as any).branchId || "")
            .toLowerCase()
            .trim();
          return (
            !isSubBranchDeleted(sb.id, sb.code) &&
            (!sbBranch || validBranchIds.has(sbBranch))
          );
        });
        setSubBranches(subList);

        // Update auth store in-memory only (NEVER fire POST /store/* write requests during a GET/page refresh)
        if (
          finalCompanies.length > 0 ||
          uniqueBranches.length > 0 ||
          subList.length > 0
        ) {
          useAuthStore.setState((state) => ({
            companies:
              finalCompanies.length > 0
                ? (finalCompanies as any)
                : state.companies,
            branches:
              uniqueBranches.length > 0
                ? (uniqueBranches as any)
                : state.branches,
            subBranches:
              subList.length > 0 ? (subList as any) : state.subBranches,
          }));
        }
        setExpandedCompanies(
          (prev: Set<string>) =>
            new Set([...Array.from(prev), ...finalCompanies.map((c) => c.id)]),
        );
      } catch (err: any) {
        setError(err?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    return __fn(...__args);
  };
}
