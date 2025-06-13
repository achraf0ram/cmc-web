
import { CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface MissionOrderSuccessProps {
  onNewRequest: () => void;
}

const MissionOrderSuccess = ({ onNewRequest }: MissionOrderSuccessProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="pt-6 pb-6 md:pt-8 md:pb-8">
          <div className="flex flex-col items-center text-center gap-4 md:gap-6">
            <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-gradient-to-r from-blue-600 to-green-600 flex items-center justify-center shadow-lg">
              <CheckCircle className="h-8 w-8 md:h-10 md:w-10 text-white" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-3 text-slate-800">تم الإرسال بنجاح</h2>
              <p className="text-slate-600 leading-relaxed mb-4 md:mb-6 text-sm md:text-base">تم إرسال طلب أمر المهمة بنجاح وسيتم معالجته قريباً</p>
              <Button 
                onClick={onNewRequest}
                className="border-blue-500 text-blue-600 hover:bg-blue-50 px-6 md:px-8 py-2 md:py-3 rounded-lg text-sm md:text-base"
              >
                إرسال طلب جديد
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MissionOrderSuccess;
