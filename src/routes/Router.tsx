import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { SignUpPage } from '@/features/auth/pages/SignUpPage'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { TicketListPage } from '@/features/tickets/pages/TicketListPage'
import { TicketDetailPage } from '@/features/tickets/pages/TicketDetailPage'
import { NewTicketPage } from '@/features/tickets/pages/NewTicketPage'
import { ProfilePage } from '@/features/profile/pages/ProfilePage'
import { CustomerListPage } from '@/features/customers/pages/CustomerListPage'
import { OrganizationListPage, OrganizationDetailPage } from '@/features/organizations'
import { CustomerDetailPage } from '@/features/customers/pages/CustomerDetailPage'
import { DataPage } from '@/features/data/pages/DataPage'
import { WorkerProfilePage } from '@/features/organizations/pages/WorkerProfilePage'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

interface ProtectedRouteProps {
  children: React.ReactNode
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuthStore()
  
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function RouteChangeLogger() {
  const location = useLocation()
  
  useEffect(() => {
    console.log('[Router] Location changed:', {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash
    })
  }, [location])

  return null
}

export function Router() {
  console.log('[Router] Rendering Router')
  
  return (
    <BrowserRouter>
      <RouteChangeLogger />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard and Views */}
          <Route index element={<Navigate to="/views" replace />} />
          <Route path="dashboard" element={<Navigate to="/views" replace />} />
          
          {/* Views Routes */}
          <Route path="views" element={<TicketListPage />} />
          <Route path="views/unassigned" element={<TicketListPage view="unassigned" />} />
          <Route path="views/all" element={<TicketListPage view="all" />} />
          <Route path="views/recently-updated" element={<TicketListPage view="recent" />} />
          <Route path="views/solved" element={<TicketListPage view="solved" />} />
          
          {/* Ticket Routes */}
          <Route path="tickets/new" element={<NewTicketPage />} />
          <Route path="tickets/:ticketId" element={<TicketDetailPage />} />

          {/* Customer Routes */}
          <Route path="customers" element={<CustomerListPage />} />
          <Route path="customers/:customerId" element={<CustomerDetailPage />} />
          <Route path="customers/:customerId/:tab" element={<CustomerDetailPage />} />

          {/* Organization Routes */}
          <Route path="organizations" element={<OrganizationListPage />} />
          <Route path="organizations/:organizationId" element={<OrganizationDetailPage />} />
          <Route path="organizations/:organizationId/:tab" element={<OrganizationDetailPage />} />
          <Route path="organizations/:organizationId/workers/:workerId" element={<WorkerProfilePage />} />

          {/* Profile Route */}
          <Route path="profile" element={<ProfilePage />} />

          {/* Data Route */}
          <Route path="data" element={<DataPage />} />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
} 