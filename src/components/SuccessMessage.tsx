
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
    <Card className="cmc-card">
      <CardContent className="pt-6 pb-6 md:pt-8 md:pb-8">
        <div className="flex flex-col items-center text-center gap-4 md:gap-6">
          <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-gradient-to-r from-cmc-green-light to-emerald-100 flex items-center justify-center shadow-lg">
            <CheckCircle className="h-8 w-8 md:h-10 md:w-10 text-cmc-green" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-3 text-slate-800">{title}</h2>
            <p className="text-slate-600 leading-relaxed mb-4 md:mb-6 text-sm md:text-base">{description}</p>
            <Button 
              onClick={onReset}
              className="cmc-button-primary px-6 md:px-8 py-2 md:py-3 rounded-lg text-sm md:text-base"
            >
              {buttonText}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
