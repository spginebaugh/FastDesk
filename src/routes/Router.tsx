import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { SignUpPage } from '@/features/auth/pages/SignUpPage'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { TicketListPage } from '@/features/tickets/pages/TicketListPage'
import { TicketDetailPage } from '@/features/tickets/pages/TicketDetailPage'
import { NewTicketPage } from '@/features/tickets/pages/NewTicketPage'
import { ProfilePage } from '@/features/profile/pages/ProfilePage'

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

export function Router() {
  return (
    <BrowserRouter>
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
          {/* Dashboard and Tickets */}
          <Route index element={<Navigate to="/tickets" replace />} />
          <Route path="dashboard" element={<Navigate to="/tickets" replace />} />
          
          {/* Ticket Routes */}
          <Route path="tickets" element={<TicketListPage />} />
          <Route path="tickets/unassigned" element={<TicketListPage view="unassigned" />} />
          <Route path="tickets/all" element={<TicketListPage view="all" />} />
          <Route path="tickets/recently-updated" element={<TicketListPage view="recent" />} />
          <Route path="tickets/new" element={<NewTicketPage />} />
          <Route path="tickets/:ticketId" element={<TicketDetailPage />} />

          {/* Profile Route */}
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
} 