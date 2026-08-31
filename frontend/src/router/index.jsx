import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

// Layouts
import AppLayout from '../components/layout/AppLayout'

// Public pages
import LandingPage from '../pages/LandingPage'
import LoginPage from '../pages/auth/LoginPage'
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage'
import RoleSelectionPage from '../pages/auth/RoleSelectionPage'

// App pages (placeholder — filled in per phase)
import DashboardPage from '../pages/dashboard/DashboardPage'
import UploadBidPage from '../pages/upload/UploadBidPage'
import AiProcessingPage from '../pages/processing/AiProcessingPage'
import ExtractedDocumentsPage from '../pages/processing/ExtractedDocumentsPage'
import GovVerificationPage from '../pages/processing/GovVerificationPage'
import TenderCompliancePage from '../pages/compliance/TenderCompliancePage'
import ComplianceDashboardPage from '../pages/compliance/ComplianceDashboardPage'
import FraudDetectionPage from '../pages/fraud/FraudDetectionPage'
import RiskAnalysisPage from '../pages/risk/RiskAnalysisPage'
import BidComparisonPage from '../pages/comparison/BidComparisonPage'
import PdfReviewPage from '../pages/review/PdfReviewPage'
import AuditReportPage from '../pages/report/AuditReportPage'
import VerificationHistoryPage from '../pages/history/VerificationHistoryPage'
import AdminPanelPage from '../pages/admin/AdminPanelPage'
import AiAssistantPage from '../pages/chat/AiAssistantPage'

// Private route guard
function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

const router = createBrowserRouter([
  // Public
  { path: '/',                element: <LandingPage /> },
  { path: '/login',           element: <LoginPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/role-select',     element: <RoleSelectionPage /> },

  // Protected — inside AppLayout
  {
    path: '/',
    element: <PrivateRoute><AppLayout /></PrivateRoute>,
    children: [
      { path: 'dashboard',    element: <DashboardPage /> },
      { path: 'upload',       element: <UploadBidPage /> },
      { path: 'processing',   element: <AiProcessingPage /> },
      { path: 'documents',    element: <ExtractedDocumentsPage /> },
      { path: 'gov-verify',   element: <GovVerificationPage /> },
      { path: 'compliance',   element: <TenderCompliancePage /> },
      { path: 'compliance-dashboard', element: <ComplianceDashboardPage /> },
      { path: 'fraud',        element: <FraudDetectionPage /> },
      { path: 'risk',         element: <RiskAnalysisPage /> },
      { path: 'compare',      element: <BidComparisonPage /> },
      { path: 'pdf-review',   element: <PdfReviewPage /> },
      { path: 'audit-report', element: <AuditReportPage /> },
      { path: 'history',      element: <VerificationHistoryPage /> },
      { path: 'admin',        element: <AdminPanelPage /> },
      { path: 'ai-assistant', element: <AiAssistantPage /> },
    ],
  },
])

export default function AppRouter() {
  return <RouterProvider router={router} />
}
