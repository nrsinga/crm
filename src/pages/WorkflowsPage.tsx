import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { Workflow } from '../types'
import { Plus, Search, Workflow as WorkflowIcon, Play, Pause, Edit, Trash2, Settings } from 'lucide-react'
import toast from 'react-hot-toast'

export default function WorkflowsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null)
  const [entityFilter, setEntityFilter] = useState('all')
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  const { data: workflows, isLoading } = useQuery({
    queryKey: ['workflows', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('created_by', user?.id)
        .order('created_at', { ascending: false })

      