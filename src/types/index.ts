export interface Account {
  id: string
  name: string
  type: 'prospect' | 'customer' | 'partner' | 'vendor'
  industry?: string
  website?: string
  phone?: string
  email?: string
  annual_revenue?: number
  employee_count?: number
  description?: string
  owner_id: string
  created_by: string
  updated_by?: string
  created_at: string
  updated_at: string
}

export interface Contact {
  id: string
  account_id?: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  mobile?: string
  title?: string
  department?: string
  status: 'active' | 'inactive'
  lead_source?: string
  owner_id: string
  created_by: string
  updated_by?: string
  created_at: string
  updated_at: string
  account?: Pick<Account, 'id' | 'name'>
}

export interface Lead {
  id: string
  first_name: string
  last_name: string
  company?: string
  email?: string
  phone?: string
  title?: string
  lead_source?: string
  status: 'new' | 'contacted' | 'qualified' | 'unqualified'
  rating: 'hot' | 'warm' | 'cold'
  industry?: string
  annual_revenue?: number
  employee_count?: number
  description?: string
  converted: boolean
  converted_account_id?: string
  converted_contact_id?: string
  owner_id: string
  created_by: string
  updated_by?: string
  created_at: string
  updated_at: string
}

export interface Opportunity {
  id: string
  name: string
  account_id: string
  contact_id?: string
  amount?: number
  stage: 'qualification' | 'needs_analysis' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
  probability: number
  close_date?: string
  lead_source?: string
  description?: string
  competitor?: string
  next_step?: string
  owner_id: string
  created_by: string
  updated_by?: string
  created_at: string
  updated_at: string
  account?: Pick<Account, 'id' | 'name'>
  contact?: Pick<Contact, 'id' | 'first_name' | 'last_name'>
}

export interface Activity {
  id: string
  type: 'task' | 'call' | 'meeting' | 'email'
  subject: string
  description?: string
  status: 'open' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'normal' | 'high'
  due_date?: string
  duration?: number
  account_id?: string
  contact_id?: string
  lead_id?: string
  opportunity_id?: string
  owner_id: string
  created_by: string
  updated_by?: string
  created_at: string
  updated_at: string
  account?: Pick<Account, 'id' | 'name'>
  contact?: Pick<Contact, 'id' | 'first_name' | 'last_name'>
  lead?: Pick<Lead, 'id' | 'first_name' | 'last_name'>
  opportunity?: Pick<Opportunity, 'id' | 'name'>
}

export interface Workflow {
  id: string
  name: string
  description?: string
  entity_type: 'account' | 'contact' | 'lead' | 'opportunity'
  trigger_type: 'manual' | 'automatic'
  trigger_conditions?: any
  actions?: any
  is_active: boolean
  created_by: string
  updated_by?: string
  created_at: string
  updated_at: string
}
