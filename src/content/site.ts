/**
 * Kulübün genel bilgileri. Instagram sayfasındaki gerçek bilgilerle burayı güncelleyin.
 * Bu dosya değiştiğinde site genelindeki başlıklar, linkler ve istatistikler otomatik güncellenir.
 */
export const site = {
  name: "Nexus",
  fullName: "Nexus Öğrenci Kulübü",
  university: "Karabük Üniversitesi",
  tagline: "Bölümler arası bağ kuran öğrenci topluluğu",
  description:
    "Nexus, Karabük Üniversitesi'nde tüm bölümlerden öğrencileri bir araya getiren, sosyalleşme, kariyer ve sertifikalı eğitim fırsatları sunan öğrenci kulübüdür.",
  url: "https://nexuskarabuk.vercel.app", // Yayına aldıktan sonra gerçek alan adıyla değiştirin
  email: "nexuskarabukuni@gmail.com", // TODO: gerçek e-posta
  foundedYear: 2024, // TODO
  location: "Karabük Üniversitesi Demir Çelik Kampüsü, Karabük",
  socials: {
    instagram: "https://www.instagram.com/nexuskarabukuni",
    linkedin: "", // TODO: varsa ekleyin
    whatsapp: "", // TODO: topluluk daveti linki (isteğe bağlı)
    youtube: "",
  },
  stats: [
    { value: 150, suffix: "+", label: "Aktif üye" },
    { value: 20, suffix: "+", label: "Farklı bölüm" },
    { value: 12, suffix: "", label: "Etkinlik" },
    { value: 3, suffix: "", label: "Sertifika programı" },
  ],
} as const;

export const navLinks = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/etkinlikler", label: "Etkinlikler" },
  { href: "/ekip", label: "Ekip" },
  { href: "/iletisim", label: "İletişim" },
] as const;
