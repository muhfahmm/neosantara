-- =========================================================
-- Konversi dari MySQL ke PostgreSQL
-- Database: db_presiden_simulator
-- =========================================================

-- 1) Set session agar bisa disable FK sementara (setara FOREIGN_KEY_CHECKS=0)
--    SET UNIQUE_CHECKS tidak ada padanannya di PG (diabaikan)
--    SET SQL_MODE tidak ada padanannya di PG (diabaikan)
SET session_replication_role = replica;

-- 2) Buat database (CREATE DATABASE tidak bisa IF NOT EXISTS di PG < 15)
--    Di PostgreSQL 15+ sebenarnya CREATE DATABASE tidak support IF NOT EXISTS juga.
--    Jalankan perintah ini dari psql, BUKAN di dalam blok file SQL yang sama dengan USE.
-- CREATE DATABASE db_presiden_simulator;

-- 3) Pindah ke database target
-- \c db_presiden_simulator

-- --------------------------------------------------------
-- Table structure for table game_saves
-- --------------------------------------------------------
DROP TABLE IF EXISTS game_saves;

CREATE TABLE IF NOT EXISTS game_saves (
    id                SERIAL PRIMARY KEY,          -- AUTO_INCREMENT -> SERIAL
    save_name         VARCHAR(255) NOT NULL,
    country_name      VARCHAR(100) NOT NULL,
    country_iso       VARCHAR(10)  NOT NULL,
    game_date         VARCHAR(50)  NOT NULL,
    capital           VARCHAR(100) DEFAULT NULL,
    jumlah_penduduk   BIGINT       DEFAULT 0,
    anggaran          BIGINT       DEFAULT 0,
    ideology          VARCHAR(100) DEFAULT NULL,
    religion          VARCHAR(100) DEFAULT NULL,
    un_vote           INTEGER      DEFAULT 0,
    created_at        TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Trigger pengganti "ON UPDATE CURRENT_TIMESTAMP"
-- (PostgreSQL tidak punya opsi ini di definisi kolom)
-- --------------------------------------------------------
CREATE OR REPLACE FUNCTION update_created_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.created_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_game_saves_updated_at ON game_saves;

CREATE TRIGGER trg_game_saves_updated_at
BEFORE UPDATE ON game_saves
FOR EACH ROW
EXECUTE FUNCTION update_created_at_column();

-- 4) Kembalikan session ke normal (setara FOREIGN_KEY_CHECKS=1)
SET session_replication_role = DEFAULT;

