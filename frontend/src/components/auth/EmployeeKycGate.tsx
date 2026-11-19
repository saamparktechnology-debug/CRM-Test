"use client";

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
import { EmployeeKycGateSection1 } from "@/components/auth/components/employeekycgate-sections/EmployeeKycGateSection1"
import { EmployeeKycGateSection2 } from "@/components/auth/components/employeekycgate-sections/EmployeeKycGateSection2"
import { createEmployeeKycGateHandler1 } from "@/components/auth/hooks/employeekycgate-hooks/createEmployeeKycGateHandler1.hooks"
import { createEmployeeKycGateHandler2 } from "@/components/auth/hooks/employeekycgate-hooks/createEmployeeKycGateHandler2.hooks"


import { RELATIONSHIP_OPTIONS, checkIsVerified, type ContentProps } from "@/components/auth/components/employeekycgate-sections/EmployeeKycGateHelpers"
export * from "@/components/auth/components/employeekycgate-sections/EmployeeKycGateHelpers"

function EmployeeKycGateContent({ user, logout, onVerified }: ContentProps) {
  const __ctrlRef = React.useRef<any>({});
  let __ctrl: any = {};

  const storeUser = useAuthStore((s) => s.user);

  // Dedicated backup localStorage lookup for this employee
  const getKycBackup = React.useCallback(() => {
    try {
      const emailOrId = String(user?.email || user?.id || "")
        .toLowerCase()
        .trim();
      if (!emailOrId) return null;
      const key = `saampark_kyc_submission_${emailOrId}`;
      const saved =
        typeof window !== "undefined" ? localStorage.getItem(key) : null;
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }, [user?.email, user?.id]);

  const [localUser, setLocalUser] = React.useState<any>(() => {
    const backup = getKycBackup();
    const base = storeUser || user;
    if (backup && (!base?.kycData || !base?.kycData?.docNumber)) {
      return {
        ...base,
        kycStatus: backup.kycStatus || "Processing",
        kycData: backup.kycData || backup,
      };
    }
    return base;
  });

  // Track if this user has already submitted KYC
  const [isSubmittedLocally, setIsSubmittedLocally] = React.useState<boolean>(
    () => {
      if (user?.kycStatus === "Processing" || user?.kycData?.docNumber)
        return true;
      return Boolean(getKycBackup());
    },
  );

  React.useEffect(() => {
    if (storeUser) {
      if (checkIsVerified(storeUser)) {
        onVerified();
        return;
      }
      setLocalUser((prev: any) => {
        const backup = getKycBackup();
        const resolvedKycStatus =
          storeUser.kycStatus ||
          backup?.kycStatus ||
          prev?.kycStatus ||
          "Pending";
        const resolvedKycData =
          storeUser.kycData || backup?.kycData || prev?.kycData;
        return {
          ...prev,
          ...storeUser,
          kycStatus: resolvedKycStatus,
          kycData: resolvedKycData,
        };
      });
    }
  }, [storeUser, getKycBackup, onVerified]);

  const effectiveUser = localUser || storeUser || user;
  const backupData = getKycBackup();
  const rawKyc =
    effectiveUser?.kycData || backupData?.kycData || backupData || {};
  const kycStatus =
    effectiveUser?.kycStatus ||
    backupData?.kycStatus ||
    (rawKyc?.docNumber ? "Processing" : "Pending");

  const hasSubmittedKyc = Boolean(
    isSubmittedLocally ||
    rawKyc?.docNumber ||
    effectiveUser?.kycStatus === "Processing" ||
    effectiveUser?.kycStatus === "Verified" ||
    Boolean(backupData?.docNumber || backupData?.kycData?.docNumber),
  );

  const [isReuploading, setIsReuploading] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);

  // ── 1. PERSONAL INFORMATION STATE ───────────────────────────────────────────
  const [fullName, setFullName] = React.useState(
    rawKyc?.fullName || effectiveUser?.name || "",
  );
  const [fatherOrGuardianName, setFatherOrGuardianName] = React.useState(
    rawKyc?.fatherOrGuardianName || "",
  );
  const [dob, setDob] = React.useState(rawKyc?.dob || "");
  const [gender, setGender] = React.useState(rawKyc?.gender || "Male");
  const [maritalStatus, setMaritalStatus] = React.useState(
    rawKyc?.maritalStatus || "Single",
  );
  const [bloodGroup, setBloodGroup] = React.useState(
    rawKyc?.bloodGroup || effectiveUser?.bloodGroup || "O+",
  );
  const [phone, setPhone] = React.useState(effectiveUser?.phone || "");
  const [passportPhotoUrl, setPassportPhotoUrl] = React.useState<string>(
    rawKyc?.passportPhotoUrl || effectiveUser?.avatarUrl || "",
  );

  // ── 2. EMERGENCY CONTACTS STATE (CONTACT 1 & CONTACT 2) ─────────────────────
  // Contact 1
  const [ec1Name, setEc1Name] = React.useState(
    rawKyc?.emergencyContact1?.name ||
      effectiveUser?.emergencyContactName ||
      "",
  );
  const [ec1Relation, setEc1Relation] = React.useState(
    rawKyc?.emergencyContact1?.relation || "Father",
  );
  const [ec1CustomRelation, setEc1CustomRelation] = React.useState(
    rawKyc?.emergencyContact1?.customRelation || "",
  );
  const [ec1Phone, setEc1Phone] = React.useState(
    rawKyc?.emergencyContact1?.phone || effectiveUser?.emergencyContact || "",
  );

  // Contact 2
  const [ec2Name, setEc2Name] = React.useState(
    rawKyc?.emergencyContact2?.name || "",
  );
  const [ec2Relation, setEc2Relation] = React.useState(
    rawKyc?.emergencyContact2?.relation || "Mother",
  );
  const [ec2CustomRelation, setEc2CustomRelation] = React.useState(
    rawKyc?.emergencyContact2?.customRelation || "",
  );
  const [ec2Phone, setEc2Phone] = React.useState(
    rawKyc?.emergencyContact2?.phone || "",
  );

  // ── 3. ADDRESS WITH INDIA POSTAL PIN CODE API STATE ────────────────────────
  const [pincode, setPincode] = React.useState(
    rawKyc?.currentAddress?.pincode || "",
  );
  const [pinLookupStatus, setPinLookupStatus] = React.useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [pinLookupMsg, setPinLookupMsg] = React.useState<string | null>(null);
  const [availablePostOffices, setAvailablePostOffices] = React.useState<
    string[]
  >([]);
  const [selectedPostOffice, setSelectedPostOffice] = React.useState(
    rawKyc?.currentAddress?.postOffice || "",
  );
  const [district, setDistrict] = React.useState(
    rawKyc?.currentAddress?.district || "",
  );
  const [state, setState] = React.useState(rawKyc?.currentAddress?.state || "");
  const [city, setCity] = React.useState(rawKyc?.currentAddress?.city || "");
  const [streetAddress, setStreetAddress] = React.useState(
    rawKyc?.currentAddress?.streetAddress || effectiveUser?.address || "",
  );
  const [landmark, setLandmark] = React.useState(
    rawKyc?.currentAddress?.landmark || "",
  );

  // PIN Code Lookup Handler
  const handlePincodeLookup = React.useCallback(
    async (pin: string) => {
      const cleanPin = pin.trim().replace(/\D/g, "");
      setPincode(cleanPin);

      if (cleanPin.length !== 6) {
        setPinLookupStatus("idle");
        setPinLookupMsg(null);
        return;
      }

      setPinLookupStatus("loading");
      setPinLookupMsg("Looking up postal records for " + cleanPin + "...");

      try {
        const res = await fetch(
          `https://api.postalpincode.in/pincode/${cleanPin}`,
        );
        const data = await res.json();

        if (
          Array.isArray(data) &&
          data[0]?.Status === "Success" &&
          Array.isArray(data[0]?.PostOffice) &&
          data[0].PostOffice.length > 0
        ) {
          const poList = data[0].PostOffice;
          const first = poList[0];

          const stateFound = first.State || "";
          const districtFound = first.District || "";
          const cityFound =
            first.Block || first.Division || first.District || "";
          const poNames = Array.from(
            new Set(poList.map((p: any) => p.Name).filter(Boolean)),
          ) as string[];

          setState(stateFound);
          setDistrict(districtFound);
          setCity(cityFound);
          setAvailablePostOffices(poNames);
          if (
            poNames.length > 0 &&
            (!selectedPostOffice || !poNames.includes(selectedPostOffice))
          ) {
            setSelectedPostOffice(poNames[0]);
          }

          setPinLookupStatus("success");
          setPinLookupMsg(
            `Found ${poNames.length} Post Office(s) in ${districtFound}, ${stateFound}`,
          );
        } else {
          setPinLookupStatus("error");
          setPinLookupMsg(
            "Pincode not found in Postal registry. You can still enter details manually.",
          );
        }
      } catch (err) {
        setPinLookupStatus("error");
        setPinLookupMsg(
          "Could not connect to Postal PIN API. Please enter location manually.",
        );
      }
    },
    [selectedPostOffice],
  );

  // Trigger PIN lookup if pincode was prefilled
  React.useEffect(() => {
    if (pincode && pincode.length === 6 && pinLookupStatus === "idle") {
      handlePincodeLookup(pincode);
    }
  }, [pincode, pinLookupStatus, handlePincodeLookup]);

  // ── 4. IDENTITY DOCUMENTS STATE ─────────────────────────────────────────────
  const [docType, setDocType] = React.useState<string>(
    rawKyc?.docType || "Aadhaar Card",
  );
  const [docNumber, setDocNumber] = React.useState(rawKyc?.docNumber || "");
  const [docFrontUrl, setDocFrontUrl] = React.useState(
    rawKyc?.docFrontUrl || "",
  );
  const [docBackUrl, setDocBackUrl] = React.useState(rawKyc?.docBackUrl || "");

  // Optional PAN card upload if primary doc is not PAN
  const [panNumber, setPanNumber] = React.useState(
    rawKyc?.panNumber ||
      (rawKyc?.docType === "PAN Card" ? rawKyc?.docNumber : ""),
  );
  const [panDocUrl, setPanDocUrl] = React.useState(rawKyc?.panDocUrl || "");

  // ── 5. BANK REMITTANCE & PASSBOOK/STATEMENT STATE ───────────────────────────
  const [bankName, setBankName] = React.useState(rawKyc?.bankName || "");
  const [accountHolderName, setAccountHolderName] = React.useState(
    rawKyc?.accountHolderName || effectiveUser?.name || "",
  );
  const [accountNumber, setAccountNumber] = React.useState(
    rawKyc?.accountNumber || "",
  );
  const [confirmAccountNumber, setConfirmAccountNumber] = React.useState(
    rawKyc?.accountNumber || "",
  );
  const [ifscCode, setIfscCode] = React.useState(rawKyc?.ifscCode || "");
  const [bankBranch, setBankBranch] = React.useState(rawKyc?.bankBranch || "");
  const [upiId, setUpiId] = React.useState(rawKyc?.upiId || "");
  const [bankProofUrl, setBankProofUrl] = React.useState(
    rawKyc?.bankProofUrl || "",
  );

  // Declaration & errors
  const [declarationAccepted, setDeclarationAccepted] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  // Uploading flags
  const [uploadingPassport, setUploadingPassport] = React.useState(false);
  const [uploadingFront, setUploadingFront] = React.useState(false);
  const [uploadingBack, setUploadingBack] = React.useState(false);
  const [uploadingPan, setUploadingPan] = React.useState(false);
  const [uploadingBankProof, setUploadingBankProof] = React.useState(false);

  // Universal File Upload Handler
  const handleFileUpload = async (
    file: File,
    target: "passport" | "front" | "back" | "pan" | "bankProof",
  ) => {
    if (!file) return;

    const setterMap = {
      passport: {
        setUploading: setUploadingPassport,
        setUrl: setPassportPhotoUrl,
      },
      front: { setUploading: setUploadingFront, setUrl: setDocFrontUrl },
      back: { setUploading: setUploadingBack, setUrl: setDocBackUrl },
      pan: { setUploading: setUploadingPan, setUrl: setPanDocUrl },
      bankProof: {
        setUploading: setUploadingBankProof,
        setUrl: setBankProofUrl,
      },
    };

    const { setUploading, setUrl } = setterMap[target];
    setUploading(true);
    setFormError(null);

    try {
      const res = await uploadToImgBB(
        file,
        `${effectiveUser?.name || "employee"}_kyc_${target}`,
        1200,
      );
      if (res && res.success && res.url) {
        setUrl(res.url);
      } else {
        setFormError("Failed to upload file to server. Please try again.");
      }
    } catch (err: any) {
      setFormError(err?.message || "Failed to upload file to server. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // Refresh status check against database
  const handleCheckStatus: any = createEmployeeKycGateHandler1(() => __ctrlRef.current);

  // Form Submit
  const handleSubmitKyc: any = createEmployeeKycGateHandler2(() => __ctrlRef.current);

  // Determine whether to show the submission form or the pending review screen
  const showForm =
    isReuploading || (!hasSubmittedKyc && kycStatus !== "Processing");

  
  __ctrl = { user, logout, onVerified, storeUser, getKycBackup, localUser, setLocalUser, isSubmittedLocally, setIsSubmittedLocally, effectiveUser, backupData, rawKyc, kycStatus, hasSubmittedKyc, isReuploading, setIsReuploading, isSubmitting, setIsSubmitting, isRefreshing, setIsRefreshing, statusMessage, setStatusMessage, fullName, setFullName, fatherOrGuardianName, setFatherOrGuardianName, dob, setDob, gender, setGender, maritalStatus, setMaritalStatus, bloodGroup, setBloodGroup, phone, setPhone, passportPhotoUrl, setPassportPhotoUrl, ec1Name, setEc1Name, ec1Relation, setEc1Relation, ec1CustomRelation, setEc1CustomRelation, ec1Phone, setEc1Phone, ec2Name, setEc2Name, ec2Relation, setEc2Relation, ec2CustomRelation, setEc2CustomRelation, ec2Phone, setEc2Phone, pincode, setPincode, pinLookupStatus, setPinLookupStatus, pinLookupMsg, setPinLookupMsg, availablePostOffices, setAvailablePostOffices, selectedPostOffice, setSelectedPostOffice, district, setDistrict, state, setState, city, setCity, streetAddress, setStreetAddress, landmark, setLandmark, handlePincodeLookup, docType, setDocType, docNumber, setDocNumber, docFrontUrl, setDocFrontUrl, docBackUrl, setDocBackUrl, panNumber, setPanNumber, panDocUrl, setPanDocUrl, bankName, setBankName, accountHolderName, setAccountHolderName, accountNumber, setAccountNumber, confirmAccountNumber, setConfirmAccountNumber, ifscCode, setIfscCode, bankBranch, setBankBranch, upiId, setUpiId, bankProofUrl, setBankProofUrl, declarationAccepted, setDeclarationAccepted, formError, setFormError, uploadingPassport, setUploadingPassport, uploadingFront, setUploadingFront, uploadingBack, setUploadingBack, uploadingPan, setUploadingPan, uploadingBankProof, setUploadingBankProof, handleFileUpload, handleCheckStatus, handleSubmitKyc, showForm };
  __ctrlRef.current = __ctrl;
return (
    <div className="min-h-[85vh] flex items-center justify-center py-6 px-2 sm:px-4">
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <EmployeeKycGateSection1 ctrl={__ctrl} />

        {/* ─── CASE B: KYC SUBMISSION FORM ───────────────────────────────────── */}
        <EmployeeKycGateSection2 ctrl={__ctrl} />
      </div>
    </div>
  );
}


export function EmployeeKycGate({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const isEmployeeRole = user?.role === "Teams";

  // Real-time verification status state
  const [isVerifiedLive, setIsVerifiedLive] = React.useState<boolean>(() =>
    checkIsVerified(user),
  );

  // Active sync on mount & periodic polling to ensure approved status immediately unlocks
  React.useEffect(() => {
    if (!user || !isEmployeeRole) return;

    let isMounted = true;

    const syncLatestStatus = async () => {
      const idOrEmail = user.id || user.email;
      if (!idOrEmail) return;
      try {
        const res: any = await api.get(
          `/users/${encodeURIComponent(String(idOrEmail))}`,
        );
        const fresh = res?.data || res;
        if (fresh && isMounted) {
          if (checkIsVerified(fresh)) {
            // KYC has been verified by Admin!
            const emailOrId = String(user.email || user.id || "")
              .toLowerCase()
              .trim();
            try {
              localStorage.removeItem(`saampark_kyc_submission_${emailOrId}`);
            } catch {}

            let parsedKyc = fresh.kyc_data || fresh.kycData;
            if (typeof parsedKyc === "string") {
              try {
                parsedKyc = JSON.parse(parsedKyc);
              } catch {}
            }

            const updated = {
              ...user,
              ...fresh,
              kycStatus: "Verified" as const,
              kyc_status: "Verified",
              kycData: parsedKyc || user.kycData,
            };

            useAuthStore.setState({ user: updated });
            try {
              const raw = localStorage.getItem("saampark-auth-v3");
              if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed?.state) {
                  parsed.state.user = updated;
                  localStorage.setItem(
                    "saampark-auth-v3",
                    JSON.stringify(parsed),
                  );
                }
              }
            } catch {}

            setIsVerifiedLive(true);
          }
        }
      } catch (err) {
        // Fallback silently if offline
      }
    };

    // Run immediately on mount
    syncLatestStatus();

    // Listen to window focus & custom event (when employee switches back to CRM tab after admin approves)
    window.addEventListener("saampark_kyc_updated", syncLatestStatus);
    window.addEventListener("focus", syncLatestStatus);

    return () => {
      isMounted = false;
      window.removeEventListener("saampark_kyc_updated", syncLatestStatus);
      window.removeEventListener("focus", syncLatestStatus);
    };
  }, [user, isEmployeeRole, isVerifiedLive]);

  // If user is Super Admin, Admin, Clients, or already Verified, show normal app
  if (!user || !isEmployeeRole || isVerifiedLive || checkIsVerified(user)) {
    return <>{children}</>;
  }

  return (
    <EmployeeKycGateContent
      user={user}
      logout={logout}
      onVerified={() => setIsVerifiedLive(true)}
    />
  );
}
export default EmployeeKycGate;
