-- Schema for Live MCP-Connected CRM

CREATE TABLE IF NOT EXISTS accounts (
  id VARCHAR(255) PRIMARY KEY,
  external_id VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  industry VARCHAR(255) DEFAULT 'Enterprise',
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_synced_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS raw_mcp_responses (
  id SERIAL PRIMARY KEY,
  tool_name VARCHAR(100) NOT NULL,
  account_id VARCHAR(255),
  response_payload JSONB NOT NULL,
  retrieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  request_status VARCHAR(50) DEFAULT 'success'
);

CREATE TABLE IF NOT EXISTS people (
  id VARCHAR(255) PRIMARY KEY,
  external_id VARCHAR(255),
  account_id VARCHAR(255) REFERENCES accounts(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  title VARCHAR(255),
  role VARCHAR(255),
  organization VARCHAR(255),
  stance VARCHAR(100) DEFAULT 'Unknown',
  email VARCHAR(255),
  phone VARCHAR(100),
  is_key_sponsor BOOLEAN DEFAULT false,
  last_interaction_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deals (
  id VARCHAR(255) PRIMARY KEY,
  external_id VARCHAR(255),
  account_id VARCHAR(255) REFERENCES accounts(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  amount NUMERIC(14, 2) DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'USD',
  status VARCHAR(100) DEFAULT 'Active',
  verification_status VARCHAR(50) DEFAULT 'Unknown',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS evidence (
  id VARCHAR(255) PRIMARY KEY,
  account_id VARCHAR(255),
  deal_id VARCHAR(255),
  source_type VARCHAR(100) NOT NULL,
  source_id VARCHAR(255),
  source_path VARCHAR(500),
  tool_name VARCHAR(100),
  field_path VARCHAR(255),
  excerpt TEXT NOT NULL,
  source_date VARCHAR(100),
  confidence VARCHAR(50) DEFAULT 'Verified',
  retrieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deal_stakeholders (
  id VARCHAR(255) PRIMARY KEY,
  deal_id VARCHAR(255) REFERENCES deals(id) ON DELETE CASCADE,
  person_id VARCHAR(255) REFERENCES people(id) ON DELETE CASCADE,
  relationship_role VARCHAR(100) NOT NULL,
  stance VARCHAR(100) DEFAULT 'Unknown',
  evidence_id VARCHAR(255) REFERENCES evidence(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS actions (
  id VARCHAR(255) PRIMARY KEY,
  account_id VARCHAR(255) REFERENCES accounts(id) ON DELETE CASCADE,
  deal_id VARCHAR(255),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  owner VARCHAR(255),
  priority INTEGER DEFAULT 1,
  deadline VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending',
  action_type VARCHAR(100) DEFAULT 'operational',
  reasoning TEXT,
  expected_outcome TEXT,
  task_notes TEXT DEFAULT '',
  evidence_id VARCHAR(255) REFERENCES evidence(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS risks (
  id VARCHAR(255) PRIMARY KEY,
  account_id VARCHAR(255) REFERENCES accounts(id) ON DELETE CASCADE,
  deal_id VARCHAR(255),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  severity VARCHAR(50) NOT NULL DEFAULT 'Amber',
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  trigger_date VARCHAR(100),
  consequence TEXT,
  mitigation TEXT,
  responsible_owner VARCHAR(255),
  evidence_id VARCHAR(255) REFERENCES evidence(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS intelligence_gaps (
  id VARCHAR(255) PRIMARY KEY,
  account_id VARCHAR(255) REFERENCES accounts(id) ON DELETE CASCADE,
  deal_id VARCHAR(255),
  missing_information TEXT NOT NULL,
  importance TEXT,
  suggested_owner VARCHAR(255),
  recommended_question TEXT,
  priority VARCHAR(50) DEFAULT 'Medium',
  status VARCHAR(50) DEFAULT 'open',
  evidence_id VARCHAR(255) REFERENCES evidence(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS signals (
  id VARCHAR(255) PRIMARY KEY,
  external_id VARCHAR(255) UNIQUE,
  account_id VARCHAR(255),
  payload JSONB NOT NULL,
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processing_status VARCHAR(50) DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS notes (
  id VARCHAR(255) PRIMARY KEY,
  external_id VARCHAR(255),
  account_id VARCHAR(255),
  title VARCHAR(255),
  kind VARCHAR(100) DEFAULT 'note',
  text TEXT NOT NULL,
  synchronization_status VARCHAR(50) DEFAULT 'pending',
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mcp_queue (
  id VARCHAR(255) PRIMARY KEY,
  tool_name VARCHAR(100) NOT NULL,
  arguments JSONB DEFAULT '{}',
  priority INTEGER DEFAULT 10,
  status VARCHAR(50) DEFAULT 'queued',
  error TEXT,
  result JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS sync_state (
  id VARCHAR(50) PRIMARY KEY DEFAULT 'global',
  last_request_at TIMESTAMP WITH TIME ZONE,
  last_successful_sync_at TIMESTAMP WITH TIME ZONE,
  next_allowed_request_at TIMESTAMP WITH TIME ZONE,
  last_signal_check_at TIMESTAMP WITH TIME ZONE,
  synchronization_status VARCHAR(50) DEFAULT 'idle',
  last_error TEXT,
  pending_operations_count INTEGER DEFAULT 0,
  processed_events_count INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS activities (
  id VARCHAR(255) PRIMARY KEY,
  account_id VARCHAR(255),
  type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hand_in_links (
  id VARCHAR(50) PRIMARY KEY DEFAULT 'current',
  hosted_url TEXT,
  github_repo_url TEXT,
  thinking_doc_url TEXT,
  walkthrough_video_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed initial records if empty
INSERT INTO sync_state (id, synchronization_status)
VALUES ('global', 'idle')
ON CONFLICT (id) DO NOTHING;

INSERT INTO hand_in_links (id, hosted_url, github_repo_url, thinking_doc_url, walkthrough_video_url)
VALUES ('current', '', '', '', '')
ON CONFLICT (id) DO NOTHING;

-- Helpful Indexes
CREATE INDEX IF NOT EXISTS idx_deals_account ON deals(account_id);
CREATE INDEX IF NOT EXISTS idx_people_account ON people(account_id);
CREATE INDEX IF NOT EXISTS idx_actions_account ON actions(account_id);
CREATE INDEX IF NOT EXISTS idx_risks_account ON risks(account_id);
CREATE INDEX IF NOT EXISTS idx_gaps_account ON intelligence_gaps(account_id);
CREATE INDEX IF NOT EXISTS idx_evidence_account ON evidence(account_id);
CREATE INDEX IF NOT EXISTS idx_evidence_source_id ON evidence(source_id);
CREATE INDEX IF NOT EXISTS idx_mcp_queue_status_prio ON mcp_queue(status, priority, created_at);
CREATE INDEX IF NOT EXISTS idx_signals_ext_id ON signals(external_id);
CREATE INDEX IF NOT EXISTS idx_activities_time ON activities(timestamp DESC);


-- CRM Initial Seed Data

-- Table: accounts
INSERT INTO accounts (id, external_id, name, description, metadata, created_at, updated_at, last_synced_at, industry) VALUES ('A', 'A', 'Eastern Counties Police Alliance', 'Rollout under way. 4 forces, 35 docks, 300-dock framework tender in preparation.', '{"id":"A","name":"Eastern Counties Police Alliance","facts":[{"id":"rc_appetite_0","text":"All four forces are keen.","status":"claim","said_by":"Rhys Calder","learned_at_minute":7},{"id":"rc_appetite_2","text":"Only Westmere and Metro Central fly operationally. Tarn Valley has never flown a live mission and Norwold only trains.","status":"told","said_by":"Rhys Calder","learned_at_minute":7},{"id":"rc_funding_0","text":"The alliance has the budget.","status":"claim","said_by":"Rhys Calder","learned_at_minute":9},{"id":"rc_tender_0","text":"A 300-dock framework tender, spec being finalised.","status":"told","said_by":"Rhys Calder","learned_at_minute":10},{"id":"rc_tender_2","text":"The tender specification locks soon (see Deadlines). It has no costed operating model, and nobody has agreed who would fly 300 docks.","status":"told","said_by":"Rhys Calder","learned_at_minute":10},{"id":"km_usage_0","text":"We''re flying all the time.","status":"told","said_by":"Insp. Karen Mbeki","learned_at_minute":18},{"id":"km_staff_2","text":"Six officers who also do other duties. Overtime is the main cost. Scaling to 30 docks needs nine more trained operators and shift cover.","status":"told","said_by":"Insp. Karen Mbeki","learned_at_minute":19},{"id":"rc_stadium_0","text":"Westmere''s stadium project is a 30-dock opportunity.","status":"claim","said_by":"Rhys Calder","learned_at_minute":25}],"offers":[{"id":"a_priority_support","title":"Priority support for the drone units","value":60000,"status":"declined","pitch_to":"Insp. Karen Mbeki"},{"id":"a_training","title":"Operator training for new pilots","value":45000,"status":"open","pitch_to":"Insp. Karen Mbeki"}],"deadlines":[{"text":"The tender specification locks. Whatever is not in it by then is out.","passed":false}],"stakeholders":[{"id":"rhys_calder","name":"Rhys Calder","role":"Alliance drone programme lead","available":true,"relationship":"warm"},{"id":"karen_mbeki","name":"Insp. Karen Mbeki","role":"Drone unit inspector, Westmere","available":true,"relationship":"neutral"},{"id":"hannah_doyle","name":"Hannah Doyle","role":"Alliance procurement lead","available":true,"relationship":"neutral"}],"opportunities":[{"id":"a_renewal","size":null,"stage":"identified","title":"Renew the alliance contract (35 docks)","blocker":null,"deadline":null,"evidence":["rc_appetite_0","rc_appetite_2"],"worth_up_to":null},{"id":"a_tarn","size":null,"stage":"identified","title":"Tarn Valley and Norwold go live","blocker":null,"deadline":null,"evidence":["rc_appetite_2"],"worth_up_to":null},{"id":"a_westmere","size":null,"stage":"identified","title":"Scale Westmere''s fleet","blocker":null,"deadline":null,"evidence":["km_staff_2"],"worth_up_to":null},{"id":"a_tender","size":null,"stage":"identified","title":"Position for the 300-dock framework tender","blocker":null,"deadline":{"met":false,"soon":false,"text":"The tender specification locks. Whatever is not in it by then is out.","passed":false,"moves_left":null},"evidence":["rc_tender_2","km_staff_2"],"worth_up_to":null}],"official_story":"Rollout under way. 4 forces, 35 docks, 300-dock framework tender in preparation."}'::jsonb, '2026-11-14T09:16:38.053Z'::timestamptz, '2026-11-14T09:16:38.053Z'::timestamptz, '2026-11-14T09:16:38.053Z'::timestamptz, 'Enterprise') ON CONFLICT DO NOTHING;
INSERT INTO accounts (id, external_id, name, description, metadata, created_at, updated_at, last_synced_at, industry) VALUES ('B', 'B', 'Aldermoor Industrial Group', 'ROI proven. 15 plants, 14 docks installed, 13 flying. Case study for 40-plant sister company in preparation.', '{"id":"B","name":"Aldermoor Industrial Group","facts":[{"id":"jt_prem_2","text":"The insurer cut premiums by 6% across nine plants, about 180,000 euros a year, citing the drone patrols. It is the only hard financial benefit and nobody in security asked him.","status":"told","said_by":"Neel Sharma","learned_at_minute":3},{"id":"sr_roi_0","text":"ROI is proven, about 1.2 million euros a year saved.","status":"claim","said_by":"Stefan Roy","learned_at_minute":29},{"id":"sr_roll_0","text":"Thirteen of fifteen plants are flying.","status":"claim","said_by":"Stefan Roy","learned_at_minute":31},{"id":"ba_use_0","text":"It''s useful at night.","status":"told","said_by":"Beatriz Alonso","learned_at_minute":36}],"offers":[{"id":"b_priority_support","title":"Night-time priority support for Plant 7","value":50000,"status":"declined","pitch_to":"Beatriz Alonso"},{"id":"b_more_plants","title":"Docks for Plant 15 and two idle plants","value":160000,"status":"declined","pitch_to":"Stefan Roy"}],"deadlines":[],"stakeholders":[{"id":"stefan_roy","name":"Stefan Roy","role":"Group head of security","available":true,"relationship":"neutral"},{"id":"beatriz_alonso","name":"Beatriz Alonso","role":"Plant manager, Plant 7","available":true,"relationship":"guarded"}],"opportunities":[{"id":"b_renewal","size":null,"stage":"identified","title":"Renew the Aldermoor contract (14 docks)","blocker":null,"deadline":null,"evidence":["sr_roll_0","jt_prem_2"],"worth_up_to":null},{"id":"b_insurance","size":null,"stage":"identified","title":"Protect and extend the insurance discount","blocker":null,"deadline":null,"evidence":["jt_prem_2"],"worth_up_to":null},{"id":"b_sister","size":null,"stage":"identified","title":"Case study for the 40-plant sister company","blocker":null,"deadline":null,"evidence":["jt_prem_2"],"worth_up_to":null}],"official_story":"ROI proven. 15 plants, 14 docks installed, 13 flying. Case study for 40-plant sister company in preparation."}'::jsonb, '2026-11-14T09:16:38.087Z'::timestamptz, '2026-11-14T09:16:38.087Z'::timestamptz, '2026-11-14T09:16:38.087Z'::timestamptz, 'Enterprise') ON CONFLICT DO NOTHING;
INSERT INTO accounts (id, external_id, name, description, metadata, created_at, updated_at, last_synced_at, industry) VALUES ('NGP', NULL, 'Northumbrian Grid & Power', 'Autonomous drone inspection of high-voltage transmission lines across 8 regional substations.', '{}'::jsonb, '2026-11-14T10:29:38.534Z'::timestamptz, '2026-11-14T11:07:28.669Z'::timestamptz, NULL, 'Energy & Critical Infrastructure') ON CONFLICT DO NOTHING;

-- Table: people
INSERT INTO people (id, external_id, account_id, name, role, organization, stance, last_interaction_at, metadata, created_at, updated_at, title, email, phone, is_key_sponsor) VALUES ('hannah_doyle', 'hannah_doyle', 'A', 'Hannah Doyle', 'Alliance procurement lead', 'Eastern Counties Police Alliance', 'Neutral', NULL, '{"id":"hannah_doyle","name":"Hannah Doyle","role":"Alliance procurement lead","available":true,"relationship":"neutral"}'::jsonb, '2026-11-14T09:16:38.058Z'::timestamptz, '2026-11-14T09:16:38.058Z'::timestamptz, NULL, NULL, NULL, false) ON CONFLICT DO NOTHING;
INSERT INTO people (id, external_id, account_id, name, role, organization, stance, last_interaction_at, metadata, created_at, updated_at, title, email, phone, is_key_sponsor) VALUES ('stefan_roy', 'stefan_roy', 'B', 'Stefan Roy', 'Group head of security', 'Aldermoor Industrial Group', 'Neutral', NULL, '{"id":"stefan_roy","name":"Stefan Roy","role":"Group head of security","available":true,"relationship":"neutral"}'::jsonb, '2026-11-14T09:16:38.088Z'::timestamptz, '2026-11-14T09:16:38.088Z'::timestamptz, NULL, NULL, NULL, false) ON CONFLICT DO NOTHING;
INSERT INTO people (id, external_id, account_id, name, role, organization, stance, last_interaction_at, metadata, created_at, updated_at, title, email, phone, is_key_sponsor) VALUES ('beatriz_alonso', 'beatriz_alonso', 'B', 'Beatriz Alonso', 'Plant manager, Plant 7', 'Aldermoor Industrial Group', 'Guarded', NULL, '{"id":"beatriz_alonso","name":"Beatriz Alonso","role":"Plant manager, Plant 7","available":true,"relationship":"guarded"}'::jsonb, '2026-11-14T09:16:38.089Z'::timestamptz, '2026-11-14T09:16:38.089Z'::timestamptz, NULL, NULL, NULL, false) ON CONFLICT DO NOTHING;
INSERT INTO people (id, external_id, account_id, name, role, organization, stance, last_interaction_at, metadata, created_at, updated_at, title, email, phone, is_key_sponsor) VALUES ('rhys_calder', 'rhys_calder', 'A', 'Rhys Calder', 'Alliance drone programme lead', 'Eastern Counties Police Alliance', 'Departing', NULL, '{"id":"rhys_calder","name":"Rhys Calder","role":"Alliance drone programme lead","available":true,"departure":"January","relationship":"warm"}'::jsonb, '2026-11-14T09:16:38.055Z'::timestamptz, '2026-11-14T09:16:38.055Z'::timestamptz, NULL, NULL, NULL, false) ON CONFLICT DO NOTHING;
INSERT INTO people (id, external_id, account_id, name, role, organization, stance, last_interaction_at, metadata, created_at, updated_at, title, email, phone, is_key_sponsor) VALUES ('karen_mbeki', 'karen_mbeki', 'A', 'Insp. Karen Mbeki', 'Drone unit inspector, Westmere', 'Eastern Counties Police Alliance', 'Guarded', NULL, '{"id":"karen_mbeki","name":"Insp. Karen Mbeki","role":"Drone unit inspector, Westmere","concerns":"Awaiting written operator training dates and emergency support SLA for Dec 5 public event","available":true,"relationship":"neutral"}'::jsonb, '2026-11-14T09:16:38.057Z'::timestamptz, '2026-11-14T09:16:38.057Z'::timestamptz, NULL, NULL, NULL, false) ON CONFLICT DO NOTHING;
INSERT INTO people (id, external_id, account_id, name, role, organization, stance, last_interaction_at, metadata, created_at, updated_at, title, email, phone, is_key_sponsor) VALUES ('person_ngp_alistair', 'alistair_vance', 'NGP', 'Dr. Alistair Vance', 'Asset Integrity Lead', NULL, 'Supportive', NULL, '{"concerns":"Demands high-wind tolerance validation above 25 knots before Winter storm protocols."}'::jsonb, '2026-11-14T11:07:28.677Z'::timestamptz, '2026-11-14T11:07:28.677Z'::timestamptz, 'Chief Transmission Engineer', 'alistair.vance@ngp-energy.co.uk', NULL, true) ON CONFLICT DO NOTHING;
INSERT INTO people (id, external_id, account_id, name, role, organization, stance, last_interaction_at, metadata, created_at, updated_at, title, email, phone, is_key_sponsor) VALUES ('person_ngp_fiona', 'fiona_gallagher', 'NGP', 'Fiona Gallagher', 'Compliance Gatekeeper', NULL, 'Guarded', NULL, '{"concerns":"Requires 400kV electromagnetic interference (EMI) certification and safe standoff certification before Phase 2."}'::jsonb, '2026-11-14T11:07:28.677Z'::timestamptz, '2026-11-14T11:07:28.677Z'::timestamptz, 'Safety & Regulatory Compliance Director', 'fiona.gallagher@ngp-energy.co.uk', NULL, false) ON CONFLICT DO NOTHING;
INSERT INTO people (id, external_id, account_id, name, role, organization, stance, last_interaction_at, metadata, created_at, updated_at, title, email, phone, is_key_sponsor) VALUES ('person_ngp_marcus', 'marcus_thorne', 'NGP', 'Marcus Thorne', 'Operations Lead', NULL, 'Neutral', NULL, '{"concerns":"Needs automated SCADA integration for autonomous flight authorization without manual operator dispatch."}'::jsonb, '2026-11-14T11:07:28.677Z'::timestamptz, '2026-11-14T11:07:28.677Z'::timestamptz, 'Regional Grid Operations Manager', 'marcus.thorne@ngp-energy.co.uk', NULL, false) ON CONFLICT DO NOTHING;

-- Table: deals
INSERT INTO deals (id, external_id, account_id, title, description, amount, currency, status, verification_status, created_at, updated_at) VALUES ('a_renewal', 'a_renewal', 'A', 'Renew the alliance contract (35 docks)', 'Renew the alliance contract (35 docks)', '0.00', 'USD', 'identified', 'Unknown', '2026-11-14T09:16:38.069Z'::timestamptz, '2026-11-14T09:16:38.069Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO deals (id, external_id, account_id, title, description, amount, currency, status, verification_status, created_at, updated_at) VALUES ('a_tarn', 'a_tarn', 'A', 'Tarn Valley and Norwold go live', 'Tarn Valley and Norwold go live', '0.00', 'USD', 'identified', 'Unknown', '2026-11-14T09:16:38.074Z'::timestamptz, '2026-11-14T09:16:38.074Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO deals (id, external_id, account_id, title, description, amount, currency, status, verification_status, created_at, updated_at) VALUES ('a_westmere', 'a_westmere', 'A', 'Scale Westmere''s fleet', 'Scale Westmere''s fleet', '0.00', 'USD', 'identified', 'Unknown', '2026-11-14T09:16:38.076Z'::timestamptz, '2026-11-14T09:16:38.076Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO deals (id, external_id, account_id, title, description, amount, currency, status, verification_status, created_at, updated_at) VALUES ('a_tender', 'a_tender', 'A', 'Position for the 300-dock framework tender', 'Position for the 300-dock framework tender', '0.00', 'USD', 'identified', 'Unknown', '2026-11-14T09:16:38.079Z'::timestamptz, '2026-11-14T09:16:38.079Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO deals (id, external_id, account_id, title, description, amount, currency, status, verification_status, created_at, updated_at) VALUES ('a_priority_support', 'a_priority_support', 'A', 'Priority support for the drone units', 'Offer pitched to: Insp. Karen Mbeki. Status: declined', '60000.00', 'USD', 'Offer (declined)', 'Reported', '2026-11-14T09:16:38.082Z'::timestamptz, '2026-11-14T09:16:38.082Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO deals (id, external_id, account_id, title, description, amount, currency, status, verification_status, created_at, updated_at) VALUES ('a_training', 'a_training', 'A', 'Operator training for new pilots', 'Offer pitched to: Insp. Karen Mbeki. Status: open', '45000.00', 'USD', 'Proposal Active', 'Reported', '2026-11-14T09:16:38.084Z'::timestamptz, '2026-11-14T09:16:38.084Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO deals (id, external_id, account_id, title, description, amount, currency, status, verification_status, created_at, updated_at) VALUES ('b_renewal', 'b_renewal', 'B', 'Renew the Aldermoor contract (14 docks)', 'Renew the Aldermoor contract (14 docks)', '0.00', 'USD', 'identified', 'Unknown', '2026-11-14T09:16:38.095Z'::timestamptz, '2026-11-14T09:16:38.095Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO deals (id, external_id, account_id, title, description, amount, currency, status, verification_status, created_at, updated_at) VALUES ('b_insurance', 'b_insurance', 'B', 'Protect and extend the insurance discount', 'Protect and extend the insurance discount', '0.00', 'USD', 'identified', 'Unknown', '2026-11-14T09:16:38.098Z'::timestamptz, '2026-11-14T09:16:38.098Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO deals (id, external_id, account_id, title, description, amount, currency, status, verification_status, created_at, updated_at) VALUES ('b_sister', 'b_sister', 'B', 'Case study for the 40-plant sister company', 'Case study for the 40-plant sister company', '0.00', 'USD', 'identified', 'Unknown', '2026-11-14T09:16:38.100Z'::timestamptz, '2026-11-14T09:16:38.100Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO deals (id, external_id, account_id, title, description, amount, currency, status, verification_status, created_at, updated_at) VALUES ('b_priority_support', 'b_priority_support', 'B', 'Night-time priority support for Plant 7', 'Offer pitched to: Beatriz Alonso. Status: declined', '50000.00', 'USD', 'Offer (declined)', 'Reported', '2026-11-14T09:16:38.102Z'::timestamptz, '2026-11-14T09:16:38.102Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO deals (id, external_id, account_id, title, description, amount, currency, status, verification_status, created_at, updated_at) VALUES ('b_more_plants', 'b_more_plants', 'B', 'Docks for Plant 15 and two idle plants', 'Offer pitched to: Stefan Roy. Status: declined', '160000.00', 'USD', 'Offer (declined)', 'Reported', '2026-11-14T09:16:38.104Z'::timestamptz, '2026-11-14T09:16:38.104Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO deals (id, external_id, account_id, title, description, amount, currency, status, verification_status, created_at, updated_at) VALUES ('contract_deal_A', 'contract_deal_A', 'A', 'Primary Alliance Framework Contract (35 Docks)', 'Primary verified annual contract agreement from contract.txt. Term: 1 year. No automatic renewal.', '350000.00', 'GBP', 'Contract Active', 'Verified', '2026-11-14T09:20:41.008Z'::timestamptz, '2026-11-14T09:20:41.008Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO deals (id, external_id, account_id, title, description, amount, currency, status, verification_status, created_at, updated_at) VALUES ('contract_deal_B', 'contract_deal_B', 'B', 'Primary Industrial Security Contract (14 Docks)', 'Primary verified annual contract agreement from contract.txt. Term: 1 year. No automatic renewal.', '140000.00', 'EUR', 'Contract Active', 'Verified', '2026-11-14T09:20:41.051Z'::timestamptz, '2026-11-14T09:20:41.051Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO deals (id, external_id, account_id, title, description, amount, currency, status, verification_status, created_at, updated_at) VALUES ('deal_ngp_primary', 'deal_ngp_primary', 'NGP', 'Primary Grid Substation Inspection Contract (8 Docks)', 'Primary verified annual service agreement covering 8 high-voltage grid substations. Term: 1 year.', '240000.00', 'GBP', 'Contract Active', 'Verified', '2026-11-14T11:06:34.939Z'::timestamptz, '2026-11-14T11:07:28.674Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO deals (id, external_id, account_id, title, description, amount, currency, status, verification_status, created_at, updated_at) VALUES ('deal_ngp_expansion', 'deal_ngp_expansion', 'NGP', 'Transmission Corridor Expansion (Phase 2 - 12 Docks)', 'Proposed Phase 2 framework covering 12 additional transmission corridor docks.', '360000.00', 'GBP', 'Proposal Active', 'Reported', '2026-11-14T11:06:34.939Z'::timestamptz, '2026-11-14T11:07:28.674Z'::timestamptz) ON CONFLICT DO NOTHING;

-- Table: evidence
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('rc_funding_0', 'A', NULL, 'claim', 'rc_funding_0', NULL, 'get_my_accounts', 'facts', 'The alliance has the budget.', NULL, 'Reported', '2026-11-14T09:16:38.063Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('rc_tender_0', 'A', NULL, 'told', 'rc_tender_0', NULL, 'get_my_accounts', 'facts', 'A 300-dock framework tender, spec being finalised.', NULL, 'Reported', '2026-11-14T09:16:38.064Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('km_usage_0', 'A', NULL, 'told', 'km_usage_0', NULL, 'get_my_accounts', 'facts', 'We''re flying all the time.', NULL, 'Reported', '2026-11-14T09:16:38.066Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('rc_stadium_0', 'A', NULL, 'claim', 'rc_stadium_0', NULL, 'get_my_accounts', 'facts', 'Westmere''s stadium project is a 30-dock opportunity.', NULL, 'Reported', '2026-11-14T09:16:38.068Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('rc_appetite_0', 'A', 'a_renewal', 'claim', 'rc_appetite_0', NULL, 'get_my_accounts', 'facts', 'All four forces are keen.', NULL, 'Reported', '2026-11-14T09:16:38.060Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('rc_appetite_2', 'A', 'a_tarn', 'told', 'rc_appetite_2', NULL, 'get_my_accounts', 'facts', 'Only Westmere and Metro Central fly operationally. Tarn Valley has never flown a live mission and Norwold only trains.', NULL, 'Reported', '2026-11-14T09:16:38.061Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('rc_tender_2', 'A', 'a_tender', 'told', 'rc_tender_2', NULL, 'get_my_accounts', 'facts', 'The tender specification locks soon (see Deadlines). It has no costed operating model, and nobody has agreed who would fly 300 docks.', NULL, 'Reported', '2026-11-14T09:16:38.065Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('km_staff_2', 'A', 'a_tender', 'told', 'km_staff_2', NULL, 'get_my_accounts', 'facts', 'Six officers who also do other duties. Overtime is the main cost. Scaling to 30 docks needs nine more trained operators and shift cover.', NULL, 'Reported', '2026-11-14T09:16:38.067Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_offer_a_priority_support', 'A', 'a_priority_support', 'commercial_offer', 'a_priority_support', NULL, 'get_my_accounts', 'offers', 'Commercial offer: Priority support for the drone units valued at $60000 pitched to Insp. Karen Mbeki (status: declined).', NULL, 'Reported', '2026-11-14T09:16:38.083Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_offer_a_training', 'A', 'a_training', 'commercial_offer', 'a_training', NULL, 'get_my_accounts', 'offers', 'Commercial offer: Operator training for new pilots valued at $45000 pitched to Insp. Karen Mbeki (status: open).', NULL, 'Reported', '2026-11-14T09:16:38.085Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('sr_roi_0', 'B', NULL, 'claim', 'sr_roi_0', NULL, 'get_my_accounts', 'facts', 'ROI is proven, about 1.2 million euros a year saved.', NULL, 'Reported', '2026-11-14T09:16:38.091Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ba_use_0', 'B', NULL, 'told', 'ba_use_0', NULL, 'get_my_accounts', 'facts', 'It''s useful at night.', NULL, 'Reported', '2026-11-14T09:16:38.094Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('sr_roll_0', 'B', 'b_renewal', 'claim', 'sr_roll_0', NULL, 'get_my_accounts', 'facts', 'Thirteen of fifteen plants are flying.', NULL, 'Reported', '2026-11-14T09:16:38.093Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('jt_prem_2', 'B', 'b_sister', 'told', 'jt_prem_2', NULL, 'get_my_accounts', 'facts', 'The insurer cut premiums by 6% across nine plants, about 180,000 euros a year, citing the drone patrols. It is the only hard financial benefit and nobody in security asked him.', NULL, 'Reported', '2026-11-14T09:16:38.090Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_offer_b_priority_support', 'B', 'b_priority_support', 'commercial_offer', 'b_priority_support', NULL, 'get_my_accounts', 'offers', 'Commercial offer: Night-time priority support for Plant 7 valued at $50000 pitched to Beatriz Alonso (status: declined).', NULL, 'Reported', '2026-11-14T09:16:38.103Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_offer_b_more_plants', 'B', 'b_more_plants', 'commercial_offer', 'b_more_plants', NULL, 'get_my_accounts', 'offers', 'Commercial offer: Docks for Plant 15 and two idle plants valued at $160000 pitched to Stefan Roy (status: declined).', NULL, 'Reported', '2026-11-14T09:16:38.105Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_calls/2025-06-24_enquiry_call.txt', 'A', NULL, 'paperwork', 'calls/2025-06-24_enquiry_call.txt', 'calls/2025-06-24_enquiry_call.txt', 'get_all_paperwork', NULL, '{"path":"calls/2025-06-24_enquiry_call.txt","kind":"call","text":"ENQUIRY CALL: NOTES\nDate: 24 June 2025\nWritten up by: the FlytBase deal team\nPresent for the customer: Rhys Calder (alliance drone programme lead)\nPresent for FlytBase: Achal Negi\n\nBackground\n- The alliance office runs some programmes jointly for four county forces: Westmere, Metro Central,\n  Tarn Valley and Norwold. Drones are one of them.\n- Rhys Calder leads the drone programme from the alliance office.\n\nWhat the customer asked for\n- Docks, so a drone can be launched without an officer travelling to the site.\n- A pilot before any larger purchase. Westmere''s drone unit has flown drones the longest and would\n  host it.\n\nNot discussed\n- How a larger purchase would be paid for.\n- The other three forces. Rhys Calder spoke for all four.\n\nActions\n- FlytBase: pilot proposal. Done July 2025.\n- Rhys Calder: introduce the inspector who runs Westmere''s drone unit. Done September 2025.\n"}', NULL, 'Reported', '2026-11-14T09:17:45.707Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_calls/2025-09-02_pilot_scoping.txt', 'A', NULL, 'paperwork', 'calls/2025-09-02_pilot_scoping.txt', 'calls/2025-09-02_pilot_scoping.txt', 'get_all_paperwork', NULL, '{"path":"calls/2025-09-02_pilot_scoping.txt","kind":"call","text":"PILOT SCOPING CALL: NOTES\nDate: 2 September 2025\nWritten up by: the FlytBase deal team\nPresent for the customer: Rhys Calder (alliance drone programme lead); Insp. Karen Mbeki (Westmere drone unit)\nPresent for FlytBase: Achal Negi; a solutions engineer\n\nPilot\n- 6 docks, all at Westmere, 15 September to 12 December 2025.\n- Insp. Mbeki chooses the sites. She wants them near the places her unit is called to most.\n- Pilot fee 30,000, credited against a first-year order if one follows.\n\nHow the pilot will be judged\n- Rhys Calder: the unit using the docks, and footage he can show the board.\n- No other measure was set.\n\nSupport during the pilot\n- Insp. Mbeki asked who she calls when something breaks. Answer for the pilot: the solutions\n  engineer directly. After the pilot: the support desk.\n\nActions\n- FlytBase: install 6 docks by 15 September. Done.\n- Insp. Mbeki: sites and site access. Done.\n"}', NULL, 'Reported', '2026-11-14T09:17:45.709Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_calls/2025-10-21_pilot_midpoint.txt', 'A', NULL, 'paperwork', 'calls/2025-10-21_pilot_midpoint.txt', 'calls/2025-10-21_pilot_midpoint.txt', 'get_all_paperwork', NULL, '{"path":"calls/2025-10-21_pilot_midpoint.txt","kind":"call","text":"PILOT MID-POINT CALL: NOTES\nDate: 21 October 2025\nWritten up by: a FlytBase solutions engineer\nPresent for the customer: Insp. Karen Mbeki (Westmere drone unit)\nPresent for FlytBase: a solutions engineer\n\nFaults\n- Two docks needed an engineer visit in the first month. Both fixed, nothing open.\n\nUse\n- Insp. Mbeki: the unit uses the docks most days now. Mostly support to patrols.\n- She asked for a second training session for officers joining the rota.\n\nOther\n- Rhys Calder was not on this call.\n\nActions\n- FlytBase: second training session for Westmere. Done 4 November 2025.\n"}', NULL, 'Reported', '2026-11-14T09:17:45.710Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_calls/2025-12-16_pilot_review.txt', 'A', NULL, 'paperwork', 'calls/2025-12-16_pilot_review.txt', 'calls/2025-12-16_pilot_review.txt', 'get_all_paperwork', NULL, '{"path":"calls/2025-12-16_pilot_review.txt","kind":"call","text":"PILOT REVIEW CALL: NOTES\nDate: 16 December 2025\nWritten up by: the FlytBase deal team\nPresent for the customer: Rhys Calder (alliance drone programme lead); Insp. Karen Mbeki (Westmere drone\nunit); the alliance procurement lead (joined for the second half; name not recorded)\nPresent for FlytBase: Achal Negi; a solutions engineer\n\nPilot\n- 6 docks at Westmere, 15 September to 12 December.\n- Insp. Mbeki: her unit used the docks most days after the first fortnight. Mostly patrol support.\n  She wants more docks at Westmere whatever the other forces decide.\n- Two docks needed a visit in the first month. No open faults at the end.\n\nWhat the customer wants next\n- Rhys Calder: the alliance wants all four forces in from the start, not Westmere alone. The alliance\n  office will place one order for the four forces.\n- Rhys Calder will give the number of docks for each force. FlytBase did not speak to the other\n  thre', NULL, 'Reported', '2026-11-14T09:17:45.711Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_calls/2026-01-13_order_call.txt', 'A', NULL, 'paperwork', 'calls/2026-01-13_order_call.txt', 'calls/2026-01-13_order_call.txt', 'get_all_paperwork', NULL, '{"path":"calls/2026-01-13_order_call.txt","kind":"call","text":"ORDER CALL: NOTES\nDate: 13 January 2026\nWritten up by: the FlytBase deal team\nPresent for the customer: Rhys Calder (alliance drone programme lead)\nPresent for FlytBase: Achal Negi\n\nOrder\n- 35 docks for the four forces, one order, placed and signed by the alliance office.\n- Rhys Calder supplied the number of docks for each force and the sites. These went to the field\n  team for the install sheets.\n- One year, 1 March 2026 to 28 February 2027. No automatic renewal.\n\nInvoicing\n- The alliance office asked for the order to be invoiced in four parts. The addresses and the split\n  go to FlytBase Accounts as Schedule 2.\n\nNot on the call\n- The alliance procurement lead, who joined the pilot review in December.\n- Anyone from the forces.\n\nActions\n- FlytBase: order form to the alliance office. Done 20 January 2026.\n- Rhys Calder: invoicing instructions to FlytBase Accounts. Done.\n"}', NULL, 'Reported', '2026-11-14T09:17:45.713Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_calls/2026-02-17_install_kickoff.txt', 'A', NULL, 'paperwork', 'calls/2026-02-17_install_kickoff.txt', 'calls/2026-02-17_install_kickoff.txt', 'get_all_paperwork', NULL, '{"path":"calls/2026-02-17_install_kickoff.txt","kind":"call","text":"INSTALLATION KICK-OFF: NOTES\nDate: 17 February 2026\nWritten up by: the FlytBase onboarding lead\nPresent for the customer: Rhys Calder (alliance drone programme lead)\nPresent for FlytBase: the onboarding lead\n\nPlan\n- 35 docks in March and April.\n- Site access goes through the programme office. It sends an escort on each install day.\n- Operators are trained on the day their dock is installed.\n\nAsked and answered\n- The onboarding lead asked for a day-to-day contact at each force. Rhys Calder: use the programme\n  office; it coordinates the four forces.\n\nActions\n- FlytBase: install schedule. Done.\n- Rhys Calder: site access for each install day. Done.\n"}', NULL, 'Reported', '2026-11-14T09:17:45.714Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_calls/2026-03-24_install_check_in.txt', 'A', NULL, 'paperwork', 'calls/2026-03-24_install_check_in.txt', 'calls/2026-03-24_install_check_in.txt', 'get_all_paperwork', NULL, '{"path":"calls/2026-03-24_install_check_in.txt","kind":"call","text":"INSTALLATION CHECK-IN: NOTES\nDate: 24 March 2026\nWritten up by: the FlytBase onboarding lead\nPresent for the customer: Rhys Calder (alliance drone programme lead)\nPresent for FlytBase: the onboarding lead\n\nProgress\n- 19 of 35 docks installed and commissioned.\n- Two docks failed the commissioning check the first time. Both passed after a second visit.\n- Operators trained at each install. Attendance sheets are with the field team.\n\nAsked by the customer\n- Rhys Calder asked for a photograph of each dock for the programme board. Sent.\n\nActions\n- FlytBase: remaining 16 docks in April. Done 24 April 2026.\n"}', NULL, 'Reported', '2026-11-14T09:17:45.715Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_calls/2026-04-28_install_close.txt', 'A', NULL, 'paperwork', 'calls/2026-04-28_install_close.txt', 'calls/2026-04-28_install_close.txt', 'get_all_paperwork', NULL, '{"path":"calls/2026-04-28_install_close.txt","kind":"call","text":"INSTALLATION CLOSE CALL: NOTES\nDate: 28 April 2026\nWritten up by: the FlytBase onboarding lead, for the handover to customer success\nPresent for the customer: Rhys Calder (alliance drone programme lead)\nPresent for FlytBase: the onboarding lead\n\nStatus\n- 35 docks installed and commissioned, the last on 24 April.\n- Every dock flew a commissioning flight on its install day.\n- Operators were trained at every site on install day.\n\nLeft open\n- No plan for how each force will use its docks was shared with us. Rhys Calder: each force decides\n  its own use.\n- The install sheets (which dock is at which site) stay with the field team. Not copied to the\n  customer success record.\n\nHandover note to customer success\n- Every contact so far has been through the programme office. We have not spoken to a force\n  directly since the pilot, except Westmere''s drone unit.\n"}', NULL, 'Reported', '2026-11-14T09:17:45.716Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_calls/2026-05-19_intro_call.txt', 'A', NULL, 'paperwork', 'calls/2026-05-19_intro_call.txt', 'calls/2026-05-19_intro_call.txt', 'get_all_paperwork', NULL, '{"path":"calls/2026-05-19_intro_call.txt","kind":"call","text":"CALL TRANSCRIPT (auto-recorded, tidied)\nDate: 19 May 2026\nOn the call: Sam (FlytBase, CSM); Rhys Calder (alliance drone programme lead)\n\nSam: Thanks for making time. I have just picked up the account, so I wanted to hear how the rollout\nlooks from your side.\nRhys: It is going really well. Thirty-five docks in, the board is pleased, and all four forces are keen.\nSam: Good. I can see plenty of flying on some docks and none yet on others. Is that expected this\nearly?\nRhys: Completely. Some forces move faster than others. They will all get there.\nSam: Could you introduce me to someone at each force? It would help to have a contact for day-to-day\nquestions.\nRhys: Honestly, the simplest thing is to go through me. I coordinate the four forces, that is what\nthe programme office is for. Karen at Westmere you already know.\nSam: Understood. I will come to you first. If something operational comes up at one of the others', NULL, 'Reported', '2026-11-14T09:17:45.717Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_emails/2026-10-02_rhys_stadium.txt', 'A', NULL, 'email', 'emails/2026-10-02_rhys_stadium.txt', 'emails/2026-10-02_rhys_stadium.txt', 'get_all_paperwork', NULL, '{"path":"emails/2026-10-02_rhys_stadium.txt","kind":"email","text":"From: Rhys Calder\nTo: Sam (FlytBase)\nDate: 2 October 2026\nSubject: Stadium\n\nSam,\n\nWestmere''s stadium project is a 30-dock opportunity. Can we talk Tuesday? I will want a quote\nquickly.\n\nRhys\n"}', NULL, 'Reported', '2026-11-14T09:17:45.735Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_calls/2026-06-02_check_in.txt', 'A', NULL, 'paperwork', 'calls/2026-06-02_check_in.txt', 'calls/2026-06-02_check_in.txt', 'get_all_paperwork', NULL, '{"path":"calls/2026-06-02_check_in.txt","kind":"call","text":"CALL TRANSCRIPT (auto-recorded, tidied)\nDate: 2 June 2026\nOn the call: Sam (FlytBase, CSM); Rhys Calder (alliance drone programme lead)\n\nSam: I sent the May summary yesterday. Did the chart do the job?\nRhys: The board loved it. Next time, can you split it by force?\nSam: I can split it by dock. I do not have which dock is at which force on my side.\nRhys: I will dig the list out for you.\nSam: Thank you. One thing in the numbers: a fair number of the docks did not fly at all in May.\nRhys: Early days. Forces come on stream at different speeds. All four forces are keen.\nSam: Is anything getting in the operators'' way? Anything we should fix?\nRhys: Nothing has reached me.\nSam: I will send June at the start of July.\n\nFollow-ups noted by Sam\n- Dock-by-force list from Rhys Calder. (Not received.)\n- June usage summary. (Sent 1 July.)\n"}', NULL, 'Reported', '2026-11-14T09:17:45.719Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_calls/2026-06-30_check_in.txt', 'A', NULL, 'paperwork', 'calls/2026-06-30_check_in.txt', 'calls/2026-06-30_check_in.txt', 'get_all_paperwork', NULL, '{"path":"calls/2026-06-30_check_in.txt","kind":"call","text":"CALL TRANSCRIPT (auto-recorded, tidied)\nDate: 30 June 2026\nOn the call: Sam (FlytBase, CSM); Rhys Calder (alliance drone programme lead)\n\nSam: June goes to you tomorrow. The headline is the same as May: a small number of docks do most of\nthe flying.\nRhys: That will be Westmere. They are the old hands.\nSam: Could we look at what would help the others get started? A refresher, a visit, anything.\nRhys: They will get there. I would rather not push them.\nSam: Understood. Is the board still happy?\nRhys: Very. It meets on the fourteenth and I have your chart in the pack.\nSam: Good. When are you away over the summer?\nRhys: The third to the fourteenth of August.\n\nFollow-ups noted by Sam\n- June usage summary. (Sent 1 July.)\n- Next call after Rhys Calder''s leave.\n"}', NULL, 'Reported', '2026-11-14T09:17:45.720Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_calls/2026-07-22_check_in.txt', 'A', NULL, 'paperwork', 'calls/2026-07-22_check_in.txt', 'calls/2026-07-22_check_in.txt', 'get_all_paperwork', NULL, '{"path":"calls/2026-07-22_check_in.txt","kind":"call","text":"CALL TRANSCRIPT (auto-recorded, tidied)\nDate: 22 July 2026\nOn the call: Sam (FlytBase, CSM); Rhys Calder (alliance drone programme lead)\n\nRhys: Big news since we last spoke. The alliance is preparing a framework tender. Up to 300 docks.\nThe spec is being finalised.\nSam: That is a large step from 35. Who is writing the specification?\nRhys: The team is on it. I will keep you posted.\nSam: Is there anything we should be sending them? Technical detail, how the 35 are doing?\nRhys: Leave that with me for now. When they need something I will ask.\nSam: On the 35: several docks still have not flown a single mission since install. They are online\nevery day. Is something holding those forces back?\nRhys: Teething. All four forces are keen, I promise you.\nSam: And the renewal in February, should I expect a process on your side?\nRhys: The alliance has the budget. It will not be a problem.\nSam: Last thing. There is a document', NULL, 'Reported', '2026-11-14T09:17:45.721Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_calls/2026-08-19_check_in.txt', 'A', NULL, 'paperwork', 'calls/2026-08-19_check_in.txt', 'calls/2026-08-19_check_in.txt', 'get_all_paperwork', NULL, '{"path":"calls/2026-08-19_check_in.txt","kind":"call","text":"CALL TRANSCRIPT (auto-recorded, tidied)\nDate: 19 August 2026\nOn the call: Sam (FlytBase, CSM); Rhys Calder (alliance drone programme lead)\n\nSam: Welcome back. I owe you the July summary. It did not go out.\nRhys: No matter. Send July and August together.\nSam: On the tender you mentioned: is there a timetable yet?\nRhys: The spec is being finalised. It is in hand.\nSam: Two things from Westmere while you were away. The unit asked for training for new operators\nand we ran a session on the second. And Karen has written to me about batteries on two docks.\nRhys: Karen always has a list. It means they are using the kit.\nSam: I will come back to her.\nRhys: Good. Anything else?\nSam: Not today.\n\nFollow-ups noted by Sam\n- July and August usage summaries together. (Not sent.)\n- Reply to Insp. Mbeki about the batteries. (No reply on file.)\n"}', NULL, 'Reported', '2026-11-14T09:17:45.722Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_calls/2026-09-09_check_in.txt', 'A', NULL, 'paperwork', 'calls/2026-09-09_check_in.txt', 'calls/2026-09-09_check_in.txt', 'get_all_paperwork', NULL, '{"path":"calls/2026-09-09_check_in.txt","kind":"call","text":"CALL TRANSCRIPT (auto-recorded, tidied)\nDate: 9 September 2026\nOn the call: Sam (FlytBase, CSM); Rhys Calder (alliance drone programme lead)\n\nSam: Thank you for the reply last week. I would still like to hear from the forces that are not\nflying, even for ten minutes.\nRhys: After the programme board. I will raise it there.\nSam: When does it meet?\nRhys: October.\nSam: The renewal is under six months away. Docks that have never flown will come up in that\nconversation, with us and I expect on your side too.\nRhys: The alliance has the budget. I am not worried about the renewal.\nSam: I would rather we both knew the reason before someone asks.\nRhys: Leave it with me.\n\nFollow-ups noted by Sam\n- Rhys Calder: raise the unused docks at the October programme board. (No outcome on file.)\n"}', NULL, 'Reported', '2026-11-14T09:17:45.723Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_calls/2026-10-06_check_in.txt', 'A', NULL, 'paperwork', 'calls/2026-10-06_check_in.txt', 'calls/2026-10-06_check_in.txt', 'get_all_paperwork', NULL, '{"path":"calls/2026-10-06_check_in.txt","kind":"call","text":"CALL TRANSCRIPT (auto-recorded, tidied)\nDate: 6 October 2026\nOn the call: Sam (FlytBase, CSM); Rhys Calder (alliance drone programme lead)\n\nRhys: I have another one for you. Westmere''s stadium project. It is a 30-dock opportunity.\nSam: Thirty docks at one site? Who is behind it at Westmere?\nRhys: It has come from the top of the force. I would like a quote I can put in front of people.\nSam: I will need to take that to our commercial team before anything is quoted.\nRhys: A number on paper gets things moving.\nSam: Has Karen''s unit been involved?\nRhys: Karen is busy flying. I will bring her in at the right moment.\nSam: And the tender, any change?\nRhys: Spec being finalised. It is in hand.\nSam: I still do not have a name for whoever is writing it.\nRhys: You have me.\n\nFollow-ups noted by Sam\n- Stadium: no quote issued.\n- Ask Karen Mbeki directly about the stadium. (Not done before the handover.)\n"}', NULL, 'Reported', '2026-11-14T09:17:45.724Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_calls/2026-10-20_check_in.txt', 'A', NULL, 'paperwork', 'calls/2026-10-20_check_in.txt', 'calls/2026-10-20_check_in.txt', 'get_all_paperwork', NULL, '{"path":"calls/2026-10-20_check_in.txt","kind":"call","text":"CALL TRANSCRIPT (auto-recorded, tidied)\nDate: 20 October 2026\nOn the call: Sam (FlytBase, CSM); Rhys Calder (alliance drone programme lead)\n\nRhys: Where is my stadium quote?\nSam: There is not one yet. It is with our commercial team.\nRhys: I need a number to get people in a room.\nSam: I understand. Could I speak to Karen about it? Her unit would be flying them.\nRhys: Let me set that up.\nSam: Thank you. On the renewal, I will write this month with the term dates so it is in front of\nyou in good time.\nRhys: Fine. It will go through.\nSam: Did the unused docks come up at the programme board?\nRhys: We ran out of time. Next one.\n\nFollow-ups noted by Sam\n- Rhys Calder: set up a call with Insp. Mbeki about the stadium. (Not set up before the handover.)\n- Sam: renewal email with the term dates. Sent 28 October.\n"}', NULL, 'Reported', '2026-11-14T09:17:45.725Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_emails/2026-07-09_rhys_tender.txt', 'A', NULL, 'email', 'emails/2026-07-09_rhys_tender.txt', 'emails/2026-07-09_rhys_tender.txt', 'get_all_paperwork', NULL, '{"path":"emails/2026-07-09_rhys_tender.txt","kind":"email","text":"From: Rhys Calder\nTo: Sam (FlytBase)\nDate: 9 July 2026\nSubject: Something big coming\n\nSam,\n\nA heads-up before our call. The alliance is preparing a framework tender for up to 300 docks. The\nspec is being finalised. I wanted you to hear it from me first.\n\nKeep it to yourselves for now.\n\nRhys\n"}', NULL, 'Reported', '2026-11-14T09:17:45.732Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_emails/2026-08-11_karen_batteries.txt', 'A', NULL, 'email', 'emails/2026-08-11_karen_batteries.txt', 'emails/2026-08-11_karen_batteries.txt', 'get_all_paperwork', NULL, '{"path":"emails/2026-08-11_karen_batteries.txt","kind":"email","text":"From: Insp. Karen Mbeki\nTo: Sam (FlytBase)\nDate: 11 August 2026\nSubject: Batteries on two docks\n\nSam,\n\nTwo of our docks have batteries that will not last a night shift any more. We are swapping aircraft\nbetween docks to cope, which is not what my officers'' time is for.\n\nWho do I talk to about this? I would rather not fill in a form and wait.\n\nKaren Mbeki\nWestmere drone unit\n\n[No reply on file.]\n"}', NULL, 'Reported', '2026-11-14T09:17:45.733Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_emails/2026-09-03_usage_question.txt', 'A', NULL, 'email', 'emails/2026-09-03_usage_question.txt', 'emails/2026-09-03_usage_question.txt', 'get_all_paperwork', NULL, '{"path":"emails/2026-09-03_usage_question.txt","kind":"email","text":"From: Sam (FlytBase)\nTo: Rhys Calder\nDate: 3 September 2026\nSubject: Docks that have not flown\n\nRhys,\n\nLooking at the summer: a good number of the 35 docks are online every day and have still flown\nnothing, or only the odd training flight. I would like to understand why before the renewal\nconversation. Could we set up a short call with the forces concerned?\n\nSam\n\n---\nFrom: Rhys Calder\nTo: Sam (FlytBase)\nDate: 4 September 2026\nSubject: RE: Docks that have not flown\n\nSam, I would not read too much into it. All four forces are keen. Different forces, different\npace. No need to trouble them with calls. I will pick it up at the next programme board.\n\nRhys\n"}', NULL, 'Reported', '2026-11-14T09:17:45.734Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_contract.txt', 'A', NULL, 'contract', 'contract.txt', 'contract.txt', 'get_all_paperwork', NULL, '{"path":"contract.txt","kind":"contract","text":"ORDER FORM SUMMARY (customer success copy)\nCustomer: Aldermoor Industrial Group, group security\nSigned: 15 January 2026, by Stefan Roy, group head of security\nCurrency: euros\n\nWhat was ordered\n- 14 docks with aircraft, and the FlytBase platform for all of them.\n- Installation and commissioning at plants named by the customer.\n- Operator training for a rollout lead named by the customer, who trains each plant.\n\nPrice and term\n- 140,000 a year.\n- Term: 1 February 2026 to 31 January 2027.\n- No automatic renewal. A renewal needs a new order before the term ends.\n\nInvoicing\n- One invoice a year, to group security.\n- The order form does not say how the customer shares the cost inside the group.\n\nSupport\n- Standard support: support desk in business hours, tickets answered in order of arrival.\n- The customer keeps each dock connected to its own plant network.\n\nNot covered by this order\n- A dock for the fifteenth plant.\n-', NULL, 'Verified', '2026-11-14T09:17:45.727Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_deal_history.json', 'A', NULL, 'paperwork', 'deal_history.json', 'deal_history.json', 'get_all_paperwork', NULL, '{"path":"deal_history.json","kind":"deal_history","data":{"account":"B","currency":"EUR","history":[{"date":"2025-08","what":"Enquiry","detail":"Stefan Roy, group head of security, asked about automated night patrols for the group''s plants."},{"date":"2025-10 to 2025-12","what":"Trial","detail":"2 docks at two plants. Trial fee 12,000, credited against the first year."},{"date":"2025-12-11","what":"Trial review call","detail":"See calls/2025-12-11_trial_review.txt."},{"date":"2026-01-15","what":"Order form signed","detail":"14 docks and the platform, 140,000 a year, signed by Stefan Roy.","value":140000},{"date":"2026-02-01","what":"Term starts","detail":"One invoice to group security. Paid."},{"date":"2026-02 to 2026-04","what":"Rollout","detail":"14 docks installed. Led on the customer''s side by Stefan Roy''s deputy."},{"date":"2026-04-23","what":"Rollout close call","detail":"See calls/2026-04-23_rollout_close.txt."},{"date":"2026-05","what":"Handover to customer success","detail":"S', NULL, 'Reported', '2026-11-14T09:17:45.728Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_device_events.csv', 'A', NULL, 'paperwork', 'device_events.csv', 'device_events.csv', 'get_all_paperwork', NULL, '{"path":"device_events.csv","kind":"device_events","text":"date,time,dock_id,event,detail\n2026-05-01,06:41,AD-12,connection_lost,\n2026-05-01,06:57,AD-12,connection_restored,\n2026-05-02,02:57,AD-14,connection_lost,\n2026-05-02,03:14,AD-14,connection_restored,\n2026-05-03,01:05,AD-12,connection_lost,\n2026-05-03,01:42,AD-12,connection_restored,\n2026-05-03,10:53,AD-14,connection_lost,\n2026-05-03,10:58,AD-14,connection_restored,\n2026-05-03,13:50,AD-12,connection_lost,\n2026-05-03,14:22,AD-12,connection_restored,\n2026-05-03,16:05,AD-12,connection_lost,\n2026-05-03,16:15,AD-12,connection_restored,\n2026-05-03,17:09,AD-12,connection_lost,\n2026-05-03,17:45,AD-12,connection_restored,\n2026-05-04,20:25,AD-14,connection_lost,\n2026-05-04,20:35,AD-14,connection_restored,\n2026-05-05,22:47,AD-12,connection_lost,\n2026-05-05,23:01,AD-12,connection_restored,\n2026-05-06,22:29,AD-14,connection_lost,\n2026-05-06,23:03,AD-14,connection_restored,\n2026-05-07,13:56,AD-12,connection_lost,\n2026-05-', NULL, 'Reported', '2026-11-14T09:17:45.730Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_devices.json', 'A', NULL, 'paperwork', 'devices.json', 'devices.json', 'get_all_paperwork', NULL, '{"path":"devices.json","kind":"devices","data":{"note":"Docks registered to this account, with the date each was commissioned under the current order (docks from a pilot or trial were commissioned again). Which site each dock sits at is not in this record.","docks":[{"dock_id":"AD-01","dock_serial":"FBD82L48074","aircraft_serial":"FBA12Z73665","model":"Standard dock, 2025 model","commissioned":"2026-03-30","software":"2026.09","last_seen_online":"2026-11-13"},{"dock_id":"AD-02","dock_serial":"FBD67B46970","aircraft_serial":"FBA33R35988","model":"Standard dock, 2025 model","commissioned":"2026-04-14","software":"2026.09","last_seen_online":"2026-11-13"},{"dock_id":"AD-03","dock_serial":"FBD29H42965","aircraft_serial":"FBA86E29928","model":"Standard dock, 2025 model","commissioned":"2026-02-23","software":"2026.09","last_seen_online":"2026-11-13"},{"dock_id":"AD-04","dock_serial":"FBD88C78629","aircraft_serial":"FBA90A75891","model":"Standard dock, 2025 model","commissioned":"2026-02-24"', NULL, 'Reported', '2026-11-14T09:17:45.731Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_emails/2026-10-28_renewal.txt', 'A', NULL, 'email', 'emails/2026-10-28_renewal.txt', 'emails/2026-10-28_renewal.txt', 'get_all_paperwork', NULL, '{"path":"emails/2026-10-28_renewal.txt","kind":"email","text":"From: Sam (FlytBase)\nTo: Rhys Calder\nDate: 28 October 2026\nSubject: Renewal, term ends 28 February\n\nRhys,\n\nThe current term ends on 28 February and there is no automatic renewal, so we will need a new order\nbefore then. Who signs it on your side, and does each force need to do anything?\n\nSam\n\n---\nFrom: Rhys Calder\nTo: Sam (FlytBase)\nDate: 30 October 2026\nSubject: RE: Renewal, term ends 28 February\n\nThe alliance has the budget. Same as last time: send it to the programme office and I will\nwalk it through.\n\nRhys\n"}', NULL, 'Reported', '2026-11-14T09:17:45.736Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_internal_notes.json', 'A', NULL, 'paperwork', 'internal_notes.json', 'internal_notes.json', 'get_all_paperwork', NULL, '{"path":"internal_notes.json","kind":"internal_notes","data":{"note":"Notes about the account from FlytBase''s internal channel, oldest first. Fictional personas; routine notes only.","notes":[{"date":"2026-01-16","from":"Deal team","text":"Aldermoor order signed by Stefan Roy. One invoice a year to group security."},{"date":"2026-04-24","from":"Rollout lead","text":"Aldermoor rollout closed. Asked the customer''s deputy for the install list. Not received. Passing to customer success."},{"date":"2026-05-04","from":"Rollout lead","text":"Aldermoor passes to customer success. Sam is the CSM."},{"date":"2026-07-15","from":"Sam","text":"Stefan Roy quoted a savings figure on yesterday''s call. Asked for the breakdown."},{"date":"2026-09-12","from":"Support desk","text":"FB-10903, Plant 11: asked the customer to have their IT team look at the link. No reply from the customer yet."},{"date":"2026-09-23","from":"Sam","text":"Stefan Roy wants a case study for the sister company. Not started."},{"d', NULL, 'Reported', '2026-11-14T09:17:45.739Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_invoices.json', 'A', NULL, 'paperwork', 'invoices.json', 'invoices.json', 'get_all_paperwork', NULL, '{"path":"invoices.json","kind":"invoices","data":{"currency":"EUR","note":"From FlytBase Accounts. One invoice a year, to group security.","invoices":[{"number":"INV-25-1012","issued":"2025-10-06","what":"Trial fee, 2 docks","amount":12000,"status":"Paid","paid":"2025-10-30","note":"Credited against the first year."},{"number":"INV-26-0204","issued":"2026-02-01","what":"First year, 14 docks, less the trial fee credit","amount":128000,"status":"Paid","paid":"2026-02-26","note":"Billed to group security."}],"first_year_total":140000}}', NULL, 'Reported', '2026-11-14T09:17:45.740Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_profile.json', 'A', NULL, 'paperwork', 'profile.json', 'profile.json', 'get_all_paperwork', NULL, '{"path":"profile.json","kind":"profile","data":{"account":"B","name":"Aldermoor Industrial Group","currency":"EUR","sector":"Industrial sites, perimeter security","what_they_bought":"14 docks and the FlytBase platform for night perimeter patrols at the group''s plants. The group has 15 plants.","flytbase_side":{"commercial_owner":"achal_negi","csm":[{"who":"sam","from":"2026-05","to":"2026-11"},{"who":"you","from":"2026-11"}]},"contacts_on_file":[{"id":"stefan_roy","name":"Stefan Roy","role":"Group head of security","on_file_since":"2025-08","last_contact_before_handover":"2026-10-13","note":"Signed the order. Every call since May 2026 has been with him alone."},{"id":"beatriz_alonso","name":"Beatriz Alonso","role":"Plant manager, Plant 7","on_file_since":"2026-09","last_contact_before_handover":"2026-09-20","note":"On file only through one support ticket. Never on a call with us."}],"not_on_file":["Stefan Roy''s deputy, who led the rollout on the customer''s side. Referred to by role in ', NULL, 'Reported', '2026-11-14T09:17:45.741Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_requests.csv', 'A', NULL, 'paperwork', 'requests.csv', 'requests.csv', 'get_all_paperwork', NULL, '{"path":"requests.csv","kind":"requests","text":"request_id,opened,from,summary,status,owner,last_update,how_it_arrived\nFB-10903,2026-09-10,Aldermoor Plant 11,\"Dock goes offline for days at a time. The network link at the plant drops. Waiting for the customer''s IT team to look at the link.\",Pending customer,Support desk,2026-09-30,Support ticket\nFB-10944,2026-09-18,\"Beatriz Alonso, Plant 7\",\"Asked whether night alerts can go to more than one person. Sent the settings guide.\",Closed,Support desk,2026-09-20,Support ticket\n(none),2026-10-08,Group finance (shared mailbox),\"Asked for the renewal quote to show the cost for each plant. Not followed up before the handover.\",Open,,2026-10-08,Email to the CSM\n(none),2026-09-22,Stefan Roy,\"Asked for a case study for the sister company. Not started.\",Open,,2026-10-13,Email and call\n"}', NULL, 'Reported', '2026-11-14T09:17:45.742Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_calls/2025-08-19_enquiry_call.txt', 'B', NULL, 'paperwork', 'calls/2025-08-19_enquiry_call.txt', 'calls/2025-08-19_enquiry_call.txt', 'get_all_paperwork', NULL, '{"path":"calls/2025-08-19_enquiry_call.txt","kind":"call","text":"ENQUIRY CALL: NOTES\nDate: 19 August 2025\nWritten up by: the FlytBase deal team\nPresent for the customer: Stefan Roy (group head of security)\nPresent for FlytBase: Achal Negi\n\nBackground\n- Aldermoor has 15 plants. Group security, under Stefan Roy, looks after site security for all of\n  them.\n- Night guarding is done by contractors at each plant.\n\nWhat the customer asked for\n- Automated night patrols of the fence line, starting with a trial at two plants.\n- Footage he can show the board.\n\nNot discussed\n- Who at a plant acts on what a patrol finds.\n- How the cost would be shared inside the group.\n\nActions\n- FlytBase: trial proposal. Done September 2025.\n"}', NULL, 'Reported', '2026-11-14T09:18:51.982Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_calls/2025-10-07_trial_kickoff.txt', 'B', NULL, 'paperwork', 'calls/2025-10-07_trial_kickoff.txt', 'calls/2025-10-07_trial_kickoff.txt', 'get_all_paperwork', NULL, '{"path":"calls/2025-10-07_trial_kickoff.txt","kind":"call","text":"TRIAL KICK-OFF: NOTES\nDate: 7 October 2025\nWritten up by: a FlytBase solutions engineer\nPresent for the customer: Stefan Roy (group head of security); his deputy (name not recorded)\nPresent for FlytBase: a solutions engineer\n\nTrial\n- 2 docks at two plants, October to December 2025: one to start with, the second a few weeks later.\n- Scheduled night patrols of the fence line.\n- Trial fee 12,000, credited against a first-year order if one follows.\n\nWho does what\n- Stefan Roy''s deputy runs the trial day to day: site access, the operator at each plant, the\n  patrol times.\n- Stefan Roy wants a monthly note he can take to the board.\n\nActions\n- FlytBase: install 2 docks. Done.\n- The deputy: a trained operator at each trial plant. Done.\n"}', NULL, 'Reported', '2026-11-14T09:18:51.983Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_calls/2025-12-11_trial_review.txt', 'B', NULL, 'paperwork', 'calls/2025-12-11_trial_review.txt', 'calls/2025-12-11_trial_review.txt', 'get_all_paperwork', NULL, '{"path":"calls/2025-12-11_trial_review.txt","kind":"call","text":"TRIAL REVIEW CALL: NOTES\nDate: 11 December 2025\nWritten up by: the FlytBase deal team\nPresent for the customer: Stefan Roy (group head of security); his deputy (name not recorded)\nPresent for FlytBase: Achal Negi; a solutions engineer\n\nTrial\n- 2 docks at two plants, October to December.\n- Both docks flew scheduled night patrols of the fence line. Few faults.\n- Stefan Roy: the board liked the footage. He wants every plant covered.\n\nWhat the customer wants next\n- 14 docks. The fifteenth plant is left out of this order. Stefan Roy: it can follow later.\n- Stefan Roy''s deputy will lead the rollout on their side and train each plant.\n- Stefan Roy asked whether FlytBase would put a savings figure in the order form. Answer: no; savings\n  depend on how each plant uses the dock.\n\nOpen points at the end of the call\n- Who at each plant acts on what a patrol finds. Stefan Roy: \"the plants will sort that out.\"\n- E', NULL, 'Reported', '2026-11-14T09:18:51.985Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_calls/2026-01-08_order_call.txt', 'B', NULL, 'paperwork', 'calls/2026-01-08_order_call.txt', 'calls/2026-01-08_order_call.txt', 'get_all_paperwork', NULL, '{"path":"calls/2026-01-08_order_call.txt","kind":"call","text":"ORDER CALL: NOTES\nDate: 8 January 2026\nWritten up by: the FlytBase deal team\nPresent for the customer: Stefan Roy (group head of security)\nPresent for FlytBase: Achal Negi\n\nOrder\n- 14 docks, 140,000 a year, one year from 1 February 2026. No automatic renewal.\n- Stefan Roy signs. He said it comes from the group security budget.\n- One invoice a year, to group security.\n\nAsked and answered\n- Stefan Roy asked again whether the order form could state a savings figure. Answer: no. The\n  order form quotes none.\n- Achal Negi asked whether anyone else at the group needs to see the order. Stefan Roy: no.\n\nActions\n- FlytBase: order form. Done 15 January 2026.\n- Stefan Roy: plants and install dates. Done.\n"}', NULL, 'Reported', '2026-11-14T09:18:51.986Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_usage_weekly.csv', 'A', NULL, 'usage', 'usage_weekly.csv', 'usage_weekly.csv', 'get_all_paperwork', NULL, '{"path":"usage_weekly.csv","kind":"usage","text":"week_start,dock_id,flights,days_online\n2026-04-27,AD-01,0,7\n2026-05-04,AD-01,1,7\n2026-05-11,AD-01,0,7\n2026-05-18,AD-01,0,7\n2026-05-25,AD-01,1,7\n2026-06-01,AD-01,1,7\n2026-06-08,AD-01,1,7\n2026-06-15,AD-01,0,7\n2026-06-22,AD-01,0,7\n2026-06-29,AD-01,1,7\n2026-07-06,AD-01,0,7\n2026-07-13,AD-01,0,7\n2026-07-20,AD-01,0,7\n2026-07-27,AD-01,0,7\n2026-08-03,AD-01,2,7\n2026-08-10,AD-01,0,7\n2026-08-17,AD-01,1,7\n2026-08-24,AD-01,0,7\n2026-08-31,AD-01,2,7\n2026-09-07,AD-01,0,3\n2026-09-14,AD-01,0,2\n2026-09-21,AD-01,0,4\n2026-09-28,AD-01,1,5\n2026-10-05,AD-01,1,5\n2026-10-12,AD-01,0,7\n2026-10-19,AD-01,0,7\n2026-10-26,AD-01,0,7\n2026-04-27,AD-02,2,7\n2026-05-04,AD-02,5,7\n2026-05-11,AD-02,5,7\n2026-05-18,AD-02,4,7\n2026-05-25,AD-02,6,7\n2026-06-01,AD-02,3,7\n2026-06-08,AD-02,5,7\n2026-06-15,AD-02,5,7\n2026-06-22,AD-02,4,7\n2026-06-29,AD-02,6,7\n2026-07-06,AD-02,6,7\n2026-07-13,AD-02,5,7\n2026-07-20,AD-02,7,7\n2026-07-27,AD-02,5,7\n2026-08-', NULL, 'Reported', '2026-11-14T09:17:45.745Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_users.json', 'A', NULL, 'paperwork', 'users.json', 'users.json', 'get_all_paperwork', NULL, '{"path":"users.json","kind":"users","data":{"note":"Logins on the account. Names are shown only for people on file as contacts. Which plant a login belongs to is not in this record. The order form provides for one trained operator at each plant.","users":[{"user_id":"U01","name":"Stefan Roy","role":"account administrator","created":"2026-01-20","last_sign_in":"2026-05-12","sign_ins_last_90_days":0},{"user_id":"U02","name":null,"role":"account administrator (group security, deputy; name not on file)","created":"2026-01-22","last_sign_in":"2026-11-13","sign_ins_last_90_days":38},{"user_id":"U03","name":null,"role":"alert recipient, view only (name not on file)","created":"2026-03-09","last_sign_in":"2026-11-10","sign_ins_last_90_days":46},{"user_id":"U04","name":null,"role":"operator","created":"2026-03-17","last_sign_in":"2026-11-12","sign_ins_last_90_days":70},{"user_id":"U05","name":null,"role":"operator","created":"2026-03-07","last_sign_in":"2026-11-13","sign_ins_last_90_days":69},{', NULL, 'Reported', '2026-11-14T09:17:45.746Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_calls/2026-02-10_rollout_kickoff.txt', 'B', NULL, 'paperwork', 'calls/2026-02-10_rollout_kickoff.txt', 'calls/2026-02-10_rollout_kickoff.txt', 'get_all_paperwork', NULL, '{"path":"calls/2026-02-10_rollout_kickoff.txt","kind":"call","text":"ROLLOUT KICK-OFF: NOTES\nDate: 10 February 2026\nWritten up by: the FlytBase rollout lead\nPresent for the customer: Stefan Roy''s deputy (name not recorded)\nPresent for FlytBase: the rollout lead\n\nPlan\n- 14 docks, February to April.\n- The deputy visits each plant ahead of the install, agrees the dock position with the plant\n  manager and trains one operator.\n- Each plant connects the dock to its own network. The deputy arranges this plant by plant.\n\nAsked and answered\n- The rollout lead asked for a contact at each plant. The deputy: go through him; he will be on\n  site for every install.\n\nActions\n- FlytBase: install schedule. Done.\n- The deputy: plant visits and one operator per plant. Done.\n"}', NULL, 'Reported', '2026-11-14T09:18:51.987Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_calls/2026-03-17_rollout_check_in.txt', 'B', NULL, 'paperwork', 'calls/2026-03-17_rollout_check_in.txt', 'calls/2026-03-17_rollout_check_in.txt', 'get_all_paperwork', NULL, '{"path":"calls/2026-03-17_rollout_check_in.txt","kind":"call","text":"ROLLOUT CHECK-IN: NOTES\nDate: 17 March 2026\nWritten up by: the FlytBase rollout lead\nPresent for the customer: Stefan Roy''s deputy (name not recorded)\nPresent for FlytBase: the rollout lead\n\nProgress\n- 8 of 14 docks installed and commissioned.\n- At two plants the signal at the agreed dock position was weak on install day. Both docks passed\n  commissioning. The deputy will take the network up with each plant.\n\nActions\n- FlytBase: remaining 6 docks. Done April 2026.\n- The deputy: network at the two plants with weak signal. (No outcome on file.)\n"}', NULL, 'Reported', '2026-11-14T09:18:51.988Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_calls/2026-04-23_rollout_close.txt', 'B', NULL, 'paperwork', 'calls/2026-04-23_rollout_close.txt', 'calls/2026-04-23_rollout_close.txt', 'get_all_paperwork', NULL, '{"path":"calls/2026-04-23_rollout_close.txt","kind":"call","text":"ROLLOUT CLOSE CALL: NOTES\nDate: 23 April 2026\nWritten up by: the FlytBase rollout lead, for the handover to customer success\nPresent for the customer: Stefan Roy''s deputy (led the rollout on their side)\nPresent for FlytBase: the rollout lead\n\nStatus\n- 14 docks installed and commissioned between February and April.\n- Each dock flew a commissioning flight on its install day.\n- Scheduled night patrols were set up at the plants that asked for them. The others were left with the\n  dock online and one trained operator each.\n\nHow it was done\n- The deputy went to each plant, agreed the dock position with the plant manager and trained one\n  operator.\n- The deputy kept the install list (which dock is at which plant, and who was trained).\n  We asked for a copy. Not received.\n\nLeft open\n- No patrol schedule at most plants. The deputy: \"they will ask when they are ready.\"\n- No list of who receives alerts at eac', NULL, 'Reported', '2026-11-14T09:18:51.989Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_calls/2026-05-21_intro_call.txt', 'B', NULL, 'paperwork', 'calls/2026-05-21_intro_call.txt', 'calls/2026-05-21_intro_call.txt', 'get_all_paperwork', NULL, '{"path":"calls/2026-05-21_intro_call.txt","kind":"call","text":"CALL TRANSCRIPT (auto-recorded, tidied)\nDate: 21 May 2026\nOn the call: Sam (FlytBase, CSM); Stefan Roy (group head of security)\n\nSam: I have just picked up the account. How does the rollout look from where you sit?\nStefan: A success. Fourteen docks in three months. The board has seen the footage.\nSam: Good. Our rollout lead never received the install list: which dock is at which plant, who was\ntrained. Could I have a copy?\nStefan: My deputy has it. He did the rollout plant by plant.\nSam: May I write to him?\nStefan: Send it to my office and it will reach him.\nSam: I will. Which plants are flying patrols every night?\nStefan: The plants set their own pace. They are all covered.\n\nFollow-ups noted by Sam\n- Ask the deputy for the install list. (Asked through Stefan Roy''s office on 22 May. Not received.)\n"}', NULL, 'Reported', '2026-11-14T09:18:51.990Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_calls/2026-06-11_check_in.txt', 'B', NULL, 'paperwork', 'calls/2026-06-11_check_in.txt', 'calls/2026-06-11_check_in.txt', 'get_all_paperwork', NULL, '{"path":"calls/2026-06-11_check_in.txt","kind":"call","text":"CALL TRANSCRIPT (auto-recorded, tidied)\nDate: 11 June 2026\nOn the call: Sam (FlytBase, CSM); Stefan Roy (group head of security)\n\nStefan: I present to the board next week. I want three or four clips, night patrols, something that\nlooks good.\nSam: I can pull those. On the numbers: most of the flying comes from a handful of docks.\nStefan: Thirteen of fifteen plants are flying.\nSam: Is there a plan to move the others to nightly patrols?\nStefan: They will ask when they are ready.\nSam: I still do not have the install list.\nStefan: I will remind my deputy.\n\nFollow-ups noted by Sam\n- Footage clips for the board. Sent 15 June.\n- Install list: still not received.\n"}', NULL, 'Reported', '2026-11-14T09:18:51.992Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_calls/2026-07-14_check_in.txt', 'B', NULL, 'paperwork', 'calls/2026-07-14_check_in.txt', 'calls/2026-07-14_check_in.txt', 'get_all_paperwork', NULL, '{"path":"calls/2026-07-14_check_in.txt","kind":"call","text":"CALL TRANSCRIPT (auto-recorded, tidied)\nDate: 14 July 2026\nOn the call: Sam (FlytBase, CSM); Stefan Roy (group head of security)\n\nStefan: I will give you the headline. ROI is proven. About 1.2 million euros a year saved.\nSam: That is a strong number. How is it made up?\nStefan: Guarding hours, incidents avoided, that kind of thing. It is all in there.\nSam: Could I see the breakdown? If we ever quote it, someone will ask.\nStefan: I will send something over. The board has seen the headline and they are happy.\nSam: On usage: I see a handful of docks flying every night and the rest flying a few times a month.\nStefan: Thirteen of fifteen plants are flying. That is the figure I report.\nSam: Flying at all, yes. I meant how often. Is the plan for the others to move to nightly patrols?\nStefan: They will. The plants set their own pace.\nSam: Is your deputy still the right person for me to speak to about each plant?\nStefan:', NULL, 'Reported', '2026-11-14T09:18:51.993Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_calls/2026-08-25_check_in.txt', 'B', NULL, 'paperwork', 'calls/2026-08-25_check_in.txt', 'calls/2026-08-25_check_in.txt', 'get_all_paperwork', NULL, '{"path":"calls/2026-08-25_check_in.txt","kind":"call","text":"CALL TRANSCRIPT (auto-recorded, tidied)\nDate: 25 August 2026\nOn the call: Sam (FlytBase, CSM); Stefan Roy (group head of security)\n\nSam: One thing I am still missing: the list of who receives the alerts at each plant. When a\npatrol flags something at night, who gets it?\nStefan: The plants handle that.\nSam: Each in their own way?\nStefan: It is their site. Group security sets the standard, the plant runs the night.\nSam: Would your deputy know the detail?\nStefan: Go through me.\n\nFollow-ups noted by Sam\n- List of alert recipients by plant. (Not received.)\n"}', NULL, 'Reported', '2026-11-14T09:18:51.994Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_A_calls_2026-03-24_install_check_in_txt', 'A', NULL, 'call', 'calls/2026-03-24_install_check_in.txt', 'calls/2026-03-24_install_check_in.txt', 'get_all_paperwork', NULL, 'INSTALLATION CHECK-IN: NOTES
Date: 24 March 2026
Written up by: the FlytBase onboarding lead
Present for the customer: Rhys Calder (alliance drone programme lead)
Present for FlytBase: the onboarding lead

Progress
- 19 of 35 docks installed and commissioned.
- Two docks failed the commissioning check the first time. Both passed after a second visit.
- Operators trained at each install. Attendance sheets are with the field team.

Asked by the customer
- Rhys Calder asked for a photograph of each dock for the programme board. Sent.

Actions
- FlytBase: remaining 16 docks in April. Done 24 April 2026.
', NULL, 'Reported', '2026-11-14T09:20:40.992Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_calls/2026-10-13_check_in.txt', 'B', NULL, 'paperwork', 'calls/2026-10-13_check_in.txt', 'calls/2026-10-13_check_in.txt', 'get_all_paperwork', NULL, '{"path":"calls/2026-10-13_check_in.txt","kind":"call","text":"CALL TRANSCRIPT (auto-recorded, tidied)\nDate: 13 October 2026\nOn the call: Sam (FlytBase, CSM); Stefan Roy (group head of security)\n\nStefan: Where are we with the case study? Our sister company has forty plants. I want to put it in\nfront of them this quarter.\nSam: I have not started it. A case study needs figures we can stand behind and someone at a plant\nwilling to be quoted. I still do not have the breakdown of the savings.\nStefan: Use the headline. ROI is proven.\nSam: Our marketing team will not publish a number without the working. Could finance confirm it?\nStefan: You do not need finance. This is a security programme.\nSam: I did get an email from your finance mailbox asking for the renewal quote to show the cost for\neach plant. Do you know what is behind that?\nStefan: Ignore it. The renewal is a formality.\nSam: And the dock at Plant 11 that keeps dropping offline?\nStefan: That is an IT matter on our side.', NULL, 'Reported', '2026-11-14T09:18:51.994Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_calls_index.json', 'A', NULL, 'paperwork', 'calls_index.json', 'calls_index.json', 'get_all_paperwork', NULL, '{"path":"calls_index.json","kind":"calls_index","data":{"note":"Every call on file, oldest first, with its summary and actions. `path` is the notes or transcript where one was kept; a call with no path was summarised only.","calls":[{"date":"2025-08-19","title":"Enquiry call","record":"notes","customer":["Stefan Roy"],"flytbase":["Achal Negi"],"summary":"First call. Group security wants automated night patrols of the fence line at the group''s plants. A trial at two plants was agreed in outline.","actions":["FlytBase: trial proposal. Done September 2025."],"path":"calls/2025-08-19_enquiry_call.txt"},{"date":"2025-10-07","title":"Trial kick-off","record":"notes","customer":["Stefan Roy","Stefan Roy''s deputy"],"flytbase":["a solutions engineer"],"summary":"Trial started: 2 docks at two plants, October to December 2025. Stefan Roy''s deputy runs it day to day on the customer''s side.","actions":["FlytBase: install 2 docks. Done.","The deputy: a trained operator at each trial plant. Done."],"', NULL, 'Reported', '2026-11-14T09:17:45.726Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_emails/2026-07-16_stefan_savings.txt', 'B', NULL, 'email', 'emails/2026-07-16_stefan_savings.txt', 'emails/2026-07-16_stefan_savings.txt', 'get_all_paperwork', NULL, '{"path":"emails/2026-07-16_stefan_savings.txt","kind":"email","text":"From: Stefan Roy\nTo: Sam (FlytBase)\nDate: 16 July 2026\nSubject: The number\n\nSam,\n\nAs discussed: ROI is proven, about 1.2 million euros a year saved. Thirteen of fifteen plants are\nflying. Feel free to use that internally.\n\nI will send the detail when I have a moment.\n\nStefan\n\n[No detail received.]\n"}', NULL, 'Reported', '2026-11-14T09:18:52.000Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_emails/2026-09-18_beatriz_alerts.txt', 'B', NULL, 'email', 'emails/2026-09-18_beatriz_alerts.txt', 'emails/2026-09-18_beatriz_alerts.txt', 'get_all_paperwork', NULL, '{"path":"emails/2026-09-18_beatriz_alerts.txt","kind":"email","text":"From: Beatriz Alonso\nTo: Support desk\nDate: 18 September 2026\nSubject: Who gets the alerts at night (FB-10944)\n\nHello,\n\nI am the plant manager at Plant 7. Can the night alerts from our dock go to more than one person?\nPlease tell me how to change it.\n\nBeatriz Alonso\n\n---\nFrom: Support desk\nTo: Beatriz Alonso\nDate: 20 September 2026\nSubject: RE: Who gets the alerts at night (FB-10944)\n\nHello Beatriz, yes. The settings guide attached shows how to add recipients. Closing this ticket;\nreply if you need anything else.\n\n[No reply. Nobody asked why she wanted to change it.]\n"}', NULL, 'Reported', '2026-11-14T09:18:52.001Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_emails/2026-09-22_stefan_case_study.txt', 'B', NULL, 'email', 'emails/2026-09-22_stefan_case_study.txt', 'emails/2026-09-22_stefan_case_study.txt', 'get_all_paperwork', NULL, '{"path":"emails/2026-09-22_stefan_case_study.txt","kind":"email","text":"From: Stefan Roy\nTo: Sam (FlytBase)\nDate: 22 September 2026\nSubject: Case study\n\nSam,\n\nI want a case study for our sister company. They have 40 plants and they are watching what we do\nhere. Two pages, the headline saving on the front. When can I see a draft?\n\nStefan\n"}', NULL, 'Reported', '2026-11-14T09:18:52.002Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_emails/2026-10-08_finance_mailbox.txt', 'B', NULL, 'email', 'emails/2026-10-08_finance_mailbox.txt', 'emails/2026-10-08_finance_mailbox.txt', 'get_all_paperwork', NULL, '{"path":"emails/2026-10-08_finance_mailbox.txt","kind":"email","text":"From: Group Finance (shared mailbox), Aldermoor Industrial Group\nTo: Sam (FlytBase)\nDate: 8 October 2026\nSubject: Renewal quote, drone docks\n\nHello,\n\nWe understand the dock contract renews at the end of January. Before a renewal is raised, please\nsend the quote in a form that shows the cost for each plant.\n\nGroup Finance\n\n[Unsigned. No reply on file.]\n"}', NULL, 'Reported', '2026-11-14T09:18:52.003Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_flights.csv', 'A', NULL, 'paperwork', 'flights.csv', 'flights.csv', 'get_all_paperwork', NULL, '{"path":"flights.csv","kind":"flights","text":"flight_id,date,start_time,dock_id,duration_min,mode,result,note\nAD-F00001,2026-05-01,02:18,AD-02,20,scheduled,completed,\nAD-F00002,2026-05-01,02:45,AD-10,23,scheduled,completed,\nAD-F00003,2026-05-01,23:47,AD-05,16,scheduled,completed,\nAD-F00004,2026-05-02,00:33,AD-05,22,scheduled,completed,\nAD-F00005,2026-05-02,03:55,AD-10,22,scheduled,completed,\nAD-F00006,2026-05-02,21:57,AD-08,23,scheduled,completed,\nAD-F00007,2026-05-03,01:13,AD-10,21,scheduled,completed,\nAD-F00008,2026-05-03,01:43,AD-08,19,scheduled,completed,\nAD-F00009,2026-05-03,21:45,AD-02,20,scheduled,completed,\nAD-F00010,2026-05-03,23:06,AD-05,16,scheduled,completed,\nAD-F00011,2026-05-04,00:59,AD-08,22,scheduled,completed,\nAD-F00012,2026-05-04,01:57,AD-10,16,scheduled,completed,\nAD-F00013,2026-05-04,03:11,AD-02,22,scheduled,completed,\nAD-F00014,2026-05-05,03:21,AD-10,19,scheduled,completed,\nAD-F00015,2026-05-05,10:43,AD-01,5,manual,completed,\nAD-F00016,2026-05-05,2', NULL, 'Reported', '2026-11-14T09:17:45.737Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_mail_log.json', 'A', NULL, 'paperwork', 'mail_log.json', 'mail_log.json', 'get_all_paperwork', NULL, '{"path":"mail_log.json","kind":"mail_log","data":{"note":"Every email on file for the account, oldest first: written by people, and sent automatically by the platform. The threads in emails/ are listed here by path.","mail":[{"thread":"T001","kind":"person","date":"2025-09-09","from":"Achal Negi (FlytBase)","to":"Stefan Roy","subject":"Trial proposal","body":"Stefan,\n\nThe trial proposal is attached: 2 docks at two plants, October to December.\n\nAchal"},{"thread":"T001","kind":"person","date":"2025-09-12","from":"Stefan Roy","to":"Achal Negi (FlytBase)","subject":"RE: Trial proposal","body":"Agreed. My deputy will run it on our side.\n\nStefan"},{"thread":"T002","kind":"person","date":"2026-01-16","from":"Achal Negi (FlytBase)","to":"Stefan Roy","subject":"Order form signed: next steps","body":"Stefan,\n\nThank you for the signed order form. Our rollout lead will write to your office about install dates.\n\nAchal"},{"thread":"T032","kind":"automatic","date":"2026-02-01","from":"FlytB', NULL, 'Reported', '2026-11-14T09:17:45.740Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_tickets.json', 'A', NULL, 'paperwork', 'tickets.json', 'tickets.json', 'get_all_paperwork', NULL, '{"path":"tickets.json","kind":"tickets","data":{"note":"Every support ticket on the account, oldest first. Ticket numbers run across all FlytBase customers. requests.csv is customer success''s own list of what it was tracking at the handover, which also holds requests that never became tickets.","tickets":[{"id":"FB-10085","opened":"2026-02-12","requester":"FlytBase rollout lead","subject":"Survey sheet for dock positions, for the customer''s plant visits","category":"request","status":"Closed","closed":"2026-02-13","assignee":"Support desk","first_response_hours":null,"conversation":[{"date":"2026-02-12","from":"FlytBase rollout lead","text":"Survey sheet for dock positions, for the customer''s plant visits."},{"date":"2026-02-13","from":"Support desk","text":"Sheet sent to the customer''s rollout lead."}]},{"id":"FB-10121","opened":"2026-02-26","requester":"Group security office","subject":"An operator login for each plant as it goes live","category":"accounts","status":"Closed","closed"', NULL, 'Reported', '2026-11-14T09:17:45.743Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_A_calls_2025-06-24_enquiry_call_txt', 'A', NULL, 'call', 'calls/2025-06-24_enquiry_call.txt', 'calls/2025-06-24_enquiry_call.txt', 'get_all_paperwork', NULL, 'ENQUIRY CALL: NOTES
Date: 24 June 2025
Written up by: the FlytBase deal team
Present for the customer: Rhys Calder (alliance drone programme lead)
Present for FlytBase: Achal Negi

Background
- The alliance office runs some programmes jointly for four county forces: Westmere, Metro Central,
  Tarn Valley and Norwold. Drones are one of them.
- Rhys Calder leads the drone programme from the alliance office.

What the customer asked for
- Docks, so a drone can be launched without an officer travelling to the site.
- A pilot before any larger purchase. Westmere''s drone unit has flown drones the longest and would
  host it.

Not discussed
- How a larger purchase would be paid for.
- The other three forces. Rhys Calder spoke for all four.

Actions
- FlytBase: pilot proposal. Done July 2025.
- Rhys Calder: introduce the inspector who runs Westmere''s drone unit. Done September 2025.
', NULL, 'Reported', '2026-11-14T09:20:40.980Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_A_calls_2025-09-02_pilot_scoping_txt', 'A', NULL, 'call', 'calls/2025-09-02_pilot_scoping.txt', 'calls/2025-09-02_pilot_scoping.txt', 'get_all_paperwork', NULL, 'PILOT SCOPING CALL: NOTES
Date: 2 September 2025
Written up by: the FlytBase deal team
Present for the customer: Rhys Calder (alliance drone programme lead); Insp. Karen Mbeki (Westmere drone unit)
Present for FlytBase: Achal Negi; a solutions engineer

Pilot
- 6 docks, all at Westmere, 15 September to 12 December 2025.
- Insp. Mbeki chooses the sites. She wants them near the places her unit is called to most.
- Pilot fee 30,000, credited against a first-year order if one follows.

How the pilot will be judged
- Rhys Calder: the unit using the docks, and footage he can show the board.
- No other measure was set.

Support during the pilot
- Insp. Mbeki asked who she calls when something breaks. Answer for the pilot: the solutions
  engineer directly. After the pilot: the support desk.

Actions
- FlytBase: install 6 docks by 15 September. Done.
- Insp. Mbeki: sites and site access. Done.
', NULL, 'Reported', '2026-11-14T09:20:40.983Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_A_calls_2025-10-21_pilot_midpoint_txt', 'A', NULL, 'call', 'calls/2025-10-21_pilot_midpoint.txt', 'calls/2025-10-21_pilot_midpoint.txt', 'get_all_paperwork', NULL, 'PILOT MID-POINT CALL: NOTES
Date: 21 October 2025
Written up by: a FlytBase solutions engineer
Present for the customer: Insp. Karen Mbeki (Westmere drone unit)
Present for FlytBase: a solutions engineer

Faults
- Two docks needed an engineer visit in the first month. Both fixed, nothing open.

Use
- Insp. Mbeki: the unit uses the docks most days now. Mostly support to patrols.
- She asked for a second training session for officers joining the rota.

Other
- Rhys Calder was not on this call.

Actions
- FlytBase: second training session for Westmere. Done 4 November 2025.
', NULL, 'Reported', '2026-11-14T09:20:40.985Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_A_calls_2025-12-16_pilot_review_txt', 'A', NULL, 'call', 'calls/2025-12-16_pilot_review.txt', 'calls/2025-12-16_pilot_review.txt', 'get_all_paperwork', NULL, 'PILOT REVIEW CALL: NOTES
Date: 16 December 2025
Written up by: the FlytBase deal team
Present for the customer: Rhys Calder (alliance drone programme lead); Insp. Karen Mbeki (Westmere drone
unit); the alliance procurement lead (joined for the second half; name not recorded)
Present for FlytBase: Achal Negi; a solutions engineer

Pilot
- 6 docks at Westmere, 15 September to 12 December.
- Insp. Mbeki: her unit used the docks most days after the first fortnight. Mostly patrol support.
  She wants more docks at Westmere whatever the other forces decide.
- Two docks needed a visit in the first month. No open faults at the end.

What the customer wants next
- Rhys Calder: the alliance wants all four forces in from the start, not Westmere alone. The alliance
  office will place one order for the four forces.
- Rhys Calder will give the number of docks for each force. FlytBase did not speak to the other
  three forces during the pilot.

Procurement
- The procurement lead asked how the pilot was bought and how a larger purchase would be structured.
- She said anything larger than this order would have to go through a formal process and asked to
  be kept informed.

Actions
- FlytBase: order form for 35 docks to the alliance office. Done 20 January 2026.
- Rhys Calder: dock numbers and sites for each force. Done.
- Keep the procurement lead informed. Owner: none recorded.
', NULL, 'Reported', '2026-11-14T09:20:40.987Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_A_calls_2026-01-13_order_call_txt', 'A', NULL, 'call', 'calls/2026-01-13_order_call.txt', 'calls/2026-01-13_order_call.txt', 'get_all_paperwork', NULL, 'ORDER CALL: NOTES
Date: 13 January 2026
Written up by: the FlytBase deal team
Present for the customer: Rhys Calder (alliance drone programme lead)
Present for FlytBase: Achal Negi

Order
- 35 docks for the four forces, one order, placed and signed by the alliance office.
- Rhys Calder supplied the number of docks for each force and the sites. These went to the field
  team for the install sheets.
- One year, 1 March 2026 to 28 February 2027. No automatic renewal.

Invoicing
- The alliance office asked for the order to be invoiced in four parts. The addresses and the split
  go to FlytBase Accounts as Schedule 2.

Not on the call
- The alliance procurement lead, who joined the pilot review in December.
- Anyone from the forces.

Actions
- FlytBase: order form to the alliance office. Done 20 January 2026.
- Rhys Calder: invoicing instructions to FlytBase Accounts. Done.
', NULL, 'Reported', '2026-11-14T09:20:40.988Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_A_calls_2026-02-17_install_kickoff_txt', 'A', NULL, 'call', 'calls/2026-02-17_install_kickoff.txt', 'calls/2026-02-17_install_kickoff.txt', 'get_all_paperwork', NULL, 'INSTALLATION KICK-OFF: NOTES
Date: 17 February 2026
Written up by: the FlytBase onboarding lead
Present for the customer: Rhys Calder (alliance drone programme lead)
Present for FlytBase: the onboarding lead

Plan
- 35 docks in March and April.
- Site access goes through the programme office. It sends an escort on each install day.
- Operators are trained on the day their dock is installed.

Asked and answered
- The onboarding lead asked for a day-to-day contact at each force. Rhys Calder: use the programme
  office; it coordinates the four forces.

Actions
- FlytBase: install schedule. Done.
- Rhys Calder: site access for each install day. Done.
', NULL, 'Reported', '2026-11-14T09:20:40.990Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_A_calls_2026-04-28_install_close_txt', 'A', NULL, 'call', 'calls/2026-04-28_install_close.txt', 'calls/2026-04-28_install_close.txt', 'get_all_paperwork', NULL, 'INSTALLATION CLOSE CALL: NOTES
Date: 28 April 2026
Written up by: the FlytBase onboarding lead, for the handover to customer success
Present for the customer: Rhys Calder (alliance drone programme lead)
Present for FlytBase: the onboarding lead

Status
- 35 docks installed and commissioned, the last on 24 April.
- Every dock flew a commissioning flight on its install day.
- Operators were trained at every site on install day.

Left open
- No plan for how each force will use its docks was shared with us. Rhys Calder: each force decides
  its own use.
- The install sheets (which dock is at which site) stay with the field team. Not copied to the
  customer success record.

Handover note to customer success
- Every contact so far has been through the programme office. We have not spoken to a force
  directly since the pilot, except Westmere''s drone unit.
', NULL, 'Reported', '2026-11-14T09:20:40.993Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_A_calls_2026-05-19_intro_call_txt', 'A', NULL, 'call', 'calls/2026-05-19_intro_call.txt', 'calls/2026-05-19_intro_call.txt', 'get_all_paperwork', NULL, 'CALL TRANSCRIPT (auto-recorded, tidied)
Date: 19 May 2026
On the call: Sam (FlytBase, CSM); Rhys Calder (alliance drone programme lead)

Sam: Thanks for making time. I have just picked up the account, so I wanted to hear how the rollout
looks from your side.
Rhys: It is going really well. Thirty-five docks in, the board is pleased, and all four forces are keen.
Sam: Good. I can see plenty of flying on some docks and none yet on others. Is that expected this
early?
Rhys: Completely. Some forces move faster than others. They will all get there.
Sam: Could you introduce me to someone at each force? It would help to have a contact for day-to-day
questions.
Rhys: Honestly, the simplest thing is to go through me. I coordinate the four forces, that is what
the programme office is for. Karen at Westmere you already know.
Sam: Understood. I will come to you first. If something operational comes up at one of the others,
who would I ask?
Rhys: Me. I will route it.
Sam: Fine. I will send a monthly usage summary so we are looking at the same numbers.
Rhys: Great. The board loves a chart.

Follow-ups noted by Sam
- Monthly usage summary to Rhys. (Sent for May and June. Not sent after that.)
- Contacts at the other three forces: not offered.
', NULL, 'Reported', '2026-11-14T09:20:40.995Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_A_calls_2026-06-02_check_in_txt', 'A', NULL, 'call', 'calls/2026-06-02_check_in.txt', 'calls/2026-06-02_check_in.txt', 'get_all_paperwork', NULL, 'CALL TRANSCRIPT (auto-recorded, tidied)
Date: 2 June 2026
On the call: Sam (FlytBase, CSM); Rhys Calder (alliance drone programme lead)

Sam: I sent the May summary yesterday. Did the chart do the job?
Rhys: The board loved it. Next time, can you split it by force?
Sam: I can split it by dock. I do not have which dock is at which force on my side.
Rhys: I will dig the list out for you.
Sam: Thank you. One thing in the numbers: a fair number of the docks did not fly at all in May.
Rhys: Early days. Forces come on stream at different speeds. All four forces are keen.
Sam: Is anything getting in the operators'' way? Anything we should fix?
Rhys: Nothing has reached me.
Sam: I will send June at the start of July.

Follow-ups noted by Sam
- Dock-by-force list from Rhys Calder. (Not received.)
- June usage summary. (Sent 1 July.)
', NULL, 'Reported', '2026-11-14T09:20:40.996Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_A_calls_2026-06-30_check_in_txt', 'A', NULL, 'call', 'calls/2026-06-30_check_in.txt', 'calls/2026-06-30_check_in.txt', 'get_all_paperwork', NULL, 'CALL TRANSCRIPT (auto-recorded, tidied)
Date: 30 June 2026
On the call: Sam (FlytBase, CSM); Rhys Calder (alliance drone programme lead)

Sam: June goes to you tomorrow. The headline is the same as May: a small number of docks do most of
the flying.
Rhys: That will be Westmere. They are the old hands.
Sam: Could we look at what would help the others get started? A refresher, a visit, anything.
Rhys: They will get there. I would rather not push them.
Sam: Understood. Is the board still happy?
Rhys: Very. It meets on the fourteenth and I have your chart in the pack.
Sam: Good. When are you away over the summer?
Rhys: The third to the fourteenth of August.

Follow-ups noted by Sam
- June usage summary. (Sent 1 July.)
- Next call after Rhys Calder''s leave.
', NULL, 'Reported', '2026-11-14T09:20:40.998Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_A_calls_2026-07-22_check_in_txt', 'A', NULL, 'call', 'calls/2026-07-22_check_in.txt', 'calls/2026-07-22_check_in.txt', 'get_all_paperwork', NULL, 'CALL TRANSCRIPT (auto-recorded, tidied)
Date: 22 July 2026
On the call: Sam (FlytBase, CSM); Rhys Calder (alliance drone programme lead)

Rhys: Big news since we last spoke. The alliance is preparing a framework tender. Up to 300 docks.
The spec is being finalised.
Sam: That is a large step from 35. Who is writing the specification?
Rhys: The team is on it. I will keep you posted.
Sam: Is there anything we should be sending them? Technical detail, how the 35 are doing?
Rhys: Leave that with me for now. When they need something I will ask.
Sam: On the 35: several docks still have not flown a single mission since install. They are online
every day. Is something holding those forces back?
Rhys: Teething. All four forces are keen, I promise you.
Sam: And the renewal in February, should I expect a process on your side?
Rhys: The alliance has the budget. It will not be a problem.
Sam: Last thing. There is a document request in our support queue from one of the forces. I cannot tell
from my side who sent it. Does that ring a bell?
Rhys: Not with me. If it mattered I would have heard.

Follow-ups noted by Sam
- Find out who is writing the tender specification. (No further note.)
- Look into the open document request. (No further note.)
', NULL, 'Reported', '2026-11-14T09:20:40.999Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_A_calls_2026-08-19_check_in_txt', 'A', NULL, 'call', 'calls/2026-08-19_check_in.txt', 'calls/2026-08-19_check_in.txt', 'get_all_paperwork', NULL, 'CALL TRANSCRIPT (auto-recorded, tidied)
Date: 19 August 2026
On the call: Sam (FlytBase, CSM); Rhys Calder (alliance drone programme lead)

Sam: Welcome back. I owe you the July summary. It did not go out.
Rhys: No matter. Send July and August together.
Sam: On the tender you mentioned: is there a timetable yet?
Rhys: The spec is being finalised. It is in hand.
Sam: Two things from Westmere while you were away. The unit asked for training for new operators
and we ran a session on the second. And Karen has written to me about batteries on two docks.
Rhys: Karen always has a list. It means they are using the kit.
Sam: I will come back to her.
Rhys: Good. Anything else?
Sam: Not today.

Follow-ups noted by Sam
- July and August usage summaries together. (Not sent.)
- Reply to Insp. Mbeki about the batteries. (No reply on file.)
', NULL, 'Reported', '2026-11-14T09:20:41.000Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_A_calls_2026-09-09_check_in_txt', 'A', NULL, 'call', 'calls/2026-09-09_check_in.txt', 'calls/2026-09-09_check_in.txt', 'get_all_paperwork', NULL, 'CALL TRANSCRIPT (auto-recorded, tidied)
Date: 9 September 2026
On the call: Sam (FlytBase, CSM); Rhys Calder (alliance drone programme lead)

Sam: Thank you for the reply last week. I would still like to hear from the forces that are not
flying, even for ten minutes.
Rhys: After the programme board. I will raise it there.
Sam: When does it meet?
Rhys: October.
Sam: The renewal is under six months away. Docks that have never flown will come up in that
conversation, with us and I expect on your side too.
Rhys: The alliance has the budget. I am not worried about the renewal.
Sam: I would rather we both knew the reason before someone asks.
Rhys: Leave it with me.

Follow-ups noted by Sam
- Rhys Calder: raise the unused docks at the October programme board. (No outcome on file.)
', NULL, 'Reported', '2026-11-14T09:20:41.002Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_A_calls_2026-10-06_check_in_txt', 'A', NULL, 'call', 'calls/2026-10-06_check_in.txt', 'calls/2026-10-06_check_in.txt', 'get_all_paperwork', NULL, 'CALL TRANSCRIPT (auto-recorded, tidied)
Date: 6 October 2026
On the call: Sam (FlytBase, CSM); Rhys Calder (alliance drone programme lead)

Rhys: I have another one for you. Westmere''s stadium project. It is a 30-dock opportunity.
Sam: Thirty docks at one site? Who is behind it at Westmere?
Rhys: It has come from the top of the force. I would like a quote I can put in front of people.
Sam: I will need to take that to our commercial team before anything is quoted.
Rhys: A number on paper gets things moving.
Sam: Has Karen''s unit been involved?
Rhys: Karen is busy flying. I will bring her in at the right moment.
Sam: And the tender, any change?
Rhys: Spec being finalised. It is in hand.
Sam: I still do not have a name for whoever is writing it.
Rhys: You have me.

Follow-ups noted by Sam
- Stadium: no quote issued.
- Ask Karen Mbeki directly about the stadium. (Not done before the handover.)
', NULL, 'Reported', '2026-11-14T09:20:41.003Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_A_calls_2026-10-20_check_in_txt', 'A', NULL, 'call', 'calls/2026-10-20_check_in.txt', 'calls/2026-10-20_check_in.txt', 'get_all_paperwork', NULL, 'CALL TRANSCRIPT (auto-recorded, tidied)
Date: 20 October 2026
On the call: Sam (FlytBase, CSM); Rhys Calder (alliance drone programme lead)

Rhys: Where is my stadium quote?
Sam: There is not one yet. It is with our commercial team.
Rhys: I need a number to get people in a room.
Sam: I understand. Could I speak to Karen about it? Her unit would be flying them.
Rhys: Let me set that up.
Sam: Thank you. On the renewal, I will write this month with the term dates so it is in front of
you in good time.
Rhys: Fine. It will go through.
Sam: Did the unused docks come up at the programme board?
Rhys: We ran out of time. Next one.

Follow-ups noted by Sam
- Rhys Calder: set up a call with Insp. Mbeki about the stadium. (Not set up before the handover.)
- Sam: renewal email with the term dates. Sent 28 October.
', NULL, 'Reported', '2026-11-14T09:20:41.004Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_A_calls_index_json', 'A', NULL, 'calls_index', 'calls_index.json', 'calls_index.json', 'get_all_paperwork', NULL, '{"note":"Every call on file, oldest first, with its summary and actions. `path` is the notes or transcript where one was kept; a call with no path was summarised only.","calls":[{"date":"2025-06-24","path":"calls/2025-06-24_enquiry_call.txt","title":"Enquiry call","record":"notes","actions":["FlytBase: pilot proposal. Done July 2025.","Rhys Calder: introduce the inspector who runs Westmere''s drone unit. Done September 2025."],"summary":"First call. The alliance office runs a joint drone programme for four county forces and wants docks. A pilot was asked for before any larger purchase, hosted by Westmere''s drone unit.","customer":["Rhys Calder"],"flytbase":["Achal Negi"]},{"date":"2025-09-02","path":"calls/2025-09-02_pilot_scoping.txt","title":"Pilot scoping call","record":"notes","actions":["FlytBase: install 6 docks by 15 September. Done.","Insp. Mbeki: sites and site access. Done."],"summary":"Pilot agreed: 6 docks at Westmere, 15 September to 12 December 2025, at sites chosen by Insp. Mbeki. Success was described as the unit using the docks and footage for the board; no other measure was set.","customer":["Rhys Calder","Insp. Karen Mbeki"],"flytbase":["Achal Negi","a solutions engineer"]},{"date":"2025-10-21","path":"calls/2025-10-21_pilot_midpoint.txt","title":"Pilot mid-point call","record":"notes","actions":["FlytBase: second training session for Westmere. Done 4 November 2025."],"summary":"Mid-point of the pilot. Two docks needed an engineer visit in the first month; b', NULL, 'Reported', '2026-11-14T09:20:41.005Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_A_contract_txt', 'A', 'contract_deal_A', 'contract', 'contract.txt', 'contract.txt', 'get_all_paperwork', NULL, 'ORDER FORM SUMMARY (customer success copy)
Customer: Eastern Counties Police Alliance, alliance office, for its member forces
Signed: 20 January 2026, by the alliance office
Currency: pounds sterling

What was ordered
- 35 docks with aircraft, and the FlytBase platform for all of them.
- Installation and commissioning at sites named by the forces.
- Initial operator training at installation. Further training is quoted separately.

Price and term
- 350,000 a year.
- Term: 1 March 2026 to 28 February 2027.
- No automatic renewal. A renewal needs a new order before the term ends.

Invoicing
- One order. At the alliance office''s instruction it is invoiced in four parts.
- The billing addresses and the split are in Schedule 2, held by Accounts. Schedule 2 was not copied
  to customer success.
- All four invoices for the first year are paid.

Support
- Standard support: support desk in business hours, tickets answered in order of arrival.
- No named support contact and no out-of-hours cover.

Data
- Standard data processing terms (Schedule 3).
- Customer-specific documentation is supplied on request.

Not covered by this order
- Any commitment about a future tender or framework.
- Docks beyond the 35.
', NULL, 'Verified', '2026-11-14T09:20:41.007Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_A_deal_history_json', 'A', NULL, 'deal_history', 'deal_history.json', 'deal_history.json', 'get_all_paperwork', NULL, '{"note":"Stages and values from this morning are in your own export, not here.","account":"A","history":[{"date":"2025-06","what":"Enquiry","detail":"Rhys Calder, from the alliance office, asked about docks for the alliance''s joint drone programme."},{"date":"2025-09-15","what":"Pilot starts","detail":"6 docks, hosted by Westmere''s drone unit. Pilot fee 30,000, credited against the first year."},{"date":"2025-12-12","what":"Pilot ends"},{"date":"2025-12-16","what":"Pilot review call","detail":"See calls/2025-12-16_pilot_review.txt. Outcome: the alliance office to place one order for all four forces."},{"date":"2026-01-20","what":"Order form signed","value":350000,"detail":"35 docks and the platform, 350,000 a year, signed by the alliance office."},{"date":"2026-03-01","what":"Term starts","detail":"Invoiced in four parts on the alliance office''s instruction. All four parts paid."},{"date":"2026-03 to 2026-04","what":"Installation","detail":"35 docks installed across the four forces."},{"date":"2026-05","what":"Handover to customer success","detail":"Sam becomes CSM."},{"date":"2026-07","what":"Tender first mentioned","detail":"Rhys Calder says the alliance is preparing a framework tender for up to 300 docks. Nothing in writing from the alliance."},{"date":"2026-10","what":"Stadium first mentioned","detail":"Rhys Calder says Westmere''s stadium project is a 30-dock opportunity and asks for a quote. No quote issued."},{"date":"2026-11","what":"CSM change","detail":"Sam moves tea', NULL, 'Reported', '2026-11-14T09:20:41.013Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_A_device_events_csv', 'A', NULL, 'device_events', 'device_events.csv', 'device_events.csv', 'get_all_paperwork', NULL, 'date,time,dock_id,event,detail
2026-05-01,22:12,ECPA-D24,connection_lost,
2026-05-01,22:51,ECPA-D24,connection_restored,
2026-05-02,21:18,ECPA-D28,connection_lost,
2026-05-02,21:55,ECPA-D28,connection_restored,
2026-05-02,21:57,ECPA-D26,connection_lost,
2026-05-02,22:13,ECPA-D26,connection_restored,
2026-05-03,09:33,ECPA-D06,connection_lost,
2026-05-03,10:04,ECPA-D06,connection_restored,
2026-05-07,00:41,ECPA-D02,connection_lost,
2026-05-07,00:46,ECPA-D02,connection_restored,
2026-05-07,12:23,ECPA-D05,connection_lost,
2026-05-07,12:53,ECPA-D05,connection_restored,
2026-05-14,22:46,ECPA-D20,connection_lost,
2026-05-14,22:54,ECPA-D20,connection_restored,
2026-05-18,10:23,ECPA-D18,connection_lost,
2026-05-18,10:35,ECPA-D18,connection_restored,
2026-05-20,03:01,ECPA-D01,software_update,
2026-05-20,03:01,ECPA-D02,software_update,
2026-05-20,03:06,ECPA-D07,software_update,
2026-05-20,03:09,ECPA-D10,software_update,
2026-05-20,03:09,ECPA-D30,software_update,
2026-05-20,03:09,ECPA-D33,software_update,
2026-05-20,03:11,ECPA-D16,software_update,
2026-05-20,03:14,ECPA-D25,software_update,
2026-05-20,03:16,ECPA-D31,software_update,
2026-05-20,03:18,ECPA-D18,software_update,
2026-05-20,03:19,ECPA-D15,software_update,
2026-05-20,03:20,ECPA-D09,software_update,
2026-05-20,03:20,ECPA-D13,software_update,
2026-05-20,03:20,ECPA-D26,software_update,
2026-05-20,03:22,ECPA-D06,software_update,
2026-05-20,03:23,ECPA-D12,software_update,
2026-05-20,03:23,ECPA-D19,software_update,
2026-05-20,03:23,E', NULL, 'Reported', '2026-11-14T09:20:41.014Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_A_devices_json', 'A', NULL, 'devices', 'devices.json', 'devices.json', 'get_all_paperwork', NULL, '{"note":"Docks registered to this account, with the date each was commissioned under the current order (docks from a pilot or trial were commissioned again). Which site each dock sits at is not in this record.","docks":[{"model":"Standard dock, 2025 model","dock_id":"ECPA-D01","software":"2026.09","dock_serial":"FBD85X83015","commissioned":"2026-04-10","aircraft_serial":"FBA21W61554","last_seen_online":"2026-11-13"},{"model":"Standard dock, 2025 model","dock_id":"ECPA-D02","software":"2026.09","dock_serial":"FBD48V81837","commissioned":"2026-03-05","aircraft_serial":"FBA90F76662","last_seen_online":"2026-11-13"},{"model":"Standard dock, 2025 model","dock_id":"ECPA-D03","software":"2026.09","dock_serial":"FBD64P42217","commissioned":"2026-04-10","aircraft_serial":"FBA76J50626","last_seen_online":"2026-11-13"},{"model":"Standard dock, 2025 model","dock_id":"ECPA-D04","software":"2026.09","dock_serial":"FBD24D68126","commissioned":"2026-04-13","aircraft_serial":"FBA78V25222","last_seen_online":"2026-11-13"},{"model":"Standard dock, 2025 model","dock_id":"ECPA-D05","software":"2026.09","dock_serial":"FBD97S62634","commissioned":"2026-03-11","aircraft_serial":"FBA13P43871","last_seen_online":"2026-11-13"},{"model":"Standard dock, 2025 model","dock_id":"ECPA-D06","software":"2026.09","dock_serial":"FBD41S25613","commissioned":"2026-04-06","aircraft_serial":"FBA74X73739","last_seen_online":"2026-11-13"},{"model":"Standard dock, 2025 model","dock_id":"ECPA-D07","software":"2026.09","', NULL, 'Reported', '2026-11-14T09:20:41.016Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_A_emails_2026-07-09_rhys_tender_txt', 'A', NULL, 'email', 'emails/2026-07-09_rhys_tender.txt', 'emails/2026-07-09_rhys_tender.txt', 'get_all_paperwork', NULL, 'From: Rhys Calder
To: Sam (FlytBase)
Date: 9 July 2026
Subject: Something big coming

Sam,

A heads-up before our call. The alliance is preparing a framework tender for up to 300 docks. The
spec is being finalised. I wanted you to hear it from me first.

Keep it to yourselves for now.

Rhys
', NULL, 'Reported', '2026-11-14T09:20:41.017Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_A_emails_2026-08-11_karen_batteries_txt', 'A', NULL, 'email', 'emails/2026-08-11_karen_batteries.txt', 'emails/2026-08-11_karen_batteries.txt', 'get_all_paperwork', NULL, 'From: Insp. Karen Mbeki
To: Sam (FlytBase)
Date: 11 August 2026
Subject: Batteries on two docks

Sam,

Two of our docks have batteries that will not last a night shift any more. We are swapping aircraft
between docks to cope, which is not what my officers'' time is for.

Who do I talk to about this? I would rather not fill in a form and wait.

Karen Mbeki
Westmere drone unit

[No reply on file.]
', NULL, 'Reported', '2026-11-14T09:20:41.018Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_A_emails_2026-09-03_usage_question_txt', 'A', NULL, 'email', 'emails/2026-09-03_usage_question.txt', 'emails/2026-09-03_usage_question.txt', 'get_all_paperwork', NULL, 'From: Sam (FlytBase)
To: Rhys Calder
Date: 3 September 2026
Subject: Docks that have not flown

Rhys,

Looking at the summer: a good number of the 35 docks are online every day and have still flown
nothing, or only the odd training flight. I would like to understand why before the renewal
conversation. Could we set up a short call with the forces concerned?

Sam

---
From: Rhys Calder
To: Sam (FlytBase)
Date: 4 September 2026
Subject: RE: Docks that have not flown

Sam, I would not read too much into it. All four forces are keen. Different forces, different
pace. No need to trouble them with calls. I will pick it up at the next programme board.

Rhys
', NULL, 'Reported', '2026-11-14T09:20:41.019Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_A_emails_2026-10-02_rhys_stadium_txt', 'A', NULL, 'email', 'emails/2026-10-02_rhys_stadium.txt', 'emails/2026-10-02_rhys_stadium.txt', 'get_all_paperwork', NULL, 'From: Rhys Calder
To: Sam (FlytBase)
Date: 2 October 2026
Subject: Stadium

Sam,

Westmere''s stadium project is a 30-dock opportunity. Can we talk Tuesday? I will want a quote
quickly.

Rhys
', NULL, 'Reported', '2026-11-14T09:20:41.020Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_A_emails_2026-10-28_renewal_txt', 'A', NULL, 'email', 'emails/2026-10-28_renewal.txt', 'emails/2026-10-28_renewal.txt', 'get_all_paperwork', NULL, 'From: Sam (FlytBase)
To: Rhys Calder
Date: 28 October 2026
Subject: Renewal, term ends 28 February

Rhys,

The current term ends on 28 February and there is no automatic renewal, so we will need a new order
before then. Who signs it on your side, and does each force need to do anything?

Sam

---
From: Rhys Calder
To: Sam (FlytBase)
Date: 30 October 2026
Subject: RE: Renewal, term ends 28 February

The alliance has the budget. Same as last time: send it to the programme office and I will
walk it through.

Rhys
', NULL, 'Reported', '2026-11-14T09:20:41.021Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_A_flights_csv', 'A', NULL, 'flights', 'flights.csv', 'flights.csv', 'get_all_paperwork', NULL, 'flight_id,date,start_time,dock_id,duration_min,mode,result,note
ECPA-F00001,2026-05-01,01:09,ECPA-D33,10,manual,returned_early,operator recall
ECPA-F00002,2026-05-01,11:03,ECPA-D30,15,manual,completed,
ECPA-F00003,2026-05-01,11:58,ECPA-D13,22,manual,completed,
ECPA-F00004,2026-05-01,13:09,ECPA-D07,7,manual,returned_early,operator recall
ECPA-F00005,2026-05-01,15:44,ECPA-D03,18,manual,completed,
ECPA-F00006,2026-05-01,21:25,ECPA-D28,19,manual,completed,
ECPA-F00007,2026-05-01,21:36,ECPA-D20,12,scheduled,completed,
ECPA-F00008,2026-05-02,08:12,ECPA-D21,25,scheduled,completed,
ECPA-F00009,2026-05-02,11:55,ECPA-D02,23,scheduled,completed,
ECPA-F00010,2026-05-02,13:51,ECPA-D12,10,manual,completed,
ECPA-F00011,2026-05-02,21:00,ECPA-D02,24,manual,completed,
ECPA-F00012,2026-05-03,07:04,ECPA-D21,24,manual,completed,
ECPA-F00013,2026-05-03,09:44,ECPA-D08,12,manual,completed,
ECPA-F00014,2026-05-03,10:26,ECPA-D03,19,manual,completed,
ECPA-F00015,2026-05-03,11:00,ECPA-D27,17,scheduled,completed,
ECPA-F00016,2026-05-03,16:40,ECPA-D17,5,scheduled,returned_early,low battery
ECPA-F00017,2026-05-03,18:40,ECPA-D26,10,manual,completed,
ECPA-F00018,2026-05-04,08:41,ECPA-D21,19,manual,completed,
ECPA-F00019,2026-05-04,08:51,ECPA-D08,10,scheduled,completed,
ECPA-F00020,2026-05-04,18:45,ECPA-D06,14,manual,completed,
ECPA-F00021,2026-05-04,19:08,ECPA-D12,17,manual,completed,
ECPA-F00022,2026-05-04,20:12,ECPA-D07,9,manual,completed,
ECPA-F00023,2026-05-04,22:16,ECPA-D16,21,manual,completed,
ECPA-F00', NULL, 'Reported', '2026-11-14T09:20:41.022Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_A_internal_notes_json', 'A', NULL, 'internal_notes', 'internal_notes.json', 'internal_notes.json', 'get_all_paperwork', NULL, '{"note":"Notes about the account from FlytBase''s internal channel, oldest first. Fictional personas; routine notes only.","notes":[{"date":"2026-01-21","from":"Deal team","text":"ECPA order signed by the alliance office. Invoicing in four parts on their instruction; Schedule 2 is with Accounts."},{"date":"2026-04-28","from":"Onboarding lead","text":"ECPA: all 35 docks commissioned. Install sheets stay with the field team. Every contact has been through the programme office."},{"date":"2026-05-04","from":"Onboarding lead","text":"ECPA passes to customer success. Sam is the CSM."},{"date":"2026-06-30","from":"Support desk","text":"FB-10412 came in on the ECPA account. No account owner on the ticket. Who picks this up?"},{"date":"2026-08-12","from":"Sam","text":"Karen Mbeki emailed about batteries on two Westmere docks. To reply."},{"date":"2026-08-14","from":"Support desk","text":"The requester on FB-10412 has chased. Still no owner."},{"date":"2026-09-04","from":"Sam","text":"Asked Rhys Calder for a call with the forces whose docks do not fly. Declined for now."},{"date":"2026-10-07","from":"Sam","text":"Rhys Calder wants a quote for a stadium project at Westmere, 30 docks. None issued."},{"date":"2026-11-06","from":"Neel Sharma","text":"Sam is moving teams. The ECPA account passes to a new CSM next week."}]}', NULL, 'Reported', '2026-11-14T09:20:41.024Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_A_invoices_json', 'A', NULL, 'invoices', 'invoices.json', 'invoices.json', 'get_all_paperwork', NULL, '{"note":"From FlytBase Accounts. The four parts of the first-year invoice, their addresses and their amounts are in Schedule 2 of the order, which Accounts holds and which was not copied to customer success.","currency":"GBP","invoices":[{"note":"Credited against the first year.","paid":"2025-10-09","what":"Pilot fee, 6 docks","amount":30000,"issued":"2025-09-15","number":"INV-25-0914","status":"Paid"},{"note":"Amount and billing address per Schedule 2.","paid":"2026-03-27","what":"First year, part 1 of 4","amount":null,"issued":"2026-03-01","number":"INV-26-0311","status":"Paid"},{"note":"Amount and billing address per Schedule 2.","paid":"2026-03-27","what":"First year, part 2 of 4","amount":null,"issued":"2026-03-01","number":"INV-26-0312","status":"Paid"},{"note":"Amount and billing address per Schedule 2.","paid":"2026-03-27","what":"First year, part 3 of 4","amount":null,"issued":"2026-03-01","number":"INV-26-0313","status":"Paid"},{"note":"Amount and billing address per Schedule 2.","paid":"2026-03-27","what":"First year, part 4 of 4","amount":null,"issued":"2026-03-01","number":"INV-26-0314","status":"Paid"}],"first_year_total":350000}', NULL, 'Reported', '2026-11-14T09:20:41.025Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_A_mail_log_json', 'A', NULL, 'mail_log', 'mail_log.json', 'mail_log.json', 'get_all_paperwork', NULL, '{"mail":[{"to":"Rhys Calder","body":"Rhys,\n\nThe pilot proposal is attached: 6 docks at Westmere for three months.\n\nAchal","date":"2025-07-08","from":"Achal Negi (FlytBase)","kind":"person","thread":"T001","subject":"Pilot proposal"},{"to":"Achal Negi (FlytBase)","body":"Achal, the programme office is happy to proceed. Westmere will host. I will introduce the inspector who runs their drone unit.\n\nRhys","date":"2025-07-15","from":"Rhys Calder","kind":"person","thread":"T001","subject":"RE: Pilot proposal"},{"to":"Insp. Karen Mbeki","body":"Inspector,\n\nAll six docks passed their checks yesterday and are live.\n\nFor the pilot, call me directly if anything breaks.","date":"2025-09-16","from":"A solutions engineer (FlytBase)","kind":"person","thread":"T002","subject":"Pilot: your six docks are live"},{"to":"A solutions engineer (FlytBase)","body":"Thank you. We will start using them on tomorrow''s late shift.\n\nKaren Mbeki","date":"2025-09-17","from":"Insp. Karen Mbeki","kind":"person","thread":"T002","subject":"RE: Pilot: your six docks are live"},{"to":"A solutions engineer (FlytBase)","body":"Thank you for yesterday''s session. It was what the new starters needed.\n\nKaren Mbeki","date":"2025-11-05","from":"Insp. Karen Mbeki","kind":"person","thread":"T003","subject":"Yesterday''s training"},{"to":"Rhys Calder","body":"Rhys,\n\nThank you for the signed order form. Our onboarding lead will write to you about installation dates. Accounts has your invoicing instructions.\n\n', NULL, 'Reported', '2026-11-14T09:20:41.026Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_A_profile_json', 'A', NULL, 'profile', 'profile.json', 'profile.json', 'get_all_paperwork', NULL, '{"name":"Eastern Counties Police Alliance","sector":"Public safety","account":"A","renewal":{"term_ends":"2027-02-28","annual_value":350000},"currency":"GBP","not_on_file":["A named contact at Metro Central, Tarn Valley or Norwold.","The alliance procurement lead. She attended the pilot review call on 16 Dec 2025; her name was not written down.","Any finance contact, at the alliance or at a force.","Which dock sits at which force. The install sheets were not copied into this record."],"flytbase_side":{"csm":[{"to":"2026-11","who":"sam","from":"2026-05"},{"who":"you","from":"2026-11"}],"commercial_owner":"achal_negi"},"contacts_on_file":[{"id":"rhys_calder","name":"Rhys Calder","note":"Main contact for the whole account. Every call since May 2026 has been with him alone.","role":"Alliance drone programme lead","on_file_since":"2025-06","last_contact_before_handover":"2026-10-30"},{"id":"karen_mbeki","name":"Insp. Karen Mbeki","note":"Hosted the pilot. Her last email to us has no reply on file.","role":"Drone unit inspector, Westmere","on_file_since":"2025-09","last_contact_before_handover":"2026-08-11"}],"what_they_bought":"35 docks and the FlytBase platform, one order placed through the alliance office for the four member forces (Westmere, Metro Central, Tarn Valley, Norwold)."}', NULL, 'Reported', '2026-11-14T09:20:41.027Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_A_requests_csv', 'A', NULL, 'requests', 'requests.csv', 'requests.csv', 'get_all_paperwork', NULL, 'request_id,opened,from,summary,status,owner,last_update,how_it_arrived
FB-10412,2026-06-29,"A contact at one of the forces (details with the support desk)","Document request. The requester has chased. No reply sent.",Open,,2026-08-14,Support ticket
FB-10577,2026-07-15,Westmere drone unit,"Lid sensor fault on Dock 7. Engineer visit, fixed.",Closed,Field team,2026-07-19,Support ticket
FB-10650,2026-07-28,Westmere drone unit,"Asked for training for new operators. One session run.",Closed,Customer success,2026-08-02,Support ticket
FB-10781,2026-08-21,Metro Central operations,"Question about the export format of flight reports. Answered.",Closed,Support desk,2026-08-25,Support ticket
(none),2026-08-11,Insp. Karen Mbeki,"Email about batteries on two docks not lasting a night shift. No reply on file.",Open,,2026-08-11,Email to the CSM
', NULL, 'Reported', '2026-11-14T09:20:41.028Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_B_calls_2026-01-08_order_call_txt', 'B', NULL, 'call', 'calls/2026-01-08_order_call.txt', 'calls/2026-01-08_order_call.txt', 'get_all_paperwork', NULL, 'ORDER CALL: NOTES
Date: 8 January 2026
Written up by: the FlytBase deal team
Present for the customer: Stefan Roy (group head of security)
Present for FlytBase: Achal Negi

Order
- 14 docks, 140,000 a year, one year from 1 February 2026. No automatic renewal.
- Stefan Roy signs. He said it comes from the group security budget.
- One invoice a year, to group security.

Asked and answered
- Stefan Roy asked again whether the order form could state a savings figure. Answer: no. The
  order form quotes none.
- Achal Negi asked whether anyone else at the group needs to see the order. Stefan Roy: no.

Actions
- FlytBase: order form. Done 15 January 2026.
- Stefan Roy: plants and install dates. Done.
', NULL, 'Reported', '2026-11-14T09:20:41.041Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_A_tickets_json', 'A', NULL, 'tickets', 'tickets.json', 'tickets.json', 'get_all_paperwork', NULL, '{"note":"Every support ticket on the account, oldest first. Ticket numbers run across all FlytBase customers. requests.csv is customer success''s own list of what it was tracking at the handover, which also holds requests that never became tickets.","tickets":[{"id":"FB-10120","closed":"2026-02-27","opened":"2026-02-26","status":"Closed","subject":"Operator logins for the first units to be installed","assignee":"Support desk","category":"accounts","requester":"Alliance programme office","conversation":[{"date":"2026-02-26","from":"Alliance programme office","text":"Operator logins for the first units to be installed."},{"date":"2026-02-27","from":"Support desk","text":"Logins created from the list supplied."}],"first_response_hours":4},{"id":"FB-10132","closed":"2026-03-09","opened":"2026-03-04","status":"Closed","subject":"Dock failed the commissioning check: door seal","assignee":"Field team","category":"hardware","requester":"FlytBase field team","conversation":[{"date":"2026-03-04","from":"FlytBase field team","text":"Dock failed the commissioning check: door seal."},{"date":"2026-03-09","from":"Field team","text":"Seal replaced on a second visit. Check passed."}],"first_response_hours":null},{"id":"FB-10167","closed":"2026-03-23","opened":"2026-03-18","status":"Closed","subject":"Dock failed the commissioning check: camera calibration","assignee":"Field team","category":"hardware","requester":"FlytBase field team","conversation":[{"date":"2026-03-18","from":"FlytBase fiel', NULL, 'Reported', '2026-11-14T09:20:41.029Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_A_usage_weekly_csv', 'A', NULL, 'usage', 'usage_weekly.csv', 'usage_weekly.csv', 'get_all_paperwork', NULL, 'week_start,dock_id,flights,days_online
2026-04-27,ECPA-D01,0,7
2026-05-04,ECPA-D01,1,7
2026-05-11,ECPA-D01,1,7
2026-05-18,ECPA-D01,1,7
2026-05-25,ECPA-D01,2,7
2026-06-01,ECPA-D01,0,7
2026-06-08,ECPA-D01,3,7
2026-06-15,ECPA-D01,4,7
2026-06-22,ECPA-D01,0,7
2026-06-29,ECPA-D01,0,7
2026-07-06,ECPA-D01,2,7
2026-07-13,ECPA-D01,3,7
2026-07-20,ECPA-D01,2,7
2026-07-27,ECPA-D01,1,7
2026-08-03,ECPA-D01,3,7
2026-08-10,ECPA-D01,2,7
2026-08-17,ECPA-D01,1,7
2026-08-24,ECPA-D01,2,7
2026-08-31,ECPA-D01,1,7
2026-09-07,ECPA-D01,2,7
2026-09-14,ECPA-D01,2,7
2026-09-21,ECPA-D01,0,7
2026-09-28,ECPA-D01,1,7
2026-10-05,ECPA-D01,1,7
2026-10-12,ECPA-D01,3,7
2026-10-19,ECPA-D01,2,7
2026-10-26,ECPA-D01,3,7
2026-04-27,ECPA-D02,2,7
2026-05-04,ECPA-D02,1,7
2026-05-11,ECPA-D02,2,7
2026-05-18,ECPA-D02,3,7
2026-05-25,ECPA-D02,1,7
2026-06-01,ECPA-D02,0,7
2026-06-08,ECPA-D02,0,7
2026-06-15,ECPA-D02,0,7
2026-06-22,ECPA-D02,0,7
2026-06-29,ECPA-D02,0,7
2026-07-06,ECPA-D02,0,7
2026-07-13,ECPA-D02,0,7
2026-07-20,ECPA-D02,0,7
2026-07-27,ECPA-D02,0,7
2026-08-03,ECPA-D02,0,7
2026-08-10,ECPA-D02,0,7
2026-08-17,ECPA-D02,0,7
2026-08-24,ECPA-D02,0,7
2026-08-31,ECPA-D02,3,7
2026-09-07,ECPA-D02,2,7
2026-09-14,ECPA-D02,3,7
2026-09-21,ECPA-D02,2,7
2026-09-28,ECPA-D02,0,7
2026-10-05,ECPA-D02,2,7
2026-10-12,ECPA-D02,2,7
2026-10-19,ECPA-D02,2,7
2026-10-26,ECPA-D02,2,7
2026-04-27,ECPA-D03,2,7
2026-05-04,ECPA-D03,1,7
2026-05-11,ECPA-D03,1,7
2026-05-18,ECPA-D03,0,7
2026-05-25,ECPA-D03,1,7
2026-06-01,ECPA-D03,1,7
2026-06-08,ECPA-D03,2', NULL, 'Reported', '2026-11-14T09:20:41.030Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_A_users_json', 'A', NULL, 'users', 'users.json', 'users.json', 'get_all_paperwork', NULL, '{"note":"Logins on the account. Names are shown only for people on file as contacts. Which force a login belongs to is not in this record.","users":[{"name":"Rhys Calder","role":"account administrator","created":"2026-02-20","user_id":"U01","last_sign_in":"2026-10-21","sign_ins_last_90_days":9},{"name":"Insp. Karen Mbeki","role":"unit administrator","created":"2025-09-12","user_id":"U02","last_sign_in":"2026-11-10","sign_ins_last_90_days":62},{"name":null,"role":"view only (alliance programme office)","created":"2026-06-18","user_id":"U03","last_sign_in":"2026-11-06","sign_ins_last_90_days":5},{"name":null,"role":"view only (alliance programme office)","created":"2026-06-18","user_id":"U04","last_sign_in":"2026-10-19","sign_ins_last_90_days":1},{"name":null,"role":"operator","created":"2026-03-20","user_id":"U05","last_sign_in":"2026-11-12","sign_ins_last_90_days":40},{"name":null,"role":"operator","created":"2026-03-09","user_id":"U06","last_sign_in":"2026-11-12","sign_ins_last_90_days":64},{"name":null,"role":"operator","created":"2026-03-16","user_id":"U07","last_sign_in":"2026-11-11","sign_ins_last_90_days":46},{"name":null,"role":"operator","created":"2026-03-08","user_id":"U08","last_sign_in":"2026-11-11","sign_ins_last_90_days":52},{"name":null,"role":"operator","created":"2026-03-06","user_id":"U09","last_sign_in":"2026-11-12","sign_ins_last_90_days":66},{"name":null,"role":"operator","created":"2026-03-19","user_id":"U10","last_sign_in":"2026-11-11","sign_ins_last_90', NULL, 'Reported', '2026-11-14T09:20:41.031Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_B_calls_2025-08-19_enquiry_call_txt', 'B', NULL, 'call', 'calls/2025-08-19_enquiry_call.txt', 'calls/2025-08-19_enquiry_call.txt', 'get_all_paperwork', NULL, 'ENQUIRY CALL: NOTES
Date: 19 August 2025
Written up by: the FlytBase deal team
Present for the customer: Stefan Roy (group head of security)
Present for FlytBase: Achal Negi

Background
- Aldermoor has 15 plants. Group security, under Stefan Roy, looks after site security for all of
  them.
- Night guarding is done by contractors at each plant.

What the customer asked for
- Automated night patrols of the fence line, starting with a trial at two plants.
- Footage he can show the board.

Not discussed
- Who at a plant acts on what a patrol finds.
- How the cost would be shared inside the group.

Actions
- FlytBase: trial proposal. Done September 2025.
', NULL, 'Reported', '2026-11-14T09:20:41.037Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_B_calls_2025-10-07_trial_kickoff_txt', 'B', NULL, 'call', 'calls/2025-10-07_trial_kickoff.txt', 'calls/2025-10-07_trial_kickoff.txt', 'get_all_paperwork', NULL, 'TRIAL KICK-OFF: NOTES
Date: 7 October 2025
Written up by: a FlytBase solutions engineer
Present for the customer: Stefan Roy (group head of security); his deputy (name not recorded)
Present for FlytBase: a solutions engineer

Trial
- 2 docks at two plants, October to December 2025: one to start with, the second a few weeks later.
- Scheduled night patrols of the fence line.
- Trial fee 12,000, credited against a first-year order if one follows.

Who does what
- Stefan Roy''s deputy runs the trial day to day: site access, the operator at each plant, the
  patrol times.
- Stefan Roy wants a monthly note he can take to the board.

Actions
- FlytBase: install 2 docks. Done.
- The deputy: a trained operator at each trial plant. Done.
', NULL, 'Reported', '2026-11-14T09:20:41.038Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_B_calls_2025-12-11_trial_review_txt', 'B', NULL, 'call', 'calls/2025-12-11_trial_review.txt', 'calls/2025-12-11_trial_review.txt', 'get_all_paperwork', NULL, 'TRIAL REVIEW CALL: NOTES
Date: 11 December 2025
Written up by: the FlytBase deal team
Present for the customer: Stefan Roy (group head of security); his deputy (name not recorded)
Present for FlytBase: Achal Negi; a solutions engineer

Trial
- 2 docks at two plants, October to December.
- Both docks flew scheduled night patrols of the fence line. Few faults.
- Stefan Roy: the board liked the footage. He wants every plant covered.

What the customer wants next
- 14 docks. The fifteenth plant is left out of this order. Stefan Roy: it can follow later.
- Stefan Roy''s deputy will lead the rollout on their side and train each plant.
- Stefan Roy asked whether FlytBase would put a savings figure in the order form. Answer: no; savings
  depend on how each plant uses the dock.

Open points at the end of the call
- Who at each plant acts on what a patrol finds. Stefan Roy: "the plants will sort that out."
- Each plant''s network. The deputy will deal with each plant''s own arrangements.

Actions
- FlytBase: order form for 14 docks. Done 15 January 2026.
- Customer: list of plants and install dates. Done.
', NULL, 'Reported', '2026-11-14T09:20:41.039Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_B_calls_2026-02-10_rollout_kickoff_txt', 'B', NULL, 'call', 'calls/2026-02-10_rollout_kickoff.txt', 'calls/2026-02-10_rollout_kickoff.txt', 'get_all_paperwork', NULL, 'ROLLOUT KICK-OFF: NOTES
Date: 10 February 2026
Written up by: the FlytBase rollout lead
Present for the customer: Stefan Roy''s deputy (name not recorded)
Present for FlytBase: the rollout lead

Plan
- 14 docks, February to April.
- The deputy visits each plant ahead of the install, agrees the dock position with the plant
  manager and trains one operator.
- Each plant connects the dock to its own network. The deputy arranges this plant by plant.

Asked and answered
- The rollout lead asked for a contact at each plant. The deputy: go through him; he will be on
  site for every install.

Actions
- FlytBase: install schedule. Done.
- The deputy: plant visits and one operator per plant. Done.
', NULL, 'Reported', '2026-11-14T09:20:41.041Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_B_calls_2026-03-17_rollout_check_in_txt', 'B', NULL, 'call', 'calls/2026-03-17_rollout_check_in.txt', 'calls/2026-03-17_rollout_check_in.txt', 'get_all_paperwork', NULL, 'ROLLOUT CHECK-IN: NOTES
Date: 17 March 2026
Written up by: the FlytBase rollout lead
Present for the customer: Stefan Roy''s deputy (name not recorded)
Present for FlytBase: the rollout lead

Progress
- 8 of 14 docks installed and commissioned.
- At two plants the signal at the agreed dock position was weak on install day. Both docks passed
  commissioning. The deputy will take the network up with each plant.

Actions
- FlytBase: remaining 6 docks. Done April 2026.
- The deputy: network at the two plants with weak signal. (No outcome on file.)
', NULL, 'Reported', '2026-11-14T09:20:41.042Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_B_calls_2026-04-23_rollout_close_txt', 'B', NULL, 'call', 'calls/2026-04-23_rollout_close.txt', 'calls/2026-04-23_rollout_close.txt', 'get_all_paperwork', NULL, 'ROLLOUT CLOSE CALL: NOTES
Date: 23 April 2026
Written up by: the FlytBase rollout lead, for the handover to customer success
Present for the customer: Stefan Roy''s deputy (led the rollout on their side)
Present for FlytBase: the rollout lead

Status
- 14 docks installed and commissioned between February and April.
- Each dock flew a commissioning flight on its install day.
- Scheduled night patrols were set up at the plants that asked for them. The others were left with the
  dock online and one trained operator each.

How it was done
- The deputy went to each plant, agreed the dock position with the plant manager and trained one
  operator.
- The deputy kept the install list (which dock is at which plant, and who was trained).
  We asked for a copy. Not received.

Left open
- No patrol schedule at most plants. The deputy: "they will ask when they are ready."
- No list of who receives alerts at each plant.
- Stefan Roy was not on the call.

Handover note to customer success
- The customer-side knowledge of this rollout sits with one person. Get the install list.
  (No further note.)
', NULL, 'Reported', '2026-11-14T09:20:41.044Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_B_calls_2026-05-21_intro_call_txt', 'B', NULL, 'call', 'calls/2026-05-21_intro_call.txt', 'calls/2026-05-21_intro_call.txt', 'get_all_paperwork', NULL, 'CALL TRANSCRIPT (auto-recorded, tidied)
Date: 21 May 2026
On the call: Sam (FlytBase, CSM); Stefan Roy (group head of security)

Sam: I have just picked up the account. How does the rollout look from where you sit?
Stefan: A success. Fourteen docks in three months. The board has seen the footage.
Sam: Good. Our rollout lead never received the install list: which dock is at which plant, who was
trained. Could I have a copy?
Stefan: My deputy has it. He did the rollout plant by plant.
Sam: May I write to him?
Stefan: Send it to my office and it will reach him.
Sam: I will. Which plants are flying patrols every night?
Stefan: The plants set their own pace. They are all covered.

Follow-ups noted by Sam
- Ask the deputy for the install list. (Asked through Stefan Roy''s office on 22 May. Not received.)
', NULL, 'Reported', '2026-11-14T09:20:41.045Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_B_calls_2026-06-11_check_in_txt', 'B', NULL, 'call', 'calls/2026-06-11_check_in.txt', 'calls/2026-06-11_check_in.txt', 'get_all_paperwork', NULL, 'CALL TRANSCRIPT (auto-recorded, tidied)
Date: 11 June 2026
On the call: Sam (FlytBase, CSM); Stefan Roy (group head of security)

Stefan: I present to the board next week. I want three or four clips, night patrols, something that
looks good.
Sam: I can pull those. On the numbers: most of the flying comes from a handful of docks.
Stefan: Thirteen of fifteen plants are flying.
Sam: Is there a plan to move the others to nightly patrols?
Stefan: They will ask when they are ready.
Sam: I still do not have the install list.
Stefan: I will remind my deputy.

Follow-ups noted by Sam
- Footage clips for the board. Sent 15 June.
- Install list: still not received.
', NULL, 'Reported', '2026-11-14T09:20:41.046Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_B_calls_2026-07-14_check_in_txt', 'B', NULL, 'call', 'calls/2026-07-14_check_in.txt', 'calls/2026-07-14_check_in.txt', 'get_all_paperwork', NULL, 'CALL TRANSCRIPT (auto-recorded, tidied)
Date: 14 July 2026
On the call: Sam (FlytBase, CSM); Stefan Roy (group head of security)

Stefan: I will give you the headline. ROI is proven. About 1.2 million euros a year saved.
Sam: That is a strong number. How is it made up?
Stefan: Guarding hours, incidents avoided, that kind of thing. It is all in there.
Sam: Could I see the breakdown? If we ever quote it, someone will ask.
Stefan: I will send something over. The board has seen the headline and they are happy.
Sam: On usage: I see a handful of docks flying every night and the rest flying a few times a month.
Stefan: Thirteen of fifteen plants are flying. That is the figure I report.
Sam: Flying at all, yes. I meant how often. Is the plan for the others to move to nightly patrols?
Stefan: They will. The plants set their own pace.
Sam: Is your deputy still the right person for me to speak to about each plant?
Stefan: Go through me for now.

Follow-ups noted by Sam
- Breakdown of the savings figure: promised by Stefan. (Not received before the handover.)
- Install list: still not received.
', NULL, 'Reported', '2026-11-14T09:20:41.047Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_B_calls_2026-08-25_check_in_txt', 'B', NULL, 'call', 'calls/2026-08-25_check_in.txt', 'calls/2026-08-25_check_in.txt', 'get_all_paperwork', NULL, 'CALL TRANSCRIPT (auto-recorded, tidied)
Date: 25 August 2026
On the call: Sam (FlytBase, CSM); Stefan Roy (group head of security)

Sam: One thing I am still missing: the list of who receives the alerts at each plant. When a
patrol flags something at night, who gets it?
Stefan: The plants handle that.
Sam: Each in their own way?
Stefan: It is their site. Group security sets the standard, the plant runs the night.
Sam: Would your deputy know the detail?
Stefan: Go through me.

Follow-ups noted by Sam
- List of alert recipients by plant. (Not received.)
', NULL, 'Reported', '2026-11-14T09:20:41.048Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_B_calls_2026-10-13_check_in_txt', 'B', NULL, 'call', 'calls/2026-10-13_check_in.txt', 'calls/2026-10-13_check_in.txt', 'get_all_paperwork', NULL, 'CALL TRANSCRIPT (auto-recorded, tidied)
Date: 13 October 2026
On the call: Sam (FlytBase, CSM); Stefan Roy (group head of security)

Stefan: Where are we with the case study? Our sister company has forty plants. I want to put it in
front of them this quarter.
Sam: I have not started it. A case study needs figures we can stand behind and someone at a plant
willing to be quoted. I still do not have the breakdown of the savings.
Stefan: Use the headline. ROI is proven.
Sam: Our marketing team will not publish a number without the working. Could finance confirm it?
Stefan: You do not need finance. This is a security programme.
Sam: I did get an email from your finance mailbox asking for the renewal quote to show the cost for
each plant. Do you know what is behind that?
Stefan: Ignore it. The renewal is a formality.
Sam: And the dock at Plant 11 that keeps dropping offline?
Stefan: That is an IT matter on our side. It will be sorted.

Follow-ups noted by Sam
- Case study: blocked on the savings breakdown and a plant willing to be quoted.
- Finance mailbox email: not answered.
', NULL, 'Reported', '2026-11-14T09:20:41.048Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_B_calls_index_json', 'B', NULL, 'calls_index', 'calls_index.json', 'calls_index.json', 'get_all_paperwork', NULL, '{"note":"Every call on file, oldest first, with its summary and actions. `path` is the notes or transcript where one was kept; a call with no path was summarised only.","calls":[{"date":"2025-08-19","path":"calls/2025-08-19_enquiry_call.txt","title":"Enquiry call","record":"notes","actions":["FlytBase: trial proposal. Done September 2025."],"summary":"First call. Group security wants automated night patrols of the fence line at the group''s plants. A trial at two plants was agreed in outline.","customer":["Stefan Roy"],"flytbase":["Achal Negi"]},{"date":"2025-10-07","path":"calls/2025-10-07_trial_kickoff.txt","title":"Trial kick-off","record":"notes","actions":["FlytBase: install 2 docks. Done.","The deputy: a trained operator at each trial plant. Done."],"summary":"Trial started: 2 docks at two plants, October to December 2025. Stefan Roy''s deputy runs it day to day on the customer''s side.","customer":["Stefan Roy","Stefan Roy''s deputy"],"flytbase":["a solutions engineer"]},{"date":"2025-12-11","path":"calls/2025-12-11_trial_review.txt","title":"Trial review call","record":"notes","actions":["Order form for 14 docks. Done 15 January 2026."],"summary":"Trial reviewed. 14 docks wanted. The deputy will lead the rollout. Open at the end: who at each plant acts on what a patrol finds, and each plant''s network.","customer":["Stefan Roy","Stefan Roy''s deputy"],"flytbase":["Achal Negi","a solutions engineer"]},{"date":"2026-01-08","path":"calls/2026-01-08_order_call.txt","title":"Ord', NULL, 'Reported', '2026-11-14T09:20:41.049Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_B_contract_txt', 'B', 'contract_deal_B', 'contract', 'contract.txt', 'contract.txt', 'get_all_paperwork', NULL, 'ORDER FORM SUMMARY (customer success copy)
Customer: Aldermoor Industrial Group, group security
Signed: 15 January 2026, by Stefan Roy, group head of security
Currency: euros

What was ordered
- 14 docks with aircraft, and the FlytBase platform for all of them.
- Installation and commissioning at plants named by the customer.
- Operator training for a rollout lead named by the customer, who trains each plant.

Price and term
- 140,000 a year.
- Term: 1 February 2026 to 31 January 2027.
- No automatic renewal. A renewal needs a new order before the term ends.

Invoicing
- One invoice a year, to group security.
- The order form does not say how the customer shares the cost inside the group.

Support
- Standard support: support desk in business hours, tickets answered in order of arrival.
- The customer keeps each dock connected to its own plant network.

Not covered by this order
- A dock for the fifteenth plant.
- Any commitment about the sister company.
- Any statement by FlytBase about savings. The order form quotes no savings figure.
', NULL, 'Verified', '2026-11-14T09:20:41.050Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_B_deal_history_json', 'B', NULL, 'deal_history', 'deal_history.json', 'deal_history.json', 'get_all_paperwork', NULL, '{"note":"Stages and values from this morning are in your own export, not here.","account":"B","history":[{"date":"2025-08","what":"Enquiry","detail":"Stefan Roy, group head of security, asked about automated night patrols for the group''s plants."},{"date":"2025-10 to 2025-12","what":"Trial","detail":"2 docks at two plants. Trial fee 12,000, credited against the first year."},{"date":"2025-12-11","what":"Trial review call","detail":"See calls/2025-12-11_trial_review.txt."},{"date":"2026-01-15","what":"Order form signed","value":140000,"detail":"14 docks and the platform, 140,000 a year, signed by Stefan Roy."},{"date":"2026-02-01","what":"Term starts","detail":"One invoice to group security. Paid."},{"date":"2026-02 to 2026-04","what":"Rollout","detail":"14 docks installed. Led on the customer''s side by Stefan Roy''s deputy."},{"date":"2026-04-23","what":"Rollout close call","detail":"See calls/2026-04-23_rollout_close.txt."},{"date":"2026-05","what":"Handover to customer success","detail":"Sam becomes CSM."},{"date":"2026-07","what":"Savings figure first quoted","detail":"Stefan Roy says the docks save about 1.2 million euros a year. No working supplied."},{"date":"2026-09","what":"Case study requested","detail":"Stefan Roy asks for a case study he can show the group''s sister company, which has 40 plants. Not started."},{"date":"2026-11","what":"CSM change","detail":"Sam moves teams. The account passes to you."}],"currency":"EUR","on_file_as_open_at_handover":[{"due":"2027-01-', NULL, 'Reported', '2026-11-14T09:20:41.053Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_B_device_events_csv', 'B', NULL, 'device_events', 'device_events.csv', 'device_events.csv', 'get_all_paperwork', NULL, 'date,time,dock_id,event,detail
2026-05-01,06:41,AD-12,connection_lost,
2026-05-01,06:57,AD-12,connection_restored,
2026-05-02,02:57,AD-14,connection_lost,
2026-05-02,03:14,AD-14,connection_restored,
2026-05-03,01:05,AD-12,connection_lost,
2026-05-03,01:42,AD-12,connection_restored,
2026-05-03,10:53,AD-14,connection_lost,
2026-05-03,10:58,AD-14,connection_restored,
2026-05-03,13:50,AD-12,connection_lost,
2026-05-03,14:22,AD-12,connection_restored,
2026-05-03,16:05,AD-12,connection_lost,
2026-05-03,16:15,AD-12,connection_restored,
2026-05-03,17:09,AD-12,connection_lost,
2026-05-03,17:45,AD-12,connection_restored,
2026-05-04,20:25,AD-14,connection_lost,
2026-05-04,20:35,AD-14,connection_restored,
2026-05-05,22:47,AD-12,connection_lost,
2026-05-05,23:01,AD-12,connection_restored,
2026-05-06,22:29,AD-14,connection_lost,
2026-05-06,23:03,AD-14,connection_restored,
2026-05-07,13:56,AD-12,connection_lost,
2026-05-07,14:29,AD-12,connection_restored,
2026-05-07,16:49,AD-07,connection_lost,
2026-05-07,17:05,AD-07,connection_restored,
2026-05-08,22:02,AD-07,connection_lost,
2026-05-08,22:21,AD-07,connection_restored,
2026-05-09,00:35,AD-07,connection_lost,
2026-05-09,01:00,AD-07,connection_restored,
2026-05-09,13:39,AD-14,connection_lost,
2026-05-09,13:47,AD-14,connection_restored,
2026-05-09,14:02,AD-14,connection_lost,
2026-05-09,14:31,AD-14,connection_restored,
2026-05-10,14:03,AD-12,connection_lost,
2026-05-10,14:10,AD-12,connection_restored,
2026-05-12,11:10,AD-01,connection_lost,
2', NULL, 'Reported', '2026-11-14T09:20:41.054Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_B_devices_json', 'B', NULL, 'devices', 'devices.json', 'devices.json', 'get_all_paperwork', NULL, '{"note":"Docks registered to this account, with the date each was commissioned under the current order (docks from a pilot or trial were commissioned again). Which site each dock sits at is not in this record.","docks":[{"model":"Standard dock, 2025 model","dock_id":"AD-01","software":"2026.09","dock_serial":"FBD82L48074","commissioned":"2026-03-30","aircraft_serial":"FBA12Z73665","last_seen_online":"2026-11-13"},{"model":"Standard dock, 2025 model","dock_id":"AD-02","software":"2026.09","dock_serial":"FBD67B46970","commissioned":"2026-04-14","aircraft_serial":"FBA33R35988","last_seen_online":"2026-11-13"},{"model":"Standard dock, 2025 model","dock_id":"AD-03","software":"2026.09","dock_serial":"FBD29H42965","commissioned":"2026-02-23","aircraft_serial":"FBA86E29928","last_seen_online":"2026-11-13"},{"model":"Standard dock, 2025 model","dock_id":"AD-04","software":"2026.09","dock_serial":"FBD88C78629","commissioned":"2026-02-24","aircraft_serial":"FBA90A75891","last_seen_online":"2026-11-13"},{"model":"Standard dock, 2025 model","dock_id":"AD-05","software":"2026.09","dock_serial":"FBD92U51259","commissioned":"2026-03-23","aircraft_serial":"FBA22Y12558","last_seen_online":"2026-11-13"},{"model":"Standard dock, 2025 model","dock_id":"AD-06","software":"2026.09","dock_serial":"FBD30R53827","commissioned":"2026-04-06","aircraft_serial":"FBA20N73661","last_seen_online":"2026-11-13"},{"model":"Standard dock, 2025 model","dock_id":"AD-07","software":"2026.09","dock_serial":"FBD45W2', NULL, 'Reported', '2026-11-14T09:20:41.055Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_B_emails_2026-07-16_stefan_savings_txt', 'B', NULL, 'email', 'emails/2026-07-16_stefan_savings.txt', 'emails/2026-07-16_stefan_savings.txt', 'get_all_paperwork', NULL, 'From: Stefan Roy
To: Sam (FlytBase)
Date: 16 July 2026
Subject: The number

Sam,

As discussed: ROI is proven, about 1.2 million euros a year saved. Thirteen of fifteen plants are
flying. Feel free to use that internally.

I will send the detail when I have a moment.

Stefan

[No detail received.]
', NULL, 'Reported', '2026-11-14T09:20:41.057Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_B_emails_2026-09-18_beatriz_alerts_txt', 'B', NULL, 'email', 'emails/2026-09-18_beatriz_alerts.txt', 'emails/2026-09-18_beatriz_alerts.txt', 'get_all_paperwork', NULL, 'From: Beatriz Alonso
To: Support desk
Date: 18 September 2026
Subject: Who gets the alerts at night (FB-10944)

Hello,

I am the plant manager at Plant 7. Can the night alerts from our dock go to more than one person?
Please tell me how to change it.

Beatriz Alonso

---
From: Support desk
To: Beatriz Alonso
Date: 20 September 2026
Subject: RE: Who gets the alerts at night (FB-10944)

Hello Beatriz, yes. The settings guide attached shows how to add recipients. Closing this ticket;
reply if you need anything else.

[No reply. Nobody asked why she wanted to change it.]
', NULL, 'Reported', '2026-11-14T09:20:41.058Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_B_emails_2026-09-22_stefan_case_study_txt', 'B', NULL, 'email', 'emails/2026-09-22_stefan_case_study.txt', 'emails/2026-09-22_stefan_case_study.txt', 'get_all_paperwork', NULL, 'From: Stefan Roy
To: Sam (FlytBase)
Date: 22 September 2026
Subject: Case study

Sam,

I want a case study for our sister company. They have 40 plants and they are watching what we do
here. Two pages, the headline saving on the front. When can I see a draft?

Stefan
', NULL, 'Reported', '2026-11-14T09:20:41.058Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_B_emails_2026-10-08_finance_mailbox_txt', 'B', NULL, 'email', 'emails/2026-10-08_finance_mailbox.txt', 'emails/2026-10-08_finance_mailbox.txt', 'get_all_paperwork', NULL, 'From: Group Finance (shared mailbox), Aldermoor Industrial Group
To: Sam (FlytBase)
Date: 8 October 2026
Subject: Renewal quote, drone docks

Hello,

We understand the dock contract renews at the end of January. Before a renewal is raised, please
send the quote in a form that shows the cost for each plant.

Group Finance

[Unsigned. No reply on file.]
', NULL, 'Reported', '2026-11-14T09:20:41.060Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_B_flights_csv', 'B', NULL, 'flights', 'flights.csv', 'flights.csv', 'get_all_paperwork', NULL, 'flight_id,date,start_time,dock_id,duration_min,mode,result,note
AD-F00001,2026-05-01,02:18,AD-02,20,scheduled,completed,
AD-F00002,2026-05-01,02:45,AD-10,23,scheduled,completed,
AD-F00003,2026-05-01,23:47,AD-05,16,scheduled,completed,
AD-F00004,2026-05-02,00:33,AD-05,22,scheduled,completed,
AD-F00005,2026-05-02,03:55,AD-10,22,scheduled,completed,
AD-F00006,2026-05-02,21:57,AD-08,23,scheduled,completed,
AD-F00007,2026-05-03,01:13,AD-10,21,scheduled,completed,
AD-F00008,2026-05-03,01:43,AD-08,19,scheduled,completed,
AD-F00009,2026-05-03,21:45,AD-02,20,scheduled,completed,
AD-F00010,2026-05-03,23:06,AD-05,16,scheduled,completed,
AD-F00011,2026-05-04,00:59,AD-08,22,scheduled,completed,
AD-F00012,2026-05-04,01:57,AD-10,16,scheduled,completed,
AD-F00013,2026-05-04,03:11,AD-02,22,scheduled,completed,
AD-F00014,2026-05-05,03:21,AD-10,19,scheduled,completed,
AD-F00015,2026-05-05,10:43,AD-01,5,manual,completed,
AD-F00016,2026-05-05,22:41,AD-08,16,scheduled,completed,
AD-F00017,2026-05-06,04:08,AD-10,18,scheduled,completed,
AD-F00018,2026-05-06,11:57,AD-09,4,manual,completed,
AD-F00019,2026-05-06,13:08,AD-04,4,manual,completed,
AD-F00020,2026-05-06,22:53,AD-08,21,scheduled,completed,
AD-F00021,2026-05-06,22:56,AD-02,23,scheduled,completed,
AD-F00022,2026-05-07,03:20,AD-05,17,scheduled,completed,
AD-F00023,2026-05-07,22:29,AD-10,24,scheduled,completed,
AD-F00024,2026-05-07,22:43,AD-08,23,scheduled,completed,
AD-F00025,2026-05-07,23:55,AD-02,5,scheduled,returned_early,wind
AD-F00026,2026-', NULL, 'Reported', '2026-11-14T09:20:41.061Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_B_internal_notes_json', 'B', NULL, 'internal_notes', 'internal_notes.json', 'internal_notes.json', 'get_all_paperwork', NULL, '{"note":"Notes about the account from FlytBase''s internal channel, oldest first. Fictional personas; routine notes only.","notes":[{"date":"2026-01-16","from":"Deal team","text":"Aldermoor order signed by Stefan Roy. One invoice a year to group security."},{"date":"2026-04-24","from":"Rollout lead","text":"Aldermoor rollout closed. Asked the customer''s deputy for the install list. Not received. Passing to customer success."},{"date":"2026-05-04","from":"Rollout lead","text":"Aldermoor passes to customer success. Sam is the CSM."},{"date":"2026-07-15","from":"Sam","text":"Stefan Roy quoted a savings figure on yesterday''s call. Asked for the breakdown."},{"date":"2026-09-12","from":"Support desk","text":"FB-10903, Plant 11: asked the customer to have their IT team look at the link. No reply from the customer yet."},{"date":"2026-09-23","from":"Sam","text":"Stefan Roy wants a case study for the sister company. Not started."},{"date":"2026-09-30","from":"Support desk","text":"FB-10903 still waiting on the customer."},{"date":"2026-10-09","from":"Sam","text":"An unsigned email from Aldermoor''s finance mailbox asks for the renewal quote by plant. Holding until I have spoken to Stefan Roy."},{"date":"2026-11-06","from":"Neel Sharma","text":"Sam is moving teams. The Aldermoor account passes to a new CSM next week."}]}', NULL, 'Reported', '2026-11-14T09:20:41.062Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_B_invoices_json', 'B', NULL, 'invoices', 'invoices.json', 'invoices.json', 'get_all_paperwork', NULL, '{"note":"From FlytBase Accounts. One invoice a year, to group security.","currency":"EUR","invoices":[{"note":"Credited against the first year.","paid":"2025-10-30","what":"Trial fee, 2 docks","amount":12000,"issued":"2025-10-06","number":"INV-25-1012","status":"Paid"},{"note":"Billed to group security.","paid":"2026-02-26","what":"First year, 14 docks, less the trial fee credit","amount":128000,"issued":"2026-02-01","number":"INV-26-0204","status":"Paid"}],"first_year_total":140000}', NULL, 'Reported', '2026-11-14T09:20:41.063Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_B_mail_log_json', 'B', NULL, 'mail_log', 'mail_log.json', 'mail_log.json', 'get_all_paperwork', NULL, '{"mail":[{"to":"Stefan Roy","body":"Stefan,\n\nThe trial proposal is attached: 2 docks at two plants, October to December.\n\nAchal","date":"2025-09-09","from":"Achal Negi (FlytBase)","kind":"person","thread":"T001","subject":"Trial proposal"},{"to":"Achal Negi (FlytBase)","body":"Agreed. My deputy will run it on our side.\n\nStefan","date":"2025-09-12","from":"Stefan Roy","kind":"person","thread":"T001","subject":"RE: Trial proposal"},{"to":"Stefan Roy","body":"Stefan,\n\nThank you for the signed order form. Our rollout lead will write to your office about install dates.\n\nAchal","date":"2026-01-16","from":"Achal Negi (FlytBase)","kind":"person","thread":"T002","subject":"Order form signed: next steps"},{"to":"Group security (billing contact)","body":"Your invoice for the first year is attached.","date":"2026-02-01","from":"FlytBase notifications (automatic)","kind":"automatic","thread":"T032","subject":"Invoice INV-26-0204"},{"to":"Group security office","body":"Hello,\n\nThe schedule for the 14 installs is attached.\n\nRollout lead","date":"2026-02-11","from":"The rollout lead (FlytBase)","kind":"person","thread":"T003","subject":"Install schedule"},{"to":"The rollout lead (FlytBase)","body":"Dates agreed. The deputy head of security will be on site for each install.\n\nGroup security office","date":"2026-02-13","from":"Group security office","kind":"person","thread":"T003","subject":"RE: Install schedule"},{"to":"Group security office","body":"Your request \"An operator ', NULL, 'Reported', '2026-11-14T09:20:41.064Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_B_profile_json', 'B', NULL, 'profile', 'profile.json', 'profile.json', 'get_all_paperwork', NULL, '{"name":"Aldermoor Industrial Group","sector":"Industrial sites, perimeter security","account":"B","renewal":{"term_ends":"2027-01-31","annual_value":140000},"currency":"EUR","not_on_file":["Stefan Roy''s deputy, who led the rollout on the customer''s side. Referred to by role in every note; no name or contact details recorded.","Anyone in group finance. One unsigned email came from a shared finance mailbox in October 2026.","Anyone in group IT.","A named contact at any plant other than Plant 7.","Which dock sits at which plant. The install list stayed with the customer."],"flytbase_side":{"csm":[{"to":"2026-11","who":"sam","from":"2026-05"},{"who":"you","from":"2026-11"}],"commercial_owner":"achal_negi"},"contacts_on_file":[{"id":"stefan_roy","name":"Stefan Roy","note":"Signed the order. Every call since May 2026 has been with him alone.","role":"Group head of security","on_file_since":"2025-08","last_contact_before_handover":"2026-10-13"},{"id":"beatriz_alonso","name":"Beatriz Alonso","note":"On file only through one support ticket. Never on a call with us.","role":"Plant manager, Plant 7","on_file_since":"2026-09","last_contact_before_handover":"2026-09-20"}],"what_they_bought":"14 docks and the FlytBase platform for night perimeter patrols at the group''s plants. The group has 15 plants."}', NULL, 'Reported', '2026-11-14T09:20:41.065Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_B_requests_csv', 'B', NULL, 'requests', 'requests.csv', 'requests.csv', 'get_all_paperwork', NULL, 'request_id,opened,from,summary,status,owner,last_update,how_it_arrived
FB-10903,2026-09-10,Aldermoor Plant 11,"Dock goes offline for days at a time. The network link at the plant drops. Waiting for the customer''s IT team to look at the link.",Pending customer,Support desk,2026-09-30,Support ticket
FB-10944,2026-09-18,"Beatriz Alonso, Plant 7","Asked whether night alerts can go to more than one person. Sent the settings guide.",Closed,Support desk,2026-09-20,Support ticket
(none),2026-10-08,Group finance (shared mailbox),"Asked for the renewal quote to show the cost for each plant. Not followed up before the handover.",Open,,2026-10-08,Email to the CSM
(none),2026-09-22,Stefan Roy,"Asked for a case study for the sister company. Not started.",Open,,2026-10-13,Email and call
', NULL, 'Reported', '2026-11-14T09:20:41.066Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_B_tickets_json', 'B', NULL, 'tickets', 'tickets.json', 'tickets.json', 'get_all_paperwork', NULL, '{"note":"Every support ticket on the account, oldest first. Ticket numbers run across all FlytBase customers. requests.csv is customer success''s own list of what it was tracking at the handover, which also holds requests that never became tickets.","tickets":[{"id":"FB-10085","closed":"2026-02-13","opened":"2026-02-12","status":"Closed","subject":"Survey sheet for dock positions, for the customer''s plant visits","assignee":"Support desk","category":"request","requester":"FlytBase rollout lead","conversation":[{"date":"2026-02-12","from":"FlytBase rollout lead","text":"Survey sheet for dock positions, for the customer''s plant visits."},{"date":"2026-02-13","from":"Support desk","text":"Sheet sent to the customer''s rollout lead."}],"first_response_hours":null},{"id":"FB-10121","closed":"2026-02-27","opened":"2026-02-26","status":"Closed","subject":"An operator login for each plant as it goes live","assignee":"Support desk","category":"accounts","requester":"Group security office","conversation":[{"date":"2026-02-26","from":"Group security office","text":"An operator login for each plant as it goes live."},{"date":"2026-02-27","from":"Support desk","text":"Agreed: one login per plant, created on each install day."}],"first_response_hours":15},{"id":"FB-10151","closed":"2026-03-19","opened":"2026-03-12","status":"Closed","subject":"Weak signal at the dock position on install day, two plants","assignee":"Support desk","category":"network","requester":"FlytBase rollout lead","conve', NULL, 'Reported', '2026-11-14T09:20:41.067Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_B_usage_weekly_csv', 'B', NULL, 'usage', 'usage_weekly.csv', 'usage_weekly.csv', 'get_all_paperwork', NULL, 'week_start,dock_id,flights,days_online
2026-04-27,AD-01,0,7
2026-05-04,AD-01,1,7
2026-05-11,AD-01,0,7
2026-05-18,AD-01,0,7
2026-05-25,AD-01,1,7
2026-06-01,AD-01,1,7
2026-06-08,AD-01,1,7
2026-06-15,AD-01,0,7
2026-06-22,AD-01,0,7
2026-06-29,AD-01,1,7
2026-07-06,AD-01,0,7
2026-07-13,AD-01,0,7
2026-07-20,AD-01,0,7
2026-07-27,AD-01,0,7
2026-08-03,AD-01,2,7
2026-08-10,AD-01,0,7
2026-08-17,AD-01,1,7
2026-08-24,AD-01,0,7
2026-08-31,AD-01,2,7
2026-09-07,AD-01,0,3
2026-09-14,AD-01,0,2
2026-09-21,AD-01,0,4
2026-09-28,AD-01,1,5
2026-10-05,AD-01,1,5
2026-10-12,AD-01,0,7
2026-10-19,AD-01,0,7
2026-10-26,AD-01,0,7
2026-04-27,AD-02,2,7
2026-05-04,AD-02,5,7
2026-05-11,AD-02,5,7
2026-05-18,AD-02,4,7
2026-05-25,AD-02,6,7
2026-06-01,AD-02,3,7
2026-06-08,AD-02,5,7
2026-06-15,AD-02,5,7
2026-06-22,AD-02,4,7
2026-06-29,AD-02,6,7
2026-07-06,AD-02,6,7
2026-07-13,AD-02,5,7
2026-07-20,AD-02,7,7
2026-07-27,AD-02,5,7
2026-08-03,AD-02,4,7
2026-08-10,AD-02,6,7
2026-08-17,AD-02,5,7
2026-08-24,AD-02,4,7
2026-08-31,AD-02,4,7
2026-09-07,AD-02,3,7
2026-09-14,AD-02,2,7
2026-09-21,AD-02,4,7
2026-09-28,AD-02,2,7
2026-10-05,AD-02,3,7
2026-10-12,AD-02,4,7
2026-10-19,AD-02,5,7
2026-10-26,AD-02,4,7
2026-04-27,AD-03,0,7
2026-05-04,AD-03,0,7
2026-05-11,AD-03,2,7
2026-05-18,AD-03,0,7
2026-05-25,AD-03,0,7
2026-06-01,AD-03,0,7
2026-06-08,AD-03,0,7
2026-06-15,AD-03,2,7
2026-06-22,AD-03,0,7
2026-06-29,AD-03,1,7
2026-07-06,AD-03,1,7
2026-07-13,AD-03,0,7
2026-07-20,AD-03,1,7
2026-07-27,AD-03,1,7
2026-08-03,AD-03,0,7
2026-08-10,A', NULL, 'Reported', '2026-11-14T09:20:41.068Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_pw_B_users_json', 'B', NULL, 'users', 'users.json', 'users.json', 'get_all_paperwork', NULL, '{"note":"Logins on the account. Names are shown only for people on file as contacts. Which plant a login belongs to is not in this record. The order form provides for one trained operator at each plant.","users":[{"name":"Stefan Roy","role":"account administrator","created":"2026-01-20","user_id":"U01","last_sign_in":"2026-05-12","sign_ins_last_90_days":0},{"name":null,"role":"account administrator (group security, deputy; name not on file)","created":"2026-01-22","user_id":"U02","last_sign_in":"2026-11-13","sign_ins_last_90_days":38},{"name":null,"role":"alert recipient, view only (name not on file)","created":"2026-03-09","user_id":"U03","last_sign_in":"2026-11-10","sign_ins_last_90_days":46},{"name":null,"role":"operator","created":"2026-03-17","user_id":"U04","last_sign_in":"2026-11-12","sign_ins_last_90_days":70},{"name":null,"role":"operator","created":"2026-03-07","user_id":"U05","last_sign_in":"2026-11-13","sign_ins_last_90_days":69},{"name":null,"role":"operator","created":"2026-03-15","user_id":"U06","last_sign_in":"2026-11-13","sign_ins_last_90_days":46},{"name":null,"role":"operator","created":"2026-03-09","user_id":"U07","last_sign_in":"2026-11-12","sign_ins_last_90_days":38},{"name":null,"role":"operator","created":"2026-03-26","user_id":"U08","last_sign_in":"2026-10-25","sign_ins_last_90_days":4},{"name":null,"role":"operator","created":"2026-03-22","user_id":"U09","last_sign_in":"2026-11-04","sign_ins_last_90_days":3},{"name":null,"role":"operator","created":"', NULL, 'Reported', '2026-11-14T09:20:41.069Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_sig_champion_leaves', 'A', NULL, 'live_signal', 'champion_leaves', NULL, 'get_signals', NULL, 'Rhys Calder has emailed to say he leaves the drone programme in January. No successor is named. Every call on file before the handover was with him alone.', '2026-11-14T09:31:02.436Z', 'Verified', '2026-11-14T09:31:02.438Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_sig_urgent_request', 'A', NULL, 'live_signal', 'urgent_request', NULL, 'get_signals', NULL, 'Insp. Karen Mbeki has written directly, and logged a ticket, ahead of a large public event on 5 December. She wants two things settled in writing this week: dates for training more operators before the day, and who answers if a dock fails on the day. Nobody has replied.', '2026-11-14T09:31:02.447Z', 'Verified', '2026-11-14T09:31:02.448Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_sig_aldermoor_usage_freeze', 'B', NULL, 'live_signal', 'aldermoor_usage_freeze', NULL, 'get_signals', NULL, 'New weekly usage for Aldermoor, 2 to 29 November. Three docks that flew most nights flew nothing in the last two weeks. All three stayed online. No ticket has been raised and nobody at the customer has said anything.', '2026-11-14T09:31:31.275Z', 'Verified', '2026-11-14T09:31:31.278Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_sig_usage_drop', 'B', NULL, 'live_signal', 'usage_drop', NULL, 'get_signals', NULL, 'New weekly usage for Aldermoor, 2 to 29 November. Three docks that flew most nights flew nothing in the last two weeks. All three stayed online. No ticket has been raised and nobody at the customer has said anything.', '2026-11-14T10:40:00.377Z', 'Verified', '2026-11-14T10:40:00.380Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_ngp_contract', 'NGP', 'deal_ngp_primary', 'contract', 'ngp_master_contract.pdf', NULL, 'get_all_paperwork', NULL, 'Master Service Agreement between Northumbrian Grid & Power and FlytBase. Value: £240,000 for 8 automated dock stations. Term expires May 15, 2027.', NULL, 'Verified', '2026-11-14T11:07:28.680Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_ngp_fiona_email', 'NGP', 'deal_ngp_expansion', 'email', 'email_fiona_emi_clearance', NULL, 'get_all_paperwork', NULL, 'From: Fiona Gallagher <fiona.gallagher@ngp-energy.co.uk> - Before we permit autonomous flights near the 400kV busbars at Norton and Stella West substations, we need third-party lab certification proving zero EMI impact on protection relays.', NULL, 'Verified', '2026-11-14T11:07:28.680Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO evidence (id, account_id, deal_id, source_type, source_id, source_path, tool_name, field_path, excerpt, source_date, confidence, retrieved_at) VALUES ('ev_ngp_alistair_call', 'NGP', 'deal_ngp_primary', 'call', 'call_notes_alistair_storm', NULL, 'get_all_paperwork', NULL, 'Call with Dr. Alistair Vance: We are very pleased with initial tower line inspection imagery. However, winter storm season in Northumberland will test dock reliability. We must confirm remote abort and heater specs.', NULL, 'Verified', '2026-11-14T11:07:28.680Z'::timestamptz) ON CONFLICT DO NOTHING;

-- Table: actions
INSERT INTO actions (id, account_id, deal_id, title, description, owner, priority, deadline, status, reasoning, expected_outcome, evidence_id, created_at, updated_at, task_notes, action_type) VALUES ('act_investigate_usage_aldermoor_usage_freeze', 'B', NULL, 'Proactively Investigate Inactive Docks Telemetry and Contact Site Ops', 'Pull dock system logs and initiate proactive outreach to Aldermoor facility manager regarding the flight stoppage.', 'Field Technical Specialist', 1, '2026-11-18', 'pending', 'Ranked #1 because zero flights across active units for 2 consecutive weeks indicates severe unexpressed operational failure.', 'Root cause of flight halt diagnosed and resolved before customer raises dispute.', 'ev_sig_aldermoor_usage_freeze', '2026-11-14T09:31:31.284Z'::timestamptz, '2026-11-14T09:31:31.284Z'::timestamptz, '', 'operational') ON CONFLICT DO NOTHING;
INSERT INTO actions (id, account_id, deal_id, title, description, owner, priority, deadline, status, reasoning, expected_outcome, evidence_id, created_at, updated_at, task_notes, action_type) VALUES ('act_handover_champion_leaves', 'A', NULL, 'Schedule Succession & Handover Meeting with Rhys Calder', 'Coordinate a formal handover review with Rhys Calder before his January departure and establish direct introductions to alliance force commanders.', 'Account Director', 1, '2026-11-25', 'pending', 'Ranked highest priority because continuity of the 300-dock framework depends on establishing incoming leadership access.', 'Formal successor identified and direct relationship established.', 'ev_sig_champion_leaves', '2026-11-14T09:31:02.443Z'::timestamptz, '2026-11-14T10:11:05.021Z'::timestamptz, '', 'operational') ON CONFLICT DO NOTHING;
INSERT INTO actions (id, account_id, deal_id, title, description, owner, priority, deadline, status, reasoning, expected_outcome, evidence_id, created_at, updated_at, task_notes, action_type) VALUES ('act_mbeki_reply_urgent_request', 'A', NULL, 'Send Written Confirmation of Training Dates & Event SLA to Insp. Mbeki', 'Reply directly to Insp. Karen Mbeki with confirmed operator training dates before Dec 5 and emergency dock failure escalation contact.', 'Customer Success Lead', 1, '2026-11-20', 'pending', 'Ranked top priority because a customer commitment is overdue, public event is imminent (Dec 5), and Westmere is the primary operational force.', 'Insp. Mbeki receives full written assurances and confirms operational readiness.', 'ev_sig_urgent_request', '2026-11-14T09:31:02.451Z'::timestamptz, '2026-11-14T10:11:05.641Z'::timestamptz, '', 'operational') ON CONFLICT DO NOTHING;
INSERT INTO actions (id, account_id, deal_id, title, description, owner, priority, deadline, status, reasoning, expected_outcome, evidence_id, created_at, updated_at, task_notes, action_type) VALUES ('act_investigate_usage_usage_drop', 'B', NULL, 'Proactively Investigate Inactive Docks Telemetry and Contact Site Ops', 'Pull dock system logs and initiate proactive outreach to Aldermoor facility manager regarding the flight stoppage.', 'Field Technical Specialist', 1, '2026-11-18', 'pending', 'Ranked #1 because zero flights across active units for 2 consecutive weeks indicates severe unexpressed operational failure.', 'Root cause of flight halt diagnosed and resolved before customer raises dispute.', 'ev_sig_usage_drop', '2026-11-14T10:40:00.383Z'::timestamptz, '2026-11-14T10:40:00.383Z'::timestamptz, '', 'operational') ON CONFLICT DO NOTHING;
INSERT INTO actions (id, account_id, deal_id, title, description, owner, priority, deadline, status, reasoning, expected_outcome, evidence_id, created_at, updated_at, task_notes, action_type) VALUES ('task_c0f19144', 'A', NULL, 'Coordinate Westmere dock battery replacements with Insp. Karen Mbeki', NULL, 'Field Lead', 1, '2026-11-25', 'pending', 'Two docks will not last night shift; required for Dec 5 event', 'New battery units deployed and tested', NULL, '2026-11-14T10:40:01.990Z'::timestamptz, '2026-11-14T10:40:01.998Z'::timestamptz, '[2026-11-14 16:15 - Ops]: Battery batch prepared for field transport.
[2026-11-14 10:40 - Dispatch]: Field technician assigned to Westmere depot.', 'field_ops') ON CONFLICT DO NOTHING;
INSERT INTO actions (id, account_id, deal_id, title, description, owner, priority, deadline, status, reasoning, expected_outcome, evidence_id, created_at, updated_at, task_notes, action_type) VALUES ('act_ngp_emi', 'NGP', 'deal_ngp_expansion', 'Submit 400kV High-Voltage EMI Immunity Lab Certification to Fiona Gallagher', 'Deliver documented lab test results demonstrating zero relay interference near high-voltage busbars.', 'Technical Solutions Lead', 1, '2026-11-28', 'pending', 'Crucial regulatory milestone needed to unlock Phase 2 corridor expansion (£360k) and maintain compliance sign-off.', 'Fiona Gallagher approves flight safety protocol for 8 substation docks.', 'ev_ngp_fiona_email', '2026-11-14T11:07:28.682Z'::timestamptz, '2026-11-14T11:07:28.682Z'::timestamptz, '', 'operational') ON CONFLICT DO NOTHING;
INSERT INTO actions (id, account_id, deal_id, title, description, owner, priority, deadline, status, reasoning, expected_outcome, evidence_id, created_at, updated_at, task_notes, action_type) VALUES ('act_ngp_wind', 'NGP', 'deal_ngp_primary', 'Configure High-Wind Autoland Limits & Brief Dr. Alistair Vance', 'Calibrate dynamic anemometer trigger thresholds in FlytBase mission planner and present storm readiness plan.', 'Field Operations Lead', 2, '2026-12-02', 'in_progress', 'Key sponsor request; winter weather in Northumbria requires rigorous autoland and dock heating verification.', 'Dr. Vance validates winter operating parameters and signs off seasonal protocol.', 'ev_ngp_alistair_call', '2026-11-14T11:07:28.682Z'::timestamptz, '2026-11-14T11:07:28.682Z'::timestamptz, '', 'operational') ON CONFLICT DO NOTHING;
INSERT INTO actions (id, account_id, deal_id, title, description, owner, priority, deadline, status, reasoning, expected_outcome, evidence_id, created_at, updated_at, task_notes, action_type) VALUES ('act_ngp_scada', 'NGP', 'deal_ngp_primary', 'Deliver SCADA Webhook Integration Specification to Marcus Thorne', 'Provide API specification for automated fault detection dispatch integration with regional control center.', 'Solutions Architect', 3, '2026-12-10', 'pending', 'Automates emergency outage fly-overs without requiring telephone dispatch from substation engineers.', 'Marcus Thorne approves SCADA interface prototype for Stella West substation.', 'ev_ngp_contract', '2026-11-14T11:07:28.682Z'::timestamptz, '2026-11-14T11:07:28.682Z'::timestamptz, '', 'operational') ON CONFLICT DO NOTHING;

-- Table: risks
INSERT INTO risks (id, account_id, deal_id, title, description, severity, detected_at, trigger_date, consequence, mitigation, responsible_owner, evidence_id, status) VALUES ('risk_departure_champion_leaves', 'A', NULL, 'Key Stakeholder Departure: Rhys Calder Leaving Drone Programme', 'Rhys Calder emailed to state he is leaving the drone programme in January. No successor has been named, and all historic alliance calls were conducted with him alone.', 'Red', '2026-11-14T09:31:02.439Z'::timestamptz, 'January 2027', 'Critical loss of key relationship and continuity risk for 300-dock tender framework.', 'Immediately map alternative stakeholders in procurement and individual forces (e.g. Insp Karen Mbeki, Hannah Doyle) and request formal handover meeting before January.', 'Account Director', 'ev_sig_champion_leaves', 'active') ON CONFLICT DO NOTHING;
INSERT INTO risks (id, account_id, deal_id, title, description, severity, detected_at, trigger_date, consequence, mitigation, responsible_owner, evidence_id, status) VALUES ('risk_unanswered_urgent_request', 'A', NULL, 'Unanswered Customer Escalation: Westmere Public Event Approaching', 'Insp. Karen Mbeki requested written confirmation of training dates for operators and failover contact before the Dec 5 public event. Ticket remains unanswered.', 'Red', '2026-11-14T09:31:02.450Z'::timestamptz, '2026-12-05', 'Breakdown of customer trust, Westmere operational failure during high-visibility public event, jeopardy to fleet expansion.', 'Provide written confirmation of training schedule today and establish formal on-call dock failure support escalation path.', 'Customer Success Lead', 'ev_sig_urgent_request', 'active') ON CONFLICT DO NOTHING;
INSERT INTO risks (id, account_id, deal_id, title, description, severity, detected_at, trigger_date, consequence, mitigation, responsible_owner, evidence_id, status) VALUES ('risk_usage_drop_aldermoor_usage_freeze', 'B', NULL, 'Silent Operational Freeze: 3 Docks Inactive for 2 Weeks Despite Remaining Online', 'Three docks that previously flew nightly recorded zero flights between Nov 2 - Nov 29. Docks remain online with no tickets or customer notice submitted.', 'Red', '2026-11-14T09:31:31.280Z'::timestamptz, 'Immediate', 'Undetected operational blockage or stakeholder dissatisfaction; risk of silent churn and non-renewal of commercial contract.', 'Perform remote telemetry diagnostics on all 3 offline docks and reach out proactively to operations manager to offer site inspection.', 'Field Technical Specialist', 'ev_sig_aldermoor_usage_freeze', 'active') ON CONFLICT DO NOTHING;
INSERT INTO risks (id, account_id, deal_id, title, description, severity, detected_at, trigger_date, consequence, mitigation, responsible_owner, evidence_id, status) VALUES ('risk_usage_drop_usage_drop', 'B', NULL, 'Silent Operational Freeze: 3 Docks Inactive for 2 Weeks Despite Remaining Online', 'Three docks that previously flew nightly recorded zero flights between Nov 2 - Nov 29. Docks remain online with no tickets or customer notice submitted.', 'Red', '2026-11-14T10:40:00.381Z'::timestamptz, 'Immediate', 'Undetected operational blockage or stakeholder dissatisfaction; risk of silent churn and non-renewal of commercial contract.', 'Perform remote telemetry diagnostics on all 3 offline docks and reach out proactively to operations manager to offer site inspection.', 'Field Technical Specialist', 'ev_sig_usage_drop', 'active') ON CONFLICT DO NOTHING;
INSERT INTO risks (id, account_id, deal_id, title, description, severity, detected_at, trigger_date, consequence, mitigation, responsible_owner, evidence_id, status) VALUES ('risk_ngp_emi', 'NGP', 'deal_ngp_expansion', '400kV Substation EMI Interference with Flight Controller & Telemetry', 'Electromagnetic fields around high-voltage switchgear could cause sensor degradation or trigger safety autoland.', 'Amber', '2026-11-14T11:07:28.685Z'::timestamptz, '2026-12-15', 'Temporary grounding of flights at 2 substations if compliance certification is rejected.', 'Maintain 45m standoff buffer from active transformer banks and supply certified shielding documentation.', 'Field Technical Specialist', 'ev_ngp_fiona_email', 'active') ON CONFLICT DO NOTHING;
INSERT INTO risks (id, account_id, deal_id, title, description, severity, detected_at, trigger_date, consequence, mitigation, responsible_owner, evidence_id, status) VALUES ('risk_ngp_storm', 'NGP', 'deal_ngp_primary', 'Northumbrian Winter Gales Exceeding Dock Rated Canopy Wind Limits', 'Winter gales routinely exceed 28 knots, testing dock enclosure motors and thermal management systems.', 'Amber', '2026-11-14T11:07:28.685Z'::timestamptz, '2026-12-01', 'Missed inspection intervals or dock canopy jamming during sub-zero icing conditions.', 'Activate remote enclosure heating cycles and automated predictive weather hold integration.', 'Operations Manager', 'ev_ngp_alistair_call', 'active') ON CONFLICT DO NOTHING;

-- Table: intelligence_gaps
INSERT INTO intelligence_gaps (id, account_id, deal_id, missing_information, importance, suggested_owner, recommended_question, priority, status, evidence_id, created_at) VALUES ('gap_successor_champion_leaves', 'A', NULL, 'Successor to Rhys Calder as Alliance Drone Programme Lead', 'Without an identified successor, decision-making on alliance-wide deployment and the 300-dock framework locks out FlytBase.', 'Account Director', 'Who will be assuming leadership of the Alliance drone programme following Rhys Calder’s departure in January?', 'Critical', 'open', 'ev_sig_champion_leaves', '2026-11-14T09:31:02.441Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO intelligence_gaps (id, account_id, deal_id, missing_information, importance, suggested_owner, recommended_question, priority, status, evidence_id, created_at) VALUES ('gap_inactivity_reason_aldermoor_usage_freeze', 'B', NULL, 'Reason for 2-Week Operational Flight Freeze on 3 Active Docks', 'If hardware fault or site restrictions exist, lack of customer reporting indicates disengagement or workaround.', 'Field Technical Specialist', 'What operational change or site factor caused the three active docks to stop flying over the past two weeks?', 'Critical', 'open', 'ev_sig_aldermoor_usage_freeze', '2026-11-14T09:31:31.286Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO intelligence_gaps (id, account_id, deal_id, missing_information, importance, suggested_owner, recommended_question, priority, status, evidence_id, created_at) VALUES ('gap_inactivity_reason_usage_drop', 'B', NULL, 'Reason for 2-Week Operational Flight Freeze on 3 Active Docks', 'If hardware fault or site restrictions exist, lack of customer reporting indicates disengagement or workaround.', 'Field Technical Specialist', 'What operational change or site factor caused the three active docks to stop flying over the past two weeks?', 'Critical', 'open', 'ev_sig_usage_drop', '2026-11-14T10:40:00.384Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO intelligence_gaps (id, account_id, deal_id, missing_information, importance, suggested_owner, recommended_question, priority, status, evidence_id, created_at) VALUES ('gap_ngp_scada', 'NGP', 'deal_ngp_primary', 'Exact Substation Telemetry Protocol (DNP3 vs IEC 61850) for SCADA Gateway', 'Direct SCADA integration requires knowing whether regional control room utilizes DNP3 or IEC 61850 protocols.', 'Solutions Architect', 'Does your regional control center interface through IEC 61850 or DNP3 for external automated alert triggers?', 'Critical', 'open', 'ev_ngp_contract', '2026-11-14T11:07:28.687Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO intelligence_gaps (id, account_id, deal_id, missing_information, importance, suggested_owner, recommended_question, priority, status, evidence_id, created_at) VALUES ('gap_ngp_wayleave', 'NGP', 'deal_ngp_expansion', 'Corridor Wayleave & Landowner Permissions for Phase 2 Corridor Docks', '12 proposed corridor docks span rural private land between regional substations.', 'Commercial Lead', 'Are all 12 planned Phase 2 dock positions located within existing statutory easements or are separate wayleave permissions required?', 'Medium', 'open', 'ev_ngp_contract', '2026-11-14T11:07:28.687Z'::timestamptz) ON CONFLICT DO NOTHING;

-- Table: notes
INSERT INTO notes (id, external_id, account_id, title, kind, text, synchronization_status, error, created_at) VALUES ('daef824d-e6b1-4b1e-8195-16c72ee38f18', NULL, 'A', 'Confirm Westmere Dec 5 Escort Plan', 'next_step', 'Coordinate field engineer on-site presence for Dec 5 public event at Westmere.', 'synced', NULL, '2026-11-14T09:35:57.168Z'::timestamptz) ON CONFLICT DO NOTHING;

-- Table: signals
INSERT INTO signals (id, external_id, account_id, payload, detected_at, processed_at, processing_status) VALUES ('4c805355-d58e-49dd-83ab-2cbc00445f5b', 'champion_leaves', 'A', '{"id":"champion_leaves","dated":"2026-11-17","title":"Eastern Counties: Rhys Calder is moving on","account":"A","records":[{"kind":"email","path":"A/emails/2026-11-17_rhys_moving.txt","text":"From: Rhys Calder\nTo: (the CSM on the account)\nDate: 17 November 2026\nSubject: A change on my side\n\nA quick note so you hear it from me. I am moving to another role in the new year and will hand over the drone programme in January. My successor has not been named yet.\n\nAnything we have agreed stands. Until January, keep sending things to the programme office and I will make sure they land.\n\nRhys\n"}],"summary":"Rhys Calder has emailed to say he leaves the drone programme in January. No successor is named. Every call on file before the handover was with him alone.","set_off_at":"2026-11-14T09:30:38.755Z"}'::jsonb, '2026-11-14T09:31:02.436Z'::timestamptz, '2026-11-14T09:31:02.436Z'::timestamptz, 'processed') ON CONFLICT DO NOTHING;
INSERT INTO signals (id, external_id, account_id, payload, detected_at, processed_at, processing_status) VALUES ('d67b384f-b737-438d-bb52-f2a88e3161ee', 'urgent_request', 'A', '{"id":"urgent_request","dated":"2026-11-18","title":"Eastern Counties: Westmere needs an answer before a public event","account":"A","records":[{"kind":"email","path":"A/emails/2026-11-18_karen_event.txt","text":"From: Insp. Karen Mbeki\nTo: (the CSM on the account)\nDate: 18 November 2026\nSubject: Public event, 5 December\n\nWe are policing a large public event on Saturday 5 December and I want the docks to carry more of it than they do now.\n\nWhatever was said last week, I need two things settled in writing this week.\n1. Operators. How many more of my officers can be trained before the day, and when.\n2. Cover on the day. If a dock fails, who do I call and how fast does anyone answer.\n\nI am logging this as a ticket as well, so it has a number.\n\nKaren Mbeki\nWestmere drone unit\n"},{"kind":"request","note":"Row to add to the account''s requests log.","path":"A/requests.csv","text":"request_id,opened,from,summary,status,owner,last_update,how_it_arrived\nFB-11206,2026-11-18,Westmere drone unit,\"Operator training and support cover before a public event on 5 December. Marked urgent by the requester.\",Open,,2026-11-18,Support ticket\n"}],"summary":"Insp. Karen Mbeki has written directly, and logged a ticket, ahead of a large public event on 5 December. She wants two things settled in writing this week: dates for training more operators before the day, and who answers if a dock fails on the day. Nobody has replied.","set_off_at":"2026-11-14T09:30:42.574Z"}'::jsonb, '2026-11-14T09:31:02.447Z'::timestamptz, '2026-11-14T09:31:02.447Z'::timestamptz, 'processed') ON CONFLICT DO NOTHING;
INSERT INTO signals (id, external_id, account_id, payload, detected_at, processed_at, processing_status) VALUES ('5a17ff79-7b12-48a8-aebe-5148a4377165', 'aldermoor_usage_freeze', 'B', '{"id":"aldermoor_usage_freeze","dated":"2026-11-30","title":"Aldermoor: three docks that fly most nights have stopped","account":"B","summary":"New weekly usage for Aldermoor, 2 to 29 November. Three docks that flew most nights flew nothing in the last two weeks. All three stayed online. No ticket has been raised and nobody at the customer has said anything."}'::jsonb, '2026-11-14T09:31:31.275Z'::timestamptz, '2026-11-14T09:31:31.276Z'::timestamptz, 'processed') ON CONFLICT DO NOTHING;
INSERT INTO signals (id, external_id, account_id, payload, detected_at, processed_at, processing_status) VALUES ('fafdee54-5aed-4d40-a26f-d6682e76d95e', 'usage_drop', 'B', '{"id":"usage_drop","dated":"2026-11-30","title":"Aldermoor: three docks that fly most nights have stopped","account":"B","records":[{"kind":"usage","note":"Rows to add to the account''s weekly usage.","path":"B/usage_weekly.csv","text":"week_start,dock_id,flights,days_online\n2026-11-02,AD-01,1,7\n2026-11-09,AD-01,0,7\n2026-11-16,AD-01,0,7\n2026-11-23,AD-01,0,7\n2026-11-02,AD-02,6,7\n2026-11-09,AD-02,7,7\n2026-11-16,AD-02,0,7\n2026-11-23,AD-02,0,7\n2026-11-02,AD-03,0,7\n2026-11-09,AD-03,0,7\n2026-11-16,AD-03,1,7\n2026-11-23,AD-03,0,7\n2026-11-02,AD-04,0,7\n2026-11-09,AD-04,1,7\n2026-11-16,AD-04,0,7\n2026-11-23,AD-04,0,7\n2026-11-02,AD-05,6,7\n2026-11-09,AD-05,7,7\n2026-11-16,AD-05,0,7\n2026-11-23,AD-05,0,7\n2026-11-02,AD-06,0,7\n2026-11-09,AD-06,0,7\n2026-11-16,AD-06,0,7\n2026-11-23,AD-06,1,7\n2026-11-02,AD-07,0,7\n2026-11-09,AD-07,0,7\n2026-11-16,AD-07,1,7\n2026-11-23,AD-07,0,7\n2026-11-02,AD-08,6,7\n2026-11-09,AD-08,7,7\n2026-11-16,AD-08,5,7\n2026-11-23,AD-08,6,7\n2026-11-02,AD-09,1,7\n2026-11-09,AD-09,0,7\n2026-11-16,AD-09,0,7\n2026-11-23,AD-09,0,7\n2026-11-02,AD-10,5,7\n2026-11-09,AD-10,6,7\n2026-11-16,AD-10,0,7\n2026-11-23,AD-10,0,7\n2026-11-02,AD-11,0,7\n2026-11-09,AD-11,0,7\n2026-11-16,AD-11,1,7\n2026-11-23,AD-11,0,7\n2026-11-02,AD-12,0,7\n2026-11-09,AD-12,1,7\n2026-11-16,AD-12,0,7\n2026-11-23,AD-12,0,7\n2026-11-02,AD-13,1,7\n2026-11-09,AD-13,0,7\n2026-11-16,AD-13,0,7\n2026-11-23,AD-13,0,7\n2026-11-02,AD-14,0,7\n2026-11-09,AD-14,0,7\n2026-11-16,AD-14,0,7\n2026-11-23,AD-14,0,7\n"}],"summary":"New weekly usage for Aldermoor, 2 to 29 November. Three docks that flew most nights flew nothing in the last two weeks. All three stayed online. No ticket has been raised and nobody at the customer has said anything.","set_off_at":"2026-11-14T10:39:16.120Z"}'::jsonb, '2026-11-14T10:40:00.377Z'::timestamptz, '2026-11-14T10:40:00.377Z'::timestamptz, 'processed') ON CONFLICT DO NOTHING;

-- Table: activities
INSERT INTO activities (id, account_id, type, title, description, metadata, timestamp) VALUES ('b9e4fd94-3373-4ecc-9b1d-92049475cb84', NULL, 'sync', 'Accounts Ingested', 'Successfully synced accounts, stakeholders, and opportunities from MCP.', '{}'::jsonb, '2026-11-14T09:16:38.107Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO activities (id, account_id, type, title, description, metadata, timestamp) VALUES ('6fe4c6c8-b0ce-4224-ba60-686aaa9593a1', 'A', 'paperwork', 'Paperwork Ingested', 'Retrieved paperwork records from MCP repository.', '{}'::jsonb, '2026-11-14T09:17:45.747Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO activities (id, account_id, type, title, description, metadata, timestamp) VALUES ('10faaec6-f701-40bd-93e8-eb169fae82e3', 'B', 'paperwork', 'Paperwork Ingested', 'Retrieved paperwork records from MCP repository.', '{}'::jsonb, '2026-11-14T09:18:52.013Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO activities (id, account_id, type, title, description, metadata, timestamp) VALUES ('3255f6a3-646b-417d-bb45-a32ea658daf7', 'A', 'paperwork', 'Paperwork Ingested', 'Ingested 35 records for Account A.', '{}'::jsonb, '2026-11-14T09:20:41.033Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO activities (id, account_id, type, title, description, metadata, timestamp) VALUES ('ded9d9fb-700f-4aad-acb4-dd3eab72cd1e', 'B', 'paperwork', 'Paperwork Ingested', 'Ingested 30 records for Account B.', '{}'::jsonb, '2026-11-14T09:20:41.070Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO activities (id, account_id, type, title, description, metadata, timestamp) VALUES ('fa8d487a-f619-4ec4-85c0-6ba20dc744e9', 'A', 'signal', 'Eastern Counties: Rhys Calder is moving on', 'Rhys Calder has emailed to say he leaves the drone programme in January. No successor is named. Every call on file before the handover was with him alone.', '{"id":"champion_leaves","dated":"2026-11-17","title":"Eastern Counties: Rhys Calder is moving on","account":"A","records":[{"kind":"email","path":"A/emails/2026-11-17_rhys_moving.txt","text":"From: Rhys Calder\nTo: (the CSM on the account)\nDate: 17 November 2026\nSubject: A change on my side\n\nA quick note so you hear it from me. I am moving to another role in the new year and will hand over the drone programme in January. My successor has not been named yet.\n\nAnything we have agreed stands. Until January, keep sending things to the programme office and I will make sure they land.\n\nRhys\n"}],"summary":"Rhys Calder has emailed to say he leaves the drone programme in January. No successor is named. Every call on file before the handover was with him alone.","set_off_at":"2026-11-14T09:30:38.755Z"}'::jsonb, '2026-11-14T09:31:02.436Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO activities (id, account_id, type, title, description, metadata, timestamp) VALUES ('ef141ef6-4694-4655-82cb-00cf2dd6eac7', 'A', 'signal', 'Eastern Counties: Westmere needs an answer before a public event', 'Insp. Karen Mbeki has written directly, and logged a ticket, ahead of a large public event on 5 December. She wants two things settled in writing this week: dates for training more operators before the day, and who answers if a dock fails on the day. Nobody has replied.', '{"id":"urgent_request","dated":"2026-11-18","title":"Eastern Counties: Westmere needs an answer before a public event","account":"A","records":[{"kind":"email","path":"A/emails/2026-11-18_karen_event.txt","text":"From: Insp. Karen Mbeki\nTo: (the CSM on the account)\nDate: 18 November 2026\nSubject: Public event, 5 December\n\nWe are policing a large public event on Saturday 5 December and I want the docks to carry more of it than they do now.\n\nWhatever was said last week, I need two things settled in writing this week.\n1. Operators. How many more of my officers can be trained before the day, and when.\n2. Cover on the day. If a dock fails, who do I call and how fast does anyone answer.\n\nI am logging this as a ticket as well, so it has a number.\n\nKaren Mbeki\nWestmere drone unit\n"},{"kind":"request","note":"Row to add to the account''s requests log.","path":"A/requests.csv","text":"request_id,opened,from,summary,status,owner,last_update,how_it_arrived\nFB-11206,2026-11-18,Westmere drone unit,\"Operator training and support cover before a public event on 5 December. Marked urgent by the requester.\",Open,,2026-11-18,Support ticket\n"}],"summary":"Insp. Karen Mbeki has written directly, and logged a ticket, ahead of a large public event on 5 December. She wants two things settled in writing this week: dates for training more operators before the day, and who answers if a dock fails on the day. Nobody has replied.","set_off_at":"2026-11-14T09:30:42.574Z"}'::jsonb, '2026-11-14T09:31:02.447Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO activities (id, account_id, type, title, description, metadata, timestamp) VALUES ('4d40d956-c999-4a7a-afbd-af242e16eaf7', 'B', 'signal', 'Aldermoor: three docks that fly most nights have stopped', 'New weekly usage for Aldermoor, 2 to 29 November. Three docks that flew most nights flew nothing in the last two weeks. All three stayed online. No ticket has been raised and nobody at the customer has said anything.', '{"id":"aldermoor_usage_freeze","dated":"2026-11-30","title":"Aldermoor: three docks that fly most nights have stopped","account":"B","summary":"New weekly usage for Aldermoor, 2 to 29 November. Three docks that flew most nights flew nothing in the last two weeks. All three stayed online. No ticket has been raised and nobody at the customer has said anything."}'::jsonb, '2026-11-14T09:31:31.275Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO activities (id, account_id, type, title, description, metadata, timestamp) VALUES ('cff51540-eb10-4790-ab3c-d50fb2cf5765', 'A', 'note', 'Note Queued: Confirm Westmere Dec 5 Escort Plan', 'Coordinate field engineer on-site presence for Dec 5 public event at Westmere.', '{}'::jsonb, '2026-11-14T09:35:57.174Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO activities (id, account_id, type, title, description, metadata, timestamp) VALUES ('48c5a892-8449-422b-9135-04bffb366601', 'A', 'task_created', 'Task Created: Prepare written response for Insp. Karen Mbeki', 'Assigned to: Customer Success Team, Priority: P1', '{}'::jsonb, '2026-11-14T10:29:05.642Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO activities (id, account_id, type, title, description, metadata, timestamp) VALUES ('09696ba0-8211-4154-9f36-1e26356c43ea', 'B', 'signal', 'Aldermoor: three docks that fly most nights have stopped', 'New weekly usage for Aldermoor, 2 to 29 November. Three docks that flew most nights flew nothing in the last two weeks. All three stayed online. No ticket has been raised and nobody at the customer has said anything.', '{"id":"usage_drop","dated":"2026-11-30","title":"Aldermoor: three docks that fly most nights have stopped","account":"B","records":[{"kind":"usage","note":"Rows to add to the account''s weekly usage.","path":"B/usage_weekly.csv","text":"week_start,dock_id,flights,days_online\n2026-11-02,AD-01,1,7\n2026-11-09,AD-01,0,7\n2026-11-16,AD-01,0,7\n2026-11-23,AD-01,0,7\n2026-11-02,AD-02,6,7\n2026-11-09,AD-02,7,7\n2026-11-16,AD-02,0,7\n2026-11-23,AD-02,0,7\n2026-11-02,AD-03,0,7\n2026-11-09,AD-03,0,7\n2026-11-16,AD-03,1,7\n2026-11-23,AD-03,0,7\n2026-11-02,AD-04,0,7\n2026-11-09,AD-04,1,7\n2026-11-16,AD-04,0,7\n2026-11-23,AD-04,0,7\n2026-11-02,AD-05,6,7\n2026-11-09,AD-05,7,7\n2026-11-16,AD-05,0,7\n2026-11-23,AD-05,0,7\n2026-11-02,AD-06,0,7\n2026-11-09,AD-06,0,7\n2026-11-16,AD-06,0,7\n2026-11-23,AD-06,1,7\n2026-11-02,AD-07,0,7\n2026-11-09,AD-07,0,7\n2026-11-16,AD-07,1,7\n2026-11-23,AD-07,0,7\n2026-11-02,AD-08,6,7\n2026-11-09,AD-08,7,7\n2026-11-16,AD-08,5,7\n2026-11-23,AD-08,6,7\n2026-11-02,AD-09,1,7\n2026-11-09,AD-09,0,7\n2026-11-16,AD-09,0,7\n2026-11-23,AD-09,0,7\n2026-11-02,AD-10,5,7\n2026-11-09,AD-10,6,7\n2026-11-16,AD-10,0,7\n2026-11-23,AD-10,0,7\n2026-11-02,AD-11,0,7\n2026-11-09,AD-11,0,7\n2026-11-16,AD-11,1,7\n2026-11-23,AD-11,0,7\n2026-11-02,AD-12,0,7\n2026-11-09,AD-12,1,7\n2026-11-16,AD-12,0,7\n2026-11-23,AD-12,0,7\n2026-11-02,AD-13,1,7\n2026-11-09,AD-13,0,7\n2026-11-16,AD-13,0,7\n2026-11-23,AD-13,0,7\n2026-11-02,AD-14,0,7\n2026-11-09,AD-14,0,7\n2026-11-16,AD-14,0,7\n2026-11-23,AD-14,0,7\n"}],"summary":"New weekly usage for Aldermoor, 2 to 29 November. Three docks that flew most nights flew nothing in the last two weeks. All three stayed online. No ticket has been raised and nobody at the customer has said anything.","set_off_at":"2026-11-14T10:39:16.120Z"}'::jsonb, '2026-11-14T10:40:00.377Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO activities (id, account_id, type, title, description, metadata, timestamp) VALUES ('39f409b8-e3cc-4158-ae6f-ed9f46ea6abd', 'A', 'task_created', 'Task Created: Coordinate Westmere dock battery replacements with Insp. Karen Mbeki', 'Assigned to: Field Lead, Priority: P1', '{}'::jsonb, '2026-11-14T10:40:01.993Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO activities (id, account_id, type, title, description, metadata, timestamp) VALUES ('9bf6f985-e220-47ba-accf-b36b16c90306', 'NGP', 'contract', 'Master Service Contract Verified', 'Executed £240k annual framework covering 8 autonomous inspection docks across regional grid.', '{}'::jsonb, '2026-11-11T11:07:28.689Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO activities (id, account_id, type, title, description, metadata, timestamp) VALUES ('53430b9f-7787-4a07-97e4-ad1fff11b12c', 'NGP', 'stakeholder', 'Stakeholder Review with Dr. Alistair Vance', 'Dr. Vance expressed high satisfaction with initial transmission tower imagery; requested winter storm protocol.', '{}'::jsonb, '2026-11-13T11:07:28.689Z'::timestamptz) ON CONFLICT DO NOTHING;
INSERT INTO activities (id, account_id, type, title, description, metadata, timestamp) VALUES ('a51e474c-3f9d-4cb2-bf59-ac37a696aef2', 'NGP', 'compliance', 'Fiona Gallagher Safety Review', 'Safety & Regulatory Director requested 400kV EMI shielding lab certification prior to Phase 2 expansion.', '{}'::jsonb, '2026-11-13T23:07:28.689Z'::timestamptz) ON CONFLICT DO NOTHING;

-- Table: hand_in_links
INSERT INTO hand_in_links (id, hosted_url, github_repo_url, thinking_doc_url, walkthrough_video_url, updated_at) VALUES ('current', 'https://crm-production-demo.railway.app', 'https://github.com/2neuronbrain/CRM', 'https://docs.google.com/document/d/example', 'https://drive.google.com/file/d/example', '2026-11-14T09:36:14.847Z'::timestamptz) ON CONFLICT DO NOTHING;
