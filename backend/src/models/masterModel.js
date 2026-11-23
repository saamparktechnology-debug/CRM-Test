const db = require('../config/db');

let schemaInitialized = false;

const INITIAL_MASTER_TYPES = [
  ['primary_category', 'Primary Category', 'Sales & Services', 'Primary service/project categories with custom Other support', 1, 1, 1],
  ['service_preset', 'Service & Item Presets', 'Sales & Services', 'Pre-configured service items with SAC, GST%, unit and default rate', 0, 1, 2],
  ['item_category', 'Item Categories', 'Sales & Services', 'Categories for catalog items and services', 0, 1, 3],
  ['marketing_package', 'Digital Marketing Packages', 'Packages & Subscriptions', 'Retainer packages with pricing and deliverables', 0, 1, 4],
  ['subscription_package_tier', 'Subscription Package Tiers', 'Packages & Subscriptions', 'Standard subscription tiers and pricing', 0, 1, 5],
  ['duration_offer', 'Duration & Discount Offers', 'Packages & Subscriptions', 'Retainer/subscription duration options and discount percentages', 0, 1, 6],
  ['billing_cycle', 'Billing Cycles', 'Packages & Subscriptions', 'Recurring billing cycle intervals', 0, 1, 7],
  ['billing_unit', 'Billing Units', 'Sales & Services', 'Line item measurement/billing units', 1, 1, 8],
  ['lead_source', 'Lead Sources', 'CRM & Leads', 'Acquisition channels for leads and enquiries', 1, 1, 10],
  ['lead_stage', 'Lead Pipeline Stages', 'CRM & Leads', 'Lead status / Kanban pipeline stages', 0, 1, 11],
  ['lead_call_outcome', 'Lead Call Outcomes', 'CRM & Leads', 'Telecalling outcome presets', 0, 1, 12],
  ['client_category', 'Client Categories', 'CRM & Leads', 'Client tier / classification categories', 0, 1, 13],
  ['client_designation', 'Client Designations', 'CRM & Leads', 'Contact person designations/roles', 1, 1, 14],
  ['client_label', 'Client & Lead Labels', 'CRM & Leads', 'Default probability and priority tags', 0, 1, 15],
  ['payment_method', 'Admin Payment Methods', 'Finance & Tax', 'Payment recording methods for invoices and receipts', 0, 1, 20],
  ['client_payment_method', 'Client Payment Methods', 'Finance & Tax', 'Client-facing payment options', 0, 1, 21],
  ['upi_app', 'UPI Apps', 'Finance & Tax', 'Supported UPI payment apps', 0, 1, 22],
  ['tax_type', 'Tax Types', 'Finance & Tax', 'Tax regime types (GST, IGST, etc.)', 1, 1, 23],
  ['tax_slab', 'GST / Tax Slabs', 'Finance & Tax', 'Standard tax percentage slabs', 0, 1, 24],
  ['currency', 'Currencies', 'Finance & Tax', 'Supported business currencies', 0, 1, 25],
  ['expense_category', 'Expense Categories', 'Finance & Tax', 'Company operational expense categories', 0, 1, 26],
  ['project_cost_category', 'Project Cost Categories', 'Finance & Tax', 'Direct project cost/expense categories', 0, 1, 27],
  ['transaction_type', 'Transaction Types', 'Finance & Tax', 'Financial ledger transaction types', 0, 1, 28],
  ['transaction_category', 'Transaction Categories', 'Finance & Tax', 'Financial ledger transaction categories', 0, 1, 29],
  ['project_type', 'Project Types', 'Projects & Tasks', 'Client vs Internal project classifications', 0, 1, 30],
  ['project_status', 'Project Statuses', 'Projects & Tasks', 'Project lifecycle statuses', 0, 1, 31],
  ['project_tier', 'Project Tiers', 'Projects & Tasks', 'Project scale/tier classification', 0, 1, 32],
  ['milestone_type', 'Milestone Types', 'Projects & Tasks', 'Project milestone phase templates', 0, 1, 33],
  ['milestone_status', 'Milestone Statuses', 'Projects & Tasks', 'Project milestone completion statuses', 0, 1, 34],
  ['task_status', 'Task Statuses', 'Projects & Tasks', 'Task board columns and statuses', 0, 1, 35],
  ['task_priority', 'Task Priorities', 'Projects & Tasks', 'Task urgency levels', 0, 1, 36],
  ['ticket_category', 'Ticket Categories', 'Support & Docs', 'Support ticket issue categories', 0, 1, 40],
  ['ticket_priority', 'Ticket Priorities', 'Support & Docs', 'Support ticket urgency levels', 0, 1, 41],
  ['ticket_status', 'Ticket Statuses', 'Support & Docs', 'Support ticket workflow statuses', 0, 1, 42],
  ['enquiry_priority', 'Enquiry Priorities', 'CRM & Leads', 'Enquiry urgency levels', 0, 1, 43],
  ['enquiry_status', 'Enquiry Statuses', 'CRM & Leads', 'Enquiry workflow statuses', 0, 1, 44],
  ['followup_type', 'Follow-up Types', 'CRM & Leads', 'Follow-up communication channels', 0, 1, 45],
  ['followup_status', 'Follow-up Statuses', 'CRM & Leads', 'Follow-up completion statuses', 0, 1, 46],
  ['meeting_duration', 'Meeting Durations', 'CRM & Leads', 'Standard meeting slot durations', 0, 1, 47],
  ['meeting_status', 'Meeting Statuses', 'CRM & Leads', 'Meeting lifecycle statuses', 0, 1, 48],
  ['document_category', 'Document Categories', 'Support & Docs', 'Vault document categories', 0, 1, 49],
  ['document_file_type', 'Document File Types', 'Support & Docs', 'Supported document formats', 0, 1, 50],
  ['file_storage_provider', 'File Storage Providers', 'Support & Docs', 'External/direct file storage sources', 0, 1, 51],
  ['kb_category', 'Knowledge Base Categories', 'Support & Docs', 'Knowledge base article categories', 0, 1, 52],
  ['kb_status', 'Knowledge Base Statuses', 'Support & Docs', 'Article publication statuses', 0, 1, 53],
  ['note_category', 'Note Categories', 'Support & Docs', 'Note/announcement categories', 0, 1, 54],
  ['letter_type', 'Letter Types', 'Support & Docs', 'Official HR/business letter templates', 0, 1, 55],
  ['department', 'Departments', 'HR & Payroll', 'Organizational departments', 0, 1, 60],
  ['kyc_id_type', 'KYC ID Document Types', 'HR & Payroll', 'Accepted government identity documents', 0, 1, 61],
  ['kyc_status', 'KYC Verification Statuses', 'HR & Payroll', 'Employee KYC review statuses', 0, 1, 62],
  ['gender', 'Gender Options', 'HR & Payroll', 'Gender selection options', 0, 1, 63],
  ['marital_status', 'Marital Status Options', 'HR & Payroll', 'Marital status options', 0, 1, 64],
  ['relationship', 'Emergency Contact Relationships', 'HR & Payroll', 'Family/emergency contact relationships', 0, 1, 65],
  ['attendance_status', 'Attendance Statuses', 'HR & Payroll', 'Daily attendance punch statuses', 0, 1, 66],
  ['work_location_type', 'Work Location Types', 'HR & Payroll', 'Office, WFH, Field Visit options', 0, 1, 67],
  ['payroll_payout_type', 'Payroll Payout Types', 'HR & Payroll', 'Salary and payout disbursement types', 0, 1, 68],
  ['payroll_adjustment_type', 'Payroll Adjustment Types', 'HR & Payroll', 'Bonus, allowance, advance, and deduction presets', 0, 1, 69],
  ['industry', 'Company Industries', 'System & Org', 'Business industry classifications', 0, 1, 70],
  ['partner_type', 'Branch Partner Types', 'System & Org', 'Branch and sub-branch partnership models', 0, 1, 71],
  ['trademark_type', 'Trademark Symbols', 'System & Org', 'Company branding trademark suffixes', 0, 1, 72],
  ['smtp_port', 'SMTP Port Presets', 'System & Org', 'Email server encryption & port presets', 0, 1, 73],
  ['event_type', 'Calendar Event Types', 'System & Org', 'Calendar event category types', 0, 1, 74],
  ['event_label', 'Calendar Event Labels', 'System & Org', 'Calendar event quick labels', 0, 1, 75],
  ['marketing_platform', 'Marketing Platforms', 'Packages & Subscriptions', 'Social/ad platforms for deliverables', 0, 1, 76],
  ['marketing_post_status', 'Marketing Post Statuses', 'Packages & Subscriptions', 'Content deliverable workflow statuses', 0, 1, 77],
  ['marketing_post_type', 'Marketing Post Types', 'Packages & Subscriptions', 'Deliverable media formats', 0, 1, 78],
  ['estimate_status', 'Estimate Statuses', 'Sales & Services', 'Estimate lifecycle statuses', 0, 1, 79],
  ['order_status', 'Order Statuses', 'Sales & Services', 'Sales order fulfillment statuses', 0, 1, 80],
  ['order_payment_status', 'Order Payment Statuses', 'Sales & Services', 'Sales order payment statuses', 0, 1, 81],
  ['po_status', 'Purchase Order Statuses', 'Sales & Services', 'Purchase order statuses', 0, 1, 82],
  ['leave_status', 'Leave Request Statuses', 'HR & Payroll', 'Leave approval statuses', 0, 1, 83],
  ['approval_type', 'Approval Request Types', 'System & Org', 'Approval queue filter types', 0, 1, 84],
  ['user_role', 'User Roles', 'System & Org', 'System access roles', 0, 1, 85],
  ['user_status', 'User Account Statuses', 'System & Org', 'User active/inactive/pending statuses', 0, 1, 86],
  ['emi_frequency', 'EMI Frequencies', 'Finance & Tax', 'EMI installment recurrence frequencies', 0, 1, 87],
  ['refer_by_category', 'Refer By Category', 'CRM & Leads', 'Referral source categories for users and billing', 1, 1, 88],
];

const INITIAL_MASTER_OPTIONS = [
  // Primary Category (exact 9 items)
  ['primary_category', 'Website Development', 'Website Development', 'WEB_DEV', { isOther: false }, 1, 1],
  ['primary_category', 'Software Development', 'Software Development', 'SOFT_DEV', { isOther: false }, 2, 0],
  ['primary_category', 'Android/iOS Application', 'Android/iOS Application', 'MOBILE_APP', { isOther: false }, 3, 0],
  ['primary_category', 'Digital Marketing', 'Digital Marketing', 'DIGI_MKT', { isOther: false }, 4, 0],
  ['primary_category', 'Domain service', 'Domain service', 'DOMAIN', { isOther: false }, 5, 0],
  ['primary_category', 'Cloud service', 'Cloud service', 'CLOUD', { isOther: false }, 6, 0],
  ['primary_category', 'Maintenance service', 'Maintenance service', 'MAINT', { isOther: false }, 7, 0],
  ['primary_category', 'Cloud & Maintenance service', 'Cloud & Maintenance service', 'CLOUD_MAINT', { isOther: false }, 8, 0],
  ['primary_category', 'Other', 'Other', 'OTHER', { isOther: true }, 9, 0],

  // Service Presets (Items / SAC / GST)
  ['service_preset', 'Website Development', 'Website Development', '998313', { primary_category: 'Website Development', sac: '998313', gst: 18, unit: 'Project', rate: 25000 }, 1, 1],
  ['service_preset', 'Software Development', 'Software Development', '998314', { primary_category: 'Software Development', sac: '998314', gst: 18, unit: 'Project', rate: 45000 }, 2, 0],
  ['service_preset', 'Android/iOS Application', 'Android/iOS Application', '998314', { primary_category: 'Android/iOS Application', sac: '998314', gst: 18, unit: 'Project', rate: 55000 }, 3, 0],
  ['service_preset', 'Digital Marketing', 'Digital Marketing', '998311', { primary_category: 'Digital Marketing', sac: '998311', gst: 18, unit: 'Month', rate: 15000 }, 4, 0],
  ['service_preset', 'Domain service', 'Domain service', '998315', { primary_category: 'Domain service', sac: '998315', gst: 18, unit: 'Yearly', rate: 1500 }, 5, 0],
  ['service_preset', 'Cloud service', 'Cloud service', '998315', { primary_category: 'Cloud service', sac: '998315', gst: 18, unit: 'Month', rate: 3500 }, 6, 0],
  ['service_preset', 'Maintenance service', 'Maintenance service', '998316', { primary_category: 'Maintenance service', sac: '998316', gst: 18, unit: 'Month', rate: 5000 }, 7, 0],
  ['service_preset', 'Cloud & Maintenance service', 'Cloud & Maintenance service', '998315', { primary_category: 'Cloud & Maintenance service', sac: '998315', gst: 18, unit: 'Month', rate: 7500 }, 8, 0],

  // Item Categories
  ['item_category', 'Design', 'Design', 'DESIGN', null, 1, 0],
  ['item_category', 'Services', 'Services', 'SERVICES', null, 2, 1],
  ['item_category', 'Development', 'Development', 'DEV', null, 3, 0],

  // Marketing Packages
  ['marketing_package', 'Start (₹1,999)', 'Start', 'PKG-01', { price: 1999, postersCount: 8, reelsCount: 1, storiesCount: 8, badge: 'Starter' }, 1, 0],
  ['marketing_package', 'Grow (₹4,999)', 'Grow', 'PKG-02', { price: 4999, postersCount: 12, reelsCount: 2, storiesCount: 12, badge: 'Popular' }, 2, 1],
  ['marketing_package', 'Scale (₹9,999)', 'Scale', 'PKG-03', { price: 9999, postersCount: 20, reelsCount: 4, storiesCount: 20, badge: 'Growth' }, 3, 0],
  ['marketing_package', 'Enterprise Custom', 'Enterprise Custom', 'PKG-04', { price: 19999, postersCount: 30, reelsCount: 8, storiesCount: 30, badge: 'Enterprise' }, 4, 0],

  // Subscription Package Tiers
  ['subscription_package_tier', 'Startup Digital Launch', 'Startup Digital Launch', 'SUB_START', { category: 'Digital Marketing', price: 15000 }, 1, 0],
  ['subscription_package_tier', 'Growth Business Retainer', 'Growth Business Retainer', 'SUB_GROW', { category: 'Digital Marketing', price: 25000 }, 2, 1],
  ['subscription_package_tier', 'Enterprise Scale Plan', 'Enterprise Scale Plan', 'SUB_ENT', { category: 'Software Development', price: 50000 }, 3, 0],

  // Duration Offers
  ['duration_offer', '1 Month (Standard Plan)', '1 month', '1M', { months: 1, discountPct: 0 }, 1, 1],
  ['duration_offer', '3 Months (Quarterly Retainer - 5% Off)', '3 months', '3M', { months: 3, discountPct: 5 }, 2, 0],
  ['duration_offer', '6 Months (Half-Yearly - 10% Off)', '6 months', '6M', { months: 6, discountPct: 10 }, 3, 0],
  ['duration_offer', '12 Months (Annual - 15% Off)', '12 months', '12M', { months: 12, discountPct: 15 }, 4, 0],

  // Billing Cycles & Units
  ['billing_cycle', 'Daily', 'Daily', 'DAILY', { days: 1 }, 1, 0],
  ['billing_cycle', 'Weekly (Every 7 Days)', 'Weekly', 'WEEKLY', { days: 7 }, 2, 0],
  ['billing_cycle', 'Monthly', 'Monthly', 'MONTHLY', { days: 30 }, 3, 1],
  ['billing_cycle', 'Quarterly (Every 3 Months)', 'Quarterly', 'QUARTERLY', { days: 90 }, 4, 0],
  ['billing_cycle', 'Half-Yearly (Every 6 Months)', 'Half-Yearly', 'HALF_YEARLY', { days: 180 }, 5, 0],
  ['billing_cycle', 'Yearly (Annual Plan)', 'Yearly', 'YEARLY', { days: 365 }, 6, 0],

  ['billing_unit', 'Qty', 'Qty', 'QTY', null, 1, 0],
  ['billing_unit', 'Unit', 'Unit', 'UNIT', null, 2, 0],
  ['billing_unit', 'Project', 'Project', 'PROJECT', null, 3, 1],
  ['billing_unit', 'Month', 'Month', 'MONTH', null, 4, 0],
  ['billing_unit', 'Weekly', 'Weekly', 'WEEKLY', null, 5, 0],
  ['billing_unit', 'Yearly', 'Yearly', 'YEARLY', null, 6, 0],
  ['billing_unit', 'Other', 'Other', 'OTHER', { isOther: true }, 7, 0],

  // Lead Sources, Stages, Outcomes, Client Meta
  ['lead_source', 'Website', 'Website', 'WEB', null, 1, 1],
  ['lead_source', 'Social Media', 'Social Media', 'SOCIAL', null, 2, 0],
  ['lead_source', 'Meta Ads', 'Meta Ads', 'META', null, 3, 0],
  ['lead_source', 'Google Ads', 'Google Ads', 'GOOGLE', null, 4, 0],
  ['lead_source', 'Referral', 'Referral', 'REF', null, 5, 0],
  ['lead_source', 'Local Market', 'Local Market', 'LOCAL', null, 6, 0],
  ['lead_source', 'Store Visit', 'Store Visit', 'STORE', null, 7, 0],
  ['lead_source', 'Email Campaign', 'Email Campaign', 'EMAIL', null, 8, 0],
  ['lead_source', 'Other', 'Other', 'OTHER', { isOther: true }, 9, 0],

  ['lead_stage', 'New', 'New', 'NEW', { color: '#0ea5e9' }, 1, 1],
  ['lead_stage', 'Qualified', 'Qualified', 'QUALIFIED', { color: '#6366f1' }, 2, 0],
  ['lead_stage', 'Discussion', 'Discussion', 'DISCUSSION', { color: '#eab308' }, 3, 0],
  ['lead_stage', 'Negotiation', 'Negotiation', 'NEGOTIATION', { color: '#f97316' }, 4, 0],
  ['lead_stage', 'Store Visit', 'Store Visit', 'STORE_VISIT', { color: '#a855f7' }, 5, 0],
  ['lead_stage', 'Our Office Visit', 'Our Office Visit', 'OFFICE_VISIT', { color: '#ec4899' }, 6, 0],
  ['lead_stage', 'Won', 'Won', 'WON', { color: '#22c55e' }, 7, 0],
  ['lead_stage', 'Lost', 'Lost', 'LOST', { color: '#ef4444' }, 8, 0],

  ['lead_call_outcome', 'Interested (Follow-up Needed)', 'interested', 'INTERESTED', { status: 'Discussion', nextDays: 2 }, 1, 0],
  ['lead_call_outcome', 'Meeting / Office Visit Fixed', 'meeting', 'MEETING', { status: 'Our Office Visit', nextDays: 1 }, 2, 0],
  ['lead_call_outcome', 'Quotation / Proposal Sent', 'proposal', 'PROPOSAL', { status: 'Negotiation', nextDays: 3 }, 3, 0],
  ['lead_call_outcome', 'Not Reachable / Busy', 'unreachable', 'UNREACHABLE', { status: 'New', nextDays: 1 }, 4, 0],
  ['lead_call_outcome', 'Not Interested', 'lost', 'LOST', { status: 'Lost', nextDays: 0 }, 5, 0],

  ['client_category', 'Corporate', 'Corporate', 'CORP', null, 1, 1],
  ['client_category', 'Enterprise', 'Enterprise', 'ENT', null, 2, 0],
  ['client_category', 'SME / Startup', 'SME / Startup', 'SME', null, 3, 0],
  ['client_category', 'Referral', 'Referral', 'REF', null, 4, 0],
  ['client_category', 'Potential', 'Potential', 'POTENTIAL', null, 5, 0],

  ['client_designation', 'Proprietor', 'Proprietor', 'PROP', null, 1, 1],
  ['client_designation', 'Founder', 'Founder', 'FOUNDER', null, 2, 0],
  ['client_designation', 'Managing Director', 'Managing Director', 'MD', null, 3, 0],
  ['client_designation', 'CEO', 'CEO', 'CEO', null, 4, 0],
  ['client_designation', 'Director', 'Director', 'DIR', null, 5, 0],
  ['client_designation', 'Manager', 'Manager', 'MGR', null, 6, 0],
  ['client_designation', 'Partner', 'Partner', 'PARTNER', null, 7, 0],
  ['client_designation', 'Other', 'Other', 'OTHER', { isOther: true }, 8, 0],

  ['client_label', '50% Probability', '50% Probability', 'PROB_50', { color: '#eab308' }, 1, 0],
  ['client_label', '90% Probability', '90% Probability', 'PROB_90', { color: '#84cc16' }, 2, 0],
  ['client_label', 'Corporate', 'Corporate', 'CORP', { color: '#0284c7' }, 3, 0],
  ['client_label', 'VIP Priority', 'VIP Priority', 'VIP', { color: '#a855f7' }, 4, 0],

  // Payment, Tax, Currency, Expenses, Transactions
  ['payment_method', 'UPI / Net Banking', 'UPI / Net Banking', 'UPI_NB', null, 1, 1],
  ['payment_method', 'NEFT / RTGS / IMPS', 'NEFT / RTGS / IMPS', 'NEFT', null, 2, 0],
  ['payment_method', 'Razorpay / Payment Gateway', 'Razorpay / Payment Gateway', 'RAZORPAY', null, 3, 0],
  ['payment_method', 'Bank Cheque', 'Bank Cheque', 'CHEQUE', null, 4, 0],
  ['payment_method', 'Cash Deposit', 'Cash Deposit', 'CASH', null, 5, 0],
  ['payment_method', 'Credit / Debit Card', 'Credit / Debit Card', 'CARD', null, 6, 0],

  ['client_payment_method', 'UPI / PhonePe / GPay', 'UPI / PhonePe / GPay', 'UPI', null, 1, 1],
  ['client_payment_method', 'NEFT / RTGS / IMPS Bank Transfer', 'NEFT / RTGS / IMPS Bank Transfer', 'NEFT', null, 2, 0],
  ['client_payment_method', 'Net Banking', 'Net Banking', 'NB', null, 3, 0],
  ['client_payment_method', 'Cheque Deposit', 'Cheque Deposit', 'CHEQUE', null, 4, 0],

  ['upi_app', 'Google Pay (GPay)', 'Google Pay (GPay)', 'GPAY', null, 1, 1],
  ['upi_app', 'PhonePe', 'PhonePe', 'PHONEPE', null, 2, 0],
  ['upi_app', 'Paytm UPI', 'Paytm UPI', 'PAYTM', null, 3, 0],
  ['upi_app', 'BHIM UPI', 'BHIM UPI', 'BHIM', null, 4, 0],
  ['upi_app', 'Other UPI App', 'Other UPI App', 'OTHER', { isOther: true }, 5, 0],

  ['tax_type', 'GST', 'GST', 'GST', null, 1, 1],
  ['tax_type', 'IGST', 'IGST', 'IGST', null, 2, 0],
  ['tax_type', 'SGST', 'SGST', 'SGST', null, 3, 0],
  ['tax_type', 'CGST', 'CGST', 'CGST', null, 4, 0],
  ['tax_type', 'VAT', 'VAT', 'VAT', null, 5, 0],
  ['tax_type', 'Service Tax', 'Service Tax', 'SERVICE_TAX', null, 6, 0],
  ['tax_type', 'Other', 'Other', 'OTHER', { isOther: true }, 7, 0],

  ['tax_slab', '0% (Non-GST / Exempt)', '0', 'GST_0', { rate: 0 }, 1, 0],
  ['tax_slab', '5% GST', '5', 'GST_5', { rate: 5 }, 2, 0],
  ['tax_slab', '12% GST', '12', 'GST_12', { rate: 12 }, 3, 0],
  ['tax_slab', '18% (Standard GST)', '18', 'GST_18', { rate: 18 }, 4, 1],
  ['tax_slab', '28% GST', '28', 'GST_28', { rate: 28 }, 5, 0],

  ['currency', '₹ (INR) - Indian Rupee', 'INR', 'INR', { symbol: '₹', name: 'Indian Rupee' }, 1, 1],
  ['currency', '$ (USD) - US Dollar', 'USD', 'USD', { symbol: '$', name: 'US Dollar' }, 2, 0],
  ['currency', '€ (EUR) - Euro', 'EUR', 'EUR', { symbol: '€', name: 'Euro' }, 3, 0],
  ['currency', '£ (GBP) - British Pound', 'GBP', 'GBP', { symbol: '£', name: 'British Pound' }, 4, 0],
  ['currency', 'AED (Dirham)', 'AED', 'AED', { symbol: 'AED', name: 'UAE Dirham' }, 5, 0],

  ['expense_category', 'Cloud & Server Infrastructure', 'Cloud & Server Infrastructure', 'CLOUD', null, 1, 0],
  ['expense_category', 'SaaS & Software Subscriptions', 'SaaS & Software Subscriptions', 'SAAS', null, 2, 0],
  ['expense_category', 'Subcontractor & Freelancer Fees', 'Subcontractor & Freelancer Fees', 'SUBCON', null, 3, 0],
  ['expense_category', 'Design Assets & Stock Media', 'Design Assets & Stock Media', 'DESIGN', null, 4, 0],
  ['expense_category', 'Office & Operational Utilities', 'Office & Operational Utilities', 'OFFICE', null, 5, 1],
  ['expense_category', 'Marketing & Lead Acquisition', 'Marketing & Lead Acquisition', 'MKT', null, 6, 0],

  ['project_cost_category', 'Direct Project Supply', 'Direct Project Supply', 'SUPPLY', null, 1, 0],
  ['project_cost_category', 'Dedicated Cloud VM & Hosting', 'Dedicated Cloud VM & Hosting', 'CLOUD', null, 2, 0],
  ['project_cost_category', 'Domain & SSL Certificates', 'Domain & SSL Certificates', 'DOMAIN', null, 3, 0],
  ['project_cost_category', 'Third-Party API Licenses', 'Third-Party API Licenses', 'API', null, 4, 0],
  ['project_cost_category', 'Subcontractor & Specialist Fees', 'Subcontractor & Specialist Fees', 'SUBCON', null, 5, 0],
  ['project_cost_category', 'Other Project Cost', 'Other Project Cost', 'OTHER', { isOther: true }, 6, 0],

  ['transaction_type', 'Income', 'Income', 'INCOME', null, 1, 1],
  ['transaction_type', 'Expense', 'Expense', 'EXPENSE', null, 2, 0],

  ['transaction_category', 'Sales', 'Sales', 'SALES', null, 1, 1],
  ['transaction_category', 'Services', 'Services', 'SERVICES', null, 2, 0],
  ['transaction_category', 'Subscriptions', 'Subscriptions', 'SUBS', null, 3, 0],
  ['transaction_category', 'Operations', 'Operations', 'OPS', null, 4, 0],
  ['transaction_category', 'Salary', 'Salary', 'SALARY', null, 5, 0],

  // Projects, Tasks, Tickets, Enquiries, Meetings, Follow-ups, Docs
  ['project_type', 'Client Project', 'Client Project', 'CLIENT', null, 1, 1],
  ['project_type', 'Internal Project', 'Internal Project', 'INTERNAL', null, 2, 0],

  ['project_status', 'Open', 'Open', 'OPEN', null, 1, 1],
  ['project_status', 'In Progress', 'In Progress', 'IN_PROGRESS', null, 2, 0],
  ['project_status', 'Under Review', 'Under Review', 'REVIEW', null, 3, 0],
  ['project_status', 'Hold', 'Hold', 'HOLD', null, 4, 0],
  ['project_status', 'Completed', 'Completed', 'COMPLETED', null, 5, 0],
  ['project_status', 'Cancelled', 'Cancelled', 'CANCELLED', null, 6, 0],

  ['project_tier', 'Starter', 'Starter', 'STARTER', null, 1, 1],
  ['project_tier', 'Grow', 'Grow', 'GROW', null, 2, 0],
  ['project_tier', 'Scale', 'Scale', 'SCALE', null, 3, 0],
  ['project_tier', 'Enterprise / Custom', 'Enterprise / Custom', 'ENTERPRISE', null, 4, 0],

  ['milestone_type', 'Frontend Development', 'Frontend Development', 'FE', null, 1, 0],
  ['milestone_type', 'Backend & Database', 'Backend & Database', 'BE', null, 2, 0],
  ['milestone_type', 'UI/UX Design', 'UI/UX Design', 'UIUX', null, 3, 0],
  ['milestone_type', 'Testing & QA', 'Testing & QA', 'QA', null, 4, 0],
  ['milestone_type', 'Live Deployment', 'Live Deployment', 'DEPLOY', null, 5, 0],
  ['milestone_type', 'Custom Milestone', 'Custom Milestone', 'CUSTOM', { isOther: true }, 6, 0],

  ['milestone_status', 'Pending', 'Pending', 'PENDING', null, 1, 1],
  ['milestone_status', 'In Progress', 'In Progress', 'IN_PROGRESS', null, 2, 0],
  ['milestone_status', 'On Hold', 'On Hold', 'ON_HOLD', null, 3, 0],
  ['milestone_status', 'Completed', 'Completed', 'COMPLETED', null, 4, 0],

  ['task_status', 'To do', 'To do', 'TODO', { color: 'border-amber-400' }, 1, 1],
  ['task_status', 'In progress', 'In progress', 'IN_PROGRESS', { color: 'border-blue-400' }, 2, 0],
  ['task_status', 'Review', 'Review', 'REVIEW', { color: 'border-purple-400' }, 3, 0],
  ['task_status', 'Done', 'Done', 'DONE', { color: 'border-emerald-400' }, 4, 0],

  ['task_priority', 'Low', 'Low', 'LOW', null, 1, 0],
  ['task_priority', 'Normal', 'Normal', 'Normal', null, 2, 1],
  ['task_priority', 'High', 'High', 'HIGH', null, 3, 0],
  ['task_priority', 'Urgent', 'Urgent', 'URGENT', null, 4, 0],

  ['ticket_category', 'Project Deliverable & Scope', 'Project Deliverable & Scope', 'SCOPE', null, 1, 0],
  ['ticket_category', 'Billing & Invoicing Dispute', 'Billing & Invoicing Dispute', 'BILLING', null, 2, 0],
  ['ticket_category', 'Technical Issue / Bug', 'Technical Issue / Bug', 'BUG', null, 3, 0],
  ['ticket_category', 'Account & Permissions', 'Account & Permissions', 'ACCOUNT', null, 4, 0],
  ['ticket_category', 'General Inquiry', 'General Inquiry', 'GENERAL', null, 5, 1],

  ['ticket_priority', 'Low', 'Low', 'LOW', null, 1, 0],
  ['ticket_priority', 'Normal', 'Normal', 'Normal', null, 2, 1],
  ['ticket_priority', 'High', 'High', 'HIGH', null, 3, 0],
  ['ticket_priority', 'Critical', 'Critical', 'CRITICAL', null, 4, 0],

  ['ticket_status', 'New', 'New', 'NEW', null, 1, 1],
  ['ticket_status', 'Open', 'Open', 'OPEN', null, 2, 0],
  ['ticket_status', 'In Progress', 'In Progress', 'IN_PROGRESS', null, 3, 0],
  ['ticket_status', 'Under Review', 'Under Review', 'REVIEW', null, 4, 0],
  ['ticket_status', 'Resolved', 'Resolved', 'RESOLVED', null, 5, 0],
  ['ticket_status', 'Closed', 'Closed', 'CLOSED', null, 6, 0],

  ['enquiry_priority', 'Low', 'Low', 'LOW', null, 1, 0],
  ['enquiry_priority', 'Medium', 'Medium', 'MEDIUM', null, 2, 1],
  ['enquiry_priority', 'High', 'High', 'HIGH', null, 3, 0],
  ['enquiry_priority', 'Urgent', 'Urgent', 'URGENT', null, 4, 0],

  ['enquiry_status', 'New', 'New', 'NEW', null, 1, 1],
  ['enquiry_status', 'In Progress', 'In Progress', 'IN_PROGRESS', null, 2, 0],
  ['enquiry_status', 'Resolved', 'Resolved', 'RESOLVED', null, 3, 0],
  ['enquiry_status', 'Closed', 'Closed', 'CLOSED', null, 4, 0],

  ['followup_type', 'Call', 'Call', 'CALL', null, 1, 1],
  ['followup_type', 'Email', 'Email', 'EMAIL', null, 2, 0],
  ['followup_type', 'Meeting', 'Meeting', 'MEETING', null, 3, 0],
  ['followup_type', 'Visit', 'Visit', 'VISIT', null, 4, 0],

  ['followup_status', 'Pending', 'Pending', 'PENDING', null, 1, 1],
  ['followup_status', 'Completed', 'Completed', 'COMPLETED', null, 2, 0],
  ['followup_status', 'Cancelled', 'Cancelled', 'CANCELLED', null, 3, 0],

  ['meeting_duration', '15 min', '15', '15M', null, 1, 0],
  ['meeting_duration', '30 min', '30', '30M', null, 2, 1],
  ['meeting_duration', '45 min', '45', '45M', null, 3, 0],
  ['meeting_duration', '60 min', '60', '60M', null, 4, 0],
  ['meeting_duration', '90 min', '90', '90M', null, 5, 0],
  ['meeting_duration', '120 min', '120', '120M', null, 6, 0],

  ['meeting_status', 'Scheduled', 'Scheduled', 'SCHEDULED', null, 1, 1],
  ['meeting_status', 'In Progress', 'In Progress', 'IN_PROGRESS', null, 2, 0],
  ['meeting_status', 'Completed', 'Completed', 'COMPLETED', null, 3, 0],
  ['meeting_status', 'Cancelled', 'Cancelled', 'CANCELLED', null, 4, 0],

  ['document_category', 'General', 'General', 'GENERAL', null, 1, 1],
  ['document_category', 'Contracts', 'Contracts', 'CONTRACTS', null, 2, 0],
  ['document_category', 'Invoices', 'Invoices', 'INVOICES', null, 3, 0],
  ['document_category', 'Legal', 'Legal', 'LEGAL', null, 4, 0],

  ['document_file_type', 'PDF', 'PDF', 'PDF', null, 1, 1],
  ['document_file_type', 'DOC', 'DOC', 'DOC', null, 2, 0],
  ['document_file_type', 'XLS', 'XLS', 'XLS', null, 3, 0],
  ['document_file_type', 'Image', 'Image', 'IMAGE', null, 4, 0],
  ['document_file_type', 'Other', 'Other', 'OTHER', null, 5, 0],

  ['file_storage_provider', 'Google Drive Link', 'Google Drive Link', 'GDRIVE', null, 1, 1],
  ['file_storage_provider', 'Dropbox Folder', 'Dropbox Folder', 'DROPBOX', null, 2, 0],
  ['file_storage_provider', 'OneDrive Document', 'OneDrive Document', 'ONEDRIVE', null, 3, 0],
  ['file_storage_provider', 'Figma / External Cloud URL', 'Figma / External Cloud URL', 'FIGMA', null, 4, 0],
  ['file_storage_provider', 'Direct File Upload', 'Direct File Upload', 'DIRECT', null, 5, 0],

  ['kb_category', 'General', 'General', 'GENERAL', null, 1, 1],
  ['kb_category', 'Getting Started', 'Getting Started', 'START', null, 2, 0],
  ['kb_category', 'FAQ', 'FAQ', 'FAQ', null, 3, 0],
  ['kb_category', 'Tutorials', 'Tutorials', 'TUTORIALS', null, 4, 0],
  ['kb_category', 'API Docs', 'API Docs', 'API', null, 5, 0],

  ['kb_status', 'Published', 'Published', 'PUBLISHED', null, 1, 1],
  ['kb_status', 'Draft', 'Draft', 'DRAFT', null, 2, 0],

  ['note_category', 'General Announcement', 'General Announcement', 'ANNOUNCEMENT', null, 1, 1],
  ['note_category', 'Project Deliverable', 'Project Deliverable', 'DELIVERABLE', null, 2, 0],
  ['note_category', 'Client Notice', 'Client Notice', 'CLIENT_NOTICE', null, 3, 0],
  ['note_category', 'Internal Protocol', 'Internal Protocol', 'PROTOCOL', null, 4, 0],
  ['note_category', 'Personal Scratchpad', 'Personal Scratchpad', 'SCRATCHPAD', null, 5, 0],

  ['letter_type', 'Offer Letters', 'offer_letter', 'OFFER', null, 1, 1],
  ['letter_type', 'Office Close Notices', 'office_close', 'CLOSE', null, 2, 0],
  ['letter_type', 'Appointment Letters', 'appointment', 'APPT', null, 3, 0],
  ['letter_type', 'Experience Letters', 'experience', 'EXP', null, 4, 0],
  ['letter_type', 'Warning Notices', 'warning', 'WARN', null, 5, 0],
  ['letter_type', 'Announcements', 'announcement', 'ANNOUNCE', null, 6, 0],
  ['letter_type', 'Custom Letters', 'custom', 'CUSTOM', null, 7, 0],

  // HR, KYC, Payroll, Attendance, Org, Events
  ['department', 'Sales & Marketing', 'Sales & Marketing', 'SALES', null, 1, 0],
  ['department', 'Software Development', 'Software Development', 'DEV', null, 2, 1],
  ['department', 'Accounts & Finance', 'Accounts & Finance', 'FINANCE', null, 3, 0],
  ['department', 'Customer Support', 'Customer Support', 'SUPPORT', null, 4, 0],
  ['department', 'Design & Creative', 'Design & Creative', 'DESIGN', null, 5, 0],
  ['department', 'Operations & HR', 'Operations & HR', 'HR', null, 6, 0],

  ['kyc_id_type', 'Aadhaar Card (12 Digits)', 'Aadhaar Card', 'AADHAAR', null, 1, 1],
  ['kyc_id_type', 'PAN Card (10 Characters)', 'PAN Card', 'PAN', null, 2, 0],
  ['kyc_id_type', 'Voter ID / EPIC Card', 'Voter ID', 'VOTER', null, 3, 0],
  ['kyc_id_type', 'Passport', 'Passport', 'PASSPORT', null, 4, 0],
  ['kyc_id_type', 'Driving License', 'Driving License', 'DL', null, 5, 0],

  ['kyc_status', 'Pending Verification', 'Pending', 'PENDING', null, 1, 1],
  ['kyc_status', 'In Processing', 'Processing', 'PROCESSING', null, 2, 0],
  ['kyc_status', 'Verified Account', 'Verified', 'VERIFIED', null, 3, 0],
  ['kyc_status', 'Rejected / Incomplete', 'Rejected', 'REJECTED', null, 4, 0],

  ['gender', 'Male', 'Male', 'M', null, 1, 0],
  ['gender', 'Female', 'Female', 'F', null, 2, 0],
  ['gender', 'Other', 'Other', 'O', null, 3, 0],

  ['marital_status', 'Single', 'Single', 'SINGLE', null, 1, 1],
  ['marital_status', 'Married', 'Married', 'MARRIED', null, 2, 0],
  ['marital_status', 'Other', 'Other', 'OTHER', null, 3, 0],

  ['relationship', 'Father', 'Father', 'FATHER', null, 1, 0],
  ['relationship', 'Mother', 'Mother', 'MOTHER', null, 2, 0],
  ['relationship', 'Spouse', 'Spouse', 'SPOUSE', null, 3, 0],
  ['relationship', 'Brother', 'Brother', 'BROTHER', null, 4, 0],
  ['relationship', 'Sister', 'Sister', 'SISTER', null, 5, 0],
  ['relationship', 'Other', 'Other', 'OTHER', { isOther: true }, 6, 0],

  ['attendance_status', 'Present', 'Present', 'PRESENT', null, 1, 1],
  ['attendance_status', 'Half Day', 'Half Day', 'HALF_DAY', null, 2, 0],
  ['attendance_status', 'Late', 'Late', 'LATE', null, 3, 0],
  ['attendance_status', 'On Leave', 'On Leave', 'ON_LEAVE', null, 4, 0],
  ['attendance_status', 'Absent', 'Absent', 'ABSENT', null, 5, 0],
  ['attendance_status', 'Holiday', 'Holiday', 'HOLIDAY', null, 6, 0],
  ['attendance_status', 'Day Off', 'Day Off', 'DAY_OFF', null, 7, 0],

  ['work_location_type', 'Office (HQ)', 'Office', 'OFFICE', null, 1, 1],
  ['work_location_type', 'Work From Home', 'Work From Home', 'WFH', null, 2, 0],
  ['work_location_type', 'Field Visit', 'Field Visit', 'FIELD', null, 3, 0],

  ['payroll_payout_type', 'Monthly Salary + Commission', 'Monthly Salary + Commission', 'SALARY_COMM', null, 1, 1],
  ['payroll_payout_type', 'Project Share / Milestone Payout', 'Project Share / Milestone Payout', 'PROJ_SHARE', null, 2, 0],
  ['payroll_payout_type', 'Subscription Commission Only', 'Subscription Commission Only', 'SUB_COMM', null, 3, 0],
  ['payroll_payout_type', 'Bonus / Performance Incentive', 'Bonus / Performance Incentive', 'BONUS', null, 4, 0],
  ['payroll_payout_type', 'Salary Advance', 'Salary Advance', 'ADVANCE', null, 5, 0],
  ['payroll_payout_type', 'Full Final Settlement', 'Full Final Settlement', 'FNF', null, 6, 0],

  ['payroll_adjustment_type', 'Performance Bonus / Milestone Reward', 'Performance Bonus', 'BONUS', { kind: 'credit' }, 1, 0],
  ['payroll_adjustment_type', 'Travel & Fuel Expense Reimbursement', 'Travel Reimbursement', 'TRAVEL', { kind: 'credit' }, 2, 0],
  ['payroll_adjustment_type', 'Tech, Internet & Hardware Allowance', 'Tech Allowance', 'TECH', { kind: 'credit' }, 3, 0],
  ['payroll_adjustment_type', 'Salary Advance', 'Salary Advance', 'ADVANCE', { kind: 'debit' }, 4, 0],
  ['payroll_adjustment_type', 'Custom Credit Adjustment', 'Custom Credit', 'CUSTOM_CREDIT', { kind: 'credit', isOther: true }, 5, 0],
  ['payroll_adjustment_type', 'Custom Deduction / Penalty', 'Custom Deduction', 'CUSTOM_DEBIT', { kind: 'debit', isOther: true }, 6, 0],

  ['industry', 'Technology', 'Technology', 'TECH', null, 1, 1],
  ['industry', 'Healthcare', 'Healthcare', 'HEALTH', null, 2, 0],
  ['industry', 'Finance', 'Finance', 'FIN', null, 3, 0],
  ['industry', 'Education', 'Education', 'EDU', null, 4, 0],
  ['industry', 'Manufacturing', 'Manufacturing', 'MFG', null, 5, 0],
  ['industry', 'Retail', 'Retail', 'RETAIL', null, 6, 0],
  ['industry', 'Real Estate', 'Real Estate', 'REALESTATE', null, 7, 0],
  ['industry', 'Consulting', 'Consulting', 'CONSULTING', null, 8, 0],
  ['industry', 'Media', 'Media', 'MEDIA', null, 9, 0],
  ['industry', 'Other', 'Other', 'OTHER', { isOther: true }, 10, 0],

  ['partner_type', 'Franchise Partner', 'Franchise Partner', 'FRANCHISE', null, 1, 1],
  ['partner_type', 'Agency Partner', 'Agency Partner', 'AGENCY', null, 2, 0],
  ['partner_type', 'Satellite Office', 'Satellite Office', 'SATELLITE', null, 3, 0],
  ['partner_type', 'Regional Associate', 'Regional Associate', 'REGIONAL', null, 4, 0],
  ['partner_type', 'Corporate Partner', 'Corporate Partner', 'CORP', null, 5, 0],

  ['trademark_type', 'None (No Symbol)', '', 'NONE', null, 1, 1],
  ['trademark_type', 'TM (Trademark / Applied)', 'TM', 'TM', null, 2, 0],
  ['trademark_type', '® (Registered Trademark)', '®', 'REG', null, 3, 0],

  ['smtp_port', 'STARTTLS (587)', '587', '587', null, 1, 1],
  ['smtp_port', 'SSL / TLS (465)', '465', '465', null, 2, 0],

  ['event_type', 'Meeting', 'Meeting', 'MEETING', { color: 'blue' }, 1, 1],
  ['event_type', 'Holiday', 'Holiday', 'HOLIDAY', { color: 'green' }, 2, 0],
  ['event_type', 'Deadline', 'Deadline', 'DEADLINE', { color: 'red' }, 3, 0],
  ['event_type', 'Training', 'Training', 'TRAINING', { color: 'purple' }, 4, 0],
  ['event_type', 'Default', 'Default', 'DEFAULT', { color: 'gray' }, 5, 0],

  ['event_label', 'Call', 'Call', 'CALL', { color: '#ef4444' }, 1, 0],
  ['event_label', 'Email', 'Email', 'EMAIL', { color: '#3b82f6' }, 2, 0],
  ['event_label', 'Visit', 'Visit', 'VISIT', { color: '#22c55e' }, 3, 0],
  ['event_label', 'Client', 'Client', 'CLIENT', { color: '#a855f7' }, 4, 0],

  ['marketing_platform', 'Meta (IG / FB)', 'Meta', 'META', null, 1, 1],
  ['marketing_platform', 'Instagram', 'Instagram', 'IG', null, 2, 0],
  ['marketing_platform', 'Facebook', 'Facebook', 'FB', null, 3, 0],
  ['marketing_platform', 'YouTube', 'YouTube', 'YT', null, 4, 0],
  ['marketing_platform', 'LinkedIn', 'LinkedIn', 'LI', null, 5, 0],

  ['marketing_post_status', 'Draft', 'Draft', 'DRAFT', null, 1, 1],
  ['marketing_post_status', 'Client Review', 'Client Review', 'REVIEW', null, 2, 0],
  ['marketing_post_status', 'Scheduled', 'Scheduled', 'SCHEDULED', null, 3, 0],
  ['marketing_post_status', 'Posted (Live)', 'Posted', 'POSTED', null, 4, 0],

  ['marketing_post_type', 'Poster', 'Poster', 'POSTER', null, 1, 1],
  ['marketing_post_type', 'Video', 'Video', 'VIDEO', null, 2, 0],
  ['marketing_post_type', 'Real Model Video', 'Real Model Video', 'REEL', null, 3, 0],
  ['marketing_post_type', 'Tutor / Custom', 'Custom', 'CUSTOM', null, 4, 0],

  ['estimate_status', 'Draft', 'Draft', 'DRAFT', null, 1, 1],
  ['estimate_status', 'Sent', 'Sent', 'SENT', null, 2, 0],
  ['estimate_status', 'Approved', 'Approved', 'APPROVED', null, 3, 0],
  ['estimate_status', 'Rejected', 'Rejected', 'REJECTED', null, 4, 0],

  ['order_status', 'Pending', 'Pending', 'PENDING', null, 1, 1],
  ['order_status', 'Processing', 'Processing', 'PROCESSING', null, 2, 0],
  ['order_status', 'Completed', 'Completed', 'COMPLETED', null, 3, 0],
  ['order_status', 'Cancelled', 'Cancelled', 'CANCELLED', null, 4, 0],

  ['order_payment_status', 'Unpaid', 'Unpaid', 'UNPAID', null, 1, 1],
  ['order_payment_status', 'Partially paid', 'Partially paid', 'PARTIAL', null, 2, 0],
  ['order_payment_status', 'Paid', 'Paid', 'PAID', null, 3, 0],

  ['po_status', 'Draft', 'Draft', 'DRAFT', null, 1, 1],
  ['po_status', 'Sent', 'Sent', 'SENT', null, 2, 0],
  ['po_status', 'Received', 'Received', 'RECEIVED', null, 3, 0],
  ['po_status', 'Cancelled', 'Cancelled', 'CANCELLED', null, 4, 0],

  ['leave_status', 'Pending Review', 'Pending', 'PENDING', null, 1, 1],
  ['leave_status', 'Approved', 'Approved', 'APPROVED', null, 2, 0],
  ['leave_status', 'Rejected', 'Rejected', 'REJECTED', null, 3, 0],

  ['approval_type', 'Bills / Invoices', 'invoice', 'INVOICE', null, 1, 0],
  ['approval_type', 'Quotations', 'quotation', 'QUOTATION', null, 2, 0],
  ['approval_type', 'Subscriptions', 'subscription', 'SUBSCRIPTION', null, 3, 0],

  ['user_role', 'Super Admin', 'Super Admin', 'SUPER_ADMIN', null, 1, 0],
  ['user_role', 'Admin', 'Admin', 'ADMIN', null, 2, 0],
  ['user_role', 'Teams', 'Teams', 'TEAMS', null, 3, 1],
  ['user_role', 'Clients', 'Clients', 'CLIENTS', null, 4, 0],
  ['user_role', 'Referer', 'Referer', 'REFERER', null, 5, 0],

  ['user_status', 'Active', 'Active', 'ACTIVE', null, 1, 1],
  ['user_status', 'Inactive', 'Inactive', 'INACTIVE', null, 2, 0],
  ['user_status', 'Pending', 'Pending', 'PENDING', null, 3, 0],

  ['emi_frequency', 'Monthly', 'Monthly', 'MONTHLY', null, 1, 1],
  ['emi_frequency', 'Bi-weekly (14 Days)', 'Bi-weekly', 'BIWEEKLY', null, 2, 0],
  ['emi_frequency', 'Quarterly (3 Months)', 'Quarterly', 'QUARTERLY', null, 3, 0],

  // Refer By Category
  ['refer_by_category', 'Self / Direct', 'Self / Direct', 'SELF', null, 1, 1],
  ['refer_by_category', 'Staff / Employee', 'Staff / Employee', 'STAFF', null, 2, 0],
  ['refer_by_category', 'Channel Partner', 'Channel Partner', 'PARTNER', null, 3, 0],
  ['refer_by_category', 'Existing Client', 'Existing Client', 'CLIENT', null, 4, 0],
  ['refer_by_category', 'Social Media / Ads', 'Social Media / Ads', 'ADS', null, 5, 0],
  ['refer_by_category', 'Other', 'Other', 'OTHER', { isOther: true }, 6, 0],
];

async function ensureSchema() {
  if (schemaInitialized) return;
  await db.query(`
    CREATE TABLE IF NOT EXISTS master_types (
      id INT NOT NULL AUTO_INCREMENT,
      code VARCHAR(100) NOT NULL,
      name VARCHAR(150) NOT NULL,
      module_group VARCHAR(100) NOT NULL DEFAULT 'General',
      description TEXT NULL,
      allow_custom_other TINYINT(1) NOT NULL DEFAULT 0,
      is_system TINYINT(1) NOT NULL DEFAULT 1,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uk_master_types_code (code)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS master_options (
      id INT NOT NULL AUTO_INCREMENT,
      type_code VARCHAR(100) NOT NULL,
      company_id VARCHAR(100) NULL DEFAULT NULL,
      label VARCHAR(255) NOT NULL,
      value VARCHAR(255) NOT NULL,
      code VARCHAR(100) NULL DEFAULT NULL,
      metadata_json JSON NULL,
      sort_order INT NOT NULL DEFAULT 0,
      is_default TINYINT(1) NOT NULL DEFAULT 0,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_by INT NULL DEFAULT NULL,
      created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_master_options_type (type_code, is_active, sort_order),
      KEY idx_master_options_company (company_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // Seed master_types idempotently
  for (const row of INITIAL_MASTER_TYPES) {
    await db.query(
      `INSERT IGNORE INTO master_types (code, name, module_group, description, allow_custom_other, is_system, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      row
    );
  }

  // Seed master_options idempotently per type_code (only if that type_code currently has 0 options)
  const [existingCounts] = await db.query(`SELECT type_code, COUNT(*) AS cnt FROM master_options GROUP BY type_code`);
  const populatedTypes = new Set(existingCounts.filter(r => Number(r.cnt) > 0).map(r => r.type_code));
  for (const opt of INITIAL_MASTER_OPTIONS) {
    const [typeCode, label, value, code, meta, sortOrder, isDefault] = opt;
    if (populatedTypes.has(typeCode)) continue;
    await db.query(
      `INSERT INTO master_options (type_code, label, value, code, metadata_json, sort_order, is_default, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [typeCode, label, value, code, meta ? JSON.stringify(meta) : null, sortOrder, isDefault]
    );
  }

  const [[refCnt]] = await db.query(`SELECT COUNT(*) AS cnt FROM master_options WHERE type_code = 'refer_by_category'`);
  if (Number(refCnt.cnt) === 0) {
    for (const opt of INITIAL_MASTER_OPTIONS.filter(o => o[0] === 'refer_by_category')) {
      const [typeCode, label, value, code, meta, sortOrder, isDefault] = opt;
      await db.query(
        `INSERT INTO master_options (type_code, label, value, code, metadata_json, sort_order, is_default, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
        [typeCode, label, value, code, meta ? JSON.stringify(meta) : null, sortOrder, isDefault]
      );
    }
  }
  schemaInitialized = true;
}

function parseMeta(row) {
  let metadata = null;
  if (row.metadata_json) {
    try {
      metadata = typeof row.metadata_json === 'string' ? JSON.parse(row.metadata_json) : row.metadata_json;
    } catch {
      metadata = null;
    }
  }
  return { ...row, metadata };
}

const masterModel = {
  ensureSchema,

  async getAllTypes(includeInactive = false) {
    await ensureSchema();
    const where = includeInactive ? '' : 'WHERE is_active = 1';
    const [rows] = await db.query(`SELECT * FROM master_types ${where} ORDER BY sort_order ASC, name ASC`);
    return rows;
  },

  async createType({ code, name, module_group = 'General', description = '', allow_custom_other = 0, sort_order = 100 }) {
    await ensureSchema();
    const cleanCode = String(code).trim().toLowerCase().replace(/[^a-z0-9_]+/g, '_');
    const [result] = await db.query(
      `INSERT INTO master_types (code, name, module_group, description, allow_custom_other, is_system, is_active, sort_order) VALUES (?, ?, ?, ?, ?, 0, 1, ?)`,
      [cleanCode, name, module_group, description, allow_custom_other ? 1 : 0, sort_order]
    );
    const [rows] = await db.query(`SELECT * FROM master_types WHERE id = ?`, [result.insertId]);
    return rows[0];
  },

  async updateType(id, data) {
    await ensureSchema();
    const fields = [];
    const params = [];
    for (const key of ['name', 'module_group', 'description', 'allow_custom_other', 'is_active', 'sort_order']) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(key === 'allow_custom_other' || key === 'is_active' ? (data[key] ? 1 : 0) : data[key]);
      }
    }
    if (fields.length === 0) return null;
    params.push(id);
    await db.query(`UPDATE master_types SET ${fields.join(', ')} WHERE id = ?`, params);
    const [rows] = await db.query(`SELECT * FROM master_types WHERE id = ?`, [id]);
    return rows[0] || null;
  },

  async getOptionsByType(typeCode, { companyId = null, includeInactive = false } = {}) {
    await ensureSchema();
    const conditions = ['type_code = ?'];
    const params = [typeCode];
    if (!includeInactive) {
      conditions.push('is_active = 1');
    }
    if (companyId) {
      conditions.push('(company_id IS NULL OR company_id = ?)');
      params.push(companyId);
    }
    const [rows] = await db.query(
      `SELECT * FROM master_options WHERE ${conditions.join(' AND ')} ORDER BY sort_order ASC, id ASC`,
      params
    );
    return rows.map(parseMeta);
  },

  async getBundle({ companyId = null, includeInactive = false } = {}) {
    await ensureSchema();
    const types = await this.getAllTypes(includeInactive);
    const conditions = [];
    const params = [];
    if (!includeInactive) {
      conditions.push('is_active = 1');
    }
    if (companyId) {
      conditions.push('(company_id IS NULL OR company_id = ?)');
      params.push(companyId);
    }
    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const [rows] = await db.query(
      `SELECT * FROM master_options ${whereClause} ORDER BY sort_order ASC, id ASC`,
      params
    );
    const grouped = {};
    for (const t of types) {
      grouped[t.code] = [];
    }
    for (const r of rows) {
      const parsed = parseMeta(r);
      if (!grouped[parsed.type_code]) grouped[parsed.type_code] = [];
      grouped[parsed.type_code].push(parsed);
    }
    return { types, options: grouped };
  },

  async createOption({ type_code, company_id = null, label, value, code = null, metadata = null, sort_order = 0, is_default = 0, is_active = 1, created_by = null }) {
    await ensureSchema();
    const [result] = await db.query(
      `INSERT INTO master_options (type_code, company_id, label, value, code, metadata_json, sort_order, is_default, is_active, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [type_code, company_id || null, label, value ?? label, code, metadata ? JSON.stringify(metadata) : null, Number(sort_order) || 0, is_default ? 1 : 0, is_active ? 1 : 0, created_by]
    );
    const [rows] = await db.query(`SELECT * FROM master_options WHERE id = ?`, [result.insertId]);
    return rows[0] ? parseMeta(rows[0]) : null;
  },

  async updateOption(id, data) {
    await ensureSchema();
    const fields = [];
    const params = [];
    if (data.label !== undefined) { fields.push('label = ?'); params.push(data.label); }
    if (data.value !== undefined) { fields.push('value = ?'); params.push(data.value); }
    if (data.code !== undefined) { fields.push('code = ?'); params.push(data.code); }
    if (data.company_id !== undefined) { fields.push('company_id = ?'); params.push(data.company_id || null); }
    if (data.metadata !== undefined) { fields.push('metadata_json = ?'); params.push(data.metadata ? JSON.stringify(data.metadata) : null); }
    if (data.sort_order !== undefined) { fields.push('sort_order = ?'); params.push(Number(data.sort_order)); }
    if (data.is_default !== undefined) { fields.push('is_default = ?'); params.push(data.is_default ? 1 : 0); }
    if (data.is_active !== undefined) { fields.push('is_active = ?'); params.push(data.is_active ? 1 : 0); }
    if (fields.length === 0) return null;
    params.push(id);
    await db.query(`UPDATE master_options SET ${fields.join(', ')} WHERE id = ?`, params);
    const [rows] = await db.query(`SELECT * FROM master_options WHERE id = ?`, [id]);
    return rows[0] ? parseMeta(rows[0]) : null;
  },

  async deleteOption(id) {
    await ensureSchema();
    const [result] = await db.query(`DELETE FROM master_options WHERE id = ?`, [id]);
    return result.affectedRows > 0;
  },

  async reorderOptions(items = []) {
    await ensureSchema();
    for (const item of items) {
      if (item && item.id !== undefined && item.sort_order !== undefined) {
        await db.query(`UPDATE master_options SET sort_order = ? WHERE id = ?`, [Number(item.sort_order), Number(item.id)]);
      }
    }
    return true;
  },
};

module.exports = masterModel;
