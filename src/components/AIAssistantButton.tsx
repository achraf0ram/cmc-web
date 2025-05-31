
import { useState } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export const AIAssistantButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'مرحباً! أنا مساعد CMC الذكي. يمكنني مساعدتك في الحصول على معلومات حول الخدمات والإجراءات.',
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();
  const { toast } = useToast();

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // محاكاة استجابة الذكاء الاصطناعي مع معلومات من موقع CMC
      const aiResponse = await generateAIResponse(userMessage.text);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في الحصول على الاستجابة. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIResponse = async (userInput: string): Promise<string> => {
    // محاكاة استجابة ذكية بناءً على النص المدخل
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes('شهادة') || lowerInput.includes('عمل')) {
      return `يمكنك طلب شهادة العمل من خلال قسم "شهادة العمل" في المنصة. سيتم معالجة طلبك خلال 3-5 أيام عمل.
      
للمزيد من المعلومات حول CMC، يمكنك زيارة الموقع الرسمي: https://cmc.ac.ma/ar`;
    }
    
    if (lowerInput.includes('إجازة') || lowerInput.includes('عطلة')) {
      return `لطلب إجازة، توجه إلى قسم "طلب الإجازة" واملأ النموذج المطلوب. تأكد من تقديم الطلب قبل أسبوعين على الأقل من التاريخ المطلوب.
      
CMC يوفر أنواع مختلفة من الإجازات حسب القوانين المعمول بها.`;
    }
    
    if (lowerInput.includes('مهمة') || lowerInput.includes('أمر')) {
      return `أمر المهمة يمكن طلبه من قسم "أمر المهمة" في المنصة. سيتم إشعارك بالموافقة أو الرفض خلال 24-48 ساعة.
      
تأكد من تعبئة جميع البيانات المطلوبة بدقة.`;
    }
    
    if (lowerInput.includes('cmc') || lowerInput.includes('كلية')) {
      return `كلية محمد السادس للعلوم الصحية (CMC) هي مؤسسة تعليمية رائدة في المغرب.
      
للمزيد من المعلومات:
- الموقع الرسمي: https://cmc.ac.ma/ar
- تقدم برامج طبية متقدمة
- تركز على التدريب العملي والبحث العلمي`;
    }
    
    return `شكراً لسؤالك. يمكنني مساعدتك في:
- طلب شهادة العمل
- طلب الإجازات
- أوامر المهمات
- معلومات عامة حول CMC

للمزيد من المعلومات التفصيلية، يرجى زيارة الموقع الرسمي: https://cmc.ac.ma/ar`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* الزر العائم */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50",
          "bg-gradient-to-r from-cmc-blue to-cmc-green hover:from-cmc-blue-dark hover:to-emerald-600",
          "transition-all duration-300 hover:scale-110"
        )}
        size="icon"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </Button>

      {/* نافذة المحادثة */}
      {isOpen && (
        <Card className={cn(
          "fixed bottom-24 right-6 w-80 md:w-96 h-96 z-40",
          "cmc-card flex flex-col"
        )}>
          {/* رأس النافذة */}
          <div className="flex items-center gap-3 p-4 border-b bg-gradient-to-r from-cmc-blue to-cmc-green text-white rounded-t-lg">
            <Bot size={20} />
            <div className="flex-1">
              <h3 className="font-semibold">مساعد CMC الذكي</h3>
              <p className="text-xs opacity-90">هنا لمساعدتك</p>
            </div>
          </div>

          {/* منطقة الرسائل */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.isUser ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] p-3 rounded-lg text-sm",
                      message.isUser
                        ? "bg-cmc-blue text-white rounded-br-none"
                        : "bg-gray-100 text-gray-800 rounded-bl-none"
                    )}
                  >
                    <p className="whitespace-pre-wrap">{message.text}</p>
                    <p className={cn(
                      "text-xs mt-1 opacity-70",
                      message.isUser ? "text-blue-100" : "text-gray-500"
                    )}>
                      {message.timestamp.toLocaleTimeString('ar-MA', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-3 rounded-lg rounded-bl-none">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* منطقة الإدخال */}
          <div className="p-4 border-t bg-gray-50 rounded-b-lg">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="اكتب رسالتك هنا..."
                className="flex-1 cmc-input"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                size="icon"
                className="cmc-button-primary"
              >
                <Send size={16} />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};
