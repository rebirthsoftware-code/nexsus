import { z } from "zod";

/**
 * "Kulüpte en çok ne ilgini çekiyor?" sorusunun seçenekleri.
 * Bu form kulübe ÜYELİK içindir; ekipte görev almak için ayrı başvuru açılır.
 * `chip`, üye kartı önizlemesinde görünen kısa addır.
 */
export const attractions = [
  { value: "Eğitimler", chip: "Eğitim" },
  { value: "Atölye çalışmaları", chip: "Atölye" },
  { value: "Söyleşiler", chip: "Söyleşi" },
  { value: "Sertifika programları", chip: "Sertifika" },
  { value: "Sosyal etkinlikler", chip: "Sosyal" },
  { value: "Yeni insanlarla tanışmak", chip: "Tanışma" },
  { value: "Üyelere özel avantajlar", chip: "Avantaj" },
] as const;

export const attractionOptions = attractions.map((a) => a.value) as [string, ...string[]];

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
  attractions: z.array(z.enum(attractionOptions)).min(1, "En az birini seç"),
  /** İsteğe bağlı açık uçlu not */
  note: z.string().trim().max(500, "En fazla 500 karakter").optional().or(z.literal("")),
  consent: z.literal(true, { message: "Devam etmek için onay vermelisiniz" }),
  /** Bot koruması: gerçek kullanıcılar bu alanı görmez ve boş bırakır */
  website: z.string().max(0).optional(),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;
