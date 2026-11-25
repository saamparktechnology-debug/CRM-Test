# Saampark CRM — System Architecture & File Map

## 1. Repository Structure
```text
CRM/
├── backend/                  # Node.js + Express + MySQL API (port 5000)
│   ├── migrations/
│   │   └── masters_migration.sql
│   └── src/
│       ├── app.js            # Express setup, CORS, Helmet, /api/v1/pincode/:pincode proxy, /api/v1 mount
│       ├── config/
│       │   └── db.js         # mysql2/promise pool (multi-DB aware via ENABLE_MULTI_DB)
│       ├── middlewares/
│       │   ├── authMiddleware.js        # JWT authenticate + requireRole(...roleIds)
│       │   ├── companyScopeMiddleware.js
│       │   └── uploadMiddleware.js      # Multer disk storage in backend/uploads/
│       ├── models/
│       │   ├── masterModel.js           # master_types & master_options + idempotent per-type seeding
│       │   └── ...                      # branchModel, userModel, salesModel, etc.
│       ├── services/
│       │   └── masterService.js
│       ├── controllers/
│       │   └── masterController.js
│       ├── routes/
│       │   ├── index.js                 # Central API router (/masters, /auth, /users, /sales, ...)
│       │   └── masterRoutes.js
│       └── utils/
│           └── apiResponse.js           # Standard { success, status, statusCode, message, data }
│
└── frontend/                 # Next.js 16 App Router + TypeScript + Tailwind
    └── src/
        ├── app/(routes)/
        │   ├── masters/page.tsx         # Super Admin Master Data Management route
        │   ├── sales/invoices/page.tsx  # Invoices & Billing Ledger
        │   └── ...
        ├── components/
        │   ├── documents/
        │   │   ├── DocumentStudioModal.tsx
        │   │   ├── components/documentstudiomodal-sections/
        │   │   │   ├── DocumentStudioModalHelpers.tsx
        │   │   │   ├── DocumentStudioModalSection1.tsx
        │   │   │   └── DocumentStudioModalSection2.tsx
        │   │   └── hooks/documentstudiomodal-hooks/
        │   │       ├── createDocumentStudioModalAction20.hooks.tsx
        │   │       ├── createDocumentStudioModalFn50.hooks.tsx
        │   │       ├── runDocumentStudioModalEffect51.hooks.tsx
        │   │       └── createDocumentStudioModalFn52.hooks.tsx
        │   ├── layout/components/sidebar-sections/SidebarHelpers.tsx
        │   └── ui/MasterSelect.tsx
        ├── features/
        │   ├── masters/                 # types, services/masterService.ts, hooks/useMasters.ts, components/, index.tsx
        │   ├── invoice/                 # OfficialInvoiceDocument, invoiceCrud.service.ts, index.tsx
        │   ├── users/                   # UserModal, UserList, userService.ts, users.types.ts
        │   └── leads/                   # SearchableLocationSelect (empty static location constants)
        ├── lib/
        │   ├── api.ts                   # Fetch wrapper + auth token injection
        │   ├── responseHandler.ts       # Global API response unwrapper
        │   ├── pincodeService.ts        # Pincode lookup client (backend proxy + direct fallback)
        │   └── storageSync.ts           # app_data module JSON sync
        └── store/
            └── useAuthStore.ts          # Zustand auth store (persisted as saampark-auth-v3)
```

---

## 2. Key Database Tables
1. **`master_types`**: `id`, `code` (unique, e.g. `primary_category`, `service_preset`, `payment_method`), `name`, `module_group`, `allow_custom_other`, `is_system`, `is_active`, `sort_order`.
2. **`master_options`**: `id`, `type_code` (FK → `master_types.code`), `company_id` (nullable for global), `label`, `value`, `code`, `metadata_json` (JSON), `sort_order`, `is_default`, `is_active`.
3. **`app_data`**: `module_key` (e.g. `invoices`, `users`, `clients`, `installments`), `data_json` (longtext JSON payload storing full invoice objects including `splitPayments`, `emiCustomSchedule`, `clientDob`, `clientPoliceStation`, `referByCategory`, `referredByName`).
4. **Core Relational Tables:** `companies`, `branches`, `sub_branches`, `users`, `roles`, `leads`, `lead_sources`, `customers`, `projects`, `tasks`, `tickets`, `quotations`, `estimates`, `subscription_packages`, `customer_subscriptions`, `activity_logs`.

---

## 3. Coding Conventions for Future AI Contributors
1. **Sectioned Modals & `__ctrl` Pattern:** Large modals (like `DocumentStudioModal`, `UserModal`, `AddClientProjectModal`) keep state in the parent modal and pass a `__ctrl` getter/setter proxy object to `Section1`/`Section2` and hook factories. Always:
   - Declare all state and `initialData` at the top of the parent component before `const __ctrl`.
   - Expose every new state getter and setter on `__ctrl`.
   - Destructure `ctrl` *before* any `useMemo` or `useEffect` in child section components to avoid TDZ errors.
2. **Master Dropdowns:** Never add literal `<option>` arrays for business data. Use `useMasterBundle()` / `useMasterOptions(typeCode)` or `<MasterSelect typeCode="..." />`. If a new dropdown type is needed, register it in `masterModel.js` (`INITIAL_MASTER_TYPES` + `INITIAL_MASTER_OPTIONS`) and `masters_migration.sql`.
3. **Production Build Check:** Always run `npm run build` (Turbopack/Next.js) in `frontend/` and `node -c` on modified backend files before finalizing changes.
