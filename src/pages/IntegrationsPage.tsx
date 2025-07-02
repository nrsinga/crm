import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { Plus, Search, Plug, Settings, Check, X, ExternalLink, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

interface Integration {
  id: string
  name: string
  description: string
  category: string
  status: 'connected' | 'available' | 'error'
  icon: string
  website: string
  features: string[]
  setup_required: boolean
}

const availableIntegrations: Integration[] = [
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Sync data with Salesforce CRM for seamless workflow integration',
    category: 'CRM',
    status: 'available',
    icon: '🏢',
    website: 'https://salesforce.com',
    features: ['Data Sync', 'Lead Import', 'Contact Sync', 'Opportunity Tracking'],
    setup_required: true
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Connect with HubSpot for marketing automation and lead nurturing',
    category: 'Marketing',
    status: 'connected',
    icon: '🎯',
    website: 'https://hubspot.com',
    features: ['Email Marketing', 'Lead Scoring', 'Analytics', 'Automation'],
    setup_required: false
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    description: 'Email marketing platform integration for campaign management',
    category: 'Marketing',
    status: 'available',
    icon: '📧',
    website: 'https://mailchimp.com',
    features: ['Email Campaigns', 'Audience Sync', 'Analytics', 'Templates'],
    setup_required: true
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Get CRM notifications and updates directly in your Slack channels',
    category: 'Communication',
    status: 'connected',
    icon: '💬',
    website: 'https://slack.com',
    features: ['Notifications', 'Deal Updates', 'Team Collaboration', 'Bot Commands'],
    setup_required: false
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Connect with 5000+ apps through Zapier automation workflows',
    category: 'Automation',
    status: 'available',
    icon: '⚡',
    website: 'https://zapier.com',
    features: ['Workflow Automation', '5000+ App Connections', 'Triggers', 'Actions'],
    setup_required: true
  },
  {
    id: 'google-workspace',
    name: 'Google Workspace',
    description: 'Integrate with Gmail, Calendar, and Google Drive for productivity',
    category: 'Productivity',
    status: 'error',
    icon: '🔍',
    website: 'https://workspace.google.com',
    features: ['Gmail Sync', 'Calendar Integration', 'Drive Storage', 'Contacts Sync'],
    setup_required: true
  },
  {
    id: 'microsoft-365',
    name: 'Microsoft 365',
    description: 'Connect with Outlook, Teams, and OneDrive for seamless workflow',
    category: 'Productivity',
    status: 'available',
    icon: '🏢',
    website: 'https://microsoft.com',
    features: ['Outlook Integration', 'Teams Notifications', 'OneDrive Storage', 'Calendar Sync'],
    setup_required: true
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    description: 'Sync financial data and invoicing with QuickBooks accounting',
    category: 'Finance',
    status: 'available',
    icon: '💰',
    website: 'https://quickbooks.intuit.com',
    features: ['Invoice Sync', 'Payment Tracking', 'Financial Reports', 'Customer Data'],
    setup_required: true
  }
]

export default function IntegrationsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
  const { user } = useAuthStore()

  const categories = ['all', 'CRM', 'Marketing', 'Communication', 'Automation', 'Productivity', 'Finance']

  const filteredIntegrations = availableIntegrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = categoryFilter === 'all' || integration.category === categoryFilter
    
    return matchesSearch && matchesCategory
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800'
      case 'available': return 'bg-blue-100 text-blue-800'
      case 'error': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return Check
      case 'available': return Plug
      case 'error': return X
      default: return Settings
    }
  }

  const handleConnect = (integration: Integration) => {
    if (integration.status === 'connected') {
      toast.success(`${integration.name} is already connected`)
    } else if (integration.status === 'error') {
      toast.error(`${integration.name} has connection issues. Please check configuration.`)
    } else {
      toast.success(`Connecting to ${integration.name}...`)
      // Here you would implement the actual connection logic
    }
  }

  const handleDisconnect = (integration: Integration) => {
    toast.success(`Disconnected from ${integration.name}`)
    // Here you would implement the actual disconnection logic
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
          <p className="mt-1 text-sm text-gray-500">
            Connect your CRM with external tools and services
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {filteredIntegrations.filter(i => i.status === 'connected').length} connected
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search integrations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category === 'all' ? 'All Categories' : category}
            </option>
          ))}
        </select>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIntegrations.map((integration) => {
          const StatusIcon = getStatusIcon(integration.status)
          return (
            <div key={integration.id} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="text-2xl mr-3">{integration.icon}</div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{integration.name}</h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">{integration.category}</span>
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(integration.status)}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {integration.status}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedIntegration(integration)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Settings className="h-5 w-5" />
                  </button>
                </div>

                <p className="mt-4 text-sm text-gray-600">{integration.description}</p>

                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Features:</h4>
                  <div className="flex flex-wrap gap-1">
                    {integration.features.slice(0, 3).map((feature, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                        {feature}
                      </span>
                    ))}
                    {integration.features.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                        +{integration.features.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex space-x-3">
                  {integration.status === 'connected' ? (
                    <button
                      onClick={() => handleDisconnect(integration)}
                      className="flex-1 bg-red-600 text-white text-sm font-medium py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={() => handleConnect(integration)}
                      className="flex-1 bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      {integration.status === 'error' ? 'Reconnect' : 'Connect'}
                    </button>
                  )}
                  <a
                    href={integration.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Integration Details Modal */}
      {selectedIntegration && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white max-h-[80vh] overflow-y-auto">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{selectedIntegration.icon}</span>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{selectedIntegration.name}</h3>
                    <p className="text-sm text-gray-500">{selectedIntegration.category}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedIntegration(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-sm text-gray-600">{selectedIntegration.description}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">All Features</h4>
                  <div className="space-y-1">
                    {selectedIntegration.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Status</h4>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedIntegration.status)}`}>
                    {React.createElement(getStatusIcon(selectedIntegration.status), { className: "h-4 w-4 mr-2" })}
                    {selectedIntegration.status}
                  </div>
                </div>

                {selectedIntegration.setup_required && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                    <div className="flex">
                      <Zap className="h-5 w-5 text-yellow-400 mr-2" />
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800">Setup Required</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          This integration requires additional configuration before it can be used.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setSelectedIntegration(null)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    Close
                  </button>
                  {selectedIntegration.status === 'connected' ? (
                    <button
                      onClick={() => {
                        handleDisconnect(selectedIntegration)
                        setSelectedIntegration(null)
                      }}
                      className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        handleConnect(selectedIntegration)
                        setSelectedIntegration(null)
                      }}
                      className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                    >
                      {selectedIntegration.status === 'error' ? 'Reconnect' : 'Connect'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
