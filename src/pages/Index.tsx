
import { useAuth } from "@/contexts/AuthContext";
import { Dashboard } from "@/components/Dashboard";
import { Navigate } from "react-router-dom";

const Index = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Dashboard />;
};

export default Index;
