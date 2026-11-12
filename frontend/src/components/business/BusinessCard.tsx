import React from 'react';
import { Building2, Check, ArrowRight, ShieldCheck, Mail, MapPin } from 'lucide-react';
import { BusinessItem } from '../../types/business.types';
import { BusinessStatusBadge } from './BusinessStatusBadge';

interface BusinessCardProps {
  business: BusinessItem;
  isActive: boolean;
  onSwitch: (businessId: string) => void;
  isSwitching?: boolean;
}

export const BusinessCard: React.FC<BusinessCardProps> = ({
  business,
  isActive,
  onSwitch,
  isSwitching = false,
}) => {
  return (
    <div
      className={`relative rounded-xl border p-5 transition-all duration-200 bg-white ${
        isActive
          ? 'border-indigo-600 shadow-md ring-2 ring-indigo-600/10'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      {/* Top Banner / Tags */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
              isActive
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {business.logo ? (
              <img
                src={business.logo}
                alt={business.businessName}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <Building2 className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900 text-base">
                {business.businessName}
              </h3>
              {isActive && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                  <Check className="w-3 h-3 stroke-[3]" /> Active
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-mono">@{business.businessSlug}</p>
          </div>
        </div>

        <BusinessStatusBadge status={business.status} size="sm" />
      </div>

      {/* Meta Info */}
      <div className="space-y-2 py-3 border-y border-slate-100 text-xs text-slate-600">
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Business Type</span>
          <span className="font-medium text-slate-800">{business.businessType || 'Retail'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Your Role</span>
          <span className="inline-flex items-center gap-1 font-semibold text-slate-700 capitalize">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
            {business.role || 'owner'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Subscription Plan</span>
          <span className="px-2 py-0.5 font-medium rounded text-[11px] bg-slate-100 text-slate-700 border border-slate-200">
            {business.subscriptionPlan}
          </span>
        </div>

        {business.email && (
          <div className="flex items-center gap-2 pt-1 text-slate-500 truncate">
            <Mail className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{business.email}</span>
          </div>
        )}

        {business.city && (
          <div className="flex items-center gap-2 text-slate-500 truncate">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{business.city}, {business.country || 'India'}</span>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="mt-4 pt-1 flex items-center justify-between">
        {business.gstNumber ? (
          <div className="text-[11px] text-slate-400 font-mono">
            GSTIN: <span className="text-slate-600 font-semibold">{business.gstNumber}</span>
          </div>
        ) : (
          <span className="text-[11px] text-slate-400">No GST registered</span>
        )}

        {isActive ? (
          <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
            <Check className="w-4 h-4" /> Currently In Use
          </span>
        ) : (
          <button
            onClick={() => onSwitch(business._id)}
            disabled={isSwitching || business.status === 'suspended'}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 hover:text-white bg-indigo-50 hover:bg-indigo-600 border border-indigo-200 hover:border-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSwitching ? 'Switching...' : 'Switch Business'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
