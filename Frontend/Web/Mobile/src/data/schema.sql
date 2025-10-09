-- LeadZen Database Schema
-- Version: 1.0.0

-- Leads table: Core lead information
CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    company TEXT,
    phone_primary TEXT UNIQUE NOT NULL,
    phone_secondary TEXT,
    email TEXT,
    position TEXT,
    source TEXT DEFAULT 'manual',
    pipeline_stage TEXT DEFAULT 'follow_up',
    priority TEXT DEFAULT 'medium',
    value REAL DEFAULT 0,
    notes TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'USA',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_contact_at DATETIME,
    next_follow_up_at DATETIME
);

-- Call logs table: Track all call activities
CREATE TABLE IF NOT EXISTS call_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
    phone_number TEXT NOT NULL,
    call_type TEXT NOT NULL, -- 'incoming', 'outgoing', 'missed'
    call_status TEXT DEFAULT 'completed', -- 'completed', 'no_answer', 'busy', 'failed'
    duration INTEGER DEFAULT 0, -- Duration in seconds
    started_at DATETIME NOT NULL,
    ended_at DATETIME,
    recording_url TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Notes table: Additional notes for leads
CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    note_type TEXT DEFAULT 'general', -- 'general', 'meeting', 'task', 'reminder'
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Labels/Tags table: For categorizing leads
CREATE TABLE IF NOT EXISTS labels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    color TEXT DEFAULT '#14B8A6', -- Teal default
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Lead labels junction table: Many-to-many relationship
CREATE TABLE IF NOT EXISTS lead_labels (
    lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
    label_id INTEGER REFERENCES labels(id) ON DELETE CASCADE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (lead_id, label_id)
);

-- Tasks table: Follow-up tasks for leads
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date DATETIME,
    completed BOOLEAN DEFAULT 0,
    completed_at DATETIME,
    priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_leads_pipeline_stage ON leads(pipeline_stage);
CREATE INDEX IF NOT EXISTS idx_leads_priority ON leads(priority);
CREATE INDEX IF NOT EXISTS idx_leads_company ON leads(company);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_next_follow_up ON leads(next_follow_up_at);
CREATE INDEX IF NOT EXISTS idx_call_logs_lead_id ON call_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_started_at ON call_logs(started_at);
CREATE INDEX IF NOT EXISTS idx_notes_lead_id ON notes(lead_id);
CREATE INDEX IF NOT EXISTS idx_tasks_lead_id ON tasks(lead_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);