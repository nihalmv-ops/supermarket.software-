import { FileText, FileSpreadsheet, UserPlus, Palette, LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ActionItem {
  title: string;
  desc: string;
  icon: LucideIcon;
  to: string;
  gradient: string;
  buttonColor: string;
}

const actions: ActionItem[] = [
  {
    title: 'Create Invoice',
    desc: 'Generate GST-compliant bill',
    icon: FileText,
    to: '/invoices',
    gradient: 'from-brand-600 to-brand-700 text-white',
    buttonColor: 'bg-white/20 text-white hover:bg-white/30',
  },
  {
    title: 'New Quotation',
    desc: 'Send estimates with 1-click convert',
    icon: FileSpreadsheet,
    to: '/quotations',
    gradient: 'from-blue-600 to-indigo-600 text-white',
    buttonColor: 'bg-white/20 text-white hover:bg-white/30',
  },
  {
    title: 'Register Customer',
    desc: 'Add client profile & GSTIN info',
    icon: UserPlus,
    to: '/customers',
    gradient: 'from-emerald-600 to-teal-700 text-white',
    buttonColor: 'bg-white/20 text-white hover:bg-white/30',
  },
  {
    title: 'PDF Designer',
    desc: 'Personalize invoice & quote branding',
    icon: Palette,
    to: '/pdf-designer',
    gradient: 'from-purple-900 to-brand-900 text-white',
    buttonColor: 'bg-white/20 text-white hover:bg-white/30',
  },
];

export default function QuickActions(): JSX.Element {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((act) => (
        <Link
          key={act.title}
          to={act.to}
          className={`p-4 rounded-2xl bg-gradient-to-br ${act.gradient} shadow-subtle hover-subtle flex flex-col justify-between group transition-all duration-200`}
        >
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md">
              <act.icon className="w-5 h-5 text-white" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/15">
              Quick
            </span>
          </div>

          <div className="mt-4">
            <h4 className="text-sm font-bold text-white group-hover:translate-x-0.5 transition-transform">
              {act.title}
            </h4>
            <p className="text-xs text-white/80 mt-0.5">{act.desc}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
