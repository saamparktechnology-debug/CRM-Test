"use client"

import * as React from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Clock,
  AlertCircle,
  CheckCircle2,
  FileText,
  Upload,
  MapPin,
  Phone,
  Mail,
  Landmark,
  RefreshCw,
  LogOut,
  ArrowRight,
  ShieldAlert,
  Camera,
  X,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { updateUser, getUsers } from "@/features/users/services/userService";
import { api } from "@/lib/api";
import { uploadToImgBB } from "@/lib/imgbbUpload";
import { createNotification } from "@/services/notificationService";
import { RELATIONSHIP_OPTIONS, checkIsVerified, type ContentProps } from "@/components/auth/components/employeekycgate-sections/EmployeeKycGateHelpers"

export function createEmployeeKycGateHandler1(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { setIsRefreshing, setStatusMessage, effectiveUser, onVerified, isSubmittedLocally, setLocalUser, setIsSubmittedLocally } = getCtrl();
    const __fn: any = async () => {
    setIsRefreshing(true);
    setStatusMessage(null);
    try {
      const userIdOrEmail = effectiveUser?.id || effectiveUser?.email;
      let freshUser: any = null;
      if (userIdOrEmail) {
        try {
          const res: any = await api.get(
            `/users/${encodeURIComponent(String(userIdOrEmail))}`,
          );
          freshUser = res?.data || res;
        } catch {}
      }

      if (!freshUser || !freshUser.id) {
        try {
          const allUsers = await getUsers("all");
          freshUser = allUsers.find(
            (u) =>
              String(u.id) === String(effectiveUser?.id) ||
              (u.email &&
                u.email.toLowerCase().trim() ===
                  effectiveUser?.email?.toLowerCase().trim()),
          );
        } catch {}
      }

      if (freshUser) {
        const isNowVerified = checkIsVerified(freshUser);
        let freshKyc = freshUser.kyc_status || freshUser.kycStatus;
        let freshKycData = freshUser.kyc_data || freshUser.kycData;
        if (typeof freshKycData === "string") {
          try {
            freshKycData = JSON.parse(freshKycData);
          } catch {}
        }

        if (isNowVerified) {
          const emailOrId = String(
            effectiveUser?.email || effectiveUser?.id || "",
          )
            .toLowerCase()
            .trim();
          try {
            localStorage.removeItem(`saampark_kyc_submission_${emailOrId}`);
          } catch {}

          const merged = {
            ...effectiveUser,
            ...freshUser,
            kycStatus: "Verified" as const,
            kyc_status: "Verified",
            kycData: freshKycData || effectiveUser?.kycData,
          };
          useAuthStore.setState({ user: merged });
          try {
            const raw = localStorage.getItem("saampark-auth-v3");
            if (raw) {
              const parsed = JSON.parse(raw);
              if (parsed?.state) {
                parsed.state.user = merged;
                localStorage.setItem(
                  "saampark-auth-v3",
                  JSON.stringify(parsed),
                );
              }
            }
          } catch {}

          setStatusMessage(
            "✅ KYC Verification Approved! Unlocking your workspace...",
          );
          setTimeout(() => {
            onVerified();
          }, 600);
          return;
        }

        if (!freshKyc || freshKyc === "Pending") {
          freshKyc =
            freshKycData?.docNumber || isSubmittedLocally
              ? "Processing"
              : "Pending";
        }

        const merged = {
          ...effectiveUser,
          ...freshUser,
          kycStatus: freshKyc,
          kycData: freshKycData || effectiveUser?.kycData,
        };
        setLocalUser(merged);
        useAuthStore.setState({ user: merged });
        setIsSubmittedLocally(
          freshKyc === "Processing" ||
            freshKyc === "Verified" ||
            Boolean(merged.kycData?.docNumber),
        );

        setStatusMessage(
          `Current Status: Under Review by Management (${freshKyc})`,
        );
      } else {
        setStatusMessage(
          "Documents are currently under review by Branch Management.",
        );
      }
    } catch {
      setStatusMessage("Verification status: Under review.");
    } finally {
      setIsRefreshing(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };
    return __fn(...__args);
  };
}
