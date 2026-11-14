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
  role VARCHAR(255),
  organization VARCHAR(255),
  stance VARCHAR(100) DEFAULT 'Unknown',
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
