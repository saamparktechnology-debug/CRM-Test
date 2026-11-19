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

export function createEmployeeKycGateHandler2(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { setFormError, fullName, phone, ec1Name, ec1Phone, ec2Name, ec2Phone, pincode, streetAddress, docNumber, docType, docFrontUrl, bankName, accountNumber, ifscCode, confirmAccountNumber, bankProofUrl, declarationAccepted, setIsSubmitting, landmark, selectedPostOffice, city, district, state, fatherOrGuardianName, dob, gender, maritalStatus, bloodGroup, passportPhotoUrl, ec1Relation, ec1CustomRelation, ec2Relation, ec2CustomRelation, docBackUrl, panNumber, panDocUrl, accountHolderName, bankBranch, upiId, effectiveUser, setIsSubmittedLocally, setIsReuploading, setLocalUser } = getCtrl();
    const __fn: any = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!fullName.trim()) {
      setFormError("Please enter your full legal name.");
      return;
    }
    if (!phone.trim()) {
      setFormError("Please enter your active mobile phone number.");
      return;
    }
    if (!ec1Name.trim() || !ec1Phone.trim()) {
      setFormError(
        "Please provide Emergency Contact 1 details (Name and Phone).",
      );
      return;
    }
    if (!ec2Name.trim() || !ec2Phone.trim()) {
      setFormError(
        "Please provide Emergency Contact 2 details (Name and Phone).",
      );
      return;
    }
    if (!pincode.trim() || pincode.trim().length !== 6) {
      setFormError("Please enter a valid 6-digit Indian PIN Code.");
      return;
    }
    if (!streetAddress.trim()) {
      setFormError("Please enter your street address / flat / house number.");
      return;
    }
    if (!docNumber.trim()) {
      setFormError(`Please enter your valid ${docType} identification number.`);
      return;
    }
    if (!docFrontUrl) {
      setFormError(`Please upload the front photo of your ${docType}.`);
      return;
    }
    if (!bankName.trim() || !accountNumber.trim() || !ifscCode.trim()) {
      setFormError(
        "Please provide complete bank account details for salary remittance.",
      );
      return;
    }
    if (accountNumber.trim() !== confirmAccountNumber.trim()) {
      setFormError(
        "Bank account numbers do not match. Please verify carefully.",
      );
      return;
    }
    if (!bankProofUrl) {
      setFormError(
        "Please upload a photo of your Bank Passbook or Bank Statement or Cancelled Cheque.",
      );
      return;
    }
    if (!declarationAccepted) {
      setFormError(
        "Please accept the legal affirmation declaration before submitting.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const fullAddrComputed = [
        streetAddress.trim(),
        landmark.trim() ? `Near ${landmark.trim()}` : "",
        selectedPostOffice ? `PO: ${selectedPostOffice}` : "",
        city.trim(),
        district.trim(),
        state.trim(),
        `PIN: ${pincode.trim()}`,
        "India",
      ]
        .filter(Boolean)
        .join(", ");

      const kycDataPayload = {
        fullName: fullName.trim(),
        fatherOrGuardianName: fatherOrGuardianName.trim() || undefined,
        dob: dob || undefined,
        gender,
        maritalStatus,
        bloodGroup,
        passportPhotoUrl: passportPhotoUrl || undefined,

        // Emergency Contacts
        emergencyContact1: {
          name: ec1Name.trim(),
          relation:
            ec1Relation === "Other" && ec1CustomRelation.trim()
              ? ec1CustomRelation.trim()
              : ec1Relation,
          customRelation:
            ec1Relation === "Other" ? ec1CustomRelation.trim() : undefined,
          phone: ec1Phone.trim(),
        },
        emergencyContact2: {
          name: ec2Name.trim(),
          relation:
            ec2Relation === "Other" && ec2CustomRelation.trim()
              ? ec2CustomRelation.trim()
              : ec2Relation,
          customRelation:
            ec2Relation === "Other" ? ec2CustomRelation.trim() : undefined,
          phone: ec2Phone.trim(),
        },

        // Address
        currentAddress: {
          pincode: pincode.trim(),
          state: state.trim(),
          district: district.trim(),
          city: city.trim(),
          postOffice: selectedPostOffice || undefined,
          streetAddress: streetAddress.trim(),
          landmark: landmark.trim() || undefined,
          fullAddress: fullAddrComputed,
        },

        // Government IDs
        docType,
        docNumber: docNumber.trim().toUpperCase(),
        docFrontUrl,
        docBackUrl: docBackUrl || undefined,
        panNumber: panNumber.trim().toUpperCase() || undefined,
        panDocUrl: panDocUrl || undefined,

        // Bank Remittance
        bankName: bankName.trim(),
        accountHolderName: accountHolderName.trim() || fullName.trim(),
        accountNumber: accountNumber.trim(),
        ifscCode: ifscCode.trim().toUpperCase(),
        bankBranch: bankBranch.trim() || undefined,
        upiId: upiId.trim() || undefined,
        bankProofUrl,

        submittedAt: new Date().toISOString(),
        rejectionReason: undefined,
      };

      const updatedUser = {
        ...effectiveUser,
        phone: phone.trim() || effectiveUser?.phone,
        bloodGroup,
        emergencyContact:
          ec1Phone.trim() || (effectiveUser as any)?.emergencyContact,
        emergencyContactName: ec1Name.trim(),
        address: fullAddrComputed,
        avatarUrl: passportPhotoUrl || effectiveUser?.avatarUrl,
        avatar: passportPhotoUrl || effectiveUser?.avatar,
        kycStatus: "Processing" as const,
        kyc_status: "Processing",
        kycData: kycDataPayload,
      };

      // 1. Lock submitted state in component UI
      setIsSubmittedLocally(true);
      setIsReuploading(false);
      setLocalUser(updatedUser);

      // 2. Save dedicated backup key to localStorage
      try {
        const emailOrId = String(
          effectiveUser?.email || effectiveUser?.id || "",
        )
          .toLowerCase()
          .trim();
        if (emailOrId) {
          const key = `saampark_kyc_submission_${emailOrId}`;
          localStorage.setItem(
            key,
            JSON.stringify({
              kycStatus: "Processing",
              kycData: kycDataPayload,
              docNumber: kycDataPayload.docNumber,
              submittedAt: new Date().toISOString(),
            }),
          );
        }
      } catch {}

      // 3. Immediately update global auth store
      useAuthStore.setState({ user: updatedUser });

      // 4. Update zustand persistent storage (saampark-auth-v3)
      try {
        const raw = localStorage.getItem("saampark-auth-v3");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.state) {
            parsed.state.user = updatedUser;
            localStorage.setItem("saampark-auth-v3", JSON.stringify(parsed));
          }
        }
      } catch {}

      // 5. Update live MySQL database & backend API
      try {
        const targetIdentifier = effectiveUser?.id || effectiveUser?.email;
        await updateUser(targetIdentifier, updatedUser);
        await api
          .put(`/users/${encodeURIComponent(String(targetIdentifier))}`, {
            kyc_status: "Processing",
            kycStatus: "Processing",
            kyc_data: kycDataPayload,
            kycData: kycDataPayload,
            phone: phone.trim() || undefined,
            avatar_url: passportPhotoUrl || undefined,
          })
          .catch((err) => console.warn("Direct /users KYC put warning:", err));
      } catch (saveErr) {
        console.warn("Background updateUser warning:", saveErr);
      }

      // 6. Notify Super Admin / Branch Admin
      createNotification({
        title: `New Team KYC Submitted: ${fullName.trim()}`,
        message: `${fullName.trim()} (${effectiveUser?.branchName || "Branch"}) has submitted full onboarding credentials & bank details awaiting review.`,
        type: "system",
        targetUserId: "admin",
      }).catch(() => {});

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("saampark_kyc_updated", { detail: updatedUser }),
        );
        window.dispatchEvent(new Event("storage"));
      }
    } catch (err: any) {
      console.error("KYC submit error:", err);
      setFormError(
        err?.message || "Failed to submit KYC documents. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };
    return __fn(...__args);
  };
}
