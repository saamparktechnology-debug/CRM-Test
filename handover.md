# Saampark CRM — AI Handover Document

**Last Updated:** 2026-11-24  
**Project:** Saampark Group Multi-Company, Multi-Branch ERP & CRM Platform  
**Stack:** Next.js 16 (App Router, React, TypeScript, Tailwind CSS, TanStack Query, Zustand) + Node.js / Express + MySQL (`mysql2/promise`)

---

## 1. Core Project Rules (Non-Negotiable)
1. **Zero Hardcoded Business Options:** All dropdowns, presets, categories, packages, payment methods, tax slabs, units, stages, and statuses must come from the MySQL Master Data system (`/api/v1/masters/*`) managed by Super Admin at `/feature/masters`.
2. **Zero Dummy / Fallback Data in UI:** Never render mock/static fallback arrays on API errors. Display only live backend data.
3. **Locations via Pincode API (No `master_locations`):** Do **not** store or re-introduce static state/district/city arrays (`indiaCities.constants.ts` and `indiaStatesDistricts.constants.ts` are intentionally empty). All location fields (State, District, City/Post Office, Police Station/Block) resolve dynamically via `/api/v1/pincode/:pincode` (proxied to `api.postalpincode.in` with `zippopotam.us` fallback).
4. **Standard API Envelope:** Backend always returns `{ success, status, statusCode, message, data }` via `src/utils/apiResponse.js`. Frontend unwraps via `src/lib/responseHandler.ts` and `src/lib/api.ts`.
5. **Modular Code Organization:**
   - Backend: Separate `models/`, `services/`, `controllers/`, `routes/`, and `middlewares/`.
   - Frontend: Feature-based folders (`src/features/<domain>/{components,hooks,services,types,constants}`) and sectioned modal helpers/hooks.
6. **File Uploads:** Store uploaded files on disk in `backend/uploads/` via `multer` multipart payloads and save URLs in DB (never base64 blobs).

---

## 2. What Was Implemented & Fixed in This Session

### A. Dynamic Master Data System (Backend + Frontend)
- **Database (`backend/migrations/masters_migration.sql` & `backend/src/models/masterModel.js`):**
  - Tables: `master_types` and `master_options` (with `metadata_json` for structured fields like `primary_category`, `sac`, `gst`, `unit`, `rate`, `price`, `months`, `discountPct`, `isOther`).
  - `masterModel.ensureSchema()` idempotently creates tables and seeds **per `type_code`** (only if that `type_code` has 0 rows), guaranteeing all 75+ master types (including `primary_category`, `service_preset`, `payment_method`, `billing_unit`, `refer_by_category`, `user_role`) are always populated even if `master_options` already has custom rows.
  - **Primary Category (`primary_category`)** seeded with exact 9 options:
    1. `Website Development` (default)
    2. `Software Development`
    3. `Android/iOS Application`
    4. `Digital Marketing`
    5. `Domain service`
    6. `Cloud service`
    7. `Maintenance service`
    8. `Cloud & Maintenance service`
    9. `Other` (`metadata.isOther = true` → reveals custom category input + `+ Add Category to Master` button)
- **Backend Endpoints (`/api/v1/masters/*`):**
  - `GET /masters/bundle`, `GET /masters/types`, `GET /masters/options/:typeCode` (authenticated)
  - `POST/PUT /masters/types`, `POST/PUT/PATCH/DELETE /masters/options` (Super Admin `requireRole(1)` only)
- **Frontend Master UI (`/feature/masters` → `src/features/masters/index.tsx`):**
  - **Primary Categories & Items tab:** Left panel lists Primary Categories (`+ Add Category`); right panel lists `service_preset` items linked via `metadata.primary_category` (`+ Add Item` pre-links to the selected Primary Category with SAC/HSN, GST %, Unit, Default Rate).
  - **All Master Dropdowns tab:** Searchable management for all 75+ master types + `+ New Master Type`.
  - Reusable `<MasterSelect />` (`src/components/ui/MasterSelect.tsx`) and hooks (`useMasterBundle`, `useMasterOptions`, `useMasterMutations` in `src/features/masters/hooks/useMasters.ts`).

### B. 2-Step Invoice Flow & Billing Enhancements (`DocumentStudioModal`)
- **2-Step Invoice Tabs (`DocumentStudioModalSection2.tsx` & `DocumentStudioModal.tsx`):**
  - `totalSteps` for `mode === "invoice"` is `2`:
    - Tab 1: `1. Entity & Client Details` (compact `GST (18%)` / `Non-GST (0%)` toggle, Company/Branch/Sub-Branch, Sales Rep Attribution, Referred By, Client Billing Details, Invoice Reference & Date)
    - Tab 2: `2. Items & Settlement`
- **Client & Location Fields (`DocumentStudioModalSection1.tsx`, `createDocumentStudioModalFn50.hooks.tsx`, `backend/src/app.js`):**
  - Added `Client Date of Birth (DOB)` (`clientDob`).
  - Added `Police Station / Block` (`clientPoliceStation`) populated strictly from `pincodeBlocks` (`PostOffice[].Block || PostOffice[].Taluk` — **not** `pincodePlaces`, which are Post Offices for `City / Post Office`).
  - Non-GST mode hides `Client GSTIN` and `SAC/HSN` columns.
  - Removed `Deliverable Time (Timeline SLA)`, `Module Description & Technical Scope`, and `Platform / Setup Charge (₹)` from Invoice Step 2.
  - Added `Project` unit fallback alongside `billing_unit` master.
- **Category → Item Filtering & Auto-Load:**
  - Default `primaryCategory` aligned to `"Website Development"` (not `"Website"`).
  - `dynamicServicePresets` strictly filters `service_preset` items by `metadata.primary_category` (no fallback to items from other categories).
  - Changing `Primary Service Category` in Invoice loads the first item of the new category or clears the row if none exist.
  - On Create mode load, `#1 Item` auto-populates with the default category's first preset item.
- **Payment Plan, Split Bill & Custom EMI:**
  - Sequence changed to: `1. Full`, `2. Advance`, `3. Part (EMI)` (removed `Subscription` from Invoice).
  - `Invoice Due Date` is hidden when `paymentPlan === "full"`.
  - **Split Bill Payment** (`isSplitPayment` + `splitPayments[]` with `method` from `payment_method` master, `amount`, `reference`) available for `Full` and `Advance`, saved in `app_data`, hydrated in Edit mode, and rendered in `OfficialInvoiceDocumentSection2.tsx`.
  - **Custom EMI Schedule** (`emiCustomSchedule[]`): Auto-generates editable `dueDate` + `amount` rows for `Part (EMI)` with `Split Equally` and `+ Add EMI Date` buttons; `createDocumentStudioModalAction20.hooks.tsx` persists exact custom dates/amounts to `saveInstallmentRecord(...)`; `OfficialInvoiceDocumentSection2.tsx` renders the EMI schedule in View/PDF.
- **Referer User Role & Referred By:**
  - Added `"Referer"` to `UserRole` (`users.types.ts`, `UserModal.tsx`, `UserModalSection2.tsx`, `masterModel.js`).
  - Added `refer_by_category` master type and wired `Referred By (Optional)` card in Invoice Step 1 using `getStoredUserAccountsAsync()` for `availableReferers`.
- **Edit Mode Hydration:**
  - `DocumentStudioModal` accepts both `initialData` and `editDocument` (`const initialData = rawInitialData || editDocument;` declared at the top of `DocumentStudioModal` before `__ctrl`).
  - `runDocumentStudioModalEffect51.hooks.tsx` hydrates `paymentPlan`, `isSplitPayment`, `splitPayments`, `emiCustomSchedule`, `clientDob`, `clientPoliceStation`, `referByCategory`, and `referredByName` on Edit open, and resets them on Create open.

---

## 3. Critical Gotchas & Fixes to Remember
1. **TDZ Error in `DocumentStudioModalSection1.tsx`:** Never reference `primaryCategory` (or any `ctrl` destructured field) in a `useMemo`/`useEffect` *above* `const { ... } = ctrl;`. Always place `dynamicServicePresets` and `useEffect` hooks *below* `} = ctrl;`.
2. **`__ctrl` Getter/Setter Exposure in `DocumentStudioModal.tsx`:** Every state variable passed to `DocumentStudioModalSection1/2` or hooks **must** have a getter/setter on `const __ctrl: any = { ... }`. Missing getters cause silent no-ops on inputs/checkboxes.
3. **Hydration on Modal Reuse:** `DocumentStudioModal` stays mounted when closed. Always hydrate and reset state inside `runDocumentStudioModalEffect51.hooks.tsx`, not just in `React.useState(...)` initializers.
4. **Edit Prop Consistency:** `invoice/index.tsx` historically passed `editDocument={form.editingInvoice}` instead of `initialData`. Keep `initialData || editDocument` normalized in `DocumentStudioModal.tsx`.

---

## 4. Immediate Verification Checklist
- [ ] Confirm `npm run build` passes cleanly after moving `dynamicServicePresets` below `} = ctrl;` in `DocumentStudioModalSection1.tsx` and removing duplicate `))}` in `AddEventModal.tsx`.
- [ ] Restart backend so `masterModel.ensureSchema()` seeds `payment_method`, `refer_by_category`, `user_role` (`Referer`), and `service_preset` (`primary_category` metadata).
- [ ] Test **Settings → Master Data** (`/feature/masters`): add a Primary Category and add an Item under it, then verify it appears in Invoice Step 2.
- [ ] Test Invoice **Create → Save → View → Edit** with:
  - Pincode lookup (verify `Police Station / Block` shows `Block`, `City / Post Office` shows `PostOffice[].Name`).
  - `Split Bill Payment` (verify methods load, save to DB, render in View, and re-populate in Edit).
  - `Part (EMI)` custom dates & amounts (verify saved to EMI tracker, rendered in View, and re-populated in Edit).
