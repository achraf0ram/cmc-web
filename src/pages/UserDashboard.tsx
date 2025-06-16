
import { UserRequestsStatus } from "@/components/user/UserRequestsStatus";

const UserDashboard = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">لوحة التحكم</h1>
        <p className="text-gray-600">تتبع حالة طلباتك ومعرفة آخر التحديثات</p>
      </div>
      
      <UserRequestsStatus />
    </div>
  );
};

export default UserDashboard;
