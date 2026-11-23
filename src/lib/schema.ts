import { z } from "zod";

export const interestOptions = [
  "Kariyer & Sertifika Programları",
  "Etkinlik Organizasyonu",
  "Sosyal Medya & Tasarım",
  "Sponsorluk & İletişim",
  "Teknoloji & Yazılım",
  "Sosyal Sorumluluk",
] as const;

export const classYears = ["Hazırlık", "1. Sınıf", "2. Sınıf", "3. Sınıf", "4. Sınıf", "Yüksek Lisans / Doktora"] as const;

export const applicationSchema = z.object({
  fullName: z.string().trim().min(3, "Ad soyad en az 3 karakter olmalı").max(80),
  email: z.string().trim().email("Geçerli bir e-posta adresi girin"),
  phone: z
    .string()
    .trim()
    .regex(/^(\+90|0)?\s?5\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/, "Geçerli bir cep telefonu girin (05xx xxx xx xx)"),
  department: z.string().trim().min(2, "Bölümünüzü yazın").max(80),
  classYear: z.enum(classYears, { message: "Sınıfınızı seçin" }),
  studentNo: z
    .string()
    .trim()
    .max(20)
    .optional()
    .or(z.literal("")),
  interests: z.array(z.enum(interestOptions)).min(1, "En az bir ilgi alanı seçin"),
  motivation: z.string().trim().min(20, "Biraz daha detay verir misin? (en az 20 karakter)").max(1000),
  consent: z.literal(true, { message: "Devam etmek için onay vermelisiniz" }),
  /** Bot koruması: gerçek kullanıcılar bu alanı görmez ve boş bırakır */
  website: z.string().max(0).optional(),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;
