
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
import { Building2, Plus, Edit, Trash2 } from "lucide-react";
import { useDepartments } from "@/hooks/useDepartments";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const DepartmentsManagement = () => {
  const { departments, isLoading, createDepartment, updateDepartment, deleteDepartment } = useDepartments();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
  });

  const handleSubmit = () => {
    if (editingDepartment) {
      updateDepartment.mutate({
        id: editingDepartment.id,
        ...formData,
      });
    } else {
      createDepartment.mutate(formData);
    }
    
    setIsDialogOpen(false);
    setEditingDepartment(null);
    setFormData({ name: "", code: "", description: "" });
  };

  const handleEdit = (department: any) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      code: department.code,
      description: department.description || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا القسم؟")) {
      deleteDepartment.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>إدارة الأقسام</span>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  إضافة قسم جديد
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingDepartment ? "تعديل القسم" : "إضافة قسم جديد"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>اسم القسم</Label>
                    <Input
                      placeholder="أدخل اسم القسم"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>رمز القسم</Label>
                    <Input
                      placeholder="أدخل رمز القسم (مثل: HR, IT)"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>الوصف</Label>
                    <Textarea
                      placeholder="وصف القسم (اختياري)"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <Button onClick={handleSubmit} className="w-full">
                    {editingDepartment ? "حفظ التغييرات" : "إنشاء القسم"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>اسم القسم</TableHead>
                <TableHead>الرمز</TableHead>
                <TableHead>الوصف</TableHead>
                <TableHead>تاريخ الإنشاء</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments?.map((department) => (
                <TableRow key={department.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-500" />
                    {department.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{department.code}</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {department.description || "-"}
                  </TableCell>
                  <TableCell>
                    {new Date(department.created_at).toLocaleDateString('ar-EG')}
                  </TableCell>
                  <TableCell>
                    <Badge variant={department.is_active ? "default" : "secondary"}>
                      {department.is_active ? "نشط" : "غير نشط"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEdit(department)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(department.id)}
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
    </div>
  );
};
