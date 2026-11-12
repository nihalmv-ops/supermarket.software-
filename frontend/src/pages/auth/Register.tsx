import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Building,
  Phone,
  AlertCircle,
  ArrowRight,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name cannot exceed 100 characters'),
    businessName: z
      .string()
      .min(2, 'Business name must be at least 2 characters')
      .max(150, 'Business name cannot exceed 150 characters'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Enter a valid email address'),
    phone: z
      .string()
      .min(7, 'Phone number must be at least 7 digits')
      .max(20, 'Phone number cannot exceed 20 digits'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least 1 uppercase letter')
      .regex(/[a-z]/, 'Must contain at least 1 lowercase letter')
      .regex(/[0-9]/, 'Must contain at least 1 number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    agreeTerms: z.literal(true, {
      errorMap: () => ({ message: 'You must accept the terms of service' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register(): JSX.Element {
  const { register: registerUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      businessName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    try {
      await registerUser({
        name: data.name,
        businessName: data.businessName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setServerError(message);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-700 via-brand-600 to-brand-400 flex items-center justify-center shadow-lg shadow-brand-500/25 mx-auto mb-4">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div className="flex items-center justify-center space-x-1.5 mb-1">
          <span className="font-extrabold text-2xl tracking-tight text-surface-900">SILVER</span>
          <span className="text-xs uppercase font-semibold px-2 py-0.5 rounded bg-brand-100 text-brand-700">
            SUITE
          </span>
        </div>
        <h2 className="text-lg font-bold text-surface-900">Create your Business Suite Account</h2>
        <p className="text-xs text-surface-500 mt-1">
          Get started with commercial invoicing, quotations, and multi-tenant management
        </p>
      </div>

      {/* Card Container */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-surface-200/90 shadow-subtle">
          {/* Server Error Alert */}
          {serverError && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Row 1: Owner Name & Business Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">
                  Owner Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-surface-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    className={`w-full pl-10 pr-3.5 py-2.5 text-xs bg-surface-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all ${
                      errors.name ? 'border-rose-400 focus:border-rose-500' : 'border-surface-200 focus:border-brand-500'
                    }`}
                    {...register('name')}
                  />
                </div>
                {errors.name && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">
                  Business / Company Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-surface-400">
                    <Building className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Apex Retail Solutions"
                    className={`w-full pl-10 pr-3.5 py-2.5 text-xs bg-surface-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all ${
                      errors.businessName ? 'border-rose-400 focus:border-rose-500' : 'border-surface-200 focus:border-brand-500'
                    }`}
                    {...register('businessName')}
                  />
                </div>
                {errors.businessName && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.businessName.message}</p>
                )}
              </div>
            </div>

            {/* Row 2: Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">
                  Business Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-surface-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    placeholder="billing@apex.in"
                    className={`w-full pl-10 pr-3.5 py-2.5 text-xs bg-surface-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all ${
                      errors.email ? 'border-rose-400 focus:border-rose-500' : 'border-surface-200 focus:border-brand-500'
                    }`}
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-surface-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    className={`w-full pl-10 pr-3.5 py-2.5 text-xs bg-surface-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all ${
                      errors.phone ? 'border-rose-400 focus:border-rose-500' : 'border-surface-200 focus:border-brand-500'
                    }`}
                    {...register('phone')}
                  />
                </div>
                {errors.phone && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.phone.message}</p>
                )}
              </div>
            </div>

            {/* Row 3: Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-surface-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
                    className={`w-full pl-10 pr-10 py-2.5 text-xs bg-surface-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all ${
                      errors.password ? 'border-rose-400 focus:border-rose-500' : 'border-surface-200 focus:border-brand-500'
                    }`}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-surface-400 hover:text-surface-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-surface-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Repeat password"
                    className={`w-full pl-10 pr-10 py-2.5 text-xs bg-surface-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all ${
                      errors.confirmPassword ? 'border-rose-400 focus:border-rose-500' : 'border-surface-200 focus:border-brand-500'
                    }`}
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-surface-400 hover:text-surface-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="pt-2">
              <label className="flex items-start space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded text-brand-600 border-surface-300 focus:ring-brand-500 mt-0.5 cursor-pointer"
                  {...register('agreeTerms')}
                />
                <span className="text-[11px] text-surface-600">
                  I agree to the{' '}
                  <span className="font-semibold text-brand-600 hover:underline">
                    Terms of Service
                  </span>{' '}
                  and{' '}
                  <span className="font-semibold text-brand-600 hover:underline">
                    Privacy Policy
                  </span>
                  .
                </span>
              </label>
              {errors.agreeTerms && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.agreeTerms.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 disabled:opacity-60 shadow-sm shadow-brand-500/25 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Your Business Account...</span>
                </>
              ) : (
                <>
                  <span>Register Business Suite</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-6 pt-6 border-t border-surface-100 text-center">
            <p className="text-xs text-surface-500">
              Already registered your business?{' '}
              <Link
                to="/login"
                className="font-bold text-brand-600 hover:text-brand-700 hover:underline"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-6 grid grid-cols-3 gap-2 text-center text-[11px] text-surface-500">
          <div className="flex items-center justify-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Instant Tenant Setup</span>
          </div>
          <div className="flex items-center justify-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>GST-Compliant Invoicing</span>
          </div>
          <div className="flex items-center justify-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Free Starter Plan</span>
          </div>
        </div>
      </div>
    </div>
  );
}
