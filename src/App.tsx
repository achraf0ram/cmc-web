import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { MainLayout } from "./layouts/MainLayout";
import Index from "./pages/Index";
import WorkCertificate from "./pages/WorkCertificate";
import MissionOrder from "./pages/MissionOrder";
import VacationRequest from "./pages/VacationRequest";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import SignInFrench from "./pages/SignInFrench";
import SignUpFrench from "./pages/SignUpFrench";
import ResetPasswordPage from "./pages/ResetPassword";
import ForgotPasswordPage from "./pages/ForgotPassword";
import AdminDashboard from "./pages/AdminDashboard";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("User is not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public route component (accessible only when not logged in)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    console.log("User is authenticated, redirecting to dashboard");
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Auth routes */}
              <Route
                path='/login'
                element={
                  <PublicRoute>
                    <SignInFrench />
                  </PublicRoute>
                }
              />
              <Route
                path='/register'
                element={
                  <PublicRoute>
                    <SignUpFrench />
                  </PublicRoute>
                }
              />
              <Route
                path='/forgot-password'
                element={
                  <PublicRoute>
                    <ForgotPasswordPage />
                  </PublicRoute>
                }
              />
              <Route
                path='/reset-password'
                element={
                  <PublicRoute>
                    <ResetPasswordPage />
                  </PublicRoute>
                }
              />

              {/* Protected routes */}
              <Route
                path='/'
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }>
                <Route
                  index
                  element={<Index />}
                />
                <Route
                  path='work-certificate'
                  element={<WorkCertificate />}
                />
                <Route
                  path='mission-order'
                  element={<MissionOrder />}
                />
                <Route
                  path='vacation-request'
                  element={<VacationRequest />}
                />
                <Route
                  path='admin-dashboard'
                  element={<AdminDashboard />}
                />
                <Route
                  path='settings'
                  element={<Settings />}
                />
              </Route>
              
              {/* Catch all route */}
              <Route
                path='*'
                element={<NotFound />}
              />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
