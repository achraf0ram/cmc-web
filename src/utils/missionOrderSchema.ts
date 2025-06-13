
import { z } from "zod";

export const createMissionOrderSchema = (language: string) => {
  return z.object({
    monsieurMadame: z.string().min(3, { message: language === 'ar' ? "يرجى إدخال اسم السيد/السيدة" : "Veuillez entrer le nom complet" }),
    matricule: z.string().min(1, { message: language === 'ar' ? "يرجى إدخال رقم التسجيل" : "Veuillez entrer le numéro de matricule" }),
    destination: z.string().min(3, {
      message: language === 'ar' ? "يرجى ذكر وجهة المهمة" : "Veuillez spécifier la destination de la mission",
    }),
    purpose: z.string().min(5, {
      message: language === 'ar' ? "يرجى وصف الغرض من المهمة" : "Veuillez décrire l'objet de la mission",
    }),
    startDate: z.date({
      required_error: language === 'ar' ? "يرجى تحديد تاريخ البداية" : "Veuillez sélectionner la date de début",
    }),
    endDate: z.date({
      required_error: language === 'ar' ? "يرجى تحديد تاريخ النهاية" : "Veuillez sélectionner la date de fin",
    }),
    conducteur: z.string().optional(),
    conducteurMatricule: z.string().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    additionalInfo: z.string().optional(),
  });
};

export type MissionOrderFormData = z.infer<ReturnType<typeof createMissionOrderSchema>>;
