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
    "Nexus, Karabük Üniversitesi'nde tüm bölümlerden öğrencileri bir araya getiren öğrenci kulübü. Projeler, eğitimler ve etkinliklerle kişisel ve mesleki gelişim, disiplinler arası etkileşim.",
  /** Sitenin yayın adresi. Vercel ve GitHub Pages yayınında otomatik verilir; özel alan adı için NEXT_PUBLIC_SITE_URL tanımlayın. */
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
  /**
   * true iken sitede "önizleme" şeridi görünür ve arama motorlarına kapalıdır.
   * Ekip, etkinlik ve sayılar gerçek bilgilerle değiştirilince false yapın.
   */
  preview: true,
  email: "", // TODO: kulübün gerçek e-posta adresi (boşken sitede gösterilmez)
  foundedYear: 2024, // TODO
  location: "Karabük Üniversitesi, Demir Çelik Kampüsü",
  /** Yazılım imzası: siteyi tasarlayıp geliştiren. Alt bilgide ve yönetim panelinde görünür. */
  developer: {
    name: "Rebirth Software",
    url: "https://github.com/rebirthsoftware-code",
  },
  instagramHandle: "@nexuskarabukuni",
  /** Kulübün resmi hesapları (kaynak: linktr.ee/nexuskbu). Boş bırakılan hesap sitede gösterilmez. */
  socials: {
    instagram: "https://instagram.com/nexuskarabukuni",
    tiktok: "https://tiktok.com/@nexuskarabukuni",
    youtube: "https://www.youtube.com/@NEXUS.TURKIYE",
    linktree: "https://linktr.ee/nexuskbu",
    linkedin: "",
    whatsapp: "",
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
  { href: "/duyurular", label: "Duyurular" },
  { href: "/etkinlikler", label: "Etkinlikler" },
  { href: "/sizden-kalanlar", label: "Sizden Kalanlar" },
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

/** Sosyal medya hesapları: alt bilgi, iletişim sayfası ve ana sayfadaki kutular bu listeden üretilir. */
export const socialAccounts = [
  { key: "instagram", name: "Instagram", handle: "@nexuskarabukuni", href: site.socials.instagram, note: "Duyurular ve en hızlı cevap" },
  { key: "tiktok", name: "TikTok", handle: "@nexuskarabukuni", href: site.socials.tiktok, note: "Kısa videolar" },
  { key: "youtube", name: "YouTube", handle: "@NEXUS.TURKIYE", href: site.socials.youtube, note: "Videolar ve yayınlar" },
].filter((a) => a.href) as Array<{ key: "instagram" | "tiktok" | "youtube"; name: string; handle: string; href: string; note: string }>;
