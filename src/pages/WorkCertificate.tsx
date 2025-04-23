
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  purpose: z.string().min(5, {
    message: "يرجى وصف الغرض من الشهادة",
  }),
  additionalInfo: z.string().optional(),
});

const WorkCertificate = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      purpose: "",
      additionalInfo: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    setIsSubmitted(true);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">طلب شهادة عمل</h1>

      {isSubmitted ? (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">
                  تم تقديم طلبك بنجاح!
                </h2>
                <p className="text-muted-foreground">
                  سيتم مراجعة الطلب وإصدار الشهادة في أقرب وقت.
                  يمكنك متابعة حالة الطلب من الصفحة الرئيسية.
                </p>
                <Button 
                  className="mt-4" 
                  onClick={() => setIsSubmitted(false)}
                >
                  طلب شهادة جديدة
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>معلومات الطلب</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="purpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الغرض من الشهادة*</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="على سبيل المثال: تقديم للبنك، تأشيرة سفر، إلخ"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="additionalInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>معلومات إضافية</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="أي معلومات إضافية ترغب في إضافتها للطلب"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-3">
                  <Button type="submit">تقديم الطلب</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WorkCertificate;
