import * as React from "react"
import { DocumentFormValues } from "../types"

function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 KB"
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function useDocumentForm(
  uploadedBy: string,
  onCreate: (values: DocumentFormValues) => Promise<unknown>
) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [values, setValues] = React.useState<DocumentFormValues>({
    name: "",
    category: "General",
    type: "PDF",
    size: "",
    expiry: "",
    uploadedBy,
    file: null,
  })

  const openAdd = React.useCallback(() => {
    setValues({
      name: "",
      category: "General",
      type: "PDF",
      size: "",
      expiry: "",
      uploadedBy,
      file: null,
    })
    setIsOpen(true)
  }, [uploadedBy])

  const close = React.useCallback(() => setIsOpen(false), [])

  const updateField = React.useCallback(<K extends keyof DocumentFormValues>(key: K, value: DocumentFormValues[K]) => {
    setValues((prev) => {
      const next = { ...prev, [key]: value }
      if (key === "file" && value instanceof File) {
        next.size = formatFileSize(value.size)
        if (!next.name.trim()) {
          next.name = value.name.replace(/\.[^/.]+$/, "")
        }
      }
      return next
    })
  }, [])

  const handleSubmit = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!values.name.trim()) return
      await onCreate(values)
      setIsOpen(false)
    },
    [onCreate, values]
  )

  return { isOpen, values, openAdd, close, updateField, handleSubmit }
}
