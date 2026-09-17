CREATE DATABASE IF NOT EXISTS aventura_das_letras
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE aventura_das_letras;

CREATE TABLE IF NOT EXISTS students (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  data JSON NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- The application creates this table automatically as well.
-- Run this script in MySQL Workbench when preparing a new MySQL Server.
