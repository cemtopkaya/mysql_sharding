-- shard2_db veritabanını oluştur
CREATE DATABASE IF NOT EXISTS shard2_db;

-- shard2_db veritabanını kullan
USE shard2_db;

-- test_table tablosunu oluştur
CREATE TABLE IF NOT EXISTS test_table (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    sex VARCHAR(50) NOT NULL
);
