-- ============================================
-- Database: apotek_kimia_farma
-- Sistem Informasi Apotek Kimia Farma
-- ============================================

CREATE DATABASE IF NOT EXISTS `apotek_kimia_farma`
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `apotek_kimia_farma`;

-- ============================================
-- Tabel: products (Stok Gudang & Inventory)
-- ============================================
CREATE TABLE IF NOT EXISTS `products` (
  `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`        VARCHAR(255)  NOT NULL,
  `category`    VARCHAR(100)  NOT NULL DEFAULT 'Lainnya',
  `price`       INT UNSIGNED  NOT NULL DEFAULT 0,
  `buy_price`   INT UNSIGNED  NOT NULL DEFAULT 0,
  `stock`       INT UNSIGNED  NOT NULL DEFAULT 0,
  `expiry`      DATE          NOT NULL,
  `image`       VARCHAR(500)  NOT NULL DEFAULT 'img/pills.png',
  `origin`      ENUM('Beli Putus','Konsinyasi') NOT NULL DEFAULT 'Beli Putus',
  `supplier_id` INT UNSIGNED  DEFAULT NULL,
  `status`      VARCHAR(50)   NOT NULL DEFAULT 'Tersedia',
  `created_at`  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- Tabel: consignment (Barang Titipan Konsinyasi)
-- ============================================
CREATE TABLE IF NOT EXISTS `consignment` (
  `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `ref_id`        INT UNSIGNED NOT NULL,
  `supplier`      VARCHAR(255) NOT NULL,
  `items`         VARCHAR(255) NOT NULL,
  `qty`           INT UNSIGNED NOT NULL DEFAULT 0,
  `sold`          INT UNSIGNED NOT NULL DEFAULT 0,
  `base_price`    INT UNSIGNED NOT NULL DEFAULT 0,
  `sell_price`    INT UNSIGNED NOT NULL DEFAULT 0,
  `date_received` DATE         NOT NULL,
  `status`        ENUM('Aktif','Lunas','Diretur') NOT NULL DEFAULT 'Aktif',
  `pic`           VARCHAR(255) DEFAULT NULL,
  `phone`         VARCHAR(20)  DEFAULT NULL,
  `created_at`    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- Tabel: transactions (Histori Transaksi POS)
-- ============================================
CREATE TABLE IF NOT EXISTS `transactions` (
  `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `timestamp`     VARCHAR(30)  NOT NULL,
  `total`         INT UNSIGNED NOT NULL DEFAULT 0,
  `payment`       INT UNSIGNED NOT NULL DEFAULT 0,
  `change_amount` INT UNSIGNED NOT NULL DEFAULT 0,
  `items`         JSON         NOT NULL,
  `created_at`    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- Tabel: users (Pengguna Sistem)
-- ============================================
CREATE TABLE IF NOT EXISTS `users` (
  `id`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`       VARCHAR(255) NOT NULL,
  `username`   VARCHAR(100) NOT NULL,
  `password`   VARCHAR(255) NOT NULL DEFAULT 'password123',
  `role`       VARCHAR(100) NOT NULL DEFAULT 'Kasir',
  `status`     ENUM('Aktif','Nonaktif') NOT NULL DEFAULT 'Aktif',
  `avatar`     VARCHAR(10)  NOT NULL DEFAULT 'US',
  `created_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- Tabel: app_meta (Pengaturan & Metadata Aplikasi)
-- ============================================
CREATE TABLE IF NOT EXISTS `app_meta` (
  `key_name`   VARCHAR(100) NOT NULL,
  `value_data` TEXT         DEFAULT NULL,
  PRIMARY KEY (`key_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- Seed Data: Products (Data Awal Produk)
-- ============================================
INSERT INTO `products` (`id`,`name`,`category`,`price`,`buy_price`,`stock`,`expiry`,`image`,`origin`,`supplier_id`) VALUES
(1,  'Paracetamol 500mg',  'Analgesik',  5000,  3500,  120, '2026-12-31', 'img/pills.png',  'Beli Putus', NULL),
(2,  'Amoxicillin 500mg',  'Antibiotik', 12000,  9000,  45, '2026-06-15', 'img/pills.png',  'Beli Putus', NULL),
(3,  'OBH Combi 100ml',    'Obat Batuk', 18500,  14000,  30, '2027-02-28', 'img/syrup.png',  'Beli Putus', NULL),
(4,  'Vitamin C 1000mg',   'Vitamin',    35000,  26000,  15, '2026-05-20', 'img/pills.png',  'Beli Putus', NULL),
(5,  'Loratadine 10mg',    'Obat Bebas',  7500,   5500,   8, '2026-11-25', 'img/pills.png',  'Beli Putus', NULL),
(7,  'Amlodipine 5mg',     'Lainnya',     9000,   6500,  60, '2026-10-10', 'img/pills.png',  'Beli Putus', NULL),
(8,  'Betadine 30ml',      'Lainnya',    25000,  18000,  35, '2027-01-01', 'img/syrup.png',  'Beli Putus', NULL),
(6,  'Tolak Angin Cair',   'Herbal',      4000,   3000,  85, '2026-10-10', 'img/syrup.png',  'Konsinyasi', 201),
(10, 'Sanmol Sirup',       'Analgesik',  18000,  15000,  50, '2026-05-05', 'img/syrup.png',  'Konsinyasi', 202),
(11, 'Diapet Kapsul',      'Lainnya',     3500,   2500, 120, '2027-05-30', 'img/pills.png',  'Konsinyasi', 203),
(12, 'Minyak Kayu Putih',  'Lainnya',    21500,  18000,  18, '2028-01-15', 'img/syrup.png',  'Konsinyasi', 204),
(13, 'Enervon-C Tab',      'Vitamin',    45000,  38000,  12, '2026-11-20', 'img/pills.png',  'Konsinyasi', 205);

-- ============================================
-- Seed Data: Consignment (Data Awal Konsinyasi)
-- ============================================
INSERT INTO `consignment` (`id`,`ref_id`,`supplier`,`items`,`qty`,`sold`,`base_price`,`sell_price`,`date_received`,`status`,`pic`,`phone`) VALUES
(201, 201, 'PT Sido Muncul',  'Tolak Angin Cair',  100, 15,  3000,  4000, '2026-04-10', 'Aktif',  'Bpk. Heru',    '6281234567890'),
(202, 202, 'PT Sanbe Farma',  'Sanmol Sirup',       60, 10, 15000, 18000, '2026-04-12', 'Aktif',  'Ibu Maya',     '6285678901234'),
(203, 203, 'PT Soho Global',  'Diapet Kapsul',     150, 30,  2500,  3500, '2026-04-15', 'Aktif',  'Bpk. Bambang', '6287789012345'),
(204, 204, 'PT Eagle Indo',   'Minyak Kayu Putih',  40, 22, 18000, 21500, '2026-04-16', 'Aktif',  'Ibu Siska',    '6281390123456'),
(205, 205, 'PT Medifarma',    'Enervon-C Tab',      30, 18, 38000, 45000, '2026-04-19', 'Lunas',  'Bpk. Anton',   '6281123456789');

-- ============================================
-- Seed Data: Transactions (Data Awal Transaksi)
-- ============================================
INSERT INTO `transactions` (`id`,`timestamp`,`total`,`payment`,`change_amount`,`items`) VALUES
(1001, '2026-04-15 10:30', 125000, 130000, 5000,  '[]'),
(1002, '2026-04-16 14:20',  85000,  90000, 5000,  '[]'),
(1003, '2026-04-17 09:15', 210000, 220000, 10000, '[]'),
(1004, '2026-04-18 16:45',  45000,  50000, 5000,  '[]'),
(1005, '2026-04-19 11:00', 180000, 200000, 20000, '[]'),
(1006, '2026-04-20 15:30', 320000, 350000, 30000, '[]'),
(1007, '2026-04-21 12:00', 150000, 150000, 0,     '[]');

-- ============================================
-- Seed Data: Users (Data Awal Pengguna)
-- ============================================
INSERT INTO `users` (`id`,`name`,`username`,`password`,`role`,`status`,`avatar`) VALUES
(1, 'Letysia Agatha', 'admin',     'admin123',    'Administrator', 'Aktif', 'LA'),
(2, 'Aveline Ong',    'kasir1',    'kasir123',    'Kasir',         'Aktif', 'AO'),
(3, 'Siti Aminah',    'apoteker1', 'apoteker123', 'Apoteker',      'Aktif', 'SA');

-- ============================================
-- Tabel: purchase_orders (Pengadaan Barang / PO)
-- ============================================
CREATE TABLE IF NOT EXISTS `purchase_orders` (
  `id`             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `po_number`      VARCHAR(50)  NOT NULL UNIQUE,
  `supplier_name`  VARCHAR(255) NOT NULL,
  `pic_name`       VARCHAR(255) NOT NULL,
  `phone_number`   VARCHAR(20)  NOT NULL,
  `date_created`   DATE         NOT NULL,
  `status`         ENUM('Draft', 'Sent', 'Received') NOT NULL DEFAULT 'Draft',
  `created_at`     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- Tabel: purchase_order_items (Detail Barang PO)
-- ============================================
CREATE TABLE IF NOT EXISTS `purchase_order_items` (
  `id`           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `po_id`        INT UNSIGNED NOT NULL,
  `product_name` VARCHAR(255) NOT NULL,
  `category`     VARCHAR(100) NOT NULL DEFAULT 'Lainnya',
  `qty`          INT UNSIGNED NOT NULL DEFAULT 1,
  `base_price`   INT UNSIGNED NOT NULL DEFAULT 0,
  `sell_price`   INT UNSIGNED NOT NULL DEFAULT 0,
  `expiry`       DATE         DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_po_items_po` FOREIGN KEY (`po_id`) REFERENCES `purchase_orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- Seed Data: Purchase Orders
-- ============================================
INSERT INTO `purchase_orders` (`id`, `po_number`, `supplier_name`, `pic_name`, `phone_number`, `date_created`, `status`) VALUES
(1, 'PO-KF-20260415-0001', 'PT Sido Muncul', 'Bpk. Heru', '6281234567890', '2026-04-15', 'Received'),
(2, 'PO-KF-20260420-0002', 'PT Sanbe Farma', 'Ibu Maya', '6285678901234', '2026-04-20', 'Sent');

-- ============================================
-- Seed Data: Purchase Order Items
-- ============================================
INSERT INTO `purchase_order_items` (`id`, `po_id`, `product_name`, `category`, `qty`, `base_price`, `sell_price`, `expiry`) VALUES
(1, 1, 'Tolak Angin Cair', 'Herbal', 100, 3000, 4000, '2026-10-10'),
(2, 2, 'Sanmol Sirup', 'Analgesik', 50, 15000, 18000, '2026-05-05');

-- ============================================
-- Tabel: destruction_history (Histori Pemusnahan Obat)
-- ============================================
CREATE TABLE IF NOT EXISTS `destruction_history` (
  `id`                 INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `destruction_date`   VARCHAR(30)  NOT NULL,
  `product_id`         INT UNSIGNED DEFAULT NULL,
  `product_name`       VARCHAR(255) NOT NULL,
  `qty`                INT UNSIGNED NOT NULL DEFAULT 0,
  `buy_price`          INT UNSIGNED NOT NULL DEFAULT 0,
  `expiry`             DATE         DEFAULT NULL,
  `reason`             TEXT         NOT NULL,
  `user`               VARCHAR(255) NOT NULL,
  `created_at`         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Data: Destruction History
INSERT INTO `destruction_history` (`id`, `destruction_date`, `product_id`, `product_name`, `qty`, `buy_price`, `expiry`, `reason`, `user`) VALUES
(1, '2026-06-15 10:00', 2, 'Amoxicillin 500mg', 10, 9000, '2026-06-15', 'Kemasan rusak dan lembab', 'Letysia Agatha');

-- ============================================
-- Tabel: procurements (Pengadaan Barang Beli Putus)
-- ============================================
CREATE TABLE IF NOT EXISTS `procurements` (
  `id`             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `procurement_no` VARCHAR(50)  NOT NULL UNIQUE,
  `purchase_date`  DATE         NOT NULL,
  `supplier_name`  VARCHAR(255) NOT NULL,
  `pic_name`       VARCHAR(255) NOT NULL,
  `whatsapp`       VARCHAR(20)  NOT NULL,
  `created_at`     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- Tabel: procurement_items (Detail Barang Beli Putus)
-- ============================================
CREATE TABLE IF NOT EXISTS `procurement_items` (
  `id`             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `procurement_id` INT UNSIGNED NOT NULL,
  `product_name`   VARCHAR(255) NOT NULL,
  `category`       VARCHAR(100) NOT NULL DEFAULT 'Lainnya',
  `qty`            INT UNSIGNED NOT NULL DEFAULT 1,
  `buy_price`      INT UNSIGNED NOT NULL DEFAULT 0,
  `sell_price`     INT UNSIGNED NOT NULL DEFAULT 0,
  `expiry_date`    DATE         NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_proc_items_proc` FOREIGN KEY (`procurement_id`) REFERENCES `procurements` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Data: Procurements & Items
INSERT INTO `procurements` (`id`, `procurement_no`, `purchase_date`, `supplier_name`, `pic_name`, `whatsapp`) VALUES
(1, 'PRC-20260410-0001', '2026-04-10', 'PT Kalbe Farma', 'Bpk. Budi', '6289876543210'),
(2, 'PRC-20260422-0002', '2026-04-22', 'PT Kimia Farma Trading', 'Ibu Rina', '628111222333');

INSERT INTO `procurement_items` (`id`, `procurement_id`, `product_name`, `category`, `qty`, `buy_price`, `sell_price`, `expiry_date`) VALUES
(1, 1, 'Paracetamol 500mg', 'Analgesik', 100, 3500, 5000, '2026-12-31'),
(2, 1, 'Amoxicillin 500mg', 'Antibiotik', 50, 9000, 12000, '2026-06-15'),
(3, 2, 'OBH Combi 100ml', 'Obat Batuk', 30, 14000, 18500, '2027-02-28');

-- ============================================
-- Tabel: stock_adjustments (Histori Penyesuaian Stok Gudang)
-- ============================================
CREATE TABLE IF NOT EXISTS `stock_adjustments` (
  `id`              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `adjustment_date` VARCHAR(30)  NOT NULL,
  `product_id`      INT UNSIGNED NOT NULL,
  `product_name`    VARCHAR(255) NOT NULL,
  `stock_old`       INT          NOT NULL,
  `stock_new`       INT          NOT NULL,
  `difference`      INT          NOT NULL,
  `reason`          VARCHAR(255) NOT NULL,
  `notes`           TEXT         DEFAULT NULL,
  `user`            VARCHAR(255) NOT NULL,
  `created_at`      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


