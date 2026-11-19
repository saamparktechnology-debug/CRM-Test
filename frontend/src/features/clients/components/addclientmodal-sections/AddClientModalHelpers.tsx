"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Check, HelpCircle, User, Building, MapPin } from "lucide-react"
import { ClientItem } from "@/features/clients/types"
import { getUsers } from "@/features/users/services/userService"
import { useAuthStore, isMatchingCompany, getSelectableCompanies } from "@/store/useAuthStore"
import { sendClientWelcomeEmailNotification } from "@/services/emailNotificationService"
import { formatDisplayEmail, getClientCategories, saveClientCategory, DEFAULT_CLIENT_CATEGORIES } from "@/features/clients/services/clientService"
import { lookupPincode } from "@/lib/pincodeService"

export interface AddClientModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (client: ClientItem) => void
  initialData?: ClientItem | null
}
