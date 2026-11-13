import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, AlertCircle } from 'lucide-react';
import { customerService } from '../../services/customerService';
import { CustomerFormData } from '../../types/customer.types';
import { CustomerForm } from '../../components/customers/CustomerForm';

export const AddCustomer: React.FC = () => {
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (data: CustomerFormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await customerService.createCustomer(data);
      navigate('/customers');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create customer.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Navigation */}
      <button
        onClick={() => navigate('/customers')}
        className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Customer Directory
      </button>

      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
          <UserPlus className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Add New Customer Account
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Register client billing details, GSTIN, and shipping coordinates for invoice generation.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form Component */}
      <CustomerForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitButtonText="Create Customer Profile"
        onCancel={() => navigate('/customers')}
      />
    </div>
  );
};
