import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/components/protected-route'
import { AdminRoute } from '@/components/admin-route'
import { HomePage } from '@/pages/HomePage'
import { DirectoryPage } from '@/pages/DirectoryPage'
import { CategoriesPage } from '@/pages/CategoriesPage'
import { BusinessDetailPage } from '@/pages/BusinessDetailPage'
import { CommunityPage } from '@/pages/CommunityPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { JobsPage } from '@/pages/JobsPage'
import { JobDetailPage } from '@/pages/JobDetailPage'
import { NewJobPage } from '@/pages/NewJobPage'
import { EventsPage } from '@/pages/EventsPage'
import { EventDetailPage } from '@/pages/EventDetailPage'
import { NewEventPage } from '@/pages/NewEventPage'
import { AdminPage } from '@/pages/AdminPage'
import { SignInPage } from '@/pages/SignInPage'
import { SignUpPage } from '@/pages/SignUpPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { NewBusinessPage } from '@/pages/NewBusinessPage'
import { EditBusinessPage } from '@/pages/EditBusinessPage'
import { InquiriesPage } from '@/pages/InquiriesPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/directory" element={<DirectoryPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/community/:userId" element={<ProfilePage />} />
        <Route path="/business/:slug" element={<BusinessDetailPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:slug" element={<JobDetailPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:slug" element={<EventDetailPage />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />

        {/* Protected */}
        <Route path="/jobs/new" element={<ProtectedRoute><NewJobPage /></ProtectedRoute>} />
        <Route path="/events/new" element={<ProtectedRoute><NewEventPage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/dashboard/new" element={<ProtectedRoute><NewBusinessPage /></ProtectedRoute>} />
        <Route path="/dashboard/:id" element={<ProtectedRoute><EditBusinessPage /></ProtectedRoute>} />
        <Route path="/dashboard/:id/inquiries" element={<ProtectedRoute><InquiriesPage /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
