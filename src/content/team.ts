export type TeamMember = {
  name: string;
  role: string;
  department: string;
  /** public/team/ altındaki dosya adı, yoksa baş harfler gösterilir */
  photo?: string;
  instagram?: string;
  linkedin?: string;
  bio?: string;
};

export type TeamGroup = {
  title: string;
  members: TeamMember[];
};

/**
 * Ekip bilgileri. Fotoğrafları public/team/ klasörüne koyup `photo: "isim.jpg"` şeklinde bağlayın.
 * Aşağıdaki isimler örnektir; gerçek yönetim kuruluyla değiştirin.
 */
export const team: TeamGroup[] = [
  {
    title: "Yönetim Kurulu",
    members: [
      {
        name: "Ad Soyad",
        role: "Kulüp Başkanı",
        department: "Bilgisayar Mühendisliği",
        bio: "Kulübün kurucu ekibinden. Bölümler arası iş birliğini büyütmeye odaklanıyor.",
      },
      {
        name: "Ad Soyad",
        role: "Başkan Yardımcısı",
        department: "İşletme",
      },
      {
        name: "Ad Soyad",
        role: "Genel Sekreter",
        department: "Endüstri Mühendisliği",
      },
      {
        name: "Ad Soyad",
        role: "Sayman",
        department: "İktisat",
      },
    ],
  },
  {
    title: "Koordinatörler",
    members: [
      {
        name: "Ad Soyad",
        role: "Etkinlik Koordinatörü",
        department: "Psikoloji",
      },
      {
        name: "Ad Soyad",
        role: "Sosyal Medya & Tasarım",
        department: "Grafik Tasarım",
      },
      {
        name: "Ad Soyad",
        role: "Kariyer & Sertifika Programları",
        department: "Makine Mühendisliği",
      },
      {
        name: "Ad Soyad",
        role: "Sponsorluk & İletişim",
        department: "Halkla İlişkiler",
      },
    ],
  },
];
