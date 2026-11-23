import type { Accent } from "@/lib/accents";

export const eventCategories = ["Sertifika", "Kariyer", "Atölye", "Sosyal", "Seminer"] as const;
export type EventCategory = (typeof eventCategories)[number];

export type ClubEvent = {
  slug: string;
  title: string;
  category: EventCategory;
  /** ISO tarih, örn. "2026-12-09". Tarihi geçen etkinlik otomatik olarak "geçmiş"e düşer. */
  date: string;
  time?: string;
  location: string;
  summary: string;
  /** Kayıt / detay bağlantısı (Instagram gönderisi, Google Form vb.) */
  link?: string;
};

export const categoryAccent: Record<EventCategory, Accent> = {
  Sertifika: "lime",
  Kariyer: "cobalt",
  Atölye: "sun",
  Sosyal: "coral",
  Seminer: "lilac",
};

/**
 * Etkinlikleri buraya ekleyin; sıralama ve yaklaşan/geçmiş ayrımı otomatik yapılır.
 * Aşağıdakiler ÖRNEK içeriktir, gerçek etkinliklerle değiştirin.
 */
export const events: ClubEvent[] = [
  {
    slug: "iskur-is-kulubu-egitimi",
    title: "İŞKUR İş Kulübü Eğitimi",
    category: "Sertifika",
    date: "2026-12-09",
    time: "13:30",
    location: "İİBF Konferans Salonu",
    summary:
      "İş ve meslek danışmanları eşliğinde özgeçmiş hazırlama, mülakat teknikleri ve iş arama becerileri. Eğitimi tamamlayanlara İŞKUR onaylı sertifika verilir.",
  },
  {
    slug: "kis-kahvesi-bulusmasi",
    title: "Finallerden Önce Kahve Buluşması",
    category: "Sosyal",
    date: "2026-12-18",
    time: "17:30",
    location: "Kampüs Sosyal Tesisleri",
    summary: "Kahveni al, hiç tanımadığın bir bölümden biriyle aynı masaya otur. Kural tek: kendi bölümünden biriyle oturmak yok.",
  },
  {
    slug: "mezunlarla-kariyer-sohbeti",
    title: "Mezunlarla Kariyer Sohbeti",
    category: "Kariyer",
    date: "2026-11-18",
    time: "15:00",
    location: "Çevrimiçi",
    summary: "Farklı sektörlerde çalışan KBÜ mezunları ilk iş deneyimlerini ve keşke bilseydim dediklerini anlattı.",
  },
  {
    slug: "linkedin-kisisel-marka",
    title: "LinkedIn ve Kişisel Marka Atölyesi",
    category: "Atölye",
    date: "2026-11-04",
    time: "14:00",
    location: "Mühendislik Fakültesi B-201",
    summary: "Profil düzenleme, içerik üretimi ve sektörden insanlara doğru mesajı yazma üzerine uygulamalı atölye.",
  },
  {
    slug: "tanisma-bulusmasi",
    title: "Dönem Başı Tanışma Buluşması",
    category: "Sosyal",
    date: "2026-10-07",
    time: "18:00",
    location: "Kampüs Sosyal Tesisleri",
    summary: "Yeni ve eski üyelerin bir araya geldiği, oyunlar ve ikramlarla dolu açılış gecesi.",
  },
  {
    slug: "girisimcilik-semineri",
    title: "Öğrenciyken Girişim Kurmak",
    category: "Seminer",
    date: "2026-10-21",
    time: "14:30",
    location: "Rektörlük Konferans Salonu",
    summary: "Fikri olan ama nereden başlayacağını bilmeyenler için: ekip kurma, destek programları ve ilk müşteri.",
  },
];

export function splitEvents(today: string) {
  const upcoming = events.filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  const past = events.filter((e) => e.date < today).sort((a, b) => b.date.localeCompare(a.date));
  return { upcoming, past };
}
