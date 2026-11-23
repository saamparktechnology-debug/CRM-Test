"use client"

import * as React from "react";
import { useMasterBundle } from "@/features/masters/hooks/useMasters"
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

export function EmployeeKycGateSection2({ ctrl }: { ctrl: any }) {
  const { data: masterBundle } = useMasterBundle()
  const { showForm, kycStatus, user, handleSubmitKyc, passportPhotoUrl, setPassportPhotoUrl, handleFileUpload, uploadingPassport, fullName, setFullName, fatherOrGuardianName, setFatherOrGuardianName, dob, setDob, gender, setGender, phone, setPhone, bloodGroup, setBloodGroup, maritalStatus, setMaritalStatus, ec1Name, setEc1Name, ec1Relation, setEc1Relation, ec1CustomRelation, setEc1CustomRelation, ec1Phone, setEc1Phone, ec2Name, setEc2Name, ec2Relation, setEc2Relation, ec2CustomRelation, setEc2CustomRelation, ec2Phone, setEc2Phone, pincode, handlePincodeLookup, pinLookupStatus, pinLookupMsg, availablePostOffices, selectedPostOffice, setSelectedPostOffice, city, setCity, district, setDistrict, state, setState, streetAddress, setStreetAddress, landmark, setLandmark, docType, setDocType, docNumber, setDocNumber, docFrontUrl, setDocFrontUrl, uploadingFront, docBackUrl, setDocBackUrl, uploadingBack, panNumber, setPanNumber, panDocUrl, setPanDocUrl, uploadingPan, bankName, setBankName, accountHolderName, setAccountHolderName, bankBranch, setBankBranch, accountNumber, setAccountNumber, confirmAccountNumber, setConfirmAccountNumber, ifscCode, setIfscCode, upiId, setUpiId, bankProofUrl, setBankProofUrl, uploadingBankProof, declarationAccepted, setDeclarationAccepted, formError, rawKyc, setIsReuploading, isSubmitting } = ctrl;
  return (
    <>
      {showForm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl text-zinc-900 dark:text-zinc-100"
          >
            {kycStatus === "Rejected" && user.kycData?.rejectionReason && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 mb-6 flex items-start gap-3 text-xs">
                <ShieldAlert
                  size={18}
                  className="text-rose-600 shrink-0 mt-0.5"
                />
                <div>
                  <strong className="block font-bold">
                    Verification Correction Required:
                  </strong>
                  <span>{user.kycData.rejectionReason}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmitKyc} className="space-y-8">
              {/* ═══════════════════════════════════════════════════════════════
                  SECTION 1: PERSONAL IDENTITY & PASSPORT PHOTO
                 ═══════════════════════════════════════════════════════════════ */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                  <div className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                    Personal Identity &amp; Passport Photo
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                  {/* Passport Photo Upload Box */}
                  <div className="md:col-span-1 p-3.5 rounded-2xl border-2 border-dashed border-indigo-200 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/20 text-center space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                      Passport Size Photo *
                    </span>
                    {passportPhotoUrl ? (
                      <div className="relative mx-auto w-28 h-32 rounded-xl overflow-hidden border-2 border-indigo-500 shadow-md">
                        <img
                          src={passportPhotoUrl}
                          alt="Passport Photo"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setPassportPhotoUrl("")}
                          className="absolute top-1 right-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full p-1 shadow-sm transition-colors cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center p-4 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-indigo-100/50 dark:hover:bg-indigo-900/40 transition-colors cursor-pointer min-h-30">
                        <Camera size={26} className="text-indigo-500 mb-1" />
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          Upload Photo
                        </span>
                        <span className="text-[9px] text-zinc-400 mt-0.5">
                          Passport Headshot (JPG/PNG)
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            e.target.files?.[0] &&
                            handleFileUpload(e.target.files[0], "passport")
                          }
                          className="hidden"
                          disabled={uploadingPassport}
                        />
                      </label>
                    )}
                    {uploadingPassport && (
                      <p className="text-[10px] text-indigo-500 font-bold animate-pulse">
                        Uploading Photo...
                      </p>
                    )}
                  </div>

                  {/* Personal Inputs Grid */}
                  <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                        Full Legal Name *
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="As shown in Government ID"
                        required
                        className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                        Father&apos;s / Guardian&apos;s Name *
                      </label>
                      <input
                        type="text"
                        value={fatherOrGuardianName}
                        onChange={(e) =>
                          setFatherOrGuardianName(e.target.value)
                        }
                        placeholder="Father or Legal Guardian"
                        required
                        className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                        Date of Birth (DOB) *
                      </label>
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                        Gender *
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden cursor-pointer"
                      >
                        {(masterBundle?.options?.["gender"] || []).map((opt) => (
                  <option key={opt.id} value={opt.value}>{opt.label}</option>
                ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                        Primary Mobile Phone *
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        required
                        className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                          Blood Group
                        </label>
                        <select
                          value={bloodGroup}
                          onChange={(e) => setBloodGroup(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden cursor-pointer"
                        >
                          {[
                            "A+",
                            "A-",
                            "B+",
                            "B-",
                            "O+",
                            "O-",
                            "AB+",
                            "AB-",
                          ].map((bg) => (
                            <option key={bg} value={bg}>
                              {bg}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                          Marital Status
                        </label>
                        <select
                          value={maritalStatus}
                          onChange={(e) => setMaritalStatus(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden cursor-pointer"
                        >
                          {(masterBundle?.options?.["marital_status"] || []).map((opt) => (
                  <option key={opt.id} value={opt.value}>{opt.label}</option>
                ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ═══════════════════════════════════════════════════════════════
                  SECTION 2: EMERGENCY CONTACTS (CONTACT 1 & CONTACT 2)
                 ═══════════════════════════════════════════════════════════════ */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                  <div className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                    Emergency Contacts (Contact 1 &amp; Contact 2)
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Emergency Contact 1 Card */}
                  <div className="p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/80 space-y-3">
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                      <Phone size={14} />
                      <span>Emergency Contact 1 (Primary) *</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                        Contact Person Name *
                      </label>
                      <input
                        type="text"
                        value={ec1Name}
                        onChange={(e) => setEc1Name(e.target.value)}
                        placeholder="e.g. Ramesh Ghosh"
                        required
                        className="w-full px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-surface text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                          Relationship *
                        </label>
                        <select
                          value={ec1Relation}
                          onChange={(e) => setEc1Relation(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-surface text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden cursor-pointer"
                        >
                          {RELATIONSHIP_OPTIONS.map((rel) => (
                            <option key={rel} value={rel}>
                              {rel}
                            </option>
                          ))}
                        </select>
                      </div>

                      {ec1Relation === "Other" ? (
                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                            Specify Relation *
                          </label>
                          <input
                            type="text"
                            value={ec1CustomRelation}
                            onChange={(e) =>
                              setEc1CustomRelation(e.target.value)
                            }
                            placeholder="e.g. Uncle / Roommate"
                            required
                            className="w-full px-2.5 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-surface text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                            Relationship Type
                          </label>
                          <span className="block px-2.5 py-1.5 text-xs text-muted-foreground bg-muted/40 rounded-xl border border-border/50">
                            {ec1Relation}
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={ec1Phone}
                        onChange={(e) => setEc1Phone(e.target.value)}
                        placeholder="+91 98765 00001"
                        required
                        className="w-full px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-surface text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Emergency Contact 2 Card */}
                  <div className="p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/80 space-y-3">
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                      <Phone size={14} />
                      <span>Emergency Contact 2 (Secondary) *</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                        Contact Person Name *
                      </label>
                      <input
                        type="text"
                        value={ec2Name}
                        onChange={(e) => setEc2Name(e.target.value)}
                        placeholder="e.g. Sunita Ghosh"
                        required
                        className="w-full px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-surface text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                          Relationship *
                        </label>
                        <select
                          value={ec2Relation}
                          onChange={(e) => setEc2Relation(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-surface text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden cursor-pointer"
                        >
                          {RELATIONSHIP_OPTIONS.map((rel) => (
                            <option key={rel} value={rel}>
                              {rel}
                            </option>
                          ))}
                        </select>
                      </div>

                      {ec2Relation === "Other" ? (
                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                            Specify Relation *
                          </label>
                          <input
                            type="text"
                            value={ec2CustomRelation}
                            onChange={(e) =>
                              setEc2CustomRelation(e.target.value)
                            }
                            placeholder="e.g. Cousin / Neighbor"
                            required
                            className="w-full px-2.5 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-surface text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                            Relationship Type
                          </label>
                          <span className="block px-2.5 py-1.5 text-xs text-muted-foreground bg-muted/40 rounded-xl border border-border/50">
                            {ec2Relation}
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={ec2Phone}
                        onChange={(e) => setEc2Phone(e.target.value)}
                        placeholder="+91 98765 00002"
                        required
                        className="w-full px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-surface text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ═══════════════════════════════════════════════════════════════
                  SECTION 3: RESIDENTIAL ADDRESS WITH PIN CODE API (PIN FIRST)
                 ═══════════════════════════════════════════════════════════════ */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">
                      3
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                      Residential Address (Fill PIN Code First)
                    </h3>
                  </div>
                  <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                    ⚡ India Postal API Integrated
                  </span>
                </div>

                {/* Step 3.1: PIN CODE INPUT FIRST */}
                <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border-2 border-indigo-200 dark:border-indigo-800/80 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                    <div>
                      <label className="block text-[11px] font-bold text-indigo-900 dark:text-indigo-200 mb-1">
                        1. Enter 6-Digit Indian PIN Code *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          maxLength={6}
                          value={pincode}
                          onChange={(e) => handlePincodeLookup(e.target.value)}
                          placeholder="e.g. 700001 or 721139"
                          required
                          className="w-full px-3 py-2 rounded-xl border-2 border-indigo-300 dark:border-indigo-700 bg-white dark:bg-zinc-800 text-sm font-mono font-bold tracking-wider focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        />
                        {pinLookupStatus === "loading" && (
                          <div className="absolute right-3 top-2.5">
                            <RefreshCw
                              size={14}
                              className="animate-spin text-indigo-600"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <span className="text-[11px] font-bold text-muted-foreground block">
                        Postal API Lookup Feedback:
                      </span>
                      {pinLookupMsg ? (
                        <div
                          className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${
                            pinLookupStatus === "success"
                              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                              : pinLookupStatus === "loading"
                                ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800"
                                : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                          }`}
                        >
                          {pinLookupStatus === "success" ? (
                            <CheckCircle2 size={14} className="shrink-0" />
                          ) : (
                            <AlertCircle size={14} className="shrink-0" />
                          )}
                          <span>{pinLookupMsg}</span>
                        </div>
                      ) : (
                        <p className="text-[11px] text-zinc-500">
                          Type your 6-digit postal code above to auto-detect
                          your State, District, and Post Office area.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Auto-populated Location Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
                    {/* Select Post Office */}
                    <div className="sm:col-span-1">
                      <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                        Post Office / Area *
                      </label>
                      {availablePostOffices.length > 0 ? (
                        <select
                          value={selectedPostOffice}
                          onChange={(e) =>
                            setSelectedPostOffice(e.target.value)
                          }
                          className="w-full px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden cursor-pointer"
                        >
                          {availablePostOffices.map((po) => (
                            <option key={po} value={po}>
                              {po}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={selectedPostOffice}
                          onChange={(e) =>
                            setSelectedPostOffice(e.target.value)
                          }
                          placeholder="e.g. Balichak PO"
                          className="w-full px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                        />
                      )}
                    </div>

                    {/* City / Block */}
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                        City / Town / Block *
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="City"
                        required
                        className="w-full px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>

                    {/* District */}
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                        District *
                      </label>
                      <input
                        type="text"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        placeholder="District"
                        required
                        className="w-full px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>

                    {/* State */}
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="State"
                        required
                        className="w-full px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Step 3.2: STREET & HOUSE DETAILS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                      2. House No. / Flat / Building / Street Address *
                    </label>
                    <input
                      type="text"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      placeholder="e.g. Flat 3B, Sunshine Heights, Station Road"
                      required
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                      Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="e.g. Near SBI Balichak Branch"
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Full Address Preview */}
                {(streetAddress || city || pincode) && (
                  <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs text-muted-foreground flex items-start gap-2">
                    <MapPin
                      size={14}
                      className="text-primary shrink-0 mt-0.5"
                    />
                    <div>
                      <strong className="text-foreground">
                        Computed Full Address:{" "}
                      </strong>
                      <span>
                        {[
                          streetAddress,
                          landmark ? `Near ${landmark}` : "",
                          selectedPostOffice ? `PO: ${selectedPostOffice}` : "",
                          city,
                          district,
                          state,
                          pincode ? `PIN: ${pincode}` : "",
                          "India",
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* ═══════════════════════════════════════════════════════════════
                  SECTION 4: GOVERNMENT IDENTITY PROOF
                 ═══════════════════════════════════════════════════════════════ */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                  <div className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">
                    4
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                    Government Identification Document
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                      Primary Document Type *
                    </label>
                    <select
                      value={docType}
                      onChange={(e) => setDocType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden cursor-pointer"
                    >
                      {(masterBundle?.options?.["kyc_id_type"] || []).map((opt) => (
                  <option key={opt.id} value={opt.value}>{opt.label}</option>
                ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                      Document Identification Number *
                    </label>
                    <input
                      type="text"
                      value={docNumber}
                      onChange={(e) =>
                        setDocNumber(e.target.value.toUpperCase())
                      }
                      placeholder={
                        docType === "Aadhaar Card"
                          ? "XXXX XXXX XXXX"
                          : docType === "PAN Card"
                            ? "ABCDE1234F"
                            : "Document Number"
                      }
                      required
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden uppercase"
                    />
                  </div>
                </div>

                {/* Upload Photos Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Front Photo */}
                  <div className="p-4 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40 text-center space-y-3">
                    <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 block">
                      {docType} Front Photo *
                    </span>
                    {docFrontUrl ? (
                      <div className="relative rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 max-h-36 mx-auto bg-black/10">
                        <img
                          src={docFrontUrl}
                          alt="Document Front"
                          className="w-full h-32 object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => setDocFrontUrl("")}
                          className="absolute top-1 right-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full p-1 text-[10px] cursor-pointer shadow-sm"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center p-4 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-700/50 transition-colors cursor-pointer">
                        <Upload size={22} className="text-indigo-500 mb-1" />
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          Upload Front Side
                        </span>
                        <span className="text-[10px] text-zinc-400 mt-0.5">
                          JPG, PNG or PDF (Max 10MB)
                        </span>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) =>
                            e.target.files?.[0] &&
                            handleFileUpload(e.target.files[0], "front")
                          }
                          className="hidden"
                          disabled={uploadingFront}
                        />
                      </label>
                    )}
                    {uploadingFront && (
                      <p className="text-[10px] text-indigo-500 font-bold animate-pulse">
                        Uploading Front Photo...
                      </p>
                    )}
                  </div>

                  {/* Back Photo */}
                  <div className="p-4 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40 text-center space-y-3">
                    <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 block">
                      {docType} Back Side Photo (Address Side)
                    </span>
                    {docBackUrl ? (
                      <div className="relative rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 max-h-36 mx-auto bg-black/10">
                        <img
                          src={docBackUrl}
                          alt="Document Back"
                          className="w-full h-32 object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => setDocBackUrl("")}
                          className="absolute top-1 right-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full p-1 text-[10px] cursor-pointer shadow-sm"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center p-4 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-700/50 transition-colors cursor-pointer">
                        <Upload size={22} className="text-indigo-500 mb-1" />
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          Upload Back Side
                        </span>
                        <span className="text-[10px] text-zinc-400 mt-0.5">
                          JPG, PNG or PDF (Max 10MB)
                        </span>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) =>
                            e.target.files?.[0] &&
                            handleFileUpload(e.target.files[0], "back")
                          }
                          className="hidden"
                          disabled={uploadingBack}
                        />
                      </label>
                    )}
                    {uploadingBack && (
                      <p className="text-[10px] text-indigo-500 font-bold animate-pulse">
                        Uploading Back Photo...
                      </p>
                    )}
                  </div>
                </div>

                {/* Additional PAN Card if primary is Aadhaar/Voter */}
                {docType !== "PAN Card" && (
                  <div className="p-3.5 rounded-2xl bg-zinc-50/60 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">
                        PAN Card (For Tax &amp; Payroll Compliance)
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        Recommended
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                      <input
                        type="text"
                        value={panNumber}
                        onChange={(e) =>
                          setPanNumber(e.target.value.toUpperCase())
                        }
                        placeholder="Permanent Account Number (e.g. ABCDE1234F)"
                        maxLength={10}
                        className="w-full px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-surface text-xs font-mono uppercase"
                      />
                      <div className="flex items-center gap-2">
                        {panDocUrl ? (
                          <div className="flex items-center gap-2 text-xs text-emerald-600 font-bold">
                            <CheckCircle2 size={16} />
                            <span>PAN Document Uploaded</span>
                            <button
                              type="button"
                              onClick={() => setPanDocUrl("")}
                              className="text-rose-500 text-xs ml-1 hover:underline cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-surface text-xs font-semibold hover:bg-surface-hover cursor-pointer">
                            <Upload size={13} className="text-indigo-500" />
                            <span>
                              {uploadingPan
                                ? "Uploading..."
                                : "Upload PAN Card Photo"}
                            </span>
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              onChange={(e) =>
                                e.target.files?.[0] &&
                                handleFileUpload(e.target.files[0], "pan")
                              }
                              className="hidden"
                              disabled={uploadingPan}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ═══════════════════════════════════════════════════════════════
                  SECTION 5: SALARY BANK REMITTANCE & PASSBOOK UPLOAD
                 ═══════════════════════════════════════════════════════════════ */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold">
                    5
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                    Salary Remittance Bank Details &amp; Passbook Upload
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                      Bank Name *
                    </label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="e.g. State Bank of India, HDFC, ICICI"
                      required
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                      Account Holder Name *
                    </label>
                    <input
                      type="text"
                      value={accountHolderName}
                      onChange={(e) => setAccountHolderName(e.target.value)}
                      placeholder="Name as printed in Bank Passbook"
                      required
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                      Bank Branch Name
                    </label>
                    <input
                      type="text"
                      value={bankBranch}
                      onChange={(e) => setBankBranch(e.target.value)}
                      placeholder="e.g. Balichak Branch / Kolkata Main"
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                      Account Number *
                    </label>
                    <input
                      type="password"
                      value={accountNumber}
                      onChange={(e) =>
                        setAccountNumber(e.target.value.replace(/\s+/g, ""))
                      }
                      placeholder="Enter Bank Account Number"
                      required
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                      Confirm Account Number *
                    </label>
                    <input
                      type="text"
                      value={confirmAccountNumber}
                      onChange={(e) =>
                        setConfirmAccountNumber(
                          e.target.value.replace(/\s+/g, ""),
                        )
                      }
                      placeholder="Re-enter Account Number"
                      required
                      className={`w-full px-3 py-2 rounded-xl border ${confirmAccountNumber && confirmAccountNumber !== accountNumber ? "border-rose-500 bg-rose-50/20" : "border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"} text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden`}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                      Bank IFSC Code *
                    </label>
                    <input
                      type="text"
                      value={ifscCode}
                      onChange={(e) =>
                        setIfscCode(
                          e.target.value.toUpperCase().replace(/\s+/g, ""),
                        )
                      }
                      placeholder="e.g. SBIN0001234"
                      maxLength={11}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                    UPI VPA ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) =>
                      setUpiId(e.target.value.toLowerCase().trim())
                    }
                    placeholder="e.g. yourname@okhdfcbank"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                {/* Bank Passbook / Statement Upload Box */}
                <div className="p-4 rounded-2xl border-2 border-dashed border-emerald-300 dark:border-emerald-700 bg-emerald-50/40 dark:bg-emerald-950/20 text-center space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <Landmark size={15} />
                      <span>
                        Bank Passbook / Statement / Cancelled Cheque Document *
                      </span>
                    </span>
                    <span className="text-[10px] text-muted-foreground font-semibold">
                      Required for Salary Remittance
                    </span>
                  </div>

                  {bankProofUrl ? (
                    <div className="relative rounded-2xl overflow-hidden border border-emerald-300 dark:border-emerald-700 max-h-48 mx-auto bg-black/10 p-2">
                      <img
                        src={bankProofUrl}
                        alt="Bank Passbook / Statement"
                        className="w-full h-40 object-contain rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => setBankProofUrl("")}
                        className="absolute top-3 right-3 bg-rose-600 hover:bg-rose-700 text-white rounded-full p-1.5 text-xs shadow-md cursor-pointer transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-emerald-300 dark:border-emerald-700 rounded-2xl hover:bg-emerald-100/50 dark:hover:bg-emerald-900/40 transition-colors cursor-pointer">
                      <Upload size={28} className="text-emerald-600 mb-2" />
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        Upload Bank Passbook (Front Page) or Bank Statement
                      </span>
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">
                        Ensure Account Number, IFSC Code, and Name are clearly
                        visible (JPG, PNG, PDF up to 10MB)
                      </span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) =>
                          e.target.files?.[0] &&
                          handleFileUpload(e.target.files[0], "bankProof")
                        }
                        className="hidden"
                        disabled={uploadingBankProof}
                      />
                    </label>
                  )}
                  {uploadingBankProof && (
                    <p className="text-[10px] text-emerald-600 font-bold animate-pulse">
                      Uploading Bank Document...
                    </p>
                  )}
                </div>
              </div>

              {/* ═══════════════════════════════════════════════════════════════
                  SECTION 6: LEGAL AFFIRMATION & SUBMIT
                 ═══════════════════════════════════════════════════════════════ */}
              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
                <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={declarationAccepted}
                    onChange={(e) => setDeclarationAccepted(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    I solemnly declare that all personal information, emergency
                    contacts, residential address verified via India Postal PIN
                    Code, government identity documents, and salary bank
                    passbook details provided above are authentic, accurate, and
                    complete. I authorize SAAMPARK Group to verify these
                    credentials for operational onboarding and payroll
                    remittance.
                  </span>
                </label>

                {formError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                  {rawKyc?.docNumber && (
                    <button
                      type="button"
                      onClick={() => setIsReuploading(false)}
                      className="text-xs font-bold text-zinc-500 hover:text-zinc-700 cursor-pointer"
                    >
                      ← Cancel &amp; Return to Review Status
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting || !declarationAccepted}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-sm text-white bg-linear-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 shadow-lg shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer disabled:opacity-50 ml-auto"
                  >
                    <span>
                      {isSubmitting
                        ? "Submitting Onboarding Credentials..."
                        : "Submit All Credentials for Verification"}
                    </span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
    </>
  );
}
