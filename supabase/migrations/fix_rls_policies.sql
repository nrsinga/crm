/*
  # Fix RLS Policies for CRM Tables

  1. Policy Updates
    - Update accounts table policies to allow authenticated users to insert/update their own records
    - Fix other CRM table policies for proper data access
    - Ensure policies work with the application's data flow

  2. Security
    - Maintain data isolation between users
    - Allow authenticated users to manage their own CRM data
    - Prevent unauthorized access to other users' data
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage their own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can manage their own contacts" ON contacts;
DROP POLICY IF EXISTS "Users can manage their own leads" ON leads;
DROP POLICY IF EXISTS "Users can manage their own opportunities" ON opportunities;
DROP POLICY IF EXISTS "Users can manage their own activities" ON activities;

-- Create new, more permissive policies for accounts
CREATE POLICY "Authenticated users can insert accounts" ON accounts
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view their own accounts" ON accounts
  FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR created_by = auth.uid());

CREATE POLICY "Users can update their own accounts" ON accounts
  FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() OR created_by = auth.uid())
  WITH CHECK (owner_id = auth.uid() OR created_by = auth.uid());

CREATE POLICY "Users can delete their own accounts" ON accounts
  FOR DELETE TO authenticated
  USING (owner_id = auth.uid() OR created_by = auth.uid());

-- Create new policies for contacts
CREATE POLICY "Authenticated users can insert contacts" ON contacts
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view their own contacts" ON contacts
  FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR created_by = auth.uid());

CREATE POLICY "Users can update their own contacts" ON contacts
  FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() OR created_by = auth.uid())
  WITH CHECK (owner_id = auth.uid() OR created_by = auth.uid());

CREATE POLICY "Users can delete their own contacts" ON contacts
  FOR DELETE TO authenticated
  USING (owner_id = auth.uid() OR created_by = auth.uid());

-- Create new policies for leads
CREATE POLICY "Authenticated users can insert leads" ON leads
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view their own leads" ON leads
  FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR created_by = auth.uid());

CREATE POLICY "Users can update their own leads" ON leads
  FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() OR created_by = auth.uid())
  WITH CHECK (owner_id = auth.uid() OR created_by = auth.uid());

CREATE POLICY "Users can delete their own leads" ON leads
  FOR DELETE TO authenticated
  USING (owner_id = auth.uid() OR created_by = auth.uid());

-- Create new policies for opportunities
CREATE POLICY "Authenticated users can insert opportunities" ON opportunities
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view their own opportunities" ON opportunities
  FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR created_by = auth.uid());

CREATE POLICY "Users can update their own opportunities" ON opportunities
  FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() OR created_by = auth.uid())
  WITH CHECK (owner_id = auth.uid() OR created_by = auth.uid());

CREATE POLICY "Users can delete their own opportunities" ON opportunities
  FOR DELETE TO authenticated
  USING (owner_id = auth.uid() OR created_by = auth.uid());

-- Create new policies for activities
CREATE POLICY "Authenticated users can insert activities" ON activities
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view their own activities" ON activities
  FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR created_by = auth.uid());

CREATE POLICY "Users can update their own activities" ON activities
  FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() OR created_by = auth.uid())
  WITH CHECK (owner_id = auth.uid() OR created_by = auth.uid());

CREATE POLICY "Users can delete their own activities" ON activities
  FOR DELETE TO authenticated
  USING (owner_id = auth.uid() OR created_by = auth.uid());