const pool = require("../config/db");
const { successResponse, errorResponse } = require("../utils/apiResponse");

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

module.exports = { getStoreData, saveStoreData };
