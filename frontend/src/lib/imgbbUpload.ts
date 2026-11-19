import axiosInstance from "@/lib/axios"
import { ApiError, extractApiData } from "@/lib/responseHandler"

export interface UploadResult {
  url: string
  display_url?: string
  thumb_url?: string
  delete_url?: string
  filename?: string
  size?: number
  mimeType?: string
  success: boolean
}

/**
 * Converts a base64 data URL string into a binary Blob for multipart FormData upload.
 */
export function base64ToBlob(dataUrl: string, fallbackMime = "image/png"): Blob {
  if (!dataUrl.includes(",")) {
    return new Blob([dataUrl], { type: fallbackMime })
  }
  const [header, base64Data] = dataUrl.split(",")
  const mimeMatch = header.match(/data:([^;]+);/)
  const mimeType = mimeMatch ? mimeMatch[1] : fallbackMime
  const byteString = typeof window !== "undefined" ? atob(base64Data) : Buffer.from(base64Data, "base64").toString("binary")
  const ab = new ArrayBuffer(byteString.length)
  const ia = new Uint8Array(ab)
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }
  return new Blob([ab], { type: mimeType })
}

/**
 * Compress and resize an image client-side into a binary Blob for multipart upload.
 */
export async function compressImage(
  fileOrBlob: File | Blob | string,
  maxWidth: number = 400,
  maxHeight: number = 400,
  quality: number = 0.88
): Promise<Blob> {
  if (typeof window === "undefined") {
    if (fileOrBlob instanceof Blob) return fileOrBlob
    throw new Error("Cannot compress on server")
  }

  let srcUrl = ""
  let shouldRevoke = false

  if (typeof fileOrBlob === "string") {
    srcUrl = fileOrBlob
  } else {
    srcUrl = URL.createObjectURL(fileOrBlob)
    shouldRevoke = true
  }

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      if (shouldRevoke) URL.revokeObjectURL(srcUrl)

      let { width, height } = img
      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        } else {
          width = Math.round((width * maxHeight) / height)
          maxHeight = Math.round(maxHeight)
          height = maxHeight
        }
      }

      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        return resolve(fileOrBlob instanceof Blob ? fileOrBlob : new Blob())
      }

      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = "high"
      ctx.drawImage(img, 0, 0, width, height)

      let mimeType = "image/jpeg"
      if (fileOrBlob instanceof File || fileOrBlob instanceof Blob) {
        if (fileOrBlob.type === "image/png" || fileOrBlob.type === "image/webp" || fileOrBlob.type === "image/svg+xml") {
          mimeType = "image/png"
        }
      } else if (typeof fileOrBlob === "string") {
        if (fileOrBlob.startsWith("data:image/png") || fileOrBlob.startsWith("data:image/webp") || fileOrBlob.startsWith("data:image/svg+xml")) {
          mimeType = "image/png"
        }
      }

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            resolve(fileOrBlob instanceof Blob ? fileOrBlob : new Blob())
          }
        },
        mimeType,
        mimeType === "image/png" ? undefined : quality
      )
    }

    img.onerror = () => {
      if (shouldRevoke) URL.revokeObjectURL(srcUrl)
      if (fileOrBlob instanceof Blob) resolve(fileOrBlob)
      else reject(new Error("Failed to load image for compression"))
    }

    img.src = srcUrl
  })
}

/**
 * Uploads any File, Blob, or data URL to the backend Multer endpoint (`backend/uploads/`)
 * via multipart/form-data payload. Strictly requires a real backend URL — never falls back
 * to blob: or base64 data URLs.
 */
export async function uploadMultipartFile(
  fileOrBlobOrDataUrl: File | Blob | string,
  options: {
    endpoint?: string
    fieldName?: string
    name?: string
    folder?: string
    maxWidth?: number
    compress?: boolean
    metadata?: Record<string, any>
    onUploadProgress?: (event: { loaded: number; total?: number; progress?: number }) => void
  } = {}
): Promise<UploadResult> {
  const {
    endpoint = "/files/upload",
    fieldName = "file",
    name = "upload",
    folder = "uploads",
    maxWidth = 800,
    compress = true,
    metadata = {},
    onUploadProgress,
  } = options

  let binaryBlob: Blob
  let fileName = name.replace(/[^a-zA-Z0-9._-]/g, "_")

  if (fileOrBlobOrDataUrl instanceof File) {
    fileName = fileOrBlobOrDataUrl.name || fileName
    if (compress && fileOrBlobOrDataUrl.type.startsWith("image/") && typeof window !== "undefined") {
      binaryBlob = await compressImage(fileOrBlobOrDataUrl, maxWidth, maxWidth, 0.92).catch(() => fileOrBlobOrDataUrl)
    } else {
      binaryBlob = fileOrBlobOrDataUrl
    }
  } else if (fileOrBlobOrDataUrl instanceof Blob) {
    if (compress && fileOrBlobOrDataUrl.type.startsWith("image/") && typeof window !== "undefined") {
      binaryBlob = await compressImage(fileOrBlobOrDataUrl, maxWidth, maxWidth, 0.92).catch(() => fileOrBlobOrDataUrl)
    } else {
      binaryBlob = fileOrBlobOrDataUrl
    }
  } else {
    if (compress && typeof window !== "undefined" && fileOrBlobOrDataUrl.startsWith("data:image/")) {
      binaryBlob = await compressImage(fileOrBlobOrDataUrl, maxWidth, maxWidth, 0.92).catch(() =>
        base64ToBlob(fileOrBlobOrDataUrl)
      )
    } else {
      binaryBlob = base64ToBlob(fileOrBlobOrDataUrl)
    }
  }

  const ext = binaryBlob.type === "image/png" ? "png" : binaryBlob.type === "application/pdf" ? "pdf" : "jpg"
  if (!fileName.includes(".")) {
    fileName = `${fileName}.${ext}`
  }

  const formData = new FormData()
  formData.append(fieldName, binaryBlob, fileName)
  formData.append("name", fileName)
  formData.append("folder", folder)

  Object.entries(metadata).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, typeof value === "object" ? JSON.stringify(value) : String(value))
    }
  })

  const response = await axiosInstance.postForm(endpoint, formData, {
    onUploadProgress,
  })

  const resData = extractApiData<any>(response?.data, response?.status)
  const fileUrl = resData?.url || resData?.file_url || resData?.path

  if (!fileUrl || typeof fileUrl !== "string") {
    throw new ApiError("Server did not return a valid uploaded file URL.", response?.status || 500, undefined, response?.data)
  }

  return {
    url: fileUrl,
    display_url: resData.display_url || fileUrl,
    thumb_url: resData.thumb_url || fileUrl,
    filename: resData.filename || fileName,
    size: resData.size ?? binaryBlob.size,
    mimeType: resData.mimeType || binaryBlob.type,
    success: true,
  }
}

export async function uploadToImgBB(
  fileOrBase64: File | Blob | string,
  name: string = "avatar",
  maxWidth: number = 400
): Promise<UploadResult> {
  return uploadMultipartFile(fileOrBase64, {
    endpoint: "/files/upload",
    fieldName: "file",
    name,
    folder: "uploads",
    maxWidth,
    compress: true,
  })
}

export const uploadImageToImgBB = uploadToImgBB
