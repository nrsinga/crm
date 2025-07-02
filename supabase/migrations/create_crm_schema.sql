/*
  # CRM System Database Schema

  1. New Tables
    - `accounts` - Company/organization records
    - `contacts` - Individual contact records
    - `leads` - Potential customer records
    - `opportunities` - Sales opportunities
    - `activities` - Tasks, calls, meetings, emails
    - `workflows` - Automated workflow definitions
    - `workflow_executions` - Workflow execution history
    - `integrations` - External system integrations
    - `custom_fields` - Dynamic field definitions
    - `notes` - General notes and comments
    - `documents` - File attachments

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Secure data access based on user permissions

  3. Features
    - Full audit trail with created/updated timestamps
    - Flexible custom fields system
    - Workflow automation support
    - Integration API support
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text DEFAULT 'prospect',
  industry text,
  website text,
  phone text,
  email text,
  billing_address jsonb,
  shipping_address jsonb,
  annual_revenue numeric,
  employee_count integer,
  description text,
  owner_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

-- Contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid REFERENCES accounts(id) ON DELETE SET NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text,
  phone text,
  mobile text,
  title text,
  department text,
  address jsonb,
  lead_source text,
  status text DEFAULT 'active',
  owner_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  company text,
  email text,
  phone text,
  title text,
  lead_source text,
  status text DEFAULT 'new',
  rating text DEFAULT 'warm',
  industry text,
  annual_revenue numeric,
  employee_count integer,
  description text,
  converted boolean DEFAULT false,
  converted_account_id uuid REFERENCES accounts(id),
  converted_contact_id uuid REFERENCES contacts(id),
  owner_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

-- Opportunities table
CREATE TABLE IF NOT EXISTS opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  account_id uuid REFERENCES accounts(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  amount numeric,
  stage text DEFAULT 'qualification',
  probability integer DEFAULT 10,
  close_date date,
  lead_source text,
  description text,
  competitor text,
  next_step text,
  owner_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL, -- 'task', 'call', 'meeting', 'email'
  subject text NOT NULL,
  description text,
  status text DEFAULT 'open',
  priority text DEFAULT 'normal',
  due_date timestamptz,
  duration integer, -- in minutes
  account_id uuid REFERENCES accounts(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  opportunity_id uuid REFERENCES opportunities(id) ON DELETE CASCADE,
  owner_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

-- Workflows table
CREATE TABLE IF NOT EXISTS workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  trigger_type text NOT NULL, -- 'record_created', 'record_updated', 'field_changed', 'scheduled'
  trigger_conditions jsonb,
  actions jsonb NOT NULL,
  is_active boolean DEFAULT true,
  entity_type text NOT NULL, -- 'account', 'contact', 'lead', 'opportunity'
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

-- Workflow executions table
CREATE TABLE IF NOT EXISTS workflow_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid REFERENCES workflows(id) ON DELETE CASCADE,
  entity_id uuid NOT NULL,
  entity_type text NOT NULL,
  status text DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
  error_message text,
  execution_data jsonb,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Integrations table
CREATE TABLE IF NOT EXISTS integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL, -- 'ticketing', 'erp', 'email', 'calendar'
  config jsonb NOT NULL,
  is_active boolean DEFAULT true,
  last_sync timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Custom fields table
CREATE TABLE IF NOT EXISTS custom_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL, -- 'account', 'contact', 'lead', 'opportunity'
  field_name text NOT NULL,
  field_type text NOT NULL, -- 'text', 'number', 'date', 'boolean', 'select'
  field_options jsonb, -- for select fields
  is_required boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  is_private boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  file_path text NOT NULL,
  file_size integer,
  mime_type text,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own accounts" ON accounts
  FOR ALL TO authenticated
  USING (owner_id = auth.uid() OR created_by = auth.uid());

CREATE POLICY "Users can manage their own contacts" ON contacts
  FOR ALL TO authenticated
  USING (owner_id = auth.uid() OR created_by = auth.uid());

CREATE POLICY "Users can manage their own leads" ON leads
  FOR ALL TO authenticated
  USING (owner_id = auth.uid() OR created_by = auth.uid());

CREATE POLICY "Users can manage their own opportunities" ON opportunities
  FOR ALL TO authenticated
  USING (owner_id = auth.uid() OR created_by = auth.uid());

CREATE POLICY "Users can manage their own activities" ON activities
  FOR ALL TO authenticated
  USING (owner_id = auth.uid() OR created_by = auth.uid());

CREATE POLICY "Users can manage workflows" ON workflows
  FOR ALL TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Users can view workflow executions" ON workflow_executions
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can manage integrations" ON integrations
  FOR ALL TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Users can manage custom fields" ON custom_fields
  FOR ALL TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Users can manage notes" ON notes
  FOR ALL TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Users can manage documents" ON documents
  FOR ALL TO authenticated
  USING (created_by = auth.uid());

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_accounts_owner ON accounts(owner_id);
CREATE INDEX IF NOT EXISTS idx_contacts_account ON contacts(account_id);
CREATE INDEX IF NOT EXISTS idx_contacts_owner ON contacts(owner_id);
CREATE INDEX IF NOT EXISTS idx_leads_owner ON leads(owner_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_account ON opportunities(account_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_owner ON opportunities(owner_id);
CREATE INDEX IF NOT EXISTS idx_activities_owner ON activities(owner_id);
CREATE INDEX IF NOT EXISTS idx_activities_account ON activities(account_id);
CREATE INDEX IF NOT EXISTS idx_activities_contact ON activities(contact_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow ON workflow_executions(workflow_id);

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON opportunities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON workflows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();