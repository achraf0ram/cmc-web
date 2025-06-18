
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MainLayout } from "@/layouts/MainLayout";
import Index from "@/pages/Index";
import VacationRequest from "@/pages/VacationRequest";
import WorkCertificate from "@/pages/WorkCertificate";
import MissionOrder from "@/pages/MissionOrder";
import Settings from "@/pages/Settings";
import SignInPage from "@/pages/SignIn";
import SignUpPage from "@/pages/SignUp";
import ForgotPasswordPage from "@/pages/ForgotPassword";
import ResetPasswordPage from "@/pages/ResetPassword";
import UserDashboard from "@/pages/UserDashboard";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <LanguageProvider>
            <TooltipProvider>
              <SidebarProvider>
                <Router>
                  <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 to-green-50">
                    <Routes>
                      <Route path="/login" element={<SignInPage />} />
                      <Route path="/register" element={<SignUpPage />} />
                      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                      <Route path="/reset-password" element={<ResetPasswordPage />} />
                      <Route path="/" element={<MainLayout />}>
                        <Route index element={<Index />} />
                        <Route path="vacation-request" element={<VacationRequest />} />
                        <Route path="work-certificate" element={<WorkCertificate />} />
                        <Route path="mission-order" element={<MissionOrder />} />
                        <Route path="settings" element={<Settings />} />
                        <Route path="dashboard" element={<UserDashboard />} />
                      </Route>
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </div>
                  <Toaster />
                  <Sonner />
                </Router>
              </SidebarProvider>
            </TooltipProvider>
          </LanguageProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
