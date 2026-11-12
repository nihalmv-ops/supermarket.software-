import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { useBusiness } from '../../hooks/useBusiness';
import { BusinessCard } from '../../components/business/BusinessCard';
import { BusinessSearch } from '../../components/business/BusinessSearch';

export const BusinessSwitcher: React.FC = () => {
  const navigate = useNavigate();
  const { activeBusiness, myBusinesses, switchBusiness, refreshBusinesses, isLoading } =
    useBusiness();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [switchingId, setSwitchingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const filteredBusinesses = useMemo(() => {
    return myBusinesses.filter((b) => {
      const matchesSearch =
        search === '' ||
        b.businessName.toLowerCase().includes(search.toLowerCase()) ||
        b.businessSlug.toLowerCase().includes(search.toLowerCase()) ||
        b.email.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'all' || b.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [myBusinesses, search, statusFilter]);

  const handleSwitch = async (id: string) => {
    setSwitchingId(id);
    setActionError(null);
    try {
      await switchBusiness(id);
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to switch business';
      setActionError(msg);
    } finally {
      setSwitchingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>

          <button
            onClick={() => refreshBusinesses()}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-indigo-600 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-indigo-200 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Header Title & CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Multi-Tenant Architecture
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Your Business Portfolio</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Switch seamlessly between your registered businesses or provision a new company.
            </p>
          </div>

          <button
            onClick={() => navigate('/business/new')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-xs hover:shadow-md transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Register New Business
          </button>
        </div>

        {actionError && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Filter & Search Bar */}
        <BusinessSearch
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          placeholder="Filter businesses by name, slug or email..."
        />

        {/* Grid of Businesses */}
        {filteredBusinesses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBusinesses.map((biz) => (
              <BusinessCard
                key={biz._id}
                business={biz}
                isActive={activeBusiness?._id === biz._id}
                onSwitch={handleSwitch}
                isSwitching={switchingId === biz._id}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">No businesses found</h3>
              <p className="text-xs text-slate-500 mt-1">
                {search
                  ? 'No business matches your current search criteria.'
                  : 'You do not have any registered businesses yet.'}
              </p>
            </div>
            <button
              onClick={() => navigate('/business/new')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Register First Business
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
