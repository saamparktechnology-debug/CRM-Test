const { successResponse, errorResponse } = require('../utils/apiResponse');
const { buildUploadUrl } = require('../middlewares/uploadMiddleware');

/**
 * POST /api/v1/files/upload
 * Accepts a single file (any field name, typically `file`) via multipart/form-data
 * and stores it in backend/uploads/, returning its public URL.
 */
const uploadSingleFile = (req, res) => {
  const uploadedFile = req.file || (Array.isArray(req.files) && req.files[0]);
  if (!uploadedFile) {
    return errorResponse(res, 400, 'No file uploaded. Please attach a file in multipart/form-data.');
  }

  const relativeUrl = buildUploadUrl(uploadedFile.filename);
  return successResponse(res, 201, 'File uploaded successfully', {
    url: relativeUrl,
    file_url: relativeUrl,
    path: relativeUrl,
    filename: uploadedFile.filename,
    originalName: uploadedFile.originalname,
    mimeType: uploadedFile.mimetype,
    size: uploadedFile.size,
  });
};

/**
 * POST /api/v1/files/upload-multiple
 * Accepts multiple files via multipart/form-data and stores them in backend/uploads/.
 */
const uploadMultipleFiles = (req, res) => {
  const uploadedFiles = Array.isArray(req.files) ? req.files : req.file ? [req.file] : [];
  if (uploadedFiles.length === 0) {
    return errorResponse(res, 400, 'No files uploaded. Please attach files in multipart/form-data.');
  }

  const results = uploadedFiles.map((file) => {
    const relativeUrl = buildUploadUrl(file.filename);
    return {
      url: relativeUrl,
      file_url: relativeUrl,
      path: relativeUrl,
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      fieldName: file.fieldname,
    };
  });

  return successResponse(res, 201, 'Files uploaded successfully', results);
};

module.exports = {
  uploadSingleFile,
  uploadMultipleFiles,
};
