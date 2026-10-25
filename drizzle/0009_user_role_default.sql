-- Peran pengguna dikelola plugin admin Better Auth (kolom `user.role`).
-- Beri nilai bawaan di level database supaya akun lama/baru tidak pernah
-- kehilangan peran, lalu indeks untuk daftar pengguna per peran.
UPDATE "user" SET role = 'user' WHERE role IS NULL;

ALTER TABLE "user" ALTER COLUMN role SET DEFAULT 'user';

CREATE INDEX IF NOT EXISTS "user_role_idx" ON "user" ("role");
