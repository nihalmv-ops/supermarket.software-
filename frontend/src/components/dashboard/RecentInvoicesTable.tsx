import { FileText, Download, Share2, Eye, ArrowUpRight } from 'lucide-react';
import { formatCurrency, formatDate, getStatusConfig } from '../../utils/formatters';
import { Invoice } from '../../types';
import { Link } from 'react-router-dom';

const mockInvoices: Invoice[] = [
  {
    id: 'inv-101',
    invoiceNumber: 'INV-2026-00142',
    customerName: 'TechVanguard Solutions',
    customerEmail: 'accounts@techvanguard.in',
    date: '2026-11-10',
    dueDate: '2026-11-25',
    amount: 145000,
    tax: 26100,
    status: 'paid',
  },
  {
    id: 'inv-102',
    invoiceNumber: 'INV-2026-00141',
    customerName: 'BlueSky Logistics Pvt Ltd',
    customerEmail: 'billing@bluesky.com',
    date: '2026-11-08',
    dueDate: '2026-11-22',
    amount: 88500,
    tax: 15930,
    status: 'pending',
  },
  {
    id: 'inv-103',
    invoiceNumber: 'INV-2026-00140',
    customerName: 'Quantum Enterprises',
    customerEmail: 'finance@quantumenterprise.io',
    date: '2026-10-28',
    dueDate: '2026-11-05',
    amount: 210000,
    tax: 37800,
    status: 'unpaid',
  },
  {
    id: 'inv-104',
    invoiceNumber: 'INV-2026-00139',
    customerName: 'Zenith Retail Chains',
    customerEmail: 'procure@zenithretail.com',
    date: '2026-11-02',
    dueDate: '2026-11-16',
    amount: 62400,
    tax: 11232,
    status: 'paid',
  },
  {
    id: 'inv-105',
    invoiceNumber: 'INV-2026-00138',
    customerName: 'AeroDynamics Aviation Ltd',
    customerEmail: 'ops@aerodynamics.org',
    date: '2026-11-01',
    dueDate: '2026-11-15',
    amount: 340000,
    tax: 61200,
    status: 'pending',
  },
];

export default function RecentInvoicesTable(): JSX.Element {
  return (
    <div className="bg-white rounded-2xl border border-surface-200/90 shadow-subtle overflow-hidden">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-surface-100 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-base text-surface-900 tracking-tight">Recent Invoices</h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-surface-100 text-surface-600">
              Live Feed
            </span>
          </div>
          <p className="text-xs text-surface-500 mt-0.5">Latest billing transactions across this business account</p>
        </div>

        <Link
          to="/invoices"
          className="inline-flex items-center space-x-1 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
        >
          <span>View All</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-50/70 border-b border-surface-100 text-[11px] font-bold text-surface-500 uppercase tracking-wider">
              <th className="py-3 px-5">Invoice #</th>
              <th className="py-3 px-5">Client Name</th>
              <th className="py-3 px-4">Date / Due</th>
              <th className="py-3 px-5 text-right">Amount (Incl. GST)</th>
              <th className="py-3 px-5 text-center">Status</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100 text-xs">
            {mockInvoices.map((inv) => {
              const statusStyle = getStatusConfig(inv.status);
              return (
                <tr
                  key={inv.id}
                  className="hover:bg-surface-50/60 transition-colors group"
                >
                  {/* Invoice Number */}
                  <td className="py-3.5 px-5 font-semibold text-surface-900 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-medium text-brand-700 hover:underline cursor-pointer">
                        {inv.invoiceNumber}
                      </span>
                    </div>
                  </td>

                  {/* Customer */}
                  <td className="py-3.5 px-5 whitespace-nowrap">
                    <p className="font-medium text-surface-800">{inv.customerName}</p>
                    <p className="text-[11px] text-surface-400">{inv.customerEmail}</p>
                  </td>

                  {/* Dates */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-surface-600">
                    <p>{formatDate(inv.date)}</p>
                    <p className="text-[10px] text-surface-400">Due {formatDate(inv.dueDate)}</p>
                  </td>

                  {/* Amount */}
                  <td className="py-3.5 px-5 text-right whitespace-nowrap">
                    <p className="font-bold text-surface-900">{formatCurrency(inv.amount)}</p>
                    <p className="text-[10px] text-surface-400">GST: {formatCurrency(inv.tax)}</p>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-5 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusStyle.bg}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                      <span>{statusStyle.label}</span>
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <div className="inline-flex items-center space-x-1 text-surface-400">
                      <button
                        title="View Invoice"
                        onClick={() => alert(`Previewing ${inv.invoiceNumber} (Phase 2 feature)`)}
                        className="p-1.5 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        title="Download PDF"
                        onClick={() => alert(`Downloading PDF for ${inv.invoiceNumber} (Phase 2 feature)`)}
                        className="p-1.5 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        title="Share via WhatsApp"
                        onClick={() => alert(`Sharing ${inv.invoiceNumber} via WhatsApp (Phase 2 feature)`)}
                        className="p-1.5 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
