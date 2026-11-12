import React, { ReactNode } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types/auth.types';
import { Sparkles, ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  children?: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  children,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-700 via-brand-600 to-brand-400 flex items-center justify-center shadow-lg shadow-brand-500/25 animate-pulse mb-4">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-wider text-surface-400 animate-pulse">
          Authenticating Silver Session...
        </p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    // Redirect to login while preserving the attempted URL in location state
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-surface-200 p-8 text-center shadow-subtle">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-surface-900 mb-1">Access Restricted</h2>
          <p className="text-xs text-surface-500 mb-6">
            Your user account ({user.role}) does not have permission to access this area.
          </p>
          <button
            onClick={() => window.history.back()}
            className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return children ? <>{children}</> : <Outlet />;
};
