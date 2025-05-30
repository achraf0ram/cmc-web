
import { z } from "zod";

export const formSchema = z.object({
  fullName: z.string().min(3, { message: "يرجى إدخال الاسم الكامل" }),
  matricule: z.string().min(1, { message: "يرجى إدخال الرقم المالي" }),
  echelle: z.string().optional(),
  echelon: z.string().optional(),
  grade: z.string().optional(),
  fonction: z.string().optional(),
  arabicFonction: z.string().optional(),
  direction: z.string().optional(),
  arabicDirection: z.string().optional(),
  address: z.string().optional(),
  arabicAddress: z.string().optional(),
  phone: z.string().optional(),
  leaveType: z.string().min(1, { message: "يرجى اختيار نوع الإجازة" }),
  customLeaveType: z.string().optional(),
  arabicCustomLeaveType: z.string().optional(),
  duration: z.string().min(1, { message: "يرجى تحديد المدة" }),
  arabicDuration: z.string().optional(),
  startDate: z.date({ required_error: "يرجى تحديد تاريخ البداية" }),
  endDate: z.date({ required_error: "يرجى تحديد تاريخ النهاية" }),
  with: z.string().optional(),
  arabicWith: z.string().optional(),
  interim: z.string().optional(),
  arabicInterim: z.string().optional(),
  leaveMorocco: z.boolean().optional(),
  signature: z.union([z.instanceof(File), z.string()]).optional(),
});

export type FormData = z.infer<typeof formSchema>;
