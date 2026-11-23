"use client"

import * as React from "react"
import { useMasterBundle } from "@/features/masters/hooks/useMasters"
import { motion, AnimatePresence } from "framer-motion"
import { UploadCloud, X, FileCheck } from "lucide-react"
import { DocumentFormValues } from "../types"

interface UploadDocumentModalProps {
  isOpen: boolean
  values: DocumentFormValues
  onClose: () => void
  onChange: <K extends keyof DocumentFormValues>(key: K, value: DocumentFormValues[K]) => void
  onSubmit: (e: React.FormEvent) => void
}

export function UploadDocumentModal({
  isOpen,
  values,
  onClose,
  onChange,
  onSubmit,
}: UploadDocumentModalProps) {
  const { data: masterBundle } = useMasterBundle()
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="font-bold text-sm">Upload Document (Multipart)</h3>
              <button type="button" onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-600 rounded-lg">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={onSubmit} className="p-6 space-y-4 text-xs" encType="multipart/form-data">
              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Select File *</label>
                <label className="flex flex-col items-center justify-center w-full h-24 px-4 transition bg-zinc-50 dark:bg-zinc-800/60 border-2 border-zinc-300 dark:border-zinc-700 border-dashed rounded-xl cursor-pointer hover:border-blue-500">
                  {values.file ? (
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <FileCheck size={18} />
                      <span className="truncate max-w-[260px]">{values.file.name} ({values.size})</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-2 pb-3 text-zinc-500">
                      <UploadCloud size={20} className="mb-1 text-blue-600" />
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">Choose file to upload</span>
                      <span className="text-[10px] text-zinc-400">PDF, DOCX, XLSX, PNG, JPG</span>
                    </div>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null
                      onChange("file", file)
                    }}
                  />
                </label>
              </div>
              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Document Name *</label>
                <input
                  type="text"
                  required
                  value={values.name}
                  onChange={(e) => onChange("name", e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Category</label>
                  <select
                    value={values.category}
                    onChange={(e) => onChange("category", e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-hidden"
                  >
                    {(masterBundle?.options?.["document_category"] || []).map((opt) => (
                  <option key={opt.id} value={opt.value}>{opt.label}</option>
                ))}
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Type</label>
                  <select
                    value={values.type}
                    onChange={(e) => onChange("type", e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-hidden"
                  >
                    {(masterBundle?.options?.["document_file_type"] || []).map((opt) => (
                  <option key={opt.id} value={opt.value}>{opt.label}</option>
                ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={values.expiry}
                  onChange={(e) => onChange("expiry", e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-hidden"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                >
                  Upload
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
