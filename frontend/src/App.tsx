import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import PlaceholderPage from './pages/PlaceholderPage';

export default function App(): JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        {/* Main Dashboard */}
        <Route index element={<Dashboard />} />

        {/* Phase 2 Prepared Modules */}
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

        <Route
          path="settings"
          element={
            <PlaceholderPage
              title="Business Settings"
              moduleNumber="9"
              description="Configure company details, logo, GSTIN, bank details, UPI QR code, signature, and default invoice terms."
              upcomingFeatures={[
                'Multi-business branding & profile management',
                'Bank account & UPI QR code for fast payments',
                'Digital signature upload via Cloudinary',
                'Default terms & conditions and currency format',
              ]}
            />
          }
        />

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
