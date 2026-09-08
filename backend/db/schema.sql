-- ============================================================
-- V-ULPIN Database Schema — Supabase (PostgreSQL)
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Properties ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS properties (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id         TEXT UNIQUE NOT NULL,
  v_ulpin             TEXT,
  ulpin               TEXT,
  owner_name          TEXT NOT NULL,
  property_type       TEXT CHECK (property_type IN ('Residential','Commercial','Industrial','Agricultural','Mixed-Use')) DEFAULT 'Residential',
  address             TEXT NOT NULL,
  latitude            DOUBLE PRECISION NOT NULL,
  longitude           DOUBLE PRECISION NOT NULL,
  land_area           TEXT,
  built_up_area       TEXT,
  floors              INTEGER DEFAULT 1,
  occupancy_status    TEXT CHECK (occupancy_status IN ('Occupied','Vacant','Under Construction','Disputed')) DEFAULT 'Occupied',
  construction_year   INTEGER,
  verification_status TEXT CHECK (verification_status IN ('Verified','Pending','Rejected')) DEFAULT 'Pending',
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── Buildings ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS buildings (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id     UUID REFERENCES properties(id) ON DELETE CASCADE,
  building_name   TEXT NOT NULL,
  floors          INTEGER DEFAULT 1,
  units_count     INTEGER DEFAULT 1,
  construction_year INTEGER,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Units ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS units (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  unit_number TEXT NOT NULL,
  floor       INTEGER DEFAULT 0,
  area        TEXT,
  usage_type  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Government Records ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS government_records (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id     UUID REFERENCES properties(id) ON DELETE CASCADE,
  record_type     TEXT NOT NULL,
  document_ref    TEXT,
  verified_by     TEXT,
  verified_at     TIMESTAMPTZ,
  status          TEXT CHECK (status IN ('pending','verified','rejected')) DEFAULT 'pending',
  remarks         TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Audit Logs ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type  TEXT NOT NULL,
  entity_id    UUID,
  action       TEXT NOT NULL,
  performed_by TEXT,
  details      JSONB,
  ip_address   TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_properties_status   ON properties(verification_status);
CREATE INDEX IF NOT EXISTS idx_properties_type     ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_coords   ON properties(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_properties_v_ulpin  ON properties(v_ulpin);
CREATE INDEX IF NOT EXISTS idx_audit_entity        ON audit_logs(entity_type, entity_id);

-- ── RLS ───────────────────────────────────────────────────────
ALTER TABLE properties         ENABLE ROW LEVEL SECURITY;
ALTER TABLE buildings          ENABLE ROW LEVEL SECURITY;
ALTER TABLE units              ENABLE ROW LEVEL SECURITY;
ALTER TABLE government_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs         ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_all" ON properties         FOR ALL TO service_role USING (true);
CREATE POLICY "service_all" ON buildings          FOR ALL TO service_role USING (true);
CREATE POLICY "service_all" ON units              FOR ALL TO service_role USING (true);
CREATE POLICY "service_all" ON government_records FOR ALL TO service_role USING (true);
CREATE POLICY "service_all" ON audit_logs         FOR ALL TO service_role USING (true);
