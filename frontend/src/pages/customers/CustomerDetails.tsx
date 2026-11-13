import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  User,
  Phone,
  Mail,
  FileText,
  MapPin,
  Edit2,
  FileSpreadsheet,
  IndianRupee,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Receipt,
  FileCheck,
} from 'lucide-react';
import { customerService } from '../../services/customerService';
import { Customer } from '../../types/customer.types';
import { CustomerStatusBadge } from '../../components/customers/CustomerStatusBadge';

export const CustomerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomer = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await customerService.getCustomerById(id);
      setCustomer(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch customer profile';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  const handleToggleStatus = async () => {
    if (!customer) return;
    try {
      const updated = await customerService.toggleCustomerStatus(
        customer._id,
        !customer.isActive
      );
      setCustomer(updated);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update status';
      alert(msg);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
          <span>Loading customer profile...</span>
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-base font-bold text-slate-900">Customer Not Found</h2>
        <p className="text-xs text-slate-500">{error || 'Record does not exist'}</p>
        <button
          onClick={() => navigate('/customers')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
        >
          Return to Customer Directory
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <button
        onClick={() => navigate('/customers')}
        className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Customer Directory
      </button>

      {/* Hero Banner Profile */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-2xl shrink-0 shadow-2xs">
            {customer.customerType === 'individual' ? (
              <User className="w-8 h-8" />
            ) : (
              <Building2 className="w-8 h-8" />
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {customer.customerName}
              </h1>
              <CustomerStatusBadge isActive={customer.isActive} />
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
                {customer.customerType}
              </span>
            </div>
            {customer.companyName && (
              <p className="text-sm font-medium text-slate-600 mt-0.5">
                {customer.companyName}
              </p>
            )}
            <p className="text-[11px] font-mono text-slate-400 mt-1">
              Customer ID: {customer._id} • Added on{' '}
              {new Date(customer.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={() => navigate(`/customers/${customer._id}/statement`)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            View Statement
          </button>

          <button
            onClick={() => navigate(`/customers/${customer._id}/edit`)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200 transition-colors"
          >
            <Edit2 className="w-4 h-4" /> Edit Profile
          </button>

          <button
            onClick={handleToggleStatus}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors ${
              customer.isActive
                ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
            }`}
          >
            {customer.isActive ? 'Deactivate Client' : 'Activate Client'}
          </button>
        </div>
      </div>

      {/* Financial Overview Cards (Real-time derived from future Invoices & Payments) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Invoiced
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">₹0.00</div>
          <p className="text-[11px] text-slate-400 mt-1">0 invoices recorded</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Amount Paid
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600">₹0.00</div>
          <p className="text-[11px] text-slate-400 mt-1">Reconciled receipts</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Due Balance
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">₹0.00</div>
          <p className="text-[11px] text-slate-400 mt-1">Net receivable balance</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Quotations
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">0</div>
          <p className="text-[11px] text-slate-400 mt-1">Active estimates</p>
        </div>
      </div>

      {/* Grid: Contact & Tax Information + Addresses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Channels */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Contact Channels</h2>
          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-2.5 text-slate-700">
              <Phone className="w-4 h-4 text-indigo-600 shrink-0" />
              <div>
                <span className="block text-[11px] text-slate-400 font-semibold uppercase">
                  Primary Phone
                </span>
                <span className="font-semibold">{customer.phone}</span>
              </div>
            </div>

            {customer.alternatePhone && (
              <div className="flex items-center gap-2.5 text-slate-700 pt-2 border-t border-slate-100">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="block text-[11px] text-slate-400 font-semibold uppercase">
                    Alternate Phone
                  </span>
                  <span>{customer.alternatePhone}</span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2.5 text-slate-700 pt-2 border-t border-slate-100">
              <Mail className="w-4 h-4 text-indigo-600 shrink-0" />
              <div>
                <span className="block text-[11px] text-slate-400 font-semibold uppercase">
                  Email
                </span>
                <span>{customer.email || 'None provided'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-slate-700 pt-2 border-t border-slate-100">
              <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
              <div>
                <span className="block text-[11px] text-slate-400 font-semibold uppercase">
                  GSTIN Registration
                </span>
                <span className="font-mono font-semibold uppercase">
                  {customer.gstin || 'Unregistered'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Billing Address */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-indigo-600" />
            Billing Address
          </h2>
          <div className="text-xs text-slate-600 space-y-1">
            <p className="font-medium text-slate-800 leading-relaxed">
              {customer.billingAddress || 'No street address specified'}
            </p>
            <p>
              {customer.city ? `${customer.city}, ` : ''}
              {customer.state ? `${customer.state} ` : ''}
              {customer.pincode ? `- ${customer.pincode}` : ''}
            </p>
            <p className="text-slate-400">{customer.country || 'India'}</p>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            Shipping Address
          </h2>
          <div className="text-xs text-slate-600 space-y-1">
            <p className="font-medium text-slate-800 leading-relaxed">
              {customer.shippingAddress || customer.billingAddress || 'Same as billing address'}
            </p>
            <p>
              {customer.city ? `${customer.city}, ` : ''}
              {customer.state ? `${customer.state} ` : ''}
              {customer.pincode ? `- ${customer.pincode}` : ''}
            </p>
            <p className="text-slate-400">{customer.country || 'India'}</p>
          </div>
        </div>
      </div>

      {/* Transaction & Activity Ledger (Empty State until Phase 6) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Recent Invoices & Transactions</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified sales invoices and payment records for this customer account.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
            Real-Time Ledger
          </span>
        </div>

        <div className="py-12 text-center text-slate-400 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center mx-auto text-slate-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-700">No transactions recorded yet</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Sales invoices generated in Phase 6 will automatically calculate billing, tax liabilities, and payment reconciliations here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
