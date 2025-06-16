
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, UserPlus, Edit, Trash2 } from "lucide-react";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export const UsersManagement = () => {
  const { userRoles, isLoading, assignRole, removeRole } = useUserRoles();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [newRole, setNewRole] = useState<string>("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  const handleAssignRole = () => {
    if (selectedUserId && newRole) {
      assignRole.mutate({
        userId: selectedUserId,
        role: newRole as any,
      });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'hr':
        return 'bg-blue-100 text-blue-800';
      case 'manager':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'مدير النظام';
      case 'hr':
        return 'الموارد البشرية';
      case 'manager':
        return 'مدير';
      case 'employee':
        return 'موظف';
      default:
        return role;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">جاري التحميل...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>إدارة المستخدمين والأدوار</span>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                تعيين دور جديد
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>تعيين دور للمستخدم</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>معرف المستخدم</Label>
                  <Input
                    placeholder="أدخل معرف المستخدم"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                  />
                </div>
                <div>
                  <Label>الدور</Label>
                  <Select value={newRole} onValueChange={setNewRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الدور" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">مدير النظام</SelectItem>
                      <SelectItem value="hr">الموارد البشرية</SelectItem>
                      <SelectItem value="manager">مدير</SelectItem>
                      <SelectItem value="employee">موظف</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAssignRole} className="w-full">
                  تعيين الدور
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="البحث في المستخدمين..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="تصفية حسب الدور" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">جميع الأدوار</SelectItem>
              <SelectItem value="admin">مدير النظام</SelectItem>
              <SelectItem value="hr">الموارد البشرية</SelectItem>
              <SelectItem value="manager">مدير</SelectItem>
              <SelectItem value="employee">موظف</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>معرف المستخدم</TableHead>
              <TableHead>الدور</TableHead>
              <TableHead>تاريخ التعيين</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userRoles?.map((role) => (
              <TableRow key={role.id}>
                <TableCell className="font-medium">
                  {role.user_id.substring(0, 8)}...
                </TableCell>
                <TableCell>
                  <Badge className={getRoleBadgeColor(role.role)}>
                    {getRoleLabel(role.role)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(role.assigned_at).toLocaleDateString('ar-EG')}
                </TableCell>
                <TableCell>
                  <Badge variant={role.is_active ? "default" : "secondary"}>
                    {role.is_active ? "نشط" : "غير نشط"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => removeRole.mutate(role.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
