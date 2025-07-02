import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import AccountsPage from './pages/AccountsPage'
import ContactsPage from './pages/ContactsPage'
import LeadsPage from './pages/LeadsPage'
import OpportunitiesPage from './pages/OpportunitiesPage'
import ActivitiesPage from './pages/ActivitiesPage'
import WorkflowsPage from './pages/WorkflowsPage'
import IntegrationsPage from './pages/IntegrationsPage'
import SettingsPage from './pages/SettingsPage'

function App() {
  const { user } = useAuthStore()

  if (!user) {
    return <LoginPage />
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/accounts" element={<AccountsPage />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/leads" element={<LeadsPage />} />
        <Route path="/opportunities" element={<OpportunitiesPage />} />
        <Route path="/activities" element={<ActivitiesPage />} />
        <Route path="/workflows" element={<WorkflowsPage />} />
        <Route path="/integrations" element={<IntegrationsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Layout>
  )
}

export default App
