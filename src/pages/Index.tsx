
import { useAuth } from "@/contexts/AuthContext";
import { Dashboard } from "@/components/Dashboard";

const Index = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Dashboard />;
  }

  return <Dashboard />;
};

export default Index;
