"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { 
  MapPin, Phone, Mail, Globe, Building2, Landmark, ShieldCheck, 
  Award, Sparkles, UserCheck, Briefcase, FileText, QrCode, CreditCard, 
  CheckCircle2, Layers, Check, Megaphone
} from "lucide-react"
import { InvoiceItem, InvoiceLineItem, parseCurrencyNumber } from "@/features/invoice/services/invoiceService"
import { CompanyPaymentSettings } from "@/features/settings/services/companyPaymentService"
import { ClientItem } from "@/features/clients/types"
import { useAuthStore, Company, Branch, SubBranch, DEFAULT_COMPANIES, getCompanyLogoUrl, isMatchingCompany } from "@/store/useAuthStore"
import { getQrCodeDataUri } from "@/lib/qrCode"
import { type CustomTextStamp, TextEditContext, type OfficialInvoiceDocumentProps, EditableText, formatInvoiceDate, numberToIndianWords, safeFormatCurrency } from "@/features/invoice/components/officialinvoicedocument-sections/OfficialInvoiceDocumentHelpers"

export function OfficialInvoiceDocumentSection1({ ctrl }: { ctrl: any }) {
  const { paginatedPages, customStamps, interactive, onCustomStampMove, onCustomStampUpdate, onRemoveCustomStamp, renderTopHeader, totalPages, renderEntityHierarchyStrip, renderInfoCards, renderTable, renderFinancialsAndFooter, renderPageFooterOnly } = ctrl;
  return (
    <>
      {paginatedPages.map((pg) => (
        <div
          key={`invoice-page-${pg.pageNumber}`}
          className="a4-page bg-white text-zinc-900 font-sans p-5 sm:p-6 text-xs shadow-2xl border border-zinc-200/90 rounded-lg w-full max-w-[794px] min-h-[1080px] mx-auto relative flex flex-col justify-between gap-3 sm:gap-3.5 overflow-visible print:w-[210mm] print:max-w-[210mm] print:h-auto print:min-h-[282mm] print:max-h-none print:p-[6mm_8mm] print:gap-2 print:m-0 print:shadow-none print:border-none print:rounded-none page-break-after"
        >
          {/* Draggable Custom Text Stamps / Badges Overlay (on page 1) */}
          {pg.isFirstPage && customStamps && customStamps.map((stamp: CustomTextStamp) => {
            const curSize = stamp.fontSize || 12
            const curRot = stamp.rotation ?? (stamp.bgStyle === "stamp" ? -12 : 0)
            const curStyle = stamp.bgStyle || "stamp"
            const curColor = stamp.color || "#0d9488"
            const isBold = stamp.isBold !== false

            return (
              <motion.div
                key={stamp.id}
                drag={interactive}
                dragMomentum={false}
                dragElastic={0}
                whileDrag={{ scale: 1.05, zIndex: 60 }}
                animate={{ x: stamp.x, y: stamp.y, rotate: curRot }}
                onDragEnd={(_, info) => {
                  if (onCustomStampMove) {
                    onCustomStampMove(stamp.id, {
                      x: stamp.x + info.offset.x,
                      y: stamp.y + info.offset.y,
                    })
                  }
                }}
                className={`absolute z-30 select-none transition-shadow group ${
                  interactive ? "cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-blue-400 p-1" : ""
                }`}
                style={{
                  left: "35%",
                  top: "18%",
                }}
              >
                {/* Floating Interactive Micro-Toolbar (visible on hover when in interactive mode) */}
                {interactive && (
                  <div className="absolute -top-9 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity bg-zinc-900/95 backdrop-blur-sm text-white px-2 py-1 rounded-xl shadow-xl flex items-center gap-1.5 z-40 text-[9px] pointer-events-auto whitespace-nowrap border border-white/20">
                    <span className="text-[7.5px] font-bold text-zinc-400 select-none">✥ Drag</span>

                    {/* Zoom In / Zoom Out Font Size Controls */}
                    <div className="flex items-center bg-zinc-800 rounded px-1 py-0.5 gap-1 border border-zinc-700">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onCustomStampUpdate?.(stamp.id, { fontSize: Math.max(8, curSize - 2) })
                        }}
                        className="text-[9px] font-bold hover:text-teal-300 px-1 cursor-pointer"
                        title="Zoom out text (Decrease font size)"
                      >
                        A-
                      </button>
                      <span className="font-mono text-[8.5px] text-zinc-300 font-bold">{curSize}px</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onCustomStampUpdate?.(stamp.id, { fontSize: Math.min(48, curSize + 2) })
                        }}
                        className="text-[9px] font-bold hover:text-teal-300 px-1 cursor-pointer"
                        title="Zoom in text (Increase font size)"
                      >
                        A+
                      </button>
                    </div>

                    {/* Quick Color Swatches */}
                    <div className="flex items-center gap-0.5">
                      {[
                        { color: "#0d9488", title: "Teal" },
                        { color: "#dc2626", title: "Crimson" },
                        { color: "#2563eb", title: "Blue" },
                        { color: "#d97706", title: "Amber" },
                        { color: "#7c3aed", title: "Purple" },
                        { color: "#18181b", title: "Black" },
                      ].map((c) => (
                        <button
                          key={c.color}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            onCustomStampUpdate?.(stamp.id, { color: c.color })
                          }}
                          className={`w-3 h-3 rounded-full border border-white/40 cursor-pointer ${curColor === c.color ? 'ring-2 ring-white scale-110' : 'hover:scale-105'}`}
                          style={{ backgroundColor: c.color }}
                          title={c.title}
                        />
                      ))}
                    </div>

                    {/* Rotation Cycle Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        const rotSequence = [0, -12, -24, 15, 45]
                        const nextIndex = (rotSequence.indexOf(curRot) + 1) % rotSequence.length
                        onCustomStampUpdate?.(stamp.id, { rotation: rotSequence[nextIndex] })
                      }}
                      className="px-1.5 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded border border-zinc-700 text-[8px] font-bold cursor-pointer"
                      title="Rotate stamp angle"
                    >
                      ⟳ {curRot}°
                    </button>

                    {/* Style Preset Cycler */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        const styleSequence: ("stamp" | "badge" | "clean" | "watermark")[] = ["stamp", "badge", "clean", "watermark"]
                        const nextIndex = (styleSequence.indexOf(curStyle) + 1) % styleSequence.length
                        onCustomStampUpdate?.(stamp.id, { bgStyle: styleSequence[nextIndex] })
                      }}
                      className="px-1.5 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded border border-zinc-700 text-[8px] font-bold uppercase cursor-pointer"
                      title="Cycle style: Stamp, Badge, Clean, Watermark"
                    >
                      {curStyle}
                    </button>

                    {/* Remove Stamp Button */}
                    {onRemoveCustomStamp && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onRemoveCustomStamp(stamp.id)
                        }}
                        className="w-4 h-4 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center text-[9px] font-bold cursor-pointer ml-0.5 shadow-xs"
                        title="Delete custom text sticker"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                )}

                {/* Actual Custom Stamp Element (Editable in-place) */}
                <div
                  className={`flex items-center gap-1.5 ${
                    curStyle === "stamp"
                      ? "px-3 py-1 rounded-lg border-2 border-dashed font-black uppercase tracking-wider shadow-md backdrop-blur-xs bg-white/95"
                      : curStyle === "badge"
                      ? "px-3 py-0.5 rounded-full border-2 font-bold uppercase tracking-wider shadow-sm backdrop-blur-xs bg-white/95"
                      : curStyle === "watermark"
                      ? "p-2 font-black uppercase tracking-widest opacity-25 select-none"
                      : "px-2 py-0.5 font-bold"
                  }`}
                  style={{
                    borderColor: curColor,
                    color: curColor,
                    fontSize: `${curSize}px`,
                    fontWeight: isBold ? 800 : 500,
                  }}
                >
                  <EditableText
                    value={stamp.text}
                    onChange={(val) => onCustomStampUpdate?.(stamp.id, { text: val })}
                    interactive={interactive}
                    placeholder="Enter custom text..."
                    className="outline-none"
                  />
                </div>
              </motion.div>
            )
          })}

          {/* PAGE CONTENT (Top to mid sections) - Consistent invoice format across all pages */}
          <div className="flex flex-col gap-2 shrink-0">
            {renderTopHeader(pg.pageNumber, totalPages)}
            {renderEntityHierarchyStrip()}
            {renderInfoCards()}
            {renderTable(pg.items, pg.startIndex, pg.isLastPage)}
          </div>

          {/* FINANCIALS, SIGNATURES & STICKY FOOTER */}
          {pg.isLastPage ? (
            renderFinancialsAndFooter(pg.pageNumber, totalPages)
          ) : (
            renderPageFooterOnly(pg.pageNumber, totalPages)
          )}
        </div>
      ))}
    </>
  );
}
