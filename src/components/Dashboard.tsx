
import {
  Calendar,
  FileText,
  ClipboardCheck,
  Clock,
  Check,
  CheckCheck,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const Dashboard = () => {
  const quickAccess = [
    {
      title: "طلب شهادة عمل",
      icon: FileText,
      color: "bg-blue-100 text-blue-700",
      path: "/work-certificate",
    },
    {
      title: "طلب أمر مهمة",
      icon: ClipboardCheck,
      color: "bg-emerald-100 text-emerald-700",
      path: "/mission-order",
    },
    {
      title: "طلب إجازة",
      icon: Calendar,
      color: "bg-purple-100 text-purple-700",
      path: "/vacation-request",
    },
  ];

  const recentRequests = [
    {
      id: "REQ1234",
      type: "شهادة عمل",
      submittedDate: "10 أبريل 2025",
      status: "مكتمل",
      statusColor: "bg-green-100 text-green-700",
    },
    {
      id: "REQ1235",
      type: "أمر مهمة",
      submittedDate: "8 أبريل 2025",
      status: "قيد المراجعة",
      statusColor: "bg-yellow-100 text-yellow-700",
    },
    {
      id: "REQ1236",
      type: "طلب إجازة",
      submittedDate: "5 أبريل 2025",
      status: "مرفوض",
      statusColor: "bg-red-100 text-red-700",
    },
  ];

  const statusCounts = [
    { title: "قيد المعالجة", count: 2, icon: Clock, color: "text-yellow-500" },
    { title: "مكتملة", count: 5, icon: Check, color: "text-green-500" },
    { title: "مرفوضة", count: 1, icon: XCircle, color: "text-red-500" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">مرحباً بك، أحمد</h1>
        <p className="text-muted-foreground">
          هذه لوحة التحكم الخاصة بك للوصول لجميع الطلبات والخدمات
        </p>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickAccess.map((item) => (
          <Link to={item.path} key={item.title}>
            <Card className="hover:shadow-md transition-all">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`p-3 rounded-full ${item.color}`}>
                  <item.icon size={24} />
                </div>
                <div>
                  <h3 className="font-medium">{item.title}</h3>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statusCounts.map((item) => (
          <Card key={item.title}>
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-muted-foreground text-sm">{item.title}</p>
                <p className="text-3xl font-bold">{item.count}</p>
              </div>
              <div className={`p-3 rounded-full ${item.color}`}>
                <item.icon size={24} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Requests */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>آخر الطلبات</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم الطلب</TableHead>
                <TableHead>نوع الطلب</TableHead>
                <TableHead>تاريخ التقديم</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.id}</TableCell>
                  <TableCell>{request.type}</TableCell>
                  <TableCell>{request.submittedDate}</TableCell>
                  <TableCell>
                    <Badge className={request.statusColor}>
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      عرض التفاصيل
                    </Button>
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
