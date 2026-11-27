-- ==============================================================================
-- SKRIP MIGRASI DATABASE: USER APLIKASI LEAST-PRIVILEGE (NON-ROOT)
-- Database: db_presiden_simulator
-- Target: Membatasi hak akses user aplikasi hanya pada operasi CRUD data,
--         mencegah hak DROP TABLE, ALTER TABLE, CREATE USER, atau SUPERUSER.
-- ==============================================================================

-- 1. Buat role/user aplikasi baru (ganti 'GANTI_PASSWORD_KUAT_DISINI' dengan password acak)
DO
$do$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'app_neosantara_user') THEN
      CREATE ROLE app_neosantara_user WITH LOGIN PASSWORD 'GANTI_PASSWORD_KUAT_DISINI' NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;
   END IF;
END
$do$;

-- 2. Cabut semua hak akses default di schema public untuk keamanan
REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM PUBLIC;

-- 3. Beri hak CONNECT pada database
GRANT CONNECT ON DATABASE db_presiden_simulator TO app_neosantara_user;

-- 4. Beri hak USAGE pada schema public
GRANT USAGE ON SCHEMA public TO app_neosantara_user;

-- 5. Beri hak CRUD (SELECT, INSERT, UPDATE, DELETE) pada semua tabel eksisting di schema public
--    (User TIDAK diberikan hak DROP, TRUNCATE, ALTER, atau REFERENCES)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_neosantara_user;

-- 6. Beri hak USAGE dan SELECT pada semua sequence (untuk kolom SERIAL / BIGSERIAL primary key)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_neosantara_user;

-- 7. Atur hak akses otomatis untuk tabel dan sequence yang dibuat di masa depan
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_neosantara_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO app_neosantara_user;

-- Verifikasi hak akses yang diberikan:
-- SELECT grantee, table_name, privilege_type 
-- FROM information_schema.table_privileges 
-- WHERE grantee = 'app_neosantara_user';
