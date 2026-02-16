-- Database Update Script for Studyium.com
-- This script safely adds new tables and columns required for the update.
-- Run this in your MySQL Admin panel (phpMyAdmin).

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+03:00";
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Lesson Notes Table
-- Stores lesson notes content with support for HTML and PDF links
CREATE TABLE IF NOT EXISTS `lesson_notes` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lesson_id` int(11) UNSIGNED DEFAULT NULL,
  `category` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'TYT or AYT',
  `content` longtext COLLATE utf8mb4_unicode_ci,
  `pdf_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `lesson_id` (`lesson_id`),
  CONSTRAINT `fk_notes_lesson` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Site Settings Table
-- Key-Value store for dynamic site configuration (e.g. Ad Image)
CREATE TABLE IF NOT EXISTS `site_settings` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `setting_value` text COLLATE utf8mb4_unicode_ci,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Insert Default Settings (if not exists)
-- Default ad image is empty
INSERT IGNORE INTO `site_settings` (`setting_key`, `setting_value`) VALUES
('ad_image_url', ''),
('ad_link_url', '#');

-- 4. Ensure Users table has columns if missing (just in case)
-- (Already handled by setup.php normally, but good to double check idempotency if schema drifted)
-- Skipping for now as user said "data integrity is key", we won't touch existing tables unless necessary.

SET FOREIGN_KEY_CHECKS = 1;
