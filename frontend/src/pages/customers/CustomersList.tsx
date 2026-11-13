import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Plus,
  Download,
  Upload,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { customerService } from '../../services/customerService';
import {
  Customer,
  CustomerType,
  CustomerMetricsSummary,
} from '../../types/customer.types';
import { CustomerStats } from '../../components/customers/CustomerStats';
import { CustomerFilters } from '../../components/customers/CustomerFilters';
import { CustomerTable } from '../../components/customers/CustomerTable';
import { DeleteCustomerDialog } from '../../components/customers/DeleteCustomerDialog';
import { CsvImportModal } from '../../components/customers/CsvImportModal';

export const CustomersList: React.FC = () => {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [metrics, setMetrics] = useState<CustomerMetricsSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Filters & Pagination State
  const [search, setSearch] = useState<string>('');
  const [customerType, setCustomerType] = useState<CustomerType | 'all'>('all');
  const [status, setStatus] = useState<'active' | 'inactive' | 'all'>('all');
  const [sortBy, setSortBy] = useState<'customerName' | 'companyName' | 'createdAt' | 'updatedAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState<number>(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // Dialog & Modal State
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);

  const fetchCustomerData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [listRes, metricsRes] = await Promise.all([
        customerService.getCustomers({
          page,
          limit: 10,
          search: search.trim() || undefined,
          customerType,
          status,
          sortBy,
          sortOrder,
        }),
        customerService.getMetricsSummary(),
      ]);

      setCustomers(listRes.customers);
      setPagination(listRes.pagination);
      setMetrics(metricsRes);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch customer data';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, customerType, status, sortBy, sortOrder]);

  useEffect(() => {
    fetchCustomerData();
  }, [fetchCustomerData]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleToggleStatus = async (customer: Customer) => {
    const updatedStatus = !customer.isActive;
    try {
      await customerService.toggleCustomerStatus(customer._id, updatedStatus);
      showNotification(
        `Customer '${customer.customerName}' ${updatedStatus ? 'activated' : 'deactivated'}.`
      );
      fetchCustomerData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update customer status';
      alert(msg);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!customerToDelete) return;
    setIsDeleting(true);
    try {
      await customerService.deleteCustomer(customerToDelete._id);
      showNotification(`Customer '${customerToDelete.customerName}' deleted successfully.`);
      setCustomerToDelete(null);
      fetchCustomerData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete customer';
      alert(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Module 6
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-indigo-600" />
            Customer Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Maintain your client relationships, GSTIN credentials, multi-address registries, and customer statements.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => fetchCustomerData()}
            disabled={isLoading}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => customerService.exportCustomersCsv()}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition-colors"
          >
            <Upload className="w-3.5 h-3.5" /> Import CSV
          </button>

          <button
            onClick={() => navigate('/customers/new')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold rounded-xl shadow-xs hover:shadow-md transition-all"
          >
            <Plus className="w-4 h-4" /> Add Customer
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Customer Key Metrics Cards */}
      <CustomerStats metrics={metrics} isLoading={isLoading} />

      {/* Search, Filter & Sorting Bar */}
      <CustomerFilters
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        customerType={customerType}
        onCustomerTypeChange={(val) => {
          setCustomerType(val);
          setPage(1);
        }}
        status={status}
        onStatusChange={(val) => {
          setStatus(val);
          setPage(1);
        }}
        sortBy={sortBy}
        onSortByChange={(val) => setSortBy(val)}
        sortOrder={sortOrder}
        onToggleSortOrder={() =>
          setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
        }
      />

      {/* Customer Registry Table */}
      <CustomerTable
        customers={customers}
        isLoading={isLoading}
        pagination={pagination}
        onPageChange={(newPage) => setPage(newPage)}
        onToggleStatus={handleToggleStatus}
        onDeleteClick={(cust) => setCustomerToDelete(cust)}
      />

      {/* Delete Confirmation Modal */}
      <DeleteCustomerDialog
        customer={customerToDelete}
        isOpen={!!customerToDelete}
        isDeleting={isDeleting}
        onClose={() => setCustomerToDelete(null)}
        onConfirm={handleDeleteConfirm}
      />

      {/* CSV Bulk Import Modal */}
      <CsvImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {
          showNotification('CSV batch imported successfully.');
          fetchCustomerData();
        }}
      />
    </div>
  );
};
