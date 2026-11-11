import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { InvoiceStatusBreakdown } from '../../types';

const statusData: InvoiceStatusBreakdown[] = [
  { name: 'Paid', value: 156, color: '#10b981', amount: '₹18,45,200' },
  { name: 'Pending', value: 32, color: '#f59e0b', amount: '₹3,20,500' },
  { name: 'Overdue', value: 12, color: '#f43f5e', amount: '₹1,12,000' },
];

export default function InvoiceStatusDonut(): JSX.Element {
  const totalInvoices = statusData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-surface-200/90 shadow-subtle flex flex-col justify-between h-full">
      <div className="pb-3 border-b border-surface-100">
        <h3 className="font-bold text-base text-surface-900 tracking-tight">Invoice Status Overview</h3>
        <p className="text-xs text-surface-500">Distribution across 200 total generated invoices</p>
      </div>

      <div className="relative h-56 flex items-center justify-center my-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              formatter={(value: any, name: any) => [`${value} invoices`, name]}
              contentStyle={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                fontSize: '12px',
              }}
            />
            <Pie
              data={statusData}
              innerRadius={65}
              outerRadius={88}
              paddingAngle={4}
              dataKey="value"
            >
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Counter */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-extrabold text-surface-900">{totalInvoices}</span>
          <span className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Total</span>
        </div>
      </div>

      {/* Legend & Breakdown stats */}
      <div className="space-y-2 pt-2 border-t border-surface-100">
        {statusData.map((item) => (
          <div key={item.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="font-medium text-surface-700">{item.name}</span>
              <span className="text-surface-400 text-[11px]">({item.value})</span>
            </div>
            <span className="font-semibold text-surface-900">{item.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
