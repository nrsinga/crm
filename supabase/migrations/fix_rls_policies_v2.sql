/*
  # Fix RLS Policies for CRM Tables - Version 2

  1. Policy Updates
    - Drop all existing policies with correct names
    - Create new policies that allow proper data access
    - Ensure policies work with the application's data flow

  2. Security
    - Maintain data isolation between users
    - Allow authenticated users to manage their own CRM data
    - Prevent unauthorized access to other users' data
*/

-- Drop all existing policies with their actual names
DROP POLICY IF EXISTS "Authenticated users can insert accounts" ON accounts;
DROP POLICY IF EXISTS "Users can view their own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can update their own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can delete their own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can manage their own accounts" ON accounts;

DROP POLICY IF EXISTS "Authenticated users can insert contacts" ON contacts;
DROP POLICY IF EXISTS "Users can view their own contacts" ON contacts;
DROP POLICY IF EXISTS "Users can update their own contacts" ON contacts;
DROP POLICY IF EXISTS "Users can delete their own contacts" ON contacts;
DROP POLICY IF EXISTS "Users can manage their own contacts" ON contacts;

DROP POLICY IF EXISTS "Authenticated users can insert leads" ON leads;
DROP POLICY IF EXISTS "Users can view their own leads" ON leads;
DROP POLICY IF EXISTS "Users can update their own leads" ON leads;
DROP POLICY IF EXISTS "Users can delete their own leads" ON leads;
DROP POLICY IF EXISTS "Users can manage their own leads" ON leads;

DROP POLICY IF EXISTS "Authenticated users can insert opportunities" ON opportunities;
DROP POLICY IF EXISTS "Users can view their own opportunities" ON opportunities;
DROP POLICY IF EXISTS "Users can update their own opportunities" ON opportunities;
DROP POLICY IF EXISTS "Users can delete their own opportunities" ON opportunities;
DROP POLICY IF EXISTS "Users can manage their own opportunities" ON opportunities;

DROP POLICY IF EXISTS "Authenticated users can insert activities" ON activities;
DROP POLICY IF EXISTS "Users can view their own activities" ON activities;
DROP POLICY IF EXISTS "Users can update their own activities" ON activities;
DROP POLICY IF EXISTS "Users can delete their own activities" ON activities;
DROP POLICY IF EXISTS "Users can manage their own activities" ON activities;

-- Create new policies for accounts
CREATE POLICY "accounts_insert_policy" ON accounts
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "accounts_select_policy" ON accounts
  FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR created_by = auth.uid());

CREATE POLICY "accounts_update_policy" ON accounts
  FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() OR created_by = auth.uid())
  WITH CHECK (owner_id = auth.uid() OR created_by = auth.uid());

CREATE POLICY "accounts_delete_policy" ON accounts
  FOR DELETE TO authenticated
  USING (owner_id = auth.uid() OR created_by = auth.uid());

-- Create new policies for contacts
CREATE POLICY "contacts_insert_policy" ON contacts
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "contacts_select_policy" ON contacts
  FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR created_by = auth.uid());

CREATE POLICY "contacts_update_policy" ON contacts
  FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() OR created_by = auth.uid())
  WITH CHECK (owner_id = auth.uid() OR created_by = auth.uid());

CREATE POLICY "contacts_delete_policy" ON contacts
  FOR DELETE TO authenticated
  USING (owner_id = auth.uid() OR created_by = auth.uid());

-- Create new policies for leads
CREATE POLICY "leads_insert_policy" ON leads
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "leads_select_policy" ON leads
  FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR created_by = auth.uid());

CREATE POLICY "leads_update_policy" ON leads
  FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() OR created_by = auth.uid())
  WITH CHECK (owner_id = auth.uid() OR created_by = auth.uid());

CREATE POLICY "leads_delete_policy" ON leads
  FOR DELETE TO authenticated
  USING (owner_id = auth.uid() OR created_by = auth.uid());

-- Create new policies for opportunities
CREATE POLICY "opportunities_insert_policy" ON opportunities
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "opportunities_select_policy" ON opportunities
  FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR created_by = auth.uid());

CREATE POLICY "opportunities_update_policy" ON opportunities
  FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() OR created_by = auth.uid())
  WITH CHECK (owner_id = auth.uid() OR created_by = auth.uid());

CREATE POLICY "opportunities_delete_policy" ON opportunities
  FOR DELETE TO authenticated
  USING (owner_id = auth.uid() OR created_by = auth.uid());

-- Create new policies for activities
CREATE POLICY "activities_insert_policy" ON activities
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "activities_select_policy" ON activities
  FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR created_by = auth.uid());

CREATE POLICY "activities_update_policy" ON activities
  FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() OR created_by = auth.uid())
  WITH CHECK (owner_id = auth.uid() OR created_by = auth.uid());

CREATE POLICY "activities_delete_policy" ON activities
  FOR DELETE TO authenticated
  USING (owner_id = auth.uid() OR created_by = auth.uid());