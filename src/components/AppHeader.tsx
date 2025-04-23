
import { Search, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const AppHeader = () => {
  return (
    <header className="bg-white border-b py-2 px-6 flex items-center justify-between">
      <div className="flex-1">
        <div className="relative w-full max-w-sm">
          <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="بحث..."
            className="pl-4 pr-10 bg-slate-50 border-slate-200"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell size={18} />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center">
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="p-4 border-b">
              <h4 className="font-semibold">الإشعارات</h4>
            </div>
            <DropdownMenuItem className="p-4 cursor-pointer hover:bg-slate-50">
              <div className="flex flex-col gap-1">
                <span className="font-medium">تم الموافقة على طلب الإجازة</span>
                <span className="text-xs text-muted-foreground">منذ ساعتين</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="p-4 cursor-pointer hover:bg-slate-50">
              <div className="flex flex-col gap-1">
                <span className="font-medium">تم إصدار شهادة العمل</span>
                <span className="text-xs text-muted-foreground">منذ 3 ساعات</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="p-4 cursor-pointer hover:bg-slate-50">
              <div className="flex flex-col gap-1">
                <span className="font-medium">تذكير: تحديث البيانات الشخصية</span>
                <span className="text-xs text-muted-foreground">منذ يوم</span>
              </div>
            </DropdownMenuItem>
            <div className="p-2 text-center border-t">
              <Button variant="link" size="sm">
                عرض كل الإشعارات
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
