CREATE DATABASE IF NOT EXISTS zakat_al_fawwaz CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE zakat_al_fawwaz;

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(10) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('bendahara', 'sekretaris', 'kepala') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS periods (
  id INT AUTO_INCREMENT PRIMARY KEY,
  period_name VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM('active', 'closed') NOT NULL DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS mustahik (
  id VARCHAR(10) PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  nik VARCHAR(30) NOT NULL DEFAULT '',
  address VARCHAR(255) NOT NULL,
  occupation VARCHAR(100) NOT NULL,
  monthly_income INT NOT NULL DEFAULT 0,
  dependents INT NOT NULL DEFAULT 0,
  school_children INT NOT NULL DEFAULT 0,
  house_condition VARCHAR(50) NOT NULL,
  special_status VARCHAR(100) NOT NULL DEFAULT '-',
  asnaf VARCHAR(50) NOT NULL DEFAULT '-',
  document_status VARCHAR(50) NOT NULL DEFAULT 'Lengkap',
  surveyed TINYINT(1) NOT NULL DEFAULT 0,
  period_id INT NOT NULL,
  FOREIGN KEY (period_id) REFERENCES periods (id)
);

CREATE TABLE IF NOT EXISTS muzakki (
  id VARCHAR(10) PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  address VARCHAR(255) NOT NULL,
  zakat_type VARCHAR(50) NOT NULL,
  period_id INT NOT NULL,
  FOREIGN KEY (period_id) REFERENCES periods (id)
);

CREATE TABLE IF NOT EXISTS zakat_receipts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  muzakki_id VARCHAR(10),
  zakat_type VARCHAR(50) NOT NULL,
  amount_rice_kg INT NOT NULL DEFAULT 0,
  amount_money INT NOT NULL DEFAULT 0,
  received_date DATE NOT NULL,
  recorded_by VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS zakat_distributions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mustahik_id VARCHAR(10),
  priority VARCHAR(50) NOT NULL,
  distribution_type VARCHAR(50) NOT NULL,
  zakat_type VARCHAR(50) NOT NULL DEFAULT '',
  group_name VARCHAR(100) NOT NULL DEFAULT '',
  amount_rice_kg INT NOT NULL DEFAULT 0,
  amount_money INT NOT NULL DEFAULT 0,
  distribution_date DATE NOT NULL,
  recorded_by VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS rules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rule_code VARCHAR(10) NOT NULL UNIQUE,
  condition_text VARCHAR(255) NOT NULL,
  result_text VARCHAR(255) NOT NULL,
  execution_order INT NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  thresholds TEXT,
  source VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS approvals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  period_id INT NOT NULL UNIQUE,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  approver_id VARCHAR(10),
  approver_name VARCHAR(100),
  note TEXT,
  decided_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (period_id) REFERENCES periods (id)
);

CREATE TABLE IF NOT EXISTS audit_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  actor_name VARCHAR(100) NOT NULL,
  actor_role VARCHAR(20) NOT NULL,
  action VARCHAR(50) NOT NULL,
  target VARCHAR(100) NOT NULL,
  detail TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
