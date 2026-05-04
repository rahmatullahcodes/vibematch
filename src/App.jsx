import { Suspense, lazy } from "react";
import { BrowserRouter, HashRouter, Navigate, Route, Routes } from "react-router-dom";
import MarketingLayout from "./layouts/MarketingLayout";
import AboutPage from "./pages/AboutPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import ContactPage from "./pages/ContactPage";
import FaqPage from "./pages/FaqPage";
import FeaturesPage from "./pages/FeaturesPage";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import PricingPage from "./pages/PricingPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import AdminAuditPage from "./pages/admin/AdminAuditPage";
import AdminCampaignsPage from "./pages/admin/AdminCampaignsPage";
import AdminCompliancePage from "./pages/admin/AdminCompliancePage";
import AdminContentPage from "./pages/admin/AdminContentPage";
import AdminNotificationsPage from "./pages/admin/AdminNotificationsPage";
import AdminOverviewPage from "./pages/admin/AdminOverviewPage";
import AdminPaymentsPage from "./pages/admin/AdminPaymentsPage";
import AdminReportsPage from "./pages/admin/AdminReportsPage";
import AdminRiskPage from "./pages/admin/AdminRiskPage";
import AdminRolesPage from "./pages/admin/AdminRolesPage";
import AdminSecurityPage from "./pages/admin/AdminSecurityPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import AdminShell from "./pages/admin/AdminShell";
import AdminSupportPage from "./pages/admin/AdminSupportPage";
import AdminSystemPage from "./pages/admin/AdminSystemPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";

const AppWorkspacePage = lazy(() => import("./pages/AppWorkspacePage"));

function App() {
  const RouterComponent = window.location.protocol === "file:" ? HashRouter : BrowserRouter;

  return (
    <RouterComponent>
      <Routes>
        <Route
          path="/app"
          element={
            <Suspense
              fallback={
                <div className="mesh-bg bg-slateDeep font-body text-slate-100">
                  <div className="grid min-h-screen place-items-center px-4">
                    <div className="glass-strong flex items-center gap-3 rounded-2xl px-6 py-4 text-sm text-slate-200">
                      <span className="pulse-dot" />
                      Opening app workspace...
                    </div>
                  </div>
                </div>
              }
            >
              <AppWorkspacePage />
            </Suspense>
          }
        />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminShell />}>
          <Route index element={<AdminOverviewPage />} />
          <Route path="dashboard" element={<Navigate to="/admin" replace />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
          <Route path="audit" element={<AdminAuditPage />} />
          <Route path="content" element={<AdminContentPage />} />
          <Route path="payments" element={<AdminPaymentsPage />} />
          <Route path="notifications" element={<AdminNotificationsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="security" element={<AdminSecurityPage />} />
          <Route path="roles" element={<AdminRolesPage />} />
          <Route path="support" element={<AdminSupportPage />} />
          <Route path="risk" element={<AdminRiskPage />} />
          <Route path="campaigns" element={<AdminCampaignsPage />} />
          <Route path="system" element={<AdminSystemPage />} />
          <Route path="compliance" element={<AdminCompliancePage />} />
        </Route>
        <Route path="/dashboard" element={<Navigate to="/app?tab=dashboard" replace />} />

        <Route element={<MarketingLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </RouterComponent>
  );
}

export default App;
