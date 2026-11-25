# Saampark CRM — Development & Operational Workflows

## 1. Master Data Management Workflow (Super Admin)
1. **Navigate to:** `Settings → Master Data` (`/feature/masters`, restricted to `Super Admin` / `role_id === 1`).
2. **Primary Categories & Items Tab:**
   - **Add Primary Category:** Click `+ Add Category` → creates a `master_options` row with `type_code = 'primary_category'`.
   - **Add Item under Category:** Select a Primary Category on the left → click `+ Add Item` on the right → creates a `master_options` row with `type_code = 'service_preset'` and `metadata_json.primary_category = '<Selected Category>'`, `sac`, `gst`, `unit`, `rate`.
3. **All Master Dropdowns Tab:**
   - Manage all 75+ system dropdowns (`payment_method`, `billing_unit`, `refer_by_category`, `tax_slab`, `lead_stage`, `expense_category`, `department`, `kyc_id_type`, etc.).
   - Toggle active/inactive, edit labels/values/sort order, or create a brand-new `master_types` group via `+ New Master Type`.
4. **Frontend Consumption:**
   - Global bundle fetched once and cached for 5 minutes via `useMasterBundle()` (`['masters', 'bundle']`).
   - Mutations (`useMasterMutations()`) invalidate `['masters']` so all dropdowns update immediately across the app.

---

## 2. Pincode-Based Location Resolution Workflow
1. User enters a 6-digit PIN in any billing or lead form (`handlePincodeChange`).
2. Frontend calls `lookupPincode(pin)` (`src/lib/pincodeService.ts`) → `GET /api/v1/pincode/:pincode` (or `/api/pincode/:pincode`) on backend `app.js`.
3. Backend queries `https://api.postalpincode.in/pincode/:pin` (fallback: `zippopotam.us/in/:pin`) and returns:
   - `state` / `states[]` → populates **State**
   - `district` / `districts[]` → populates **District**
   - `places[]` (`PostOffice[].Name`) → populates **City / Post Office** dropdown
   - `blocks[]` (`PostOffice[].Block || Taluk`, excluding `"NA"`) → populates **Police Station / Block** dropdown
4. **Hard Rule:** Never re-add static city/state/district lookup tables.

---

## 3. 2-Step Invoice Creation & Editing Workflow (`DocumentStudioModal`)

### Step 1: `1. Entity & Client Details`
1. **Tax Mode:** Compact toggle between `GST (18%)` and `Non-GST (0%)`.
   - Switching to `Non-GST` hides **Client GSTIN** in Step 1 and **SAC/HSN** in Step 2, and zeroes GST rates.
2. **Issuing Entity:** Company Entity (scoped by user permissions), Issuing Branch, Sub-Branch Partner, and optional Sales Rep & Team Member Revenue Attribution.
3. **Referred By (Optional):** Select `Refer By Category` (`refer_by_category` master) and `Referer` (loaded from `getStoredUserAccountsAsync()`).
4. **Client Billing Details:** Select existing client or `+ Custom Client`. Includes Organization Name, Designation, Contact Person, Phone, Email, **Client DOB**, Client GSTIN (GST only), Postal PIN Code (auto-fills Address, City/Post Office, Police Station/Block, District, State), Invoice Number, and Bill Date.

### Step 2: `2. Items & Settlement`
1. **Primary Service Category:** Populated from `primary_category` master.
   - Selecting `Other` reveals a custom text input + `+ Add Category to Master` button (persists directly to `primary_category` master).
   - Changing the category updates `#1 Item` to the first preset of that category (or clears the row if none exist) and filters the item dropdown strictly to that category's `service_preset` items.
2. **Line Items:** Preset/Custom selector, SAC/HSN (GST mode only), Qty, Unit (`billing_unit` master + `Project`), Rate (₹).
3. **Totals:** Discount (% or ₹), Subtotal, Statutory GST (18% if GST mode), Net Payable Total + Indian currency words.
4. **Payment Plan & Settlement Structure:**
   - **1. Full:** Marks full balance settled; hides **Invoice Due Date**; supports **Split Bill Payment**.
   - **2. Advance:** Enter upfront advance % or ₹; shows Due Date; supports **Split Bill Payment**.
   - **3. Part (EMI):** Enter upfront advance down payment; auto-generates editable EMI schedule rows (`dueDate` + `amount`) with **Split Equally** and **+ Add EMI Date** controls. Saving creates an EMI tracking record in `/feature/emi` using the exact custom dates and amounts.
5. **Save & Persistence:**
   - `createDocumentStudioModalAction20.hooks.tsx` constructs `finalDocPayload` (including `splitPayments`, `emiCustomSchedule`, `clientDob`, `clientPoliceStation`, `referByCategory`, `referredByName`) and saves via `addInvoice` / `updateInvoice` (`storageSync` → `app_data`).
   - Opening **View** renders `OfficialInvoiceDocumentSection2.tsx` (including Split Payment breakdown and EMI Installment Schedule).
   - Opening **Edit** passes `initialData` / `editDocument` and hydrates all fields in `runDocumentStudioModalEffect51.hooks.tsx`.

---

## 4. Users & Referer Role Workflow
- **Roles (`UserRole`):** `"Super Admin" | "Admin" | "Teams" | "Clients" | "Referer"`.
- In **Users** (`/feature/users`), creating/editing a `Teams` or `Referer` user exposes **Department**, **Designation**, **Refer By Category** (`refer_by_category` master), and **Commission %**.
- Users created with `Referer` role appear in the Invoice **Referred By** dropdown.
