"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Building2, GitBranch, MapPin, CheckCircle2, AlertCircle, 
  Search, SlidersHorizontal, ShieldCheck, Check, X, 
  RotateCcw, Sparkles, Layers, Eye, EyeOff, Save, Info
} from "lucide-react"
import { useAuthStore, Company, Branch, SubBranch, DEFAULT_COMPANIES } from "@/store/useAuthStore"
import { 
  usePermissionStore, 
  ALL_APP_MODULES, 
  CONFIGURABLE_MODULES, 
  CLEAN_MODULE_CATEGORIES 
} from "@/store/usePermissionStore"
import { saveModuleDataToDB, fetchModuleDataFromDB } from "@/lib/storageSync"
import { Button } from "@/components/ui/Button"

export type EntityTier = "company" | "branch" | "subbranch"
