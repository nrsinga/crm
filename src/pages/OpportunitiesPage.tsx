import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { Opportunity, Account, Contact } from '../types'
import { Plus, Search, Target, DollarSign, Calendar, Building2, User, Edit, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function OpportunitiesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null)
  const [stageFilter, setStageFilter] = useState('all')
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  const { data: opportunities, isLoading } = useQuery({
    queryKey: ['opportunities', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('opportunities')
        .select(`
          *,
          account:accounts(id, name),
          contact:contacts(id, first_name, last_name)
        `)
        .eq('owner_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Opportunity[]
    },
  })

  const { data: accounts } = useQuery({
    queryKey: ['accounts-list', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('accounts')
        .select('id, name')
        .eq('owner_id', user?.id)
        .order('name')

      if (error) throw error
      return data as Pick<Account, 'id' | 'name'>[]
    },
  })

  const { data: contacts } = useQuery({
    queryKey: ['contacts-list', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('id, first_name, last_name, account_id')
        .eq('owner_id', user?.id)
        .order('first_name')

      if (error) throw error
      return data as Pick<Contact, 'id' | 'first_name' | 'last_name' | 'account_id'>[]
    },
  })

  const createMutation = useMutation({
    mutationFn: async (opportunity: Partial<Opportunity>) => {
      const { data, error } = await supabase
        .from('opportunities')
        .insert([{ ...opportunity, owner_id: user?.id, created_by: user?.id }])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] })
      setShowForm(false)
      toast.success('Opportunity created successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create opportunity')
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...opportunity }: Partial<Opportunity> & { id: string }) => {
      const { data, error } = await supabase
        .from('opportunities')
        .update({ ...opportunity, updated_by: user?.id })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] })
      setEditingOpportunity(null)
      setShowForm(false)
      toast.success('Opportunity updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update opportunity')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] })
      toast.success('Opportunity deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete opportunity')
    },
  })

  const filteredOpportunities = opportunities?.filter(opportunity => {
    const matchesSearch = opportunity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opportunity.account?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStage = stageFilter === 'all' || opportunity.stage === stageFilter
    
    return matchesSearch && matchesStage
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const opportunityData = {
      name: formData.get('name') as string,
      account_id: formData.get('account_id') as string,
      contact_id: formData.get('contact_id') as string || null,
      amount: formData.get('amount') ? Number(formData.get('amount')) : undefined,
      stage: formData.get('stage') as string,
      probability: Number(formData.get('probability')),
      close_date: formData.get('close_date') as string || null,
      lead_source: formData.get('lead_source') as string,
      description: formData.get('description') as string,
      competitor: formData.get('competitor') as string,
      next_step: formData.get('next_step') as string,
    }

    if (editingOpportunity) {
      updateMutation.mutate({ id: editingOpportunity.id, ...opportunityData })
    } else {
      createMutation.mutate(opportunityData)
    }
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'qualification': return 'bg-blue-100 text-blue-800'
      case 'needs_analysis': return 'bg-yellow-100 text-yellow-800'
      case 'proposal': return 'bg-purple-100 text-purple-800'
      case 'negotiation': return 'bg-orange-100 text-orange-800'
      case 'closed_won': return 'bg-green-100 text-green-800'
      case 'closed_lost': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getProbabilityColor = (probability: number) => {
    if (probability >= 75) return 'text-green-600'
    if (probability >= 50) return 'text-yellow-600'
    if (probability >= 25) return 'text-orange-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Opportunities</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track and manage your sales opportunities
          </p>
        </div>
        <button
          onClick={() => {
            setEditingOpportunity(null)
            setShowForm(true)
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Opportunity
        </button>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search opportunities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Stages</option>
          <option value="qualification">Qualification</option>
          <option value="needs_analysis">Needs Analysis</option>
          <option value="proposal">Proposal</option>
          <option value="negotiation">Negotiation</option>
          <option value="closed_won">Closed Won</option>
          <option value="closed_lost">Closed Lost</option>
        </select>
      </div>

      {/* Opportunities Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredOpportunities?.map((opportunity) => (
            <div key={opportunity.id} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Target className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">{opportunity.name}</h3>
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStageColor(opportunity.stage)}`}>
                        {opportunity.stage.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingOpportunity(opportunity)
                        setShowForm(true)
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(opportunity.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {opportunity.amount && (
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="h-4 w-4 mr-2" />
                      ${opportunity.amount.toLocaleString()}
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium">Probability:</span>
                    <span className={`ml-2 font-semibold ${getProbabilityColor(opportunity.probability)}`}>
                      {opportunity.probability}%
                    </span>
                  </div>

                  {opportunity.close_date && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(opportunity.close_date).toLocaleDateString()}
                    </div>
                  )}

                  {opportunity.account && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Building2 className="h-4 w-4 mr-2" />
                      {opportunity.account.name}
                    </div>
                  )}

                  {opportunity.contact && (
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="h-4 w-4 mr-2" />
                      {opportunity.contact.first_name} {opportunity.contact.last_name}
                    </div>
                  )}
                </div>

                {opportunity.next_step && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Next Step:</span> {opportunity.next_step}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white max-h-[80vh] overflow-y-auto">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingOpportunity ? 'Edit Opportunity' : 'New Opportunity'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    defaultValue={editingOpportunity?.name}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Account *</label>
                  <select
                    name="account_id"
                    required
                    defaultValue={editingOpportunity?.account_id || ''}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select an account</option>
                    {accounts?.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact</label>
                  <select
                    name="contact_id"
                    defaultValue={editingOpportunity?.contact_id || ''}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a contact</option>
                    {contacts?.map((contact) => (
                      <option key={contact.id} value={contact.id}>
                        {contact.first_name} {contact.last_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                    <input
                      type="number"
                      name="amount"
                      step="0.01"
                      defaultValue={editingOpportunity?.amount}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Probability (%)</label>
                    <input
                      type="number"
                      name="probability"
                      min="0"
                      max="100"
                      defaultValue={editingOpportunity?.probability || 10}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Stage</label>
                  <select
                    name="stage"
                    defaultValue={editingOpportunity?.stage || 'qualification'}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="qualification">Qualification</option>
                    <option value="needs_analysis">Needs Analysis</option>
                    <option value="proposal">Proposal</option>
                    <option value="negotiation">Negotiation</option>
                    <option value="closed_won">Closed Won</option>
                    <option value="closed_lost">Closed Lost</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Close Date</label>
                  <input
                    type="date"
                    name="close_date"
                    defaultValue={editingOpportunity?.close_date}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Next Step</label>
                  <input
                    type="text"
                    name="next_step"
                    defaultValue={editingOpportunity?.next_step}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingOpportunity(null)
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {editingOpportunity ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
