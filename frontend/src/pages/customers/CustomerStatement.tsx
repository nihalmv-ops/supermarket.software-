import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Printer,
  FileSpreadsheet,
  Calendar,
  AlertCircle,
  Loader2,
  Building2,
  FileText,
} from 'lucide-react';
import { customerService } from '../../services/customerService';
import { CustomerStatementResponse } from '../../types/customer.types';
import { useBusiness } from '../../hooks/useBusiness';

export const CustomerStatement: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activeBusiness } = useBusiness();

  const [statement, setStatement] = useState<CustomerStatementResponse | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatement = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await customerService.getCustomerStatement(id, {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setStatement(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate statement';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [id, startDate, endDate]);

  useEffect(() => {
    fetchStatement();
  }, [fetchStatement]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
          <span>Generating financial statement...</span>
        </div>
      </div>
    );
  }

  if (error || !statement) {
    return (
      <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-base font-bold text-slate-900">Statement Unavailable</h2>
        <p className="text-xs text-slate-500">{error || 'Could not load client statement'}</p>
        <button
          onClick={() => navigate('/customers')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
        >
          Return to Customer Directory
        </button>
      </div>
    );
  }

  const { customer } = statement;

  return (
    <div className="space-y-6">
      {/* Navigation & Action Bar (Hidden during Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <button
          onClick={() => navigate(`/customers/${id}`)}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Customer Profile
        </button>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-500" /> Print Statement
          </button>
        </div>
      </div>

      {/* Date Filter Bar (Hidden during Print) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <Calendar className="w-4 h-4 text-indigo-600" />
          <span>Statement Statement Period:</span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <span className="text-slate-400">to</span>
          <div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>
      </div>

      {/* Printable Statement Sheet Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 sm:p-12 print:border-none print:shadow-none print:p-0 space-y-8">
        {/* Header Document */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-slate-200 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 uppercase">
                {activeBusiness?.businessName || 'Silver Business Suite'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {activeBusiness?.address || 'Operational Corporate Office'}
            </p>
            <p className="text-xs text-slate-500">
              {activeBusiness?.city ? `${activeBusiness.city}, ` : ''}
              {activeBusiness?.state || 'India'}
            </p>
            {activeBusiness?.gstNumber && (
              <p className="text-xs font-mono text-slate-600 mt-1">
                GSTIN: {activeBusiness.gstNumber}
              </p>
            )}
          </div>

          <div className="text-left sm:text-right space-y-1">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight uppercase">
              STATEMENT OF ACCOUNT
            </h2>
            <p className="text-xs font-mono text-slate-400">
              Date: {new Date().toLocaleDateString()}
            </p>
            <div className="pt-2 text-xs text-slate-500">
              <span>Account Status: </span>
              <strong className="text-emerald-600 uppercase font-bold">Good Standing</strong>
            </div>
          </div>
        </div>

        {/* Client Billing Details & Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-200/80">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Statement Issued To
            </span>
            <h3 className="text-sm font-bold text-slate-900">{customer.customerName}</h3>
            {customer.companyName && (
              <p className="text-xs font-medium text-slate-600">{customer.companyName}</p>
            )}
            <p className="text-xs text-slate-500 mt-1">
              {customer.billingAddress || customer.city || 'No formal address specified'}
            </p>
            <p className="text-xs text-slate-500">
              Phone: {customer.phone}
              {customer.email ? ` • ${customer.email}` : ''}
            </p>
            {customer.gstin && (
              <p className="text-xs font-mono text-slate-700 mt-1 font-semibold">
                GSTIN: {customer.gstin}
              </p>
            )}
          </div>

          <div className="sm:border-l sm:border-slate-200 sm:pl-6 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Financial Summary
            </span>
            <div className="flex justify-between text-xs py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Total Invoiced:</span>
              <span className="font-semibold text-slate-800">₹0.00</span>
            </div>
            <div className="flex justify-between text-xs py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Total Paid:</span>
              <span className="font-semibold text-emerald-600">₹0.00</span>
            </div>
            <div className="flex justify-between text-xs py-1">
              <span className="text-slate-700 font-bold">Net Balance Due:</span>
              <span className="font-bold text-slate-900 text-sm">₹0.00</span>
            </div>
          </div>
        </div>

        {/* Statement Line-Item Table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-right">Invoice Total</th>
                <th className="py-3 px-4 text-right">Amount Paid</th>
                <th className="py-3 px-4 text-right">Balance Due</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td colSpan={7} className="py-16 text-center text-slate-400 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-semibold text-slate-700">
                    No transactions recorded for this customer
                  </div>
                  <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                    Invoices and payments generated in future modules will calculate itemized ledger movements here.
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer Notes for Statement */}
        <div className="pt-6 border-t border-slate-200 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>Generated by Silver Business Suite • Automated Statement Ledger</p>
          <div className="flex items-center gap-1 font-mono text-[11px]">
            <FileText className="w-3.5 h-3.5" />
            <span>Document Ref: STMT-{customer._id.slice(-6).toUpperCase()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
