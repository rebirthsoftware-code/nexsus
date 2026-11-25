import type { Accent } from "@/lib/accents";

export const announcementCategories = ["Gezi", "Stant", "Ekip Alımı", "Genel"] as const;
export type AnnouncementCategory = (typeof announcementCategories)[number];

export type Announcement = {
  slug: string;
  title: string;
  category: AnnouncementCategory;
  /** Duyurunun yayın tarihi (ISO). Sıralama buna göre yapılır, en yeni üstte. */
  date: string;
  /** Duyuru metni. Paragrafları ayırmak için boş satır bırakın. */
  body: string;
  /** Serbest metin: ne zaman? Ör. "6 Aralık Cumartesi, 08:30" */
  when?: string;
  /** Serbest metin: nerede? */
  where?: string;
  /**
   * Son başvuru ya da son gün (ISO). Verilirse kartta "5 gün kaldı" sayacı görünür;
   * tarih geçince duyuru kendiliğinden "Geçmiş duyurular"a düşer.
   */
  deadline?: string;
  /** Kartın altındaki düğme (kayıt formu, Instagram gönderisi vb.) */
  link?: { label: string; href: string };
  /** true ise listenin en üstünde, büyük kart olarak görünür */
  pinned?: boolean;
};

export const categoryAccent: Record<AnnouncementCategory, Accent> = {
  Gezi: "lime",
  Stant: "sun",
  "Ekip Alımı": "brand",
  Genel: "lilac",
};

/**
 * Etkinlik takvimine girmeyen her şey burada duyurulur: geziler, stantlar, ekip alımları...
 * Yeni duyuru eklemek için listeye bir kayıt eklemek yeterli.
 * Aşağıdakiler ÖRNEK içeriktir, gerçek duyurularla değiştirin.
 */
export const announcements: Announcement[] = [
  {
    slug: "ekip-alimlari",
    title: "Dönem ekip alımları başladı",
    category: "Ekip Alımı",
    date: "2026-11-23",
    deadline: "2026-12-10",
    pinned: true,
    body: "Etkinlik, sosyal medya ve tasarım, sponsorluk ve kariyer ekiplerine yeni arkadaşlar arıyoruz. Deneyim şart değil; istekli olman ve haftada birkaç saat ayırabilmen yeterli.\n\nBaşvurmak için önce kulübe üye olman gerekiyor. Ardından bize Instagram'dan hangi ekiple ilgilendiğini yaz.",
    link: { label: "Instagram'dan yaz", href: "https://ig.me/m/nexuskarabukuni" },
  },
  {
    slug: "safranbolu-gezisi",
    title: "Safranbolu günübirlik gezisi",
    category: "Gezi",
    date: "2026-11-21",
    when: "6 Aralık Cumartesi, 09:00",
    where: "Buluşma: kampüs ana kapı",
    deadline: "2026-12-03",
    body: "Eski çarşı, konaklar ve bol fotoğraflı bir gün. Kontenjan sınırlı, öncelik kulüp üyelerinde. Katılım ücreti ve ayrıntılar kayıt sırasında paylaşılacak.",
  },
  {
    slug: "tanisma-standi",
    title: "Kampüste Nexus standı",
    category: "Stant",
    date: "2026-11-19",
    when: "1–3 Aralık, 10:00–16:00",
    where: "Merkez kafeterya önü",
    deadline: "2026-12-03",
    body: "Üç gün boyunca stanttayız. Kulübü tanımak, üye olmak ya da sadece selam vermek için uğra. Stantta üye olanlara küçük sürprizlerimiz var.",
  },
  {
    slug: "uye-karti",
    title: "Üye kartları dağıtılıyor",
    category: "Genel",
    date: "2026-11-10",
    deadline: "2026-11-20",
    body: "Üyeliği onaylanan arkadaşlarımız kartlarını kulüp odasından teslim alabilir.",
  },
];

/** Süresi geçmemiş duyurular (sabitlenenler önce, sonra en yeni) ve geçmiş duyurular */
export function splitAnnouncements(today: string) {
  const byDate = (a: Announcement, b: Announcement) => b.date.localeCompare(a.date);
  const active = announcements.filter((a) => !a.deadline || a.deadline >= today).sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned) || byDate(a, b));
  const past = announcements.filter((a) => a.deadline && a.deadline < today).sort(byDate);
  return { active, past };
}
