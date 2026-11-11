import { FileSpreadsheet, ArrowRight, ArrowUpRight } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Quotation } from '../../types';
import { Link } from 'react-router-dom';

const mockQuotations: Quotation[] = [
  {
    id: 'qt-1',
    quotationNumber: 'QT-2026-00089',
    customerName: 'Global Cloud Systems',
    date: '2026-11-09',
    validUntil: '2026-11-23',
    amount: 195000,
    status: 'Sent',
  },
  {
    id: 'qt-2',
    quotationNumber: 'QT-2026-00088',
    customerName: 'Prime Infotech LLP',
    date: '2026-11-06',
    validUntil: '2026-11-20',
    amount: 72000,
    status: 'Accepted',
  },
  {
    id: 'qt-3',
    quotationNumber: 'QT-2026-00087',
    customerName: 'Kaveri Industrial Corp',
    date: '2026-11-03',
    validUntil: '2026-11-17',
    amount: 320000,
    status: 'Sent',
  },
  {
    id: 'qt-4',
    quotationNumber: 'QT-2026-00086',
    customerName: 'Urban Crafts Studio',
    date: '2026-10-30',
    validUntil: '2026-11-14',
    amount: 45000,
    status: 'Draft',
  },
];

export default function RecentQuotationsList(): JSX.Element {
  return (
    <div className="bg-white rounded-2xl border border-surface-200/90 shadow-subtle p-5 sm:p-6 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-surface-100">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-base text-surface-900 tracking-tight">Active Quotations</h3>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
              Proposals
            </span>
          </div>
          <p className="text-xs text-surface-500 mt-0.5">Quotations awaiting approval or ready for invoicing</p>
        </div>

        <Link
          to="/quotations"
          className="inline-flex items-center space-x-1 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
        >
          <span>View All</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* List items */}
      <div className="divide-y divide-surface-100 flex-1 my-2">
        {mockQuotations.map((qt) => (
          <div
            key={qt.id}
            className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-surface-50/50 rounded-xl px-2 -mx-2 transition-colors"
          >
            <div className="flex items-start space-x-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div className="truncate">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-surface-900">{qt.quotationNumber}</span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.2 rounded-full ${
                      qt.status === 'Accepted'
                        ? 'bg-emerald-50 text-emerald-700'
                        : qt.status === 'Sent'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-surface-100 text-surface-600'
                    }`}
                  >
                    {qt.status}
                  </span>
                </div>
                <p className="text-xs text-surface-700 font-medium truncate">{qt.customerName}</p>
                <p className="text-[10px] text-surface-400">Valid until {formatDate(qt.validUntil)}</p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end space-x-3 shrink-0 pt-1 sm:pt-0">
              <span className="text-xs font-bold text-surface-900">
                {formatCurrency(qt.amount)}
              </span>

              <button
                onClick={() => alert(`Converting ${qt.quotationNumber} to Invoice (Phase 2 feature)`)}
                className="inline-flex items-center space-x-1 px-2.5 py-1 text-[11px] font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors border border-brand-200/50"
                title="Directly convert proposal into official invoice"
              >
                <span>Convert</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-3 border-t border-surface-100">
        <Link
          to="/quotations"
          className="w-full block py-2 text-center text-xs font-semibold text-surface-600 bg-surface-50 hover:bg-surface-100 rounded-xl transition-colors"
        >
          Create New Quotation
        </Link>
      </div>
    </div>
  );
}
