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
    const [techProducts, consultProducts, techStore, consultStore, customCategories] = await Promise.all([
      fetchParsedModule("ecommerce_products_tech", []),
      fetchParsedModule("ecommerce_products_consultancy", []),
      fetchParsedModule("ecommerce_storefront_tech", null),
      fetchParsedModule("ecommerce_storefront_consultancy", null),
      fetchParsedModule("ecommerce_categories", []),
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
      categories: Array.isArray(customCategories) ? customCategories : [],
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
      couponCode,
      urgency,
      discountAmount: clientDiscountAmount,
      companyId,
      notes,
      idempotencyKey,
    } = req.body;

    if (!email || !clientName) {
      return errorResponse(res, 400, "Customer name and email are required.");
    }

    const rawItems = Array.isArray(items) ? items : [];
    if (rawItems.length === 0) {
      return errorResponse(res, 400, "Order must include at least one selected service item.");
    }

    const scope = resolveCompanyScope(companyId || req.body.group);
    const key = `ecommerce_orders_${scope}`;
    const clientEmail = String(email).toLowerCase().trim();
    const cleanIdempotencyKey = idempotencyKey ? String(idempotencyKey).trim() : "";

    // Load live catalog, storefront coupons & existing scoped orders in parallel
    const [existingOrdersRaw, catalogProducts, storefrontCfg] = await Promise.all([
      fetchParsedModule(key, []),
      fetchParsedModule(`ecommerce_products_${scope}`, []),
      fetchParsedModule(`ecommerce_storefront_${scope}`, null),
    ]);
    const existingOrders = Array.isArray(existingOrdersRaw) ? existingOrdersRaw : [];

    // 1. Check strict idempotencyKey match first (blocks network retry / double click duplicates)
    if (cleanIdempotencyKey) {
      const existingByKey = existingOrders.find(
        (o) => o && o.idempotencyKey && o.idempotencyKey === cleanIdempotencyKey
      );
      if (existingByKey) {
        return successResponse(res, 200, "Order already recorded", {
          order: existingByKey,
          duplicatePrevented: true,
          clientPortal: {
            loginUrl: "https://crm2.saampark.com/login",
            email: clientEmail,
            defaultPassword: "Client@123",
            role: "Clients",
          },
        });
      }
    }

    // 2. Sanitize & calculate authoritative line items using live DB prices when matched
    const prodMap = new Map();
    if (Array.isArray(catalogProducts)) {
      catalogProducts.forEach((p) => {
        if (!p) return;
        if (p.id) prodMap.set(String(p.id), p);
        if (p.slug) prodMap.set(String(p.slug), p);
      });
    }

    const cleanItems = [];
    for (const rawItem of rawItems) {
      const sid = String(rawItem?.serviceId || "").trim();
      const matched = sid ? prodMap.get(sid) : null;
      const dbPrice =
        matched && typeof matched.discountPrice === "number" && matched.discountPrice > 0
          ? matched.discountPrice
          : matched && typeof matched.startingPrice === "number" && matched.startingPrice > 0
          ? matched.startingPrice
          : 0;
      const submittedPrice = Number(rawItem?.price);
      const unitPrice =
        dbPrice > 0
          ? Math.round(dbPrice)
          : Number.isFinite(submittedPrice) && submittedPrice > 0
          ? Math.round(submittedPrice)
          : 0;
      const qty = Math.min(99, Math.max(1, parseInt(String(rawItem?.qty ?? rawItem?.quantity ?? 1), 10) || 1));

      if (unitPrice <= 0) continue;
      cleanItems.push({
        serviceId: sid || `item-${cleanItems.length + 1}`,
        name: String(rawItem?.name || matched?.name || "Service Package"),
        price: unitPrice,
        qty,
        priceType: rawItem?.priceType || matched?.priceType || "one-time",
        deliveryDays: rawItem?.deliveryDays || matched?.deliveryDays || "3-5 Days",
      });
    }

    if (cleanItems.length === 0) {
      return errorResponse(res, 400, "Order contains no billable items above ₹0.");
    }

    const baseSubtotal = cleanItems.reduce((sum, it) => sum + it.price * it.qty, 0);
    const isPriority = String(urgency || "Standard").toLowerCase() === "priority";
    const urgencyFee = isPriority ? Math.round(baseSubtotal * 0.1) : 0;
    const grossSubtotal = baseSubtotal + urgencyFee;

    // Resolve coupon percentage cleanly (live DB banners -> known defaults -> bounded fallback)
    const cleanCoupon = couponCode ? String(couponCode).toUpperCase().trim() : "";
    let couponPct = 0;
    if (cleanCoupon) {
      const banners = Array.isArray(storefrontCfg?.discountBanners)
        ? storefrontCfg.discountBanners
        : [];
      const matchedBanner = banners.find(
        (b) => b && b.isActive !== false && String(b.promoCode || "").toUpperCase().trim() === cleanCoupon
      );
      if (matchedBanner && Number(matchedBanner.discountPercentage) > 0) {
        couponPct = Math.min(90, Number(matchedBanner.discountPercentage));
      } else {
        const knownPct = { TECH20: 20, DIWALI25: 25, STARTUP30: 30, SAAMPARK10: 10 }[cleanCoupon];
        if (knownPct) {
          couponPct = knownPct;
        } else if (Number(clientDiscountAmount) > 0 && grossSubtotal > 0) {
          couponPct = Math.min(50, Math.round((Number(clientDiscountAmount) / grossSubtotal) * 100));
        }
      }
    }

    const calcDiscount = couponPct > 0 ? Math.min(grossSubtotal, Math.round((grossSubtotal * couponPct) / 100)) : 0;
    const taxableBase = Math.max(0, grossSubtotal - calcDiscount);
    const isIntraState = String(state || "West Bengal").toLowerCase().includes("west bengal");
    const calcGstType = isIntraState ? "CGST (9%) + SGST (9%)" : "IGST (18%)";
    const calcGst = isIntraState
      ? Math.round(taxableBase * 0.09) + Math.round(taxableBase * 0.09)
      : Math.round(taxableBase * 0.18);
    const calcTotal = taxableBase + calcGst;

    if (calcTotal <= 0) {
      return errorResponse(res, 400, "Calculated order total must be greater than ₹0.");
    }

    // 3. Time-window duplicate guard (45 seconds for identical email + totalAmount + item signature)
    const itemSig = cleanItems.map((it) => `${it.serviceId}:${it.qty}`).join("|");
    const nowMs = Date.now();
    const recentDup = existingOrders.find((o) => {
      if (!o || String(o.email || "").toLowerCase().trim() !== clientEmail) return false;
      if (Number(o.totalAmount) !== calcTotal) return false;
      const oSig = (Array.isArray(o.items) ? o.items : [])
        .map((it) => `${it.serviceId}:${it.qty || 1}`)
        .join("|");
      if (oSig !== itemSig) return false;
      const createdMs = Date.parse(o.createdAt || o.orderDate || "");
      return Number.isFinite(createdMs) && nowMs - createdMs >= 0 && nowMs - createdMs <= 45000;
    });
    if (recentDup) {
      return successResponse(res, 200, "Duplicate submission prevented", {
        order: recentDup,
        duplicatePrevented: true,
        clientPortal: {
          loginUrl: "https://crm2.saampark.com/login",
          email: clientEmail,
          defaultPassword: "Client@123",
          role: "Clients",
        },
      });
    }

    const isConsult = scope === "consultancy";
    const compCode = isConsult ? "SCS" : "STR";
    const seq = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-${compCode}-${new Date().getFullYear()}-${seq}`;

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
      idempotencyKey: cleanIdempotencyKey || undefined,
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
      items: cleanItems,
      subtotal: grossSubtotal,
      urgencyFee,
      gstAmount: calcGst,
      gstType: calcGstType,
      discountAmount: calcDiscount,
      couponCode: cleanCoupon,
      urgency: urgency || "Standard",
      totalAmount: calcTotal,
      status: "Order Pending",
      clientUserId: clientUserId ? String(clientUserId) : undefined,
      clientPassword: defaultPassword,
      notes: notes || "",
      orderDate: new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedScoped = [orderObj, ...existingOrders];

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

    // Non-blocking branded CRM email confirmation with itemized invoice summary & Client Portal credentials
    try {
      const { getGroupEmailConfig } = require("../utils/emailService");
      const { transporter, from } = getGroupEmailConfig();
      const itemRows = (orderObj.items || [])
        .map(
          (it) => `
          <tr>
            <td style="padding:10px 12px;border-bottom:1px solid #334155;color:#f1f5f9;font-size:13px;">${it.name}</td>
            <td style="padding:10px 12px;border-bottom:1px solid #334155;color:#94a3b8;font-size:13px;text-align:center;">${it.qty || 1}</td>
            <td style="padding:10px 12px;border-bottom:1px solid #334155;color:#38bdf8;font-size:13px;font-weight:700;text-align:right;">₹${((it.price || 0) * (it.qty || 1)).toLocaleString("en-IN")}</td>
          </tr>`
        )
        .join("");

      const divisionTitle = isConsult ? "SAAMPARK CONSULTANCY SERVICE" : "SAAMPARK TECHNOLOGY &amp; RESEARCH";
      transporter
        .sendMail({
          from,
          to: clientEmail,
          subject: `Order Confirmed: ${orderNumber} | ${divisionTitle}`,
          html: `
          <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#0b1120;border-radius:16px;overflow:hidden;border:1px solid #1e293b;box-shadow:0 12px 30px rgba(0,0,0,0.45);">
            <div style="background:linear-gradient(135deg,#2563eb,#0284c7);padding:28px 36px;text-align:center;">
              <p style="color:rgba(255,255,255,0.88);margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;">${divisionTitle}</p>
              <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:800;">Order Confirmed: ${orderNumber}</h1>
            </div>
            <div style="padding:30px 34px;background:#0f172a;">
              <p style="color:#f1f5f9;font-size:15px;margin:0 0 12px;">Dear <strong>${clientName}</strong>,</p>
              <p style="color:#94a3b8;font-size:13.5px;line-height:1.6;margin:0 0 20px;">
                Thank you for choosing Saampark Group. Your service order has been registered in our CRM billing &amp; delivery system for prompt invoice generation.
              </p>

              <div style="background:#1e293b;border:1px solid #334155;border-radius:12px;overflow:hidden;margin-bottom:20px;">
                <table style="width:100%;border-collapse:collapse;">
                  <thead>
                    <tr style="background:#0f172a;">
                      <th style="padding:10px 12px;text-align:left;font-size:11px;color:#94a3b8;text-transform:uppercase;">Service</th>
                      <th style="padding:10px 12px;text-align:center;font-size:11px;color:#94a3b8;text-transform:uppercase;">Qty</th>
                      <th style="padding:10px 12px;text-align:right;font-size:11px;color:#94a3b8;text-transform:uppercase;">Amount</th>
                    </tr>
                  </thead>
                  <tbody>${itemRows}</tbody>
                </table>
                <div style="padding:14px 16px;background:#162032;font-size:13px;color:#cbd5e1;">
                  ${orderObj.urgencyFee > 0 ? `<div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span>Express Kickoff (+10%):</span><span>+₹${orderObj.urgencyFee.toLocaleString("en-IN")}</span></div>` : ""}
                  ${orderObj.discountAmount > 0 ? `<div style="display:flex;justify-content:space-between;margin-bottom:4px;color:#34d399;"><span>Promo Discount (${orderObj.couponCode || "APPLIED"}):</span><span>-₹${orderObj.discountAmount.toLocaleString("en-IN")}</span></div>` : ""}
                  <div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span>GST (${orderObj.gstType}):</span><span>+₹${orderObj.gstAmount.toLocaleString("en-IN")}</span></div>
                  <div style="display:flex;justify-content:space-between;padding-top:8px;border-top:1px dashed #334155;font-size:15px;font-weight:800;color:#ffffff;">
                    <span>Total Amount (Incl. GST):</span>
                    <span style="color:#38bdf8;">₹${orderObj.totalAmount.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              <div style="background:#1e293b;border:1px solid #334155;border-radius:12px;padding:18px 20px;margin-bottom:24px;">
                <p style="color:#38bdf8;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 10px;">Your CRM Client Portal Access</p>
                <p style="color:#e2e8f0;font-size:13px;margin:4px 0;">Login Email: <strong>${clientEmail}</strong></p>
                <p style="color:#e2e8f0;font-size:13px;margin:4px 0;">Portal Password: <strong style="color:#34d399;">${defaultPassword}</strong></p>
              </div>

              <div style="text-align:center;">
                <a href="https://crm2.saampark.com/login" style="display:inline-block;background:linear-gradient(135deg,#2563eb,#0284c7);color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:700;font-size:13px;margin:4px;">Open CRM2 Client Portal</a>
                <a href="https://saampark.com/track?order=${orderNumber}" style="display:inline-block;background:#1e293b;border:1px solid #475569;color:#f8fafc;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:700;font-size:13px;margin:4px;">Track Order Status</a>
              </div>
            </div>
            <div style="padding:18px 34px;background:#0b1120;text-align:center;border-top:1px solid #1e293b;">
              <p style="color:#64748b;font-size:11.5px;margin:0;">© ${new Date().getFullYear()} Saampark Group. ISO 9001:2015 Certified.</p>
            </div>
          </div>`,
        })
        .catch((mailErr) => console.warn("Order email send skipped:", mailErr.message));
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
    const purpose = String(req.body.purpose || "login").toLowerCase();
    const clientName = String(req.body.name || "").trim();

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
      const subjectLabel =
        purpose === "register"
          ? `Verify Your Email & Complete Saampark Registration: ${code}`
          : `Your Saampark Group Verification Code: ${code}`;

      await transporter.sendMail({
        from,
        to: email,
        subject: subjectLabel,
        html: `
          <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:540px;margin:0 auto;background:#0b1120;border-radius:16px;overflow:hidden;border:1px solid #1e293b;box-shadow:0 12px 30px rgba(0,0,0,0.45);">
            <div style="background:linear-gradient(135deg,#2563eb,#0f766e);padding:26px 34px;text-align:center;">
              <p style="color:rgba(255,255,255,0.88);margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;">SAAMPARK GROUP OFFICIAL VERIFICATION</p>
              <h1 style="color:#ffffff;margin:0;font-size:21px;font-weight:800;">
                ${purpose === "register" ? "Complete Your Client Registration" : "Sign In Verification Code"}
              </h1>
            </div>
            <div style="padding:30px 34px;background:#0f172a;">
              <p style="color:#e2e8f0;font-size:14px;line-height:1.6;margin:0 0 18px;">
                ${clientName ? `Dear <strong>${clientName}</strong>,<br/><br/>` : ""}Use the 6-digit security verification code below for Saampark Storefront &amp; CRM2 Client Portal:
              </p>
              <div style="font-size:32px;font-weight:800;letter-spacing:10px;color:#38bdf8;background:#1e293b;border:1px solid #334155;padding:18px;text-align:center;border-radius:12px;margin:20px 0;font-family:monospace;">
                ${code}
              </div>
              <p style="color:#94a3b8;font-size:12.5px;line-height:1.5;margin:0;">
                This verification code expires in 10 minutes. Never share your OTP with anyone.
              </p>
            </div>
            <div style="padding:16px 34px;background:#0b1120;text-align:center;border-top:1px solid #1e293b;">
              <p style="color:#64748b;font-size:11.5px;margin:0;">Sent via Saampark Group Official Mail Server • crm2.saampark.com</p>
            </div>
          </div>
        `,
      });
    } catch (mailErr) {
      return errorResponse(res, 500, `Could not send verification email via Saampark Group SMTP: ${mailErr.message}`);
    }

    return successResponse(res, 200, "Verification code sent to your email via Saampark Group SMTP.", {
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
    const regName = req.body.name ? String(req.body.name).trim() : "";
    const regPhone = req.body.phone ? String(req.body.phone).trim() : "";
    const regBusiness = req.body.businessName ? String(req.body.businessName).trim() : "";

    if (!email || !email.includes("@")) {
      return errorResponse(res, 400, "Valid email address is required.");
    }

    if (otp) {
      const record = clientOtpStore.get(email);
      if (!record || record.expiresAt < Date.now() || record.code !== otp) {
        return errorResponse(res, 401, "Invalid or expired verification code.");
      }
      clientOtpStore.delete(email);

      const [uRows] = await pool.execute(
        "SELECT id, full_name, email, phone FROM users WHERE LOWER(TRIM(email)) = ? AND deleted_at IS NULL LIMIT 1",
        [email]
      );
      if (uRows.length === 0) {
        try {
          const hash = await bcrypt.hash(password || "Client@123", 10);
          const displayName =
            regName ||
            email.split("@")[0].replace(/[^a-zA-Z0-9 ]/g, " ").trim() ||
            "Saampark Client";
          await pool.execute(
            `INSERT INTO users (full_name, username, email, phone, password_hash, role_id, company_id, status, is_verified, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, 4, 1, 'active', 1, NOW(), NOW())`,
            [displayName, email, email, regPhone || "", hash]
          );
        } catch {}
      } else if (regName || regPhone || password) {
        try {
          const updates = [];
          const params = [];
          if (regName) {
            updates.push("full_name = ?");
            params.push(regName);
          }
          if (regPhone) {
            updates.push("phone = ?");
            params.push(regPhone);
          }
          if (password) {
            updates.push("password_hash = ?");
            params.push(await bcrypt.hash(password, 10));
          }
          if (updates.length > 0) {
            params.push(uRows[0].id);
            await pool.execute(`UPDATE users SET ${updates.join(", ")}, updated_at = NOW() WHERE id = ?`, params);
          }
        } catch {}
      }
    } else if (password) {
      const [uRows] = await pool.execute(
        "SELECT id, full_name, email, phone, password_hash FROM users WHERE LOWER(TRIM(email)) = ? AND deleted_at IS NULL LIMIT 1",
        [email]
      );
      if (uRows.length === 0) {
        return errorResponse(res, 401, "No account found for this email. Please register first or sign in with Email OTP.");
      }
      const valid = await bcrypt.compare(password, uRows[0].password_hash || "");
      if (!valid) {
        return errorResponse(res, 401, "Incorrect password. You can use Email OTP sign-in or your registered password.");
      }
    } else {
      return errorResponse(res, 400, "Please provide either a password or an email verification code.");
    }

    const { orders, profile } = await collectClientOrdersAndProfile(email);
    return successResponse(res, 200, "Client authenticated successfully", {
      user: {
        name: regName || profile.name || email.split("@")[0],
        email,
        phone: regPhone || profile.phone || "",
        businessName: regBusiness || profile.businessName || "",
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
