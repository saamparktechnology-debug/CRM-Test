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

export const RELATIONSHIP_OPTIONS: string[] = [];

export function checkIsVerified(u: any): boolean {
  if (!u) return false;
  const s = String(u.kycStatus || u.kyc_status || "")
    .trim()
    .toLowerCase();
  return s === "verified" || s === "approved" || u.isKycVerified === true;
}



export interface ContentProps {
  user: any;
  logout: () => void;
  onVerified: () => void;
}
