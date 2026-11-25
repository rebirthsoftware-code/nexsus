import type { Accent } from "@/lib/accents";

export type TeamMember = {
  name: string;
  role: string;
  /** Bölüm. Bilinmiyorsa boş bırakılır ve kartta gösterilmez. */
  department?: string;
  /** Kartın üst bandının rengi */
  accent: Accent;
  /**
   * public/team/ altındaki kısa, sessiz, döngülü klip (ör. "ayse.mp4"). Kartta GIF gibi oynar.
   * Hazırlama komutu README'de. Klip varsa `photo` kapak karesi olarak kullanılır.
   */
  clip?: string;
  /** public/team/ altındaki fotoğraf (ör. "ayse.jpg"). Klip de fotoğraf da yoksa baş harfler gösterilir. */
  photo?: string;
  instagram?: string;
  linkedin?: string;
  /** Kısa, kişisel bir cümle */
  quote?: string;
};

export type TeamGroup = {
  title: string;
  note: string;
  members: TeamMember[];
};

/** Yönetim kurulu üyesinin panelden GELMEYEN bilgileri: bölüm, fotoğraf, klip, söz, sosyal hesaplar */
export type MemberDetails = Partial<Pick<TeamMember, "department" | "clip" | "photo" | "instagram" | "linkedin" | "quote">>;

/**
 * Yönetim kurulu (başkan ve iki başkan yardımcısı).
 *
 * Adlar ve görevler YÖNETİM PANELİNDEN gelir: yazılımcı paneldeki "Ekip" bölümünde birini ekleyince
 * ya da değiştirince site de güncellenir. Buraya ad yazmak gerekmez.
 *
 * Bir üyeye bölüm, fotoğraf, klip ya da söz eklemek için `details` içine adını yazın
 * (paneldeki ad soyadla aynı olmalı; büyük küçük harf fark etmez):
 *
 *   details: {
 *     "Ayşe Yılmaz": { department: "İşletme", photo: "ayse.jpg", quote: "En iyi fikirler koridorda doğar." },
 *   }
 *
 * Fotoğraf ve klipler public/team/ klasörüne konur. Hiçbiri yoksa kartta baş harfler görünür.
 */
export const management: { title: string; note: string; details: Record<string, MemberDetails>; fallback: TeamMember[] } = {
  title: "Yönetim Kurulu",
  note: "Kulübün yönünü belirleyen çekirdek ekip.",
  details: {},
  /**
   * Veritabanı bağlı değilken (ör. GitHub Pages kopyası) ya da panelde henüz kimse yokken gösterilen
   * ÖRNEK kartlar. "ornek.mp4" kulübün gönderdiği şablon videodur, yalnızca görünümü gösterir.
   */
  fallback: [
    { name: "Ad Soyad", role: "Kulüp Başkanı", department: "Bilgisayar Mühendisliği", accent: "brand", clip: "ornek.mp4", photo: "ornek.jpg", quote: "Herkesi tek masaya sığdırmak mümkün." },
    { name: "Ad Soyad", role: "Başkan Yardımcısı", department: "İşletme", accent: "coral", clip: "ornek.mp4", photo: "ornek.jpg", quote: "En iyi fikirler koridorda doğar." },
    { name: "Ad Soyad", role: "Başkan Yardımcısı", department: "Endüstri Mühendisliği", accent: "lime", clip: "ornek.mp4", photo: "ornek.jpg", quote: "Planı olan topluluk büyür." },
  ],
};

/**
 * Ekibin geri kalanı. Klipleri ve fotoğrafları public/team/ klasörüne koyup `clip` / `photo` ile bağlayın.
 * Aşağıdaki isimler ÖRNEKTİR; gerçek koordinatörlerle değiştirin.
 */
export const team: TeamGroup[] = [
  {
    title: "Koordinatörler",
    note: "Etkinlikleri, içerikleri ve iş birliklerini yürütenler.",
    members: [
      { name: "Ad Soyad", role: "Etkinlik Koordinatörü", department: "Psikoloji", accent: "lilac" },
      { name: "Ad Soyad", role: "Sosyal Medya ve Tasarım", department: "Grafik Tasarım", accent: "coral" },
      { name: "Ad Soyad", role: "Kariyer ve Sertifika", department: "Makine Mühendisliği", accent: "brand" },
      { name: "Ad Soyad", role: "Sponsorluk ve İletişim", department: "Halkla İlişkiler", accent: "lime" },
    ],
  },
];
