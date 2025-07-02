import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { Account } from '../types'
import { Plus, Search, Edit, Trash2, Building2, Phone, Mail, Globe } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AccountsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const queryClient = useQueryClient()

  const { data: accounts, isLoading } = useQuery({
    queryKey: ['accounts', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('accounts')
        .select('*')
        .order('created_at', { ascending: false })

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`)
      }

      const { data, error } = await query
      if (error) throw error
      return data as Account[]
    }
  })

  const createMutation = useMutation({
    mutationFn: async (account: Partial<Account>) => {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      // Prepare account data with required fields
      const accountData = {
        ...account,
        owner_id: user.id,
        created_by: user.id,
        updated_by: user.id
      }

      const { data, error } = await supabase
        .from('accounts')
        .insert([accountData])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      setShowForm(false)
      toast.success('Account created successfully')
    },
    onError: (error: any) => {
      console.error('Account creation error:', error)
      toast.error(error.message || 'Failed to create account')
    }
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...account }: Partial<Account> & { id: string }) => {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      // Prepare update data
      const updateData = {
        ...account,
        updated_by: user.id
      }

      const { data, error } = await supabase
        .from('accounts')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      setEditingAccount(null)
      setShowForm(false)
      toast.success('Account updated successfully')
    },
    onError: (error: any) => {
      console.error('Account update error:', error)
      toast.error(error.message || 'Failed to update account')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      toast.success('Account deleted successfully')
    },
    onError: (error: any) => {
      console.error('Account deletion error:', error)
      toast.error(error.message || 'Failed to delete account')
    }
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const accountData = {
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      industry: formData.get('industry') as string,
      website: formData.get('website') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      description: formData.get('description') as string,
    }

    if (editingAccount) {
      updateMutation.mutate({ ...accountData, id: editingAccount.id })
    } else {
      createMutation.mutate(accountData)
    }
  }

  const handleEdit = (account: Account) => {
    setEditingAccount(account)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this account?')) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Accounts</h1>
        <button
          onClick={() => {
            setEditingAccount(null)
            setShowForm(true)
          }}
          className="btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Account
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search accounts..."
          className="input pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Accounts Grid */}
      {isLoading ? (
        <div className="text-center py-8">Loading accounts...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts?.map((account) => (
            <div key={account.id} className="card hover:shadow-lg transition-shadow">
              <div className="card-content">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Building2 className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-gray-900">{account.name}</h3>
                      <p className="text-sm text-gray-500 capitalize">{account.type}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(account)}
                      className="text-gray-400 hover:text-blue-600"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(account.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {account.industry && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Industry:</span> {account.industry}
                    </p>
                  )}
                  {account.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-3 w-3 mr-2" />
                      {account.phone}
                    </div>
                  )}
                  {account.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-3 w-3 mr-2" />
                      {account.email}
                    </div>
                  )}
                  {account.website && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Globe className="h-3 w-3 mr-2" />
                      <a href={account.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {account.website}
                      </a>
                    </div>
                  )}
                </div>

                {account.description && (
                  <p className="mt-3 text-sm text-gray-600 line-clamp-2">{account.description}</p>
                )}

                <div className="mt-4 text-xs text-gray-500">
                  Created {new Date(account.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!accounts?.length && !isLoading && (
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No accounts</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new account.</p>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingAccount ? 'Edit Account' : 'New Account'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="input mt-1"
                    defaultValue={editingAccount?.name || ''}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select name="type" className="input mt-1" defaultValue={editingAccount?.type || 'prospect'}>
                    <option value="prospect">Prospect</option>
                    <option value="customer">Customer</option>
                    <option value="partner">Partner</option>
                    <option value="vendor">Vendor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Industry</label>
                  <input
                    type="text"
                    name="industry"
                    className="input mt-1"
                    defaultValue={editingAccount?.industry || ''}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Website</label>
                  <input
                    type="url"
                    name="website"
                    className="input mt-1"
                    defaultValue={editingAccount?.website || ''}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    className="input mt-1"
                    defaultValue={editingAccount?.phone || ''}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="input mt-1"
                    defaultValue={editingAccount?.email || ''}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    className="input mt-1"
                    defaultValue={editingAccount?.description || ''}
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingAccount(null)
                    }}
                    className="btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="btn-primary"
                  >
                    {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save'}
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
