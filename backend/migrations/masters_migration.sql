-- ============================================================================
-- SAAMPARK CRM: Dynamic Super Admin Master Data Schema & Initial Seed
-- Zero Hardcoded Frontend Options Migration
-- ============================================================================

CREATE TABLE IF NOT EXISTS `master_types` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(100) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `module_group` VARCHAR(100) NOT NULL DEFAULT 'General',
  `description` TEXT NULL,
  `allow_custom_other` TINYINT(1) NOT NULL DEFAULT 0,
  `is_system` TINYINT(1) NOT NULL DEFAULT 1,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_master_types_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `master_options` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `type_code` VARCHAR(100) NOT NULL,
  `company_id` VARCHAR(100) NULL DEFAULT NULL,
  `label` VARCHAR(255) NOT NULL,
  `value` VARCHAR(255) NOT NULL,
  `code` VARCHAR(100) NULL DEFAULT NULL,
  `metadata_json` JSON NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_default` TINYINT(1) NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_by` INT NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_master_options_type` (`type_code`, `is_active`, `sort_order`),
  KEY `idx_master_options_company` (`company_id`),
  CONSTRAINT `fk_master_options_type` FOREIGN KEY (`type_code`) REFERENCES `master_types` (`code`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Seed Master Types
-- ============================================================================
INSERT IGNORE INTO `master_types` (`code`, `name`, `module_group`, `description`, `allow_custom_other`, `is_system`, `sort_order`) VALUES
('primary_category', 'Primary Category', 'Sales & Services', 'Primary service/project categories with custom Other support', 1, 1, 1),
('service_preset', 'Service & Item Presets', 'Sales & Services', 'Pre-configured service items with SAC, GST%, unit and default rate', 0, 1, 2),
('item_category', 'Item Categories', 'Sales & Services', 'Categories for catalog items and services', 0, 1, 3),
('marketing_package', 'Digital Marketing Packages', 'Packages & Subscriptions', 'Retainer packages (Start, Grow, Scale, etc.) with pricing and deliverables', 0, 1, 4),
('subscription_package_tier', 'Subscription Package Tiers', 'Packages & Subscriptions', 'Standard subscription tiers and pricing', 0, 1, 5),
('duration_offer', 'Duration & Discount Offers', 'Packages & Subscriptions', 'Retainer/subscription duration options and discount percentages', 0, 1, 6),
('billing_cycle', 'Billing Cycles', 'Packages & Subscriptions', 'Recurring billing cycle intervals', 0, 1, 7),
('billing_unit', 'Billing Units', 'Sales & Services', 'Line item measurement/billing units', 1, 1, 8),
('lead_source', 'Lead Sources', 'CRM & Leads', 'Acquisition channels for leads and enquiries', 1, 1, 10),
('lead_stage', 'Lead Pipeline Stages', 'CRM & Leads', 'Lead status / Kanban pipeline stages', 0, 1, 11),
('lead_call_outcome', 'Lead Call Outcomes', 'CRM & Leads', 'Telecalling outcome presets', 0, 1, 12),
('client_category', 'Client Categories', 'CRM & Leads', 'Client tier / classification categories', 0, 1, 13),
('client_designation', 'Client Designations', 'CRM & Leads', 'Contact person designations/roles', 1, 1, 14),
('client_label', 'Client & Lead Labels', 'CRM & Leads', 'Default probability and priority tags', 0, 1, 15),
('payment_method', 'Admin Payment Methods', 'Finance & Tax', 'Payment recording methods for invoices and receipts', 0, 1, 20),
('client_payment_method', 'Client Payment Methods', 'Finance & Tax', 'Client-facing payment options', 0, 1, 21),
('upi_app', 'UPI Apps', 'Finance & Tax', 'Supported UPI payment apps', 0, 1, 22),
('tax_type', 'Tax Types', 'Finance & Tax', 'Tax regime types (GST, IGST, etc.)', 1, 1, 23),
('tax_slab', 'GST / Tax Slabs', 'Finance & Tax', 'Standard tax percentage slabs', 0, 1, 24),
('currency', 'Currencies', 'Finance & Tax', 'Supported business currencies', 0, 1, 25),
('expense_category', 'Expense Categories', 'Finance & Tax', 'Company operational expense categories', 0, 1, 26),
('project_cost_category', 'Project Cost Categories', 'Finance & Tax', 'Direct project cost/expense categories', 0, 1, 27),
('transaction_type', 'Transaction Types', 'Finance & Tax', 'Financial ledger transaction types', 0, 1, 28),
('transaction_category', 'Transaction Categories', 'Finance & Tax', 'Financial ledger transaction categories', 0, 1, 29),
('project_type', 'Project Types', 'Projects & Tasks', 'Client vs Internal project classifications', 0, 1, 30),
('project_status', 'Project Statuses', 'Projects & Tasks', 'Project lifecycle statuses', 0, 1, 31),
('project_tier', 'Project Tiers', 'Projects & Tasks', 'Project scale/tier classification', 0, 1, 32),
('milestone_type', 'Milestone Types', 'Projects & Tasks', 'Project milestone phase templates', 0, 1, 33),
('milestone_status', 'Milestone Statuses', 'Projects & Tasks', 'Project milestone completion statuses', 0, 1, 34),
('task_status', 'Task Statuses', 'Projects & Tasks', 'Task board columns and statuses', 0, 1, 35),
('task_priority', 'Task Priorities', 'Projects & Tasks', 'Task urgency levels', 0, 1, 36),
('ticket_category', 'Ticket Categories', 'Support & Docs', 'Support ticket issue categories', 0, 1, 40),
('ticket_priority', 'Ticket Priorities', 'Support & Docs', 'Support ticket urgency levels', 0, 1, 41),
('ticket_status', 'Ticket Statuses', 'Support & Docs', 'Support ticket workflow statuses', 0, 1, 42),
('enquiry_priority', 'Enquiry Priorities', 'CRM & Leads', 'Enquiry urgency levels', 0, 1, 43),
('enquiry_status', 'Enquiry Statuses', 'CRM & Leads', 'Enquiry workflow statuses', 0, 1, 44),
('followup_type', 'Follow-up Types', 'CRM & Leads', 'Follow-up communication channels', 0, 1, 45),
('followup_status', 'Follow-up Statuses', 'CRM & Leads', 'Follow-up completion statuses', 0, 1, 46),
('meeting_duration', 'Meeting Durations', 'CRM & Leads', 'Standard meeting slot durations', 0, 1, 47),
('meeting_status', 'Meeting Statuses', 'CRM & Leads', 'Meeting lifecycle statuses', 0, 1, 48),
('document_category', 'Document Categories', 'Support & Docs', 'Vault document categories', 0, 1, 49),
('document_file_type', 'Document File Types', 'Support & Docs', 'Supported document formats', 0, 1, 50),
('file_storage_provider', 'File Storage Providers', 'Support & Docs', 'External/direct file storage sources', 0, 1, 51),
('kb_category', 'Knowledge Base Categories', 'Support & Docs', 'Knowledge base article categories', 0, 1, 52),
('kb_status', 'Knowledge Base Statuses', 'Support & Docs', 'Article publication statuses', 0, 1, 53),
('note_category', 'Note Categories', 'Support & Docs', 'Note/announcement categories', 0, 1, 54),
('letter_type', 'Letter Types', 'Support & Docs', 'Official HR/business letter templates', 0, 1, 55),
('department', 'Departments', 'HR & Payroll', 'Organizational departments', 0, 1, 60),
('kyc_id_type', 'KYC ID Document Types', 'HR & Payroll', 'Accepted government identity documents', 0, 1, 61),
('kyc_status', 'KYC Verification Statuses', 'HR & Payroll', 'Employee KYC review statuses', 0, 1, 62),
('gender', 'Gender Options', 'HR & Payroll', 'Gender selection options', 0, 1, 63),
('marital_status', 'Marital Status Options', 'HR & Payroll', 'Marital status options', 0, 1, 64),
('relationship', 'Emergency Contact Relationships', 'HR & Payroll', 'Family/emergency contact relationships', 0, 1, 65),
('attendance_status', 'Attendance Statuses', 'HR & Payroll', 'Daily attendance punch statuses', 0, 1, 66),
('work_location_type', 'Work Location Types', 'HR & Payroll', 'Office, WFH, Field Visit options', 0, 1, 67),
('payroll_payout_type', 'Payroll Payout Types', 'HR & Payroll', 'Salary and payout disbursement types', 0, 1, 68),
('payroll_adjustment_type', 'Payroll Adjustment Types', 'HR & Payroll', 'Bonus, allowance, advance, and deduction presets', 0, 1, 69),
('industry', 'Company Industries', 'System & Org', 'Business industry classifications', 0, 1, 70),
('partner_type', 'Branch Partner Types', 'System & Org', 'Branch and sub-branch partnership models', 0, 1, 71),
('trademark_type', 'Trademark Symbols', 'System & Org', 'Company branding trademark suffixes', 0, 1, 72),
('smtp_port', 'SMTP Port Presets', 'System & Org', 'Email server encryption & port presets', 0, 1, 73),
('event_type', 'Calendar Event Types', 'System & Org', 'Calendar event category types', 0, 1, 74),
('event_label', 'Calendar Event Labels', 'System & Org', 'Calendar event quick labels', 0, 1, 75),
('marketing_platform', 'Marketing Platforms', 'Packages & Subscriptions', 'Social/ad platforms for deliverables', 0, 1, 76),
('marketing_post_status', 'Marketing Post Statuses', 'Packages & Subscriptions', 'Content deliverable workflow statuses', 0, 1, 77),
('marketing_post_type', 'Marketing Post Types', 'Packages & Subscriptions', 'Deliverable media formats', 0, 1, 78),
('estimate_status', 'Estimate Statuses', 'Sales & Services', 'Estimate lifecycle statuses', 0, 1, 79),
('order_status', 'Order Statuses', 'Sales & Services', 'Sales order fulfillment statuses', 0, 1, 80),
('order_payment_status', 'Order Payment Statuses', 'Sales & Services', 'Sales order payment statuses', 0, 1, 81),
('po_status', 'Purchase Order Statuses', 'Sales & Services', 'Purchase order statuses', 0, 1, 82),
('leave_status', 'Leave Request Statuses', 'HR & Payroll', 'Leave approval statuses', 0, 1, 83),
('approval_type', 'Approval Request Types', 'System & Org', 'Approval queue filter types', 0, 1, 84),
('user_role', 'User Roles', 'System & Org', 'System access roles', 0, 1, 85),
('user_status', 'User Account Statuses', 'System & Org', 'User active/inactive/pending statuses', 0, 1, 86),
('emi_frequency', 'EMI Frequencies', 'Finance & Tax', 'EMI installment recurrence frequencies', 0, 1, 87);

-- ============================================================================
-- Seed Master Options: Primary Category (Exact 9 Items Requested)
-- ============================================================================
INSERT INTO `master_options` (`type_code`, `label`, `value`, `code`, `metadata_json`, `sort_order`, `is_default`, `is_active`)
SELECT * FROM (
  SELECT 'primary_category' AS type_code, 'Website Development' AS label, 'Website Development' AS value, 'WEB_DEV' AS code, JSON_OBJECT('isOther', false) AS metadata_json, 1 AS sort_order, 1 AS is_default, 1 AS is_active
  UNION ALL SELECT 'primary_category', 'Software Development', 'Software Development', 'SOFT_DEV', JSON_OBJECT('isOther', false), 2, 0, 1
  UNION ALL SELECT 'primary_category', 'Android/iOS Application', 'Android/iOS Application', 'MOBILE_APP', JSON_OBJECT('isOther', false), 3, 0, 1
  UNION ALL SELECT 'primary_category', 'Digital Marketing', 'Digital Marketing', 'DIGI_MKT', JSON_OBJECT('isOther', false), 4, 0, 1
  UNION ALL SELECT 'primary_category', 'Domain service', 'Domain service', 'DOMAIN', JSON_OBJECT('isOther', false), 5, 0, 1
  UNION ALL SELECT 'primary_category', 'Cloud service', 'Cloud service', 'CLOUD', JSON_OBJECT('isOther', false), 6, 0, 1
  UNION ALL SELECT 'primary_category', 'Maintenance service', 'Maintenance service', 'MAINT', JSON_OBJECT('isOther', false), 7, 0, 1
  UNION ALL SELECT 'primary_category', 'Cloud & Maintenance service', 'Cloud & Maintenance service', 'CLOUD_MAINT', JSON_OBJECT('isOther', false), 8, 0, 1
  UNION ALL SELECT 'primary_category', 'Other', 'Other', 'OTHER', JSON_OBJECT('isOther', true), 9, 0, 1
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM `master_options` WHERE `type_code` = 'primary_category');
