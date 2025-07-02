import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { 
  Building2, 
  Users, 
  UserPlus, 
  Target, 
  TrendingUp, 
  Calendar,
  DollarSign,
  Activity
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']

export default function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [accounts, contacts, leads, opportunities] = await Promise.all([
        supabase.from('accounts').select('id', { count: 'exact' }),
        supabase.from('contacts').select('id', { count: 'exact' }),
        supabase.from('leads').select('id', { count: 'exact' }),
        supabase.from('opportunities').select('amount', { count: 'exact' })
      ])

      const totalRevenue = opportunities.data?.reduce((sum, opp) => sum + (opp.amount || 0), 0) || 0

      return {
        accounts: accounts.count || 0,
        contacts: contacts.count || 0,
        leads: leads.count || 0,
        opportunities: opportunities.count || 0,
        revenue: totalRevenue
      }
    }
  })

  const { data: recentActivities } = useQuery({
    queryKey: ['recent-activities'],
    queryFn: async () => {
      const { data } = await supabase
        .from('activities')
        .select(`
          *,
          account:accounts(name),
          contact:contacts(first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .limit(5)

      return data || []
    }
  })

  const { data: opportunityData } = useQuery({
    queryKey: ['opportunity-chart'],
    queryFn: async () => {
      const { data } = await supabase
        .from('opportunities')
        .select('stage, amount')

      const stageData = data?.reduce((acc: any, opp) => {
        const stage = opp.stage || 'Unknown'
        if (!acc[stage]) {
          acc[stage] = { stage, count: 0, value: 0 }
        }
        acc[stage].count += 1
        acc[stage].value += opp.amount || 0
        return acc
      }, {})

      return Object.values(stageData || {})
    }
  })

  const statCards = [
    {
      name: 'Total Accounts',
      value: stats?.accounts || 0,
      icon: Building2,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      name: 'Total Contacts',
      value: stats?.contacts || 0,
      icon: Users,
      color: 'bg-green-500',
      change: '+8%'
    },
    {
      name: 'Active Leads',
      value: stats?.leads || 0,
      icon: UserPlus,
      color: 'bg-yellow-500',
      change: '+23%'
    },
    {
      name: 'Opportunities',
      value: stats?.opportunities || 0,
      icon: Target,
      color: 'bg-purple-500',
      change: '+15%'
    },
    {
      name: 'Total Revenue',
      value: `$${(stats?.revenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-indigo-500',
      change: '+18%'
    }
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="card">
              <div className="card-content">
                <div className="flex items-center">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <div className="flex items-center">
                      <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                      <span className="ml-2 text-sm text-green-600 font-medium">
                        {stat.change}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium">Opportunities by Stage</h3>
          </div>
          <div className="card-content">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={opportunityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="stage" />
                <YAxis />
                <Tooltip formatter={(value: any) => [`$${value.toLocaleString()}`, 'Value']} />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium">Pipeline Distribution</h3>
          </div>
          <div className="card-content">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={opportunityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ stage, count }) => `${stage}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {opportunityData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium">Recent Activities</h3>
        </div>
        <div className="card-content">
          <div className="space-y-4">
            {recentActivities?.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <Activity className="h-5 w-5 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.subject}</p>
                  <p className="text-sm text-gray-500">
                    {activity.account?.name || activity.contact ? 
                      `${activity.contact?.first_name} ${activity.contact?.last_name}` : 
                      'No associated record'
                    }
                  </p>
                </div>
                <div className="flex-shrink-0 text-sm text-gray-500">
                  {new Date(activity.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
            {!recentActivities?.length && (
              <p className="text-gray-500 text-center py-8">No recent activities</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
