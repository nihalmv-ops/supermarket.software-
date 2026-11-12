import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Mail,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Send,
} from 'lucide-react';
import { authService } from '../../services/authService';

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword(): JSX.Element {
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setServerError(null);
    try {
      const message = await authService.forgotPassword(data.email);
      setSuccessMessage(message);
      setIsSuccess(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Unable to request password reset.';
      setServerError(message);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-700 via-brand-600 to-brand-400 flex items-center justify-center shadow-lg shadow-brand-500/25 mx-auto mb-4">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div className="flex items-center justify-center space-x-1.5 mb-1">
          <span className="font-extrabold text-2xl tracking-tight text-surface-900">SILVER</span>
          <span className="text-xs uppercase font-semibold px-2 py-0.5 rounded bg-brand-100 text-brand-700">
            SUITE
          </span>
        </div>
        <h2 className="text-lg font-bold text-surface-900">Recover your account password</h2>
        <p className="text-xs text-surface-500 mt-1">
          Enter your registered email and we'll send you instructions to reset your password.
        </p>
      </div>

      {/* Card Container */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-8 rounded-3xl border border-surface-200/90 shadow-subtle">
          {/* Server Error Alert */}
          {serverError && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          {isSuccess ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-surface-900">Check your inbox</h3>
                <p className="text-xs text-surface-500 mt-1.5 leading-relaxed">
                  {successMessage ||
                    'If an account with that email address exists, password reset instructions have been sent.'}
                </p>
                <p className="text-[11px] text-surface-400 mt-2">
                  (In development, the one-click reset link is also printed in your backend terminal).
                </p>
              </div>

              <div className="pt-4 border-t border-surface-100">
                <Link
                  to="/login"
                  className="inline-flex items-center space-x-2 text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Sign In</span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">
                  Registered Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-surface-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    placeholder="name@company.com"
                    className={`w-full pl-10 pr-3.5 py-2.5 text-xs bg-surface-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all ${
                      errors.email
                        ? 'border-rose-400 focus:border-rose-500'
                        : 'border-surface-200 focus:border-brand-500'
                    }`}
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 disabled:opacity-60 shadow-sm shadow-brand-500/25 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Dispatching Reset Request...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Reset Instructions</span>
                  </>
                )}
              </button>

              <div className="pt-4 border-t border-surface-100 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center space-x-1.5 text-xs font-semibold text-surface-600 hover:text-surface-900"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to login</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
