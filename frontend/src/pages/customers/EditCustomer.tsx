import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit3, AlertCircle, Loader2 } from 'lucide-react';
import { customerService } from '../../services/customerService';
import { Customer, CustomerFormData } from '../../types/customer.types';
import { CustomerForm } from '../../components/customers/CustomerForm';

export const EditCustomer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchCustomer = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await customerService.getCustomerById(id);
      setCustomer(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load customer profile';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  const handleSubmit = async (data: CustomerFormData) => {
    if (!id) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await customerService.updateCustomer(id, data);
      navigate(`/customers/${id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update customer';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
          <span>Loading customer details...</span>
        </div>
      </div>
    );
  }

  if (!customer && !isLoading) {
    return (
      <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-base font-bold text-slate-900">Customer Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested customer record does not exist or belongs to another business.
        </p>
        <button
          onClick={() => navigate('/customers')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
        >
          Return to Customer Directory
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Navigation */}
      <button
        onClick={() => navigate(`/customers/${id}`)}
        className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Customer Profile
      </button>

      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
          <Edit3 className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Edit Customer: {customer?.customerName}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Update contact channels, GSTIN registration, or address coordinates.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Customer Form */}
      {customer && (
        <CustomerForm
          initialValues={customer}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitButtonText="Save Customer Changes"
          onCancel={() => navigate(`/customers/${id}`)}
        />
      )}
    </div>
  );
};
