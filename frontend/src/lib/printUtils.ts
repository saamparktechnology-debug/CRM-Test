"use client"

/**
 * Universal A4 Document Print Engine for SAAMPARK CRM
 * Preserves exact View formatting (fonts, Tailwind CSS variables, flex/grid layout,
 * spacing, gradients, and multi-page pagination) for Invoices, Quotations, Estimates,
 * Form No. 9, Offer Letters, ID Cards, and Receipts.
 */
export function printDocument(elementId: string, title?: string) {
  if (typeof window === "undefined") return

  const targetEl = document.getElementById(elementId)
  if (!targetEl) {
    window.print()
    return
  }

  const prevTitle = document.title
  if (title) {
    document.title = title
  }

  // 1. Gather all compiled style tags and stylesheet links from document.head
  const headElements = Array.from(document.querySelectorAll("link[rel='stylesheet'], style"))
    .map(node => node.outerHTML)
    .join("\n")

  // Preserve Next.js font classes & CSS custom properties (stripping dark mode class)
  const htmlClasses = (document.documentElement.className || "")
    .split(/\s+/)
    .filter(cls => cls && cls !== "dark")
    .join(" ")
  const bodyClasses = (document.body.className || "")
    .split(/\s+/)
    .filter(cls => cls && cls !== "dark")
    .join(" ")
  const htmlInlineStyle = document.documentElement.getAttribute("style") || ""

  // 2. Manage clean invisible print iframe sized to exact desktop A4 view width (794px)
  let iframe = document.getElementById("saampark-universal-print-frame") as HTMLIFrameElement | null
  if (!iframe) {
    iframe = document.createElement("iframe")
    iframe.id = "saampark-universal-print-frame"
    iframe.style.position = "fixed"
    iframe.style.left = "-9999px"
    iframe.style.top = "-9999px"
    iframe.style.width = "794px"
    iframe.style.height = "1123px"
    iframe.style.border = "none"
    iframe.style.visibility = "hidden"
    iframe.style.zIndex = "-9999"
    document.body.appendChild(iframe)
  }

  const doc = iframe.contentWindow?.document
  if (!doc) {
    window.print()
    if (title) document.title = prevTitle
    return
  }

  const docTitle = title || "Document"

  doc.open()
  doc.write(`
    <!DOCTYPE html>
    <html lang="en" class="light ${htmlClasses}" style="${htmlInlineStyle}; color-scheme: light;">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=794, initial-scale=1.0" />
      <title>${docTitle}</title>
      ${headElements}
      <style>
        @page {
          size: A4 portrait;
          margin: 5mm 5mm;
        }
        *, *::before, *::after {
          box-sizing: border-box !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        html, body {
          width: 794px !important;
          min-width: 794px !important;
          max-width: 794px !important;
          margin: 0 auto !important;
          padding: 0 !important;
          background: #ffffff !important;
          color: #09090b !important;
          color-scheme: light !important;
          -webkit-font-smoothing: antialiased;
        }
        .no-print, [data-no-print], button {
          display: none !important;
        }
        /* Outer printable wrappers stay zero-padded so inner page cards keep exact View padding */
        #${elementId}, [id^="printable-"] {
          width: 794px !important;
          max-width: 794px !important;
          min-width: 794px !important;
          margin: 0 auto !important;
          padding: 0 !important;
          background: #ffffff !important;
          color: #09090b !important;
          box-shadow: none !important;
          border: none !important;
          border-radius: 0 !important;
          overflow: visible !important;
          gap: 0 !important;
        }
        /* Invoice A4 pages preserve exact View flex-column + justify-between layout */
        #printable-invoice .a4-page {
          display: flex !important;
          flex-direction: column !important;
          justify-content: space-between !important;
          width: 794px !important;
          max-width: 794px !important;
          min-width: 794px !important;
          min-height: 1060px !important;
          padding: 20px 24px !important;
          margin: 0 auto !important;
          background: #ffffff !important;
          color: #09090b !important;
          box-shadow: none !important;
          border: none !important;
          border-radius: 0 !important;
          overflow: visible !important;
          page-break-after: always !important;
          break-after: page !important;
        }
        #printable-invoice .a4-page:last-child {
          page-break-after: auto !important;
          break-after: auto !important;
        }
        /* Quotation pages preserve exact View padding, block spacing, and page breaks */
        #printable-quotation, #printable-quotation.a4-page {
          display: block !important;
          padding: 0 !important;
          margin: 0 auto !important;
          width: 794px !important;
          max-width: 794px !important;
          min-width: 794px !important;
        }
        .quotation-page-1, .quotation-middle-pages, .quotation-final-page, .quotation-a4-card {
          width: 794px !important;
          max-width: 794px !important;
          min-width: 794px !important;
          padding: 20px 24px !important;
          margin: 0 auto !important;
          background: #ffffff !important;
          color: #09090b !important;
          box-shadow: none !important;
          border: none !important;
          border-radius: 0 !important;
          min-height: auto !important;
          overflow: visible !important;
        }
        .quotation-page-1, .break-after-page, .page-break-after {
          page-break-after: always !important;
          break-after: page !important;
        }
        .quotation-middle-pages {
          page-break-after: always !important;
          break-after: page !important;
        }
        .quotation-final-page, .break-before-page, .page-break-before {
          page-break-before: always !important;
          break-before: page !important;
          page-break-after: auto !important;
          break-after: auto !important;
        }
        .quotation-page-1:last-child, .quotation-middle-pages:last-child, .quotation-final-page:last-child {
          page-break-after: auto !important;
          break-after: auto !important;
        }
        /* Preserve desktop 3-column header row identically to View */
        .print-doc-header-row {
          display: flex !important;
          flex-direction: row !important;
          justify-content: space-between !important;
          align-items: flex-start !important;
          width: 100% !important;
          flex-wrap: nowrap !important;
          gap: 12px !important;
        }
        .print-doc-header-logo {
          width: 115px !important;
          min-width: 115px !important;
          max-width: 115px !important;
          height: 115px !important;
          flex-shrink: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        .print-doc-header-center {
          flex: 1 1 auto !important;
          min-width: 280px !important;
          text-align: center !important;
        }
        .print-doc-header-card {
          width: 200px !important;
          min-width: 200px !important;
          max-width: 200px !important;
          flex-shrink: 0 !important;
        }
        .relative {
          position: relative !important;
        }
        /* Prevent splitting individual rows/cards, but allow large tables to paginate naturally */
        .avoid-break, .break-inside-avoid, tr {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        thead {
          display: table-header-group !important;
        }
        @media print {
          @page {
            size: A4 portrait;
            margin: 5mm 5mm;
          }
          html, body {
            width: 794px !important;
            margin: 0 auto !important;
            background: #ffffff !important;
          }
        }
      </style>
    </head>
    <body class="bg-white text-zinc-900 font-sans ${bodyClasses}">
      <div style="width: 794px; max-width: 794px; margin: 0 auto;">
        ${targetEl.outerHTML}
      </div>
    </body>
    </html>
  `)
  doc.close()

  // Wait for fonts + images in the iframe to finish loading before triggering print
  const triggerIframePrint = () => {
    try {
      const images = Array.from(doc.images || [])
      const imagePromises = images.map((img) => {
        if (img.complete) return Promise.resolve()
        return new Promise<void>((resolve) => {
          img.onload = () => resolve()
          img.onerror = () => resolve()
          setTimeout(resolve, 1000)
        })
      })
      const fontsReady = (doc as any).fonts?.ready
        ? Promise.race([(doc as any).fonts.ready, new Promise((r) => setTimeout(r, 800))])
        : Promise.resolve()

      Promise.all([...imagePromises, fontsReady]).then(() => {
        setTimeout(() => {
          try {
            iframe?.contentWindow?.focus()
            iframe?.contentWindow?.print()
            if (title) document.title = prevTitle
          } catch (err) {
            console.warn("Universal iframe print notice, running window.print():", err)
            window.print()
            if (title) document.title = prevTitle
          }
        }, 180)
      })
    } catch {
      iframe?.contentWindow?.focus()
      iframe?.contentWindow?.print()
      if (title) document.title = prevTitle
    }
  }

  if (iframe.contentWindow) {
    if (doc.readyState === "complete") {
      setTimeout(triggerIframePrint, 200)
    } else {
      iframe.contentWindow.onload = () => {
        setTimeout(triggerIframePrint, 150)
      }
      setTimeout(triggerIframePrint, 1000)
    }
  } else {
    setTimeout(triggerIframePrint, 400)
  }
}
