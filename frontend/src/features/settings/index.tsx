"use client";

import { CompanyApiService } from "@/features/companies/services/companyService";
import { api } from "@/lib/api";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Building2,
  Mail,
  Lock,
  Sun,
  Moon,
  ShieldCheck,
  Save,
  CheckCircle2,
  Globe,
  Key,
  AlertCircle,
  RefreshCw,
  Camera,
  Upload,
  User,
  Sparkles,
  Phone,
  MapPin,
  Briefcase,
  Tag,
  QrCode,
  CreditCard,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuthStore, Company, DEFAULT_COMPANIES } from "@/store/useAuthStore";
import { useTheme } from "next-themes";
import { fetchModuleDataFromDB, saveModuleDataToDB } from "@/lib/storageSync";
import {
  getUsers,
  recordUserAccount,
  getStoredUserAccountsAsync,
  cascadeUserAvatarChange,
  checkUsernameAvailabilityAsync,
  updateUserUsernameAsync,
} from "@/features/users/services/userService";
import { uploadToImgBB } from "@/lib/imgbbUpload";
import { KycData, KycStatus } from "@/features/users/types";
import {
  getCompanyPaymentSettings,
  saveCompanyPaymentSettings,
  CompanyPaymentSettings,
  DEFAULT_COMPANY_PAYMENT_SETTINGS,
} from "./services/companyPaymentService";
import { EntityModulePermissionsTab } from "./components/EntityModulePermissionsTab";
import { SettingsSection1 } from "@/features/settings/components/settings-sections/SettingsSection1";
import { SettingsSection2 } from "@/features/settings/components/settings-sections/SettingsSection2";
import { SettingsSection3 } from "@/features/settings/components/settings-sections/SettingsSection3";
import { SettingsSection4 } from "@/features/settings/components/settings-sections/SettingsSection4";
import { SettingsSection5 } from "@/features/settings/components/settings-sections/SettingsSection5";
import { createSettingsHandler1 } from "@/features/settings/hooks/settings-hooks/createSettingsHandler1.hooks";

import { type SettingsTab } from "@/features/settings/components/settings-sections/SettingsHelpers";
export * from "@/features/settings/components/settings-sections/SettingsHelpers";
import { createSettingsAction20 } from "@/features/settings/hooks/settings-hooks/createSettingsAction20.hooks";
import { createSettingsAction21 } from "@/features/settings/hooks/settings-hooks/createSettingsAction21.hooks";
import { createSettingsAction22 } from "@/features/settings/hooks/settings-hooks/createSettingsAction22.hooks";
import { createSettingsAction23 } from "@/features/settings/hooks/settings-hooks/createSettingsAction23.hooks";
import { createSettingsAction24 } from "@/features/settings/hooks/settings-hooks/createSettingsAction24.hooks";
import { createSettingsAction25 } from "@/features/settings/hooks/settings-hooks/createSettingsAction25.hooks";
import { runSettingsEffect50 } from "@/features/settings/hooks/settings-hooks/runSettingsEffect50.hooks";
import { runSettingsEffect51 } from "@/features/settings/hooks/settings-hooks/runSettingsEffect51.hooks";
import { createSettingsFn52 } from "@/features/settings/hooks/settings-hooks/createSettingsFn52.hooks";
import { createSettingsFn53 } from "@/features/settings/hooks/settings-hooks/createSettingsFn53.hooks";
import { createSettingsFn54 } from "@/features/settings/hooks/settings-hooks/createSettingsFn54.hooks";

export default function SettingsMain() {
  const __ctrl: any = {
    get user() {
      try {
        return user;
      } catch {
        return undefined;
      }
    },
    get loginAs() {
      try {
        return loginAs;
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
    get updateCompany() {
      try {
        return updateCompany;
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
    get theme() {
      try {
        return theme;
      } catch {
        return undefined;
      }
    },
    get setTheme() {
      try {
        return setTheme;
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
    get activeTab() {
      try {
        return activeTab;
      } catch {
        return undefined;
      }
    },
    get setActiveTab() {
      try {
        return setActiveTab;
      } catch {
        return undefined;
      }
    },
    get successMsg() {
      try {
        return successMsg;
      } catch {
        return undefined;
      }
    },
    get setSuccessMsg() {
      try {
        return setSuccessMsg;
      } catch {
        return undefined;
      }
    },
    get errorMsg() {
      try {
        return errorMsg;
      } catch {
        return undefined;
      }
    },
    get setErrorMsg() {
      try {
        return setErrorMsg;
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
    get isUploadingAvatar() {
      try {
        return isUploadingAvatar;
      } catch {
        return undefined;
      }
    },
    get setIsUploadingAvatar() {
      try {
        return setIsUploadingAvatar;
      } catch {
        return undefined;
      }
    },
    get name() {
      try {
        return name;
      } catch {
        return undefined;
      }
    },
    get setName() {
      try {
        return setName;
      } catch {
        return undefined;
      }
    },
    get email() {
      try {
        return email;
      } catch {
        return undefined;
      }
    },
    get setEmail() {
      try {
        return setEmail;
      } catch {
        return undefined;
      }
    },
    get username() {
      try {
        return username;
      } catch {
        return undefined;
      }
    },
    get setUsername() {
      try {
        return setUsername;
      } catch {
        return undefined;
      }
    },
    get usernameStatus() {
      try {
        return usernameStatus;
      } catch {
        return undefined;
      }
    },
    get setUsernameStatus() {
      try {
        return setUsernameStatus;
      } catch {
        return undefined;
      }
    },
    get usernameStatusMsg() {
      try {
        return usernameStatusMsg;
      } catch {
        return undefined;
      }
    },
    get setUsernameStatusMsg() {
      try {
        return setUsernameStatusMsg;
      } catch {
        return undefined;
      }
    },
    get showUsernameConfirmModal() {
      try {
        return showUsernameConfirmModal;
      } catch {
        return undefined;
      }
    },
    get setShowUsernameConfirmModal() {
      try {
        return setShowUsernameConfirmModal;
      } catch {
        return undefined;
      }
    },
    get pendingUsername() {
      try {
        return pendingUsername;
      } catch {
        return undefined;
      }
    },
    get setPendingUsername() {
      try {
        return setPendingUsername;
      } catch {
        return undefined;
      }
    },
    get isSavingUsername() {
      try {
        return isSavingUsername;
      } catch {
        return undefined;
      }
    },
    get setIsSavingUsername() {
      try {
        return setIsSavingUsername;
      } catch {
        return undefined;
      }
    },
    get phone() {
      try {
        return phone;
      } catch {
        return undefined;
      }
    },
    get setPhone() {
      try {
        return setPhone;
      } catch {
        return undefined;
      }
    },
    get jobTitle() {
      try {
        return jobTitle;
      } catch {
        return undefined;
      }
    },
    get setJobTitle() {
      try {
        return setJobTitle;
      } catch {
        return undefined;
      }
    },
    get department() {
      try {
        return department;
      } catch {
        return undefined;
      }
    },
    get setDepartment() {
      try {
        return setDepartment;
      } catch {
        return undefined;
      }
    },
    get location() {
      try {
        return location;
      } catch {
        return undefined;
      }
    },
    get setLocation() {
      try {
        return setLocation;
      } catch {
        return undefined;
      }
    },
    get bio() {
      try {
        return bio;
      } catch {
        return undefined;
      }
    },
    get setBio() {
      try {
        return setBio;
      } catch {
        return undefined;
      }
    },
    get skills() {
      try {
        return skills;
      } catch {
        return undefined;
      }
    },
    get setSkills() {
      try {
        return setSkills;
      } catch {
        return undefined;
      }
    },
    get avatar() {
      try {
        return avatar;
      } catch {
        return undefined;
      }
    },
    get setAvatar() {
      try {
        return setAvatar;
      } catch {
        return undefined;
      }
    },
    get fileInputRef() {
      try {
        return fileInputRef;
      } catch {
        return undefined;
      }
    },
    get currentPassword() {
      try {
        return currentPassword;
      } catch {
        return undefined;
      }
    },
    get setCurrentPassword() {
      try {
        return setCurrentPassword;
      } catch {
        return undefined;
      }
    },
    get newPassword() {
      try {
        return newPassword;
      } catch {
        return undefined;
      }
    },
    get setNewPassword() {
      try {
        return setNewPassword;
      } catch {
        return undefined;
      }
    },
    get confirmPassword() {
      try {
        return confirmPassword;
      } catch {
        return undefined;
      }
    },
    get setConfirmPassword() {
      try {
        return setConfirmPassword;
      } catch {
        return undefined;
      }
    },
    get companyName() {
      try {
        return companyName;
      } catch {
        return undefined;
      }
    },
    get setCompanyName() {
      try {
        return setCompanyName;
      } catch {
        return undefined;
      }
    },
    get currency() {
      try {
        return currency;
      } catch {
        return undefined;
      }
    },
    get setCurrency() {
      try {
        return setCurrency;
      } catch {
        return undefined;
      }
    },
    get currencySymbol() {
      try {
        return currencySymbol;
      } catch {
        return undefined;
      }
    },
    get setCurrencySymbol() {
      try {
        return setCurrencySymbol;
      } catch {
        return undefined;
      }
    },
    get address() {
      try {
        return address;
      } catch {
        return undefined;
      }
    },
    get setAddress() {
      try {
        return setAddress;
      } catch {
        return undefined;
      }
    },
    get industry() {
      try {
        return industry;
      } catch {
        return undefined;
      }
    },
    get setIndustry() {
      try {
        return setIndustry;
      } catch {
        return undefined;
      }
    },
    get effectiveCompanies() {
      try {
        return effectiveCompanies;
      } catch {
        return undefined;
      }
    },
    get selectedSmtpCompanyId() {
      try {
        return selectedSmtpCompanyId;
      } catch {
        return undefined;
      }
    },
    get setSelectedSmtpCompanyId() {
      try {
        return setSelectedSmtpCompanyId;
      } catch {
        return undefined;
      }
    },
    get companySmtpMap() {
      try {
        return companySmtpMap;
      } catch {
        return undefined;
      }
    },
    get setCompanySmtpMap() {
      try {
        return setCompanySmtpMap;
      } catch {
        return undefined;
      }
    },
    get showSmtpPass() {
      try {
        return showSmtpPass;
      } catch {
        return undefined;
      }
    },
    get setShowSmtpPass() {
      try {
        return setShowSmtpPass;
      } catch {
        return undefined;
      }
    },
    get isTestingSmtp() {
      try {
        return isTestingSmtp;
      } catch {
        return undefined;
      }
    },
    get setIsTestingSmtp() {
      try {
        return setIsTestingSmtp;
      } catch {
        return undefined;
      }
    },
    get smtpTestResult() {
      try {
        return smtpTestResult;
      } catch {
        return undefined;
      }
    },
    get setSmtpTestResult() {
      try {
        return setSmtpTestResult;
      } catch {
        return undefined;
      }
    },
    get smtpTestRecipient() {
      try {
        return smtpTestRecipient;
      } catch {
        return undefined;
      }
    },
    get setSmtpTestRecipient() {
      try {
        return setSmtpTestRecipient;
      } catch {
        return undefined;
      }
    },
    get getInitialSmtpForCompany() {
      try {
        return getInitialSmtpForCompany;
      } catch {
        return undefined;
      }
    },
    get activeSmtpCompany() {
      try {
        return activeSmtpCompany;
      } catch {
        return undefined;
      }
    },
    get currentSmtp() {
      try {
        return currentSmtp;
      } catch {
        return undefined;
      }
    },
    get updateCurrentSmtp() {
      try {
        return updateCurrentSmtp;
      } catch {
        return undefined;
      }
    },
    get kycFullName() {
      try {
        return kycFullName;
      } catch {
        return undefined;
      }
    },
    get setKycFullName() {
      try {
        return setKycFullName;
      } catch {
        return undefined;
      }
    },
    get kycDocType() {
      try {
        return kycDocType;
      } catch {
        return undefined;
      }
    },
    get setKycDocType() {
      try {
        return setKycDocType;
      } catch {
        return undefined;
      }
    },
    get kycDocNumber() {
      try {
        return kycDocNumber;
      } catch {
        return undefined;
      }
    },
    get setKycDocNumber() {
      try {
        return setKycDocNumber;
      } catch {
        return undefined;
      }
    },
    get kycDocFrontUrl() {
      try {
        return kycDocFrontUrl;
      } catch {
        return undefined;
      }
    },
    get setKycDocFrontUrl() {
      try {
        return setKycDocFrontUrl;
      } catch {
        return undefined;
      }
    },
    get kycDocBackUrl() {
      try {
        return kycDocBackUrl;
      } catch {
        return undefined;
      }
    },
    get setKycDocBackUrl() {
      try {
        return setKycDocBackUrl;
      } catch {
        return undefined;
      }
    },
    get kycBankName() {
      try {
        return kycBankName;
      } catch {
        return undefined;
      }
    },
    get setKycBankName() {
      try {
        return setKycBankName;
      } catch {
        return undefined;
      }
    },
    get kycAccountNumber() {
      try {
        return kycAccountNumber;
      } catch {
        return undefined;
      }
    },
    get setKycAccountNumber() {
      try {
        return setKycAccountNumber;
      } catch {
        return undefined;
      }
    },
    get kycIfscCode() {
      try {
        return kycIfscCode;
      } catch {
        return undefined;
      }
    },
    get setKycIfscCode() {
      try {
        return setKycIfscCode;
      } catch {
        return undefined;
      }
    },
    get kycAccountHolderName() {
      try {
        return kycAccountHolderName;
      } catch {
        return undefined;
      }
    },
    get setKycAccountHolderName() {
      try {
        return setKycAccountHolderName;
      } catch {
        return undefined;
      }
    },
    get kycUpiId() {
      try {
        return kycUpiId;
      } catch {
        return undefined;
      }
    },
    get setKycUpiId() {
      try {
        return setKycUpiId;
      } catch {
        return undefined;
      }
    },
    get kycStatus() {
      try {
        return kycStatus;
      } catch {
        return undefined;
      }
    },
    get setKycStatus() {
      try {
        return setKycStatus;
      } catch {
        return undefined;
      }
    },
    get kycRejectionReason() {
      try {
        return kycRejectionReason;
      } catch {
        return undefined;
      }
    },
    get setKycRejectionReason() {
      try {
        return setKycRejectionReason;
      } catch {
        return undefined;
      }
    },
    get isUploadingFront() {
      try {
        return isUploadingFront;
      } catch {
        return undefined;
      }
    },
    get setIsUploadingFront() {
      try {
        return setIsUploadingFront;
      } catch {
        return undefined;
      }
    },
    get isUploadingBack() {
      try {
        return isUploadingBack;
      } catch {
        return undefined;
      }
    },
    get setIsUploadingBack() {
      try {
        return setIsUploadingBack;
      } catch {
        return undefined;
      }
    },
    get frontDocInputRef() {
      try {
        return frontDocInputRef;
      } catch {
        return undefined;
      }
    },
    get backDocInputRef() {
      try {
        return backDocInputRef;
      } catch {
        return undefined;
      }
    },
    get showBankChangeModal() {
      try {
        return showBankChangeModal;
      } catch {
        return undefined;
      }
    },
    get setShowBankChangeModal() {
      try {
        return setShowBankChangeModal;
      } catch {
        return undefined;
      }
    },
    get newReqBankName() {
      try {
        return newReqBankName;
      } catch {
        return undefined;
      }
    },
    get setNewReqBankName() {
      try {
        return setNewReqBankName;
      } catch {
        return undefined;
      }
    },
    get newReqAccountHolderName() {
      try {
        return newReqAccountHolderName;
      } catch {
        return undefined;
      }
    },
    get setNewReqAccountHolderName() {
      try {
        return setNewReqAccountHolderName;
      } catch {
        return undefined;
      }
    },
    get newReqAccountNumber() {
      try {
        return newReqAccountNumber;
      } catch {
        return undefined;
      }
    },
    get setNewReqAccountNumber() {
      try {
        return setNewReqAccountNumber;
      } catch {
        return undefined;
      }
    },
    get newReqConfirmAccountNumber() {
      try {
        return newReqConfirmAccountNumber;
      } catch {
        return undefined;
      }
    },
    get setNewReqConfirmAccountNumber() {
      try {
        return setNewReqConfirmAccountNumber;
      } catch {
        return undefined;
      }
    },
    get newReqIfscCode() {
      try {
        return newReqIfscCode;
      } catch {
        return undefined;
      }
    },
    get setNewReqIfscCode() {
      try {
        return setNewReqIfscCode;
      } catch {
        return undefined;
      }
    },
    get newReqUpiId() {
      try {
        return newReqUpiId;
      } catch {
        return undefined;
      }
    },
    get setNewReqUpiId() {
      try {
        return setNewReqUpiId;
      } catch {
        return undefined;
      }
    },
    get newReqProofUrl() {
      try {
        return newReqProofUrl;
      } catch {
        return undefined;
      }
    },
    get setNewReqProofUrl() {
      try {
        return setNewReqProofUrl;
      } catch {
        return undefined;
      }
    },
    get newReqReason() {
      try {
        return newReqReason;
      } catch {
        return undefined;
      }
    },
    get setNewReqReason() {
      try {
        return setNewReqReason;
      } catch {
        return undefined;
      }
    },
    get isUploadingBankProof() {
      try {
        return isUploadingBankProof;
      } catch {
        return undefined;
      }
    },
    get setIsUploadingBankProof() {
      try {
        return setIsUploadingBankProof;
      } catch {
        return undefined;
      }
    },
    get isSubmittingBankChange() {
      try {
        return isSubmittingBankChange;
      } catch {
        return undefined;
      }
    },
    get setIsSubmittingBankChange() {
      try {
        return setIsSubmittingBankChange;
      } catch {
        return undefined;
      }
    },
    get bankProofInputRef() {
      try {
        return bankProofInputRef;
      } catch {
        return undefined;
      }
    },
    get payQrUrl() {
      try {
        return payQrUrl;
      } catch {
        return undefined;
      }
    },
    get setPayQrUrl() {
      try {
        return setPayQrUrl;
      } catch {
        return undefined;
      }
    },
    get payBankName() {
      try {
        return payBankName;
      } catch {
        return undefined;
      }
    },
    get setPayBankName() {
      try {
        return setPayBankName;
      } catch {
        return undefined;
      }
    },
    get payAccountHolder() {
      try {
        return payAccountHolder;
      } catch {
        return undefined;
      }
    },
    get setPayAccountHolder() {
      try {
        return setPayAccountHolder;
      } catch {
        return undefined;
      }
    },
    get payAccountNumber() {
      try {
        return payAccountNumber;
      } catch {
        return undefined;
      }
    },
    get setPayAccountNumber() {
      try {
        return setPayAccountNumber;
      } catch {
        return undefined;
      }
    },
    get payIfsc() {
      try {
        return payIfsc;
      } catch {
        return undefined;
      }
    },
    get setPayIfsc() {
      try {
        return setPayIfsc;
      } catch {
        return undefined;
      }
    },
    get payUpiId() {
      try {
        return payUpiId;
      } catch {
        return undefined;
      }
    },
    get setPayUpiId() {
      try {
        return setPayUpiId;
      } catch {
        return undefined;
      }
    },
    get payBranch() {
      try {
        return payBranch;
      } catch {
        return undefined;
      }
    },
    get setPayBranch() {
      try {
        return setPayBranch;
      } catch {
        return undefined;
      }
    },
    get paySwiftCode() {
      try {
        return paySwiftCode;
      } catch {
        return undefined;
      }
    },
    get setPaySwiftCode() {
      try {
        return setPaySwiftCode;
      } catch {
        return undefined;
      }
    },
    get payNotes() {
      try {
        return payNotes;
      } catch {
        return undefined;
      }
    },
    get setPayNotes() {
      try {
        return setPayNotes;
      } catch {
        return undefined;
      }
    },
    get isUploadingQr() {
      try {
        return isUploadingQr;
      } catch {
        return undefined;
      }
    },
    get setIsUploadingQr() {
      try {
        return setIsUploadingQr;
      } catch {
        return undefined;
      }
    },
    get qrInputRef() {
      try {
        return qrInputRef;
      } catch {
        return undefined;
      }
    },
    get handleOpenUsernameConfirm() {
      try {
        return handleOpenUsernameConfirm;
      } catch {
        return undefined;
      }
    },
    get handleConfirmSaveUsername() {
      try {
        return handleConfirmSaveUsername;
      } catch {
        return undefined;
      }
    },
    get handlePhotoUpload() {
      try {
        return handlePhotoUpload;
      } catch {
        return undefined;
      }
    },
    get handleFrontDocUpload() {
      try {
        return handleFrontDocUpload;
      } catch {
        return undefined;
      }
    },
    get handleBackDocUpload() {
      try {
        return handleBackDocUpload;
      } catch {
        return undefined;
      }
    },
    get handleBankProofUpload() {
      try {
        return handleBankProofUpload;
      } catch {
        return undefined;
      }
    },
    get handleSubmitBankChangeRequest() {
      try {
        return handleSubmitBankChangeRequest;
      } catch {
        return undefined;
      }
    },
    get handleSaveProfile() {
      try {
        return handleSaveProfile;
      } catch {
        return undefined;
      }
    },
    get handleSubmitKyc() {
      try {
        return handleSubmitKyc;
      } catch {
        return undefined;
      }
    },
    get handleSaveCompany() {
      try {
        return handleSaveCompany;
      } catch {
        return undefined;
      }
    },
    get handleSaveSmtp() {
      try {
        return handleSaveSmtp;
      } catch {
        return undefined;
      }
    },
    get applySmtpPreset() {
      try {
        return applySmtpPreset;
      } catch {
        return undefined;
      }
    },
    get handleTestSmtpConnection() {
      try {
        return handleTestSmtpConnection;
      } catch {
        return undefined;
      }
    },
    get handleQrUpload() {
      try {
        return handleQrUpload;
      } catch {
        return undefined;
      }
    },
    get handleSavePaymentSettings() {
      try {
        return handleSavePaymentSettings;
      } catch {
        return undefined;
      }
    },
    get tabsList() {
      try {
        return tabsList;
      } catch {
        return undefined;
      }
    },
  };
  const __ctrlRef = React.useRef<any>(__ctrl);
  __ctrlRef.current = __ctrl;

  const { user, loginAs, companies, updateCompany, fetchCompanies } =
    useAuthStore();
  const { theme, setTheme } = useTheme();

  const isSuperAdmin = user?.role === "Super Admin";

  const [activeTab, setActiveTab] = React.useState<SettingsTab>("profile");
  const [successMsg, setSuccessMsg] = React.useState("");
  const [errorMsg, setErrorMsg] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = React.useState(false);

  // ── Profile Form State ──
  const [name, setName] = React.useState(user?.name || "");
  const [email, setEmail] = React.useState(user?.email || "");
  const [username, setUsername] = React.useState(user?.username || "");
  const [usernameStatus, setUsernameStatus] = React.useState<
    "idle" | "checking" | "available" | "taken" | "invalid"
  >("idle");
  const [usernameStatusMsg, setUsernameStatusMsg] = React.useState("");
  const [showUsernameConfirmModal, setShowUsernameConfirmModal] =
    React.useState(false);
  const [pendingUsername, setPendingUsername] = React.useState("");
  const [isSavingUsername, setIsSavingUsername] = React.useState(false);
  const [phone, setPhone] = React.useState(user?.phone || "");
  const [jobTitle, setJobTitle] = React.useState(
    (user as any)?.jobTitle || user?.role || "Team Member",
  );
  const [department, setDepartment] = React.useState(user?.department || "");
  const [location, setLocation] = React.useState(
    (user as any)?.location || "Kolkata, India",
  );
  const [bio, setBio] = React.useState((user as any)?.bio || "");
  const [skills, setSkills] = React.useState((user as any)?.skills || "");
  const [avatar, setAvatar] = React.useState(
    user?.avatar ||
      (user as any)?.avatarUrl ||
      `https://api.dicebear.com/7.x/notionists/svg?seed=${user?.name || "User"}`,
  );
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  // Company Settings Form State (Super Admin)
  const [companyName, setCompanyName] = React.useState("SAAMPARK Technology");
  const [currency, setCurrency] = React.useState("INR");
  const [currencySymbol, setCurrencySymbol] = React.useState("₹");
  const [address, setAddress] = React.useState(
    "Saampark House, Tech Park, India",
  );
  const [industry, setIndustry] = React.useState("Software & IT Services");

  // ── Multi-Company SMTP Settings State (Super Admin Only) ──
  const effectiveCompanies = React.useMemo(() => {
    return companies && companies.length > 0 ? companies : DEFAULT_COMPANIES;
  }, [companies]);

  const [selectedSmtpCompanyId, setSelectedSmtpCompanyId] =
    React.useState<string>("tech");
  const [companySmtpMap, setCompanySmtpMap] = React.useState<
    Record<
      string,
      {
        preset: "gmail" | "zoho" | "outlook" | "custom";
        host: string;
        port: string;
        secure: boolean;
        user: string;
        pass: string;
        fromName: string;
        fromEmail: string;
      }
    >
  >({});

  const [showSmtpPass, setShowSmtpPass] = React.useState(false);
  const [isTestingSmtp, setIsTestingSmtp] = React.useState(false);
  const [smtpTestResult, setSmtpTestResult] = React.useState<{
    success?: boolean;
    message?: string;
  } | null>(null);
  const [smtpTestRecipient, setSmtpTestRecipient] = React.useState("");

  const getInitialSmtpForCompany: any = createSettingsAction20(
    () => __ctrlRef.current,
  );

  const activeSmtpCompany = React.useMemo(() => {
    return (
      effectiveCompanies.find(
        (c) =>
          String(c.id).toLowerCase() ===
            String(selectedSmtpCompanyId).toLowerCase() ||
          String(c.slug || "").toLowerCase() ===
            String(selectedSmtpCompanyId).toLowerCase(),
      ) || effectiveCompanies[0]
    );
  }, [effectiveCompanies, selectedSmtpCompanyId]);

  const currentSmtp = React.useMemo(() => {
    if (companySmtpMap[selectedSmtpCompanyId]) {
      return companySmtpMap[selectedSmtpCompanyId];
    }
    return getInitialSmtpForCompany(activeSmtpCompany, selectedSmtpCompanyId);
  }, [
    companySmtpMap,
    selectedSmtpCompanyId,
    activeSmtpCompany,
    getInitialSmtpForCompany,
  ]);

  const updateCurrentSmtp = (updates: Partial<typeof currentSmtp>) => {
    setCompanySmtpMap((prev) => ({
      ...prev,
      [selectedSmtpCompanyId]: {
        ...currentSmtp,
        ...updates,
      },
    }));
  };

  // ── KYC Form State ──
  const [kycFullName, setKycFullName] = React.useState(user?.name || "");
  const [kycDocType, setKycDocType] = React.useState<
    "Aadhaar Card" | "PAN Card" | "Passport" | "Voter ID" | "Driving License"
  >("Aadhaar Card");
  const [kycDocNumber, setKycDocNumber] = React.useState("");
  const [kycDocFrontUrl, setKycDocFrontUrl] = React.useState("");
  const [kycDocBackUrl, setKycDocBackUrl] = React.useState("");
  const [kycBankName, setKycBankName] = React.useState("");
  const [kycAccountNumber, setKycAccountNumber] = React.useState("");
  const [kycIfscCode, setKycIfscCode] = React.useState("");
  const [kycAccountHolderName, setKycAccountHolderName] = React.useState("");
  const [kycUpiId, setKycUpiId] = React.useState("");
  const [kycStatus, setKycStatus] = React.useState<KycStatus>("Pending");
  const [kycRejectionReason, setKycRejectionReason] = React.useState("");
  const [isUploadingFront, setIsUploadingFront] = React.useState(false);
  const [isUploadingBack, setIsUploadingBack] = React.useState(false);

  const frontDocInputRef = React.useRef<HTMLInputElement>(null);
  const backDocInputRef = React.useRef<HTMLInputElement>(null);

  // ── Bank Change Request State ──
  const [showBankChangeModal, setShowBankChangeModal] = React.useState(false);
  const [newReqBankName, setNewReqBankName] = React.useState("");
  const [newReqAccountHolderName, setNewReqAccountHolderName] = React.useState(
    user?.name || "",
  );
  const [newReqAccountNumber, setNewReqAccountNumber] = React.useState("");
  const [newReqConfirmAccountNumber, setNewReqConfirmAccountNumber] =
    React.useState("");
  const [newReqIfscCode, setNewReqIfscCode] = React.useState("");
  const [newReqUpiId, setNewReqUpiId] = React.useState("");
  const [newReqProofUrl, setNewReqProofUrl] = React.useState("");
  const [newReqReason, setNewReqReason] = React.useState("");
  const [isUploadingBankProof, setIsUploadingBankProof] = React.useState(false);
  const [isSubmittingBankChange, setIsSubmittingBankChange] =
    React.useState(false);
  const bankProofInputRef = React.useRef<HTMLInputElement>(null);

  // ── Company Payment QR & Bank Details State (for Invoices) ──
  const [payQrUrl, setPayQrUrl] = React.useState("");
  const [payBankName, setPayBankName] = React.useState("State Bank of India");
  const [payAccountHolder, setPayAccountHolder] = React.useState(
    "Saampark Technology & Research Pvt. Ltd.",
  );
  const [payAccountNumber, setPayAccountNumber] = React.useState("40912384759");
  const [payIfsc, setPayIfsc] = React.useState("SBIN0001234");
  const [payUpiId, setPayUpiId] = React.useState("saampark@sbi");
  const [payBranch, setPayBranch] = React.useState("Balichak Station Road");
  const [paySwiftCode, setPaySwiftCode] = React.useState("SBININBB123");
  const [payNotes, setPayNotes] = React.useState(
    "Please scan QR or transfer via NEFT/RTGS/IMPS. Mention Invoice ID in transaction note.",
  );
  const [isUploadingQr, setIsUploadingQr] = React.useState(false);
  const qrInputRef = React.useRef<HTMLInputElement>(null);

  // Load settings & user profile & payment QR settings on mount
  React.useEffect(() => runSettingsEffect50(() => __ctrlRef.current), [user]);

  // Real-time debounced username availability checker
  React.useEffect(
    () => runSettingsEffect51(() => __ctrlRef.current),
    [username, user?.username, user?.id, user?.email],
  );

  const handleOpenUsernameConfirm = (e: React.MouseEvent) => {
    e.preventDefault();
    const clean = (username || "").toLowerCase().trim();
    if (!clean || usernameStatus !== "available") return;
    setPendingUsername(clean);
    setShowUsernameConfirmModal(true);
  };

  const handleConfirmSaveUsername: any = createSettingsFn52(
    () => __ctrlRef.current,
  );

  // Handle Photo Upload directly with permanent ImgBB Cloud Hosting & Automatic Compression
  const handlePhotoUpload: any = createSettingsAction21(
    () => __ctrlRef.current,
  );

  // Handle KYC Document Front Upload (ImgBB)
  const handleFrontDocUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingFront(true);
    try {
      const res = await uploadToImgBB(
        file,
        `kyc_front_${user?.id || "doc"}_${Date.now()}`,
      );
      if (res.url) {
        setKycDocFrontUrl(res.url);
        setSuccessMsg("📄 Front document image uploaded successfully!");
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch {
      setErrorMsg("Failed to upload document. Please retry.");
    } finally {
      setIsUploadingFront(false);
    }
  };

  // Handle KYC Document Back Upload (ImgBB)
  const handleBackDocUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingBack(true);
    try {
      const res = await uploadToImgBB(
        file,
        `kyc_back_${user?.id || "doc"}_${Date.now()}`,
      );
      if (res.url) {
        setKycDocBackUrl(res.url);
        setSuccessMsg("📄 Back document image uploaded successfully!");
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch {
      setErrorMsg("Failed to upload document. Please retry.");
    } finally {
      setIsUploadingBack(false);
    }
  };

  // Handle Bank Proof Upload for Change Request
  const handleBankProofUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingBankProof(true);
    try {
      const res = await uploadToImgBB(
        file,
        `bank_proof_${user?.id || "doc"}_${Date.now()}`,
      );
      if (res.url) {
        setNewReqProofUrl(res.url);
        setSuccessMsg("📄 Passbook/Cheque document uploaded successfully!");
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch {
      setErrorMsg("Failed to upload document proof. Please retry.");
    } finally {
      setIsUploadingBankProof(false);
    }
  };

  // Submit Bank Account & UPI Change Request
  const handleSubmitBankChangeRequest: any = createSettingsAction22(
    () => __ctrlRef.current,
  );

  // Save Complete User Profile
  const handleSaveProfile: any = createSettingsHandler1(
    () => __ctrlRef.current,
  );

  // Submit KYC Details Form
  const handleSubmitKyc: any = createSettingsAction23(() => __ctrlRef.current);

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) return;
    setLoading(true);
    await saveModuleDataToDB("settings", {
      companyName,
      currency,
      currencySymbol,
      address,
      industry,
    });
    setLoading(false);
    setSuccessMsg("Company settings saved to MySQL database successfully!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleSaveSmtp: any = createSettingsAction24(() => __ctrlRef.current);

  const applySmtpPreset = (preset: "gmail" | "zoho" | "outlook" | "custom") => {
    setSmtpTestResult(null);
    if (preset === "gmail") {
      updateCurrentSmtp({
        preset: "gmail",
        host: "smtp.gmail.com",
        port: "587",
        secure: false,
      });
    } else if (preset === "zoho") {
      updateCurrentSmtp({
        preset: "zoho",
        host: "smtp.zoho.in",
        port: "465",
        secure: true,
      });
    } else if (preset === "outlook") {
      updateCurrentSmtp({
        preset: "outlook",
        host: "smtp.office365.com",
        port: "587",
        secure: false,
      });
    } else {
      updateCurrentSmtp({ preset: "custom" });
    }
  };

  const handleTestSmtpConnection: any = createSettingsAction25(
    () => __ctrlRef.current,
  );

  const handleQrUpload: any = createSettingsFn53(() => __ctrlRef.current);

  const handleSavePaymentSettings: any = createSettingsFn54(
    () => __ctrlRef.current,
  );

  // Visible Tabs Filter based on user role
  const tabsList = React.useMemo(() => {
    const base: { id: SettingsTab; label: string; icon: any }[] = [
      { id: "profile", label: "My Profile & Avatar", icon: User },
      { id: "kyc", label: "🛡️ KYC Verification & Banking", icon: ShieldCheck },
    ];
    if (isSuperAdmin || user?.role === "Admin") {
      base.push({
        id: "payments",
        label: "💳 Invoice Payment QR & Bank",
        icon: QrCode,
      });
    }
    if (isSuperAdmin) {
      base.push(
        {
          id: "entity-permissions",
          label: "🏢 Entity Module Permissions",
          icon: Building2,
        },
        { id: "company", label: "Workspace Branding", icon: Settings },
        { id: "smtp", label: "Email / SMTP Setup", icon: Mail },
      );
    }
    base.push({ id: "theme", label: "Display & Theme", icon: Sun });
    return base;
  }, [isSuperAdmin, user?.role]);

  __ctrlRef.current = __ctrl;
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-[1200px] mx-auto p-4 sm:p-6"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Settings className="text-blue-600" size={24} />
            <span>Account & Workspace Settings</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Manage your complete user profile, upload profile photo, and
            configure company settings
          </p>
        </div>
      </div>

      {/* Alerts */}
      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 rounded-xl border border-emerald-200 text-xs font-semibold flex items-center gap-2 shadow-xs"
        >
          <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </motion.div>
      )}

      {errorMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 rounded-xl border border-rose-200 text-xs font-semibold flex items-center gap-2 shadow-xs"
        >
          <AlertCircle size={16} className="shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2 overflow-x-auto">
        {tabsList.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: COMPLETE USER PROFILE & PERMANENT AVATAR ─────────────────── */}
      <SettingsSection1 ctrl={__ctrl} />

      {/* ── TAB: KYC VERIFICATION & BANKING ───────────────────────────────── */}
      <SettingsSection2 ctrl={__ctrl} />

      <SettingsSection3 ctrl={__ctrl} />

      <SettingsSection4 ctrl={__ctrl} />

      <SettingsSection5 ctrl={__ctrl} />

      {/* ── TAB: ENTITY MODULE PERMISSIONS (SUPER ADMIN ONLY) ── */}
      {activeTab === "entity-permissions" && isSuperAdmin && (
        <EntityModulePermissionsTab />
      )}

      {/* ── TAB: THEME ────────────────────────────────────────────────────── */}
      {activeTab === "theme" && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 space-y-4 max-w-2xl text-xs shadow-2xs">
          <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Globe size={16} className="text-blue-600" />
            <span>Appearance & Theme Preferences</span>
          </h3>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`p-4 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                theme === "dark"
                  ? "border-blue-600 bg-blue-50/20 text-blue-600 font-bold"
                  : "border-zinc-200 dark:border-zinc-700"
              }`}
            >
              <Moon size={20} />
              <div className="text-left">
                <p className="text-sm font-semibold">Dark Theme</p>
                <p className="text-[11px] text-zinc-400">Sleek dark mode</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`p-4 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                theme === "light"
                  ? "border-blue-600 bg-blue-50/20 text-blue-600 font-bold"
                  : "border-zinc-200 dark:border-zinc-700"
              }`}
            >
              <Sun size={20} />
              <div className="text-left">
                <p className="text-sm font-semibold">Light Theme</p>
                <p className="text-[11px] text-zinc-400">Crisp light mode</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* ── USERNAME SAVE CONFIRMATION MODAL ── */}
      {showUsernameConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl">
              <Tag size={24} />
            </div>

            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Confirm New Username
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                Are you sure you want to set your username to:
              </p>
              <div className="my-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-center">
                <span className="text-base font-extrabold font-mono text-blue-600 dark:text-blue-400">
                  @{pendingUsername}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                After saving, you will be able to log in to your account with
                either your registered email address or{" "}
                <strong>@{pendingUsername}</strong> using your password.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowUsernameConfirmModal(false)}
                disabled={isSavingUsername}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmSaveUsername}
                disabled={isSavingUsername}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold"
              >
                {isSavingUsername ? "Saving..." : "Confirm & Save"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
