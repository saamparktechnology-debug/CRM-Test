"use client"

import * as React from "react"
import { 
  X, Calculator, FileText, 
  Sparkles, Receipt
} from "lucide-react"

export function DocumentStudioModalSection2({ ctrl }: { ctrl: any }) {
  const { isMarketing, mode, docScheme, modalTitle, docNumber, activeCompany, taxableBase, calculatedGst, grandTotal, onClose, setCurrentStep, currentStep } = ctrl;
  return (
    <>
      {/* ── HEADER ── */}
        <div className="flex items-center justify-between px-3.5 py-3 sm:px-6 sm:py-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0 bg-zinc-50/80 dark:bg-zinc-800/40">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className={`p-2 sm:p-2.5 rounded-xl ${isMarketing ? "bg-purple-600 text-white" : mode === "invoice" ? (docScheme === "gst" ? "bg-teal-600 text-white" : "bg-sky-600 text-white") : mode === "quotation" ? "bg-indigo-600 text-white" : "bg-amber-600 text-white"} shadow-md shrink-0`}>
              {isMarketing ? <Sparkles size={18} /> : mode === "invoice" ? <Receipt size={18} /> : mode === "quotation" ? <FileText size={18} /> : <Calculator size={18} />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 truncate">{modalTitle}</h2>
                <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${
                  isMarketing ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300" :
                  mode === "quotation" ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300" :
                  mode === "estimate" ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" :
                  docScheme === "gst" ? "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300" : "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300"
                }`}>
                  {isMarketing ? "Marketing Retainer" : mode === "quotation" ? "Quotation" : mode === "estimate" ? "Estimate" : docScheme === "gst" ? "GST Invoice" : "Non-GST"}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-zinc-500 font-mono font-bold mt-0.5 truncate">
                Ref: {docNumber} • {activeCompany?.brand_name || activeCompany?.name}
              </p>
            </div>
          </div>

          {/* Quick Live Totals Badge */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
              <div>
                <span className="text-[10px] text-zinc-400 block leading-none">Subtotal</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200 font-mono">₹{taxableBase.toLocaleString("en-IN")}</span>
              </div>
              {((mode === "invoice" || isMarketing) && docScheme === "gst") && (
                <div>
                  <span className="text-[10px] text-zinc-400 block leading-none">GST Tax</span>
                  <span className="font-bold text-teal-600 dark:text-teal-400 font-mono">+₹{calculatedGst.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="border-l border-zinc-200 dark:border-zinc-700 pl-3">
                <span className="text-[10px] text-zinc-400 block leading-none font-bold">
                  {mode === "quotation" ? "Value" : "Total"}
                </span>
                <span className="font-black text-emerald-600 dark:text-emerald-400 font-mono text-sm">₹{grandTotal.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <button 
              type="button" 
              onClick={onClose} 
              className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── CLEAN TAB BAR TAILORED BY DOCUMENT TYPE (Fully Mobile Scrollable) ── */}
        <div className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 text-center font-bold shrink-0 overflow-x-auto">
          {isMarketing ? (
            <div className="flex sm:grid sm:grid-cols-3 min-w-full">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className={`py-2.5 sm:py-3 px-3.5 border-b-2 text-[11px] sm:text-xs transition-all cursor-pointer whitespace-nowrap flex-1 ${
                  currentStep === 1 ? "border-purple-600 text-purple-600 bg-white dark:bg-zinc-900 font-bold" : "border-transparent text-zinc-500 hover:text-zinc-800"
                }`}
              >
                1. Entity &amp; Client
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className={`py-2.5 sm:py-3 px-3.5 border-b-2 text-[11px] sm:text-xs transition-all cursor-pointer whitespace-nowrap flex-1 ${
                  currentStep === 2 ? "border-purple-600 text-purple-600 bg-white dark:bg-zinc-900 font-bold" : "border-transparent text-zinc-500 hover:text-zinc-800"
                }`}
              >
                2. Growth Package
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className={`py-2.5 sm:py-3 px-3.5 border-b-2 text-[11px] sm:text-xs transition-all cursor-pointer whitespace-nowrap flex-1 ${
                  currentStep === 3 ? "border-purple-600 text-purple-600 bg-white dark:bg-zinc-900 font-bold" : "border-transparent text-zinc-500 hover:text-zinc-800"
                }`}
              >
                3. Settlement &amp; Notes
              </button>
            </div>
          ) : mode === "quotation" ? (
            <div className="flex sm:grid sm:grid-cols-3 min-w-full">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className={`py-2.5 sm:py-3 px-3.5 border-b-2 text-[11px] sm:text-xs transition-all cursor-pointer whitespace-nowrap flex-1 ${
                  currentStep === 1 ? "border-indigo-600 text-indigo-600 bg-white dark:bg-zinc-900 font-bold" : "border-transparent text-zinc-500 hover:text-zinc-800"
                }`}
              >
                1. Entity &amp; Client
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className={`py-2.5 sm:py-3 px-3.5 border-b-2 text-[11px] sm:text-xs transition-all cursor-pointer whitespace-nowrap flex-1 ${
                  currentStep === 2 ? "border-indigo-600 text-indigo-600 bg-white dark:bg-zinc-900 font-bold" : "border-transparent text-zinc-500 hover:text-zinc-800"
                }`}
              >
                2. Scope &amp; Deliverables
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className={`py-2.5 sm:py-3 px-3.5 border-b-2 text-[11px] sm:text-xs transition-all cursor-pointer whitespace-nowrap flex-1 ${
                  currentStep === 3 ? "border-indigo-600 text-indigo-600 bg-white dark:bg-zinc-900 font-bold" : "border-transparent text-zinc-500 hover:text-zinc-800"
                }`}
              >
                3. Pricing &amp; Terms
              </button>
            </div>
          ) : mode === "estimate" ? (
            <div className="flex sm:grid sm:grid-cols-2 min-w-full">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className={`py-2.5 sm:py-3 px-3.5 border-b-2 text-[11px] sm:text-xs transition-all cursor-pointer whitespace-nowrap flex-1 ${
                  currentStep === 1 ? "border-amber-600 text-amber-600 bg-white dark:bg-zinc-900 font-bold" : "border-transparent text-zinc-500 hover:text-zinc-800"
                }`}
              >
                1. Estimate &amp; Client Details
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className={`py-2.5 sm:py-3 px-3.5 border-b-2 text-[11px] sm:text-xs transition-all cursor-pointer whitespace-nowrap flex-1 ${
                  currentStep === 2 ? "border-amber-600 text-amber-600 bg-white dark:bg-zinc-900 font-bold" : "border-transparent text-zinc-500 hover:text-zinc-800"
                }`}
              >
                2. Estimated Services &amp; Notes
              </button>
            </div>
          ) : (
            <div className="flex sm:grid sm:grid-cols-2 min-w-full">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className={`py-2.5 sm:py-3 px-3.5 border-b-2 text-[11px] sm:text-xs transition-all cursor-pointer whitespace-nowrap flex-1 ${
                  currentStep === 1 ? "border-teal-600 text-teal-600 bg-white dark:bg-zinc-900 font-bold" : "border-transparent text-zinc-500 hover:text-zinc-800"
                }`}
              >
                1. Entity &amp; Client Details
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className={`py-2.5 sm:py-3 px-3.5 border-b-2 text-[11px] sm:text-xs transition-all cursor-pointer whitespace-nowrap flex-1 ${
                  currentStep === 2 ? "border-teal-600 text-teal-600 bg-white dark:bg-zinc-900 font-bold" : "border-transparent text-zinc-500 hover:text-zinc-800"
                }`}
              >
                2. Items &amp; Settlement
              </button>
            </div>
          )}
        </div>
    </>
  );
}
