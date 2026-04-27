-- ============================================================================
-- UKSTM-32 – Database Schema
-- Run this file in Supabase SQL Editor (Dashboard → SQL → New Query)
-- ============================================================================

-- Enable pgcrypto for gen_random_uuid() if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. STUDENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS students (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama           TEXT        NOT NULL,
  nis            TEXT        NOT NULL UNIQUE,
  no_whatsapp    TEXT        NOT NULL,
  tanggal_lahir  DATE        NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  students              IS 'Daftar siswa peserta undangan';
COMMENT ON COLUMN students.nis          IS 'Nomor Induk Siswa – harus unik';
COMMENT ON COLUMN students.no_whatsapp  IS 'Nomor WhatsApp siswa (format: 628xxxx)';

-- ============================================================================
-- 2. INVITATIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS invitations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id        UUID        NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  nama_ortu         TEXT        NOT NULL,
  no_whatsapp_ortu  TEXT        NOT NULL,
  status_hadir      BOOLEAN     DEFAULT NULL,       -- NULL = belum konfirmasi
  alasan            TEXT,                            -- alasan jika tidak hadir
  kode_qr           TEXT        NOT NULL UNIQUE,     -- QR code unik per undangan
  jumlah_keluarga   INT         NOT NULL DEFAULT 1 CHECK (jumlah_keluarga >= 1),
  is_checked_in     BOOLEAN     NOT NULL DEFAULT FALSE,
  check_in_time     TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  invitations                  IS 'Undangan orang tua yang dikaitkan ke siswa';
COMMENT ON COLUMN invitations.kode_qr          IS 'Kode unik untuk QR – digunakan saat check-in';
COMMENT ON COLUMN invitations.status_hadir     IS 'TRUE = hadir, FALSE = tidak hadir, NULL = belum konfirmasi';
COMMENT ON COLUMN invitations.jumlah_keluarga  IS 'Jumlah anggota keluarga yang hadir (min 1)';

-- Index untuk lookup cepat berdasarkan QR code
CREATE INDEX IF NOT EXISTS idx_invitations_kode_qr ON invitations (kode_qr);

-- ============================================================================
-- 3. WA_QUEUE (Antrian Pengiriman WhatsApp)
-- ============================================================================
CREATE TYPE wa_message_type AS ENUM ('invitation', 'reminder', 'confirmation', 'thankyou');
CREATE TYPE wa_status       AS ENUM ('pending', 'sent', 'failed');

CREATE TABLE IF NOT EXISTS wa_queue (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id   UUID          NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  message_type    wa_message_type NOT NULL DEFAULT 'invitation',
  status          wa_status     NOT NULL DEFAULT 'pending',
  error_msg       TEXT,
  scheduled_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
  sent_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

COMMENT ON TABLE  wa_queue             IS 'Antrian pesan WhatsApp yang akan dikirim bot';
COMMENT ON COLUMN wa_queue.status      IS 'pending = menunggu, sent = terkirim, failed = gagal';
COMMENT ON COLUMN wa_queue.error_msg   IS 'Pesan error jika status = failed';

-- Index untuk worker polling antrian pending
CREATE INDEX IF NOT EXISTS idx_wa_queue_pending ON wa_queue (status, scheduled_at)
  WHERE status = 'pending';

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- Aktifkan RLS pada semua tabel
ALTER TABLE students    ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE wa_queue    ENABLE ROW LEVEL SECURITY;

-- Policy: hanya user dengan role 'admin' di app_metadata yang bisa CRUD
CREATE POLICY admin_full_access ON students
  FOR ALL
  USING  ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY admin_full_access ON invitations
  FOR ALL
  USING  ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY admin_full_access ON wa_queue
  FOR ALL
  USING  ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ============================================================================
-- 5. HELPER FUNCTION – auto-update `updated_at` column
-- ============================================================================
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_students
  BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_invitations
  BEFORE UPDATE ON invitations
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
