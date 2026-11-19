const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const { errorResponse } = require('../utils/apiResponse');

const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');

// Ensure backend/uploads/ exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'text/plain',
]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.bin';
    const safeBase = path
      .basename(file.originalname || 'file', ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 40);
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
    cb(null, `${safeBase || 'upload'}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (!file.mimetype || ALLOWED_MIME_TYPES.has(file.mimetype) || file.mimetype.startsWith('image/')) {
    return cb(null, true);
  }
  const err = new Error(`Unsupported file type: ${file.mimetype}`);
  err.statusCode = 400;
  return cb(err, false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 20,
  },
});

/**
 * Returns the stored URL path for an uploaded file.
 */
function buildUploadUrl(filename) {
  return `/uploads/${filename}`;
}

/**
 * Fields that store image/file URLs and must NEVER contain raw base64 data URLs.
 */
const IMAGE_URL_FIELDS = [
  'logo_url',
  'logo',
  'signature_image_url',
  'stamp_image_url',
  'payment_qr_url',
  'gst_payment_qr_url',
  'nongst_payment_qr_url',
  'avatar_url',
  'avatar',
  'avatarUrl',
  'image_url',
  'receipt_url',
  'receiptUrl',
  'file_url',
];

function findBase64Field(body) {
  if (!body || typeof body !== 'object') return null;
  for (const field of IMAGE_URL_FIELDS) {
    const val = body[field];
    if (typeof val === 'string' && val.trim().startsWith('data:image/')) {
      return field;
    }
  }
  return null;
}

/**
 * Middleware for form routes that accept multipart/form-data (or standard JSON).
 * - Runs Multer when Content-Type is multipart/form-data
 * - Maps uploaded files to `/uploads/<filename>` on req.body
 * - Parses JSON-stringified objects/arrays sent in multipart fields
 * - Rejects raw base64 data:image/... strings so images are never stored as text data
 */
function handleMultipartForm(fieldAliasMap = {}) {
  const anyUpload = upload.any();

  return (req, res, next) => {
    const isMultipart = Boolean(req.is && req.is('multipart/form-data'));

    const finalize = () => {
      if (!req.body || typeof req.body !== 'object') {
        req.body = {};
      }

      // Parse JSON-encoded fields coming from multipart FormData
      if (isMultipart) {
        for (const [key, val] of Object.entries(req.body)) {
          if (typeof val === 'string') {
            const trimmed = val.trim();
            if (
              (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
              (trimmed.startsWith('[') && trimmed.endsWith(']'))
            ) {
              try {
                req.body[key] = JSON.parse(trimmed);
              } catch {
                // Keep original string if not valid JSON
              }
            } else if (trimmed === 'true') {
              req.body[key] = true;
            } else if (trimmed === 'false') {
              req.body[key] = false;
            }
          }
        }
      }

      // Map uploaded files to their URL paths on req.body
      const uploadedFiles = Array.isArray(req.files) ? req.files : req.file ? [req.file] : [];
      if (uploadedFiles.length > 0) {
        req.uploadedFileUrls = {};
        for (const file of uploadedFiles) {
          const url = buildUploadUrl(file.filename);
          const targetField = fieldAliasMap[file.fieldname] || file.fieldname;
          req.body[targetField] = url;
          req.uploadedFileUrls[targetField] = url;

          // Also expose file size and type metadata when a generic `file` is uploaded
          if (file.fieldname === 'file') {
            if (!req.body.file_size) req.body.file_size = file.size;
            if (!req.body.file_type) req.body.file_type = file.mimetype;
          }
        }
      }

      // Hard rule: never allow base64 image text data to be stored in DB
      const badField = findBase64Field(req.body);
      if (badField) {
        return errorResponse(
          res,
          400,
          `Invalid image payload for "${badField}": base64 text data is not allowed. Upload the image as a multipart file instead.`
        );
      }

      return next();
    };

    if (!isMultipart) {
      return finalize();
    }

    return anyUpload(req, res, (err) => {
      if (err) return next(err);
      return finalize();
    });
  };
}

module.exports = {
  upload,
  UPLOADS_DIR,
  buildUploadUrl,
  handleMultipartForm,
};
