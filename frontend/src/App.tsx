import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import PlaceholderPage from './pages/PlaceholderPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Multi-Business Pages
import { BusinessSwitcher } from './pages/business/BusinessSwitcher';
import { BusinessRegistration } from './pages/business/BusinessRegistration';
import { BusinessProfile } from './pages/business/BusinessProfile';

// Super Admin Pages
import { SuperAdminDashboard } from './pages/super-admin/SuperAdminDashboard';
import { BusinessesList } from './pages/super-admin/BusinessesList';
import { BusinessDetails } from './pages/super-admin/BusinessDetails';

export default function App(): JSX.Element {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Dedicated Multi-Business Standalone Views */}
      <Route
        path="/business/switch"
        element={
          <ProtectedRoute>
            <BusinessSwitcher />
          </ProtectedRoute>
        }
      />
      <Route
        path="/business/new"
        element={
          <ProtectedRoute>
            <BusinessRegistration />
          </ProtectedRoute>
        }
      />
      <Route
        path="/business/profile"
        element={
          <ProtectedRoute>
            <BusinessProfile />
          </ProtectedRoute>
        }
      />

      {/* Platform Super Admin Oversight Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/businesses"
        element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <BusinessesList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/businesses/:id"
        element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <BusinessDetails />
          </ProtectedRoute>
        }
      />

      {/* Protected SaaS Application Shell */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* Main Dashboard */}
        <Route index element={<Dashboard />} />

        {/* Modules */}
        <Route
          path="invoices"
          element={
            <PlaceholderPage
              title="Invoice Management"
              moduleNumber="4"
              description="Create, edit, calculate GST, manage payment status, download PDF, and share invoices over WhatsApp."
              upcomingFeatures={[
                'Auto invoice sequence numbering (e.g. INV-2026-001)',
                'Itemized products/services with HSN/SAC & GST tiers',
                'One-click PDF generation & WhatsApp delivery',
                'Payment recording with outstanding reconciliation',
              ]}
            />
          }
        />

        <Route
          path="quotations"
          element={
            <PlaceholderPage
              title="Quotation & Estimates"
              moduleNumber="5"
              description="Create professional quotations with validity dates, discounts, and convert them to invoices with a single click."
              upcomingFeatures={[
                'Automatic quotation numbering (e.g. QT-2026-001)',
                'Quotation expiration tracking & notifications',
                'Instant 1-click Convert to Invoice workflow',
                'Printable estimates with custom terms & notes',
              ]}
            />
          }
        />

        <Route
          path="customers"
          element={
            <PlaceholderPage
              title="Customer Directory"
              moduleNumber="6"
              description="Central customer directory with contact information, GSTIN details, invoice history, and outstanding balance tracking."
              upcomingFeatures={[
                'Comprehensive customer profiles & GSTIN verification',
                'Customer purchase & payment history ledger',
                'Outstanding receivables balance tracker',
                'Bulk client import & export',
              ]}
            />
          }
        />

        <Route
          path="products"
          element={
            <PlaceholderPage
              title="Product & Service Catalog"
              moduleNumber="7"
              description="Maintain a reusable library of goods and services with pricing, tax slabs, and HSN/SAC codes."
              upcomingFeatures={[
                'Product & Service catalog management',
                'HSN/SAC code search and GST rate mapping',
                'Quick item insertion during invoice creation',
                'Inventory and unit price tracking',
              ]}
            />
          }
        />

        <Route
          path="pdf-designer"
          element={
            <PlaceholderPage
              title="PDF Designer & Templates"
              moduleNumber="8"
              description="Customize colors, logos, fonts, tables, and layouts with real-time live preview."
              upcomingFeatures={[
                '6 ready-made templates: Modern, Minimal, Purple, Blue, Green, Classic',
                'Live real-time PDF canvas preview',
                'Separate layout settings for Invoices vs Quotations',
                'Custom logo positioning, brand palette, and A4/A5 switch',
              ]}
            />
          }
        />

        <Route
          path="reports"
          element={
            <PlaceholderPage
              title="Financial Analytics & Reports"
              moduleNumber="3"
              description="Revenue breakdowns, tax reports, client receivables, and exportable financial summaries."
              upcomingFeatures={[
                'GST liability & tax collection report',
                'Sales breakdown by product & service',
                'Aging accounts receivable breakdown',
                'Export to CSV / Excel',
              ]}
            />
          }
        />

        {/* Business Settings directly links to full BusinessProfile */}
        <Route path="settings" element={<BusinessProfile />} />

        <Route
          path="subscriptions"
          element={
            <PlaceholderPage
              title="Subscription Management"
              moduleNumber="10"
              description="Manage business tier plans (Starter, Professional, Business), billing frequency, and feature allowances."
              upcomingFeatures={[
                'Starter, Professional, Business plan tiers',
                'Monthly and annual billing cycle switching',
                'Feature enforcement & invoice quota tracking',
                'Automated renewal & invoice receipts',
              ]}
            />
          }
        />

        {/* Catch-all redirect to Dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
