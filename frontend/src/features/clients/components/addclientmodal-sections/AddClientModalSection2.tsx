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
import { type AddClientModalProps } from "@/features/clients/components/addclientmodal-sections/AddClientModalHelpers"

export function AddClientModalSection2({ ctrl }: { ctrl: any }) {
  const { address, setAddress, isPincodeLoading, zip, handlePincodeChange, pincodePlaces, city, setCity, pincodeDistricts, district, setDistrict, pincodeStates, state, setState, country, setCountry, phone, setPhone, email, setEmail, website, setWebsite, vatNumber, setVatNumber, gstNumber, setGstNumber, clientGroup, setClientGroup, availableCategories, setIsAddingCategory, isAddingCategory, newCategoryInput, setNewCategoryInput, handleAddCategory } = ctrl;
  return (
    <>
      {/* Address */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-start">
              <label className="text-slate-600 dark:text-slate-400 font-medium pt-2">Address</label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Address / Street name"
                className="md:col-span-3 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Zip / Pincode with Postal Lookup */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
              <label className="text-slate-600 dark:text-slate-400 font-medium flex items-center justify-between">
                <span>PIN Code</span>
                {isPincodeLoading && (
                  <span className="text-xs text-blue-500 animate-pulse font-normal">Lookup...</span>
                )}
              </label>
              <div className="md:col-span-3 flex items-center gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={zip}
                  onChange={(e) => handlePincodeChange(e.target.value)}
                  placeholder="e.g. 700001 (auto-fills city & state)"
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* City */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
              <label className="text-slate-600 dark:text-slate-400 font-medium">City / Area</label>
              {pincodePlaces.length > 0 ? (
                <div className="md:col-span-3 flex gap-2">
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {pincodePlaces.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Or type city"
                    className="w-1/3 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                  />
                </div>
              ) : (
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Kolkata / Mumbai"
                  className="md:col-span-3 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>

            {/* District */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
              <label className="text-slate-600 dark:text-slate-400 font-medium">District</label>
              {pincodeDistricts.length > 0 ? (
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="md:col-span-3 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {pincodeDistricts.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="e.g. Central Delhi / Howrah"
                  className="md:col-span-3 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>

            {/* State */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
              <label className="text-slate-600 dark:text-slate-400 font-medium">State</label>
              {pincodeStates.length > 0 ? (
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="md:col-span-3 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {pincodeStates.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. West Bengal / Maharashtra"
                  className="md:col-span-3 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>

            {/* Country - India */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
              <label className="text-slate-600 dark:text-slate-400 font-medium">Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="India"
                className="md:col-span-3 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Phone with India Flag & +91 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
              <label className="text-slate-600 dark:text-slate-400 font-medium">Phone</label>
              <div className="md:col-span-3 flex items-center gap-2">
                <span className="px-2.5 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs flex items-center gap-1 shrink-0">
                  🇮🇳 ▾
                </span>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765-43210"
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Email */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
              <label className="text-slate-600 dark:text-slate-400 font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@company.com"
                className="md:col-span-3 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Website */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
              <label className="text-slate-600 dark:text-slate-400 font-medium">Website</label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="Website"
                className="md:col-span-3 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* VAT Number */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
              <label className="text-slate-600 dark:text-slate-400 font-medium">VAT Number</label>
              <input
                type="text"
                value={vatNumber}
                onChange={(e) => setVatNumber(e.target.value)}
                placeholder="VAT Number"
                className="md:col-span-3 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* GST Number */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
              <label className="text-slate-600 dark:text-slate-400 font-medium">GST Number</label>
              <input
                type="text"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value)}
                placeholder="GST Number"
                className="md:col-span-3 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category / Level (with dynamic '+ Add Category') */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-start">
              <label className="text-slate-600 dark:text-slate-400 font-medium pt-2">Category / Level</label>
              <div className="md:col-span-3 space-y-2">
                <div className="flex gap-2">
                  <select
                    value={clientGroup}
                    onChange={(e) => setClientGroup(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {availableCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setIsAddingCategory(!isAddingCategory)}
                    className="px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    + Add Category
                  </button>
                </div>

                {/* Inline Add Category / Level Creator */}
                {isAddingCategory && (
                  <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Diamond, Level 4, Priority Partner..."
                      value={newCategoryInput}
                      onChange={(e) => setNewCategoryInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleAddCategory()
                        }
                      }}
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleAddCategory}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingCategory(false)
                        setNewCategoryInput("")
                      }}
                      className="px-2 py-1.5 text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
    </>
  );
}
