# CRM-Test (Debug & Integration Sandbox)

This repository contains the integrated testbed for the SAAMPARK CRM system.

## Project Structure
- `frontend/`: Next.js 14+ frontend application (Client Portal, Billing & Invoices, Approvals, Digital Marketing, Team Management).
- `backend/`: Node.js & Express REST API with modular controllers, authentication, and database migrations.
- `database/`: Database schema and baseline dump (`crm_db_complete.sql`).

## Quick Setup

### 1. Database
Import the schema and initial data into your MySQL database (e.g. `demo_crm_db`):
```bash
mysql -u <user> -p demo_crm_db < database/crm_db_complete.sql
```

### 2. Backend
```bash
cd backend
npm install
npm run dev # or npm start
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
