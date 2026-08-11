/*
# Sarathi Construction — core schema

1. New Tables
- `services`: catalog of construction services (title, description, icon name, image, slug).
- `projects`: portfolio projects (title, category, location, description, image, gallery, status, scope, highlights, completion_date).
- `enquiries`: customer enquiries from the contact form (name, email, phone, project_type, location, budget, preferred_start_date, message, status).

2. Security
- This is a single-tenant app with no sign-in screen; the frontend talks to Supabase with the anon key.
- RLS enabled on every table.
- Policies use `TO anon, authenticated` so the anon-key client can read/write its own data.
- Services + Projects are intentionally public/shared catalog data (read by all, written by anon too since there is no admin auth).
- Enquiries are submitted by visitors and read/managed from the admin dashboard (no auth in this build), so CRUD is open to anon/authenticated.

3. Notes
- All tables have created_at / updated_at timestamps.
- Enquiry status constrained to a fixed set of values with a default of 'New'.
- Project category constrained to a fixed set of values.
- Project status constrained to 'Completed' / 'In Progress' / 'Planned'.
*/

-- ===== services =====
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT 'Building2',
  image text,
  featured boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_services" ON services;
CREATE POLICY "anon_select_services" ON services FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_services" ON services;
CREATE POLICY "anon_insert_services" ON services FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_services" ON services;
CREATE POLICY "anon_update_services" ON services FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_services" ON services;
CREATE POLICY "anon_delete_services" ON services FOR DELETE
  TO anon, authenticated USING (true);

-- ===== projects =====
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL CHECK (category IN ('Residential','Commercial','Industrial','Renovation')),
  location text NOT NULL,
  description text NOT NULL,
  image text NOT NULL,
  gallery text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'Completed' CHECK (status IN ('Completed','In Progress','Planned')),
  scope text,
  highlights text[] NOT NULL DEFAULT '{}',
  completion_date date,
  featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_projects" ON projects;
CREATE POLICY "anon_select_projects" ON projects FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_projects" ON projects;
CREATE POLICY "anon_insert_projects" ON projects FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_projects" ON projects;
CREATE POLICY "anon_update_projects" ON projects FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_projects" ON projects;
CREATE POLICY "anon_delete_projects" ON projects FOR DELETE
  TO anon, authenticated USING (true);

-- ===== enquiries =====
CREATE TABLE IF NOT EXISTS enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  project_type text NOT NULL,
  location text,
  budget text,
  preferred_start_date date,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'New' CHECK (status IN ('New','Contacted','In Progress','Completed','Cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_enquiries" ON enquiries;
CREATE POLICY "anon_select_enquiries" ON enquiries FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_enquiries" ON enquiries;
CREATE POLICY "anon_insert_enquiries" ON enquiries FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_enquiries" ON enquiries;
CREATE POLICY "anon_update_enquiries" ON enquiries FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_enquiries" ON enquiries;
CREATE POLICY "anon_delete_enquiries" ON enquiries FOR DELETE
  TO anon, authenticated USING (true);

-- ===== updated_at trigger =====
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS services_touch_updated_at ON services;
CREATE TRIGGER services_touch_updated_at BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS projects_touch_updated_at ON projects;
CREATE TRIGGER projects_touch_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS enquiries_touch_updated_at ON enquiries;
CREATE TRIGGER enquiries_touch_updated_at BEFORE UPDATE ON enquiries
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
