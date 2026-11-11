import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  TooltipProps
} from 'recharts';
import { formatCurrency } from '../../utils/formatters';
import { RevenuePoint } from '../../types';

const revenueData: RevenuePoint[] = [
  { month: 'Jun', revenue: 245000, pending: 45000 },
  { month: 'Jul', revenue: 310000, pending: 62000 },
  { month: 'Aug', revenue: 285000, pending: 51000 },
  { month: 'Sep', revenue: 420000, pending: 78000 },
  { month: 'Oct', revenue: 490000, pending: 64000 },
  { month: 'Nov', revenue: 580000, pending: 95000 },
];

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-xl shadow-xl border border-surface-200 text-xs space-y-1.5">
        <p className="font-bold text-surface-800">{label} 2026</p>
        <div className="flex items-center space-x-2 text-brand-700">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-600" />
          <span>Collected: </span>
          <span className="font-semibold">{formatCurrency(payload[0]?.value || 0)}</span>
        </div>
        <div className="flex items-center space-x-2 text-amber-600">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Pending: </span>
          <span className="font-semibold">{formatCurrency(payload[1]?.value || 0)}</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function RevenueChart(): JSX.Element {
  const [timeRange, setTimeRange] = useState<'3M' | '6M' | '1Y'>('6M');

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-surface-200/90 shadow-subtle flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-surface-100 gap-2">
        <div>
          <h3 className="font-bold text-base text-surface-900 tracking-tight">Revenue & Invoicing Trend</h3>
          <p className="text-xs text-surface-500">Track collections vs outstanding dues across billing cycles</p>
        </div>

        <div className="flex items-center space-x-1.5 bg-surface-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
          {(['3M', '6M', '1Y'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-lg transition-all ${
                timeRange === range
                  ? 'bg-white text-brand-700 shadow-sm'
                  : 'text-surface-600 hover:text-surface-900'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="h-72 w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="brandRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="amberPendingGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickFormatter={(val) => `₹${val / 1000}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: '16px', fontSize: '12px' }}
            />
            <Area
              name="Collected Revenue"
              type="monotone"
              dataKey="revenue"
              stroke="#7c3aed"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#brandRevenueGradient)"
            />
            <Area
              name="Pending Invoiced"
              type="monotone"
              dataKey="pending"
              stroke="#f59e0b"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#amberPendingGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
