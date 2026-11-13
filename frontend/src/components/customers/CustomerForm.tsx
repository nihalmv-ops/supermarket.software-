import React, { useState } from 'react';
import {
  User,
  Building2,
  Phone,
  Mail,
  FileText,
  MapPin,
  Save,
  CheckSquare,
  Square,
  AlertCircle,
} from 'lucide-react';
import { CustomerFormData } from '../../types/customer.types';

interface CustomerFormProps {
  initialValues?: Partial<CustomerFormData>;
  onSubmit: (data: CustomerFormData) => Promise<void>;
  isSubmitting: boolean;
  submitButtonText?: string;
  onCancel: () => void;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({
  initialValues,
  onSubmit,
  isSubmitting,
  submitButtonText = 'Save Customer',
  onCancel,
}) => {
  const [formData, setFormData] = useState<CustomerFormData>({
    customerName: initialValues?.customerName || '',
    companyName: initialValues?.companyName || '',
    customerType: initialValues?.customerType || 'business',
    phone: initialValues?.phone || '',
    alternatePhone: initialValues?.alternatePhone || '',
    email: initialValues?.email || '',
    gstin: initialValues?.gstin || '',
    billingAddress: initialValues?.billingAddress || '',
    shippingAddress: initialValues?.shippingAddress || '',
    city: initialValues?.city || '',
    state: initialValues?.state || '',
    pincode: initialValues?.pincode || '',
    country: initialValues?.country || 'India',
    notes: initialValues?.notes || '',
    isActive: initialValues?.isActive ?? true,
  });

  const [copyBilling, setCopyBilling] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (copyBilling && name === 'billingAddress') {
        updated.shippingAddress = value;
      }
      return updated;
    });
  };

  const handleCopyBillingToggle = () => {
    setCopyBilling(!copyBilling);
    if (!copyBilling) {
      setFormData((prev) => ({
        ...prev,
        shippingAddress: prev.billingAddress,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!formData.customerName.trim()) {
      setValidationError('Customer Name is required.');
      return;
    }

    if (!formData.phone.trim()) {
      setValidationError('Primary Phone number is required.');
      return;
    }

    if (formData.gstin) {
      const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstinRegex.test(formData.gstin.trim().toUpperCase())) {
        setValidationError(
          'Invalid Indian GSTIN format. Example: 27AAAAA0000A1Z5 (15 characters)'
        );
        return;
      }
    }

    await onSubmit({
      ...formData,
      gstin: formData.gstin ? formData.gstin.trim().toUpperCase() : '',
      email: formData.email ? formData.email.trim().toLowerCase() : '',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {validationError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Section 1: Customer Identity */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-600" />
          General Identity & Category
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Customer / Contact Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              placeholder="e.g. Anand Mahindra"
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Customer Classification
            </label>
            <select
              name="customerType"
              value={formData.customerType}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all capitalize"
            >
              <option value="business">Business (B2B)</option>
              <option value="individual">Individual (B2C)</option>
              <option value="wholesale">Wholesale</option>
              <option value="retail">Retail</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Company / Trading Name (Optional)
            </label>
            <div className="relative">
              <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="e.g. Apex Global Logistics"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              GSTIN / Tax ID (Optional)
            </label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                name="gstin"
                value={formData.gstin}
                onChange={handleChange}
                placeholder="e.g. 27AAAAA0000A1Z5"
                maxLength={15}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-800 uppercase placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Contact Details */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Phone className="w-4 h-4 text-indigo-600" />
          Contact Channels
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Primary Phone <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 9876543210"
                required
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Alternate Phone
            </label>
            <input
              type="tel"
              name="alternatePhone"
              value={formData.alternatePhone}
              onChange={handleChange}
              placeholder="+91 22 24567890"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="accounts@company.com"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Billing & Shipping Address */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-indigo-600" />
          Billing & Shipping Locations
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Billing Address
            </label>
            <textarea
              name="billingAddress"
              rows={3}
              value={formData.billingAddress}
              onChange={handleChange}
              placeholder="Building, street, premises address for invoices..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Shipping Address
              </label>
              <button
                type="button"
                onClick={handleCopyBillingToggle}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
              >
                {copyBilling ? (
                  <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-slate-400" />
                )}
                Same as Billing
              </button>
            </div>
            <textarea
              name="shippingAddress"
              rows={3}
              value={formData.shippingAddress}
              onChange={handleChange}
              disabled={copyBilling}
              placeholder="Delivery / consignment destination address..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all disabled:opacity-60"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Mumbai"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="Maharashtra"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Postal Code</label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              placeholder="400001"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Country</label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="India"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>
        </div>
      </div>

      {/* Section 4: Notes & Status */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Internal Reference & Notes</h3>

        <div>
          <textarea
            name="notes"
            rows={2}
            value={formData.notes}
            onChange={handleChange}
            placeholder="Credit limit, payment preferences, or special delivery instructions..."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData((p) => ({ ...p, isActive: e.target.checked }))}
            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
          />
          <label htmlFor="isActive" className="text-xs font-semibold text-slate-700 cursor-pointer">
            Account Active (Permit generating invoices & quotations for this client)
          </label>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSubmitting ? 'Saving Customer...' : submitButtonText}
        </button>
      </div>
    </form>
  );
};
