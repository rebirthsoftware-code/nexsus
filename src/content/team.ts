import type { Accent } from "@/lib/accents";

export type TeamMember = {
  name: string;
  role: string;
  department: string;
  /** Kartın üst bandının rengi */
  accent: Accent;
  /** public/team/ altındaki dosya adı, yoksa baş harfler gösterilir */
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

/**
 * Ekip bilgileri. Fotoğrafları public/team/ klasörüne koyup `photo: "isim.jpg"` şeklinde bağlayın.
 * Aşağıdaki isimler ÖRNEKTİR; gerçek yönetim kuruluyla değiştirin.
 */
export const team: TeamGroup[] = [
  {
    title: "Yönetim Kurulu",
    note: "Kulübün yönünü belirleyen çekirdek ekip.",
    members: [
      { name: "Ad Soyad", role: "Kulüp Başkanı", department: "Bilgisayar Mühendisliği", accent: "brand", quote: "Herkesi tek masaya sığdırmak mümkün." },
      { name: "Ad Soyad", role: "Başkan Yardımcısı", department: "İşletme", accent: "coral", quote: "En iyi fikirler koridorda doğar." },
      { name: "Ad Soyad", role: "Genel Sekreter", department: "Endüstri Mühendisliği", accent: "lime", quote: "Planı olan topluluk büyür." },
      { name: "Ad Soyad", role: "Sayman", department: "İktisat", accent: "sun", quote: "Her kuruş bir etkinliğe dönüşür." },
    ],
  },
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
