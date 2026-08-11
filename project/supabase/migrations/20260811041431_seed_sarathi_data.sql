/*
# Sarathi Construction — seed services & projects

1. Data
- Inserts 8 services (Residential, Commercial, Industrial, Renovation, Interior, Architectural Planning, Structural Design, Project Management).
- Inserts 6 demo projects with gallery arrays, scope, highlights, and completion dates.
- All data is fictional/demo, clearly indicated by being sample portfolio entries.

2. Notes
- Idempotent: uses ON CONFLICT on a unique constraint (slug for services, title for projects) to avoid duplicate inserts on re-run.
- Adds unique constraints to support the ON CONFLICT clauses.
*/

ALTER TABLE services ADD CONSTRAINT services_slug_unique UNIQUE (slug);
ALTER TABLE projects ADD CONSTRAINT projects_title_unique UNIQUE (title);

-- ===== services =====
INSERT INTO services (title, slug, description, icon, image, featured, sort_order) VALUES
('Residential Construction','residential','Modern homes designed around lifestyle, comfort and durability — built to last and crafted to feel like home.','Home','https://images.pexels.com/photos/7031406/pexels-photo-7031406.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',true,1),
('Commercial Construction','commercial','Professional commercial spaces designed for performance, efficiency and the way people actually work and shop.','Building2','https://images.pexels.com/photos/1603369/pexels-photo-1603369.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',true,2),
('Industrial Construction','industrial','Reliable construction solutions for industrial requirements — warehouses, plants and facilities engineered for scale.','Factory','https://images.pexels.com/photos/236709/pexels-photo-236709.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',true,3),
('Renovation','renovation','Transform existing spaces with modern construction and renovation solutions that preserve value while renewing function.','Hammer','https://images.pexels.com/photos/8082243/pexels-photo-8082243.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',false,4),
('Interior Construction','interior','Functional and sophisticated interior construction — detailing, fit-out and finishing that elevates every room.','Sofa','https://images.pexels.com/photos/33529500/pexels-photo-33529500.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',false,5),
('Architectural Planning','planning','Planning and design solutions before construction begins — concept to working drawings, fully documented.','Compass','https://images.pexels.com/photos/6615086/pexels-photo-6615086.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',false,6),
('Structural Design','structural','Safe and efficient structural planning — engineered to stand the test of time, load and weather.','Ruler','https://images.pexels.com/photos/4458205/pexels-photo-4458205.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',false,7),
('Project Management','management','Professional coordination from planning through completion — schedule, quality, safety and budget under control.','ClipboardList','https://images.pexels.com/photos/5483188/pexels-photo-5483188.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',false,8)
ON CONFLICT (slug) DO NOTHING;

-- ===== projects =====
INSERT INTO projects (title, category, location, description, image, gallery, status, scope, highlights, completion_date, featured) VALUES
(
  'Sarathi Heights Residence',
  'Residential',
  'Pune, Maharashtra',
  'A contemporary multi-storey residence designed for a growing family, balancing privacy with open, light-filled living spaces. The structure combines exposed concrete, warm timber accents and floor-to-ceiling glazing.',
  'https://images.pexels.com/photos/7031406/pexels-photo-7031406.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  ARRAY[
    'https://images.pexels.com/photos/7031406/pexels-photo-7031406.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/7031412/pexels-photo-7031412.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/8082328/pexels-photo-8082328.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
  ],
  'Completed',
  'Architecture, structural design and full residential construction including interiors and landscaping.',
  ARRAY['4-storey residence','Exposed concrete + timber','Rooftop terrace','Energy-efficient glazing','G+3 structure'],
  '2024-11-15',
  true
),
(
  'Sarathi Business Centre',
  'Commercial',
  'Mumbai, Maharashtra',
  'A modern commercial office complex built for performance and efficiency, with flexible floor plates, a double-height entrance lobby and integrated MEP systems for a future-ready workplace.',
  'https://images.pexels.com/photos/1603369/pexels-photo-1603369.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  ARRAY[
    'https://images.pexels.com/photos/1603369/pexels-photo-1603369.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/265101/pexels-photo-265101.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/6794970/pexels-photo-6794970.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
  ],
  'Completed',
  'Civil structure, facade, MEP fit-out and common-area interiors across 8 floors.',
  ARRAY['8 floors','Double-height lobby','Glass curtain wall','LEED-aligned design','Grade-A offices'],
  '2024-06-30',
  true
),
(
  'Modern Villa Project',
  'Residential',
  'Lonavala, Maharashtra',
  'A hillside luxury villa with panoramic glazing, an infinity pool and seamless indoor-outdoor flow — engineered for weekend living and year-round comfort.',
  'https://images.pexels.com/photos/8082328/pexels-photo-8082328.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  ARRAY[
    'https://images.pexels.com/photos/8082328/pexels-photo-8082328.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/740587/pexels-photo-740587.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/7031600/pexels-photo-7031600.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
  ],
  'Completed',
  'Architecture, structural design, civil works, pool, interiors and landscaping.',
  ARRAY['Infinity pool','Hillside retaining walls','Open-plan living','Floor-to-ceiling glazing'],
  '2025-01-20',
  true
),
(
  'Industrial Warehouse Project',
  'Industrial',
  'Nashik, Maharashtra',
  'A large-span industrial warehouse with high-clearance storage, dedicated loading bays and fire-safety compliant steel structure, built for logistics operations at scale.',
  'https://images.pexels.com/photos/236709/pexels-photo-236709.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  ARRAY[
    'https://images.pexels.com/photos/236709/pexels-photo-236709.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/31771243/pexels-photo-31771243.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/36397980/pexels-photo-36397980.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
  ],
  'Completed',
  'Pre-engineered steel structure, PEB erection, RCC flooring, loading docks and fire safety systems.',
  ARRAY['Large-span PEB','High-clearance storage','6 loading bays','Fire-safety compliant'],
  '2024-09-10',
  false
),
(
  'Contemporary Residence',
  'Renovation',
  'Bengaluru, Karnataka',
  'A complete renovation of an existing residence — reimagined layout, modernised services, new finishes and a refreshed facade that doubled the usable natural light.',
  'https://images.pexels.com/photos/7031412/pexels-photo-7031412.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  ARRAY[
    'https://images.pexels.com/photos/7031412/pexels-photo-7031412.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/27164969/pexels-photo-27164969.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/7174113/pexels-photo-7174113.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
  ],
  'In Progress',
  'Structural strengthening, layout rework, MEP upgrade, interiors and facade refresh.',
  ARRAY['Full home renovation','New open layout','Modernised services','Facade refresh'],
  '2025-12-01',
  false
),
(
  'Commercial Office Complex',
  'Commercial',
  'Hyderabad, Telangana',
  'A multi-tower commercial office complex with shared podium, central plaza and integrated parking — designed for mixed tenant use and future expansion.',
  'https://images.pexels.com/photos/417279/pexels-photo-417279.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  ARRAY[
    'https://images.pexels.com/photos/417279/pexels-photo-417279.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/17173969/pexels-photo-17173969.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    'https://images.pexels.com/photos/1431448/pexels-photo-1431448.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
  ],
  'Planned',
  'Civil structure for two towers, shared podium, plaza, parking and landscape.',
  ARRAY['2 towers + podium','Central plaza','Multi-tenant floors','Integrated parking'],
  '2026-03-15',
  false
)
ON CONFLICT (title) DO NOTHING;
