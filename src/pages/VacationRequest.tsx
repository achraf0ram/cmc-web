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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

// تعريف الـ Schema للتحقق من صحة البيانات
const formSchema = z.object({
  firstName: z.string().min(2, {
    message: "الاسم يجب أن يكون أكثر من حرفين",
  }),
  lastName: z.string().min(2, {
    message: "الاسم يجب أن يكون أكثر من حرفين",
  }),
  email: z.string().email({
    message: "الرجاء إدخال بريد إلكتروني صحيح",
  }),
  startDate: z.date({
    required_error: "يرجى تحديد تاريخ البداية",
  }),
  endDate: z.date({
    required_error: "يرجى تحديد تاريخ النهاية",
  }),
  reason: z.string().min(10, {
    message: "السبب يجب أن يكون أكثر من 10 حروف",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const PersonalInfoSection = ({ control }: { control: any }) => (
  <>
    <FormField
      control={control}
      name="firstName"
      render={({ field }) => (
        <FormItem>
          <FormLabel>First Name</FormLabel>
          <FormControl>
            <Input placeholder="First Name" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={control}
      name="lastName"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Last Name</FormLabel>
          <FormControl>
            <Input placeholder="Last Name" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input placeholder="example@mail.com" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </>
);

const LeaveInfoSection = ({ control, watch, setValue }: { control: any, watch: any, setValue: any }) => {
  const startDate = watch("startDate");
  const endDate = watch("endDate");

  const calculateLeaveDays = () => {
    if (startDate && endDate) {
      const diffInMs = endDate.getTime() - startDate.getTime();
      const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
      return diffInDays + 1; // Adding 1 to include both start and end dates
    }
    return 0;
  };

  const leaveDays = calculateLeaveDays();

  // Update the form value when the dates change
  React.useEffect(() => {
    setValue("leaveDays", leaveDays);
  }, [startDate, endDate, leaveDays, setValue]);

  return (
    <>
      <FormField
        control={control}
        name="startDate"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Date de début</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      format(field.value, "yyyy-MM-dd")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={(date) =>
                    date < new Date() || date < new Date("1900-01-01")
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="endDate"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Date de fin</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      format(field.value, "yyyy-MM-dd")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={(date) =>
                    date < new Date() || date < new Date("1900-01-01")
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="reason"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Reason</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Why do you need a leave?"
                className="resize-none"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

const VacationRequest = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { language, t } = useLanguage();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      startDate: new Date(),
      endDate: new Date(),
      reason: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    console.log(values);
    setIsSubmitted(true);
  };

  return (
    <div className="cmc-page-background min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-cmc-blue mb-2">{t("vacationRequestTitle")}</h1>
          <p className="text-cmc-gray-dark">{t("fillFormBelow")}</p>
        </div>

        {isSubmitted ? (
          <Card className="cmc-card border-cmc-green/20 bg-cmc-green-light/50">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="h-16 w-16 rounded-full bg-cmc-green-light flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-cmc-green" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-2 text-cmc-blue">{t("requestSubmitted")}</h2>
                  <p className="text-cmc-gray-dark">
                    {t("requestReviewMessage")}
                    <br />
                    {t("followUpMessage")}
                  </p>
                  <Button 
                    className="cmc-button-primary mt-4" 
                    onClick={() => setIsSubmitted(false)}
                  >
                    {t("newRequest")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="cmc-card">
            <CardHeader className="bg-gradient-to-r from-cmc-blue/10 to-cmc-green/10">
              <CardTitle className="text-cmc-blue">{t("requestInfo")}</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <PersonalInfoSection control={form.control} />
                  <LeaveInfoSection 
                    control={form.control} 
                    watch={form.watch}
                    setValue={form.setValue}
                  />
                  <Button type="submit" className="cmc-button-primary w-full">
                    {t("submitRequest")}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default VacationRequest;
