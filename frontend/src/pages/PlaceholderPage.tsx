import { ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PlaceholderPageProps {
  title: string;
  moduleNumber?: string | number;
  description?: string;
  upcomingFeatures?: string[];
}

export default function PlaceholderPage({
  title,
  moduleNumber,
  description,
  upcomingFeatures = [],
}: PlaceholderPageProps): JSX.Element {
  return (
    <div className="bg-white rounded-2xl border border-surface-200/90 shadow-subtle p-8 sm:p-12 text-center max-w-3xl mx-auto my-8">
      <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-4 border border-brand-100">
        <Sparkles className="w-8 h-8" />
      </div>

      <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200 mb-3">
        <span>Module {moduleNumber || 'Architecture'}</span>
        <span>•</span>
        <span>Scheduled for Next Phase</span>
      </div>

      <h2 className="text-2xl font-extrabold text-surface-900 tracking-tight mb-2">
        {title}
      </h2>

      <p className="text-sm text-surface-500 max-w-xl mx-auto mb-8">
        {description ||
          'This module has been architectural scaffolded with routes and state isolation. Full functional integration, database schemas, and live APIs will be activated in Phase 2.'}
      </p>

      {upcomingFeatures.length > 0 && (
        <div className="bg-surface-50/70 border border-surface-200 rounded-xl p-5 text-left mb-8 max-w-md mx-auto">
          <h4 className="text-xs font-bold uppercase tracking-wider text-surface-400 mb-3">
            Module Capabilities
          </h4>
          <ul className="space-y-2 text-xs text-surface-700">
            {upcomingFeatures.map((feat, idx) => (
              <li key={idx} className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center justify-center space-x-3">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-surface-700 bg-surface-100 hover:bg-surface-200 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
