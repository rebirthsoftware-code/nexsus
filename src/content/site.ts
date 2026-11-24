/**
 * Kulübün genel bilgileri. Instagram sayfasındaki gerçek bilgilerle burayı güncelleyin.
 * Bu dosya değiştiğinde site genelindeki başlıklar, linkler ve istatistikler otomatik güncellenir.
 */
export const site = {
  name: "Nexus",
  fullName: "Nexus Öğrenci Kulübü",
  university: "Karabük Üniversitesi",
  tagline: "Kampüsün bağlantı noktası",
  description:
    "Nexus, Karabük Üniversitesi'nde tüm bölümlerden öğrencileri bir araya getiren; sosyalleşme, kariyer ve sertifikalı eğitim fırsatları sunan öğrenci kulübüdür.",
  /** Sitenin yayın adresi. GitHub Pages yayınında otomatik verilir; özel alan adı alınırsa burayı güncelleyin. */
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://rebirthsoftware-code.github.io/nexsus").replace(/\/$/, ""),
  /**
   * true iken sitede "önizleme" şeridi görünür ve arama motorlarına kapalıdır.
   * Ekip, etkinlik ve sayılar gerçek bilgilerle değiştirilince false yapın.
   */
  preview: true,
  email: "", // TODO: kulübün gerçek e-posta adresi (boşken sitede gösterilmez)
  foundedYear: 2024, // TODO
  location: "Karabük Üniversitesi, Demir Çelik Kampüsü",
  instagramHandle: "@nexuskarabukuni",
  socials: {
    instagram: "https://www.instagram.com/nexuskarabukuni",
    linkedin: "", // TODO: varsa ekleyin
    whatsapp: "", // TODO: topluluk daveti linki (isteğe bağlı)
    youtube: "",
  },
  // TODO: gerçek sayılarla güncelleyin
  stats: [
    { value: 150, suffix: "+", label: "aktif üye" },
    { value: 20, suffix: "+", label: "farklı bölüm" },
    { value: 12, suffix: "", label: "etkinlik" },
    { value: 3, suffix: "", label: "sertifika programı" },
  ],
};

export const navLinks = [
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/etkinlikler", label: "Etkinlikler" },
  { href: "/ekip", label: "Ekip" },
  { href: "/iletisim", label: "İletişim" },
] as const;

/** Hero'daki bağlantı haritasında ve şeritlerde görünen bölümler */
export const departments = [
  "Makine",
  "Tıp",
  "Hukuk",
  "İşletme",
  "Psikoloji",
  "Mimarlık",
  "Yazılım",
  "Edebiyat",
  "İktisat",
  "Tasarım",
  "Eğitim",
  "Hemşirelik",
] as const;
