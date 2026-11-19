const pool = require("../config/db");

const ALLOWED_BRANCH_FIELDS = [
  "company_id",
  "name",
  "code",
  "address",
  "city",
  "state",
  "country",
  "phone",
  "email",
  "manager_id",
  "is_active",
  "logo_url",
  "brand_name",
  "division_name",
  "subtitle",
  "iso_certification",
  "gstin",
  "pan",
  "cin",
  "msme_reg",
  "website",
  "signatory_name",
  "signatory_designation",
  "signature_image_url",
  "stamp_image_url",
  "terms_conditions",
  "invoice_notes",
  "quotation_notes",
  "upi_id",
  "account_holder",
  "bank_name",
  "account_number",
  "ifsc_code",
  "bank_branch",
  "payment_qr_url",
  "gst_bank_name",
  "gst_account_holder",
  "gst_account_number",
  "gst_ifsc_code",
  "gst_bank_branch",
  "gst_upi_id",
  "gst_payment_qr_url",
  "nongst_bank_name",
  "nongst_account_holder",
  "nongst_account_number",
  "nongst_ifsc_code",
  "nongst_bank_branch",
  "nongst_upi_id",
  "nongst_payment_qr_url",
  "signature_position",
  "stamp_position",
  "logo_position",
  "logo_scale",
  "stamp_scale",
  "signature_scale",
  "custom_stamps",
  "invoice_customization",
  "preview_invoice_type",
  "status",
];

let cachedBranchColumns = null;

async function ensureBranchColumns() {
  try {
    const colsToEnsure = [
      "is_active TINYINT(1) DEFAULT 1",
      'status VARCHAR(50) DEFAULT "active"',
      "brand_name VARCHAR(191) NULL",
      "division_name VARCHAR(191) NULL",
      "subtitle VARCHAR(255) NULL",
      "logo_url TEXT NULL",
      "signatory_name VARCHAR(191) NULL",
      "signatory_designation VARCHAR(191) NULL",
      "signature_image_url TEXT NULL",
      "stamp_image_url TEXT NULL",
      "gstin VARCHAR(64) NULL",
      "pan VARCHAR(64) NULL",
      "cin VARCHAR(64) NULL",
      "msme_reg VARCHAR(64) NULL",
      "website VARCHAR(191) NULL",
      "upi_id VARCHAR(191) NULL",
      "account_holder VARCHAR(191) NULL",
      "bank_name VARCHAR(191) NULL",
      "account_number VARCHAR(191) NULL",
      "ifsc_code VARCHAR(64) NULL",
      "bank_branch VARCHAR(191) NULL",
      "payment_qr_url TEXT NULL",
      "gst_bank_name VARCHAR(191) NULL",
      "gst_account_holder VARCHAR(191) NULL",
      "gst_account_number VARCHAR(191) NULL",
      "gst_ifsc_code VARCHAR(64) NULL",
      "gst_bank_branch VARCHAR(191) NULL",
      "gst_upi_id VARCHAR(191) NULL",
      "gst_payment_qr_url TEXT NULL",
      "nongst_bank_name VARCHAR(191) NULL",
      "nongst_account_holder VARCHAR(191) NULL",
      "nongst_account_number VARCHAR(191) NULL",
      "nongst_ifsc_code VARCHAR(64) NULL",
      "nongst_bank_branch VARCHAR(191) NULL",
      "nongst_upi_id VARCHAR(191) NULL",
      "nongst_payment_qr_url TEXT NULL",
      "terms_conditions LONGTEXT NULL",
      "invoice_notes LONGTEXT NULL",
      "quotation_notes LONGTEXT NULL",
      "signature_position JSON NULL",
      "stamp_position JSON NULL",
      "logo_position JSON NULL",
      "logo_scale DECIMAL(5,2) NULL",
      "stamp_scale DECIMAL(5,2) NULL",
      "signature_scale DECIMAL(5,2) NULL",
      "custom_stamps JSON NULL",
      "invoice_customization JSON NULL",
      "preview_invoice_type VARCHAR(50) NULL",
      "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
    ];

    for (const def of colsToEnsure) {
      await pool
        .execute(`ALTER TABLE branches ADD COLUMN ${def}`)
        .catch(() => {});
    }
    cachedBranchColumns = null;
  } catch {}
}
ensureBranchColumns();

async function getExistingColumns() {
  if (cachedBranchColumns) return cachedBranchColumns;
  try {
    const [cols] = await pool.execute("SHOW COLUMNS FROM branches");
    if (cols && cols.length > 0) {
      cachedBranchColumns = cols.map((c) => c.Field);
      return cachedBranchColumns;
    }
  } catch (e) {}
  return ALLOWED_BRANCH_FIELDS;
}

function parseNumericId(rawId) {
  if (rawId === null || rawId === undefined) return null;
  const n = Number(rawId);
  if (Number.isInteger(n) && n > 0) return n;
  return null;
}

const branchModel = {
  async create(data) {
    const existingCols = await getExistingColumns();
    const fields = [];
    const placeholders = [];
    const values = [];

    const numCompanyId = Number(data.company_id);
    if (!Number.isInteger(numCompanyId) || numCompanyId <= 0) {
      const err = new Error(
        "Valid numeric company_id is required to create a branch.",
      );
      err.statusCode = 400;
      throw err;
    }

    for (const key of ALLOWED_BRANCH_FIELDS) {
      if (data[key] !== undefined && existingCols.includes(key)) {
        fields.push(key);
        placeholders.push("?");
        let val = data[key];
        if (key === "company_id") {
          val = numCompanyId;
        } else if (key === "is_active") {
          val =
            val === 1 ||
            val === true ||
            val === "1" ||
            String(val).toLowerCase() === "active"
              ? 1
              : 0;
        } else if (typeof val === "object" && val !== null) {
          val = JSON.stringify(val);
        } else if (val === "") {
          val = null;
        }
        values.push(val);
      }
    }

    if (!fields.includes("name") && existingCols.includes("name")) {
      fields.push("name");
      placeholders.push("?");
      values.push(data.name || "New Branch");
    }
    if (!fields.includes("company_id") && existingCols.includes("company_id")) {
      fields.push("company_id");
      placeholders.push("?");
      values.push(numCompanyId);
    }
    if (!fields.includes("is_active") && existingCols.includes("is_active")) {
      fields.push("is_active");
      placeholders.push("?");
      values.push(1);
    }

    const [result] = await pool.execute(
      `INSERT INTO branches (${fields.join(", ")}) VALUES (${placeholders.join(", ")})`,
      values,
    );
    return result.insertId;
  },

  async findById(id) {
    const numId = parseNumericId(id);
    if (!numId) return null;
    const [rows] = await pool.execute(
      `SELECT b.*, u.full_name as manager_name,
       (SELECT COUNT(*) FROM sub_branches sb WHERE sb.branch_id = b.id) as sub_branch_count,
       (SELECT COUNT(*) FROM users u2 WHERE u2.branch_id = b.id AND u2.deleted_at IS NULL) as user_count
       FROM branches b
       LEFT JOIN users u ON b.manager_id = u.id
       WHERE b.id = ?
       LIMIT 1`,
      [numId],
    );
    return rows && rows.length > 0 ? rows[0] : null;
  },

  async findByCompany(company_id) {
    const numId = parseNumericId(company_id);
    if (!numId) return [];
    const [rows] = await pool.execute(
      `SELECT b.*, u.full_name as manager_name,
       (SELECT COUNT(*) FROM sub_branches sb WHERE sb.branch_id = b.id) as sub_branch_count,
       (SELECT COUNT(*) FROM users u2 WHERE u2.branch_id = b.id AND u2.deleted_at IS NULL) as user_count
       FROM branches b
       LEFT JOIN users u ON b.manager_id = u.id
       WHERE b.company_id = ?
       ORDER BY b.id ASC`,
      [numId],
    );
    return rows || [];
  },

  async update(id, data) {
    const numId = parseNumericId(id);
    if (!numId) {
      const err = new Error(
        `Invalid branch id "${id}". A valid numeric branch ID is required.`,
      );
      err.statusCode = 400;
      throw err;
    }

    // Verify branch exists — NEVER create a new row on PUT!
    const [existingRows] = await pool.execute(
      "SELECT id FROM branches WHERE id = ? LIMIT 1",
      [numId],
    );
    if (!existingRows || existingRows.length === 0) {
      return false;
    }

    const existingCols = await getExistingColumns();
    const fields = [];
    const values = [];

    for (const [key, val] of Object.entries(data)) {
      if (
        ALLOWED_BRANCH_FIELDS.includes(key) &&
        existingCols.includes(key) &&
        val !== undefined
      ) {
        if (key === "company_id") {
          const parsedComp = parseNumericId(val);
          if (!parsedComp) continue;
          fields.push("company_id = ?");
          values.push(parsedComp);
          continue;
        }
        if (key === "is_active") {
          fields.push("is_active = ?");
          values.push(
            val === 1 ||
              val === true ||
              val === "1" ||
              String(val).toLowerCase() === "active"
              ? 1
              : 0,
          );
          continue;
        }
        fields.push(`${key} = ?`);
        let finalVal = val;
        if (typeof finalVal === "object" && finalVal !== null) {
          finalVal = JSON.stringify(finalVal);
        } else if (finalVal === "") {
          finalVal = null;
        }
        values.push(finalVal);
      }
    }

    if (fields.length === 0) {
      return true;
    }

    if (existingCols.includes("updated_at")) {
      fields.push("updated_at = NOW()");
    }

    values.push(numId);
    const [result] = await pool.execute(
      `UPDATE branches SET ${fields.join(", ")} WHERE id = ?`,
      values,
    );
    return (result?.affectedRows || 0) > 0;
  },

  async delete(id) {
    const numId = parseNumericId(id);
    if (!numId) return false;
    const [result] = await pool.execute("DELETE FROM branches WHERE id = ?", [
      numId,
    ]);
    return (result?.affectedRows || 0) > 0;
  },

  async findAll() {
    const [rows] = await pool.execute(
      `SELECT b.*, u.full_name as manager_name,
       (SELECT COUNT(*) FROM sub_branches sb WHERE sb.branch_id = b.id) as sub_branch_count,
       (SELECT COUNT(*) FROM users u2 WHERE u2.branch_id = b.id AND u2.deleted_at IS NULL) as user_count
       FROM branches b
       LEFT JOIN users u ON b.manager_id = u.id
       ORDER BY b.id ASC`,
    );
    return rows || [];
  },

  async getStats(company_id) {
    const numId = parseNumericId(company_id);
    if (!numId) return { total_branches: 0, active_branches: 0 };
    const [rows] = await pool.execute(
      `SELECT COUNT(*) as total_branches,
       SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_branches
       FROM branches WHERE company_id = ?`,
      [numId],
    );
    return rows[0] || { total_branches: 0, active_branches: 0 };
  },
};

module.exports = branchModel;
