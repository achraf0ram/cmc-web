
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

interface SuccessMessageProps {
  title: string;
  description: string;
  buttonText: string;
  onReset: () => void;
}

export const SuccessMessage = ({
  title,
  description,
  buttonText,
  onReset
}: SuccessMessageProps) => {
  return (
    <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
      <CardContent className="pt-8 pb-8">
        <div className="flex flex-col items-center text-center gap-6">
          <div className="h-20 w-20 rounded-full bg-gradient-to-r from-green-100 to-green-200 flex items-center justify-center shadow-lg">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3 text-gray-900">{title}</h2>
            <p className="text-gray-600 leading-relaxed mb-6">{description}</p>
            <Button 
              onClick={onReset}
              className="px-8 py-3 bg-gradient-to-r from-sahara-600 to-sahara-700 hover:from-sahara-700 hover:to-sahara-800 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {buttonText}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
