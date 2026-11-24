const pool = require("../config/db");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const bcrypt = require("bcryptjs");

// In-memory OTP store for client email verification (10 minute TTL)
const clientOtpStore = new Map();

function generateSixDigitOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function fetchParsedModule(moduleKey, fallback = []) {
  try {
    const [rows] = await pool.execute(
      "SELECT data_json FROM app_data WHERE module_key = ?",
      [moduleKey]
    );
    if (rows.length > 0 && rows[0].data_json) {
      return JSON.parse(rows[0].data_json);
    }
  } catch {}
  return fallback;
}

async function collectClientOrdersAndProfile(clientEmail) {
  const normEmail = String(clientEmail || "").toLowerCase().trim();
  const orderKeys = ["ecommerce_orders_tech", "ecommerce_orders_consultancy", "ecommerce_orders"];
  const orderMap = new Map();

  for (const k of orderKeys) {
    const list = await fetchParsedModule(k, []);
    if (Array.isArray(list)) {
      list.forEach((o) => {
        if (o && o.email && String(o.email).toLowerCase().trim() === normEmail) {
          const idKey = o.orderNumber || o.id;
          if (idKey && !orderMap.has(idKey)) {
            orderMap.set(idKey, o);
          }
        }
      });
    }
  }

  const orders = Array.from(orderMap.values()).sort(
    (a, b) => new Date(b.createdAt || b.orderDate || 0).getTime() - new Date(a.createdAt || a.orderDate || 0).getTime()
  );

  // Extract latest billing profile from orders + users table
  let profile = {
    name: "",
    businessName: "",
    email: normEmail,
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    gstNumber: "",
    panNumber: "",
  };

  if (orders.length > 0) {
    const latest = orders[0];
    profile = {
      name: latest.clientName || "",
      businessName: latest.businessName || "",
      email: normEmail,
      phone: latest.phone || "",
      address: latest.address || "",
      city: latest.city || "",
      state: latest.state || "",
      pincode: latest.pincode || "",
      gstNumber: latest.gstNumber || "",
      panNumber: latest.panNumber || "",
    };
  }

  try {
    const [uRows] = await pool.execute(
      "SELECT id, full_name, email, phone, company_id FROM users WHERE LOWER(TRIM(email)) = ? AND deleted_at IS NULL LIMIT 1",
      [normEmail]
    );
    if (uRows.length > 0) {
      if (!profile.name) profile.name = uRows[0].full_name || "";
      if (!profile.phone) profile.phone = uRows[0].phone || "";
      profile.crmUserId = String(uRows[0].id);
    }
  } catch {}

  return { orders, profile };
}

// Helper: Fetch deleted set for a module key
async function getDeletedItemIds(targetPool, moduleKey) {
  try {
    const [rows] = await targetPool.execute(
      'SELECT LOWER(TRIM(item_id)) as item_id FROM deleted_items WHERE module_name = ? OR module_name = "global"',
      [moduleKey.toLowerCase().trim()],
    );
    return new Set(rows.map((r) => r.item_id));
  } catch {
    return new Set();
  }
}

// Get module data stored in MySQL database with multi-database routing
const getStoreData = async (req, res, next) => {
  try {
    const { key } = req.params;
    const companyId = req.query.company_id || req.query.companyId;
    let activePool = pool;
    try {
      if (pool.getCompanyPool) activePool = pool.getCompanyPool(companyId);
    } catch {
      activePool = pool;
    }
    const deletedSet = await getDeletedItemIds(activePool, key);

    // 1. If companyId provided (and not 'all')
    if (companyId && companyId !== "all") {
      const compStr = String(companyId).toLowerCase().trim();
      const isConsult =
        compStr === "2" ||
        compStr === "consultancy" ||
        compStr.includes("consult") ||
        compStr === "print";
      const isTech =
        compStr === "1" || compStr === "tech" || compStr.includes("tech");

      const candidateKeys = [
        `${key}_${companyId}`,
        isConsult ? `${key}_consultancy` : null,
        isConsult ? `${key}_2` : null,
        isConsult ? `${key}_print` : null,
        isTech ? `${key}_tech` : null,
        isTech ? `${key}_1` : null,
        key, // Fallback to root key
      ].filter(Boolean);

      const candidateMap = new Map();
      let nonArrayFound = null;

      for (const cKey of candidateKeys) {
        let compRows = [];
        try {
          const [rows] = await activePool.execute(
            "SELECT data_json FROM app_data WHERE module_key = ?",
            [cKey],
          );
          compRows = rows;
        } catch (err) {
          try {
            const [fallbackRows] = await pool.execute(
              "SELECT data_json FROM app_data WHERE module_key = ?",
              [cKey],
            );
            compRows = fallbackRows;
          } catch {}
        }

        if (compRows.length > 0 && compRows[0].data_json) {
          try {
            const parsedComp = JSON.parse(compRows[0].data_json);
            if (Array.isArray(parsedComp)) {
              parsedComp.forEach((item) => {
                if (!item) return;
                const idStr =
                  item.id !== undefined && item.id !== null
                    ? String(item.id).toLowerCase().trim()
                    : "";
                const emailStr = item.email
                  ? String(item.email).toLowerCase().trim()
                  : "";
                if (idStr && deletedSet.has(idStr)) return;
                if (emailStr && deletedSet.has(emailStr)) return;

                // If root key fallback, filter items by company if items have companyId
                if (cKey === key) {
                  const itemComp = String(
                    item.companyId || item.company_id || item.company || "",
                  )
                    .toLowerCase()
                    .trim();
                  if (itemComp && itemComp !== "all") {
                    if (
                      isConsult &&
                      !(
                        itemComp === "consultancy" ||
                        itemComp === "2" ||
                        itemComp === "print"
                      )
                    )
                      return;
                    if (isTech && !(itemComp === "tech" || itemComp === "1"))
                      return;
                    if (!isConsult && !isTech && itemComp !== compStr) return;
                  }
                }
                const k = idStr || emailStr || JSON.stringify(item);
                if (!candidateMap.has(k)) {
                  candidateMap.set(k, item);
                }
              });
            } else if (
              !Array.isArray(parsedComp) &&
              typeof parsedComp === "object" &&
              !nonArrayFound
            ) {
              nonArrayFound = parsedComp;
            }
          } catch {}
        }
      }

      if (candidateMap.size > 0) {
        return successResponse(
          res,
          200,
          "Company-isolated module data fetched from MySQL",
          Array.from(candidateMap.values()),
        );
      }
      if (nonArrayFound !== null) {
        return successResponse(
          res,
          200,
          "Company-isolated module data fetched from MySQL",
          nonArrayFound,
        );
      }

      return successResponse(res, 200, "Company module data fetched", []);
    }

    // 2. Query all matching module keys when companyId is 'all' or omitted
    const [rows] = await activePool.execute(
      "SELECT module_key, data_json FROM app_data WHERE module_key = ? OR module_key LIKE ?",
      [key, `${key}_%`],
    );

    if (rows.length === 0) {
      return successResponse(res, 200, "No data found for module", []);
    }

    const itemsMap = new Map();
    for (const r of rows) {
      try {
        const parsed = JSON.parse(r.data_json);
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            if (item && item.id !== undefined && item.id !== null) {
              const idStr = String(item.id).toLowerCase().trim();
              const emailStr = item.email
                ? String(item.email).toLowerCase().trim()
                : "";
              if (
                deletedSet.has(idStr) ||
                (emailStr && deletedSet.has(emailStr))
              ) {
                continue;
              }
              itemsMap.set(idStr, item);
            }
          }
        } else if (
          parsed &&
          typeof parsed === "object" &&
          itemsMap.size === 0
        ) {
          return successResponse(
            res,
            200,
            "Module data fetched from MySQL",
            parsed,
          );
        }
      } catch {}
    }

    const mergedList = Array.from(itemsMap.values());
    return successResponse(
      res,
      200,
      "Module data fetched from MySQL",
      mergedList,
    );
  } catch (err) {
    next(err);
  }
};

// Helper: merge incoming items on top of existing items (newest/updated first, deduplicated by id)
function mergeArrayItems(existingList, incomingItems) {
  const incomingIds = new Set();
  const normalizedIncoming = [];

  for (const item of incomingItems) {
    if (!item || typeof item !== "object") continue;
    const idKey =
      item.id !== undefined && item.id !== null
        ? String(item.id).toLowerCase().trim()
        : null;
    if (idKey) {
      if (incomingIds.has(idKey)) continue;
      incomingIds.add(idKey);
    }
    normalizedIncoming.push(item);
  }

  const keptExisting = Array.isArray(existingList)
    ? existingList.filter((item) => {
        if (!item || typeof item !== "object") return false;
        const idKey =
          item.id !== undefined && item.id !== null
            ? String(item.id).toLowerCase().trim()
            : null;
        return !idKey || !incomingIds.has(idKey);
      })
    : [];

  return [...normalizedIncoming, ...keptExisting];
}

// Save or update module data persistently in MySQL database
const saveStoreData = async (req, res, next) => {
  try {
    const { key } = req.params;
    const { data, item, mode, company_id, companyId } = req.body;
    const targetCompanyId =
      company_id || companyId || req.query.company_id || req.query.companyId;

    // Support both single-item payload (`item`) and array/object payload (`data`)
    const payload = item !== undefined ? [item] : data;
    if (payload === undefined) {
      return errorResponse(res, 400, "Data object is required.");
    }

    const isReplaceMode = mode === "replace";
    const dataJson = JSON.stringify(payload);
    let activePool = pool;
    try {
      if (pool.getCompanyPool)
        activePool = pool.getCompanyPool(targetCompanyId);
    } catch {
      activePool = pool;
    }

    const upsertModuleKey = async (targetPool, moduleKey) => {
      let jsonToSave = dataJson;

      if (Array.isArray(payload) && !isReplaceMode) {
        const [existRows] = await targetPool.execute(
          "SELECT data_json FROM app_data WHERE module_key = ?",
          [moduleKey],
        );
        let existList = [];
        if (existRows.length > 0 && existRows[0].data_json) {
          try {
            existList = JSON.parse(existRows[0].data_json);
          } catch {
            existList = [];
          }
        }
        const merged = mergeArrayItems(existList, payload);
        jsonToSave = JSON.stringify(merged);
      }

      await targetPool.execute(
        `INSERT INTO app_data (module_key, data_json) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE data_json = VALUES(data_json), updated_at = NOW()`,
        [moduleKey, jsonToSave],
      );
    };

    // Save to company key(s) if targetCompanyId is specified
    if (targetCompanyId && targetCompanyId !== "all") {
      const compStr = String(targetCompanyId).toLowerCase().trim();
      const isConsult =
        compStr === "2" ||
        compStr === "consultancy" ||
        compStr.includes("consult") ||
        compStr === "print";
      const isTech =
        compStr === "1" || compStr === "tech" || compStr.includes("tech");

      const keysToSave = new Set([`${key}_${targetCompanyId}`]);
      if (isConsult) {
        keysToSave.add(`${key}_consultancy`);
        keysToSave.add(`${key}_2`);
      }
      if (isTech) {
        keysToSave.add(`${key}_tech`);
        keysToSave.add(`${key}_1`);
      }

      for (const saveK of keysToSave) {
        await upsertModuleKey(pool, saveK);
      }

      // Also merge into root key automatically so frontend doesn't need a second "all" POST
      if (Array.isArray(payload) && !isReplaceMode) {
        await upsertModuleKey(pool, key);
      }
    } else {
      await upsertModuleKey(activePool, key);
    }

    return successResponse(
      res,
      200,
      "Module data saved to MySQL database successfully",
      item || payload,
    );
  } catch (err) {
    next(err);
  }
};

// Normalize company or group name
function resolveCompanyScope(param) {
  if (!param) return "tech";
  const p = String(param).toLowerCase().trim();
  if (p === "2" || p === "consultancy" || p.includes("consult") || p === "scs") {
    return "consultancy";
  }
  return "tech";
}

const getPublicProducts = async (req, res, next) => {
  try {
    const scope = resolveCompanyScope(req.query.company || req.query.group || req.query.company_id);
    const key = `ecommerce_products_${scope}`;
    const [rows] = await pool.execute("SELECT data_json FROM app_data WHERE module_key = ?", [key]);
    let products = [];
    if (rows.length > 0 && rows[0].data_json) {
      try {
        products = JSON.parse(rows[0].data_json);
      } catch {}
    }
    const activeProducts = (Array.isArray(products) ? products : []).filter((p) => !p.status || p.status === "Active");
    return successResponse(res, 200, "Public products fetched", activeProducts);
  } catch (err) {
    next(err);
  }
};

const getPublicStorefront = async (req, res, next) => {
  try {
    const scope = resolveCompanyScope(req.query.company || req.query.group || req.query.company_id);
    const key = `ecommerce_storefront_${scope}`;
    const [rows] = await pool.execute("SELECT data_json FROM app_data WHERE module_key = ?", [key]);
    let config = null;
    if (rows.length > 0 && rows[0].data_json) {
      try {
        config = JSON.parse(rows[0].data_json);
      } catch {}
    }
    return successResponse(res, 200, "Public storefront config fetched", config);
  } catch (err) {
    next(err);
  }
};

const getPublicCatalogAndStorefront = async (req, res, next) => {
  try {
    const [techProducts, consultProducts, techStore, consultStore] = await Promise.all([
      fetchParsedModule("ecommerce_products_tech", []),
      fetchParsedModule("ecommerce_products_consultancy", []),
      fetchParsedModule("ecommerce_storefront_tech", null),
      fetchParsedModule("ecommerce_storefront_consultancy", null),
    ]);

    const filterActive = (list) =>
      (Array.isArray(list) ? list : []).filter((p) => !p.status || p.status === "Active");

    return successResponse(res, 200, "Public storefront catalog retrieved", {
      products: {
        tech: filterActive(techProducts),
        consultancy: filterActive(consultProducts),
      },
      storefront: {
        tech: techStore,
        consultancy: consultStore,
      },
    });
  } catch (err) {
    next(err);
  }
};

const createPublicOrder = async (req, res, next) => {
  try {
    const {
      clientName,
      businessName,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      gstNumber,
      panNumber,
      items,
      subtotal,
      gstAmount,
      gstType,
      discountAmount,
      couponCode,
      urgency,
      totalAmount,
      companyId,
      notes,
    } = req.body;

    if (!email || !clientName) {
      return errorResponse(res, 400, "Customer name and email are required.");
    }

    const scope = resolveCompanyScope(companyId || req.body.group);
    const isConsult = scope === "consultancy";
    const compCode = isConsult ? "SCS" : "STR";
    const seq = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-${compCode}-${new Date().getFullYear()}-${seq}`;

    const clientEmail = String(email).toLowerCase().trim();
    let clientUserId = null;
    const defaultPassword = "Client@123";

    try {
      const [uRows] = await pool.execute("SELECT id FROM users WHERE LOWER(TRIM(email)) = ?", [clientEmail]);
      if (uRows.length > 0) {
        clientUserId = uRows[0].id;
      } else {
        const hash = await bcrypt.hash(defaultPassword, 10);
        const [ins] = await pool.execute(
          `INSERT INTO users (full_name, username, email, phone, password_hash, role_id, company_id, status, is_verified, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?, 4, ?, 'active', 1, NOW(), NOW())`,
          [clientName, clientEmail, clientEmail, phone || "", hash, isConsult ? 2 : 1]
        );
        clientUserId = ins.insertId;
      }
    } catch (e) {
      console.warn("User provision note:", e.message);
    }

    const orderObj = {
      id: `ord-${scope}-${Date.now().toString(36)}`,
      orderNumber,
      companyId: scope,
      clientName,
      businessName: businessName || "",
      email: clientEmail,
      phone: phone || "",
      address: address || "",
      city: city || "Kolkata",
      state: state || "West Bengal",
      pincode: pincode || "700001",
      gstNumber: gstNumber ? String(gstNumber).toUpperCase().trim() : "",
      panNumber: panNumber ? String(panNumber).toUpperCase().trim() : "",
      items: Array.isArray(items) ? items : [],
      subtotal: Number(subtotal) || 0,
      gstAmount: Number(gstAmount) || 0,
      gstType: gstType || (String(state || "").toLowerCase().includes("west bengal") ? "CGST+SGST" : "IGST"),
      discountAmount: Number(discountAmount) || 0,
      couponCode: couponCode ? String(couponCode).toUpperCase().trim() : "",
      urgency: urgency || "Standard",
      totalAmount: Number(totalAmount) || 0,
      status: "Order Pending",
      clientUserId: clientUserId ? String(clientUserId) : undefined,
      clientPassword: defaultPassword,
      notes: notes || "",
      orderDate: new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const key = `ecommerce_orders_${scope}`;
    const existingOrders = await fetchParsedModule(key, []);
    const updatedScoped = [orderObj, ...(Array.isArray(existingOrders) ? existingOrders : [])];

    await pool.execute(
      `INSERT INTO app_data (module_key, data_json, updated_at) 
       VALUES (?, ?, NOW()) 
       ON DUPLICATE KEY UPDATE data_json = VALUES(data_json), updated_at = NOW()`,
      [key, JSON.stringify(updatedScoped)]
    );

    const existingAllOrders = await fetchParsedModule("ecommerce_orders", []);
    const updatedAll = [orderObj, ...(Array.isArray(existingAllOrders) ? existingAllOrders.filter((o) => o && o.id !== orderObj.id) : [])];
    await pool.execute(
      `INSERT INTO app_data (module_key, data_json, updated_at) 
       VALUES ('ecommerce_orders', ?, NOW()) 
       ON DUPLICATE KEY UPDATE data_json = VALUES(data_json), updated_at = NOW()`,
      [JSON.stringify(updatedAll)]
    ).catch(() => {});

    // Non-blocking order confirmation email with Client Portal credentials
    try {
      const { getGroupEmailConfig } = require("../utils/emailService");
      const { transporter, from } = getGroupEmailConfig();
      const itemSummary = (orderObj.items || []).map((it) => `- ${it.name} (Qty ${it.qty})`).join("<br/>");
      transporter.sendMail({
        from,
        to: clientEmail,
        subject: `Order Confirmed: ${orderNumber} | Saampark Group`,
        html: `
          <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:16px;">
            <h2 style="color:#1e293b;margin:0 0 8px;">Order Confirmation - ${orderNumber}</h2>
            <p style="color:#475569;font-size:14px;">Dear ${clientName}, thank you for choosing Saampark Group. Your order has been registered in our CRM system for prompt invoice generation.</p>
            <div style="background:#f8fafc;padding:16px;border-radius:12px;margin:16px 0;font-size:13px;">
              <strong>Ordered Services:</strong><br/>${itemSummary}<br/><br/>
              <strong>Total Amount (Incl. GST):</strong> ₹${orderObj.totalAmount.toLocaleString("en-IN")}
            </div>
            <div style="background:#eff6ff;padding:16px;border-radius:12px;margin:16px 0;font-size:13px;border:1px solid #bfdbfe;">
              <strong>CRM Client Portal Access:</strong><br/>
              Portal URL: <a href="https://crm2.saampark.com/login">https://crm2.saampark.com/login</a><br/>
              Track Online: <a href="https://saampark.com/track?order=${orderNumber}">https://saampark.com/track?order=${orderNumber}</a><br/>
              Email: <strong>${clientEmail}</strong><br/>
              Default Password: <strong>${defaultPassword}</strong>
            </div>
          </div>
        `,
      }).catch((mailErr) => console.warn("Order email send skipped:", mailErr.message));
    } catch {}

    return successResponse(res, 201, "Order created successfully", {
      order: orderObj,
      clientPortal: {
        loginUrl: "https://crm2.saampark.com/login",
        email: clientEmail,
        defaultPassword,
        role: "Clients",
      },
    });
  } catch (err) {
    next(err);
  }
};

const requestClientEmailOtp = async (req, res, next) => {
  try {
    const email = String(req.body.email || "").toLowerCase().trim();
    if (!email || !email.includes("@")) {
      return errorResponse(res, 400, "Valid email address is required.");
    }

    const code = generateSixDigitOtp();
    clientOtpStore.set(email, {
      code,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    try {
      const { getGroupEmailConfig } = require("../utils/emailService");
      const { transporter, from } = getGroupEmailConfig();
      await transporter.sendMail({
        from,
        to: email,
        subject: `Your Saampark Client Verification Code: ${code}`,
        html: `
          <div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:16px;">
            <h2 style="margin:0 0 8px;color:#0f172a;">Client Sign-In Verification</h2>
            <p style="color:#475569;font-size:14px;">Use this 6-digit verification code to sign in to your Saampark Client Account & Order Hub:</p>
            <div style="font-size:28px;font-weight:800;letter-spacing:6px;color:#2563eb;background:#eff6ff;padding:16px;text-align:center;border-radius:12px;margin:16px 0;">
              ${code}
            </div>
            <p style="color:#94a3b8;font-size:12px;">This code is valid for 10 minutes.</p>
          </div>
        `,
      });
    } catch (mailErr) {
      return errorResponse(res, 500, `Could not send verification email: ${mailErr.message}`);
    }

    return successResponse(res, 200, "Verification code sent to your email address.", {
      email,
      expiresInSeconds: 600,
    });
  } catch (err) {
    next(err);
  }
};

const clientEmailLogin = async (req, res, next) => {
  try {
    const email = String(req.body.email || "").toLowerCase().trim();
    const password = req.body.password ? String(req.body.password) : "";
    const otp = req.body.otp ? String(req.body.otp).trim() : "";

    if (!email || !email.includes("@")) {
      return errorResponse(res, 400, "Valid email address is required.");
    }

    if (otp) {
      const record = clientOtpStore.get(email);
      if (!record || record.expiresAt < Date.now() || record.code !== otp) {
        return errorResponse(res, 401, "Invalid or expired verification code.");
      }
      clientOtpStore.delete(email);

      // Ensure user record exists as Role 4 Client
      const [uRows] = await pool.execute(
        "SELECT id, full_name, email, phone FROM users WHERE LOWER(TRIM(email)) = ? AND deleted_at IS NULL LIMIT 1",
        [email]
      );
      if (uRows.length === 0) {
        try {
          const hash = await bcrypt.hash("Client@123", 10);
          const fallbackName = email.split("@")[0].replace(/[^a-zA-Z0-9 ]/g, " ").trim() || "Saampark Client";
          await pool.execute(
            `INSERT INTO users (full_name, username, email, phone, password_hash, role_id, company_id, status, is_verified, created_at, updated_at)
             VALUES (?, ?, ?, '', ?, 4, 1, 'active', 1, NOW(), NOW())`,
            [fallbackName, email, email, hash]
          );
        } catch {}
      }
    } else if (password) {
      const [uRows] = await pool.execute(
        "SELECT id, full_name, email, phone, password_hash FROM users WHERE LOWER(TRIM(email)) = ? AND deleted_at IS NULL LIMIT 1",
        [email]
      );
      if (uRows.length === 0) {
        return errorResponse(res, 401, "No account found for this email. Please use Email Code (OTP) login or place an order first.");
      }
      const valid = await bcrypt.compare(password, uRows[0].password_hash || "");
      if (!valid) {
        return errorResponse(res, 401, "Incorrect password. You can use Email OTP sign-in or default portal password Client@123 if auto-provisioned.");
      }
    } else {
      return errorResponse(res, 400, "Please provide either a password or an email verification code.");
    }

    const { orders, profile } = await collectClientOrdersAndProfile(email);
    return successResponse(res, 200, "Client signed in successfully", {
      user: {
        name: profile.name || email.split("@")[0],
        email,
        phone: profile.phone || "",
        businessName: profile.businessName || "",
        address: profile.address || "",
        city: profile.city || "",
        state: profile.state || "",
        pincode: profile.pincode || "",
        gstNumber: profile.gstNumber || "",
        panNumber: profile.panNumber || "",
        crmUserId: profile.crmUserId || undefined,
      },
      orders,
    });
  } catch (err) {
    next(err);
  }
};

const getClientOrdersByEmail = async (req, res, next) => {
  try {
    const email = String(req.query.email || "").toLowerCase().trim();
    if (!email || !email.includes("@")) {
      return errorResponse(res, 400, "Valid email query parameter is required.");
    }
    const { orders, profile } = await collectClientOrdersAndProfile(email);
    return successResponse(res, 200, "Client orders retrieved", {
      profile,
      orders,
    });
  } catch (err) {
    next(err);
  }
};

const getPublicOrder = async (req, res, next) => {
  try {
    const { orderNumber } = req.params;
    if (!orderNumber) {
      return errorResponse(res, 400, "Order number is required.");
    }

    const normOrder = String(orderNumber).toUpperCase().trim();
    const candidateKeys = ["ecommerce_orders_tech", "ecommerce_orders_consultancy", "ecommerce_orders"];

    let foundOrder = null;
    for (const k of candidateKeys) {
      const [rows] = await pool.execute("SELECT data_json FROM app_data WHERE module_key = ?", [k]);
      if (rows.length > 0 && rows[0].data_json) {
        try {
          const list = JSON.parse(rows[0].data_json);
          if (Array.isArray(list)) {
            const match = list.find((o) => o.orderNumber && o.orderNumber.toUpperCase().trim() === normOrder);
            if (match) {
              foundOrder = match;
              break;
            }
          }
        } catch {}
      }
    }

    if (!foundOrder) {
      return errorResponse(res, 404, "Order not found.");
    }

    return successResponse(res, 200, "Order retrieved", {
      order: foundOrder,
      pipeline: [
        { step: 1, name: "Order Pending", status: "completed" },
        {
          step: 2,
          name: "Invoice Created",
          status: foundOrder.status === "Invoice Created" || foundOrder.status === "Order Processed" ? "completed" : "pending",
          invoiceNumber: foundOrder.invoiceNumber || null,
          invoiceUrl: foundOrder.invoiceUrl || null,
        },
        {
          step: 3,
          name: "Order Processed",
          status: foundOrder.status === "Order Processed" ? "completed" : "pending",
        },
      ],
      clientPortal: {
        loginUrl: "https://crm2.saampark.com/login",
        email: foundOrder.email,
        defaultPassword: foundOrder.clientPassword || "Client@123",
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getStoreData,
  saveStoreData,
  getPublicProducts,
  getPublicStorefront,
  getPublicCatalogAndStorefront,
  createPublicOrder,
  getPublicOrder,
  requestClientEmailOtp,
  clientEmailLogin,
  getClientOrdersByEmail,
};
