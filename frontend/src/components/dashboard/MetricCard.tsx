import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  colorScheme?: 'brand' | 'emerald' | 'amber' | 'rose' | 'blue';
  badge?: string;
}

export default function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendDirection = 'up',
  colorScheme = 'brand',
  badge,
}: MetricCardProps): JSX.Element {
  const colorMap = {
    brand: {
      iconBg: 'bg-brand-50 text-brand-600',
      trendBg: 'text-brand-700 bg-brand-50',
    },
    emerald: {
      iconBg: 'bg-emerald-50 text-emerald-600',
      trendBg: 'text-emerald-700 bg-emerald-50',
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-600',
      trendBg: 'text-amber-700 bg-amber-50',
    },
    rose: {
      iconBg: 'bg-rose-50 text-rose-600',
      trendBg: 'text-rose-700 bg-rose-50',
    },
    blue: {
      iconBg: 'bg-blue-50 text-blue-600',
      trendBg: 'text-blue-700 bg-blue-50',
    },
  };

  const currentTheme = colorMap[colorScheme] || colorMap.brand;

  return (
    <div className="bg-white rounded-2xl p-5 border border-surface-200/90 shadow-subtle hover-subtle relative overflow-hidden transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">
              {title}
            </span>
            {badge && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-surface-100 text-surface-600">
                {badge}
              </span>
            )}
          </div>
          <div className="text-2xl font-extrabold text-surface-900 tracking-tight">
            {value}
          </div>
        </div>

        {Icon && (
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${currentTheme.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 pt-3 border-t border-surface-100 flex items-center justify-between text-xs">
          {trend ? (
            <div className="flex items-center space-x-1.5 font-medium">
              <span
                className={`inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded text-[11px] font-bold ${
                  trendDirection === 'up'
                    ? 'text-emerald-700 bg-emerald-50'
                    : trendDirection === 'down'
                    ? 'text-rose-700 bg-rose-50'
                    : 'text-surface-600 bg-surface-100'
                }`}
              >
                {trendDirection === 'up' && <TrendingUp className="w-3 h-3" />}
                {trendDirection === 'down' && <TrendingDown className="w-3 h-3" />}
                {trendDirection === 'neutral' && <Minus className="w-3 h-3" />}
                <span>{trend}</span>
              </span>
              <span className="text-surface-400 text-[11px]">vs last month</span>
            </div>
          ) : (
            <span className="text-surface-400 text-[11px]">{subtitle}</span>
          )}
        </div>
      )}
    </div>
  );
}
