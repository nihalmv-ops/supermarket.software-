import { useState } from 'react';
import {
  FileText,
  FileSpreadsheet,
  IndianRupee,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  RefreshCw,
  Plus
} from 'lucide-react';
import MetricCard from '../components/dashboard/MetricCard';
import RevenueChart from '../components/dashboard/RevenueChart';
import InvoiceStatusDonut from '../components/dashboard/InvoiceStatusDonut';
import RecentInvoicesTable from '../components/dashboard/RecentInvoicesTable';
import RecentQuotationsList from '../components/dashboard/RecentQuotationsList';
import QuickActions from '../components/dashboard/QuickActions';
import { Link } from 'react-router-dom';

export default function Dashboard(): JSX.Element {
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('This Fiscal Month');

  const handleRefresh = (): void => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-surface-200/90 shadow-subtle">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-surface-900 tracking-tight">
              Executive Business Overview
            </h1>
            <span className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Tenant Live</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-surface-500">
            Real-time analytics, revenue recognition, and pending receivables for <strong className="text-surface-700 font-semibold">Silver Horizon Tech</strong>.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Period selector */}
          <div className="flex items-center space-x-1.5 bg-surface-50 border border-surface-200 px-3 py-1.5 rounded-xl text-xs font-medium text-surface-700">
            <Calendar className="w-3.5 h-3.5 text-surface-400" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer font-semibold text-surface-800"
            >
              <option>This Fiscal Month</option>
              <option>Last 30 Days</option>
              <option>Current Quarter (Q3)</option>
              <option>Financial Year 2026-27</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className="p-2 text-surface-500 hover:text-surface-800 bg-surface-50 hover:bg-surface-100 border border-surface-200 rounded-xl transition-colors"
            title="Refresh analytics data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-brand-600' : ''}`} />
          </button>

          {/* Create Invoice Primary Button */}
          <Link
            to="/invoices"
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white rounded-xl text-xs font-semibold shadow-sm shadow-brand-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Invoice</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid - 6 Key SaaS Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard
          title="Total Revenue"
          value="₹22.77 L"
          icon={IndianRupee}
          trend="+18.4%"
          trendDirection="up"
          colorScheme="brand"
          badge="Gross"
        />
        <MetricCard
          title="Total Invoices"
          value="200"
          icon={FileText}
          trend="+12 New"
          trendDirection="up"
          colorScheme="blue"
        />
        <MetricCard
          title="Paid Invoices"
          value="156"
          icon={CheckCircle2}
          trend="78% Ratio"
          trendDirection="up"
          colorScheme="emerald"
        />
        <MetricCard
          title="Pending Due"
          value="₹3.20 L"
          icon={Clock}
          subtitle="32 invoices awaiting"
          colorScheme="amber"
        />
        <MetricCard
          title="Unpaid / Overdue"
          value="12"
          icon={AlertTriangle}
          trend="-2 vs Last Mo"
          trendDirection="down"
          colorScheme="rose"
        />
        <MetricCard
          title="Quotations"
          value="48"
          icon={FileSpreadsheet}
          trend="72% Converted"
          trendDirection="up"
          colorScheme="brand"
        />
      </div>

      {/* Quick Action Shortcuts */}
      <QuickActions />

      {/* Charts Section: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div className="lg:col-span-1">
          <InvoiceStatusDonut />
        </div>
      </div>

      {/* Detailed Tables Section: Recent Invoices & Quotations */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <RecentInvoicesTable />
        </div>
        <div className="xl:col-span-1">
          <RecentQuotationsList />
        </div>
      </div>
    </div>
  );
}
