import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { MainLayout } from "./layouts/MainLayout";
import Index from "./pages/Index";
import WorkCertificate from "./pages/WorkCertificate";
import MissionOrder from "./pages/MissionOrder";
import VacationRequest from "./pages/VacationRequest";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import SignInPage from "./pages/SignIn";
import SignUpPage from "./pages/SignUp";


const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Chargement...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }

  return <>{children}</>;
};

// Public route component (accessible only when not logged in)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Chargement...</div>;
  }

  if (isAuthenticated) {
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
              <Route path="/sign-in" element={
                <PublicRoute>
                  <SignInPage />
                </PublicRoute>
              } />
              <Route path="/sign-up" element={
                <PublicRoute>
                  <SignUpPage />
                </PublicRoute>
              } />
              
              {/* Protected routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Index />} />
                <Route path="work-certificate" element={<WorkCertificate />} />
                <Route path="mission-order" element={<MissionOrder />} />
                <Route path="vacation-request" element={<VacationRequest />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            <Route path="*" element= {<NotFound />} />
          </Routes>
        </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
