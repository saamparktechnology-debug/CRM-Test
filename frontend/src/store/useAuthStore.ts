import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthService } from "@/features/auth/services/auth.service";
import { companyService } from "@/features/companies/services/company.service";
import { branchService } from "@/features/branches/services/branch.service";
import { invalidateModuleCache, resetDeletedCache } from "@/lib/storageSync";
import type {
  Branch,
  Company,
  CompanyId,
  Role,
  SubBranch,
  User,
  UserEntityScope,
} from "./auth/auth.types";
import {
  COMPANIES,
  DEFAULT_BRANCHES,
  DEFAULT_COMPANIES,
  DEMO_USERS,
  getCanonicalCompanyId,
  getCompanyFullName,
  getCompanyLogoUrl,
  getSelectableCompanies,
  getUserEntityScope,
  isMatchingBranch,
  isMatchingCompany,
} from "./auth/auth.helpers";

export type {
  Branch,
  Company,
  CompanyId,
  Role,
  SubBranch,
  User,
  UserEntityScope,
};
export {
  COMPANIES,
  DEFAULT_BRANCHES,
  DEFAULT_COMPANIES,
  DEMO_USERS,
  getCanonicalCompanyId,
  getCompanyFullName,
  getCompanyLogoUrl,
  getSelectableCompanies,
  getUserEntityScope,
  isMatchingBranch,
  isMatchingCompany,
};

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
  activeCompanyId: string | null;
  activeBranchId: string | null;
  activeSubBranchId: string | null;
  companies: Company[];
  branches: Branch[];
  subBranches: SubBranch[];

  loginAs: (role: Role | string, customUser?: Partial<User>) => void;
  loginWithCredentials: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchCompany: (companyId: string) => void;
  switchBranch: (branchId: string | null) => void;
  switchSubBranch: (subBranchId: string | null) => void;
  fetchCompanies: (force?: boolean) => Promise<Company[]>;
  fetchBranches: (force?: boolean) => Promise<Branch[]>;
  fetchSubBranches: (force?: boolean) => Promise<SubBranch[]>;
  addCompany: (company: Partial<Company>) => Promise<Company | null>;
  updateCompany: (
    companyId: string,
    updates: Partial<Company>,
  ) => Promise<Company | null>;
  deleteCompany: (companyId: string) => Promise<boolean>;
  addBranch: (branch: Partial<Branch>) => Promise<Branch | null>;
  updateBranch: (branchId: string, updates: Partial<Branch>) => Promise<void>;
  deleteBranch: (branchId: string) => Promise<boolean>;
  addSubBranch: (subBranch: Partial<SubBranch>) => Promise<SubBranch | null>;
  updateSubBranch: (
    subBranchId: string,
    updates: Partial<SubBranch>,
  ) => Promise<void>;
  deleteSubBranch: (subBranchId: string) => Promise<boolean>;
}

const AUTH_FETCH_TTL_MS = 15000;
let _inFlightCompaniesFetch: Promise<Company[]> | null = null;
let _lastCompaniesFetchAt = 0;
let _inFlightBranchesFetch: Promise<Branch[]> | null = null;
let _lastBranchesFetchAt = 0;
let _inFlightSubBranchesFetch: Promise<SubBranch[]> | null = null;
let _lastSubBranchesFetchAt = 0;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      token: null,
      user: null,
      activeCompanyId: null,
      activeBranchId: null,
      activeSubBranchId: null,
      companies: [],
      branches: [],
      subBranches: [],

      fetchCompanies: async (force = false) => {
        const now = Date.now();
        const existing = get().companies || [];
        if (
          !force &&
          existing.length > 0 &&
          now - _lastCompaniesFetchAt < AUTH_FETCH_TTL_MS
        ) {
          return existing;
        }
        if (_inFlightCompaniesFetch) return _inFlightCompaniesFetch;
        _inFlightCompaniesFetch = (async () => {
          try {
            const combined = await companyService.fetchAndMergeCompanies(
              get().companies || [],
            );
            _lastCompaniesFetchAt = Date.now();
            set({ companies: combined });
            return combined;
          } catch (err) {
            console.warn("fetchCompanies warning:", err);
            return get().companies || [];
          } finally {
            _inFlightCompaniesFetch = null;
          }
        })();
        return _inFlightCompaniesFetch;
      },

      fetchBranches: async (force = false) => {
        const now = Date.now();
        const existing = get().branches || [];
        if (
          !force &&
          existing.length > 0 &&
          now - _lastBranchesFetchAt < AUTH_FETCH_TTL_MS
        ) {
          return existing;
        }
        if (_inFlightBranchesFetch) return _inFlightBranchesFetch;
        _inFlightBranchesFetch = (async () => {
          try {
            const filtered = await branchService.fetchAndMergeBranches(
              get().companies || [],
            );
            _lastBranchesFetchAt = Date.now();
            set({ branches: filtered });
            return filtered;
          } catch (err) {
            console.warn("fetchBranches warning:", err);
            return get().branches || [];
          } finally {
            _inFlightBranchesFetch = null;
          }
        })();
        return _inFlightBranchesFetch;
      },

      fetchSubBranches: async (force = false) => {
        const now = Date.now();
        const existing = get().subBranches || [];
        if (
          !force &&
          existing.length > 0 &&
          now - _lastSubBranchesFetchAt < AUTH_FETCH_TTL_MS
        ) {
          return existing;
        }
        if (_inFlightSubBranchesFetch) return _inFlightSubBranchesFetch;
        _inFlightSubBranchesFetch = (async () => {
          try {
            const filtered = await branchService.fetchAndMergeSubBranches();
            _lastSubBranchesFetchAt = Date.now();
            set({ subBranches: filtered });
            return filtered;
          } catch (err) {
            console.warn("fetchSubBranches warning:", err);
            return get().subBranches || [];
          } finally {
            _inFlightSubBranchesFetch = null;
          }
        })();
        return _inFlightSubBranchesFetch;
      },

      addCompany: async (newComp: Partial<Company>) => {
        const canon = getCanonicalCompanyId(
          newComp.slug || newComp.id || newComp.name,
        );
        const target = get().companies.find((c) => isMatchingCompany(c, canon));
        if (target) {
          return get().updateCompany(target.id, newComp);
        }
        const created = await companyService.create(newComp);
        if (!created) {
          throw new Error("Failed to create company on server.");
        }
        const next = [...get().companies, created];
        set({ companies: next });
        return created;
      },

      updateCompany: async (companyId: string, updates: Partial<Company>) => {
        const { user, companies } = get();
        const isSuperAdmin =
          user?.role === "Super Admin" ||
          (user as any)?.role_id === 1 ||
          user?.email === "saampark.official@gmail.com";
        const isAdmin =
          user?.role === "Admin" ||
          (user as any)?.role_id === 2 ||
          String((user as any)?.role_name || "")
            .toLowerCase()
            .includes("admin");

        if (!isSuperAdmin && !isAdmin) {
          throw new Error(
            "Access denied: You do not have permission to modify company details.",
          );
        }

        const { updatedCompany, updatedList } =
          await companyService.updateCompanyRecord(
            companyId,
            updates,
            companies,
          );
        if (!updatedCompany) return null;

        set({ companies: updatedList });

        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("storage"));
          window.dispatchEvent(new CustomEvent("saampark_data_synced"));
          window.dispatchEvent(
            new CustomEvent("saampark_company_updated", {
              detail: updatedCompany,
            }),
          );
          window.dispatchEvent(
            new CustomEvent("saampark_company_switched", {
              detail: { companyId: updatedCompany.id },
            }),
          );
        }

        return updatedCompany;
      },

      deleteCompany: async (_companyId: string) => {
        console.warn(
          "Company deletion is disabled: Core corporate entities cannot be deleted.",
        );
        return false;
      },

      addBranch: async (branchData: Partial<Branch>) => {
        const { user, branches, activeCompanyId } = get();
        let targetCompanyId =
          getCanonicalCompanyId(
            branchData.companyId || activeCompanyId || "tech",
          ) || "tech";
        if (user && user.role !== "Super Admin") {
          const allowedCompIds = (
            user.companyIds || (user.companyId ? [user.companyId] : ["tech"])
          ).map((id) => getCanonicalCompanyId(id));
          const matches = allowedCompIds.some(
            (id) => id.toLowerCase() === targetCompanyId.toLowerCase(),
          );
          if (!matches) {
            targetCompanyId = allowedCompIds[0] || "tech";
          }
        }

        const { createdBranch, updatedList } =
          await branchService.createBranchRecord(
            { ...branchData, companyId: targetCompanyId },
            branches || [],
            targetCompanyId,
            user?.name || "",
          );

        set({ branches: updatedList });

        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("storage"));
          window.dispatchEvent(new CustomEvent("saampark_data_synced"));
        }
        return createdBranch;
      },

      updateBranch: async (branchId: string, updates: Partial<Branch>) => {
        const updatedList = await branchService.updateBranchRecord(
          branchId,
          updates,
          get().branches || [],
        );
        set({ branches: updatedList });

        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("storage"));
          window.dispatchEvent(new CustomEvent("saampark_data_synced"));
        }
      },

      deleteBranch: async (branchId: string) => {
        const updatedList = await branchService.deleteBranchRecord(
          branchId,
          get().branches || [],
        );
        set({ branches: updatedList });

        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("storage"));
          window.dispatchEvent(new CustomEvent("saampark_data_synced"));
        }
        return true;
      },

      addSubBranch: async (subBranchData: Partial<SubBranch>) => {
        const { subBranches, branches, activeCompanyId } = get();
        const { createdSubBranch, updatedList } =
          await branchService.createSubBranchRecord(
            subBranchData,
            subBranches || [],
            branches || [],
            activeCompanyId || "tech",
          );
        set({ subBranches: updatedList });

        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("storage"));
          window.dispatchEvent(new CustomEvent("saampark_data_synced"));
          window.dispatchEvent(
            new CustomEvent("saampark_subbranches_updated", {
              detail: createdSubBranch,
            }),
          );
        }
        return createdSubBranch;
      },

      updateSubBranch: async (
        subBranchId: string,
        updates: Partial<SubBranch>,
      ) => {
        const updatedList = await branchService.updateSubBranchRecord(
          subBranchId,
          updates,
          get().subBranches || [],
        );
        set({ subBranches: updatedList });

        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("storage"));
          window.dispatchEvent(new CustomEvent("saampark_data_synced"));
          window.dispatchEvent(new CustomEvent("saampark_subbranches_updated"));
        }
      },

      deleteSubBranch: async (subBranchId: string) => {
        const updatedList = await branchService.deleteSubBranchRecord(
          subBranchId,
          get().subBranches || [],
        );
        set({ subBranches: updatedList });

        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("storage"));
          window.dispatchEvent(new CustomEvent("saampark_data_synced"));
          window.dispatchEvent(new CustomEvent("saampark_subbranches_updated"));
        }
        return true;
      },

      loginAs: (role: Role | string, customUser?: Partial<User>) => {
        let normalizedRole: Role = "Teams";
        const userEmail = (customUser?.email || "").toLowerCase().trim();
        if (userEmail === "saampark.official@gmail.com") {
          normalizedRole = "Super Admin";
        } else {
          const rLower = String(role || customUser?.role || "")
            .toLowerCase()
            .trim();
          if (rLower.includes("super")) normalizedRole = "Super Admin";
          else if (rLower.includes("admin")) normalizedRole = "Admin";
          else if (rLower.includes("client")) normalizedRole = "Clients";
          else normalizedRole = "Teams";
        }

        const assignedCompanyIds =
          customUser?.companyIds ||
          (normalizedRole === "Super Admin"
            ? ["tech", "consultancy"]
            : [customUser?.companyId || "tech"]);

        let parsedPerms: any = customUser?.permissions;
        if (typeof parsedPerms === "string") {
          try {
            parsedPerms = JSON.parse(parsedPerms);
          } catch {}
        }

        const userAllowedMods =
          customUser?.allowedModules ||
          (parsedPerms && Array.isArray(parsedPerms.allowedModules)
            ? parsedPerms.allowedModules
            : undefined);

        const rawBranch =
          customUser?.branchId || (customUser as any)?.branch_id || undefined;
        const rawBranchName =
          customUser?.branchName ||
          (customUser as any)?.branch_name ||
          undefined;
        const rawSubBranch =
          customUser?.subBranchId ||
          (customUser as any)?.sub_branch_id ||
          (customUser as any)?.subBranchIds?.[0] ||
          undefined;
        const rawSubBranchName =
          customUser?.subBranchName ||
          (customUser as any)?.sub_branch_name ||
          undefined;

        const user: User = {
          id: customUser?.id || `u_${Date.now()}`,
          name:
            userEmail === "saampark.official@gmail.com"
              ? customUser?.name || "Saampark Group (Super Admin)"
              : customUser?.name || `${normalizedRole} User`,
          email: (customUser?.email || "user@saampark.in").toLowerCase().trim(),
          username: (customUser as any)?.username || undefined,
          role: normalizedRole,
          companyId: customUser?.companyId || assignedCompanyIds[0] || "tech",
          companyIds: assignedCompanyIds,
          branchId: rawBranch,
          branchName: rawBranchName,
          subBranchId: rawSubBranch,
          subBranchIds:
            customUser?.subBranchIds ||
            (rawSubBranch ? [rawSubBranch] : undefined),
          subBranchName: rawSubBranchName,
          avatar:
            customUser?.avatar ||
            `https://api.dicebear.com/7.x/notionists/svg?seed=${customUser?.email || normalizedRole}`,
          phone: customUser?.phone,
          allowedModules:
            normalizedRole === "Super Admin" ? undefined : userAllowedMods,
          permissions: parsedPerms || customUser?.permissions,
          kycStatus:
            (customUser as any)?.kycStatus ||
            (customUser as any)?.kyc_status ||
            "Pending",
          kycData:
            (customUser as any)?.kycData || (customUser as any)?.kyc_data,
        };

        let activeCompanyId = "tech";
        if (normalizedRole === "Super Admin") {
          activeCompanyId = "all";
        } else if (user.companyId) {
          activeCompanyId = user.companyId;
        } else if (assignedCompanyIds.length === 1) {
          activeCompanyId = assignedCompanyIds[0];
        }

        const activeBranchId =
          normalizedRole !== "Super Admin" && rawBranch ? rawBranch : null;
        const activeSubBranchId =
          normalizedRole !== "Super Admin" && rawSubBranch
            ? rawSubBranch
            : null;

        const effectiveToken =
          (customUser as any)?.token ||
          (customUser as any)?.auth_token ||
          (typeof window !== "undefined"
            ? localStorage.getItem("saampark_token")
            : null);

        if (typeof window !== "undefined") {
          sessionStorage.setItem("saampark_session_active", "true");
          localStorage.removeItem("saampark_session_active");
          localStorage.setItem(
            "saampark_last_activity_time",
            String(Date.now()),
          );
          sessionStorage.removeItem("saampark_inactivity_logout");
          sessionStorage.removeItem("saampark_inactive_logout");
          if (effectiveToken) {
            localStorage.setItem("saampark_token", effectiveToken);
          }
        }

        set({
          isAuthenticated: true,
          token: effectiveToken,
          user,
          activeCompanyId,
          activeBranchId,
          activeSubBranchId,
        });

        try {
          const { usePermissionStore } = require("./usePermissionStore");
          if (parsedPerms?.actionMatrix) {
            usePermissionStore
              .getState()
              .setUserAllModuleActions(user.id, parsedPerms.actionMatrix);
            if (user.email) {
              usePermissionStore
                .getState()
                .setUserAllModuleActions(user.email, parsedPerms.actionMatrix);
            }
          }
          if (userAllowedMods) {
            usePermissionStore
              .getState()
              .setUserPermissions(user.id, userAllowedMods);
            if (user.email) {
              usePermissionStore
                .getState()
                .setUserPermissions(user.email, userAllowedMods);
            }
          }
        } catch {}
      },

      loginWithCredentials: async (
        emailOrUsername: string,
        password: string,
      ) => {
        const normIdentifier = emailOrUsername.toLowerCase().trim();
        const res: any = await AuthService.login({
          email: normIdentifier,
          password,
        });
        const payload = res?.data ?? res;
        const token = payload?.token;
        const apiUser = payload?.user;

        if (token && apiUser) {
          let role: Role = "Teams";
          const uRole = apiUser.role_name || apiUser.role || "";
          const uRoleId = Number(apiUser.role_id);
          if (
            uRoleId === 1 ||
            String(uRole).toLowerCase().includes("super") ||
            String(apiUser.email || "")
              .toLowerCase()
              .trim() === "saampark.official@gmail.com"
          ) {
            role = "Super Admin";
          } else if (
            uRoleId === 2 ||
            String(uRole).toLowerCase().includes("admin")
          ) {
            role = "Admin";
          } else if (
            uRoleId === 4 ||
            String(uRole).toLowerCase().includes("client")
          ) {
            role = "Clients";
          }

          let parsedCompanyIds: string[] = [];
          if (res.user?.company_ids) {
            try {
              parsedCompanyIds = JSON.parse(res.user.company_ids);
            } catch {
              parsedCompanyIds = [res.user.company_ids];
            }
          }
          if (
            !Array.isArray(parsedCompanyIds) ||
            parsedCompanyIds.length === 0
          ) {
            parsedCompanyIds = [res.user?.company_id || "tech"];
          }

          let resPerms: any = res.user?.permissions;
          if (typeof resPerms === "string") {
            try {
              resPerms = JSON.parse(resPerms);
            } catch {}
          }

          const userAllowedMods =
            res.user?.allowedModules ||
            (resPerms && Array.isArray(resPerms.allowedModules)
              ? resPerms.allowedModules
              : undefined);

          const userBranch =
            res.user?.branch_id ||
            res.user?.branchId ||
            res.user?.branch ||
            undefined;
          const userSubBranch =
            res.user?.sub_branch_id || res.user?.subBranchId || undefined;
          const primaryCompany =
            res.user?.company_id || parsedCompanyIds[0] || "tech";

          const userObj: User = {
            id: res.user?.id || "u_live",
            name:
              res.user?.full_name ||
              res.user?.name ||
              res.user?.email ||
              "User",
            email:
              res.user?.email ||
              (normIdentifier.includes("@")
                ? normIdentifier
                : "user@saampark.in"),
            username:
              res.user?.username ||
              (!normIdentifier.includes("@") ? normIdentifier : undefined),
            role,
            companyId: primaryCompany,
            companyIds: parsedCompanyIds,
            branchId: userBranch,
            branchName:
              res.user?.branch_name || res.user?.branchName || undefined,
            subBranchId: userSubBranch,
            subBranchIds: userSubBranch ? [userSubBranch] : undefined,
            subBranchName:
              res.user?.sub_branch_name || res.user?.subBranchName || undefined,
            avatar:
              res.user?.avatar ||
              `https://api.dicebear.com/7.x/notionists/svg?seed=${res.user?.email || "user"}`,
            phone: res.user?.phone,
            allowedModules: userAllowedMods,
            permissions: resPerms || res.user?.permissions,
            kycStatus: res.user?.kyc_status || res.user?.kycStatus || "Pending",
            kycData: (() => {
              try {
                const rawKyc = res.user?.kyc_data || res.user?.kycData;
                if (rawKyc)
                  return typeof rawKyc === "string"
                    ? JSON.parse(rawKyc)
                    : rawKyc;
              } catch {}
              return undefined;
            })(),
          };

          const effectiveCompanyId =
            role === "Super Admin" ? "all" : primaryCompany;
          const initialBranchId =
            role !== "Super Admin" && userBranch ? userBranch : null;
          const initialSubBranchId =
            role !== "Super Admin" && userSubBranch ? userSubBranch : null;

          if (typeof window !== "undefined") {
            sessionStorage.setItem("saampark_session_active", "true");
            localStorage.removeItem("saampark_session_active");
            localStorage.setItem(
              "saampark_last_activity_time",
              String(Date.now()),
            );
            localStorage.setItem("saampark_token", res.token);
          }

          set({
            isAuthenticated: true,
            token: res.token,
            user: userObj,
            activeCompanyId: effectiveCompanyId,
            activeBranchId: initialBranchId,
            activeSubBranchId: initialSubBranchId,
          });

          try {
            const { usePermissionStore } = require("./usePermissionStore");
            if (resPerms?.actionMatrix) {
              usePermissionStore
                .getState()
                .setUserAllModuleActions(userObj.id, resPerms.actionMatrix);
              if (userObj.email) {
                usePermissionStore
                  .getState()
                  .setUserAllModuleActions(
                    userObj.email,
                    resPerms.actionMatrix,
                  );
              }
            }
            if (userAllowedMods) {
              usePermissionStore
                .getState()
                .setUserPermissions(userObj.id, userAllowedMods);
              if (userObj.email) {
                usePermissionStore
                  .getState()
                  .setUserPermissions(userObj.email, userAllowedMods);
              }
            }
          } catch {}

          get().fetchCompanies();
          return true;
        }

        if (res && (res.status === "error" || res.message)) {
          throw new Error(
            res.message || "Account does not exist. Please create one.",
          );
        }
        return false;
      },

      logout: () => {
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("saampark_session_active");
          localStorage.removeItem("saampark_session_active");
          localStorage.removeItem("saampark_last_activity_time");
          localStorage.removeItem("saampark_universal_deleted_ids");
        }
        resetDeletedCache();
        AuthService.logout();
        set({
          isAuthenticated: false,
          token: null,
          user: null,
          activeCompanyId: null,
        });
      },

      switchCompany: (companyId: string) => {
        const { user, companies, branches, subBranches } = get();
        if (!user) return;

        const targetNorm = String(companyId || "")
          .toLowerCase()
          .trim();
        const isSuperAdmin = user.role === "Super Admin";

        if (
          targetNorm === "all" ||
          targetNorm === "all_companies" ||
          !companyId
        ) {
          if (isSuperAdmin) {
            invalidateModuleCache();
            set({
              activeCompanyId: "all",
              activeBranchId: null,
              activeSubBranchId: null,
            });
            if (typeof window !== "undefined") {
              window.dispatchEvent(
                new CustomEvent("saampark_company_switched", { detail: "all" }),
              );
              window.dispatchEvent(
                new CustomEvent("saampark_branch_switched", { detail: null }),
              );
              window.dispatchEvent(
                new CustomEvent("saampark_sub_branch_switched", {
                  detail: null,
                }),
              );
              window.dispatchEvent(new CustomEvent("saampark_data_synced"));
              window.dispatchEvent(new Event("storage"));
            }
          }
          return;
        }

        const scope = getUserEntityScope(
          user,
          companies,
          branches,
          subBranches,
        );
        const matchedComp = companies.find(
          (c) =>
            String(c.id).toLowerCase().trim() === targetNorm ||
            String(c.slug || "")
              .toLowerCase()
              .trim() === targetNorm ||
            String(c.name || "")
              .toLowerCase()
              .trim() === targetNorm,
        );
        const effectiveId = matchedComp?.id || companyId;

        const isAllowedCompany =
          isSuperAdmin ||
          scope.allowedCompanyIds.some(
            (id) =>
              String(id).toLowerCase().trim() === targetNorm ||
              (matchedComp &&
                String(id).toLowerCase().trim() ===
                  String(matchedComp.id).toLowerCase().trim()) ||
              (matchedComp?.slug &&
                String(id).toLowerCase().trim() ===
                  String(matchedComp.slug).toLowerCase().trim()),
          );

        if (!isAllowedCompany) return;

        invalidateModuleCache();

        let nextBranchId: string | null = null;
        let nextSubBranchId: string | null = null;
        if (scope.scopeLevel === "subbranch") {
          nextSubBranchId = scope.allowedSubBranchIds[0] || null;
          nextBranchId = scope.allowedBranchIds[0] || null;
        } else if (scope.scopeLevel === "branch") {
          nextBranchId = scope.allowedBranchIds[0] || null;
        }

        set({
          activeCompanyId: effectiveId,
          activeBranchId: nextBranchId,
          activeSubBranchId: nextSubBranchId,
        });

        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("saampark_company_switched", {
              detail: effectiveId,
            }),
          );
          window.dispatchEvent(
            new CustomEvent("saampark_branch_switched", {
              detail: nextBranchId,
            }),
          );
          window.dispatchEvent(
            new CustomEvent("saampark_sub_branch_switched", {
              detail: nextSubBranchId,
            }),
          );
          window.dispatchEvent(new CustomEvent("saampark_data_synced"));
          window.dispatchEvent(new Event("storage"));
        }
      },

      switchBranch: (branchId: string | null) => {
        const { user, companies, branches, subBranches, activeCompanyId } =
          get();
        if (!user) return;

        const scope = getUserEntityScope(
          user,
          companies,
          branches,
          subBranches,
        );
        const branchIdStr = branchId ? String(branchId) : null;

        if (!branchIdStr) {
          if (!scope.canAccessCompanyHq) return;
          invalidateModuleCache();
          set({
            activeBranchId: null,
            activeSubBranchId: null,
          });
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("saampark_branch_switched", { detail: null }),
            );
            window.dispatchEvent(
              new CustomEvent("saampark_sub_branch_switched", { detail: null }),
            );
            window.dispatchEvent(new CustomEvent("saampark_data_synced"));
            window.dispatchEvent(new Event("storage"));
          }
          return;
        }

        const matchedBranch = branches.find(
          (b) =>
            String(b.id).toLowerCase().trim() ===
              branchIdStr.toLowerCase().trim() ||
            String(b.code || "")
              .toLowerCase()
              .trim() === branchIdStr.toLowerCase().trim() ||
            String(b.name || "")
              .toLowerCase()
              .trim() === branchIdStr.toLowerCase().trim(),
        );

        let targetCompanyId = activeCompanyId;
        if (matchedBranch) {
          const bComp = String(
            matchedBranch.companyId ||
              (matchedBranch as any)?.company_id ||
              "tech",
          ).toLowerCase();
          if (
            !targetCompanyId ||
            targetCompanyId === "all" ||
            !isMatchingCompany(
              { id: bComp, slug: bComp } as any,
              targetCompanyId,
            )
          ) {
            targetCompanyId = bComp || "tech";
          }
        }

        invalidateModuleCache();
        const nextSubBranchId =
          scope.scopeLevel === "subbranch"
            ? scope.allowedSubBranchIds[0] || null
            : null;
        const effectiveBranchId = matchedBranch?.id || branchIdStr;

        set({
          activeCompanyId: targetCompanyId,
          activeBranchId: effectiveBranchId,
          activeSubBranchId: nextSubBranchId,
        });

        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("saampark_branch_switched", {
              detail: branchIdStr,
            }),
          );
          window.dispatchEvent(
            new CustomEvent("saampark_sub_branch_switched", {
              detail: nextSubBranchId,
            }),
          );
          window.dispatchEvent(new CustomEvent("saampark_data_synced"));
          window.dispatchEvent(new Event("storage"));
        }
      },

      switchSubBranch: (subBranchId: string | null) => {
        const {
          user,
          companies,
          branches,
          subBranches,
          activeCompanyId,
          activeBranchId,
        } = get();
        if (!user) return;

        const scope = getUserEntityScope(
          user,
          companies,
          branches,
          subBranches,
        );
        const subBranchIdStr = subBranchId ? String(subBranchId) : null;

        if (!subBranchIdStr) {
          if (scope.scopeLevel === "subbranch") return;
          set({ activeSubBranchId: null });
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("saampark_sub_branch_switched", { detail: null }),
            );
            window.dispatchEvent(
              new CustomEvent("saampark_subbranch_switched", {
                detail: { subBranchId: null },
              }),
            );
            window.dispatchEvent(new CustomEvent("saampark_data_synced"));
            window.dispatchEvent(new Event("storage"));
          }
          return;
        }

        if (!activeCompanyId || activeCompanyId === "all" || !activeBranchId)
          return;

        const isAllowedSub =
          scope.isSuperAdmin ||
          scope.allowedSubBranchIds.some(
            (id) =>
              String(id).toLowerCase().trim() ===
              subBranchIdStr.toLowerCase().trim(),
          );
        if (!isAllowedSub) return;

        const matchedSub = subBranches.find(
          (sb) => String(sb.id) === subBranchIdStr,
        );
        if (
          matchedSub &&
          String(matchedSub.parentBranchId) !== String(activeBranchId)
        )
          return;

        set({ activeSubBranchId: subBranchIdStr });
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("saampark_sub_branch_switched", {
              detail: subBranchIdStr,
            }),
          );
          window.dispatchEvent(
            new CustomEvent("saampark_subbranch_switched", {
              detail: { subBranchId: subBranchIdStr },
            }),
          );
          window.dispatchEvent(new CustomEvent("saampark_data_synced"));
          window.dispatchEvent(new Event("storage"));
        }
      },
    }),
    {
      name: "saampark-auth-v3",
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (typeof window !== "undefined") {
            const isSessionActive =
              sessionStorage.getItem("saampark_session_active") === "true";
            if (!isSessionActive) {
              state.isAuthenticated = false;
            }
          }
          if (
            state.user &&
            state.user.role === "Super Admin" &&
            !state.activeCompanyId
          ) {
            state.activeCompanyId = "all";
            state.activeBranchId = null;
            state.activeSubBranchId = null;
          }
        }
      },
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        user: state.user,
        activeCompanyId: state.activeCompanyId,
        activeBranchId: state.activeBranchId,
        activeSubBranchId: state.activeSubBranchId,
      }),
    },
  ),
);
