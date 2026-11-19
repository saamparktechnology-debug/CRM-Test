-- ==============================================================
-- SAAMPARK CRM - Roles Standardization & Base64 Cleanup Migration
-- ==============================================================

-- 1. Standardize 4 Core Roles
LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
DELETE FROM `roles`;
INSERT INTO `roles` VALUES 
(1,'Super Admin','Full unrestricted master access across all companies and modules','2026-08-12 01:35:33'),
(2,'Admin','Administrative access for assigned companies and team delegation','2026-08-12 01:35:33'),
(3,'Teams','Operational team member access','2026-08-12 01:35:33'),
(4,'Clients','Client portal access','2026-08-12 01:35:33');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

-- 2. Cleanup Legacy Base64 Bloat (Replaced by Multer /uploads/...)
SET SQL_SAFE_UPDATES = 0;

UPDATE companies SET logo_url = NULL WHERE logo_url LIKE 'data:image/%';
UPDATE companies SET signature_image_url = NULL WHERE signature_image_url LIKE 'data:image/%';
UPDATE companies SET stamp_image_url = NULL WHERE stamp_image_url LIKE 'data:image/%';
UPDATE companies SET payment_qr_url = NULL WHERE payment_qr_url LIKE 'data:image/%';
UPDATE companies SET gst_payment_qr_url = NULL WHERE gst_payment_qr_url LIKE 'data:image/%';
UPDATE companies SET nongst_payment_qr_url = NULL WHERE nongst_payment_qr_url LIKE 'data:image/%';

UPDATE branches SET signature_image_url = NULL WHERE signature_image_url LIKE 'data:image/%';
UPDATE branches SET stamp_image_url = NULL WHERE stamp_image_url LIKE 'data:image/%';
UPDATE branches SET payment_qr_url = NULL WHERE payment_qr_url LIKE 'data:image/%';
UPDATE branches SET gst_payment_qr_url = NULL WHERE gst_payment_qr_url LIKE 'data:image/%';
UPDATE branches SET nongst_payment_qr_url = NULL WHERE nongst_payment_qr_url LIKE 'data:image/%';

UPDATE sub_branches SET signature_image_url = NULL WHERE signature_image_url LIKE 'data:image/%';
UPDATE sub_branches SET stamp_image_url = NULL WHERE stamp_image_url LIKE 'data:image/%';
UPDATE sub_branches SET payment_qr_url = NULL WHERE payment_qr_url LIKE 'data:image/%';
UPDATE sub_branches SET gst_payment_qr_url = NULL WHERE gst_payment_qr_url LIKE 'data:image/%';
UPDATE sub_branches SET nongst_payment_qr_url = NULL WHERE nongst_payment_qr_url LIKE 'data:image/%';

UPDATE users SET avatar_url = NULL WHERE avatar_url LIKE 'data:image/%';

SET SQL_SAFE_UPDATES = 1;
