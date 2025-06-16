
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentUserRole } from "@/hooks/useUserRoles";
import { Dashboard } from "@/components/Dashboard";
import UserDashboard from "./UserDashboard";

const Index = () => {
  const { isAuthenticated } = useAuth();
  const { data: userRoles } = useCurrentUserRole();
  
  const hasAdminRole = userRoles?.some(r => r.role === 'admin' || r.role === 'hr');

  if (!isAuthenticated) {
    return <Dashboard />;
  }

  // إذا كان المستخدم مدير، يرى لوحة التحكم العامة
  // إذا كان مستخدم عادي، يرى لوحة تتبع الطلبات
  if (hasAdminRole) {
    return <Dashboard />;
  }
  
  return <UserDashboard />;
};

export default Index;
