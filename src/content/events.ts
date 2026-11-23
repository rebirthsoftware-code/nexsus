export type EventCategory = "Sertifika" | "Seminer" | "Sosyal" | "Atölye" | "Kariyer";

export type ClubEvent = {
  slug: string;
  title: string;
  category: EventCategory;
  /** ISO tarih, örn. "2025-12-10" */
  date: string;
  time?: string;
  location: string;
  summary: string;
  /** public/events/ altındaki görsel, yoksa kategori rengiyle kart gösterilir */
  image?: string;
  /** Kayıt / detay bağlantısı (Instagram gönderisi, Google Form vb.) */
  link?: string;
  status: "upcoming" | "past";
};

/**
 * Etkinlikleri buraya ekleyin. En yeni etkinlik en üstte olacak şekilde sıralanır.
 * Aşağıdakiler örnek içeriktir.
 */
export const events: ClubEvent[] = [
  {
    slug: "iskur-is-kulubu-egitimi",
    title: "İŞKUR İş Kulübü Eğitimi",
    category: "Sertifika",
    date: "2025-12-10",
    time: "13:30",
    location: "İktisadi ve İdari Bilimler Fakültesi, Konferans Salonu",
    summary:
      "İŞKUR iş ve meslek danışmanları eşliğinde etkili özgeçmiş hazırlama, mülakat teknikleri ve iş arama becerileri. Katılımcılara İŞKUR onaylı sertifika verilir.",
    status: "upcoming",
  },
  {
    slug: "tanisma-bulusmasi",
    title: "Dönem Başı Tanışma Buluşması",
    category: "Sosyal",
    date: "2025-10-08",
    time: "18:00",
    location: "Kampüs Sosyal Tesisleri",
    summary:
      "Farklı bölümlerden yeni ve eski üyelerin bir araya geldiği, oyunlar ve ikramlarla dolu tanışma etkinliği.",
    status: "past",
  },
  {
    slug: "linkedin-kisisel-marka",
    title: "LinkedIn ve Kişisel Marka Atölyesi",
    category: "Atölye",
    date: "2025-11-05",
    time: "14:00",
    location: "Mühendislik Fakültesi, B Blok 201",
    summary:
      "Profil optimizasyonu, içerik üretimi ve sektör profesyonelleriyle doğru iletişim kurma üzerine uygulamalı atölye.",
    status: "past",
  },
  {
    slug: "mezunlarla-kariyer-sohbeti",
    title: "Mezunlarla Kariyer Sohbeti",
    category: "Kariyer",
    date: "2025-11-19",
    time: "15:00",
    location: "Çevrimiçi (Zoom)",
    summary:
      "Farklı sektörlerde çalışan KBÜ mezunları, ilk iş deneyimlerini ve öğrencilere tavsiyelerini paylaştı.",
    status: "past",
  },
];

export const categoryStyles: Record<EventCategory, string> = {
  Sertifika: "from-amber-400/30 to-orange-500/10 text-amber-200 ring-amber-400/30",
  Seminer: "from-sky-400/30 to-blue-500/10 text-sky-200 ring-sky-400/30",
  Sosyal: "from-pink-400/30 to-rose-500/10 text-pink-200 ring-pink-400/30",
  Atölye: "from-emerald-400/30 to-teal-500/10 text-emerald-200 ring-emerald-400/30",
  Kariyer: "from-violet-400/30 to-purple-500/10 text-violet-200 ring-violet-400/30",
};
